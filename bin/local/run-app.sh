#!/usr/bin/env bash


source venv/bin/activate
gunicorn -w 1 --preload -b 127.0.0.1:8000 run:app --log-level=DEBUG --timeout=120
