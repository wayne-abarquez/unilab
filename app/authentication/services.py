from .models import User


def get_employees():
    return User.query.filter(User.roleid==2).all()
