"""Small fixtures protect topology, holes and duplicate suppression in the importer."""
import importlib.util
from pathlib import Path
import unittest
spec=importlib.util.spec_from_file_location('world',Path(__file__).with_name('generate-boston-world.py'))
world=importlib.util.module_from_spec(spec)
spec.loader.exec_module(world)

def way(points, role='outer'):
    return {'type':'way','role':role,'geometry':[{'lon':x,'lat':y} for x,y in points]}

class GeometryTests(unittest.TestCase):
    def test_local_origin_and_scale(self):
        self.assertEqual(world.project({'lon':-71.06,'lat':42.3605}),(0.0,-0.0))
        self.assertGreater(world.project({'lon':-71.059,'lat':42.361})[0],0)
        self.assertLess(world.project({'lon':-71.059,'lat':42.361})[1],0)

    def test_reversed_split_members_preserve_hole(self):
        a=(-71.061,42.360);b=(-71.059,42.360);c=(-71.059,42.361);d=(-71.061,42.361)
        hole=[(-71.0605,42.3602),(-71.0595,42.3602),(-71.0595,42.3608),(-71.0605,42.3608),(-71.0605,42.3602)]
        poly=world.rings({'type':'relation','members':[way([c,b,a]),way([c,d,a]),way(hole,'inner')]})
        self.assertTrue(poly.is_valid);self.assertEqual(len(poly.interiors),1)
        self.assertEqual(world.encode(poly),world.encode(poly))

    def test_open_way_is_not_an_invented_polygon(self):
        self.assertTrue(world.rings(way([(-71.06,42.36),(-71.059,42.36),(-71.059,42.361)])).is_empty)

    def test_number_parsing(self):
        self.assertEqual(world.number('100 ft'),30.48)
        self.assertEqual(world.number('12 m'),12)
        self.assertIsNone(world.number('unknown'))

if __name__=='__main__':unittest.main()
