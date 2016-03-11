# from orgzdrav.abstracts import EnumModel

# class TimelineInOut(EnumModel):

#     class Meta:
#         BASE = (
#             (1,'in','поступила','tick'),
#             (2,'out','выписана','cross'),    
#         ) 
#         TUPLE = tuple([(id,name) for lavel,id,name,icon in list(BASE)])  

# class TimelineVerify(EnumModel):

#     class Meta:
#         BASE = (
#             (1,'abs','не проверен','exclamation'),
#             (2,'cns','проверен','information'),
#             (3,'apr','утвержден','accept'),
#         ) 
#         TUPLE = tuple([(id,name) for lavel,id,name,icon in list(BASE)]) 
