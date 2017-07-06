#!/usr/bin/env bash


sudo rm /etc/nginx/sites-enabled/default
sudo rm /etc/nginx/sites-available/unilab
sudo rm /etc/nginx/sites-enabled/unilab
sudo cp conf/local/nginx.conf /etc/nginx/sites-available/unilab
sudo ln -s /etc/nginx/sites-available/unilab /etc/nginx/sites-enabled/unilab
sudo /etc/init.d/nginx reload
