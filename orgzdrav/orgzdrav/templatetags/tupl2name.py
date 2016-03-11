from django import template


register = template.Library()
@register.filter
def tupl2name(v):

    if v == None or v=='': 
        return('')
    # ...
    if not type(v).__name__=='tuple':
        return('')
    # ...
    key, value = v
    #...
    return value
