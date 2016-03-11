#from django.conf.urls.defaults import *
from django.conf.urls import include, url
from django.contrib.auth.views import login, logout
from accounts.views import passchange

urlpatterns = [
    url(r'^logout/$', logout,name='logout'),
    url(r'^login/$', login, name='login'),    
    url(r'^passchange/$', passchange, name='passchange'),   
]
