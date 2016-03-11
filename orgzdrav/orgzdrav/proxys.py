import json
from django.db.models import Q    
from django.core.exceptions import SuspiciousOperation

from .utils import make_text, make_text_json
from .abstracts import PgModel, EnumModel


from .models import Fio
class FioProxy(Fio,PgModel):
    class Meta:
        proxy = True  

    @classmethod
    def fieldset(klass,**kwargs):
        return [
            'id',
            'fio',
        ] 

    def record(self,**kwargs):
        return {
            'id':str(self.id),
            'fio':self.fio,
        }

    @classmethod
    def recordset(klass,rdata=None,user=None,organization=None,**kwargs):
        args = qs = []
        # ..
        query = rdata.get('query', '') 
        if query:
            args += [Q(fio__istartswith=query)]

        #...              
        qs = klass.objects.all()\
            .filter(*args)\
            .order_by('fio',)
        
        #...
        return qs  


from .models import Organization
class OrganizationProxy(Organization,PgModel):
    class Meta:
        proxy = True  

    @classmethod
    def fieldset(klass,**kwargs):
        return [
            'id',
            'name',
            'fullname',
            'departments',
            'is_perinatalcenter',
            'lavelmz'
        ] 

    def record(self,**kwargs):
        return {
            'id':str(self.id),
            'name':self.name,
            'fullname':self.fullname,            
            'departments':self.departments,            
            'is_perinatalcenter':self.is_perinatalcenter,
            'lavelmz':self.lavelmz,
        }

    @classmethod
    def recordset(klass,rdata=None,user=None,organization=None,**kwargs):
        args = qs = []
        args += [Q(users__pk=str(user.pk))]
        # ..
        query = rdata.get('query', '') 
        if query:
            args += [Q(fullname__icontains=query)]

        #...              
        qs = klass.objects.all()\
            .filter(*args)\
            .order_by('fullname',)
        
        #...
        return qs   

from .models import Diagnosis        
class DiagnosisProxy(Diagnosis,PgModel):
    class Meta:
        proxy = True  

    @classmethod
    def fieldset(klass,**kwargs):
        return [
            'id',
            'name',
            'fields',
        ] 

    def record(self,**kwargs):
        return {
            'id':self.id,
            'name':self.name,            
            'fields':self.fields,            
        }

    @classmethod
    def recordset(klass,rdata=None,user=None,organization=None,**kwargs):
        qs = []
        query = rdata.get('query', '')    
        exclude = rdata.get('exclude', [])
        include = rdata.get('include', [])
        #...              
        qs = klass.objects.all()\
            .filter(name__icontains=query)\
            .order_by('name',)
        #...
        if exclude:
            qs = qs.exclude(id__in=exclude);
        # ...
        if include:
            qs = qs.filter(id__in=include);            
        # ...
        return qs      

from .models import Service        
class ServiceProxy(Service,PgModel):
    class Meta:
        proxy = True  

    @classmethod
    def fieldset(klass,**kwargs):
        return [
            'id',
            'name',
            'fields',
        ] 

    def record(self,**kwargs):
        return {
            'id':self.id,
            'name':self.name,            
            'fields':self.fields,            
        }

    @classmethod
    def recordset(klass,rdata=None,user=None,organization=None,**kwargs):
        qs = []
        query = rdata.get('query', '')    
        exclude = rdata.get('exclude', [])
        include = rdata.get('include', [])
        #...              
        qs = klass.objects.all()\
            .filter(name__icontains=query)\
            .order_by('name',)
        #...
        if exclude:
            qs = qs.exclude(id__in=exclude);
        # ...
        if include:
            qs = qs.filter(id__in=include);            
        # ...
        return qs      

from .models import User
class UserProxy(User,PgModel):       

    class Meta:
        proxy = True  

    @classmethod
    def fieldset(klass,**kwargs):
        return [
            'id',
            'username',
            'last_name',
            'first_name',
            'mid_name',
            'is_admin',
            'is_staff',
            'is_active',
            'is_superuser',
        ] 

    def record(self,**kwargs):
        return {
            'id': self.pk,
            'username':self.username,
            'last_name':self.last_name,
            'first_name':self.first_name,
            'mid_name':self.mid_name,                    
            'is_admin':self.is_admin,                                
            'is_staff':self.is_staff,                                
            'is_active':self.is_active,                                
            'is_superuser':self.is_superuser, 
        }


from .models import Card
class CardProxy(Card,PgModel):       

    class Meta:
        proxy = True  

    class Teta:    
        datetime = ('birthday',)
        jsonfield = ('organization','cardname','store',)

    @classmethod
    def fieldset(klass,**kwargs):
        return [
            'id',
            'fio',
            'birthday',
            'organization',
            'cardname',
            'store',
        ] 

    def record(self,**kwargs):
        return {
            'id':str(self.id),    
            'fio':self.fio,
            'birthday':self.birthday,
            'organization':self.organization,
            'cardname':self.cardname,
            'store':self.store,
        }

    @classmethod
    def recordset(klass,rdata=None,user=None,organization=None,**kwargs):
        #...
        args = []    
        #...
        organization = rdata.get('organization', None);
        # print(organization)
        if organization:
            args += [Q(organization__id=organization['id'])]    
        else:
            return []
        # ...
#        name = rdata.get('name', None)
#        if name:
#            args += [Q(name__icontains=name)]    

        #...      
        qs = klass.objects.filter(*args)
        return qs         


from .models import CardName
class CardNameProxy(CardName,EnumModel):
    pass