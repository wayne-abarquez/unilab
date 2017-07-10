from flask.ext.restful import fields
from app.utils.gis_json_fields import PointToLatLng
from copy import copy

branch_fields = dict(
    id=fields.Integer,
    type=fields.String,
    name=fields.String,
    address=fields.String,
    latlng=PointToLatLng(attribute='latlng'),
    status=fields.String
)

merchant_fields = dict(
    name=fields.String,
    address=fields.String,
    specialty=fields.String,
    latlng=PointToLatLng(attribute='latlng')
)

branch_boundary_fields = dict(
    branchid=fields.Integer,
    boundaryid=fields.Integer,
    branch=fields.Nested(branch_fields)
)

product_fields = dict(
    id=fields.Integer,
    name=fields.String,
    type=fields.String,
    cost=fields.Float,
    remarks=fields.String
)

branch_product_fields = dict(
    id=fields.Integer,
    branchid=fields.Integer,
    productid=fields.Integer,
    qty_released=fields.Float,
    unit_of_measure=fields.String,
    product=fields.Nested(product_fields),
    date_released=fields.DateTime('iso8601')
)

branch_complete_fields = copy(branch_fields)
branch_complete_fields['average_monthly_income'] = fields.Float
branch_complete_fields['average_patrons'] = fields.Float
branch_complete_fields['remarks'] = fields.String
branch_complete_fields['operation_started_date'] = fields.DateTime("iso8601")
