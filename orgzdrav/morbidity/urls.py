from django.conf.urls import include, url
from morbidity.views import index
from morbidity.routers import router


api = router.api

urlpatterns = [
    url(r'^$', index, name='index'),
    url(r'^api/$', api, name='api'),                        
    url(r'^router/$', router, name='router'),                 
    url(r'^reports/', include('morbidity.reports.urls','reports')),      
]
