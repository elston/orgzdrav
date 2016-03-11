import os
import csv
from django.core.management.base import BaseCommand, CommandError
from orgzdrav.settings import BASE_DIR
from orgzdrav.models import Fio

class Command(BaseCommand):
   
    @classmethod
    def touch(klass,name):
        return '%s%s'%(name[1],name[2:len(name)].lower())

    def handle(self, *args, **options):
        # ...
        csvfile = os.path.join(BASE_DIR, '../csv/fio.csv')
        table = csv.reader(open(csvfile,'r'), delimiter=",")               
        # ...
        for row in table:
            famaly = Command.touch(row[0])
            name = Command.touch(row[1])
            otch = Command.touch(row[2])
            # ..
            fio = '%s %s %s'%(famaly,name,otch)
            print(fio)
            # ..
            fio = Fio(fio=fio)
            try:
                fio.save()
            except Exception as e:
                print(e)
            
       # dirList=os.listdir(pathdir)
