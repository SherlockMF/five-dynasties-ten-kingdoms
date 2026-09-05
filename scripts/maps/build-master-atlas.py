"""Digitize the approved fixed overview from a shared, locally referenced line net.

Only manually generalized vector coordinates and graticule controls are read.
No scanned image is read, copied or published by this generator.
"""
import json
from pathlib import Path

import numpy as np
from pyproj import Transformer
from shapely.geometry import LineString, Point, Polygon, shape, mapping, box
from shapely.ops import polygonize, unary_union, transform
from shapely import make_valid, segmentize

ROOT = Path(__file__).resolve().parents[2]
GIS = ROOT / 'gis/continuous'
CRS = '+proj=aea +lat_1=25 +lat_2=47 +lat_0=0 +lon_0=110 +datum=WGS84 +units=m'


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')


def polygons(g):
    if g.geom_type == 'Polygon':
        return [g]
    return [p for child in getattr(g, 'geoms', []) for p in polygons(child)]


def poly(g):
    return unary_union(polygons(make_valid(g)))


def historical_water(properties):
    # Zaysan is a natural lake enlarged by a dam, not a wholly artificial lake.
    return properties.get('featurecla') != 'Reservoir' or properties.get('name') == 'Lake Zaysan'


def build_master():
    source = read(GIS / 'master-943.json')
    controls = np.array(source['gridControls'])
    to_meters = Transformer.from_crs(4326, CRS, always_xy=True)
    to_geo = Transformer.from_crs(CRS, 4326, always_xy=True)
    # Fit the printed graticule in a metric map projection, not longitude/latitude
    # as if the curved printed grid were rectangular.
    def terms(x, y):
        x, y = (np.asarray(x)-1450)/1000, (np.asarray(y)-1000)/1000
        return np.array([np.ones_like(x), x, y, x*x, x*y, y*y]).T
    target = np.array(to_meters.transform(controls[:,2], controls[:,3])).T
    matrix = terms(controls[:,0], controls[:,1])
    coefficients = np.linalg.lstsq(matrix, target, rcond=None)[0]
    errors = np.linalg.norm(matrix @ coefficients-target, axis=1)/1000
    def locate(x, y, z=None):
        projected = terms(x, y) @ coefficients
        return to_geo.transform(projected[...,0], projected[...,1])

    lines = unary_union([LineString(points) for points in source['edges'].values()])
    faces = list(polygonize(lines))
    tagged = []
    for face in faces:
        owners = [r for r in source['regions'] if face.contains(Point(r['seed']))]
        if len(owners) != 1:
            raise ValueError(f'Face {face.bounds} has {len(owners)} names: {[r["id"] for r in owners]}')
        tagged.append((owners[0]['id'], transform(locate, segmentize(face, 10))))
    if {id for id, _ in tagged} != {r['id'] for r in source['regions']}:
        raise ValueError('Every master region must resolve to exactly one closed face')

    # Extend the natural mask to the full approved overview. Original downloaded
    # public-domain source files remain local; only clipped vector masks publish.
    extent = box(65, 14, 145, 62)
    masks = {}
    for kind in ['land', 'lakes']:
        source_path = GIS / f'{kind}-source.geojson'
        features = read(source_path)['features']
        if kind == 'lakes':
            excluded_water = [f['properties'] for f in features if not historical_water(f['properties']) and shape(f['geometry']).intersects(extent)]
            features = [f for f in features if historical_water(f['properties'])]
            write(GIS/'water-review.json', {'excludedReservoirs':excluded_water,
                'exception':'Lake Zaysan 原为天然湖泊，1960年后受筑坝扩张；保留天然湖泊身份，当前岸线不代表十世纪水位。',
                'source':'https://oq.gov.kz/en/abai/zaysan-koli'})
            write(ROOT/'public/maps/continuous/natural-water.geojson', {'type':'FeatureCollection','features':[
                {'type':'Feature','geometry':mapping(poly(shape(f['geometry']).intersection(extent))),
                 'properties':{'name':f['properties'].get('name'),'featurecla':f['properties'].get('featurecla')}}
                for f in features if shape(f['geometry']).intersects(extent)
            ]})
        pieces = [shape(f['geometry']) for f in features]
        masks[kind] = poly(unary_union([g.intersection(extent) for g in pieces if g.intersects(extent)]))
        write(GIS / f'master-{kind}-mask.geojson', {'type':'FeatureCollection','features':[
            {'type':'Feature','geometry':mapping(masks[kind]),'properties':{'source':f'Natural Earth 1:10m {kind}'}}
        ]})
    land = poly(masks['land'].difference(masks['lakes']))
    exclusion_areas = [Polygon(item['coordinates']) for item in source.get('excludeIslandAreas', [])]
    excluded = [part for part in polygons(masks['land'])
                if any(part.covers(Point(item['point'])) for item in source['excludeIslandSeeds'])
                or any(area.covers(part.representative_point()) for area in exclusion_areas)]
    land = poly(land.difference(unary_union(excluded)))
    result = {id: poly(g.intersection(land)) for id,g in tagged}
    if any(g.is_empty or not g.is_valid for g in result.values()):
        raise ValueError('Empty/invalid master geometry after coast clipping')
    total = unary_union(list(result.values()))
    overlap = sum(g.area for g in result.values())-total.area
    if overlap > 1e-7:
        raise ValueError(f'Master overlap: {overlap}')
    report = {'method':'manual shared-edge overview, printed-graticule polynomial calibration',
              'controlRmsKm':float(np.sqrt(np.mean(errors**2))), 'controlMaxKm':float(errors.max()),
              'note':'控制点残差不是历史疆界误差；边界是网页尺度概括，不是精确测绘。',
              'regionCount':len(result),'bbox':list(total.bounds),
              'excludedIslandNames':[item['name'] for item in source['excludeIslandSeeds']],
              'excludedIslandAreaNames':[item['name'] for item in source.get('excludeIslandAreas', [])]}
    write(GIS / 'master-calibration-report.json', report)
    write(GIS / 'master-regions.geojson', {'type':'FeatureCollection','features':[
        {'type':'Feature','properties':{'id':id,'sourceRefs':['atlas-943-fixed-master']},'geometry':mapping(g)} for id,g in result.items()
    ]})
    print(report)
    return result, land


if __name__ == '__main__':
    build_master()
