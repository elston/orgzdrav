from django.conf.urls import url
from . import views

uuid = '[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}'

urlpatterns = [
    url('^IX_1/(?P<pk>'+uuid+')/$', views.IX_1, name='IX_1'),
    url('^IX_2/(?P<pk>'+uuid+')/$', views.IX_2, name='IX_2'),
    url('^IX_3/(?P<pk>'+uuid+')/$', views.IX_3, name='IX_3'),
    url('^IX_4/(?P<pk>'+uuid+')/$', views.IX_4, name='IX_4'),    
    url('^IX_5/(?P<pk>'+uuid+')/$', views.IX_5, name='IX_5'),    

    url('^XI_1/(?P<pk>'+uuid+')/$', views.XI_1, name='XI_1'),
    url('^XI_1_1/(?P<pk>'+uuid+')/$', views.XI_1_1, name='XI_1_1'),    
    url('^XI_2/(?P<pk>'+uuid+')/$', views.XI_2, name='XI_2'),
    url('^XI_3/(?P<pk>'+uuid+')/$', views.XI_3, name='XI_3'),    
]
