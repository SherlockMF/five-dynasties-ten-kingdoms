"""Regression: open inland seams are not silently outside validation coverage."""
import importlib.util
import unittest
from pathlib import Path
from shapely.geometry import Point, shape
from shapely.ops import unary_union

spec = importlib.util.spec_from_file_location('atlas', Path(__file__).with_name('generate-continuous-atlas.py'))
atlas = importlib.util.module_from_spec(spec)
spec.loader.exec_module(atlas)


class SeamTests(unittest.TestCase):
    def test_open_qianzhong_seam_is_explicit_not_empty(self):
        data = atlas.read(atlas.ROOT / 'public/maps/continuous/phase-907-910/realms.geojson')
        features = data['features']
        for point in [(107, 27), (108, 27), (108, 28)]:
            owners = [f['properties']['dynastyId'] for f in features if shape(f['geometry']).covers(Point(point))]
            self.assertEqual(len(owners), 1, point)
            self.assertNotIn('regional-uncertain', owners, point)

    def test_reference_lake_holes_remain_water(self):
        data = atlas.read(atlas.ROOT / 'public/maps/continuous/phase-907-910/realms.geojson')
        covered = unary_union([shape(f['geometry']) for f in data['features']])
        lakes = shape(atlas.read(atlas.GIS / 'lakes-mask.geojson')['features'][0]['geometry'])
        self.assertLess(covered.intersection(lakes).area, 1e-7)


if __name__ == '__main__':
    unittest.main()
