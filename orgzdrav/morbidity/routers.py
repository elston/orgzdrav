from orgzdrav.direct import \
    DirectRouter,\
    DirectAction

from .forces import ReadMorbidityCard, CreateMorbidityCard, UpdateMorbidityCard, RemoveMorbidityCard
MorbidityCardActions = {
    'MorbidityCardAction':DirectAction((
        ('read',ReadMorbidityCard()),
        ('create',CreateMorbidityCard()),
        ('update',UpdateMorbidityCard()),
        ('remove',RemoveMorbidityCard()),
    )),
}

from .forces import ReadMorbidityDiagnosis
MorbidityDiagnosisActions = {
    'MorbidityDiagnosisAction':DirectAction((
        ('read',ReadMorbidityDiagnosis()),
    )),
}

from .forces import ReadMorbidityOrganization
MorbidityOrganizationActions = {
    'MorbidityOrganizationAction':DirectAction((
        ('read',ReadMorbidityOrganization()),
    )),
}

from .forces import ReadMorbidityFio
MorbidityFioActions = {
    'MorbidityFioAction':DirectAction((
        ('read',ReadMorbidityFio()),
    )),
}

from .forces import ReadMorbidityService
MorbidityServiceActions = {
    'MorbidityServiceAction':DirectAction((
        ('read',ReadMorbidityService()),
    )),
}

class Router(DirectRouter):

    def __init__(self):

        self.url = 'morbidity:router'
        self.enable_buffer = 100
        #...
        self.actions = {}     
        self.actions.update(MorbidityCardActions)
        self.actions.update(MorbidityDiagnosisActions)
        self.actions.update(MorbidityOrganizationActions)
        self.actions.update(MorbidityFioActions)        
        self.actions.update(MorbidityServiceActions)        
                                
        
router = Router() 
