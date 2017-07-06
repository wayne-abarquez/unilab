# from app.home.models import Solar, SolarFile
# from app.constants.solar_constants import IN_PROCESS
# from app.utils import forms_helper
# from app.errors import exceptions
# from app import db
# import logging
#
# log = logging.getLogger(__name__)
#
#
# def get_solars_for_user(user=None):
#     return Solar.query.all()
#     # TODO below
#     # if user is None or not user.is_authenticated():
#     # raise UserNotAuthorizedError("Need to login")
#     # if user.role_name == RoleType.FF:
#     #     scips = SCIP.query.all()
#     # elif user.role_name == RoleType.PM:
#     #     scips = SCIP.query.filter(SCIP.project_manager_id == user.id).all()
#     # elif user.role_name == RoleType.IC:
#     #     scips = SCIP.query.filter(SCIP.sas_id == user.id, SCIP.status != SCRUBFormConstant.APPROVED).all()
#     # elif user.role_name == RoleType.CLIENT:
#     #     scips = SCIP.query.filter(SCIP.client_id == user.id, SCIP.status == SCRUBFormConstant.APPROVED).all()
#     # else:
#     #     raise UserRoleInvalidError("Role '{0}' not allowed".format(user.role_name))
#     # return scips
#
#
# def create_from_dict(data):
#     # Prepare Data
#     solar = Solar.from_dict(data)
#     solar.status = IN_PROCESS
#     solar.coordinates = forms_helper.parse_coordinates(data['coordinates'])
#     if 'area' in data:
#         solar.area = forms_helper.parse_area(data['area'])
#         log.debug("solar has area: {0}".format(solar.area))
#
#     # Persist
#     db.session.add(solar)
#     db.session.commit()
#
#     return solar
#
#
# def get_detail(solar_id):
#     return Solar.query.get(solar_id)
#
#
# def update_from_dict(solar_id, data):
#     # Prepare Data
#     solar = Solar.query.get(solar_id)
#
#     if solar is None:
#         raise exceptions.SolarNotFoundError("Solar id={0} not found".format(solar_id))
#
#     solar.update_from_dict(data, ['id', 'coordinates', 'area', 'panels', 'pending_panels'])
#
#     # Update Coordinates and Area
#     solar.coordinates = forms_helper.parse_coordinates(data['coordinates'])
#     if 'area' in data:
#         solar.area = forms_helper.parse_area(data['area'])
#
#     # log.debug("Solar.Panels : {0}".format(solar.panels))
#
#     # Update or Add Pending Solar Panels if any
#     # if 'pending_panels' in data:
#     #     for panel_data in data['pending_panels']:
#     #         if panel_data['name'] and panel_data['area']:
#     #             panel = SolarPanels(name=panel_data['name'],
#     #                                 area=forms_helper.parse_area(panel_data['area']))
#     #             solar.panels.append(panel)
#
#     # Persist
#     db.session.commit()
#
#     return solar
#
