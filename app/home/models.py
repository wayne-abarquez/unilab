from app import db
from app.models import BaseModel
from geoalchemy2 import Geometry


class BoundaryType(BaseModel):
    name = db.Column(db.String(50), nullable=False)


class Boundary(BaseModel):
    typeid = db.Column(db.Integer, db.ForeignKey('boundary_type.id'), nullable=False)
    parentid = db.Column(db.Integer, db.ForeignKey('boundary.id'))
    name = db.Column(db.String(500), nullable=False)
    geometry = db.Column(Geometry('GEOMETRY'))
    population = db.Column(db.Integer)

    type = db.relationship(BoundaryType, foreign_keys=typeid)


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
    date_assigned = db.Column(db.Date, default=db.func.current_timestamp())
    status = db.Column(db.String(10), default=TerritoryStatus.ACTIVE)
