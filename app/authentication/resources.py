from flask.ext.restful import Resource, marshal_with, abort
from app import rest_api
from flask_login import current_user
from .fields import user_data_fields


class CurrentUserResource(Resource):
    """
    Resource for get details of current user
    """

    @marshal_with(user_data_fields)
    def get(self):
        """ GET /users/current_user """

        if current_user is not None:
            return {
                'id': current_user.id,
                'username': current_user.username,
                'role': current_user.role.name,
                'firstname': current_user.firstname,
                'lastname': current_user.lastname,
            }

        abort(400, message='Prohibited.')


rest_api.add_resource(CurrentUserResource, '/api/users/current_user')
