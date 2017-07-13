from flask.ext.restful import fields

success_fields = dict(
    status=fields.String,
    message=fields.String,
)

success_with_result_fields = dict(
    status=fields.String,
    message=fields.String,
    result=fields.Raw
)
