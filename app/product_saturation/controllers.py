from app import app
from . import product_saturation
from flask.ext.restful import abort
from flask import render_template
from flask_login import login_required, current_user

GOOGLE_MAP_API_KEY = app.config['GOOGLE_MAP_API_KEY']


@product_saturation.route('/productsaturation', methods=['GET', 'POST'])
@login_required
def productsaturation():
    if current_user.is_admin():
        return render_template('/product_saturation.html', gmap_api_key=GOOGLE_MAP_API_KEY)

    abort(400, message='Prohibited.')
