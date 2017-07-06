from app import db
from app.models import BaseModel
from geoalchemy2 import Geometry


class BoundaryType(BaseModel):
    name = db.Column(db.String(50), nullable=False)


class Boundary(BaseModel):
    typeid = db.Column(db.Integer, db.ForeignKey('boundary_type.id'), nullable=False)
    parentid = db.Column(db.Integer, db.ForeignKey('boundary.id'), nullable=False)
    name = db.Column(db.String(500), nullable=False)
    geom = db.Column(Geometry('GEOMETRY'))
    population = db.Column(db.Integer)


class Territory(BaseModel):
    code = db.Column(db.CHAR(5), nullable=False)
    geom = db.Column(Geometry('GEOMETRY'))
    address = db.Column(db.String(500))


class TerritoryStatus:
    ACTIVE = 'ACTIVE'
    INACTIVE = 'INACTIVE'


class UserTerritory(BaseModel):
    userid = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    territoryid = db.Column(db.Integer, db.ForeignKey('territory.id'), nullable=False)
    date_assigned = db.Column(db.DateTime, default=db.func.current_timestamp())
    status = db.Column(db.String(10), default=TerritoryStatus.ACTIVE)


class BranchType:
    MDC = 'MDC'
    LKA = 'LKA'
    GT = 'GT'


class Branch(BaseModel):
    type = db.Column(db.String(50))
    name = db.Column(db.String(200))
    address = db.Column(db.String(500))
    latlng = db.Column(Geometry('POINT'), nullable=False)
    average_monthly_income = db.Column(db.Numeric)
    average_patrons = db.Column(db.Float)
    remarks = db.Column(db.Text)
    status = db.Column(db.String(10), nullable=False, default='ACTIVE')


class Product(BaseModel):
    name = db.Column(db.String(200))
    type = db.Column(db.String(50))
    cost = db.Column(db.Numeric)
    remarks = db.Column(db.Text)
    date_released = db.Column(db.DateTime, default=db.func.current_timestamp())


class BranchProduct(BaseModel):
    branchid = db.Column(db.Integer, db.ForeignKey('branch.id'), nullable=False)
    productid = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    qty_released = db.Column(db.Float)
    unit_of_measure = db.Column(db.String(50))
    date_released = db.Column(db.DateTime, default=db.func.current_timestamp())


class Merchant(BaseModel):
    name = db.Column(db.String(200))
    address = db.Column(db.String(500))
    specialty = db.Column(db.String(100))
    latlng = db.Column(Geometry('POINT'), nullable=False)


class TransactionType:
    COVERAGE = 'COVERAGE'
    FLEET = 'FLEET'
    CS3 = 'CS3'
    ONESS = '1SS'


class Transaction(BaseModel):
    merchantid = db.Column(db.Integer, db.ForeignKey('merchant.id'), nullable=False)
    userid = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(20))
    description = db.Column(db.Text)
    transaction_date = db.Column(db.DateTime)
    cost = db.Column(db.Numeric)
    address = db.Column(db.String(500))
    start_point_latlng = db.Column(Geometry('POINT'))
    travel_time_in_minutes = db.Column(db.Float)
    average_travel_time_in_minutes = db.Column(db.Float)
    remarks = db.Column(db.Text)
