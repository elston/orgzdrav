#!/bin/bash
./dumptable.sh App
./dumptable.sh Diagnosis
./dumptable.sh Organization
./dumptable.sh Fio
./dumptable.sh Card

./manage.py dumpdata orgzdrav.App --indent 1 --output App.json
./manage.py dumpdata orgzdrav.Diagnosis --indent 1 --output Diagnosis.json
./manage.py dumpdata orgzdrav.Organization --indent 1 --output Organization.json
./manage.py dumpdata orgzdrav.Fio --indent 1 --output Fio.json
./manage.py dumpdata orgzdrav.Card --indent 1 --output Card.json

rm -r ./orgzdrav/migrations
dropdb orgzdrav
createdb orgzdrav

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE orgzdrav TO django;"
./__manage.py makemigrations orgzdrav
./__manage.py migrate
./manage.py createsuperuser
./manage.py loaddata Diagnosis.json
./manage.py loaddata App.json
./manage.py loaddata Organization.json
./manage.py loaddata Fio.json
./manage.py loaddata Card.json
./manage.py runserver 0.0.0.0:8000
