from app import app, db
from app.home.models import Territory
from sqlalchemy import func, select
from app.utils.gis_json_fields import PointToLatLng
import json
import requests
import shapely
from geoalchemy2.shape import to_shape


place_types_category = [
    'establishment',
    'restaurant',
    'hospital',
    'airport',
    'bank',
    'church',
    'school',
    'shopping_mall',
    'museum',
    'park',
    'lodging',
    'cafe'
]


def attach_next_page_token(item, token):
    item['next_page_token'] = token
    return item


def get_poi_by_within_radius(center, radius_param, results, place_type=None, nextpagetoken=None):
    url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=' + app.config.get('GOOGLE_MAP_API_KEY')
    url += '&location=' + str(center['lat']) + ',' + str(center['lng'])
    url += '&radius=' + str(radius_param)

    if place_type is not None:
        url += '&type=' + place_type

    if nextpagetoken is not None:
        url += '&pagetoken=' + nextpagetoken

    response = requests.get(url, verify=False)
    if response.content:
        content = json.loads(response.content)
        if 'results' in content:
            if 'next_page_token' in content:
                results += map(lambda item: attach_next_page_token(item, content['next_page_token']),
                               content['results'])
            else:
                results += content['results']

        # if 'next_page_token' in content and content['next_page_token'] is not None:
        #     return get_poi_by_within_radius(center_param, radius_param, results, place_type, content['next_page_token'])

    return results


def get_poi_type(types, place_types_list=None):
    type = 'establishment'

    type_selection = place_types_category if place_types_list is None else place_types_list

    for place_type in type_selection:
        for inner_type in types:
            if place_type == inner_type:
                type = place_type
                break

    return type


def is_within(point_data, shape):
    point = shapely.geometry.Point(point_data['lng'], point_data['lat'])

    return shape.contains(point)


def filter_pois(geom, pois, place_types_list):
    data = {}

    shape = to_shape(geom)

    for item in pois:
        if is_within(item['geometry']['location'], shape):
            item['type'] = get_poi_type(item['types'], place_types_list)

            if item['type'] not in data:
                data[item['type']] = []

            data[item['type']].append(item)

    return data


def get_territory_center_and_radius(territoryid):
    stmt = select([(func.ST_Centroid(Territory.geom)).label('center'),
                   (func.ST_Perimeter(func.ST_Buffer(Territory.geom, (
                       func.ST_Perimeter(Territory.geom) / (func.pi() * 2) / 1.5)), False) / (
                        func.pi() * 2)).label(
                       'radius'),
                   Territory.geom.label('geom')
                   ]) \
        .select_from(Territory) \
        .where(Territory.id == territoryid)

    result = db.session.execute(stmt).fetchone()

    if result is None:
        return result

    return {
        'center': PointToLatLng().format(result[0]),
        'radius': result[1],
        'geom': result[2]
    }


def get_places_by_territory(territoryid, place_types):
    data = get_territory_center_and_radius(territoryid)

    results = []

    place_types_list = place_types.split('|')

    for placetype in place_types_list:
        results += get_poi_by_within_radius(data['center'], data['radius'], [], placetype)

    filtered = filter_pois(data['geom'], results, place_types_list)

    return filtered
