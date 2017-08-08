#!/usr/bin/env bash

sudo rm /etc/supervisor/conf.d/unilab.conf
sudo cp conf/supervisord.conf /etc/supervisor/conf.d/unilab.conf
sudo supervisorctl reread
sudo supervisorctl update
