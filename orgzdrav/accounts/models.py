
from django.db.models.signals import post_save
from orgzdrav.models import User
from django.contrib.auth.models import User as BaseUser

def create_user(sender, instance, created, **kwargs):
    if created:
        values = {}
        for field in sender._meta.local_fields:
            values[field.attname] = getattr(instance, field.attname)
        employer = User(**values)
        employer.save()
post_save.connect(create_user, BaseUser)
