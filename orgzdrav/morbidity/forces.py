from orgzdrav.direct import \
    ReadDirectForce,\
    CreateDirectForce,\
    UpdateDirectForce,\
    RemoveDirectForce


'''
Card
'''
from .proxys import \
    MorbidityCardProxy
# ...
class ReadMorbidityCard(ReadDirectForce):
    class Teta:
        limit = 20        
        model = MorbidityCardProxy

from .forms import \
    MorbidityCardForm

class CreateMorbidityCard(CreateDirectForce):
    class Teta:
        model = MorbidityCardProxy
        form = MorbidityCardForm

class UpdateMorbidityCard(UpdateDirectForce):
    class Teta:
        model = MorbidityCardProxy
        form = MorbidityCardForm

class RemoveMorbidityCard(RemoveDirectForce):
    class Teta:
        model = MorbidityCardProxy
        form = MorbidityCardForm

'''
Diagnosis
'''
from .proxys import MorbidityDiagnosisProxy
class ReadMorbidityDiagnosis(ReadDirectForce):
    class Teta:
        limit = 20        
        model = MorbidityDiagnosisProxy

'''
Organization
'''
from .proxys import MorbidityOrganizationProxy
class ReadMorbidityOrganization(ReadDirectForce):
    class Teta:
        limit = 20        
        model = MorbidityOrganizationProxy        

'''
Fio
'''
from .proxys import MorbidityFioProxy
class ReadMorbidityFio(ReadDirectForce):
    class Teta:
        limit = 20        
        model = MorbidityFioProxy

'''
Service
'''
from .proxys import MorbidityServiceProxy
class ReadMorbidityService(ReadDirectForce):
    class Teta:
        limit = 20        
        model = MorbidityServiceProxy                   