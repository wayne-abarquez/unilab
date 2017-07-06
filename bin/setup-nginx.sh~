#!/usr/bin/env bash

sudo rm /etc/nginx/sites-enabled/default
sudo rm /etc/nginx/sites-available/solar
sudo rm /etc/nginx/sites-enabled/solar
sudo cp conf/solar_nginx.conf /etc/nginx/sites-available/solar
sudo ln -s /etc/nginx/sites-available/solar /etc/nginx/sites-enabled/solar
sudo /etc/init.d/nginx reload