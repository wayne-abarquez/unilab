from flask.ext.restful import Resource, abort, marshal_with, marshal
from app import rest_api
from flask import request
from .fields import *
from app.sales.fields import branch_fields
from .services import get_boundaries, get_boundary, get_user_territories, get_branches_by_territory
from app.utils.google_places_api import get_places_by_territory, get_places_by_boundary
import logging

log = logging.getLogger(__name__)


class BoundaryResource(Resource):
    """
    Resource for getting all Boundaries
    """

    @marshal_with(boundary_fields)
    def get(self):
        """ GET /boundaries """

        parent_id = request.args['parent_id'] if 'parent_id' in request.args else None

        return get_boundaries(parent_id)


class BoundaryDetailResource(Resource):
    """
    Resource for getting Boundary details
    """

    @marshal_with(boundary_complete_fields)
    def get(self, boundaryid):
        """ GET /boundaries/<boundaryid> """
        return get_boundary(boundaryid)


class PlaceResource(Resource):
    """
    Resource for getting all Places
    """

    @marshal_with(places_fields)
    def get(self):
        """ GET /places """
        types = request.args['types'] if 'types' in request.args else None
        territoryid = request.args['territoryid'] if 'territoryid' in request.args else None
        boundaryid = request.args['boundaryid'] if 'boundaryid' in request.args else None

        if territoryid is not None:
            return {'data': get_places_by_territory(territoryid, types)}

        if boundaryid is not None:
            return {'data': get_places_by_boundary(boundaryid, types)}


class UserTerritoryResource(Resource):
    """
    Resource for getting all UserTerritory by User
    """

    @marshal_with(user_territory_fields)
    def get(self, userid):
        """ GET /users/<userid>/territories """
        # TODO check authenticated user
        # TODO: Handle logins for 401s

        log.debug("Get territories for user id = {0}".format(userid))

        return get_user_territories(userid)


class TerritoryBranchResource(Resource):
    """
    Resource for getting all branches by Territory
    """

    @marshal_with(branch_fields)
    def get(self, territoryid):
        """ GET /territories/<territoryid>/branches """
        # TODO check authenticated user
        # TODO: Handle logins for 401s

        log.debug("Get branches by territory id = {0}".format(territoryid))

        return get_branches_by_territory(territoryid)


rest_api.add_resource(BoundaryResource, '/api/boundaries')
rest_api.add_resource(BoundaryDetailResource, '/api/boundaries/<int:boundaryid>')
rest_api.add_resource(PlaceResource, '/api/places')
rest_api.add_resource(UserTerritoryResource, '/api/users/<int:userid>/territories')
rest_api.add_resource(TerritoryBranchResource, '/api/territories/<int:territoryid>/branches')
