from app import db
from app.models import BaseModel
from geoalchemy2 import Geometry


class BranchType:
    TYPES = {'MDC': 'MDC', 'LKA': 'LKA', 'GT': 'GT'}
    MDC = 'MDC'
    LKA = 'LKA'
    GT = 'GT'
    tuple_options = [
        (MDC, MDC),
        (LKA, LKA),
        (GT, GT)
    ]


class BranchStatus:
    ACTIVE = 'ACTIVE'
    INACTIVE = 'INACTIVE'


class Branch(BaseModel):
    branch_code = db.Column(db.String(30), index=True, unique=True)
    type = db.Column(db.String(50))
    name = db.Column(db.String(200))
    address = db.Column(db.String(500))
    latlng = db.Column(Geometry('POINT'))
    average_monthly_income = db.Column(db.Numeric)
    average_patrons = db.Column(db.Float)
    remarks = db.Column(db.Text)
    operation_started_date = db.Column(db.Date)
    status = db.Column(db.String(10), default='ACTIVE')


class Product(BaseModel):
    material_code = db.Column(db.String(20))
    brand = db.Column(db.String(200))
    name = db.Column(db.String(200)) # this is the subbrand
    type = db.Column(db.String(50))
    cost = db.Column(db.Numeric)
    remarks = db.Column(db.Text)
    unit_of_measure = db.Column(db.String(50), default='PCS')
    date_released = db.Column(db.DateTime, default=db.func.current_timestamp())


class BranchProduct(BaseModel):
    branchid = db.Column(db.Integer, db.ForeignKey('branch.id'), nullable=False)
    productid = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    qty_released = db.Column(db.Float)
    date_released = db.Column(db.DateTime, default=db.func.current_timestamp())

    product = db.relationship(Product)
    branch = db.relationship(Branch, backref=db.backref('products', cascade="all, delete-orphan"), lazy='joined')


class Merchant(BaseModel):
    name = db.Column(db.String(200))
    address = db.Column(db.String(500))
    specialty = db.Column(db.String(100))
    latlng = db.Column(Geometry('POINT'), nullable=False)


MERCHANT_SPECIALTIES = ['PEDIATRICS', 'GENERAL PRACTICE', 'FAMILY MEDICINE']


class TransactionType:
    CLIENT_VISIT = 'CLIENT VISIT'
    GAS = 'GAS'
    FLIGHT = 'FLIGHT'
    tuple_options = (
        (CLIENT_VISIT, CLIENT_VISIT),
        (GAS, GAS),
        (FLIGHT, FLIGHT)
    )


class TransactionStatus:
    CLEARED = 'CLEARED'
    INVESTIGATING = 'INVESTIGATING'
    FRAUD = 'FRAUD'


class Transaction(BaseModel):
    merchantid = db.Column(db.Integer, db.ForeignKey('merchant.id'))
    userid = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(20))
    description = db.Column(db.Text)
    transaction_date = db.Column(db.DateTime)
    cost = db.Column(db.Numeric)
    address = db.Column(db.String(500))
    start_point_latlng = db.Column(Geometry('POINT'), nullable=True)
    end_point_latlng = db.Column(Geometry('POINT'))

    travel_time_in_minutes = db.Column(db.Float)
    average_travel_time_in_minutes = db.Column(db.Float)
    travel_time_difference = db.Column(db.Float)
    travel_distance_in_km = db.Column(db.Float)

    next_average_travel_time_in_minutes = db.Column(db.Float)
    next_travel_distance_in_km = db.Column(db.Float)

    remarks = db.Column(db.Text)
    status = db.Column(db.String(20))

    merchant = db.relationship(Merchant, lazy='joined')


class Sellout(BaseModel):
    branchid = db.Column(db.Integer, db.ForeignKey('branch.id'), nullable=False)
    productid = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    sellout_date = db.Column(db.Date, nullable=False)
    grossup_amount = db.Column(db.Numeric)

    product = db.relationship(Product)
    branch = db.relationship(Branch, backref=db.backref('sellouts', cascade="all, delete-orphan"), lazy='joined')
