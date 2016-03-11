from django import template

register = template.Library()
@register.filter
def get(d,val):
    if not type(d) == type({}):
        return ''    
    return d.get(str(val),'')
    
