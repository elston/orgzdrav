#!/bin/bash
./manage.py dumpdata orgzdrav.$1 --indent 1 --output $2.json
