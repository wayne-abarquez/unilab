from flask.ext.restful import fields

user_data_fields = dict(
    id=fields.Integer,
    username=fields.String,
    role=fields.String,
    firstname=fields.String,
    lastname=fields.String
)

