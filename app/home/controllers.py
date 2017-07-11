from app import app
from . import home
from flask import render_template
from flask_login import login_required, current_user


GOOGLE_MAP_API_KEY = app.config['GOOGLE_MAP_API_KEY']


@home.route('/', methods=['GET', 'POST'])
@home.route('/index', methods=['GET', 'POST'])
@login_required
def index():
    if not current_user.is_user_sales():
        return render_template('/index.html', gmap_api_key=GOOGLE_MAP_API_KEY)

    return render_template('/sales.html', gmap_api_key=GOOGLE_MAP_API_KEY)
