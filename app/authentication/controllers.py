from . import auth
from .models import User
from .forms import LoginForm
from flask import request, redirect, url_for, render_template, flash
from app import lm
from flask_login import login_user, logout_user, current_user
import logging

log = logging.getLogger(__name__)


@lm.user_loader
def load_user(userid):
    return User.query.get(int(userid))


@auth.route('/login', methods=['GET', 'POST'])
def login():
    if current_user is not None and current_user.is_authenticated:
        return redirect(url_for('home.index'))

    form = LoginForm()
    if form.validate_on_submit():
        data = request.form
        user = User.get_by_username(data['username'])
        if user is not None and user.authenticate(data['password']):
            login_user(user)
            return redirect(request.args.get('next') or url_for('home.index'))

    if request.method == 'POST':
        flash("Invalid Username/Password.")

    return render_template('login.html', form=form)


@auth.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('auth.login'))
