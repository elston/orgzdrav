# from django.core.exceptions import SuspiciousOperation
# from .utils import load_datetime
# import json

# from .direct import \
#     ComplexDirectForce

# from .models import \
#     CardBook

# from .forms import \
#     CardBookForm    

# class CardBookComplexForce(ComplexDirectForce):
#     class Teta:
#         model = CardBook
#         form = CardBookForm

#     def go(self,rdata=None,**kwargs):

#        if self.master:
#            #..
#            data = rdata['data']
#            patientbooks = data.get('patientbooks',[])
#            records = [item for item in patientbooks if item.get('dirty',None)]                
#            for item in records:
#                this = {
#                    'data':{
#                        'datetime':load_datetime(item['datetime'],'%Y-%m-%d %H:%M %z'),
#                        'patientcard':self.master.pk,            
#                        #...
#                        'diagnoses':json.dumps(item['diagnoses']),
#                    },
#                }
#                print(this['data']['diagnoses'])
#                #...
#                id = item.get('id',None)                    
#                if id:
#                    record =  self.Teta.model.objects.get(id=id)                                                
#                    this['instance'] = record
#                #...
#                form = self.Teta.form(**this)
#                if not form.is_valid():
#                #     print(self.Teta.form, form.errors, ' 500e72b1-552c-428a-b3ae-c9d66ea18235')
#                    raise SuspiciousOperation('form.errors')  
#                #..
#                form.save()
               
#            removed_ids = [item['id'] for item in patientbooks if item.get('removty',False)==True]            
#            if removed_ids:
#                removed_qs = self.Teta.model.objects.filter(id__in=removed_ids)
#                removed_qs.delete()
