#!/bin/bash
name=$1
psql --host=localhost --port=15432 --no-password --username=vagrant -d orgzdrav -t -A -F"," -c "select row_to_json(t) from (select * from orgzdrav_${name,,}) as t;" > ./data/$name.json