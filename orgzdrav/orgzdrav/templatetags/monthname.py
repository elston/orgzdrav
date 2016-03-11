from django import template


monthdic = {
    1:'январь',
    2:'февраль',
    3:'март',
    4:'апрель',
    5:'май',
    6:'июнь',
    7:'июль',
    8:'август',
    9:'сентябрь',
    10:'октябрь',
    11:'ноябрь',
    12:'декабрь'
}

register = template.Library()
@register.filter
def monthname(v):

    if v == None or v=='': 
        return('')
    # ...
    # if not type(v).__name__=='tuple':
    #     return('')
    # ...
    return monthdic[v]
