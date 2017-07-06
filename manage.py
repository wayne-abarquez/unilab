from flask.ext.script import Manager, prompt_bool
from flask.ext.migrate import Migrate, MigrateCommand

from app import app
from app import db
from app.authentication.models import Role, User
from app.home.models import BoundaryType, Boundary, Territory, UserTerritory, Branch, Product, BranchProduct, Merchant, Transaction
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
def create_sample_users():
    BaseSeeder.load_users()
    print "Created sample users"


if __name__ == '__main__':
    manager.run()
