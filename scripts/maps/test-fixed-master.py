"""Acceptance for the fixed 943 overview, using published geometry, not counts."""
import json
import unittest
from pathlib import Path
from shapely.geometry import Point, shape
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parents[2]


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def published(year):
    registry = read(ROOT / 'data/maps/continuous-registry.json')
    record = next(r for r in registry['years'] if r['year'] == year)
    manifest = registry['manifests'][record['snapshotId']]
    return read(ROOT / ('public' + manifest['files']['realms']))['features']


class FixedMasterTests(unittest.TestCase):
    def test_reviewed_regional_transfers(self):
        # Atlas plates: Wu/Min 934, Jin 943, Zhou 959. Use historical city
        # centres, not present-day municipal boundaries or bay-side new towns.
        cases = [
            (934, (116.78,32.58), 'wu'),
            (943, (116.78,32.58), 'southern-tang'),
            (958, (116.78,32.58), 'later-zhou'),
            (943, (116.10,38.45), 'liao'),
            (958, (116.10,38.45), 'liao'),
            (959, (116.10,38.45), 'later-zhou'),
            (934, (118.30,27.03), 'min'),
            (943, (118.30,27.03), 'yin'),
            (945, (118.30,27.03), 'southern-tang'),
            (975, (118.30,27.03), 'northern-song'),
        ]
        for year, point, expected in cases:
            with self.subTest(year=year, point=point):
                self.assertEqual([f['properties']['dynastyId'] for f in published(year)
                                  if shape(f['geometry']).covers(Point(point))], [expected])

    def test_all_years_cover_only_their_active_partition(self):
        schedule = {u['id']:u for u in read(ROOT/'gis/continuous/ownership.json')['units']}
        partitions = read(ROOT/'gis/continuous/partition.geojson')['features']
        context_ids = {f['properties']['dynastyId'] for f in read(ROOT/'public/maps/continuous/reference-943/realms.geojson')['features']}
        for year in range(907, 980):
            features = published(year)
            self.assertNotIn('regional-uncertain', [f['properties']['dynastyId'] for f in features])
            shapes = [shape(f['geometry']) for f in features]
            total = unary_union(shapes)
            self.assertTrue(all(g.is_valid for g in shapes), year)
            self.assertLess(sum(g.area for g in shapes) - total.area, 1e-7, year)
            active = []
            for f in partitions:
                periods = [p for p in schedule[f['properties']['id']]['periods'] if p['from'] <= year < p['toExclusive']]
                self.assertEqual(len(periods),1)
                if periods[0]['polityId'] is not None and periods[0]['polityId'] not in context_ids:
                    active.append(shape(f['geometry']))
            self.assertLess(unary_union(active).symmetric_difference(total).area, 1e-7, year)

    def test_regional_review_keeps_neighbouring_cities_on_their_side(self):
        cases = [
            (943, (115.48,38.85), 'later-jin'),  # Baozhou, outside ceded Ying/Mo
            (943, (116.83,38.30), 'later-jin'),  # Cangzhou
            (943, (116.12,38.91), 'liao'),      # Mozhou
            (959, (116.12,38.91), 'later-zhou'),
            (959, (116.35,39.90), 'liao'),      # Youzhou not recovered
            (943, (117.18,34.26), 'later-jin'), # Xuzhou north of Wu/Tang
            (943, (117.23,31.82), 'southern-tang'),
            (958, (117.23,31.82), 'later-zhou'),
            (958, (118.80,32.06), 'southern-tang'),
            (958, (119.45,32.20), 'southern-tang'),
            (943, (118.12,27.33), 'yin'),
            (943, (117.49,27.34), 'yin'),
            (943, (118.54,27.92), 'yin'),
            (943, (119.14,28.08), 'wuyue'),
            (943, (120.65,28.01), 'wuyue'),
            (947, (119.30,26.07), 'wuyue'),
            (949, (118.59,24.91), 'qingyuan'),
        ]
        for year, point, expected in cases:
            with self.subTest(year=year, point=point):
                self.assertEqual([f['properties']['dynastyId'] for f in published(year)
                                  if shape(f['geometry']).covers(Point(point))], [expected])

    def test_peripheral_regions_are_separate_reference_not_annual_ownership(self):
        reference = read(ROOT/'public/maps/continuous/reference-943/realms.geojson')['features']
        ids = {f['properties']['dynastyId'] for f in reference}
        self.assertTrue({'tibetan-regions', 'dali', 'khotan', 'xizhou', 'ganzhou',
                         'guiyi', 'kyrgyz', 'tatar', 'jurchen-regions', 'goryeo'}.issubset(ids), ids)
        self.assertTrue(ids.isdisjoint({f['properties']['dynastyId'] for f in published(943)}))

    def test_former_and_later_shu_share_exact_geometry(self):
        def shu(year, polity):
            return shape(next(f['geometry'] for f in published(year) if f['properties']['dynastyId'] == polity))
        self.assertTrue(shu(924, 'former-shu').equals(shu(954, 'later-shu')))

    def test_capitals_and_out_of_scope_islands(self):
        features = published(943)
        for point, expected in [((104.06,30.67), 'later-shu'), ((114.3,34.8), 'later-jin'),
                                ((120.15,30.28), 'wuyue'), ((119.3,26.07), 'min'),
                                ((118.8,32.06), 'southern-tang'),
                                ((113.26,23.13), 'southern-han')]:
            owners = [f['properties']['dynastyId'] for f in features if shape(f['geometry']).contains(Point(point))]
            self.assertEqual(owners, [expected], point)
        for point in [(121,24), (141.35,43.06), (139.7,35.7)]:
            self.assertFalse(any(shape(f['geometry']).contains(Point(point)) for f in features), point)
        after_huainan = published(958)
        self.assertEqual([f['properties']['dynastyId'] for f in after_huainan
                          if shape(f['geometry']).contains(Point(118.8,32.06))], ['southern-tang'])


if __name__ == '__main__':
    unittest.main()
