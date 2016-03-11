
from django.conf.urls import url
from dashboard.views import index

urlpatterns = [
    url(r'^$', index, name='index'),
]
