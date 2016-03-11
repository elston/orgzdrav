#!/bin/bash

sudo echo "deb http://apt.postgresql.org/pub/repos/apt/ trusty-pgdg main" > /etc/apt/sources.list.d/pgdg.list
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get install -y postgresql-9.4 postgresql-server-dev-9.4 \
    build-essential \
    python-dev python3.4 python3.4-dev python-pip python3-pip\
    mc mercurial
sudo pip install --upgrade pip virtualenv

sudo pip install virtualenvwrapper
echo '....................Install OK'


#sudo echo " " >> /etc/postgresql/9.4/main/pg_hba.conf
#sudo echo "local    all  django   md5" >> /etc/postgresql/9.4/main/pg_hba.conf
#sudo echo "host all all 0.0.0.0/0 trust" >> /etc/postgresql/9.4/main/pg_hba.conf
sudo cp /vagrant/pg_hba.conf /etc/postgresql/9.4/main/
#..
sudo echo " " >> /etc/postgresql/9.4/main/postgresql.conf
sudo echo "listen_addresses = '*'" >> /etc/postgresql/9.4/main/postgresql.conf
#..
sudo /etc/init.d/postgresql restart
echo '....................postgresql OK'
#..

sudo -u postgres createdb vagrant
sudo -u postgres psql -c "CREATE USER vagrant WITH SUPERUSER PASSWORD '';"
sudo -u postgres psql -c "CREATE USER django WITH PASSWORD 'django';"
#...
sudo -u postgres createdb orgzdrav
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE orgzdrav TO django;"
echo '....................katrin base OK'
#...

#...
touch /home/vagrant/.bashrc
echo " " >> /home/vagrant/.bashrc
echo "source /usr/local/bin/virtualenvwrapper.sh" >> /home/vagrant/.bashrc
sudo -u vagrant bash -c "
    export HOME=/home/vagrant/
    source /usr/local/bin/virtualenvwrapper.sh
    mkvirtualenv -p /usr/bin/python3 orgzdrav
    mkdir -p /vagrant/static/orgzdrav
"
#
mkdir /vagrant/orgzdrav/logs
echo '' > /vagrant/orgzdrav/logs/django.log
#...
sudo apt-get autoremove
sudo apt-get autoclean
echo 'YaHoo !!!'

#./manage.py runserver 0.0.0.0:8000
