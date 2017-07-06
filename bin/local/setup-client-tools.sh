#!/usr/bin/env bash

# This is for Development Only

# install nodejs, npm for gulp
sudo apt-get install nodejs
sudo apt-get install npm

# then install gulp globally
sudo npm install gulp -g

# install bower globally
sudo npm install -g bower
# Fix bower location issue
sudo ln -s /usr/bin/nodejs /usr/bin/node

