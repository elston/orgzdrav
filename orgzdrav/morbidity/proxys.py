from orgzdrav.proxys import CardProxy
class MorbidityCardProxy(CardProxy):       
    class Meta:
        proxy = True  



from orgzdrav.proxys import DiagnosisProxy
class MorbidityDiagnosisProxy(DiagnosisProxy):
    class Meta:
        proxy = True  


from orgzdrav.proxys import OrganizationProxy
class MorbidityOrganizationProxy(OrganizationProxy):
    class Meta:
        proxy = True          

from orgzdrav.proxys import FioProxy
class MorbidityFioProxy(FioProxy):
    class Meta:
        proxy = True  


from orgzdrav.proxys import ServiceProxy
class MorbidityServiceProxy(ServiceProxy):
    class Meta:
        proxy = True          