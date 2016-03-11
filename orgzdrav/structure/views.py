# -*- coding: utf-8 -*-
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from orgzdrav.settings import STATIC_URL

@login_required
def index(request):
    context = {
        'STATIC_URL': STATIC_URL,
    }
    return render(request, 'structure/index.html', context)
