from flask.ext.restful import Resource, abort, marshal
from flask import request
from app.fields import success_with_result_fields
from app import rest_api
from .services import upload_fraud_data
from app.resources import UploadResource
import logging

log = logging.getLogger(__name__)


class FraudUploadResource(UploadResource):
    """
    Resource for Fraud data uploads
    """

    def post(self):
        data = request.form

        log.debug("POST Fraud Upload request : {0}".format(data))

        # TODO check authenticated user
        # if current_user and current_user.is_authenticated:

        uploaded_file = request.files['file']

        # TODO: Delete previous associated file before saving new one for good housekeeping

        if uploaded_file and self.allowed_excel_file(uploaded_file.filename):
            result = upload_fraud_data(uploaded_file)
            return marshal(dict(status=200, message="OK", result=result), success_with_result_fields)
        else:
            abort(400, message="Invalid parameters")
            # abort(401, message="Requires user to login")


rest_api.add_resource(FraudUploadResource, '/api/frauds/upload')
