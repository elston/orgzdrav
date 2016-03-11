from django import template

register = template.Library()
@register.simple_tag
def ctot(d,name,attrs):
    v = 0
    if not type(d) == type({}):
        return 0    
    # ..
    for attr_name in attrs:
        n = '%s_%s'%(name,attr_name)
        v += d.get(n)
    # ..
    return v
    
