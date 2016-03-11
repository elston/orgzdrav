from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from orgzdrav.settings import STATIC_URL

@login_required
def index(request):
    user = request.user
    apps = user.apps.all().order_by('code')
    #...
    context = {
        'STATIC_URL': STATIC_URL,
        'user':user,
        'apps':apps,
    }
    return render(request, 'dashboard/index.html', context)
