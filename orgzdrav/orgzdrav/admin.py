
from django.utils.translation import ugettext, ugettext_lazy as _
from django.contrib import admin
from django.contrib.auth.models import User,Group
from django.contrib.auth.admin import UserAdmin


from orgzdrav.models import User as CustomUser
from orgzdrav.forms import CustomUserChangeForm

admin.site.unregister(User)    
admin.site.unregister(Group)    
    
class CustomUserAdmin(UserAdmin):
    fieldsets = (
        (None, {'fields': ('username', 'password',)}),
        (_('Personal info'), {'fields': ('last_name','first_name','mid_name','email',)}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser','is_admin', 'timelineverify',)}),
        (_('Organizations'), {'fields': ('organizations',)}),
    )    
    form = CustomUserChangeForm
    list_display = ('username','first_name','mid_name','last_name','is_staff','email','is_admin','timelineverify')
    list_display_links = ('username',)
    search_fields = ('username','last_name','first_name','mid_name',)               
    filter_horizontal = ('organizations',)    
admin.site.register(CustomUser, CustomUserAdmin)

from .models import App
class AppAdmin(admin.ModelAdmin):
    list_display = ('pk','code','name','descr','xurl',)
    list_display_links = ('name','descr')
    filter_horizontal = ('users',)
admin.site.register(App,AppAdmin)   

from .models import Diagnosis
class DiagnosisAdmin(admin.ModelAdmin):
    list_display = ('pk','name','fields')
    list_display_links = ('name',)
    search_fields = ('name','id')               
admin.site.register(Diagnosis,DiagnosisAdmin)   

# from .models import Card
# class CardAdmin(admin.ModelAdmin):
#     list_display = ('pk','first_name','last_name')
#     list_display_links = ('pk',)
# admin.site.register(Card,CardAdmin)   

from .models import Organization
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('pk','name','fullname')
    list_display_links = ('pk',)
admin.site.register(Organization,OrganizationAdmin)   

from .models import Fio
class FioAdmin(admin.ModelAdmin):
    list_display = ('pk','fio')
    list_display_links = ('pk',)
admin.site.register(Fio,FioAdmin)   

from .models import Service
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('pk','name','fields')
    list_display_links = ('name',)
    search_fields = ('name',)               
admin.site.register(Service,ServiceAdmin)   