from flask.ext.restful import fields

success_fields = dict(
    status=fields.String,
    message=fields.String,
)
