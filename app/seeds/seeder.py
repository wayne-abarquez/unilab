from app import db
from app.authentication.models import Role, User
from app.sales.models import Branch, BranchType, Merchant, Product
from app.home.models import Territory
from app.seeds.datasource import roles, users, branches, merchants, employees, territories, products
from datetime import datetime
import time


class BaseSeeder:
    types = BranchType.TYPES.values()
    now = datetime.now()

    @staticmethod
    def refresh_table(table_name):
        db.session.execute('TRUNCATE "' + table_name + '" RESTART IDENTITY CASCADE')
        db.session.commit()

    @staticmethod
    def load_roles():
        # truncate table
        BaseSeeder.refresh_table('role')

        for data in roles.roles:
            role = Role.from_dict(data)
            db.session.add(role)

        db.session.commit()

    @staticmethod
    def load_users():
        # Load Roles First
        BaseSeeder.load_roles()

        # truncate table
        BaseSeeder.refresh_table('user')

        for data in users.users:
            user = User.from_dict(data)
            user.password = data['password'] if 'password' in data else users.test_password
            db.session.add(user)

        db.session.commit()

    @staticmethod
    def update_branches():
        overall_start_time = time.time()

        branches_data = branches.generate_branch()

        db.session.bulk_update_mappings(Branch, branches_data)
        db.session.commit()

        print("--- overall %s seconds ---" % (time.time() - overall_start_time))

    @staticmethod
    def load_merchants():
        overall_start_time = time.time()

        # truncate table
        BaseSeeder.refresh_table('merchant')

        merchants_data = merchants.generate_merchants()

        db.session.bulk_insert_mappings(Merchant, merchants_data)
        db.session.commit()

        print("--- overall %s seconds ---" % (time.time() - overall_start_time))

    @staticmethod
    def load_employees():
        overall_start_time = time.time()

        BaseSeeder.load_users()

        emp_list = employees.generate_employees(100)

        # print data
        db.session.bulk_save_objects(emp_list)
        db.session.commit()

        print("--- overall %s seconds ---" % (time.time() - overall_start_time))

    @staticmethod
    def load_territories():
        overall_start_time = time.time()

        # truncate table
        BaseSeeder.refresh_table('territory')

        territory_data = territories.generate_territories(100)

        db.session.bulk_insert_mappings(Territory, territory_data)
        db.session.commit()

        print("--- overall %s seconds ---" % (time.time() - overall_start_time))

    @staticmethod
    def assign_territories():
        overall_start_time = time.time()

        BaseSeeder.refresh_table('user_territory')
        territories.assign_territories()

        print("--- overall %s seconds ---" % (time.time() - overall_start_time))

    @staticmethod
    def load_products():
        overall_start_time = time.time()

        # truncate table
        BaseSeeder.refresh_table('product')

        data = products.generate_products()

        db.session.bulk_insert_mappings(Product, data)
        db.session.commit()

        print("--- overall %s seconds ---" % (time.time() - overall_start_time))

    @staticmethod
    def restock_branch(startdate, enddate, territory_id, boundary_id, is_truncate):
        overall_start_time = time.time()

        if is_truncate:
            BaseSeeder.refresh_table('branch_product')

        products.restock_branch(startdate, enddate, territory_id, boundary_id)

        print("--- overall %s seconds ---" % (time.time() - overall_start_time))

    @staticmethod
    def update_user_passwords():
        allusers = User.query.all()
        for user in allusers:
            user.password = users.test_password
        db.session.commit()