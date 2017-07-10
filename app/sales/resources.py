from flask.ext.restful import Resource, abort, marshal_with, marshal
from .fields import *
from app import rest_api
from .services import get_branches_by_boundary, get_branch_within_boundary, get_products_by_branch
from flask import request
import logging

log = logging.getLogger(__name__)


class BranchResource(Resource):
    """
    Resource for getting all Branch
    """

    @marshal_with(branch_fields)
    def get(self):
        """ GET /branches"""
        bounds = request.args['bounds'] if 'bounds' in request.args else None

        # print "bounds: {0}".format(bounds)

        return get_branches_by_boundary(bounds)


class BranchProductResource(Resource):
    """
    Resource for getting all products for Branch
    """

    @marshal_with(branch_product_fields)
    def get(self, branchid):
        """ GET /branches/<branchid>/products """
        # TODO check authenticated user
        # TODO: Handle logins for 401s and get_solars_for_user
        # log.debug("Boundary id = {0} Branches = {1}".format(boundaryid, branches))
        prods = get_products_by_branch(branchid)

        print prods

        return prods

class BoundaryBranchResource(Resource):
    """
    Resource for getting all branches within boundary
    """

    @marshal_with(branch_boundary_fields)
    def get(self, boundaryid):
        """ GET /boundaries/<boundaryid>/branches """
        # TODO check authenticated user
        # TODO: Handle logins for 401s and get_solars_for_user
        branches = get_branch_within_boundary(boundaryid)

        # log.debug("Boundary id = {0} Branches = {1}".format(boundaryid, branches))

        return branches


rest_api.add_resource(BranchResource, '/api/branches')
rest_api.add_resource(BranchProductResource, '/api/branches/<int:branchid>/products')
rest_api.add_resource(BoundaryBranchResource, '/api/boundaries/<int:boundaryid>/branches')