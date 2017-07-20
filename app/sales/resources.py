from flask.ext.restful import Resource, abort, marshal_with, marshal
from .fields import *
from app.fields import success_fields
from .forms import AddBranchForm, AddSalesTransactionForm
from app import rest_api
from .services import get_branches_by_boundary, get_branch_within_boundary, get_products_by_branch, create_branch, \
    get_sales_transactions, create_sales_transaction, create_merchant, delete_branch, get_user_sales_transactions, \
    get_branches_by_filter, add_products_to_branch
from flask import request
from flask_login import current_user
import logging

log = logging.getLogger(__name__)


class BranchResource(Resource):
    """
    Resource for getting all Branch
    """

    @marshal_with(branch_fields)
    def get(self):
        """ GET /branches"""

        name = request.args['name'] if 'name' in request.args else None
        boundary_name = request.args['boundary_name'] if 'boundary_name' in request.args else None
        territory = request.args['boundary_name'] if 'boundary_name' in request.args else None

        if 'name' in request.args:
            return get_branches_by_filter(request.args['name'], 'name')
        elif 'boundary_name' in request.args:
            return get_branches_by_filter(request.args['boundary_name'], 'boundary_name')
        elif 'territory' in request.args:
            return get_branches_by_filter(request.args['territory'], 'territory')

        bounds = request.args['bounds'] if 'bounds' in request.args else None

        return get_branches_by_boundary(bounds)

    def post(self):
        form_data = request.json

        log.debug('Add Branch request: {0}'.format(form_data))

        # TODO check authenticated user
        # Validation here
        form = AddBranchForm.from_json(form_data)
        if form.validate():
            obj = create_branch(form_data)
            result = dict(status=200, message='OK', branch=obj)
            return marshal(result, branch_create_fields)
        else:
            abort(400, message="Invalid Parameters", errors=form.errors)


class BranchDetailResource(Resource):
    """
    Resource for getting Branch Details
    """

    def delete(self, branchid):
        log.debug("Delete Branch id = {0}".format(branchid))
        # TODO check authenticated user
        # if current_user and current_user.is_authenticated:
        try:
            delete_branch(branchid)
            result = dict(status=200, message="OK")
            return marshal(result, success_fields)
        except ValueError as err:
            abort(404, message=err.message)
            # abort(401, message="Requires user to login")


class BranchProductResource(Resource):
    """
    Resource for getting all products for Branch
    """

    def post(self, branchid):
        form_data = request.json

        log.debug("Add Products to Branch id = {0}".format(branchid, form_data))

        if 'products' in form_data and 'date_released' in form_data:
            add_products_to_branch(branchid, form_data)
            return marshal(dict(status=200, message="OK"), success_fields)
        else:
            abort(400, message="Invalid Parameters")

    @marshal_with(branch_product_fields)
    def get(self, branchid):
        """ GET /branches/<branchid>/products """
        # TODO check authenticated user
        # TODO: Handle logins for 401s and get_solars_for_user
        prods = get_products_by_branch(branchid)

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


class SalesTransactionResource(Resource):
    """
    Resource for getting all Sales Transactions
    """

    @marshal_with(sales_transaction_fields)
    def get(self):
        """ GET /salestransactions"""
        # bounds = request.args['bounds'] if 'bounds' in request.args else None
        return get_sales_transactions()

    def post(self):
        form_data = request.json

        log.debug('Add Sales Transaction request: {0}'.format(form_data))

        # add merchant
        merchant = create_merchant(
            {'name': form_data['name'], 'address': form_data['address'], 'latlng': form_data['end_point_latlng']})
        log.debug('merchant created: {0}'.format(merchant))

        form_data['userid'] = current_user.id
        form_data['merchantid'] = merchant.id
        # TODO check authenticated user
        # Validation here
        form = AddSalesTransactionForm.from_json(form_data)
        if form.validate():
            obj = create_sales_transaction(form_data)
            result = dict(status=200, message='OK', sales_transaction=obj)
            return marshal(result, sales_transaction_create_fields)
        else:
            abort(400, message="Invalid Parameters", errors=form.errors)


class UserSalesTransactionResource(Resource):
    """
    Resource for getting all Sales Transactions for a User
    """

    @marshal_with(sales_transaction_fields)
    def get(self, userid):
        # page_no = request.args['page_no'] if 'page_no' in request.args else None
        # page_size = request.args['page_size'] if 'page_size' in request.args else None
        """ GET /users/<userid>/salestransactions"""
        return get_user_sales_transactions(userid, 300)


rest_api.add_resource(BranchResource, '/api/branches')
rest_api.add_resource(BranchDetailResource, '/api/branches/<int:branchid>')
rest_api.add_resource(BranchProductResource, '/api/branches/<int:branchid>/products')
rest_api.add_resource(BoundaryBranchResource, '/api/boundaries/<int:boundaryid>/branches')
rest_api.add_resource(SalesTransactionResource, '/api/salestransactions')
rest_api.add_resource(UserSalesTransactionResource, '/api/users/<int:userid>/salestransactions')
