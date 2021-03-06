from flask.ext.restful import Resource, abort, marshal_with, marshal
from .fields import *
from app.fields import success_with_result_fields
from app.fields import success_fields
from .forms import AddBranchForm, AddSalesTransactionForm
from app import rest_api
from .services import get_branches_by_boundary, get_branch_within_boundary, get_products_by_branch, create_branch, \
    get_sales_transactions, create_sales_transaction, create_merchant, delete_branch, get_user_sales_transactions, \
    get_branches_by_filter, add_products_to_branch, get_products_for_branches, get_sales_transactions_within_date_range, \
    get_branches_within_date_range_by_product, get_sales_transactions_by_date, get_transaction_count_with_dates, \
    get_all_branches_count, delete_branch_wihin_boundary, update_sales_transaction_remarks, \
    update_sales_transaction_status, upload_branch_data, upload_branch_sellouts_data, get_branch_sellouts, \
    get_branch_sellouts_by_product, get_cleared_transaction_count_with_dates, get_investigated_transaction_count_with_dates, \
    get_sellout_distinct_dates
from flask import request
from flask_login import current_user
from app.resources import UploadResource
import logging

log = logging.getLogger(__name__)


class BranchResource(Resource):
    """
    Resource for getting all Branch
    """

    @marshal_with(branch_fields)
    def get(self):
        """ GET /branches"""

        if 'name' in request.args:
            return get_branches_by_filter(request.args['name'], 'name')
        elif 'boundary_name' in request.args:
            return get_branches_by_filter(request.args['boundary_name'], 'boundary_name')
        elif 'territory' in request.args:
            return get_branches_by_filter(request.args['territory'], 'territory')
        elif 'start_date' in request.args and 'end_date' in request.args and 'product' in request.args:
            return get_branches_within_date_range_by_product(request.args['start_date'], request.args['end_date'], request.args['product'])

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

    def put(self):
        form_data = request.json

        print "put branch formdata: {0}".format(form_data)

        if 'count_all' in form_data:
            count = get_all_branches_count()
            return marshal({'count': count}, count_fields)

        elif 'boundary' in form_data: # tool to delete branches within polygon, this is temporary
            delete_branch_wihin_boundary(form_data['boundary'])

        return None


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


class BranchProductsResource(Resource):
    """
    Resource for getting all products for branches
    """

    @marshal_with(branch_with_product_fields)
    def post(self):
        form_data = request.json

        log.debug("Get Products for Branches with ids = {0}".format(form_data['branch_ids']))

        return get_products_for_branches(form_data['branch_ids'])


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
        print "get sales transaction: {0}".format(request.args)

        if 'start_date' in request.args and 'end_date' in request.args and 'emp_id' in request.args:
            return get_sales_transactions_within_date_range(request.args['start_date'], request.args['end_date'],
                                                            request.args['emp_id'])
        elif 'start_date' in request.args and 'emp_id' in request.args:
            return get_sales_transactions_by_date(request.args['start_date'], request.args['emp_id'])

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

    @marshal_with(date_transaction_ctr_fields)
    def put(self):
        form_data = request.json

        print "get sales transaction put: {0}".format(form_data)

        if 'dates' in form_data and 'emp_id' in form_data \
                and 'transaction_status' in form_data \
                and form_data['transaction_status'] == 'cleared':
            return get_cleared_transaction_count_with_dates(form_data['dates'], form_data['emp_id'])
        elif 'dates' in form_data and 'emp_id' in form_data \
                and 'transaction_status' in form_data \
                and form_data['transaction_status'] == 'investigating':
            return get_investigated_transaction_count_with_dates(form_data['dates'], form_data['emp_id'])
        elif 'dates' in form_data and 'emp_id' in form_data:
            return get_transaction_count_with_dates(form_data['dates'], form_data['emp_id'])

        return []


class SalesTransactionDetailResource(Resource):
    """
    Resource for getting all Sales Transactions Detail
    """

    def put(self, transactionid):
        form_data = request.json

        if 'remarks' in form_data:
            update_sales_transaction_remarks(transactionid, form_data['remarks'])
        elif 'status' in form_data:
            update_sales_transaction_status(transactionid, form_data['status'])

        return marshal(dict(status=200, message="OK"), success_fields)


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


class BranchUploadResource(UploadResource):
    """
    Resource for Branch data uploads
    """

    def post(self):
        data = request.form

        log.debug("POST Upload customer data request : {0}".format(data))

        # TODO check authenticated user
        # if current_user and current_user.is_authenticated:

        uploaded_file = request.files['file']

        # TODO: Delete previous associated file before saving new one for good housekeeping

        if uploaded_file and self.allowed_excel_file(uploaded_file.filename):
            result = upload_branch_data(uploaded_file)
            return marshal(dict(status=200, message="OK", result=result), success_with_result_fields)
        else:
            abort(400, message="Invalid parameters")
            # abort(401, message="Requires user to login")


class BranchSelloutsUploadResource(UploadResource):
    """
    Resource for Branch sellouts data uploads
    """

    def post(self):
        data = request.form

        log.debug("POST Upload branch sellouts data request : {0}".format(data))

        # TODO check authenticated user
        # if current_user and current_user.is_authenticated:

        uploaded_file = request.files['file']

        # TODO: Delete previous associated file before saving new one for good housekeeping

        if uploaded_file and self.allowed_excel_file(uploaded_file.filename):
            result = upload_branch_sellouts_data(uploaded_file)
            return marshal(dict(status=200, message="OK", result=result), success_with_result_fields)
        else:
            abort(400, message="Invalid parameters")
            # abort(401, message="Requires user to login")


class BranchSelloutsResource(Resource):
    """
    Resource for getting all Sellouts for branch
    """

    @marshal_with(branch_sellout_fields)
    def get(self):
        """ GET /branches/sellouts """

        if 'semester' in request.args and 'product' in request.args:
            return get_branch_sellouts_by_product(request.args['semester'], request.args['product'])
        elif 'date' in request.args and 'product' in request.args:
            return get_branch_sellouts_by_product(request.args['date'], request.args['product'])
        elif 'semester' in request.args and 'branch_ids' in request.args:
            return get_branch_sellouts(request.args['semester'], request.args['branch_ids'])

        return []


class SelloutsResource(Resource):
    """
    Resource for getting all Sellouts
    """

    @marshal_with(branch_sellout_fields)
    def get(self):
        """ GET /sellouts """

        if 'distinct' in request.args and request.args['distinct'] == 'dates':
            return get_sellout_distinct_dates()

        return []


rest_api.add_resource(BranchResource, '/api/branches')
rest_api.add_resource(BranchProductsResource, '/api/branches/products')
rest_api.add_resource(BranchDetailResource, '/api/branches/<int:branchid>')
rest_api.add_resource(BranchProductResource, '/api/branches/<int:branchid>/products')
rest_api.add_resource(BoundaryBranchResource, '/api/boundaries/<int:boundaryid>/branches')
rest_api.add_resource(SalesTransactionResource, '/api/salestransactions')
rest_api.add_resource(SalesTransactionDetailResource, '/api/salestransactions/<int:transactionid>')
rest_api.add_resource(UserSalesTransactionResource, '/api/users/<int:userid>/salestransactions')
rest_api.add_resource(BranchUploadResource, '/api/branches/upload')
rest_api.add_resource(BranchSelloutsUploadResource, '/api/branches/sellouts/upload')
rest_api.add_resource(BranchSelloutsResource, '/api/branches/sellouts')
rest_api.add_resource(SelloutsResource, '/api/sellouts')

