from app import db
from app.home.models import TerritoryStatus, UserTerritory
from datetime import datetime
from random import randint
from faker import Factory
from multiprocessing.dummy import Pool as ThreadPool
from app.utils.gis_json_fields import GeomHelpers
from app.home.services import get_cities_with_limit, get_territories
from app.authentication.services import get_employees
from functools import partial

fake = Factory.create('en_US')

limit = 5
now = datetime.now()


def generate_territory_data(cities, index):
    city = cities[index]

    return {
        'code': fake.md5()[:5].upper(),
        'geom': GeomHelpers.to_string(city.geometry),
        'date_created': now,
        'date_modified': now
    }


def generate_territories(limit=0):
    cities = get_cities_with_limit(limit)

    pool = ThreadPool(4)

    func = partial(generate_territory_data, cities)

    data = pool.map(func, range(0, limit))

    # close the pool and wait for the work to finish
    pool.close()
    pool.join()

    return data


def assign_territories():
    assignees = []

    territories = get_territories()

    for employee in get_employees():
        date_assigned_rand = fake.date_time_between(start_date="-5y", end_date="now")
        territory = territories[randint(0,len(territories)-1)]
        assignees.append(UserTerritory(userid=employee.id, territoryid=territory.id, date_assigned=date_assigned_rand, status=TerritoryStatus.ACTIVE))

    db.session.bulk_save_objects(assignees)
    db.session.commit()
