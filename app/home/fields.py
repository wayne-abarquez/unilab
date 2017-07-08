from flask.ext.restful import fields
from app.utils.gis_json_fields import PolygonToLatLng, PointToLatLng
from copy import copy

boundary_fields = dict(
    id=fields.Integer,
    typeid=fields.Integer,
    type=fields.String,
    parentid=fields.Integer,
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
