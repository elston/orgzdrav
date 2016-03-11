from django.conf.urls import include, url
from structure.views import index
from structure.routers import router

api = router.api

urlpatterns = [
    url(r'^$', index, name='index'),
    url(r'^api/$', api, name='api'),                        
    url(r'^router/$', router, name='router'),                 
]
