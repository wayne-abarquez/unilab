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
    name = db.Column(db.String(200))
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
    remarks = db.Column(db.Text)

    merchant = db.relationship(Merchant, lazy='joined')
