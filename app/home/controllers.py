from . import home
from flask import render_template
from flask_login import login_required, current_user


@home.route('/', methods=['GET', 'POST'])
@home.route('/index', methods=['GET', 'POST'])
@login_required
def index():
    if not current_user.is_user_sales():
        return render_template('/index.html')

    return render_template('/sales.html')
