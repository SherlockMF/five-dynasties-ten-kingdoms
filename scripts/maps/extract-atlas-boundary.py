"""Extract calibrated polity polygons from local historical-atlas scans.

The scan directory is supplied at runtime and is never persisted. Calibration,
thresholds, and polity seeds live in a portable JSON file committed with the
GIS editing source.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image
from scipy import ndimage
from osgeo import gdal, ogr, osr


def affine_from_control_points(points: list[dict[str, list[float]]]) -> tuple[np.ndarray, float]:
    pixels = np.asarray([[*point["pixel"], 1.0] for point in points], dtype=float)
    coordinates = np.asarray([point["coordinate"] for point in points], dtype=float)
    coefficients, _, _, _ = np.linalg.lstsq(pixels, coordinates, rcond=None)
    residuals = pixels @ coefficients - coordinates
    residual = float(np.sqrt(np.mean(np.square(residuals))))
    return coefficients, residual


def coordinate_to_pixel(coefficients: np.ndarray, coordinate: list[float]) -> tuple[int, int]:
    inverse = np.linalg.inv(coefficients[:2, :].T)
    pixel = inverse @ (np.asarray(coordinate, dtype=float) - coefficients[2, :])
    return int(round(pixel[0])), int(round(pixel[1]))


def magenta_barrier(image: np.ndarray, threshold: dict[str, float]) -> np.ndarray:
    red = image[:, :, 0].astype(float)
    green = image[:, :, 1].astype(float)
    blue = image[:, :, 2].astype(float)
    mask = (
        (red >= threshold["redMin"])
        & (blue >= threshold["blueMin"])
        & (green <= red * threshold["greenRedRatio"])
        & (green <= blue * threshold["greenBlueRatio"])
    )
    mask = ndimage.binary_closing(
        mask,
        iterations=int(threshold.get("closingIterations", 2)),
    )
    return ndimage.binary_dilation(
        mask,
        iterations=int(threshold.get("dilationIterations", 3)),
    )


def sea_barrier(image: np.ndarray, threshold: dict[str, float]) -> np.ndarray:
    """Return broad, edge-connected cyan water without treating rivers as coast."""

    red = image[:, :, 0].astype(float)
    green = image[:, :, 1].astype(float)
    blue = image[:, :, 2].astype(float)
    water = (
        (blue >= threshold.get("waterMinBlue", 135))
        & (green >= threshold.get("waterMinGreen", 115))
        & (blue >= red * threshold.get("waterBlueRedRatio", 1.12))
        & (green >= red * threshold.get("waterGreenRedRatio", 1.03))
    )
    broad_water = ndimage.binary_opening(
        water,
        iterations=int(threshold.get("waterOpeningIterations", 3)),
    )
    labels, label_count = ndimage.label(broad_water)
    if label_count == 0:
        return np.zeros_like(water)
    component_sizes = np.bincount(labels.ravel())
    component_sizes[0] = 0
    sea = labels == int(component_sizes.argmax())
    return ndimage.binary_dilation(
        sea,
        iterations=int(threshold.get("waterDilationIterations", 2)),
    )


def seeded_component(barrier: np.ndarray, seed: tuple[int, int]) -> np.ndarray:
    labels, _ = ndimage.label(~barrier)
    x, y = seed
    if not (0 <= y < labels.shape[0] and 0 <= x < labels.shape[1]):
        raise ValueError(f"Seed pixel is outside the source image: {seed}")
    label_id = int(labels[y, x])
    if label_id == 0:
        raise ValueError(f"Seed pixel falls on extracted boundary ink: {seed}")
    component = labels == label_id
    coverage = float(component.mean())
    if coverage <= 0.0005 or coverage >= 0.65:
        raise ValueError(f"Seeded component coverage is implausible: {coverage:.4f}")
    return component


def seeded_fill_component(
    image: np.ndarray,
    barrier: np.ndarray,
    seed: tuple[int, int],
    threshold: dict[str, float],
) -> np.ndarray:
    """Extract the pale-green focus wash while retaining the magenta frontier."""

    red = image[:, :, 0].astype(float)
    green = image[:, :, 1].astype(float)
    blue = image[:, :, 2].astype(float)
    passable = (
        (red >= threshold["redMin"])
        & (green >= threshold["greenMin"])
        & (green >= red * threshold["greenRedRatio"])
        & (green >= blue * threshold["greenBlueRatio"])
    )
    passable = ndimage.binary_closing(
        passable,
        iterations=int(threshold.get("closingIterations", 4)),
    )
    labels, _ = ndimage.label(passable & ~barrier)
    x, y = seed
    label_id = int(labels[y, x])
    if label_id == 0:
        raise ValueError(f"Seed pixel falls outside the focus wash: {seed}")
    component = labels == label_id
    coverage = float(component.mean())
    if coverage <= 0.002 or coverage >= 0.45:
        raise ValueError(f"Seeded focus-wash coverage is implausible: {coverage:.4f}")
    return component


def polygonize_mask(mask: np.ndarray, coefficients: np.ndarray) -> ogr.Geometry:
    height, width = mask.shape
    raster = gdal.GetDriverByName("MEM").Create("", width, height, 1, gdal.GDT_Byte)
    raster.SetGeoTransform(
        (
            float(coefficients[2, 0]),
            float(coefficients[0, 0]),
            float(coefficients[1, 0]),
            float(coefficients[2, 1]),
            float(coefficients[0, 1]),
            float(coefficients[1, 1]),
        )
    )
    spatial_reference = osr.SpatialReference()
    spatial_reference.ImportFromEPSG(4326)
    raster.SetProjection(spatial_reference.ExportToWkt())
    band = raster.GetRasterBand(1)
    band.WriteArray(mask.astype(np.uint8))

    vector = ogr.GetDriverByName("Memory").CreateDataSource("")
    layer = vector.CreateLayer("mask", spatial_reference, ogr.wkbPolygon)
    layer.CreateField(ogr.FieldDefn("value", ogr.OFTInteger))
    gdal.Polygonize(band, None, layer, 0, [], callback=None)

    polygons: list[ogr.Geometry] = []
    for feature in layer:
        if feature.GetField("value") != 1:
            continue
        geometry = feature.GetGeometryRef()
        if geometry is not None:
            polygons.append(geometry.Clone())
    if not polygons:
        raise ValueError("Polygonization produced no foreground geometry")
    polygons.sort(key=lambda geometry: geometry.GetArea(), reverse=True)
    return polygons[0]


def feature_geometry(feature: dict[str, Any]) -> ogr.Geometry:
    geometry = ogr.CreateGeometryFromJson(json.dumps(feature["geometry"]))
    if geometry is None:
        raise ValueError(f"Invalid GeoJSON geometry for {feature['properties']['id']}")
    return geometry


def largest_polygon(geometry: ogr.Geometry) -> ogr.Geometry:
    if geometry.GetGeometryType() in (ogr.wkbPolygon, ogr.wkbPolygon25D):
        return geometry
    polygons = [
        geometry.GetGeometryRef(index).Clone()
        for index in range(geometry.GetGeometryCount())
        if geometry.GetGeometryRef(index).GetGeometryType()
        in (ogr.wkbPolygon, ogr.wkbPolygon25D)
    ]
    if not polygons:
        raise ValueError("Geometry difference produced no polygon")
    return max(polygons, key=lambda polygon: polygon.GetArea())


def resolve_extracted_overlaps(
    features: list[dict[str, Any]],
    resolutions: list[dict[str, Any]],
) -> None:
    by_dynasty = {
        feature["properties"]["dynastyId"]: feature for feature in features
    }
    for resolution in resolutions:
        dominant = by_dynasty[resolution["dominantDynastyId"]]
        clipped = by_dynasty[resolution["clippedDynastyId"]]
        dominant_geometry = feature_geometry(dominant).Buffer(
            float(resolution.get("clearanceDegrees", 0.0))
        )
        geometry = feature_geometry(clipped).Difference(dominant_geometry)
        clipped["geometry"] = json.loads(largest_polygon(geometry).ExportToJson())
        clipped["properties"]["disputedNote"] += f" {resolution['reason']}"


def extract_feature(
    source_root: Path,
    source: dict[str, Any],
    polity: dict[str, Any],
    debug_dir: Path | None = None,
) -> dict[str, Any]:
    image_path = source_root / source["fileLabel"]
    image = np.asarray(Image.open(image_path).convert("RGB"))
    coefficients, residual = affine_from_control_points(source["controlPoints"])
    seed = coordinate_to_pixel(coefficients, polity["seedCoordinate"])
    barrier = magenta_barrier(image, source["threshold"]) | sea_barrier(
        image,
        source["threshold"],
    )
    try:
        if source.get("componentMode") == "focus-wash":
            component = seeded_fill_component(
                image,
                barrier,
                seed,
                source["focusWashThreshold"],
            )
        else:
            component = seeded_component(barrier, seed)
    except ValueError as error:
        raise ValueError(
            f"{source['sourceId']} / {polity['dynastyId']}: {error}"
        ) from error
    if debug_dir is not None:
        debug_dir.mkdir(parents=True, exist_ok=True)
        preview = image.copy()
        preview[~component] = (preview[~component] * 0.25 + 190).astype(np.uint8)
        Image.fromarray(preview).save(debug_dir / f"{polity['dynastyId']}.png")
    geometry = polygonize_mask(component, coefficients)
    simplified = geometry.SimplifyPreserveTopology(float(polity["simplifyToleranceDegrees"]))
    if simplified is None or simplified.IsEmpty() or not simplified.IsValid():
        raise ValueError(f"Invalid geometry for {polity['dynastyId']}")

    return {
        "type": "Feature",
        "geometry": json.loads(simplified.ExportToJson()),
        "properties": {
            "id": polity["id"],
            "dynastyId": polity["dynastyId"],
            "name": polity["name"],
            "validFromYear": 954,
            "validToYearExclusive": 955,
            "boundaryKind": "controlled",
            "accuracyLevel": "reconstructed",
            "verificationStatus": "reviewed",
            "sourceRefs": [source["sourceId"]],
            "disputedNote": polity["disputedNote"],
            "labelLongitude": polity["labelCoordinate"][0],
            "labelLatitude": polity["labelCoordinate"][1],
            "calibrationSourceId": source["sourceId"],
            "calibrationResidualDegrees": round(residual, 6),
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--calibration", required=True, type=Path)
    parser.add_argument("--source-root", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--debug-dir", type=Path)
    parser.add_argument("--publication-template", type=Path)
    parser.add_argument("--publication-output", type=Path)
    args = parser.parse_args()
    if bool(args.publication_template) != bool(args.publication_output):
        parser.error(
            "--publication-template and --publication-output must be supplied together"
        )

    calibration = json.loads(args.calibration.read_text(encoding="utf-8"))
    features = [
        extract_feature(args.source_root, source, polity, args.debug_dir)
        for source in calibration["sources"]
        for polity in source["polities"]
    ]
    resolve_extracted_overlaps(features, calibration.get("overlapResolutions", []))
    output = {
        "type": "FeatureCollection",
        "name": "realms-source-954",
        "features": features,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(output, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    if args.publication_template is not None and args.publication_output is not None:
        publication = json.loads(
            args.publication_template.read_text(encoding="utf-8")
        )
        extracted_by_dynasty = {
            feature["properties"]["dynastyId"]: feature for feature in features
        }
        reconstructed = [feature_geometry(feature) for feature in features]
        reconstructed_union = reconstructed[0]
        for geometry in reconstructed[1:]:
            reconstructed_union = reconstructed_union.Union(geometry)
        publication_clearance = reconstructed_union.Buffer(
            float(calibration.get("publicationClearanceDegrees", 0.0))
        )
        publication["features"] = [
            extracted_by_dynasty.get(feature["properties"]["dynastyId"], feature)
            for feature in publication["features"]
        ]
        for feature in publication["features"]:
            if feature["properties"]["dynastyId"] in extracted_by_dynasty:
                continue
            geometry = feature_geometry(feature).Difference(publication_clearance)
            feature["geometry"] = json.loads(largest_polygon(geometry).ExportToJson())
        args.publication_output.write_text(
            json.dumps(publication, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )


if __name__ == "__main__":
    main()
