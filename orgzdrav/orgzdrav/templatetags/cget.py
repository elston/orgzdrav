from django import template

register = template.Library()
@register.simple_tag
def cget(d,*vals):
    v = '_'.join(vals)
    if not type(d) == type({}):
        return ''    
    return d.get(str(v),'')
    
