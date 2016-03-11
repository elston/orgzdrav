from orgzdrav.direct import DirectRouter

class Router(DirectRouter):

    def __init__(self):

        self.url = 'structure:router'
        self.enable_buffer = 100
        #...
        self.actions = {}     

                                
        
router = Router() 
