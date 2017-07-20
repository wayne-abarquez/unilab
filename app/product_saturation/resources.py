from flask.ext.restful import Resource, abort, marshal_with, marshal
from .fields import product_type_fields
from app.sales.fields import product_create_fields, product_fields
from app import rest_api
from flask import request
from .services import get_product_distinct_types, create_product, get_products
import logging

log = logging.getLogger(__name__)


class ProductTypeResource(Resource):
    """
    Resource for Product Types
    """

    @marshal_with(product_type_fields)
    def get(self):
        return get_product_distinct_types()


class ProductResource(Resource):
    """
    Resource for getting all Product
    """

    @marshal_with(product_fields)
    def get(self):
        return get_products()

    def post(self):
        form_data = request.json

        log.debug('Add Product request: {0}'.format(form_data))

        # TODO check authenticated user
        # Validation here
        obj = create_product(form_data)
        result = dict(status=200, message='OK', branch=obj)
        return marshal(result, product_create_fields)


rest_api.add_resource(ProductTypeResource, '/api/products/types')
rest_api.add_resource(ProductResource, '/api/products')
