from datetime import datetime
from random import randint
from faker import Factory
from app.sales.models import MERCHANT_SPECIALTIES
from multiprocessing.dummy import Pool as ThreadPool
from app.utils.gis_json_fields import GeomHelpers
from app.sales.services import get_branches_with_limit
from functools import partial

fake = Factory.create('en_US')

limit = 5
now = datetime.now()


def generate_merchant_data(branches, index):
    branch = branches[randint(0, limit - 1)]
    return {
        'name': fake.name(),
        'address': fake.address(),
        'specialty': MERCHANT_SPECIALTIES[randint(0, len(MERCHANT_SPECIALTIES) - 1)],
        'date_created': now,
        'date_modified': now,
        'latlng': GeomHelpers.to_string(branch.latlng)
    }


def generate_merchants():

    branches = get_branches_with_limit(limit)

    pool = ThreadPool(4)

    func = partial(generate_merchant_data, branches)

    merchant_mappings = pool.map(func, range(0, limit))

    # close the pool and wait for the work to finish
    pool.close()
    pool.join()

    return merchant_mappings
