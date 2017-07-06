# from flask.ext.restful import Resource, abort, marshal_with, marshal
# from flask import request
# from app.fields.solar_fields import *
# from app import app, rest_api
# from app.services import solar_service
# from app.exceptions.solars import SolarNotFoundError
# from app.home.forms import AddSolarForm
# from flask_login import current_user
# import logging
#
# log = logging.getLogger(__name__)
#
#
# class SolarsResource(Resource):
#     """
#     Resource for getting all Solar based on User's role
#     """
#
#     @marshal_with(solar_fields)
#     def get(self):
#         """ GET /solars """
#         # TODO check authenticated user
#         # TODO: Handle logins for 401s and get_solars_for_user
#         # try:
#         # solars = solar_service.get_solars_for_user(current_user)
#         # log.debug("Scips Resource Data: {0}".format(scips))
#         # return solars
#         # except scip_service.UserNotAuthorizedError:
#         # abort(401, message="Requires user to login")
#         # except scip_service.UserRoleInvalidError as err:
#         # abort(403, message=err.message)
#         return solar_service.get_solars_for_user()
#
#     def post(self):
#         form_data = request.json
#         log.debug('Add Solar request: {0}'.format(form_data))
#         # TODO check authenticated user
#         # Validation here
#         solar_form = AddSolarForm.from_json(form_data)
#         if solar_form.validate():
#             solar_obj = solar_service.create_from_dict(form_data)
#             result = dict(status=200, message='OK', solar=solar_obj)
#             return marshal(result, solar_create_fields)
#         else:
#             abort(400, message="Invalid Parameters", errors=solar_form.errors)
#
#
# class SolarDetailResource(Resource):
#     """
#     Resource for getting details for a Solar
#     """
#
#     @marshal_with(solar_complete_fields)
#     def get(self, solarid):
#         log.debug('GET Solar request: {0}'.format(request.json))
#         print 'app static url path: ' + app.static_url_path
#         # TODO check authenticated user
#         # if current_user and current_user.is_authenticated:
#         solar_data = solar_service.get_detail(solarid)
#         if solar_data:
#             data = solar_data.to_dict()
#             data['panels'] = solar_data.get_panels_data()
#             data["photos"] = solar_data.get_photos_data()
#             return data
#         abort(404, message="Solar id={0} not found".format(solarid))
#         # abort(401, message="Requires user to login")
#
#     def put(self, solarid):
#         data = request.json
#         log.debug("Edit Solar request {0}: {1}".format(solarid, data))
#         # TODO check authenticated user
#         # if current_user and current_user.is_authenticated:
#         try:
#             solar_data = solar_service.update_from_dict(solarid, data)
#             result = dict(status=200, message="OK", solar=solar_data)
#             return marshal(result, solar_create_fields)
#         except SolarNotFoundError as err:
#             abort(404, message=err.message)
#             # abort(401, message="Requires user to login")
#
#
# rest_api.add_resource(SolarsResource, '/api/solars')
# rest_api.add_resource(SolarDetailResource, '/api/solars/<int:solarid>')
#
#
#
#
