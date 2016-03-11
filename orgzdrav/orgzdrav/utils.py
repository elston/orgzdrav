
import re

from datetime import date,datetime, timedelta
from pytz import timezone, utc
from pytz.tzinfo import StaticTzInfo

reuuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

class OffsetTime(StaticTzInfo):
    def __init__(self, offset):
        """A dumb timezone based on offset such as +0530, -0600, etc.
        """
        hours = int(offset[:3])
        minutes = int(offset[0] + offset[3:])
        self._utcoffset = timedelta(hours=hours, minutes=minutes)

def load_datetime(value, format):
    if format.endswith('%z'):
        format = format[:-2]
        offset = value[-5:]
        value = value[:-5]
        return OffsetTime(offset).localize(datetime.strptime(value, format))

    return datetime.strptime(value, format)

def dump_datetime(value, format):
    return value.strftime(format)




date_exps = (
    r'(?P<year>\d{4})-(?P<month>\d{1,2})-(?P<day>\d{1,2})$',
    r'(?P<day>\d{1,2})-(?P<month>\d{1,2})-(?P<year>\d{4})$',    
    r'(?P<day>\d{1,2})\.(?P<month>\d{1,2})\.(?P<year>\d{4})$',        
    r'(?P<day>\d{1,2})\.(?P<month>\d{1,2})\.(?P<year>\d{2})$',            
    r'(?P<day>\d{1,2})/(?P<month>\d{1,2})/(?P<year>\d{4})$',            
    r'(?P<day>\d{1,2})/(?P<month>\d{1,2})/(?P<year>\d{2})$',                
)


def parse_date(value):
    if value:
        for exp_re in list(date_exps):
            date_re = re.compile(exp_re)        
            match = date_re.match(value)
            if match:
                kw = dict((k, int(v)) for k, v in match.groupdict().iteritems())
                return date(**kw)            
    return None
    
def make_text(text):
    text = text if text else ''
    return text.replace("__comma__","'")\
            .replace("__ravno__","=")\
            .replace("__doubldot__",":")\
            .replace("__dotcomma__",";")\
            .replace("__probel__","&nbsp;")\
            .replace("__doublecomma__",'"')               

# def make_text_json_old(text):
#     text = text or ''
#     text = re.sub("(\r\n|\n|\r|\t)", ' ', text)
#     text = text.replace("'",'__comma__')            
#     text = text.replace('"','__doublecomma__') 
#     text = text.replace("__jsondlm__",'"')         
#     return text

#def make_text_json(text):
#    text = text or ''
#    text = re.sub("(\r\n|\n|\r|\t)", ' ', text)
#    text = text.replace("'",'@comma@')            
#    text = text.replace('"','@doublecomma@')                
#    text = text.replace("____",'"')   
#    return text

def make_text_json(text):
    #..
    return re.sub("(\r\n|\n|\r|\t)", ' ', text or '')\
        .replace("'",'@comma@')\
        .replace('"','@doublecomma@')\
        .replace("____",'"')

def sort(d):
    keys = d.keys()
    keys.sort()
    return [[item,d[item]] for item in keys]        
    

def fmap(l):
    return map(lambda x: [x[0],x[1:]],l)  

def fdict(vl):
    d = {}
    for k, v in vl:
        d.setdefault(k, []).append(v)
    return d

def fstruct(l):
    return sort(fdict(fmap(l)))  

def normcode(code):
    v = '%s'%code
    return v if len(v)>1 else '%s%s'%('0',code)  


def p(v1,v2):
    if not v2:
        return 0
    v = v1/v2
    return v if v < 1 else 1

def quarter(v):
    if v in [1,2,3,4]:
        return 1
    elif v in [5,6,7,8]:
        return 2        
    elif v in [9,10,11,12]:
        return 3
    return 0            

def dictfetchall(cursor):
    "Returns all rows from a cursor as a dict"
    desc = cursor.description
    return [ dict(zip([col[0] for col in desc], row)) for row in cursor.fetchall()  ]


def u(id,valuesiter,ds_total):
    # ...
    fn = lambda x: x[id]
    f2 = lambda x: sum([x[n] for n in id])
    # ..
    if type(id)==list:        
        fn = f2
    # ...
    v1 = sum(map(fn,valuesiter))
    v2 = sum(map(lambda x: sum([x[y] for y in ds_total]),valuesiter))
    # 
    v =  round(v1/v2,2) if v2>0 else 0    
    # ..
    return v

def m(id,valuesiter):
    fn = lambda x: x[id]
    f2 = lambda x: sum([x[n] for n in id])
    # ..
    if type(id)==list:        
        fn = f2
    v1 = (sum(map(fn,valuesiter)) *1000)
    v2 = sum(map(lambda x:x['rodi'] ,valuesiter))
    # ...
    v =  round(v1/v2,2) if v2>0 else 0

    return v

def s(id,valuesiter):
    fn = lambda x: x[id]
    f2 = lambda x: sum([x[n] for n in id])
    # ..
    if type(id)==list:        
        fn = f2
    # ...
    v = sum(map(fn,valuesiter))

    return v

def d(ds_total,ds_list,valuesiter):
    d = {}
    for i,j in ds_list:
        d[i] = s(j,valuesiter,)
        d['u'+i] = u(j,valuesiter,ds_total)
        d['m'+i] = m(j,valuesiter)
    return d

def da(i_fields,j_fields,valuesiter):
    val = {}
    for i_name,i_field in i_fields:
        for j_name, j_field in j_fields:
            name = '%s_%s'%(i_name,j_name)
            val[name] = s(name,valuesiter)
    # ..
    return val


def concat(d1,d2):
    d = {}
    d.update(d1)
    d.update(d2)        
    return d    