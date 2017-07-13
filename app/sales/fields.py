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

branch_create_fields = dict(
    status=fields.String,
    message=fields.String,
    branch=fields.Nested(branch_fields, allow_null=False)
)

sales_transaction_fields = dict(
    id=fields.Integer,
    merchantid=fields.Integer,
    userid=fields.Integer,
    type=fields.String,
    description=fields.String,
    transaction_date=fields.DateTime('iso8601'),
    cost=fields.Float,
    address=fields.String,
    start_point_latlng=PointToLatLng(attribute='start_point_latlng'),
    end_point_latlng=PointToLatLng(attribute='end_point_latlng'),
    travel_time_in_minutes=fields.Float,
    average_travel_time_in_minutes=fields.Float,
    merchant=fields.Nested(merchant_fields),
    remarks=fields.String
)

sales_transaction_create_fields = dict(
    status=fields.String,
    message=fields.String,
    sales_transaction=fields.Nested(sales_transaction_fields, allow_null=False)
)

branch_complete_fields = copy(branch_fields)
branch_complete_fields['average_monthly_income'] = fields.Float
branch_complete_fields['average_patrons'] = fields.Float
branch_complete_fields['remarks'] = fields.String
branch_complete_fields['operation_started_date'] = fields.DateTime("iso8601")
