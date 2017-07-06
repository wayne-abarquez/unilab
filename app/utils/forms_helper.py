from shapely.geometry import Point, Polygon, box
from shapely.wkt import dumps


def parse_coordinates(coordinates):
    if coordinates is None or type(coordinates) is not dict:
        return coordinates

    if all(key in coordinates for key in ('lat', 'lng')):
        point = Point(float(coordinates['lng']), float(coordinates['lat']))
        return dumps(point)


def parse_area(area):
    if area is None:
        return area

    points = map(get_lng_lat_pair, area)

    if len(points) == 2:
        polygon = box(points[0][0], points[0][1], points[1][0], points[1][1])
    else:
        polygon = Polygon(points)

    return dumps(polygon)


def get_lng_lat_pair(pt):
    return float(pt['lng']), float(pt['lat'])
