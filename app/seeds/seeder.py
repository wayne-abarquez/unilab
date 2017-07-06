from app import db
from faker import Factory
from app.authentication.models import Role, User
from app.seeds.datasource import roles, users

fake = Factory.create('en_US')


class BaseSeeder:
    @staticmethod
    def refresh_table(table_name):
        db.session.execute('TRUNCATE "' + table_name + '" RESTART IDENTITY CASCADE')
        db.session.commit()


    @staticmethod
    def load_roles():
        BaseSeeder.refresh_table('role')
        for data in roles.roles:
            role = Role.from_dict(data)
            db.session.add(role)
        db.session.commit()

    @staticmethod
    def load_users():
        # Load Roles First
        BaseSeeder.load_roles()

        BaseSeeder.refresh_table('user')
        for data in users.users:
            user = User.from_dict(data)
            user.password = data['password'] if 'password' in data else users.test_password
            db.session.add(user)
        db.session.commit()
