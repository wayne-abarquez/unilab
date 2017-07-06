#!/usr/bin/env bash

# app requirements
# sudo apt-get install -y python python-pip python-virtualenv python-dev

# sudo apt-get install -y postgresql-9.3 postgresql-9.3-postgis-2.1 postgresql-client-9.3

# sudo apt-get -y nginx

# required by psycopg2
# sudo apt-get -y install libpq-dev

# required by cGPolyEncode
# sudo apt-get -y install g++

# required by shapely
# sudo apt-get -y install libgeos-dev

# Uncomment dependencies above for fresh start

# create a virtual env to install libraries
virtualenv --no-site-packages venv

# enable virtual env
source venv/bin/activate

# install all requirements to virtual env
pip install -r requirements.txt
