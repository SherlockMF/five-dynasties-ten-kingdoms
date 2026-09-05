"""Build a year-end atlas by dissolving a shared, land-clipped partition.

Run with QGIS Python (Shapely 2.1, pyproj). No scan or network access at runtime.
The reference copies are immutable inputs; regeneration never reads its outputs.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from collections import defaultdict

import numpy as np
from pyproj import Transformer
from shapely import coverage_simplify, make_valid
from shapely.geometry import Polygon, MultiPolygon, LineString, Point, box, shape, mapping
from shapely.ops import unary_union, split, transform

ROOT = Path(__file__).resolve().parents[2]
GIS = ROOT / 'gis/continuous'
FINE = [934, 943, 949, 954, 959]
EMPTY = {'type': 'FeatureCollection', 'features': []}
BACKGROUND_POLITIES = {'tibetan-regions','kyrgyz','tatar','jurchen-regions','karluk','dali','goryeo','khotan','xizhou','ganzhou','guiyi','annan-regimes'}
TO_METERS = Transformer.from_crs(4326, '+proj=aea +lat_1=25 +lat_2=47 +lat_0=0 +lon_0=110 +datum=WGS84 +units=m', always_xy=True).transform
FROM_METERS = Transformer.from_crs('+proj=aea +lat_1=25 +lat_2=47 +lat_0=0 +lon_0=110 +datum=WGS84 +units=m', 4326, always_xy=True).transform


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')


def parts(g):
    if g.geom_type == 'Polygon':
        return [g]
    return [p for child in getattr(g, 'geoms', []) for p in parts(child)]


def polygonal(g):
    return unary_union(parts(make_valid(g)))


def solid(g):
    return unary_union([Polygon(p.exterior) for p in parts(g)])


def fc(features):
    return {'type': 'FeatureCollection', 'features': features}


def feature(g, props):
    return {'type': 'Feature', 'geometry': mapping(g), 'properties': props}


def bootstrap():
    for year in FINE:
        for filename in ['realms.geojson', 'disputed.geojson', 'places.geojson', 'sources.json', 'manifest.json']:
            target = GIS / f'reference/{year}/{filename}'
            if not target.exists():
                write(target, read(ROOT / f'public/maps/{year}/{filename}'))
    for kind in ['land', 'lakes']:
        target = GIS / f'{kind}-mask.geojson'
        if not target.exists():
            source = GIS / f'{kind}-source.geojson'
            region = box(95, 17, 137, 55)
            geometries = [polygonal(shape(f['geometry']).intersection(region)) for f in read(source)['features'] if shape(f['geometry']).intersects(region)]
            write(target, fc([feature(unary_union(geometries), {'source': f'Natural Earth 1:10m {kind}', 'sha256': hashlib.sha256(source.read_bytes()).hexdigest()})]))


def midpoint_split(area, first, second):
    """Bisect only the local disagreement face, not surrounding control areas."""
    a, b = first.representative_point(), second.representative_point()
    c = area.centroid
    dx, dy = b.x-a.x, b.y-a.y
    norm = max((dx*dx+dy*dy)**0.5, 1e-9)
    line = LineString([(c.x-dy/norm*100, c.y+dx/norm*100), (c.x+dy/norm*100, c.y-dx/norm*100)])
    faces = parts(split(area, line))
    left, right = [], []
    for face in faces:
        p = face.representative_point()
        (left if (p.x-c.x)*dx+(p.y-c.y)*dy <= 0 else right).append(face)
    return unary_union(left), unary_union(right)


def repair(year, land):
    original = read(GIS / f'reference/{year}/realms.geojson')['features']
    records = []
    for f in original:
        g = shape(f['geometry'])
        # 954 focus-wash extraction left text-shaped holes; actual lakes are
        # removed by the independent natural-water mask, not by image ink.
        if year == 954 and f['properties']['accuracyLevel'] == 'reconstructed':
            g = solid(g)
        records.append([f['properties'].copy(), polygonal(g.intersection(land))])
    # Preserve a directly sourced polygon against an inferred neighbour.
    rank = lambda p: 2 if p['accuracyLevel'] in ['attested', 'reconstructed'] else 1
    for i, (pa, a) in enumerate(records):
        for j in range(i):
            pb, b = records[j]
            overlap = polygonal(a.intersection(b))
            if overlap.area < 1e-12:
                continue
            if rank(pa) > rank(pb):
                b = polygonal(b.difference(a))
            elif rank(pa) < rank(pb):
                a = polygonal(a.difference(b))
            else:
                a_share, b_share = midpoint_split(overlap, a, b)
                a = polygonal(a.difference(overlap).union(a_share))
                b = polygonal(b.difference(overlap).union(b_share))
            records[j][1] = b
        records[i][1] = a
    occupied = unary_union([g for _, g in records])
    # An open seam is not a polygon hole. Include explicitly reviewed inland
    # envelopes in validation; never infer ownership from proximity.
    inclusions = unary_union([shape(f['geometry']) for f in read(GIS / 'coverage-inclusions.geojson')['features']])
    coverage = polygonal(solid(occupied).union(inclusions).intersection(land))
    gaps = polygonal(coverage.difference(occupied))
    unknown = []
    for gap in parts(gaps):
        if gap.area < 1e-12:
            continue
        neighbours = [(i, p, g) for i, (p, g) in enumerate(records) if g.boundary.intersection(gap.boundary).length > .00001]
        # Only narrow, bounded seams are repaired; broad undocumented areas
        # are not assigned to the geographically nearest country.
        thin = gap.area / max(gap.length, .001) < .025
        if thin and len(neighbours) == 2 and solid(occupied).covers(gap):
            (i, pa, a), (j, pb, b) = neighbours
            if rank(pa) != rank(pb):
                winner = i if rank(pa) > rank(pb) else j
                records[winner][1] = polygonal(records[winner][1].union(gap))
            else:
                ga, gb = midpoint_split(gap, a, b)
                records[i][1] = polygonal(a.union(ga))
                records[j][1] = polygonal(b.union(gb))
        else:
            unknown.append(gap)
    return records, polygonal(unary_union(unknown)), coverage


def cut_mask(coords):
    return Polygon(coords)


# Historical expression cuts, NOT province boundaries. Each cut is applied
# once to the shared geometry; all resulting neighbours inherit identical nodes.
MASKS = {
    'hedong': cut_mask([(110.2,36.2),(111,35.8),(113.4,36.2),(114,37.4),(113.5,39.2),(112.4,40.2),(110.6,39.9),(110.2,36.2)]),
    'hebei': cut_mask([(113.4,36.2),(114,37.4),(113.5,39.2),(116.2,39.2),(117,38.5),(116.1,37.2),(115,36),(113.4,36.2)]),
    'yanyun': cut_mask([(109.8,40.2),(110.7,39.7),(112,39.1),(113.4,39.25),(114.7,39.45),(115.5,38.1),(116.7,38.08),(117.1,38.5),(117.9,38.8),(118.6,39.1),(119.5,40.0),(119.0,40.6),(117.5,41.1),(115,41.4),(112.8,41.3),(111.2,40.8),(109.8,40.2)]),
    'guannan': cut_mask([(115.4,39.2),(116.3,39.1),(117.35,39.2),(117.5,38.8),(116.7,38.08),(115.5,38.1),(115.4,39.2)]),
    'balhae': cut_mask([(126,40.9),(124.3,42.2),(125,44),(127,45.7),(129,46.8),(137,49),(137,39),(126,40.9)]),
    'qi': cut_mask([(105.2,33.8),(106.5,33.6),(107.6,34),(108.2,34.8),(107.9,35.6),(106.4,36),(104.8,35.2),(105.2,33.8)]),
    'qinfeng': cut_mask([(103.8,32.5),(105.2,32.7),(106.5,33.4),(107,34.1),(106.6,35.4),(104.7,35.7),(103.8,34.8),(103.8,32.5)]),
    'hanzhong': cut_mask([(105.3,32.4),(106.2,32.3),(107.5,32.4),(108.5,32.9),(109.4,33.4),(109,34),(107.5,34.3),(106.5,33.4),(105.3,32.4)]),
    'huainan': cut_mask([(110,33.5),(112,32.2),(114,30.65),(115,30.1),(116,29.8),(117,30.45),(117.7,30.95),(118.3,31.45),(118.75,32.15),(119.45,32.25),(120,32.05),(121,31.65),(123,31.4),(123,36),(110,36),(110,33.5)]),
    'fuzhou': cut_mask([(118.65,25.2),(119.6,25.15),(122,25.2),(122,28.5),(119.9,28.5),(119.15,27.3),(118.65,26.5),(118.65,25.2)]),
    'quanzhou': cut_mask([(116,22.8),(121,22.8),(121,25.2),(118.65,25.2),(118.1,25.5),(117.2,25.15),(116.5,24.7),(116,22.8)]),
    'lingnan-north': cut_mask([(108,23.4),(111.6,23.4),(111.6,24.8),(111.1,25.6),(110.3,26.2),(109.2,26.4),(108,25.7),(108,23.4)]),
}


def build_partition(records, unknown, land):
    base = {p['dynastyId']: g for p, g in records}
    units = {}
    def take(unit, parent, mask):
        units[unit] = polygonal(base[parent].intersection(mask))
        base[parent] = polygonal(base[parent].difference(mask))
    for id in ['hedong', 'hebei', 'qi']:
        take(id, 'later-jin', MASKS[id])
    take('yanyun', 'liao', MASKS['yanyun'])
    units['guannan'] = polygonal(units['yanyun'].intersection(MASKS['guannan']))
    units['yanyun'] = polygonal(units['yanyun'].difference(MASKS['guannan']))
    take('balhae', 'liao', MASKS['balhae'])
    take('huainan', 'southern-tang', MASKS['huainan'])
    take('fuzhou', 'min', MASKS['fuzhou'])
    take('quanzhou', 'min', MASKS['quanzhou'])
    take('lingnan-north', 'chu', MASKS['lingnan-north'])
    for unit, polity in [('central','later-jin'),('liao-core','liao'),('sichuan','later-shu'),('jiangnan','southern-tang'),('min-interior','min'),('hunan','chu'),('lingnan','southern-han'),('jingnan','jingnan'),('wuyue','wuyue')]:
        units[unit] = base[polity]
    ids = [id for id,g in units.items() if not g.is_empty]
    print('Partition areas:', {id: round(g.area, 3) for id,g in units.items()})
    # Coverage simplification moves each shared edge just once. The exterior
    # (including coast and lake holes) is locked, followed by a land safety clip.
    # The master already has the approved medium-detail shared outline.
    # No separate simplification may move its interface with a background region.
    return {id: units[id] for id in ids}


def owner(unit, year, table):
    matches = [p for p in table[unit]['periods'] if p['from'] <= year < p['toExclusive']]
    if len(matches) != 1:
        raise ValueError(f'{unit}/{year}: expected one owner, got {len(matches)}')
    if matches[0]['polityId'] is None and not (matches[0].get('note') and matches[0].get('sourceRefs')):
        raise ValueError(f'{unit}/{year}: omission requires a note and sources')
    return matches[0]


def region_props(id, name, year, end, snapshot, refs, note, accuracy='approximate'):
    return dict(id=f'{id}-{snapshot}', dynastyId=id, name=name, snapshotId=snapshot,
                validFromYear=year, validToYearExclusive=end, boundaryKind='influence' if id=='regional-uncertain' else 'controlled',
                accuracyLevel=accuracy, verificationStatus='reviewed', sourceRefs=refs, disputedNote=note)


def labelled(g, props):
    # Boolean dissolution can leave zero-width rings with nonzero perimeter.
    # Remove only numerical slits (<~0.02 m²), never actual lake/enclave holes.
    cleaned = [Polygon(part.exterior, [ring for ring in part.interiors if Polygon(ring).area >= 1e-12]) for part in parts(g)]
    g = cleaned[0] if len(cleaned) == 1 else MultiPolygon(cleaned)
    p = g.representative_point()
    old = Point(props.get('labelLongitude', p.x), props.get('labelLatitude', p.y))
    if not g.contains(old):
        old = p
    return feature(g, {**props, 'labelLongitude': old.x, 'labelLatitude': old.y})


def outline_collection(features, water):
    # Only subtract water shorelines from lines, never buffer political areas.
    shore = water.buffer(1e-7)
    return fc([feature(shape(f['geometry']).boundary.difference(shore), f['properties']) for f in features
               if not shape(f['geometry']).boundary.difference(shore).is_empty])


def boundary_collection(features, water=Polygon()):
    # Node and de-duplicate all shared edges, then combine by evidence class.
    outlines = outline_collection(features, water)['features']
    certain = unary_union([shape(f['geometry']) for f in outlines if f['properties']['accuracyLevel'] in ['attested','reconstructed']])
    inferred = unary_union([shape(f['geometry']) for f in outlines]).difference(certain)
    result = []
    for id, geometry in [('reconstructed', certain), ('approximate', inferred)]:
        if not geometry.is_empty:
            result.append(feature(geometry, dict(id=f'boundaries-{id}', accuracyLevel=id, sourceRefs=['continuous-method'])))
    return fc(result)


def validate(features, coverage, land):
    shapes = [shape(f['geometry']) for f in features]
    assert all(g.is_valid and not g.is_empty for g in shapes), 'invalid/empty geometry'
    assert all(g.contains(Point(f['properties']['labelLongitude'], f['properties']['labelLatitude'])) for f,g in zip(features,shapes)), 'label outside polygon'
    total = unary_union(shapes)
    overlap = sum(g.area for g in shapes)-total.area
    gap = coverage.difference(total).area
    offshore = total.difference(land).area
    assert overlap < 1e-7, f'overlap {overlap}'
    assert gap < 1e-7, f'gap {gap}'
    assert offshore < 1e-7, f'offshore {offshore}'
    return {'valid': True, 'overlapDegrees2': max(0,overlap), 'gapDegrees2': gap, 'offshoreDegrees2': offshore,
            'polities': sorted({f['properties']['dynastyId'] for f in features})}


def main():
    # Keep archived fine snapshots intact. The public year route now uses one
    # fixed master for every year, including the former five special anchors.
    import importlib.util
    spec = importlib.util.spec_from_file_location('master', Path(__file__).with_name('build-master-atlas.py'))
    master = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(master)
    base, land = master.build_master()
    water = unary_union([shape(f['geometry']) for f in read(GIS/'master-lakes-mask.geojson')['features']])
    schedule = read(GIS/'ownership.json')
    table = {u['id']:u for u in schedule['units']}
    names = {p['id']:p['name'] for p in read(ROOT/'data/maps/map-polities.json')}
    sources = {s['id']:s for s in schedule['sources']}
    for year in FINE:
        for f in read(GIS/f'reference/{year}/realms.geojson')['features']:
            names[f['properties']['dynastyId']] = f['properties']['name']
        for source in read(GIS/f'reference/{year}/sources.json'):
            sources.setdefault(source['id'], source)
    names.update({'later-liang':'后梁','former-shu':'前蜀','northern-song':'北宋'})
    sources['atlas-943-fixed-master'] = dict(id='atlas-943-fixed-master',title='《中国历史地图集》第五册：943 年全图（固定地区母版）',
        reference='local-only:atlas-page-82-943',role='georeference',license='Local reference only; scan not redistributed',redistributable=False,
        note='依据总图经纬网定位、共享边界中线人工概括；fixed-943.3按晋图943年、吴闽合页934年、周图959年复核寿州、瀛莫与建州相关共享边界。地区固定，主要兼并与割地才改变归属。不是逐年实测疆域。')
    sources['natural-earth-lakes-10m'] = dict(id='natural-earth-lakes-10m',title='Natural Earth 1:10m Lakes',
        reference='https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-lakes/',
        role='geography',license='Public domain',redistributable=True,note='排除现代人工水库；天然湖泊保留。斋桑湖为天然湖泊受筑坝扩张的例外，采用概括现代岸线，不代表十世纪水位。湖岸不作为政权边界。')
    for unit in table.values():
        for period in unit['periods']:
            if period['polityId'] is not None and period['polityId'] not in names:
                raise ValueError(f"Unknown polity: {period['polityId']}")
            if not period.get('sourceRefs') or any(ref not in sources for ref in period['sourceRefs']):
                raise ValueError(f"Unknown/missing ownership source: {unit['id']}")
    core_ids = {'later-jin','liao','later-shu','chu','jingnan','southern-tang','wuyue','min','southern-han'}
    records = [({'dynastyId':id},g) for id,g in base.items() if id in core_ids]
    units = build_partition(records, Polygon(), land)
    units.update({id:g for id,g in base.items() if id not in core_ids})
    write(GIS/'partition.geojson', fc([feature(g, {'id':id,'name':table[id]['name'],'sourceRefs':['atlas-943-fixed-master','continuous-method']}) for id,g in units.items()]))
    write(GIS/'division-cuts.geojson', fc([feature(g, {'id':id,'note':'主要割地的共用切分，非现代省界'}) for id,g in MASKS.items() if id not in ['qinfeng','hanzhong']]))
    coverage = unary_union(list(base.values()))
    previous = read(GIS/'generation-report.json')
    reference_years = previous.get('referenceYears', {str(y):previous['years'][str(y)] for y in FINE})
    report = {'years':{},'referenceYears':reference_years,'fineDifferences':previous.get('fineDifferences',{}),
              'method':'fixed-943-master','calibration':read(GIS/'master-calibration-report.json')}
    phases, year_records = {}, []
    reference_features = []
    for unit in list(units):
        period = owner(unit,943,table)
        polity = period['polityId']
        if polity in BACKGROUND_POLITIES:
            props = region_props(polity,names[polity],907,980,'reference-943',period['sourceRefs'],
                '仅为943年总图的周边地域参考，不表示其他年份的控制范围或政权存续。')
            props['boundaryKind'] = 'influence'
            reference_features.append(labelled(units.pop(unit),props))
    reference_path = ROOT/'public/maps/continuous/reference-943'
    for filename, collection in [('realms',fc(reference_features)),('boundaries',boundary_collection(reference_features,water)),('outlines',outline_collection(reference_features,water))]:
        write(reference_path/f'{filename}.geojson',collection)
    phases['reference-943'] = dict(id='reference-943',anchorYear=943,validFromYear=907,validToYearExclusive=980,version='fixed-943.5',bbox=list(coverage.bounds),
        files={**{name:f'/maps/continuous/reference-943/{name}.geojson' for name in ['realms','boundaries','outlines']},'sources':'/maps/continuous/sources.json'},
        sourceRefs=['atlas-943-fixed-master','continuous-method'],inferenceNotes=['943年周边地域参考；不作为当前年份疆域。'],confidence='low')
    signatures = {year:tuple((owner(id,year,table)['polityId'],owner(id,year,table).get('displayName')) for id in units) for year in range(907,980)}
    starts = [y for y in range(907,980) if y==907 or signatures[y]!=signatures[y-1]]
    for start in starts:
        end = next((s for s in starts if s>start),980)
        id = f'phase-{start}-{end-1}'
        grouped, notes, refs = defaultdict(list), defaultdict(set), defaultdict(set)
        display_names, omitted = {}, []
        for unit,g in units.items():
            period = owner(unit,start,table)
            polity = period['polityId']
            if polity is None:
                omitted.append({'unit':unit,'note':period['note'],'sourceRefs':period['sourceRefs']})
                continue
            if period.get('displayName'):
                display_names[polity] = period['displayName']
            grouped[polity].append(g)
            notes[polity].add(period['note'])
            refs[polity].update(period['sourceRefs'])
        features = []
        for polity, gs in grouped.items():
            props = region_props(polity,display_names.get(polity,names[polity]),start,end,id,
                sorted(refs[polity]|{'atlas-943-fixed-master','continuous-method'}),
                '以943年地理格局为骨架，概括主要政权更替，非逐年精确疆域；'+'；'.join(sorted(notes[polity])))
            if polity in BACKGROUND_POLITIES:
                props['boundaryKind'] = 'influence'
            features.append(labelled(polygonal(unary_union(gs)),props))
        active_coverage = unary_union([g for unit,g in units.items() if owner(unit,start,table)['polityId'] is not None])
        check = validate(features,active_coverage,land)
        check['omittedUnits'] = omitted
        folder = ROOT/f'public/maps/continuous/{id}'
        write(folder/'realms.geojson',fc(features))
        write(folder/'boundaries.geojson',boundary_collection(features,water))
        write(folder/'outlines.geojson',outline_collection(features,water))
        check['realmsSha256'] = hashlib.sha256((folder/'realms.geojson').read_bytes()).hexdigest()
        manifest = dict(id=id,anchorYear=943,validFromYear=start,validToYearExclusive=end,version='fixed-943.5',bbox=list(active_coverage.bounds),
            files=dict(realms=f'/maps/continuous/{id}/realms.geojson',boundaries=f'/maps/continuous/{id}/boundaries.geojson',outlines=f'/maps/continuous/{id}/outlines.geojson',sources='/maps/continuous/sources.json'),
            sourceRefs=sorted({'continuous-method','atlas-943-fixed-master','natural-earth-land-10m','natural-earth-lakes-10m'} |
                {ref for f in features for ref in f['properties']['sourceRefs']}),
            inferenceNotes=[f'{start}—{end-1} 年末归属阶段；全部年份共用943地区母版。',
                '以943年地理格局为骨架，概括主要政权更替，非逐年精确疆域。',
                '前后蜀共用蜀地；不表现秦凤等小区域进退，燕云、淮南及主要灭国兼并保留。',
                '有明确兼并依据的转移土地；有据退出而无明确接收方的允许不显示，不自动分给邻国。943周边地域另置可选参考层，不属于当年疆域。'],
            confidence='low')
        phases[id] = manifest
        for year in range(start,end):
            report['years'][str(year)] = check
            year_records.append(dict(year=year,snapshotId=id,anchorYear=943,boundaryMode='generalized',confidence='low',
                mapNote=f'943地区母版 · {start}—{end-1}年末归属。概括主要更替，非逐年精确疆域；事件仍覆盖全年。',eventIds=[]))
    write(ROOT/'public/maps/continuous/sources.json',list(sources.values()))
    for year in FINE:
        archived = read(ROOT/f'public/maps/{year}/manifest.json')
        phases[archived['id']] = archived
    write(ROOT/'data/maps/continuous-registry.json',{'manifests':phases,'years':year_records})
    write(GIS/'generation-report.json',report)
    print(f'Generated {len(starts)} fixed-master phases / {len(year_records)} years; archived fine snapshots unchanged; all geometry checks passed.')


if __name__=='__main__':
    main()
