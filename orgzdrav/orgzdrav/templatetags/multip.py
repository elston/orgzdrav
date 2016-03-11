from django import template

register = template.Library()
@register.filter
def multip(v1,v2):
    return v1*v2
    
