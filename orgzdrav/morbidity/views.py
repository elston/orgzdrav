import json
#...
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from orgzdrav.settings import STATIC_URL
from django.shortcuts import get_object_or_404
#...
from orgzdrav.proxys import UserProxy, OrganizationProxy, CardNameProxy
#...

@login_required
def index(request):
    user_pk = request.user.pk
    user = get_object_or_404(UserProxy,pk=user_pk)
    USER_OBJ = json.dumps(user.record())
    # ...
    ORG_OBJ = {}
    # org = user.organizations.order_by('name').first()
    org = OrganizationProxy.objects.filter(users__pk=str(user_pk)).order_by('name').first()
    if org:
        ORG_OBJ = json.dumps(org.record())
    # ..
    cardnames = CardNameProxy.all()
    CARD_NAMES =  json.dumps(cardnames)
    # ..
    context = {
        'STATIC_URL': STATIC_URL,
        'USER_OBJ':USER_OBJ,
        'ORG_OBJ':ORG_OBJ,
        'CARD_NAMES':CARD_NAMES,
    }
    return render(request, 'morbidity/index.html', context)
