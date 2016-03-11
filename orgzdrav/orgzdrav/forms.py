from django import forms
from django.contrib.auth.forms import UserChangeForm

from .models import User
class CustomUserChangeForm(UserChangeForm):

    class Meta:
        model = User
        fields = "__all__"        

    def __init__(self, *args, **kwargs):
        super(CustomUserChangeForm, self).__init__(*args, **kwargs)

#from django import forms
#from django.contrib.admin.widgets import FilteredSelectMultiple
#from django.contrib.auth.forms import UserChangeForm

#from orgzdrav.models import Employer

#class EmployerChangeForm(UserChangeForm):

#    # organizations = forms.ModelMultipleChoiceField(
#    #     queryset=Organization.objects.filter(is_employer=False,is_manufacturer=False,is_supercustomer=False),
#    #     label='Organizations',
#    #     required=False,
#    #     widget=FilteredSelectMultiple('organizations', False,)
#    # )

#    class Meta:
#        model = Employer
#        fields = "__all__"        

#    def __init__(self, *args, **kwargs):
#        super(EmployerChangeForm, self).__init__(*args, **kwargs)


  
from .models import Card
class CardForm(forms.ModelForm):
    class Meta:
        model = Card
        fields = "__all__"       


# class CardBookForm(forms.ModelForm):
#     class Meta:
#         model = CardBook
#         fields = "__all__"           
