"""Development only. OSM Overpass JSON -> small, deterministic scene polygons.

python -m pip install -r scripts/requirements-gis.txt
python scripts/generate-boston-world.py --fetch
Offline input: data/raw/boston-overpass.json (Overpass `out geom` JSON).
No GIS package or raw source is shipped to the browser.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import urllib.request
import urllib.parse

from shapely import make_valid
from shapely.geometry import Polygon, LineString, box
from shapely.ops import polygonize, unary_union

ROOT = Path(__file__).resolve().parents[1]
BBOX = [42.350, -71.075, 42.371, -71.045]  # south, west, north, east
ORIGIN = [-71.060, 42.3605]
SCALE = 0.16
R = 6378137
QUERY = '''[out:json][timeout:90];(
way["building"](42.350,-71.075,42.371,-71.045);
relation["building"]["type"="multipolygon"](42.350,-71.075,42.371,-71.045);
way["highway"](42.350,-71.075,42.371,-71.045);
nwr["leisure"~"park|garden|nature_reserve"](42.350,-71.075,42.371,-71.045);
nwr["landuse"~"grass|forest|recreation_ground|meadow"](42.350,-71.075,42.371,-71.045);
nwr["natural"~"water|coastline|wood|scrub"](42.350,-71.075,42.371,-71.045);
nwr["waterway"="riverbank"](42.350,-71.075,42.371,-71.045);
);out geom;'''


def project(p):
    return ((p['lon'] - ORIGIN[0]) * math.pi / 180 * R * math.cos(ORIGIN[1] * math.pi / 180) * SCALE,
            -(p['lat'] - ORIGIN[1]) * math.pi / 180 * R * SCALE)


sw = project({'lon': BBOX[1], 'lat': BBOX[0]})
ne = project({'lon': BBOX[3], 'lat': BBOX[2]})
CROP = box(sw[0], ne[1], ne[0], sw[1])


def parts(g, kind):
    if g.is_empty:
        return []
    if g.geom_type == kind:
        return [g]
    return [p for sub in getattr(g, 'geoms', []) for p in parts(sub, kind)]


def rings(element):
    """Join unordered/reversed member ways; subtract only enclosed inner rings."""
    if element['type'] == 'way':
        coordinates = element.get('geometry', [])
        if len(coordinates) >= 4 and coordinates[0] == coordinates[-1]:
            return make_valid(Polygon([project(p) for p in coordinates]))
        return Polygon()
    outer, inner = [], []
    for member in element.get('members', []):
        pts = member.get('geometry', [])
        if len(pts) > 1:
            (inner if member.get('role') == 'inner' else outer).append(LineString([project(p) for p in pts]))
    shells = unary_union(list(polygonize(unary_union(outer)))) if outer else Polygon()
    holes = unary_union(list(polygonize(unary_union(inner)))) if inner else Polygon()
    return make_valid(shells.difference(holes))


def points(coords):
    return [[round(x, 3), round(y, 3)] for x, y in coords]


def encode(poly):
    # Canonical winding/start point makes review diffs and rebuilds stable.
    def canonical(coords):
        pts = points(list(coords)[:-1])
        start = min(range(len(pts)), key=lambda i: pts[i])
        return pts[start:] + pts[:start]
    from shapely.geometry.polygon import orient
    poly = orient(poly, sign=1)
    return {'ring': canonical(poly.exterior.coords),
            'holes': sorted([canonical(r.coords) for r in poly.interiors])}


def number(value):
    if not value:
        return None
    try:
        text = str(value).strip().split(';')[0]
        return round(float(text.replace('m', '').replace('ft', '').strip()) * (0.3048 if 'ft' in text else 1), 2)
    except ValueError:
        return None


def run(source, output):
    raw = source.read_bytes()
    data = json.loads(raw)
    if data.get('remark') or not data.get('elements'):
        raise ValueError('Incomplete/empty Overpass response: ' + str(data.get('remark')))
    elements = sorted(data['elements'], key=lambda e: (e['type'], e['id']))
    buildings, roads, greens, plazas, waters, coasts = [], [], [], [], [], []
    # Suppress outer member duplicates only for successfully assembled buildings.
    relation_members = set()
    for e in elements:
        if e['type'] == 'relation' and e.get('tags', {}).get('building') and not rings(e).is_empty:
            relation_members.update(m['ref'] for m in e.get('members', []) if m['type'] == 'way')
    for e in elements:
        tags = e.get('tags', {})
        identity = ('r' if e['type'] == 'relation' else 'w') + str(e['id'])
        if tags.get('natural') == 'coastline' and len(e.get('geometry', [])) > 1:
            line = LineString([project(p) for p in e['geometry']])
            coasts.extend(parts(line.intersection(CROP), 'LineString'))
        highway = tags.get('highway')
        if highway and len(e.get('geometry', [])) > 1 and tags.get('tunnel') != 'yes' and tags.get('area') != 'yes':
            category = ('major' if highway in ['motorway', 'trunk', 'primary', 'secondary', 'primary_link', 'secondary_link'] else
                        'secondary' if highway in ['tertiary', 'unclassified', 'residential'] else
                        'pedestrian' if highway in ['footway', 'pedestrian', 'path', 'steps', 'cycleway'] else 'local')
            for i, line in enumerate(parts(LineString([project(p) for p in e['geometry']]).intersection(CROP), 'LineString')):
                if line.length > .35:
                    roads.append({'id': identity + '-' + str(i), 'kind': category,
                                  'points': points(line.simplify(.12).coords), 'bridge': tags.get('bridge') == 'yes'})
        kind = ('buildings' if tags.get('building') and tags['building'] != 'no' else
                'water' if tags.get('natural') == 'water' or tags.get('waterway') == 'riverbank' else
                'green' if tags.get('leisure') in ['park', 'garden', 'nature_reserve'] or tags.get('landuse') in ['grass', 'forest', 'recreation_ground', 'meadow'] or tags.get('natural') in ['wood', 'scrub'] else
                'plaza' if highway in ['pedestrian', 'footway'] and tags.get('area') == 'yes' else None)
        if not kind or (kind == 'buildings' and e['type'] == 'way' and e['id'] in relation_members):
            continue
        for i, poly in enumerate(parts(rings(e).intersection(CROP).simplify(.10, preserve_topology=True), 'Polygon')):
            if poly.area < (.55 if kind == 'buildings' else .2):
                continue
            item = {'id': identity + '-' + str(i), **encode(poly)}
            if kind == 'buildings':
                bounds = list(poly.minimum_rotated_rectangle.exterior.coords)
                edges = [(math.dist(bounds[j], bounds[j+1]), bounds[j], bounds[j+1]) for j in range(4)]
                length, a, b = max(edges)
                width = min(v[0] for v in edges)
                c = poly.centroid
                item.update(center=points([(c.x, c.y)])[0], area=round(poly.area, 3),
                            elongation=round(length / max(.01, width), 3),
                            compactness=round(4 * math.pi * poly.area / poly.length**2, 3),
                            orientation=round(math.atan2(b[1]-a[1], b[0]-a[0]), 5),
                            levels=number(tags.get('building:levels')), height=number(tags.get('height')),
                            use=tags['building'])
            {'buildings': buildings, 'green': greens, 'plaza': plazas, 'water': waters}[kind].append(item)
    # Coastlines are open directed ways. Polygonize them with the crop boundary,
    # then classify water on the right of the OSM way (land lies on its left).
    # Projection flips north to -Z, so geographical right is positive XY cross.
    ocean_faces = []
    if coasts:
        faces = list(polygonize(unary_union([CROP.boundary, *coasts])))
        segments = [(a, b) for line in coasts for a, b in zip(list(line.coords), list(line.coords)[1:])]
        for face in faces:
            p = face.representative_point()
            a, b = min(segments, key=lambda ab: LineString(ab).distance(p))
            cross = (b[0]-a[0])*(p.y-a[1]) - (b[1]-a[1])*(p.x-a[0])
            if cross > 0:
                ocean_faces.append(face)
        for i, poly in enumerate(parts(unary_union(ocean_faces), 'Polygon')):
            waters.append({'id': 'coast-water-' + str(i), **encode(poly)})
    world = {'version': 1, 'source': {'attribution': 'Map data © OpenStreetMap contributors',
             'license': 'ODbL-1.0', 'url': 'https://www.openstreetmap.org/copyright',
             'sha256': hashlib.sha256(raw).hexdigest(), 'osmTimestamp': data.get('osm3s', {}).get('timestamp_osm_base'),
             'bbox': BBOX}, 'projection': {'origin': ORIGIN, 'unitsPerMeter': SCALE, 'axes': 'x east, z south', 'bounds': list(CROP.bounds)},
             'buildings': buildings, 'roads': roads, 'greens': greens, 'plazas': plazas, 'water': waters,
             'coastlines': [points(line.coords) for line in coasts]}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(world, separators=(',', ':'), ensure_ascii=False) + '\n', encoding='utf-8')
    print(json.dumps({'output': str(output), 'bytes': output.stat().st_size,
                      **{k: len(world[k]) for k in ['buildings', 'roads', 'greens', 'plazas', 'water', 'coastlines']}}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--fetch', action='store_true')
    parser.add_argument('--source', type=Path, default=ROOT / 'data/raw/boston-overpass.json')
    parser.add_argument('--output', type=Path, default=ROOT / 'public/world/boston-layout.json')
    args = parser.parse_args()
    if args.fetch:
        args.source.parent.mkdir(parents=True, exist_ok=True)
        for host in ['https://overpass.kumi.systems/api/interpreter', 'https://overpass-api.de/api/interpreter']:
            try:
                url = host + '?' + urllib.parse.urlencode({'data': QUERY})
                request = urllib.request.Request(url, headers={'User-Agent': 'FutureWithAI-world-preprocessor/1.0'})
                with urllib.request.urlopen(request, timeout=110) as response:
                    raw = response.read()
                parsed = json.loads(raw)
                if parsed.get('remark') or not parsed.get('elements'):
                    raise ValueError('Incomplete Overpass response')
                args.source.write_bytes(raw)
                break
            except Exception as error:
                print(f'{host}: {error}')
        else:
            raise SystemExit(f'Place an Overpass out geom JSON extract at {args.source}, then rerun without --fetch.')
    if not args.source.exists():
        raise SystemExit(f'Place an Overpass out geom JSON extract at {args.source}, or run with --fetch.')
    run(args.source, args.output)
