from flask.ext.script import Manager, prompt_bool
from flask.ext.migrate import Migrate, MigrateCommand

from app import app
from app import db
from app.authentication.models import Role, User
from app.home.models import BoundaryType, Boundary, Territory, UserTerritory
from app.sales.models import Branch, Product, BranchProduct, Merchant, Transaction
from app.seeds.seeder import BaseSeeder

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


if __name__ == '__main__':
    manager.run()
