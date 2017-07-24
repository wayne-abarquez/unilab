from faker import Factory

fake = Factory.create('en_US')

test_password = 'unilabpoc'

users = [
    {
        'username': 'admin',
        'roleid': 1
    },
    {
        'username': 'usersales1',
        'roleid': 2
    },
    {
        'username': 'usersales2',
        'roleid': 2
    },
    {
        'username': 'usersales3',
        'roleid': 2
    }
]

for index, user in enumerate(users):
    user['firstname'] = fake.first_name().lower()
    user['lastname'] = fake.last_name().lower()
    user['password'] = test_password
    users[index] = user