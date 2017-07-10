from app import db
from .models import BoundaryType, Boundary, Territory, UserTerritory
from app.authentication.models import User
from app.sales.models import Branch
from sqlalchemy import select, func
from sqlalchemy.sql.expression import cast
from geoalchemy2 import Geography  # Geometry
import logging

log = logging.getLogger(__name__)


def get_boundaries(parentid=None):
    if parentid is None:
        return Boundary.query.filter(Boundary.typeid == 3).order_by(Boundary.id).all()
    else:
        return Boundary.query.filter(Boundary.parentid == parentid).order_by(Boundary.id).all()


def get_boundary(boundaryid):
    return Boundary.query.get(boundaryid)


def get_cities_with_limit(count=0):
    if count == 0:
        return Boundary.query.filter(Boundary.typeid == 6).all()
    else:
        return Boundary.query.filter(Boundary.typeid == 6).limit(count).all()


def get_territories():
    return Territory.query.all()


def get_user_territories(userid):
    user = User.query.get(userid)

    if user == None:
        return []

    result = []

    if user.role.name.lower() != 'admin':
        result = db.session.query(UserTerritory, Territory) \
            .join(Territory, UserTerritory.territoryid == Territory.id) \
            .filter(UserTerritory.userid == userid) \
            .all()
    else:
        result = db.session.query(UserTerritory, Territory) \
            .join(Territory, UserTerritory.territoryid == Territory.id) \
            .all()
        # .limit(1000) \

    return list(
        {'userid': item[0].userid, 'territoryid': item[0].territoryid, 'territory': item[1].to_dict()} for item in
        result
    )


def get_branches_by_territory(territoryid):
    qt = select([Territory.geom]).select_from(Territory).where(Territory.id == territoryid).alias('qt')

    stmt = select([Branch.id, Branch.type, Branch.name, Branch.latlng, Branch.status]) \
        .select_from(Branch) \
        .where(func.ST_DWITHIN(cast(qt.c.geom, Geography), cast(Branch.latlng, Geography), 1)) \
        .limit(500)

    return db.engine.execute(stmt).fetchall()

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
