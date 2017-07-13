from app import db
from app.models import BaseModel, OrmObject
from flask.ext.login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash


class RoleType:
    ADMIN = 'ADMIN'
    SALES = 'SALES'


class Role(db.Model, OrmObject):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)


class User(BaseModel, UserMixin):
    username = db.Column(db.String(50), nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    roleid = db.Column(db.Integer, db.ForeignKey('role.id'))
    firstname = db.Column(db.String(200))
    lastname = db.Column(db.String(200))

    role = db.relationship(Role, foreign_keys=roleid)

    @property
    def password(self):
        raise AttributeError('password: write-only field')

    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)

    def authenticate(self, password):
        return check_password_hash(self.password_hash, password)

    @staticmethod
    def get_by_username(username):
        return User.query.filter_by(username=username).first()

    def is_admin(self):
        return self.roleid == 1

    def is_sales(self):
        return self.roleid == 2

    def __repr__(self):
        return "<User '{}'>".format(self.username)
