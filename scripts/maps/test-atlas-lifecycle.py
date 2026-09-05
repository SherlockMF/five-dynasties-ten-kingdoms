"""Regression checks for water, political outlines and explicit omissions."""
import importlib.util
import unittest
from pathlib import Path
from shapely.geometry import Polygon, box, shape

def load(name, filename):
    spec = importlib.util.spec_from_file_location(name, Path(__file__).with_name(filename))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

master = load('master', 'build-master-atlas.py')
generator = load('generator', 'generate-continuous-atlas.py')

class LifecycleTests(unittest.TestCase):
    def test_published_song_has_no_numerical_slit_holes(self):
        features = generator.read(generator.ROOT/'public/maps/continuous/phase-979-979/realms.geojson')['features']
        song = shape(next(f['geometry'] for f in features if f['properties']['dynastyId']=='northern-song'))
        self.assertFalse(any(Polygon(r).area < 1e-12 for p in generator.parts(song) for r in p.interiors))

    def test_offshore_exclusion_covers_satellite_islands_not_just_taiwan(self):
        features = generator.read(generator.ROOT/'public/maps/continuous/phase-979-979/realms.geojson')['features']
        total = generator.unary_union([shape(f['geometry']) for f in features])
        self.assertLess(total.intersection(box(119.3,21,123,24)).area, 1e-10)
        self.assertTrue(total.covers(generator.Point(109.5,19.2)))

    def test_modern_reservoir_excluded_but_natural_origin_exception_retained(self):
        self.assertFalse(getattr(master, 'historical_water', lambda _: True)({'featurecla':'Reservoir','name':'Bratsk Reservoir'}))
        self.assertTrue(master.historical_water({'featurecla':'Lake','name':'Lake Baikal'}))
        self.assertTrue(master.historical_water({'featurecla':'Reservoir','name':'Lake Zaysan'}))

    def test_unexplained_omission_is_rejected(self):
        table = {'test':{'periods':[{'from':907,'toExclusive':980,'polityId':None}]}}
        with self.assertRaises(ValueError):
            generator.owner('test', 943, table)

    def test_documented_exit_does_not_choose_a_neighbour(self):
        period = {'from':907,'toExclusive':980,'polityId':None,'note':'退出后未指定继承方', 'sourceRefs':['test-source']}
        self.assertIsNone(generator.owner('test',943,{'test':{'periods':[period]}})['polityId'])

    def test_lakes_not_political_outlines_but_enclaves_are(self):
        lake, enclave = box(1,1,2,2), box(3,3,4,4)
        region = box(0,0,5,5).difference(lake.union(enclave))
        features = [generator.feature(region, {'id':'test','dynastyId':'test','accuracyLevel':'approximate','sourceRefs':['test']})]
        outline = generator.boundary_collection(features, lake)
        lines = generator.unary_union([shape(f['geometry']) for f in outline['features']])
        self.assertLess(lines.intersection(lake.boundary).length, 1e-7)
        self.assertAlmostEqual(lines.intersection(enclave.boundary).length, enclave.length)

    def test_published_reference_excludes_reservoir_holes_and_lake_outlines(self):
        water = generator.read(generator.ROOT/'public/maps/continuous/natural-water.geojson')['features']
        self.assertTrue(all(master.historical_water(f['properties']) for f in water))
        self.assertTrue(any('Baikal' in (f['properties']['name'] or '') for f in water))
        realms = generator.read(generator.ROOT/'public/maps/continuous/reference-943/realms.geojson')['features']
        kyrgyz = shape(next(f['geometry'] for f in realms if f['properties']['dynastyId']=='kyrgyz'))
        source = generator.read(generator.GIS/'lakes-source.geojson')['features']
        bratsk = shape(next(f['geometry'] for f in source if f['properties'].get('name')=='Bratsk Reservoir'))
        self.assertTrue(kyrgyz.covers(bratsk.representative_point()))
        lines = generator.read(generator.ROOT/'public/maps/continuous/reference-943/outlines.geojson')['features']
        outline = shape(next(f['geometry'] for f in lines if f['properties']['dynastyId']=='kyrgyz'))
        lake_mask = generator.unary_union([shape(f['geometry']) for f in water])
        self.assertLess(outline.intersection(lake_mask).length, 1e-7)

if __name__ == '__main__':
    unittest.main()
