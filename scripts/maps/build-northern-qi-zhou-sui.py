"""Rebuild V1 derived maps (Python + Shapely 2.x, authoring only).

No download, province boundaries, annual interpolation or runtime dependency.
Inputs and derived geometry are CC BY-SA 4.0; see the adjacent map README.
"""
import json
import re
from pathlib import Path
from itertools import combinations

from shapely.geometry import LineString, Polygon, box, mapping, shape
from shapely.geometry.polygon import orient
from shapely.ops import split, transform, unary_union

ROOT = Path(__file__).resolve().parents[2]
DIRECTORY = ROOT / "data/maps/northern-qi-zhou-sui"
SOURCE = json.loads((DIRECTORY / "source-traces.json").read_text(encoding="utf-8"))


def flatten(path):
    """Sample the original M/m L/l C/c Z/z paths, including implicit commands."""
    tokens = re.findall(r"[MmLlCcZz]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?", path)
    points, ends = [], []
    current = (0, 0)
    index = 0
    command = None
    while index < len(tokens):
        if tokens[index].isalpha():
            command = tokens[index]
            index += 1
        if command.upper() == "Z":
            points.append(points[0])
            break
        count = 6 if command.upper() == "C" else 2
        values = list(map(float, tokens[index:index + count]))
        index += count
        pairs = list(zip(values[::2], values[1::2]))
        if command.islower():
            pairs = [(x + current[0], y + current[1]) for x, y in pairs]
        if command.upper() == "C":
            start, (a, b, end) = current, pairs
            for step in range(1, 9):
                t = step / 8
                points.append(tuple((1-t)**3 * start[k] + 3*(1-t)**2*t*a[k] + 3*(1-t)*t*t*b[k] + t**3*end[k] for k in (0, 1)))
        else:
            points.append(pairs[0])
        current = pairs[-1]
        ends.append(len(points) - 1)
        if command.upper() == "M":
            command = "l" if command.islower() else "L"
    return points, ends


def pixel(lon, lat):
    return ((lon - 99.5) / 26.2 * 2000, (42.5 - lat) / 24.5 * 2187)


def parts(geometry):
    return [geometry] if geometry.geom_type == "Polygon" else list(geometry.geoms)


# Fixed comparison window. Offshore islands and the disconnected Liaodong
# peninsula are excluded, rather than silently assigned to a Chinese polity.
west, north = pixel(106, 40)
east, south = pixel(123, 26)
land = max(parts(shape(SOURCE["mainland"]).intersection(box(west, north, east, south))), key=lambda p: p.area)

# Source graphic path 3093: shared Wei boundary then the eastern Liang contact.
wei, ends = flatten(SOURCE["paths"]["546"]["path3093"])
western_contact, _ = flatten(SOURCE["paths"]["546"]["path3939"])
junction = min(range(len(wei)), key=lambda i: (wei[i][0]-970.42437)**2 + (wei[i][1]-793.28399)**2)
front550 = list(reversed(western_contact)) + wei[junction + 1:] + [(2200, wei[-1][1])]
halves550 = list(split(land, LineString(front550)).geoms)
north550 = min(halves550, key=lambda g: g.centroid.y)
liang550 = unary_union([g for g in halves550 if g != north550])
wei_split = [(wei[0][0], 0)] + wei[:junction+1] + [(wei[junction][0], 1000)]
north_halves = list(split(north550, LineString(wei_split)).geoms)
western_wei = min(north_halves, key=lambda g: g.centroid.x)
northern_qi = unary_union([g for g in north_halves if g != western_wei])

# M2's western Chen contact, joined to its Later Liang enclosure.
chen_west, _ = flatten(SOURCE["paths"]["572"]["path3865"])
liang_ring, _ = flatten(SOURCE["paths"]["572"]["path3869"])
later_liang = Polygon(liang_ring)

# Hand-sampled geographic reference lines from G1/M2, in the 1100px preview
# coordinate system. They express broad contact belts, not riverbank surveys.
# 577: Chen's Huainan acquisitions (Chen shu 5, Taijian 5/9).
# 581: Huainan lost in 579 (same source, Taijian 11).
huai = [(545, 570), (563, 524), (585, 497), (610, 489), (635, 496), (665, 491), (690, 475), (727, 481), (760, 464), (795, 445), (826, 451), (844, 472), (880, 473), (980, 473)]
yangtze = [(612, 591), (625, 603), (650, 625), (678, 627), (705, 603), (729, 581), (753, 559), (783, 539), (788, 516), (814, 506), (837, 514), (863, 544), (896, 544), (940, 559), (1000, 559)]


def north_south(reference):
    # Join through the south edge of the small Liang polity. Liang is then
    # removed from the northern region and drawn separately in both stages.
    liang_south = [liang_ring[0]]
    if reference == huai:
        bridge = [(1002, 1110)]
    else:
        bridge = [(1106.165, 1108.2772), (1111.4429, 1061.6927)]
    frontier = list(reversed(chen_west)) + liang_south + bridge + [(x / .55, y / .55) for x, y in reference]
    divided = list(split(land, LineString(frontier)).geoms)
    southern = max(divided, key=lambda g: g.centroid.y)
    northern = unary_union([g for g in divided if g != southern])
    return northern.difference(later_liang), southern.difference(later_liang)


def geo(geometry):
    assert geometry.is_valid and not geometry.is_empty, geometry.wkt[:100]
    geometry = transform(lambda x, y: (round(99.5 + x/2000*26.2, 5), round(42.5-y/2187*24.5, 5)), geometry)
    polygons = [orient(p, sign=1) for p in parts(geometry) if p.area > 0.00001]
    from shapely.geometry import MultiPolygon
    result = polygons[0] if len(polygons) == 1 else MultiPolygon(polygons)
    assert result.is_valid
    return mapping(result)


zhou577, chen577 = north_south(huai)
sui581, chen581 = north_south(yangtze)
stages = {
    "550": {"northern-qi": northern_qi, "western-wei": western_wei, "southern-liang": liang550},
    "577": {"northern-zhou": zhou577, "chen": chen577, "western-liang": later_liang},
    "581": {"sui": sui581, "chen": chen581, "western-liang": later_liang},
    "589": {"sui": land},
}
output = {year: {polity: geo(geometry) for polity, geometry in regions.items()} for year, regions in stages.items()}
for year, regions in stages.items():
    for first, second in combinations(regions.values(), 2):
        assert first.intersection(second).area < 1e-6, f"Overlapping regions: {year}"
    assert land.symmetric_difference(unary_union(list(regions.values()))).area < 1e-6, f"Coverage gap: {year}"
(DIRECTORY / "geometry.json").write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
print("Built", {year: list(regions) for year, regions in output.items()})
