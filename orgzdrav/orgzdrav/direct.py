# -*- coding: utf-8 -*-
import logging
log = logging.getLogger(__name__)

import uuid
from itertools import chain
from django.core.exceptions import SuspiciousOperation
from django.db import transaction

from django.utils.dateparse import parse_datetime
from orgzdrav.utils import load_datetime, parse_date,  make_text_json


from django.contrib.contenttypes.models import ContentType

from django.http import HttpResponse
from django.core.urlresolvers import reverse
from inspect import getargspec
from django.core.serializers.json import DjangoJSONEncoder
import json

class DirectRouterJSONEncoder(json.JSONEncoder):
    """
    JSON Encoder for DirectRouter
    """
    
    def __init__(self, url_args, url_kwargs, *args, **kwargs):
        self.url_args = url_args
        self.url_kwargs = url_kwargs
        super(DirectRouterJSONEncoder, self).__init__(*args, **kwargs)
    
    def _encode_action(self, o):
        output = []
        for method in dir(o):
            if not method.startswith('_'):
                f = getattr(o, method)
                data = dict(name=method, len=getattr(f, '_args_len', 0))
                if getattr(f, '_form_handler', False):
                    data['formHandler'] = True
                output.append(data) 
        return output        
    
    def default(self, o):
        if isinstance(o, DirectRouter):
            output = {
                'type': 'remoting',
                'url': reverse(o.url, args=self.url_args, kwargs=self.url_kwargs),
                'enableBuffer': o.enable_buffer,
                'actions': {}
            }
            for name, action in o.actions.items():
                output['actions'][name] = self._encode_action(action)
            return output
        else:
            return super(DirectRouterJSONEncoder, self).default(o)

class DirectExceptionEvent(Exception):
    """
    This exception is sent to server as Ext.Direct.ExceptionEvent.
    So we can handle it in client and show pretty message for user.
    """
    pass

class DirectRouter(object):
    """
    Router for Ext.Direct calls.
    """
    
    def __init__(self, url, actions={}, enable_buffer=True):
        self.url = url
        self.actions = actions
        self.enable_buffer = enable_buffer    

    def api(self, request, *args, **kwargs):
        """
        This method is view that send js for provider initialization.
        Just set this in template after ExtJs including:
        <script src="{% url api_url_name %}"></script>  
        """
        obj = json.dumps(self, cls=DirectRouterJSONEncoder, url_args=args, url_kwargs=kwargs)         
        return HttpResponse('Ext.Direct.addProvider(%s)' % obj,content_type ="text/javascript") 

    def __call__(self, request, *args, **kwargs):
        """
        This method is view that receive requests from Ext.Direct.
        """
        user = request.user
        POST = request.POST
    
        if POST.get('extAction'):
            #This is request from Ext.form.Form
            requests = {
                'action': POST.get('extAction'),
                'method': POST.get('extMethod'),
                'data': [POST],
                'upload': POST.get('extUpload') == 'true',
                'tid': POST.get('extTID')
            }
    
            if requests['upload']:
                #This is form with files
                requests['data'].append(request.FILES)
                output = json.dumps(self.call_action(requests, user))
                return HttpResponse('<textarea>%s</textarea>' \
                                    % output)
        else:

            try:
#                requests = json.loads(request.POST.keys()[0])
#                requests = json.loads(request.body)
                requests = json.loads(request.read().decode("utf-8"))
#            except (ValueError, KeyError):
            except (ValueError, KeyError,IndexError):
                requests = []
                            
        if not isinstance(requests, list):
                requests = [requests]
            
        output = [self.call_action(rd, request, *args, **kwargs) for rd in requests]
            
        return HttpResponse(json.dumps(output, cls=DjangoJSONEncoder), content_type="application/json")    
    
    def action_extra_kwargs(self, action, request, *args, **kwargs):
        """
        Check maybe this action get some extra arguments from request
        """
        if hasattr(action, '_extra_kwargs'):
            return action._extra_kwargs(request, *args, **kwargs)
        return {}
    
    def extra_kwargs(self, request, *args, **kwargs):
        """
        For all method in ALL actions we add request.user to arguments. 
        You can add something else, request for example.
        For adding extra arguments for one action use action_extra_kwargs.
        """
        return {
            'user': request.user,
#            'organization': request.organization,
        }

    def rd_extra_kwargs(self, rd, *args, **kwargs):
        return {
            'method': rd['method'],
        }

    def call_action(self, rd, request, *args, **kwargs):
        """
        This method checks parameters of Ext.Direct request and call method of action.
        It checks arguments number, method existing, handle RpcExceptionEvent and send
        exception event for Ext.Direct.
        """
        method = rd['method']
        
        if not rd['action'] in self.actions:
            return {
                'tid': rd['tid'],
                'type': 'exception',
                'action': rd['action'],
                'method': method,
                'message': 'Undefined action class'
            }
        
        action = self.actions[rd['action']]
        args = rd.get('data') or []
        func = getattr(action, method)

        extra_kwargs = self.extra_kwargs(request, *args, **kwargs)
        extra_kwargs.update(self.action_extra_kwargs(action, request, *args, **kwargs))
        extra_kwargs.update(self.rd_extra_kwargs(rd, *args, **kwargs))        
        
        func_args, varargs, varkw, func_defaults = getargspec(func)
        func_args.remove('self')
        for name in extra_kwargs.keys():
            if name in func_args:
                func_args.remove(name)
        
        required_args_count = len(func_args) - len(func_defaults or [])
        if (required_args_count - len(args)) > 0 or (not varargs and len(args) > len(func_args)):
            return {
                'tid': rd['tid'],
                'type': 'exception',
                'action': rd['action'],
                'method': method,
                'message': 'Incorrect arguments number'
            }
        
        try:
            return {
                'tid': rd['tid'],
                'type': 'rpc',
                'action': rd['action'],
                'method': method,
                'result': func(*args, **extra_kwargs)
            }
        except DirectExceptionEvent as ex:
            e = ex.args
            return {
                'tid': rd['tid'],
                'type': 'exception',
                'action': rd['action'],
                'method': method,
                'message': unicode(e)
            }            



class DirectAction(object):
    def __init__(self,forces):
        self.forces = forces
            
    def read(self,rdata,**kwargs):
        force = dict(self.forces).get('read')
        return force.go(rdata=rdata,**kwargs)
    read._args_len = 1             

    def create(self,rdata,**kwargs):
        force = dict(self.forces).get('create')
        with transaction.atomic():                            
            try:
                return force.go(rdata=rdata,**kwargs)
            except SuspiciousOperation as ex:
                e = ex.args
                transaction.rollback()
                return dict(success=False,data={},message=str(e)) 
    create._args_len = 1  
    
    def update(self,rdata,**kwargs):
        force = dict(self.forces).get('update')
        with transaction.atomic():                            
            try:
                return force.go(rdata=rdata,**kwargs)
            except SuspiciousOperation as ex:
                e = ex.args
                transaction.rollback()                
                return dict(success=False,data={},message=str(e))                   
    update._args_len = 1  

    def remove(self,rdata,**kwargs):
        force = dict(self.forces).get('remove')
        with transaction.atomic():    
            try:                      
                return force.go(rdata=rdata,**kwargs)
            except SuspiciousOperation as ex:                      
                e = ex.args
                transaction.rollback()  
                return dict(success=False,data={},message=str(e))                                         
    remove._args_len = 1  


class DirectForce(object):

    class Teta:
        model = None
        form = None
        couples = ()
        limit = 0

    def __init__(self, master=None,**kwargs):
        self.master = master

    def go(self,**kwargs):
        pass

    def tetafields(self,model,name):
        ret = []
        teta = getattr(model,'Teta',None)
        if teta:
            fields = getattr(teta,name,None)
            if fields:
                ret += list(fields)
                #...
            superfields = self.tetafields(model.__base__,name)
            if superfields:
                ret += superfields
        #...
        return list(set(ret))
    
    def excludes(self,rdata):
        data = rdata.get('data')        
        ret = {}
        #...
        fields = [field.name for field in self.Teta.model._meta.fields if field.name not in self.tetafields(self.Teta.model,'exclude') ]        
        fields = [field for field in data.keys() if field in list(fields)]
        for field in fields:
            ret.update({'%s'%field:data.get(field)})
        #..
        return ret

    def contenttypes(self):
        return {'contenttype':ContentType.objects.get_for_model(self.Teta.model).pk}

    def objs(self,rdata):
        ret = {}
        fields = getattr(self.Teta.model.Teta,'obj',[])
        for field in list(fields):
            obj = rdata.get('data').get(field)
            if obj:
                obj = obj.get('id')
            ret.update({field:obj})
            
        return ret   


    def dates(self,rdata):
        ret = {}
        fields = getattr(self.Teta.model.Teta,'datetime',[])
        for field in list(fields):
            date = None
            sdate = rdata.get('data').get(field)
            if sdate:
                date = parse_datetime(sdate)
            if not date:
                date = parse_date(sdate)                
            if not date:                
                date = load_datetime(sdate,'%Y-%m-%d %H:%M %z')
            if not date:
                sos = 'not parse date %s (%s)'%(sdate, '14cab314-4502-4602-b980-20b045690e8b')
                print(sos)
                raise SuspiciousOperation(sos)   
            #..                
            ret.update({field:date})
        return ret        

    def sessions(self,**kwargs):
        ret = {}
        fields = getattr(self.Teta.model.Teta,'session',[])
        for field in list(fields):
            value = kwargs.get(field)
            ret.update({field:value.id})
        return ret   

    def manytomanies(self,rdata):
        data = rdata.get('data')
        ret = {}
        fields = getattr(self.Teta.model.Teta,'manytomany',[])
        for field in list(fields):
            items = data.get(field)
            ret.update({'%s'%field:[uuid.UUID(item.get('id')) for item in items]})
        return ret   

    def jsones(self,rdata):
        data = rdata.get('data')
        ret = {}
        fields = getattr(self.Teta.model.Teta,'jsonfield',[])
        for field in list(fields):
            items = data.get(field)
            ret.update({
                '{}'.format(field):json.dumps(items),
            })
        return ret   

    def autoset(self):
        fields = getattr(self.Teta.model.Teta,'auto_set',None)        
        if fields:
            return dict(fields)
        return {}
    #.......................................................
    @staticmethod
    def fieldsing(func):
        def warp(self,**kwargs):
            ret = func(self,**kwargs)
            #...
            fields = list(set(self.Teta.model.fieldset()))               
            #...
            ret.update({
                'fields':fields,            
            })
            return ret
        return warp

    @staticmethod      
    def coupling(func):
        def warp(self,**kwargs):
            master = func(self,**kwargs)
            #...
            if hasattr(self.Teta,'couples'):
                for ForceClass in list(self.Teta.couples):
                    force = ForceClass(master=master)
                    force.go(**kwargs)
            return  master
        return warp
    
    @staticmethod    
    def saving(func):
        def warp(self,**kwargs):
            this = func(self,**kwargs)
            form = self.Teta.form(**this)          
            if not form.is_valid():
                print(self.Teta.form, form.errors,  '3af7a1eb-5bf7-4aa7-9cf2-3fe2b6808266')
                raise SuspiciousOperation(form.errors)                    
            #..
            return form.save()
        return warp
    
    @staticmethod    
    def responsing_cu(func):
        def warp(self,**kwargs):
            instance = func(self,**kwargs)
#            obj = self.Teta.model.recordget(instance=instance,**kwargs)
            obj = self.Teta.model.recordget(pk=instance.pk,**kwargs)            
            data = obj.record(**kwargs)
            #...
            return {
                'success':True,
                'data':data,
            }
        return warp


    @staticmethod
    def responsing_rd(func):
        def warp(self,**kwargs):
            ret = func(self,**kwargs)
            #...
            return {
                'metaData': {
                    'idProperty': 'id',
                    'root': 'data',
                    'totalProperty': 'total_count',
                    'successProperty': 'success',
                    'fields': ret.get('fields'),
                },
                'success':True,
                'data':ret.get('data'),
                'total_count':ret.get('total_count'),      
             }  
        return warp



class ReadDirectForce(DirectForce):
    
    @DirectForce.responsing_rd
    @DirectForce.fieldsing    
    def go(self,**kwargs):
        rdata = kwargs.get('rdata')
        #...
        start = int(rdata.get('start', 0))
        limit = int(rdata.get('limit', getattr(self.Teta,'limit',None)))
        #...
        qs =  list(self.Teta.model.recordset(**kwargs))
        data = [item.record(**kwargs) for item in qs[start:start + (limit or len(qs))]]         

        return {
            'data':data,
            'total_count':len(qs),
        }

class CreateDirectForce(DirectForce):  
                        
    @DirectForce.responsing_cu
    @DirectForce.coupling
    @DirectForce.saving
    def go(self,**kwargs):
        rdata = kwargs.get('rdata') 
        #...
        data = self.excludes(rdata)
        data.update(self.objs(rdata))
        data.update(self.dates(rdata))
        data.update(self.contenttypes())
        data.update(self.sessions(**kwargs))
        data.update(self.manytomanies(rdata))
        data.update(self.autoset())
        data.update(self.jsones(rdata))        
        #..
        return {
            'data':data,
        }  

class UpdateDirectForce(DirectForce):
                        
    @DirectForce.responsing_cu
    @DirectForce.coupling
    @DirectForce.saving
    def go(self,**kwargs):
        rdata = kwargs.get('rdata')
        instance = self.Teta.model.objects.get(pk=rdata['data']['id'])
        #...
        data = self.excludes(rdata)      
        data.update(self.objs(rdata))         
        data.update(self.dates(rdata))
        data.update(self.contenttypes())
        data.update(self.sessions(**kwargs))
        data.update(self.manytomanies(rdata))
        data.update(self.autoset())
        data.update(self.jsones(rdata))

        #..
        return {
            'data':data,
            'instance':instance,
        }        
    
class RemoveDirectForce(DirectForce):  
    #...
    def go(self,**kwargs):
        #...
        rdata = kwargs.get('rdata')        
        user = kwargs.get('user')                
        #...
        pk = rdata.get('data')
#        instance = get_object_or_None(self.Teta.model, pk=pk)
#        record = instance.record(**kwargs)
#        instance =  self.Teta.model.objects.get(pk=pk)                                                
        instance = self.Teta.model.recordget(pk=pk,**kwargs)
        record = instance.record(**kwargs)
        #...
        obj_fields = self.tetafields(instance.__class__,'obj')        
        for field in obj_fields:
            obj = record.get(field)
            if obj:
                pk = obj.get('id')
            record.update({field:pk})
        #...
        log.debug('')
        log.debug('------------------!!!DELETE ACTION!!!--------------------------')
        log.debug(u'%s: %s'%('USER',user))
        log.debug(u'%s: %s'%('MODEL',self.Teta.model))
        log.debug(u'%s: %s'%('RDATA',rdata))
        log.debug(u'%s: %s'%(u'DATA',u'{'+u', '.join([u"%s: %s" % (k, v) for k, v in record.items()])+u'}'))
        log.debug('')

        if isinstance(pk, list):
            log.debug('------------------!!!DELETE ACTION IS BRAKE!!!--------------------------')            
            return dict(success=False,data=[],message={u'ошибка':u'удаление прервано'})
        
#        try:
#            instance.delete()
#            return dict(success=True,data=[])    
#        except SuspiciousOperation:
#            pass
#        return dict(success=False,\
#            data=rdata.get('data'),\
#            message={u'непредвиденная_ошибка':u'обновите форму'})               

        instance.delete()
        return dict(success=True,data=[])    



class ComplexDirectForce(DirectForce):  
                        
    def go(self,**kwargs):
        pass        
