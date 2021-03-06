from flask.ext.script import Manager, prompt_bool
from flask.ext.migrate import Migrate, MigrateCommand

from app import app
from app import db
from app.authentication.models import Role, User
from app.home.models import BoundaryType, Boundary, Territory, UserTerritory
from app.sales.models import Branch, Product, BranchProduct, Merchant, Transaction, Sellout
from app.seeds.seeder import BaseSeeder
from app.fraud.services import compute_transaction_travel_details, scan_out_of_territory_fraud, scan_on_leave_fraud

manager = Manager(app)
migrate = Migrate(app, db)

manager.add_command('db', MigrateCommand)


@manager.command
def initdb():
    db.create_all()
    print "Initialized the Database"


@manager.command
def dropdb():
    if prompt_bool("Are you sure you want to Drop your Database?"):
        db.drop_all()
        print "Database Dropped"


@manager.command
def create_users():
    BaseSeeder.load_users()
    print "Created sample users"


@manager.command
def update_branches():
    BaseSeeder.update_branches()
    print "Created sample branches"


@manager.command
def create_merchants():
    BaseSeeder.load_merchants()
    print "Created sample merchants"


@manager.command
def create_employees():
    BaseSeeder.load_employees()
    print "Created sample employees"


@manager.command
def create_territories():
    BaseSeeder.load_territories()
    BaseSeeder.assign_territories()
    print "Created sample territories and assigned to random employees"


@manager.command
def create_products():
    BaseSeeder.load_products()
    print "Created sample products"


@manager.option('-s', '--startdate', dest='start_date')
@manager.option('-e', '--enddate', dest='end_date')
@manager.option('-i', '--territoryid', dest='territory_id', default=None)
@manager.option('-b', '--boundaryid', dest='boundary_id', default=None)
@manager.option('-t', '--truncate', dest='is_truncate', default=False)
def restock_branches(start_date, end_date, territory_id, boundary_id, is_truncate):
    if territory_id is None and boundary_id is None:
        print "Please Enter Territory id. ex: --territoryid='101' or Boundary id. ex: --boundaryid='452736'"
        return

    BaseSeeder.restock_branch(start_date, end_date, territory_id, boundary_id, is_truncate)
    print "Branches Restocked sample products"


@manager.command
def update_user_passwords():
    BaseSeeder.update_user_passwords()
    print "User Passwords updated"


@manager.option('-s', '--startdate', dest='start_date')
@manager.option('-e', '--enddate', dest='end_date')
@manager.option('-u', '--userid', dest='user_id', default=2)
def compute_travel_times(start_date, end_date, user_id):
    print "Compute Travel Times  : {0} - {1} User: {2}".format(start_date, end_date, user_id)
    compute_transaction_travel_details(start_date, end_date, user_id)
    return True

@manager.command
def generate_branch_product_dates():
    BaseSeeder.generate_branch_product_dates()


@manager.option('-u', '--userid', dest='userid', default=2)
def scan_fraud(userid):
    scan_out_of_territory_fraud(userid)
    scan_on_leave_fraud(userid)

if __name__ == '__main__':
    manager.run()
