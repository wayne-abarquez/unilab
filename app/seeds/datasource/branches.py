from faker import Factory
from multiprocessing.dummy import Pool as ThreadPool
from app.sales.models import BranchType
from app.sales.services import get_branches_id_with_limit
from random import choice, randint
from datetime import datetime

fake = Factory.create('en_US')

now = datetime.now()
types = BranchType.TYPES.values()


def generate_random_type():
    return types[randint(0, 2)]


def generate_random_date():
    return str(choice(range(1985, 2016))) + '-' + str(choice(range(1, 12))) + '-' + str(choice(range(1, 29)))


def generate_branch_data_by_id(id):
    type = generate_random_type()
    name = fake.street_name() + ' - ' + type
    average_monthly_income = fake.pyfloat(7, 2, True)
    average_patrons = fake.pyfloat(4, 2, True)
    remarks = fake.sentence(10)
    started_date = generate_random_date()

    return {
        'id': id,
        'name': name,
        'type': type,
        'average_monthly_income': average_monthly_income,
        'average_patrons': average_patrons,
        'remarks': remarks,
        'status': 'ACTIVE',
        'date_created': now,
        'date_modified': now,
        'operation_started_date': started_date
    }


def generate_branch(limit=0):
    pool = ThreadPool(8)

    branch_mappings = pool.map(generate_branch_data_by_id, get_branches_id_with_limit(limit))

    # close the pool and wait for the work to finish
    pool.close()
    pool.join()

    return branch_mappings
