from app import app
from . import fraud
from flask.ext.restful import abort
from flask import render_template
from flask_login import login_required, current_user

GOOGLE_MAP_API_KEY = app.config['GOOGLE_MAP_API_KEY']


@fraud.route('/frauddetect', methods=['GET', 'POST'])
@login_required
def fraud():
    if current_user.is_admin():
        return render_template('/fraud.html', gmap_api_key=GOOGLE_MAP_API_KEY)

    abort(400, message='Prohibited.')
