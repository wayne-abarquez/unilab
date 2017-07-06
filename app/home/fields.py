# from flask.ext.restful import fields
# from app.utils.gis_json_fields import PointToLatLng, PolygonToLatLng
# from copy import copy
#
# success_fields = dict(
#     status=fields.String,
#     message=fields.String,
# )
#
# solar_fields = dict(
#     id=fields.Integer,
#     project_name=fields.String,
#     client_name=fields.String,
#     client_contact_no=fields.String,
#     coordinates=PointToLatLng(attribute='coordinates'),
#     area=PolygonToLatLng(attribute='area'),
#     address=fields.String,
#     state=fields.String,
#     county=fields.String,
#     site_description=fields.String,
#     status=fields.String,
#     date_created=fields.DateTime("iso8601"),
#     date_modified=fields.DateTime("iso8601")
# )
#
# solar_create_fields = dict(
#     status=fields.String,
#     message=fields.String,
#     solar=fields.Nested(solar_fields, allow_null=False)
# )
#
# solar_panel_fields = dict(
#     id=fields.Integer,
#     solar_id=fields.Integer,
#     name=fields.String,
#     size=fields.String,
#     area=PolygonToLatLng(attribute='area')
# )
#
# solar_panel_create_fields = dict(
#     status=fields.String,
#     message=fields.String,
#     panel=fields.Nested(solar_panel_fields, allow_null=False)
# )
#
# solar_file_fields = dict(
#     id=fields.Integer,
#     solar_id=fields.Integer,
#     caption=fields.String,
#     file_name=fields.String,
#     type=fields.String,
#     src=fields.String
# )
#
# solar_file_create_fields = dict(
#     status=fields.String,
#     message=fields.String,
#     solar_file=fields.Nested(solar_file_fields, allow_null=False)
# )
#
# solar_complete_fields = copy(solar_fields)
# solar_complete_fields['panels'] = fields.Nested(solar_panel_fields)
# solar_complete_fields['photos'] = fields.Nested(solar_file_fields)
