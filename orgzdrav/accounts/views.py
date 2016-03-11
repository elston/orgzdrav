from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.template import RequestContext

from django.contrib.auth.forms import PasswordChangeForm


@login_required
def passchange(request):
    if request.method == 'POST' and 'chpass_form_subm_btn' in request.POST:
        chpass_form = PasswordChangeForm(user=request.user, data=request.POST)
        if chpass_form.is_valid():
            chpass_form.save()
            return redirect('dashboard:index')

    context = {
        # 'organization':request.organization or None,    
        'user':request.user,
        'chpass_form':PasswordChangeForm(user=request.user),
    }


    return render(request, 'registration/passchange.html', context)

