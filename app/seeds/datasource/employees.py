from datetime import datetime
from faker import Factory
from multiprocessing.dummy import Pool as ThreadPool
from .users import test_password
from app.authentication.models import User

fake = Factory.create('en_US')

now = datetime.now()


def generate_employee_data(index):
    firstname = fake.first_name().lower()
    lastname = fake.last_name().lower()

    data = {
        'username': lastname + '.' + firstname,
        'roleid': 2,
        'firstname': firstname,
        'lastname': lastname,
        'date_created': now,
        'date_modified': now
    }

    userobj = User.from_dict(data)
    userobj.password = test_password

    return userobj


def generate_employees(limit=5):
    pool = ThreadPool(4)

    employees = pool.map(generate_employee_data, range(0, limit))

    # close the pool and wait for the work to finish
    pool.close()
    pool.join()

    return employees
