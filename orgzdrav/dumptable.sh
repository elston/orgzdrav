#!/bin/bash
name=$1
psql -d orgzdrav -t -A -F"," -c "select row_to_json(t) from (select * from orgzdrav_${name,,}) as t;" > ../data/__z__$name.json