from app import db
from app.utils.orm_object import OrmObject


# Define a base model for other database tables to inherit
class BaseModel(db.Model, OrmObject):
    __abstract__ = True

    id = db.Column(db.Integer, primary_key=True)
    date_created = db.Column(db.DateTime, default=db.func.current_timestamp())
    date_modified = db.Column(db.DateTime, default=db.func.current_timestamp(),
                              onupdate=db.func.current_timestamp())
