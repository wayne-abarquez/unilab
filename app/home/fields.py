from flask.ext.restful import fields
from app.utils.gis_json_fields import PolygonToLatLng
from copy import copy

boundary_type_fields = dict(
    id=fields.Integer,
    name=fields.String
)

boundary_fields = dict(
    id=fields.Integer,
    typeid=fields.Integer,
    parentid=fields.Integer,
    type=fields.Nested(boundary_type_fields),
    name=fields.String
)

territory_fields = dict(
    code=fields.String,
    geom=PolygonToLatLng(attribute='geom'),
    address=fields.String
)

user_territory_fields = dict(
    userid=fields.Integer,
    territoryid=fields.Integer,
    territory=fields.Nested(territory_fields)
)

places_fields = dict(
    data=fields.Raw
)

boundary_complete_fields = copy(boundary_fields)
boundary_complete_fields['geometry'] = PolygonToLatLng(attribute='geometry')
