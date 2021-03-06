from app import db
from app.sales.models import BranchProduct
from datetime import datetime
from random import randint
from faker import Factory
from sqlalchemy import and_
from multiprocessing.dummy import Pool as ThreadPool
from app.home.services import get_branches_by_territory
from app.sales.services import get_products, get_branches_by_boundary

fake = Factory.create('en_US')

now = datetime.now()

products = [
    {'name': 'Allerin', 'type': 'allergy'},
    {'name': 'Allerkid', 'type': 'allergy'},
    {'name': 'Allerta', 'type': 'allergy'},
    {'name': 'Allerta Dermatec', 'type': 'allergy'},
    {'name': 'Allerteen', 'type': 'allergy'},
    {'name': 'Alnix', 'type': 'allergy'},
    {'name': 'Alnix Plus Tablet', 'type': 'allergy'},

    {'name': 'Alaxan FR', 'type': 'body and muscle pain'},
    {'name': 'Dolfenal 250mg', 'type': 'body and muscle pain'},
    {'name': 'Juvenaid', 'type': 'body and muscle pain'},
    {'name': 'Medicol Advance', 'type': 'body and muscle pain'},
    {'name': 'Medicol Advance 400', 'type': 'body and muscle pain'},
    {'name': 'Rexidol Forte', 'type': 'body and muscle pain'},
    {'name': 'Skelan 220', 'type': 'body and muscle pain'},

    {'name': 'Ceelin', 'type': 'childrens health'},
    {'name': 'Appebon Kid', 'type': 'childrens health'},
    {'name': 'Appebon 500', 'type': 'childrens health'},

    {'name': 'Decolgen Forte', 'type': 'cough and colds'},
    {'name': 'Expel OD', 'type': 'cough and colds'},
    {'name': 'Myracof', 'type': 'cough and colds'},
    {'name': 'Neozep Forte', 'type': 'cough and colds'},
    {'name': 'Tuseran Forte', 'type': 'cough and colds'},
    {'name': 'Solmux', 'type': 'cough and colds'},

    {'name': 'Enervon', 'type': 'vitamins and supplements'},
    {'name': 'Flotera', 'type': 'vitamins and supplements'},
    {'name': 'Calciumade', 'type': 'vitamins and supplements'},
    {'name': 'Multi-B', 'type': 'vitamins and supplements'},
    {'name': 'Myra e', 'type': 'vitamins and supplements'}
]


def generate_product_data(product):
    return {
            'name': product['name'],
            'type': product['type'],
            'cost': randint(20, 250),
            'remarks': fake.sentence(6),
            'date_released': fake.date_time_between(start_date="-5y", end_date="now"),
            'date_created': now,
            'date_modified': now,
        }


def generate_products():
    pool = ThreadPool(4)

    mappings = pool.map(generate_product_data, products)

    # close the pool and wait for the work to finish
    pool.close()
    pool.join()

    return mappings


def chunks(l, n):
    """Yield successive n-sized chunks from l."""
    for i in range(0, len(l), n):
        yield l[i:i + n]


def restock_branch(startdate, enddate, territory_id=None, boundary_id=None):
    products = get_products()
    stocks = []
    branch_list = []

    if boundary_id is not None:
        branch_list = map(lambda britm:britm['branch'], get_branches_by_boundary(boundary_id))
        # print result[0]
    elif territory_id is not None:
        branch_list = get_branches_by_territory(territory_id)

    for branch in branch_list:
        upto = randint(10, len(products) - 1)
        for i in range(upto):
            data = {
                'branchid': branch.id,
                'productid': products[i].id,
                'qty_released': randint(500, 10000),
                'unit_of_measure': 'PCS',
                'date_released': fake.date_time_between(start_date=startdate, end_date=enddate)
                # 'date_released': fake.date_time_between(start_date="-1w", end_date="+6w") # current week and the next 4 weeks
                # 'date_released': fake.date_time_between(start_date="-2y", end_date="now")
            }
            found = BranchProduct.query.filter(
                and_(BranchProduct.branchid == data['branchid'], BranchProduct.productid == data['productid'])).first()
            if found is not None:
                found.date_released = data['date_released']
                db.session.commit()
            else:
                stocks.append(BranchProduct.from_dict(data))

    db.session.add_all(stocks)
    # db.session.bulk_insert_mappings(BranchProduct, stocks)
    db.session.commit()

