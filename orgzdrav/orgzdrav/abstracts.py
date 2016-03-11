# -*- coding: utf-8 -*-

import json
# from django.db import models
from django.core.exceptions import SuspiciousOperation


from orgzdrav.utils import make_text, make_text_json


class Model(object):
    pass

class PgModel(Model):
    
    @classmethod
    def recordget(klass,pk=None,**kwargs):
        #...
        obj = klass.recordset(**kwargs).filter(pk=pk)
        if len(obj)>1:
            raise SuspiciousOperation('77e84852-5a4b-421a-af59-6356c77809b0')                                
        #..
        return obj[0]

class EnumModel(Model):

    @classmethod
    def all(klass):
        return klass.data
   