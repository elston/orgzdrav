from django import template

register = template.Library()
@register.filter
def fromtempl(teml,arr):

    key,val = teml

    for item in arr:
        if item['diagnosis'] == key:
            return item['count']
    # ...
    # if not type(v).__name__=='tuple':
    #     return('')
    # ...
    return 0
