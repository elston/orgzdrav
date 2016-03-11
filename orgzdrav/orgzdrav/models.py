import uuid
from django.db import models
from django.contrib.postgres.fields import ArrayField, JSONField

from django.contrib.auth.models import User as BaseUser

# from orgzdrav.enums import TimelineInOut, TimelineVerify

# from .abstracts import PgModel   
class CardName(object):
    data = [{
        "id":"delivery",
        "name":"Роды"
    },{
        "id":"pregnancy",
        "name":"Патология беременности"
    },{
        "id":"abort",
        "name":"Аборт"
    },{
        "id":"gynecology",
        "name":"Гинекология"
    }]

class DocName(object):
    data = [{
        "id":"enterorganization",
        "name":"Поступление в мед.уч."
    },{
        "id":"obmenka",
        "name":"Диспансерная книжка / обменная карта"
    },{        
        "id":"beginepicris",
        "name":"Первичный осмотр"
    },{
        "id":"delivery",
        "name":"Протокол родов"  
    },{
        "id":"cesarean",
        "name":"Протокол кесарева сечения"
    },{
        "id":"finishepicris",
        "name":"Выписной эпикриз"        
    },{
        "id":"child",
        "name":"История новорожденного"
    },{
        "id":"childmortepicris",
        "name":"Посмертный эпикриз новорожденного"                
    }]

class User(BaseUser):

    mid_name = models.CharField('отчество', max_length=128,blank = True, null = True)
    is_admin = models.BooleanField(default=False)   
    timelineverify = ArrayField(models.CharField(max_length=3, blank=False),size=3,default=['abs'])
    organizations = models.ManyToManyField('orgzdrav.Organization', related_name='users',blank = True)

class Organization(models.Model):

    class Meta:
        ordering = ('name',)
        verbose_name = 'Организация'
        verbose_name_plural = 'Организации'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField('Наименование', max_length=512)
    fullname = models.TextField('Полное наименование',blank = True, null = True)
    is_perinatalcenter = models.BooleanField(default=False)   
    lavelmz = models.PositiveSmallIntegerField(default=1)

    departments = JSONField(blank = True, null = True)    

    def __str__(self):
        return self.name

class App(models.Model):

    class Meta:
        verbose_name = 'приложение'
        verbose_name_plural = 'приложения'
        unique_together = ('name','xurl')
        ordering = ['code']

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.PositiveIntegerField('№', null=True, blank=True)
    name = models.CharField('наименование', max_length=128)
    #...
    xurl = models.CharField(max_length=128,null=True, blank=True)
    descr = models.CharField(max_length=256,blank = True, null = True)    
    #...
    users = models.ManyToManyField('orgzdrav.User', related_name='apps',blank = True)


class Diagnosis(models.Model):
    class Meta:
        verbose_name = 'диагноз'
        verbose_name_plural = 'диагнозы'
        ordering = ['name']

    id = models.CharField(primary_key=True,max_length=64,editable=True)
    name = models.CharField('наименование', max_length=256,unique=True)
    fields = JSONField(blank = True, null = True)

class Service(models.Model):
    class Meta:
        verbose_name = 'услуга'
        verbose_name_plural = 'услуги'
        ordering = ['name']

    id = models.CharField(primary_key=True,max_length=64,editable=True)
    name = models.CharField('наименование', max_length=256,unique=True)
    fields = JSONField(blank = True, null = True)

class Fio(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fio = models.CharField('ФИО', max_length=128,unique=True)    


class Card(models.Model):
    class Meta:
        verbose_name = 'карта'
        verbose_name_plural = 'карты'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fio = models.CharField('ФИО', max_length=128,)
    birthday = models.DateField('Дата рождения')
    organization = JSONField()
    cardname = JSONField()
    store = JSONField()


