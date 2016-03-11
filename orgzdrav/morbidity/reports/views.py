import re
import json
from functools import reduce
from string import Template

#...
from django.db.models import Q    
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.shortcuts import get_object_or_404
from django.db import connection
from itertools import chain, groupby
from collections import defaultdict
from datetime import datetime, date
from orgzdrav.utils import dictfetchall, load_datetime, u, m, s, d, da, concat

#...

ds_templ_obs = (
    ('f615c006-7b6b-405d-a0ac-f9e55eab1ec6','Беременность'),
    ('9879f995-9798-46a6-a959-d33862991f11','Угрожающий преждевременный выкидыш'),
    ('17a975e4-a8e8-45a6-b5b6-62b23b993bf4','Несостоятельность рубца на матки'),
    ('dfe4602b-fac7-4d0b-9b4b-e9eef09af366','Предлежание плаценты'),
    ('d94724e6-41e8-4e14-bc78-ad9924e3ce77','Приращение плаценты'),
    ('821660f0-d52e-467d-90e6-50b9dd1df16a','Отягощенный акушерский анамнез'),
)

ds_templ_gyn = (
    ('46cf7ebc-e3d1-4d18-871f-f97ac40455de','Миома матки'),
    ('56598fd6-9011-4713-93cd-892c51720d0d','Кистома яичника'),
    ('65b6d3bc-0fd8-417e-8d95-3bf2b00a8925','Спаечный процесс малого таза'),
)
#...

ds_templ_gem = (
    ('f39f0c41-ab0f-47c7-b2c5-24ac25075a09','Железодефицитная анемия'),
)

ds_templ_corpulm = (
    ('6eea2727-1000-465d-bb6b-3a80f890cd69','Бронхит'),
)

ds_templ_endocrin = (
    ('24db6202-bdce-4b74-a1d9-8376c83cd8d2','Ожирение'),
)

@login_required
def main(request):

    query = "\
        select \
            patient.daybooks as daybooks\
        from \
            orgzdrav_patient as patient \
    "
    #...
    cursor = connection.cursor()
    cursor.execute(query)    
    patientcards = dictfetchall(cursor)
    # ..
    patientcards = [{
        'yearmonth':'{}|{}'.format(
            load_datetime(max([daybook['datetime'] for daybook in item['daybooks']]),'%Y-%m-%d %H:%M %z').year,
            load_datetime(max([daybook['datetime'] for daybook in item['daybooks']]),'%Y-%m-%d %H:%M %z').month,            
        ),
        'diagnoses':[daybook['diagnoses'] for daybook in item['daybooks'] if daybook['datetime']==max([daybook['datetime'] for daybook in item['daybooks']])][0],
    } for item  in patientcards]

    diagnoses=[]
    for patientcard in patientcards:    
        for diagnosis in patientcard['diagnoses']:
            diagnoses.append({
                'xcode':'{}|{}'.format(
                    patientcard['yearmonth'],
                    diagnosis['id']
                )                    
            })
    # ...
    items = sorted(diagnoses, key=lambda x: x['xcode'])          
    items = groupby(items, key=lambda x: x['xcode']) 
    items = [(key,[item for item in values]) for key,values in items]

    items = [{
        'xcode':'{}|{}'.format(*key.split('|')[0:2]),
        #..
        'diagnosis':key.split('|')[2],
        'count':len(valuesiter),        
        # ...
    } for key,valuesiter  in items]            
    # ..
    items = sorted(items, key=lambda x: x['xcode'])          
    items = groupby(items, key=lambda x: x['xcode']) 
    items = [(key,[item for item in values]) for key,values in items]    
    items = [{
        'xcode':key.split('|')[0:1],
        #..
        'month':int(key.split('|')[1]),
        'count':sum(map(lambda x: x['count'] ,valuesiter)),
        'diagnoses':valuesiter,
        # ...
    } for key,valuesiter  in items]    
    # ..
    items = sorted(items, key=lambda x: x['xcode'])          
    items = groupby(items, key=lambda x: x['xcode']) 
    items = [(key,[item for item in values]) for key,values in items]    
    items = [{
        'xcode':key[0],
        #..
        'count':sum(map(lambda x: x['count'] ,valuesiter)),
        'month':valuesiter,
        # ...
    } for key,valuesiter  in items]        
    # ..
    context = {
        'datetime':datetime.now(),   
        'caption':'Заболеваемость',
        'items':items,
        'ds_templ_obs':ds_templ_obs,
        'ds_templ_gyn':ds_templ_gyn,
        'ds_templ_gem':ds_templ_gem,
        'ds_templ_corpulm':ds_templ_corpulm,
        'ds_templ_endocrin':ds_templ_endocrin,
    }
    return render(request, 'morbidity/reports/main.html', context)


from orgzdrav.models import Card, Organization, Diagnosis
from . import queries

@login_required
def IX_1(request,pk):
    organization = Organization.objects.get(pk=pk)
    # ...
    dss = [([
            ('postcesarean','postcesarean',None,None),
            ('postpartum','postpartum',None,None),
        ],[
            'beginepicris',
        ],
            'a_'
    ),([
            ('pregnancy','pregnancy',None,None),
            ('pregnancy_multiplety_uno','pregnancy','multiplety','@>'"'"'{"id":"uno"}'"'"),
            ('pregnancy_multiplety_duo','pregnancy','multiplety','@>'"'"'{"id":"duo"}'"'"),
            ('pregnancy_multiplety_tre','pregnancy','multiplety','@>'"'"'{"id":"tre"}'"'"),
            ('pregnancy_multiplety_qua','pregnancy','multiplety','@>'"'"'{"id":"qua"}'"'"),
            ('pregnancy_multiplety_cin','pregnancy','multiplety','@>'"'"'{"id":"cin"}'"'"),
            ('pregnancy_gestation_lt_28','pregnancy','gestation','::text::int > 28'),
            ('pregnancy_gestation_bwn_22_27','pregnancy','gestation','::text::int between 22 and 27'),
            ('pregnancy_gestation_bwn_22_37','pregnancy','gestation','::text::int between 22 and 37'),

            ('delivery','delivery',None,None),
            ('delivery_multiplety_uno','delivery','multiplety','@>'"'"'{"id":"uno"}'"'"),
            ('delivery_multiplety_duo','delivery','multiplety','@>'"'"'{"id":"duo"}'"'"),
            ('delivery_multiplety_tre','delivery','multiplety','@>'"'"'{"id":"tre"}'"'"),
            ('delivery_multiplety_qua','delivery','multiplety','@>'"'"'{"id":"qua"}'"'"),
            ('delivery_multiplety_cin','delivery','multiplety','@>'"'"'{"id":"cin"}'"'"),
            ('delivery_gestation_lt_28','delivery','gestation','::text::int > 28'),            
            ('delivery_gestation_bwn_22_27','delivery','gestation','::text::int between 22 and 27'),
            ('delivery_gestation_bwn_22_37','delivery','gestation','::text::int between 22 and 37'),            

            ('cesarean','cesarean',None,None),
            ('postcesarean','postcesarean',None,None),
            ('postpartum','postpartum',None,None),
            ('aids','aids',None,None),
        ],[
            'cesarean',
            'delivery',
        ],
            'b_'
    )]

    # ...
    ds_list = reduce(lambda x,y:x+y[0],dss,[])
    ds_count = Diagnosis.objects.filter(id__in=map(lambda x:x[1],ds_list)).count()
    # ..
    # ..
    fields = [
        "card.id as card_id",
        "1 as is_card",
        "date_part('year',to_date(replace((card.store->'finishepicris'->'datetime')::text,'%(ss)s',''),'YYYY-MM-DD'))::text \
            as card_year"%dict(ss='"'),
        "case when card.store ? 'obmenka' then 0 else 1 end as without_obmenka",
        "case when card.organization->'is_perinatalcenter'::text = 'true' then 1 else 0 end as is_perinatalcenter",
        "case when date_part('year',age(to_date(replace((card.store->'enterorganization'->'datetime')::text,'%(ss)s',''),'YYYY-MM-DD'),card.birthday)) \
                < 14 then 1 \
            else 0 \
        end as age_lt_14"%dict(ss='"'),
    ]
    # ...
    for ds_list,docs,block in dss:
        for ds_nick,ds_id,ds_field,ds_cev in ds_list:
            fields.append(queries.ds_exists(
                block = block,
                docs = docs,
                ds_id = json.dumps({'id':ds_id}),
                ds_nick = ds_nick,
                ds_field = ds_field,
                ds_cev = ds_cev
            ))    
    # ....
    kwargs = {
        'organization':json.dumps({'id':pk}),
        'fields':', '.join(fields)        
    }
    # ..
    query = "\
        select \
            %(fields)s \
        from \
            orgzdrav_card as card \
        where \
            card.organization @> '%(organization)s'\
        and card.store ? 'enterorganization'\
        and card.store ? 'finishepicris'\
    "%(kwargs)
    # print(query)
    #...
    cursor = connection.cursor()
    cursor.execute(query)    
    cards = dictfetchall(cursor)  
    # print(cards)           

    items = cards
    items = sorted(items, key=lambda x: x['card_year'])
    items = groupby(items, key=lambda x: x['card_year']) 
    items = [(key,[item for item in values]) for key,values in items]    
    items = [{
        'year':key,
        '1':{
            'name':'Принято  родов (с 28 недель, в стационаре) всего',
            'value':sum(map(lambda x:(
                    x['b_delivery_gestation_lt_28'] 
                )or(
                    x['b_pregnancy_gestation_lt_28']
                    and x['b_cesarean']
            ),valuesiter)),
        },
        '2':{
            'name':'Кроме того, поступило родивших вне родильного отделения ',
            'value':sum(map(lambda x:(
                    x['a_postpartum'] 
                )or(
                    x['a_postcesarean']
            ),valuesiter)),
        },
        '3':{
            'name':'Родов всего',
            'value':sum(map(lambda x:(
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ),valuesiter)),
        },
        '4':{
            'name':'Из общего числа родов: принято родов у детей до 14 лет',
            'value':sum(map(lambda x:((
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ))and(
                x['age_lt_14']
            ),valuesiter)),
        },  
        '5':{
            'name':'Из общего числа родов: у ВИЧ инфицированных женщин',
            'value':sum(map(lambda x:((
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ))and(
                x['b_aids']
            ),valuesiter)),
        },
        '6':{
            'name':'Из общего числа родов: нормальные (одноплодные!!)',
            'value':sum(map(lambda x:(
                    x['b_delivery_multiplety_uno'] 
                )or(
                    x['b_pregnancy_multiplety_uno']
                    and x['b_cesarean']
            ),valuesiter)),
        },
        '7':{
            'name':'Из общего числа родов: - многоплодные',
            'value':sum(map(lambda x:(
                    x['b_delivery_multiplety_duo']
                    or x['b_delivery_multiplety_tre']
                    or x['b_delivery_multiplety_qua']
                    or x['b_delivery_multiplety_cin']
                )or((
                        x['b_pregnancy_multiplety_duo']
                        or x['b_pregnancy_multiplety_tre']
                        or x['b_pregnancy_multiplety_qua']
                        or x['b_pregnancy_multiplety_cin']                        
                    )and x['b_cesarean']
            ),valuesiter)),
        },
        '8':{
            'name':'Из них (из многоплодных) - двоен',
            'value':sum(map(lambda x:(
                    x['b_delivery_multiplety_duo']
                )or((
                        x['b_pregnancy_multiplety_duo']
                    )and x['b_cesarean']
            ),valuesiter)),
        },
        '9':{
            'name':'Из них (из многоплодных) - троен',
            'value':sum(map(lambda x:(
                    x['b_delivery_multiplety_tre']
                )or((
                        x['b_pregnancy_multiplety_tre']
                    )and x['b_cesarean']
            ),valuesiter)),
        },
        '10':{
            'name':'Из них (из многоплодных) - четыре и более ребенка',
            'value':sum(map(lambda x:(
                    x['b_delivery_multiplety_qua']
                    or x['b_delivery_multiplety_cin']
                )or((
                        x['b_pregnancy_multiplety_qua']
                        or x['b_pregnancy_multiplety_cin']                        
                    )and x['b_cesarean']
            ),valuesiter)),
        },
        '11':{
            'name':'Принято родов у женщин, не состоявших под наблюдением женской консультации',
            'value':sum(map(lambda x:((
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ))and(
                x['without_obmenka']
            ),valuesiter)),
        },
        '12':{
            'name':'Из них у ВИЧ инфицированных женщин',
            'value':sum(map(lambda x:((
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ))and(
                x['without_obmenka']
            )and(
                x['b_aids']
            ),valuesiter)),
        },  
        '13':{
            'name':'Кроме того, закончили беременность в сроки 22-27 недель ',
            'value':sum(map(lambda x:(
                    x['b_delivery_gestation_bwn_22_27']
                )or((
                        x['b_pregnancy_gestation_bwn_22_27']
                    )and x['b_cesarean']
            ),valuesiter)),
        },
        '14':{
            'name':'из них не состояло под наблюдением в женской консультации ',
            'value':sum(map(lambda x:((
                    x['b_delivery_gestation_bwn_22_27']
                )or((
                        x['b_pregnancy_gestation_bwn_22_27']
                    )and x['b_cesarean']
            ))and(
                x['without_obmenka']
            ),valuesiter)),
        },
        '15':{
            'name':'Число преждевременных родов в 22 - 37 недель',
            'value':sum(map(lambda x:(
                    x['b_delivery_gestation_bwn_22_37']
                )or((
                        x['b_pregnancy_gestation_bwn_22_37']
                    )and x['b_cesarean']
            ),valuesiter)),
        },
        '16':{
            'name':'из них в Перинатальных центрах',
            'value':sum(map(lambda x:((
                    x['b_delivery_gestation_bwn_22_37']
                )or((
                        x['b_pregnancy_gestation_bwn_22_37']
                    )and x['b_cesarean']
            ))and(
                x['is_perinatalcenter']
            ),valuesiter)),
        },        
        # ..
    } for key,valuesiter  in items]   
    # ...
    codes = [{
        'code':i,
        'name':items[0][str(i)]['name'],
    } for i in range(1,len(items[0].keys()))]

    context = {
        'datetime':datetime.now(),   
        'caption':'IX.1. Форма № 32. Родовспоможение в стационаре.',
        'organization':organization,
        'items':items,
        'codes':codes,

    }
    return render(request, 'morbidity/reports/IX_1.html', context)   

@login_required
def IX_2(request,pk):    
    # ...****************************** organization ************************
    organization = Organization.objects.get(pk=pk)

    # ...***************************** ds **********************************
    ds_list = [
        ('pregnancy','pregnancy',None,None),
        ('delivery','delivery',None,None),
        ('postcesarean','postcesarean',None,None),
        ('postpartum','postpartum',None,None),
        ('weaknesslabor','weaknesslabor',None,None),
        ('discoordinationlabor','discoordinationlabor',None,None),
        ('delivhemorhag','delivhemorhag',None,None),
        ('preghemorhag','preghemorhag',None,None),
        ('postpartumhemorhag','postpartumhemorhag',None,None),
        ('badcoagblood','badcoagblood',None,None),
        ('detachplacent','detachplacent',None,None),
        ('peritonitis','peritonitis',None,None),
        ('sepsis','sepsis',None,None),
        ('septicemia','septicemia',None,None),
        ('rupturemembranes','rupturemembranes',None,None),
        ('preeclampsia','preeclampsia',None,None),
        ('proteinuria','proteinuria',None,None),
        ('uterotear','uterotear',None,None),
        ('perinealtear_tre','perinealtear','category','@>'"'"'{"id":"tre"}'"'"),
        ('perinealtear_for','perinealtear','category','@>'"'"'{"id":"for"}'"'"),        
        ('diabetes','diabetes',None,None),
        ('eclampsia','eclampsia',None,None),
        ('amnioticembolism','amnioticembolism',None,None),
        ('arterialhypertension','arterialhypertension',None,None),
        ('cystitis','cystitis',None,None),
        ('ironanemia','ironanemia',None,None),
        ('legvienvaricosity','legvienvaricosity',None,None),
        ('shellattachmentcord','shellattachmentcord',None,None),
        ('cesarean','cesarean',None,None),
        ('сonheartdefect','сonheartdefect',None,None),
        ('mitralprolapse','mitralprolapse',None,None),
        ('ventseptdefect','ventseptdefect',None,None),
        ('pulmhypertension','pulmhypertension',None,None),      
    ]
    # ...
    ds_count = Diagnosis.objects.filter(id__in=map(lambda x:x[1],ds_list)).count()
    # ....
    # ...***************************** docs **********************************
    docs = [
        # 'enterorganization',
        'beginepicris',
        'finishepicris',
        'cesarean',
        'delivery',
    ]

    # ..
    fields = [
        "card.id as card_id",
        "1 as is_card",
        "date_part('year',to_date(replace((card.store->'finishepicris'->'datetime')::text,'%(ss)s',''),'YYYY-MM-DD'))::text \
            as card_year"%dict(ss='"'),
    ]
    # ...
    for ds_nick,ds_id,ds_field,ds_cev in ds_list:
        fields.append(queries.ds_exists(
            block = '',
            docs = docs,
            ds_id = json.dumps({'id':ds_id}),
            ds_nick = ds_nick,
            ds_field = ds_field,
            ds_cev = ds_cev
        ))    
    # ....
    kwargs = {
        'organization':json.dumps({'id':pk}),
        'fields':', '.join(fields)        
    }
    # ..
    query = "\
        select \
            %(fields)s \
        from \
            orgzdrav_card as card \
        where \
            card.organization @> '%(organization)s'\
        and card.store ? 'enterorganization'\
        and card.store ? 'finishepicris'\
    "%(kwargs)
    # print(query)
    #...
    cursor = connection.cursor()
    cursor.execute(query)    
    cards = dictfetchall(cursor)  
    # print(cards)     

    items = cards
    items = sorted(items, key=lambda x: x['card_year'])
    items = groupby(items, key=lambda x: x['card_year']) 
    items = [(key,[item for item in values]) for key,values in items]    
    items = [{
        'year':key,
        '1':{
            'name':'Всего женщин (число физических лиц)',
            'value':sum(map(lambda x: 
                    x['is_card'] 
            ,valuesiter)),
        },
        '2':{
            'name':'Отеки, протеинурия, гипертензивные расстройства',
            'value':sum(map(lambda x:(
                    x['pregnancy'] 
                    or x['delivery'] 
                    or x['postcesarean'] 
                    or x['postpartum']
                )and(
                    x['proteinuria'] 
                    or x['arterialhypertension']
            ),valuesiter)),
        },  
        '3':{
            'name':'в т.ч. преэклампсия, эклампсия',
            'value':sum(map(lambda x: (
                    x['pregnancy'] 
                    or x['delivery'] 
                    or x['postcesarean'] 
                    or x['postpartum']
                )and(
                    x['preeclampsia'] 
                    or x['eclampsia']
            ),valuesiter)),
        },
        '4':{
            'name':'Сахарный диабет',
            'value':sum(map(lambda x: (
                    x['pregnancy'] 
                    or x['delivery'] 
                    or x['postcesarean'] 
                    or x['postpartum']
                )and(
                    x['diabetes']
            ),valuesiter)),
        },
        '5':{
            'name':'Преждевременный разрыв плодных оболочек',
            'value':sum(map(lambda x:(
                    x['pregnancy'] 
                    or x['delivery']
                )and(
                    x['rupturemembranes']
            ),valuesiter)),
        },
        '6':{
            'name':'Кровотечения в связи с предлежанием плаценты',
            'value':sum(map(lambda x:(
                    x['pregnancy'] 
                    or x['delivery']
                )and(
                    x['delivhemorhag'] 
                    or x['preghemorhag']
            ),valuesiter)),
        },
        '7':{
            'name':'Кровотечение в связи с нарушением  свертываемости крови',
            'value':sum(map(lambda x:(
                    x['pregnancy'] 
                    or x['delivery'] 
                    or x['postcesarean'] 
                    or x['postpartum']
                )and(
                    x['delivhemorhag'] 
                    or x['preghemorhag']
                )and(
                    x['badcoagblood']
            ),valuesiter)),
        },
        '8':{
            'name':'Дородовое кровотечение в связи с нарушением свертываемости крови',
            'value':sum(map(lambda x: 
                    (x['pregnancy'])
                    and
                    (x['preghemorhag'])
                    and 
                    (x['badcoagblood'])
            ,valuesiter)),
        },
        '9':{
            'name':'Кровотечение  в связи  с преждевременной отслойкой плаценты',
            'value':sum(map(lambda x: 
                    (x['pregnancy'] or x['delivery'])
                    and
                    (x['delivhemorhag'] or x['preghemorhag'])
                    and 
                    (x['detachplacent'])
            ,valuesiter)),
        },
        '10':{
            'name':'Нарушения родовой деятельности',
            'value':sum(map(lambda x: 
                    (x['delivery'])
                    and
                    (x['weaknesslabor'] or x['discoordinationlabor'])
            ,valuesiter)),
        },
        '11':{
            'name':'в т.ч. слабость родовой деятельности',
            'value':sum(map(lambda x: 
                    (x['delivery'])
                    and
                    (x['weaknesslabor'])
            ,valuesiter)),
        },
        '12':{
            'name':'стремительные роды',
            'value':sum(map(lambda x: 
                    0
            ,valuesiter)),
        },
        '13':{
            'name':'Дискоординация родовой деятельности',
            'value':sum(map(lambda x: 
                    (x['delivery'])
                    and
                    (x['discoordinationlabor'])
            ,valuesiter)),
        },
        '14':{
            'name':'Роды, осложненные патологией пуповины',
            'value':sum(map(lambda x: 
                    (x['pregnancy'] or x['delivery'])
                    and
                    (x['shellattachmentcord'])
            ,valuesiter)),
        },
        '15':{
            'name':'Затрудненные роды',
            'value':sum(map(lambda x: 
                    0
            ,valuesiter)),
        },
        '16':{
            'name':'Разрыв промежности III-IV степени',
            'value':sum(map(lambda x: 
                    (x['delivery'])
                    and
                    (x['perinealtear_tre'] or x['perinealtear_for'])
            ,valuesiter)),
        },  
        '17':{
            'name':'Разрыв матки всего',
            'value':sum(map(lambda x: 
                    (x['delivery'])
                    and
                    (x['uterotear'])
            ,valuesiter)),
        },
        '18':{
            'name':'в т.ч. вне стационара',
            'value':sum(map(lambda x: 
                0
            ,valuesiter)),
        },
        '19':{
            'name':'Кровотечение в последовом и послеродовом периоде',
            'value':sum(map(lambda x: 
                    (x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
                    and
                    (x['postpartumhemorhag'])
            ,valuesiter)),
        },
        '20':{
            'name':'Родовой сепсис, разлитая послеродовая инфекция',
            'value':sum(map(lambda x: 
                    (x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
                    and
                    (x['sepsis'])
            ,valuesiter)),
        },
        '21':{
            'name':'Перитонит',
            'value':sum(map(lambda x: 
                    (x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
                    and
                    (x['peritonitis'])
            ,valuesiter)),
        },
        '22':{
            'name':'в т.ч. перитонит после операции кесарево сечение',
            'value':sum(map(lambda x: 
                    (x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
                    and
                    (x['peritonitis'])
                    and
                    (x['cesarean'])                    
            ,valuesiter)),
        },
        '23':{
            'name':'септицемия',
            'value':sum(map(lambda x: 
                    (x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
                    and
                    (x['septicemia'])
            ,valuesiter)),
        },
        '24':{
            'name':'Болезни мочеполовой  системы',
            'value':sum(map(lambda x: 
                    (x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
                    and
                    (x['cystitis'])
            ,valuesiter)),
        },            
        '25':{
            'name':'Венозные осложнения',
            'value':sum(map(lambda x: 
                    (x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
                    and
                    (x['legvienvaricosity'])
            ,valuesiter)),
        },            
        '26':{
            'name':'Анемия',
            'value':sum(map(lambda x:(
                    x['pregnancy'] 
                    or x['delivery'] 
                    or x['postcesarean'] 
                    or x['postpartum']
                )and(
                    x['ironanemia']
            ),valuesiter)),
        },
        '27':{
            'name':'Болезни системы кровообращения ',
            'value':sum(map(lambda x:(
                        x['pregnancy'] 
                        or x['delivery'] 
                        or x['postcesarean'] 
                        or x['postpartum']
                )and(   
                        x['arterialhypertension'] 
                        or x['сonheartdefect'] 
                        or x['mitralprolapse'] 
                        or x['ventseptdefect'] 
                        or x['pulmhypertension']
            ),valuesiter)),
        },
        '28':{
            'name':'Акушерская эмболия ',
            'value':sum(map(lambda x:(
                    x['pregnancy'] 
                    or x['delivery'] 
                    or x['postcesarean'] 
                    or x['postpartum']
                )and(   
                    x['amnioticembolism'] 
            ),valuesiter)),
        },        
        # ..
    } for key,valuesiter  in items]   
    # ...
    codes = [{
        'code':i,
        'name':items[0][str(i)]['name'],
    } for i in range(1,len(items[0].keys()))]
    # ...
    context = {
        'datetime':datetime.now(),   
        'caption':'IX.2. Форма № 32. Заболевания осложнившие роды (осложнения родов и послеродового периода).',
        'organization':organization,
        'items':items,
        'codes':codes,
    }
    return render(request, 'morbidity/reports/IX_2.html', context)        

@login_required
def IX_3(request,pk):
    organization = Organization.objects.get(pk=pk)
    # ...
    dss = [([
            ('postcesarean','postcesarean',None,None),
            ('postpartum','postpartum',None,None),
        ],[
            'beginepicris',
        ],
            'a_'
    ),([
            ('pregnancy','pregnancy',None,None),
            ('pregnancy_multiplety_uno','pregnancy','multiplety','@>'"'"'{"id":"uno"}'"'"),
            ('pregnancy_multiplety_duo','pregnancy','multiplety','@>'"'"'{"id":"duo"}'"'"),
            ('pregnancy_multiplety_tre','pregnancy','multiplety','@>'"'"'{"id":"tre"}'"'"),
            ('pregnancy_multiplety_qua','pregnancy','multiplety','@>'"'"'{"id":"qua"}'"'"),
            ('pregnancy_multiplety_cin','pregnancy','multiplety','@>'"'"'{"id":"cin"}'"'"),
            ('pregnancy_gestation_lt_28','pregnancy','gestation','::text::int > 28'),
            ('pregnancy_gestation_bwn_22_27','pregnancy','gestation','::text::int between 22 and 27'),
            ('pregnancy_gestation_bwn_22_37','pregnancy','gestation','::text::int between 22 and 37'),

            ('delivery','delivery',None,None),
            ('delivery_multiplety_uno','delivery','multiplety','@>'"'"'{"id":"uno"}'"'"),
            ('delivery_multiplety_duo','delivery','multiplety','@>'"'"'{"id":"duo"}'"'"),
            ('delivery_multiplety_tre','delivery','multiplety','@>'"'"'{"id":"tre"}'"'"),
            ('delivery_multiplety_qua','delivery','multiplety','@>'"'"'{"id":"qua"}'"'"),
            ('delivery_multiplety_cin','delivery','multiplety','@>'"'"'{"id":"cin"}'"'"),
            ('delivery_gestation_lt_28','delivery','gestation','::text::int > 28'),            
            ('delivery_gestation_bwn_22_27','delivery','gestation','::text::int between 22 and 27'),
            ('delivery_gestation_bwn_22_37','delivery','gestation','::text::int between 22 and 37'),            

            ('cesarean','cesarean',None,None),
            ('postcesarean','postcesarean',None,None),
            ('postpartum','postpartum',None,None),
            ('aids','aids',None,None),
        ],[
            'cesarean',
            'delivery',
        ],
            'b_'
    )]

    # ...
    ds_list = reduce(lambda x,y:x+y[0],dss,[])
    ds_count = Diagnosis.objects.filter(id__in=map(lambda x:x[1],ds_list)).count()
    # ..
    # ..
    fields = [
        # .. card_id
        "card.id as card_id",

        # .. is_card
        "1 as is_card",

        # .. card_year
        "date_part('year',(card.store->'finishepicris'->'datetime')::text::timestamp)::text as card_year",

        # .. without_obmenka
        "case \
            when \
                card.store ? 'obmenka' \
                then 0 \
            else 1 \
        end as without_obmenka",

        # .. is_perinatalcenter
        "case \
            when \
                card.organization->'is_perinatalcenter'::text = 'true' \
                then 1 \
            else 0 \
        end as is_perinatalcenter",

        # .. age_lt_14
        "case \
            when \
                date_part('year',\
                    age(\
                        (card.store->'enterorganization'->'datetime')::text::timestamp\
                        , \
                        card.birthday  \
                    )\
                ) < 14 then 1 \
            else 0 \
        end as age_lt_14",

        # .. c_child_count
        "(select \
            count(*) \
        from \
             jsonb_array_elements(card.store->'children') as child \
        ) as c_child_count",

        # .. c_child_mortalbirth_count
        "(select \
                count(*)\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where \
                child->'data'->'birthdatetime' = child->'data'->'mortepicris'->'data'->'mortdatetime' \
        ) as c_child_mortalbirth_count",        

        # .. c_child_mortalbirth_antenatal_count
        "(select \
                count(*)\
            from \
                jsonb_array_elements(card.store->'children') as child \
            where \
                child->'data'->'birthdatetime' = child->'data'->'mortepicris'->'data'->'mortdatetime' \
            and ( \
                exists( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where \
                        ds @> '{"'"'"id"'"'": "'"'"antenatal"'"'"}' \
                ) or \
                exists( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(child->'data'->'mortepicris'->'data'->'diagnoses') as ds \
                    where \
                        ds @> '{"'"'"id"'"'": "'"'"antenatal"'"'"}' \
                ) \
            )\
        ) as c_child_mortalbirth_antenatal_count",

     # .. c_child_alivebirth_count
        "(select \
                count(*)\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where \
                not child->'data' ? 'mortepicris' \
            or child->'data'->'birthdatetime' < child->'data'->'mortepicris'->'data'->'mortdatetime'\
        ) as c_child_alivebirth_count",

     # .. c_child_died_count
        "(select \
                count(*)\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where \
                child->'data'->'birthdatetime' < child->'data'->'mortepicris'->'data'->'mortdatetime'\
        ) as c_child_died_count",        
     
     # .. c_child_died_168h_count
        "(select \
                count(*)\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where \
                date_part('hour', \
                    age(\
                        (child->'data'->'mortepicris'->'data'->'mortdatetime')::text::timestamp \
                        ,\
                        (child->'data'->'birthdatetime')::text::timestamp  \
                    ) \
                ) < 168 \
        ) as c_child_died_168h_count",

     # .. c_child_died_24h_count
        "(select \
                count(*)\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where \
                date_part('hour', \
                    age(\
                        (child->'data'->'mortepicris'->'data'->'mortdatetime')::text::timestamp \
                        ,\
                        (child->'data'->'birthdatetime')::text::timestamp  \
                    ) \
                ) < 24 \
        ) as c_child_died_24h_count",           
    ]
    # ...
    for ds_list,docs,block in dss:
        for ds_nick,ds_id,ds_field,ds_cev in ds_list:
            fields.append(queries.ds_exists(
                block = block,
                docs = docs,
                ds_id = json.dumps({'id':ds_id}),
                ds_nick = ds_nick,
                ds_field = ds_field,
                ds_cev = ds_cev
            ))    
    # ....
    kwargs = {
        'organization':json.dumps({'id':pk}),
        'fields':', '.join(fields)        
    }
    # ..
    query = "\
        select \
            %(fields)s \
        from \
            orgzdrav_card as card \
        where \
            card.organization @> '%(organization)s'\
        and card.store ? 'enterorganization'\
        and card.store ? 'finishepicris'\
    "%(kwargs)
    # print(query)
    #...
    cursor = connection.cursor()
    cursor.execute(query)    
    cards = dictfetchall(cursor)  
    # print(cards)           

    items = cards
    items = sorted(items, key=lambda x: x['card_year'])
    items = groupby(items, key=lambda x: x['card_year']) 
    items = [(key,[item for item in values]) for key,values in items]    
    items = [{
        'year':key,

        # ..Родов всего
        '0':
            sum(map(lambda x:(
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ),valuesiter))
        ,

        # ...Принято  родов (с 28 недель, в стационаре) всего
        '1':
            sum(map(lambda x:(
                    x['b_delivery_gestation_lt_28'] 
                )or(
                    x['b_pregnancy_gestation_lt_28']
                    and x['b_cesarean']
            ),valuesiter))
        ,

        # ...Удельный вес
        '1.1': round(
            sum(map(lambda x:(
                    x['b_delivery_gestation_lt_28'] 
                )or(
                    x['b_pregnancy_gestation_lt_28']
                    and x['b_cesarean']
            ),valuesiter))        
        /
            sum(map(lambda x:(
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ),valuesiter))
        ,2)

        if 
                    sum(map(lambda x:(
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ),valuesiter))
        else None        
        ,

        # ..Кроме того, поступило родивших вне родильного отделения 
        '1.2':
            sum(map(lambda x:(
                        x['a_postpartum'] 
                    )or(
                        x['a_postcesarean']
            ),valuesiter))
        ,

        # ..Удельный вес
        '1.3': round(
            sum(map(lambda x:(
                    x['a_postpartum'] 
                )or(
                    x['a_postcesarean']
            ),valuesiter))
        /
            sum(map(lambda x:(
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ),valuesiter))
        ,2)
        if 
                    sum(map(lambda x:(
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ),valuesiter))
        else None        
        ,

        # ..Из общего числа родов: принято родов у детей до 14 лет
        '2.1':sum(map(lambda x:((
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ))and(
                x['age_lt_14']
            ),valuesiter))
        ,

        # ..Удельный вес
        '2.2':round(
            sum(map(lambda x:((
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ))and(
                x['age_lt_14']
            ),valuesiter))
        /

            sum(map(lambda x:(
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ),valuesiter))
        ,2)

        if 
                    sum(map(lambda x:(
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ),valuesiter))
        else None        
        ,

        #.. Из общего числа родов: у ВИЧ инфицированных женщин
        '3.1':
            sum(map(lambda x:((
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ))and(
                x['b_aids']
            ),valuesiter))
        ,
        # ..Удельный вес
        '3.2':round(
            sum(map(lambda x:((
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ))and(
                x['b_aids']
            ),valuesiter))
        /

            sum(map(lambda x:(
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ),valuesiter))
        ,2)

        if 
                    sum(map(lambda x:(
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ),valuesiter))
        else None        
        ,

        #.. Из общего числа родов: нормальные (одноплодные!!)
        '4.1':
            sum(map(lambda x:(
                    x['b_delivery_multiplety_uno'] 
                )or(
                    x['b_pregnancy_multiplety_uno']
                    and x['b_cesarean']
            ),valuesiter))
        ,
        # ..Удельный вес
        '4.2':round(
            sum(map(lambda x:(
                    x['b_delivery_multiplety_uno'] 
                )or(
                    x['b_pregnancy_multiplety_uno']
                    and x['b_cesarean']
            ),valuesiter))
        /

            sum(map(lambda x:(
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ),valuesiter))
        ,2)
        if 
                    sum(map(lambda x:(
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ),valuesiter))
        else None        
        ,

        #..Из общего числа родов: - многоплодные
        '5.1':
            sum(map(lambda x:(
                    x['b_delivery_multiplety_duo']
                    or x['b_delivery_multiplety_tre']
                    or x['b_delivery_multiplety_qua']
                    or x['b_delivery_multiplety_cin']
                )or((
                        x['b_pregnancy_multiplety_duo']
                        or x['b_pregnancy_multiplety_tre']
                        or x['b_pregnancy_multiplety_qua']
                        or x['b_pregnancy_multiplety_cin']                        
                    )and x['b_cesarean']
            ),valuesiter))
        ,
        # ..Удельный вес
        '5.2':round(
            sum(map(lambda x:(
                    x['b_delivery_multiplety_duo']
                    or x['b_delivery_multiplety_tre']
                    or x['b_delivery_multiplety_qua']
                    or x['b_delivery_multiplety_cin']
                )or((
                        x['b_pregnancy_multiplety_duo']
                        or x['b_pregnancy_multiplety_tre']
                        or x['b_pregnancy_multiplety_qua']
                        or x['b_pregnancy_multiplety_cin']                        
                    )and x['b_cesarean']
            ),valuesiter))
        /

            sum(map(lambda x:(
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ),valuesiter))
        ,2)
        if 
                    sum(map(lambda x:(
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ),valuesiter))
        else None        
        ,        

        #.. Из них (из многоплодных) - двоен
        '5.3':
            sum(map(lambda x:(
                    x['b_delivery_multiplety_duo']
                )or((
                        x['b_pregnancy_multiplety_duo']
                    )and x['b_cesarean']
            ),valuesiter))
        ,
        #.. Из них (из многоплодных) - троен
        '5.4':
            sum(map(lambda x:(
                    x['b_delivery_multiplety_tre']
                )or((
                        x['b_pregnancy_multiplety_tre']
                    )and x['b_cesarean']
            ),valuesiter))
        ,

        #.. Из них (из многоплодных) - четыре и более ребенка
        '5.5':
            sum(map(lambda x:(
                    x['b_delivery_multiplety_qua']
                    or x['b_delivery_multiplety_cin']
                )or((
                        x['b_pregnancy_multiplety_qua']
                        or x['b_pregnancy_multiplety_cin']                        
                    )and x['b_cesarean']
            ),valuesiter))
        ,

        # Родилось детей всего
        '6.1': sum(map(lambda x: x['c_child_count'],valuesiter)),
        # из них:     родилось мёртвыми 
        '6.2': sum(map(lambda x: x['c_child_mortalbirth_count'],valuesiter)),
        # из них антенатально 
        '6.3': sum(map(lambda x: x['c_child_mortalbirth_antenatal_count'],valuesiter)),
        # родилось детей живыми 
        '6.4': sum(map(lambda x: x['c_child_alivebirth_count'],valuesiter)),
        # из них:     умерло детей всего 
        '6.5':sum(map(lambda x: x['c_child_died_count'],valuesiter)),
        # из них:      умерло в первые 168 часов
        '6.6':sum(map(lambda x: x['c_child_died_168h_count'],valuesiter)),
        # из них:     в первые 0-24  часа 
        '6.7':sum(map(lambda x: x['c_child_died_24h_count'],valuesiter)),

        # ..Принято родов у женщин, не состоявших под наблюдением женской консультации
        '7.1':
            sum(map(lambda x:((
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ))and(
                x['without_obmenka']
            ),valuesiter))
        ,
        '7.2':round(
            sum(map(lambda x:((
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ))and(
                x['without_obmenka']
            ),valuesiter))
        /

            sum(map(lambda x:(
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ),valuesiter))
        ,2)

        if 
                    sum(map(lambda x:(
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ),valuesiter))
        else None        
        ,  

        # ..Из них у ВИЧ инфицированных женщин
        '7.3':
            sum(map(lambda x:((
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ))and(
                x['without_obmenka']
            )and(
                x['b_aids']
            ),valuesiter))
        ,
        '7.4':round(
            sum(map(lambda x:((
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ))and(
                x['without_obmenka']
            )and(
                x['b_aids']
            ),valuesiter))
        /

            sum(map(lambda x:(
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ),valuesiter))
        ,2)
        if 
                    sum(map(lambda x:(
                    x['b_delivery'] 
                )or(
                    x['b_pregnancy']
                    and x['b_cesarean']
            ),valuesiter))
        else None
        ,          

        # ..Кроме того, закончили беременность в сроки 22-27 недель 
        '8.1':
            sum(map(lambda x:(
                    x['b_delivery_gestation_bwn_22_27']
                )or((
                        x['b_pregnancy_gestation_bwn_22_27']
                    )and x['b_cesarean']
            ),valuesiter))
        ,

        # ..из них не состояло под наблюдением в женской консультации 
        '8.2':
            sum(map(lambda x:((
                    x['b_delivery_gestation_bwn_22_27']
                )or((
                        x['b_pregnancy_gestation_bwn_22_27']
                    )and x['b_cesarean']
            ))and(
                x['without_obmenka']
            ),valuesiter))
        ,
        '8.3':round(
            sum(map(lambda x:((
                    x['b_delivery_gestation_bwn_22_27']
                )or((
                        x['b_pregnancy_gestation_bwn_22_27']
                    )and x['b_cesarean']
            ))and(
                x['without_obmenka']
            ),valuesiter))
        /
            sum(map(lambda x:(
                    x['b_delivery_gestation_bwn_22_27']
                )or((
                        x['b_pregnancy_gestation_bwn_22_27']
                    )and x['b_cesarean']
            ),valuesiter))
        ,2)
          if
            sum(map(lambda x:(
                    x['b_delivery_gestation_bwn_22_27']
                )or((
                        x['b_pregnancy_gestation_bwn_22_27']
                    )and x['b_cesarean']
            ),valuesiter))
        else
            None      
        , 
        # ..
    } for key,valuesiter  in items]   
    # ...


    context = {
        'datetime':datetime.now(),   
        'caption':'IX.3. Анализ родов,включая отчетную форму № 32 Родовспоможение в стационаре (таблица 2210)',
        'organization':organization,
        'items':items,

    }
    return render(request, 'morbidity/reports/IX_3.html', context)   

@login_required
def IX_4(request,pk):    
    # ...****************************** organization ************************
    organization = Organization.objects.get(pk=pk)

    # ...***************************** ds **********************************
    ds_list = [
        ('pregnancy','pregnancy',None,None),
        ('delivery','delivery',None,None),
        ('postcesarean','postcesarean',None,None),
        ('postpartum','postpartum',None,None),
        ('weaknesslabor','weaknesslabor',None,None),
        ('discoordinationlabor','discoordinationlabor',None,None),
        ('delivhemorhag','delivhemorhag',None,None),
        ('preghemorhag','preghemorhag',None,None),
        ('postpartumhemorhag','postpartumhemorhag',None,None),
        ('badcoagblood','badcoagblood',None,None),
        ('detachplacent','detachplacent',None,None),
        ('peritonitis','peritonitis',None,None),
        ('sepsis','sepsis',None,None),
        ('septicemia','septicemia',None,None),
        ('rupturemembranes','rupturemembranes',None,None),
        ('preeclampsia','preeclampsia',None,None),
        ('proteinuria','proteinuria',None,None),
        ('uterotear','uterotear',None,None),
        ('perinealtear_tre','perinealtear','category','@>'"'"'{"id":"tre"}'"'"),
        ('perinealtear_for','perinealtear','category','@>'"'"'{"id":"for"}'"'"),        
        ('diabetes','diabetes',None,None),
        ('eclampsia','eclampsia',None,None),
        ('amnioticembolism','amnioticembolism',None,None),
        ('arterialhypertension','arterialhypertension',None,None),
        ('cystitis','cystitis',None,None),
        ('ironanemia','ironanemia',None,None),
        ('legvienvaricosity','legvienvaricosity',None,None),
        ('shellattachmentcord','shellattachmentcord',None,None),
        ('cesarean','cesarean',None,None),
        ('сonheartdefect','сonheartdefect',None,None),
        ('mitralprolapse','mitralprolapse',None,None),
        ('ventseptdefect','ventseptdefect',None,None),
        ('pulmhypertension','pulmhypertension',None,None),      
        ('hypothyroidism','hypothyroidism',None,None),
        ('hyperprolactinemia','hyperprolactinemia',None,None),
    ]
    # ...
    ds_count = Diagnosis.objects.filter(id__in=map(lambda x:x[1],ds_list)).count()
    # ....
    # ...***************************** docs **********************************
    docs = [
        # 'enterorganization',
        'beginepicris',
        'finishepicris',
        'cesarean',
        'delivery',
    ]

    # ..
    fields = [
        "card.id as card_id",
        "1 as is_card",
        "date_part('year',(card.store->'finishepicris'->>'datetime')::timestamp)::text as card_year",
    ]
    # print(fields)
    # ...
    for ds_nick,ds_id,ds_field,ds_cev in ds_list:
        fields.append(queries.ds_exists(
            block = '',
            docs = docs,
            ds_id = json.dumps({'id':ds_id}),
            ds_nick = ds_nick,
            ds_field = ds_field,
            ds_cev = ds_cev
        ))    
    # ....
    kwargs = {
        'organization':json.dumps({'id':pk}),
        'fields':', '.join(fields)        
    }
    # ..
    query = "\
        select \
            %(fields)s \
        from \
            orgzdrav_card as card \
        where \
            card.organization @> '%(organization)s'\
        and card.store ? 'enterorganization'\
        and card.store ? 'finishepicris'\
    "%(kwargs)
    # print(query)
    #...
    cursor = connection.cursor()
    cursor.execute(query)    
    cards = dictfetchall(cursor)  
    # print(cards)     

    items = cards
    items = [{
        'year':x['card_year'],

        # ..Всего женщин (число физических лиц)
        '1': 
            x['is_card'] 
        ,
        'rodi': 
            ( x['delivery']) or (x['pregnancy'] and x['cesarean'])
        ,
        # ..Отеки, протеинурия, гипертензивные расстройства преэклампсия, эклампсия
        '2.1.1':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and (x['proteinuria'])
        ,
        '2.1.2':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and (x['arterialhypertension'])
        ,        
        '2.1.3':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and (x['preeclampsia'])
        ,
        '2.1.4':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and (x['eclampsia'])
        ,        

        # ..Сахарный диабет болезни щитовидной железы другие эндокринные заболевания
        '2.2.1':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and (x['diabetes'])
        ,
        '2.2.2':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and (x['hypothyroidism'])
        ,
        '2.2.3': (x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and (x['hyperprolactinemia'])
        ,        

        # ..Преждевременный разрыв плодных оболочек
        '2.3.1':(x['pregnancy'] or x['delivery'])
            and(x['rupturemembranes'])
        ,

        # ..Кровотечения в связи с предлежанием плаценты
        '2.4.1':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and (x['delivhemorhag'])
            and (x['placentaprevia'])
        ,
        '2.4.2':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and (x['preghemorhag'])
            and (x['placentaprevia'])            
        ,     

        # ..Кровотечение в связи с нарушением  свертываемости крови
        '2.5.1':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and(x['delivhemorhag'])
            and(x['badcoagblood'])
        ,
        '2.5.2':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and(x['postpartumhemorhag'])
            and(x['badcoagblood'])
        ,        

        # ..Дородовое кровотечение в связи с нарушением свертываемости крови
        '2.6.1':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and (x['preghemorhag'])
            and (x['badcoagblood'])
        ,

        # ..Кровотечение  в связи  с преждевременной отслойкой плаценты
        '2.7.1':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and (x['preghemorhag'])
            and (x['detachplacent'])
        ,
        '2.7.2':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and (x['delivhemorhag'])
            and (x['detachplacent'])            
        ,

        # ..Нарушения родовой деятельности в т.ч. слабость родовой деятельности Дискоординация родовой деятельности
        '2.8.2':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and(x['weaknesslabor'])
        ,
        # ..стремительные роды
        '2.8.3':
                    0
        ,
        '2.8.4':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and(x['discoordinationlabor'])
        ,

        # ..Роды, осложненные патологией пуповины
        '2.9.1':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and(x['shellattachmentcord'])
        ,

        # ..Затрудненные роды
        '2.10.1':
                    0
        ,
        
        # ..Разрыв промежности III-IV степени
        '2.11.1': (x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and (x['perinealtear_tre'])
        ,
        '2.11.2': (x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and (x['perinealtear_for'])
        ,        

        # ..Разрыв матки всего
        '2.12.1': (x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and (x['uterotear'])
        ,# ..в т.ч. вне стационара
        '2.12.2':
            0
        ,

        # ..Кровотечение в последовом и послеродовом периоде
        '2.13.1': (x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and (x['postpartumhemorhag'])
        ,

        # ..Родовой сепсис, разлитая послеродовая инфекция
        '2.14.1':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and(x['sepsis'])
        ,
        '2.14.2':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and(x['peritonitis'])
        ,
        '2.14.3':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and(x['peritonitis'])
            and(x['cesarean'])                    
        ,
        '2.14.4':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and(x['septicemia'])
        ,

        # ..Болезни мочеполовой  системы
        '2.15.1':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and(x['cystitis'])
        ,
         
        # ..Венозные осложнения
        '2.16.1':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and(x['legvienvaricosity'])
        ,
         
        # ..Анемия
        '2.17.1':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and(x['ironanemia'])
        ,
        # ..Болезни системы кровообращения 
        '2.18.1':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and(x['arterialhypertension'])
        ,
        '2.18.2':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and(x['mitralprolapse'])
        ,
        '2.18.3':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and(x['ventseptdefect'])
        ,
        '2.18.4':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and(x['pulmhypertension'])
        ,                                
        # ..Акушерская эмболия 
        '2.19.1':(x['pregnancy'] or x['delivery'] or x['postcesarean'] or x['postpartum'])
            and(x['amnioticembolism'])
        ,
        # ..
    } for x  in items]   

    ds_total = [
        '2.1.1','2.1.2','2.1.3','2.1.4',
        '2.2.1','2.2.2','2.2.3',
        '2.3.1',
        '2.4.1','2.4.2',
        '2.5.1','2.5.2',
        '2.6.1',
        '2.7.1','2.7.2',
        '2.8.2','2.8.3','2.8.4',
        '2.9.1',
        '2.10.1',
        '2.11.1','2.11.2',
        '2.12.1',# '2.12.2',
        '2.13.1',
        '2.14.1','2.14.2', '2.14.4', #'2.14.3'
        '2.15.1',
        '2.16.1',
        '2.17.1',
        '2.18.1','2.18.2','2.18.3','2.18.4',
        '2.19.1',
    ]

    ds_list = [
        ('2',ds_total),
        ('2.1.1',['2.1.1','2.1.2']), ('2.1.2',['2.1.3','2.1.4']),
        ('2.2.1',['2.2.1','2.2.2','2.2.3']),        ('2.2.2',['2.2.1']),        ('2.2.3',['2.2.2']),        ('2.2.4',['2.2.3']),        
        ('2.3',['2.3.1']),
        ('2.4',['2.4.1','2.4.2']),
        ('2.5',['2.5.1','2.5.2']),
        ('2.6',['2.6.1']),
        ('2.7',['2.7.1','2.7.2']),
        ('2.8.1',['2.8.2','2.8.3','2.8.4']), ('2.8.2',['2.8.2']), ('2.8.3',['2.8.3']), ('2.8.4',['2.8.4']),                
        ('2.9',['2.9.1']),
        ('2.10',['2.10.1']),
        ('2.11',['2.11.1','2.11.2']),
        ('2.12.1',['2.12.1']),
        ('2.13',['2.13.1']),
        ('2.14.1',['2.14.1','2.14.2','2.14.4']),        ('2.14.2',['2.14.2']),        ('2.14.3',['2.14.3']),        ('2.14.4',['2.14.4']),
        ('2.15',['2.15.1']),
        ('2.16',['2.16.1']),
        ('2.17',['2.17.1']),
        ('2.18',['2.18.1','2.18.2','2.18.3','2.18.4']),
        ('2.19',['2.19.1']),

    ]

    items = sorted(items, key=lambda x: x['year'])
    items = groupby(items, key=lambda x: x['year']) 
    items = [(key,[item for item in values]) for key,values in items]    
  

    items = [concat({
        'year':key,
        '1':s('1',valuesiter),
    },d(ds_total,ds_list,valuesiter)) for key,valuesiter  in items]   
    # ...
    # ...
    context = {
        'datetime':datetime.now(),   
        'caption':'IX.4.  Заболевания осложнившие роды \
                            (осложнения родов и послеродового периода) \
                            включая отчётную форму № 32  (таблица 2211)',
        'organization':organization,
        'items':items,
    }
    return render(request, 'morbidity/reports/IX_4.html', context)        

@login_required
def IX_5(request,pk):    
    # ...****************************** organization ************************
    organization = Organization.objects.get(pk=pk)

    # ...***************************** ds **********************************
    ds_list = [
        ('pregnanthydrops','pregnanthydrops',None,None),
        ('gestosis','gestosis',None,None),        
        ('gestosis_degree_lgt','gestosis','degree','@>'"'"'{"id":"lgt"}'"'"),
        ('gestosis_degree_mid','gestosis','degree','@>'"'"'{"id":"mid"}'"'"),
        ('gestosis_degree_hrd','gestosis','degree','@>'"'"'{"id":"hrd"}'"'"),                
        ('preeclampsia','preeclampsia',None,None),
        ('eclampsia','eclampsia',None,None), 
        ('сombinedgestosis','сombinedgestosis',None,None),         

        ('delivery','delivery',None,None),
        ('pregnancy','pregnancy',None,None),
        ('cesarean','cesarean',None,None),
    ]
    # ...
    ds_count = Diagnosis.objects.filter(id__in=map(lambda x:x[1],ds_list)).count()
    # ....
    # ...***************************** docs **********************************
    docs = [
        # 'enterorganization',
        'beginepicris',
        'finishepicris',
        'cesarean',
        'delivery',
    ]

    # ..
    fields = [
        "card.id as card_id",
        "1 as is_card",
        "date_part('year',(card.store->'finishepicris'->>'datetime')::timestamp)::text as card_year",
    ]
    # print(fields)
    # ...
    for ds_nick,ds_id,ds_field,ds_cev in ds_list:
        fields.append(queries.ds_exists(
            block = '',
            docs = docs,
            ds_id = json.dumps({'id':ds_id}),
            ds_nick = ds_nick,
            ds_field = ds_field,
            ds_cev = ds_cev
        ))    
    # ....
    kwargs = {
        'organization':json.dumps({'id':pk}),
        'fields':', '.join(fields)        
    }
    # ..
    query = "\
        select \
            %(fields)s \
        from \
            orgzdrav_card as card \
        where \
            card.organization @> '%(organization)s'\
        and card.store ? 'enterorganization'\
        and card.store ? 'finishepicris'\
    "%(kwargs)
    # print(query)
    #...
    cursor = connection.cursor()
    cursor.execute(query)    
    cards = dictfetchall(cursor)  
    # print(cards)     

    items = cards
    items = [{
        'year':x['card_year'],

        '1': x['is_card'],
        'rodi': ( x['delivery']) or(x['pregnancy'] and x['cesarean']),
        '3.2':x['pregnanthydrops'],
        '3.3':x['gestosis_degree_lgt'],
        '3.4':x['gestosis_degree_mid'],
        '3.5':x['gestosis_degree_hrd'],        
        '3.6':x['preeclampsia'],        
        '3.7':x['eclampsia'],        
        '3.8':(x['pregnanthydrops'] or x['gestosis'] or x['preeclampsia'] or x['eclampsia']) 
            and (x['сombinedgestosis'])
        ,        

    } for x  in items]   

    ds_total = [
        '3.2',
        '3.3',
        '3.4',
        '3.5',
        '3.6',
        '3.7',
        '3.8',
    ]

    ds_list = [
        ('3.1',ds_total),
        ('3.2',['3.2']),
        ('3.3',['3.3']),
        ('3.4',['3.4']),
        ('3.5',['3.5']),
        ('3.6',['3.6']),
        ('3.7',['3.7']),
        ('3.8',['3.8']),    
    ]

    items = sorted(items, key=lambda x: x['year'])
    items = groupby(items, key=lambda x: x['year']) 
    items = [(key,[item for item in values]) for key,values in items]    

    items = [concat({
        'year':key,
        '1':s('1',valuesiter), 
    },d(ds_total,ds_list,valuesiter)) for key,valuesiter  in items]   
    # ...
    # ...
    context = {
        'datetime':datetime.now(),   
        'caption':'IX.5. Анализ поздних гестозов     (по классификации принятой в РФ).',
        'organization':organization,
        'items':items,
    }
    return render(request, 'morbidity/reports/IX_5.html', context)       

@login_required
def XI_1(request,pk):    
    # ...****************************** organization ************************
    organization = Organization.objects.get(pk=pk)    

    m_fields = [
        # .. card_id
        "card.id as card_id",

        # .. is_card
        "1 as is_card",

        # .. card_year
        "date_part('year',(card.store->'finishepicris'->>'datetime')::timestamp)::text as card_year",
    ]
    c_fields = [
        # .Родилось живыми
        ('c_child_alivebirth_count',"(select \
                count(*)\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where (\
                not child->'data' ? 'mortepicris' \
            or child->'data'->'birthdatetime' < child->'data'->'mortepicris'->'data'->'mortdatetime'\
            ) %(exist)s \
        ) as c_child_alivebirth_count_%(name)s"),

        # ..из них умерло - всего
        ('c_child_died_count',"(select \
                count(*)\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where (\
                child->'data'->'birthdatetime' < child->'data'->'mortepicris'->'data'->'mortdatetime'\
            ) %(exist)s \
        ) as c_child_died_count_%(name)s"),

        # ..из них:    умерло в первые 168 часов
        ('c_child_died_168h_count',"(select \
                count(*)\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where (\
                date_part('hour', \
                    age(\
                        (child->'data'->'mortepicris'->'data'->>'mortdatetime')::timestamp \
                        ,\
                        (child->'data'->>'birthdatetime')::timestamp  \
                    ) \
                ) < 168 \
            ) %(exist)s \
        ) as c_child_died_168h_count_%(name)s"),

        # ..из них  в первые 0-24  часа  
        ('c_child_died_24h_count',"(select \
                count(*)\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where (\
                date_part('hour', \
                    age(\
                        (child->'data'->'mortepicris'->'data'->>'mortdatetime')::timestamp \
                        ,\
                        (child->'data'->>'birthdatetime')::timestamp  \
                    ) \
                ) < 24 \
            ) %(exist)s \
        ) as c_child_died_24h_count_%(name)s"),

        # ..Родилось мёртвыми
        ('c_child_mortalbirth_count',"(select \
                count(*)\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where (\
                child->'data'->'birthdatetime' = child->'data'->'mortepicris'->'data'->'mortdatetime' \
            ) %(exist)s \
        ) as c_child_mortalbirth_count_%(name)s"),

        # ..из них смерть наступила до начала родовой деятельности
        ('c_child_mortalbirth_antenatal_count',"(select \
                count(*)\
            from \
                jsonb_array_elements(card.store->'children') as child \
            where ( \
                child->'data'->'birthdatetime' = child->'data'->'mortepicris'->'data'->'mortdatetime' \
            and ( \
                exists( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where \
                        ds @> '{"'"'"id"'"'": "'"'"antenatal"'"'"}' \
                ) or \
                exists( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(child->'data'->'mortepicris'->'data'->'diagnoses') as ds \
                    where \
                        ds @> '{"'"'"id"'"'": "'"'"antenatal"'"'"}' \
                ) \
            )\
            ) %(exist)s \
        ) as c_child_mortalbirth_antenatal_count_%(name)s"),

    ]
    # ...
    j_fields = [
        ('500_749',"and (child->'data'->>'childweight')::int between 500 and 749",),
        ('750_999',"and (child->'data'->>'childweight')::int between 750 and 999",),
        ('1000_1499',"and (child->'data'->>'childweight')::int between 1000 and 1499",),
        ('1500_1999',"and (child->'data'->>'childweight')::int between 1500 and 1999",),
        ('2000_2499',"and (child->'data'->>'childweight')::int between 2000 and 2499",),
        ('2500_2999',"and (child->'data'->>'childweight')::int between 2500 and 2999",),
        ('3000_3499',"and (child->'data'->>'childweight')::int between 3000 and 3499",),
        ('3500_3999',"and (child->'data'->>'childweight')::int between 3500 and 3999",),
        ('4000_lte',"and (child->'data'->>'childweight')::int >= 4000",),        
        ('prematureinfant',"\
            and \
                exists( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where \
                        ds @> '{"'"'"id"'"'": "'"'"prematureinfant"'"'"}' \
                ) \
        ",),
        ('prematureinfant_lt_28',"\
            and \
                exists( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where \
                        ds @> '{"'"'"id"'"'": "'"'"prematureinfant"'"'"}' \
                    and (ds->'fields'->'gestation'->>'value')::int < 28 \
                ) \
        ",),                 
    ]

    f_fields = []
    for c_name,c_field in c_fields:
        for j_name,j_field in j_fields:
            f_fields.append(c_field%dict(exist=j_field,name=j_name))            
        
    # ....
    kwargs = {
        'organization':json.dumps({'id':pk}),
        'fields':', '.join(m_fields+f_fields)
    }
    # ..
    query = "\
        select \
            %(fields)s \
        from \
            orgzdrav_card as card \
        where \
            card.organization @> '%(organization)s'\
        and card.store ? 'enterorganization'\
        and card.store ? 'finishepicris'\
    "%(kwargs)
    # print(query)
    #...
    cursor = connection.cursor()
    cursor.execute(query)    
    cards = dictfetchall(cursor)  
    # print(cards)           

    items = cards
    items = sorted(items, key=lambda x: x['card_year'])
    items = groupby(items, key=lambda x: x['card_year']) 
    items = [(key,[item for item in values]) for key,values in items]    

    items = [concat({
        'year':key,
        'is_card':s('is_card',valuesiter), 
    },da(c_fields,j_fields,valuesiter)) for key,valuesiter  in items]   

    at_fields = [
        '500_749',
        '750_999',
        '1000_1499',
        '1500_1999',
        '2000_2499',
        '2500_2999',
        '3000_3499',
        '3500_3999',
        '4000_lte',
    ]

    context = {
        'datetime':datetime.now(),   
        'caption':'XI.1. Распределение родившихся и умерших по массе тела при рождении',
        'organization':organization,
        'items':items,
        'at_fields':at_fields,
        'aj_fields':list(map(lambda x:x[0],j_fields)),
    }
    return render(request, 'morbidity/reports/XI_1.html', context)           

@login_required
def XI_1_1(request,pk):    
    # ..
    organization = Organization.objects.get(pk=pk)    

    fields = [
        # .. card_id
        "card.id as card_id",

        # .. is_card
        "1 as is_card",

        # .. card_year
        "date_part('year',(card.store->'finishepicris'->'datetime')::text::timestamp)::text as card_year",

        # ..c_child_vaccinetuberculosis_count
        "(select \
                count( \
                    (select \
                            count(*) \
                        from \
                            jsonb_array_elements(child->'data'->'services') as service \
                        where \
                            service ->> 'id' = 'vaccinetuberculosis' \
                    ) \
                )\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where \
                child->'data' ? 'services'\
        ) as c_child_vaccinetuberculosis_count",

        # ..c_child_vaccinationhepatitisb_count
        "(select \
                count( \
                    (select \
                            count(*) \
                        from \
                            jsonb_array_elements(child->'data'->'services') as service \
                        where \
                            service ->> 'id' = 'vaccinationhepatitisB' \
                    ) \
                )\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where \
                child->'data' ? 'services'\
        ) as c_child_vaccinationhepatitisb_count",

        # ..c_child_heredmetabolscreening_count
        "(select \
                count( \
                    (select \
                            count(*) \
                        from \
                            jsonb_array_elements(child->'data'->'services') as service \
                        where \
                            service ->> 'id' = 'heredmetabolscreening' \
                    ) \
                )\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where \
                child->'data' ? 'services'\
        ) as c_child_heredmetabolscreening_count",        

        # ..c_child_hearingscreening_count
        "(select \
                count( \
                    (select \
                            count(*) \
                        from \
                            jsonb_array_elements(child->'data'->'services') as service \
                        where \
                            service ->> 'id' = 'hearingscreening' \
                    ) \
                )\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where \
                child->'data' ? 'services'\
        ) as c_child_hearingscreening_count",

        # ..c_child_is_retreatment_count
        "(select \
                count(*)\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where \
                (child->'data'->>'is_retreatment')::boolean is True \
        ) as c_child_is_retreatment_count",

        # ..c_child_aidsmother_count
        "(select \
                count(*)\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where \
                exists ( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(card.store->'beginepicris'->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'aids' \
                ) or exists (\
                    select \
                        * \
                    from \
                        jsonb_array_elements(card.store->'delivery'->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'aids' \
                ) or exists (\
                    select \
                        * \
                    from \
                        jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'aids' \
                ) or exists (\
                    select \
                        * \
                    from \
                        jsonb_array_elements(card.store->'finishepicris'->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'aids' \
                ) \
        ) as c_child_aidsmother_count",

        # ..c_child_alivebirth_aidsmother_count
        "(select \
                count(*)\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where (\
                not child->'data' ? 'mortepicris' \
                or child->'data'->'birthdatetime' < child->'data'->'mortepicris'->'data'->'mortdatetime'\
            ) and ( \
                    exists ( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(card.store->'beginepicris'->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'aids' \
                ) or exists (\
                    select \
                        * \
                    from \
                        jsonb_array_elements(card.store->'delivery'->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'aids' \
                ) or exists (\
                    select \
                        * \
                    from \
                        jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'aids' \
                ) or exists (\
                    select \
                        * \
                    from \
                        jsonb_array_elements(card.store->'finishepicris'->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'aids' \
                ) \
            ) \
        ) as c_child_alivebirth_aidsmother_count",

        # ..c_child_died_aidsmother_count
        "(select \
                count(*)\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where (\
                child->'data'->'birthdatetime' < child->'data'->'mortepicris'->'data'->'mortdatetime'\
            ) and ( \
                    exists ( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(card.store->'beginepicris'->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'aids' \
                ) or exists (\
                    select \
                        * \
                    from \
                        jsonb_array_elements(card.store->'delivery'->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'aids' \
                ) or exists (\
                    select \
                        * \
                    from \
                        jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'aids' \
                ) or exists (\
                    select \
                        * \
                    from \
                        jsonb_array_elements(card.store->'finishepicris'->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'aids' \
                ) \
            ) \
        ) as c_child_died_aidsmother_count",  

        # ..c_child_died_168h_aidsmother_count
        "(select \
                count(*)\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where (\
                date_part('hour', \
                    age(\
                        (child->'data'->'mortepicris'->'data'->>'mortdatetime')::timestamp \
                        ,\
                        (child->'data'->>'birthdatetime')::timestamp  \
                    ) \
                ) < 168 \
            ) and ( \
                    exists ( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(card.store->'beginepicris'->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'aids' \
                ) or exists (\
                    select \
                        * \
                    from \
                        jsonb_array_elements(card.store->'delivery'->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'aids' \
                ) or exists (\
                    select \
                        * \
                    from \
                        jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'aids' \
                ) or exists (\
                    select \
                        * \
                    from \
                        jsonb_array_elements(card.store->'finishepicris'->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'aids' \
                ) \
            ) \
        ) as c_child_died_168h_aidsmother_count",  

        # ..c_child_died_7d_27d_aidsmother_count
        "(select \
                count(*)\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where (\
                date_part('day', \
                    age(\
                        (child->'data'->'mortepicris'->'data'->>'mortdatetime')::timestamp \
                        ,\
                        (child->'data'->>'birthdatetime')::timestamp  \
                    ) \
                ) between 7 and 27 \
            ) and ( \
                    exists ( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(card.store->'beginepicris'->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'aids' \
                ) or exists (\
                    select \
                        * \
                    from \
                        jsonb_array_elements(card.store->'delivery'->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'aids' \
                ) or exists (\
                    select \
                        * \
                    from \
                        jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'aids' \
                ) or exists (\
                    select \
                        * \
                    from \
                        jsonb_array_elements(card.store->'finishepicris'->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'aids' \
                ) \
            ) \
        ) as c_child_died_7d_27d_aidsmother_count",                            
    ]

    kwargs = {
        'organization':json.dumps({'id':pk}),
        'fields':', '.join(fields)        
    }
    # ..
    query = "\
        select \
            %(fields)s \
        from \
            orgzdrav_card as card \
        where \
            card.organization @> '%(organization)s'\
        and card.store ? 'enterorganization'\
        and card.store ? 'finishepicris'\
    "%(kwargs)
    # print(query)
    #...
    cursor = connection.cursor()
    cursor.execute(query)    
    cards = dictfetchall(cursor)  
    # print(cards)           


    items = cards
    items = sorted(items, key=lambda x: x['card_year'])
    items = groupby(items, key=lambda x: x['card_year']) 
    items = [(key,[item for item in values]) for key,values in items]    

    items = [{
        'year':key,
        'is_card':s('is_card',valuesiter), 
        'c_child_vaccinetuberculosis_count':s('c_child_vaccinetuberculosis_count',valuesiter),
        'c_child_vaccinationhepatitisb_count':s('c_child_vaccinationhepatitisb_count',valuesiter),
        'c_child_heredmetabolscreening_count':s('c_child_heredmetabolscreening_count',valuesiter),
        'c_child_hearingscreening_count':s('c_child_hearingscreening_count',valuesiter),
        'c_child_is_retreatment_count':s('c_child_is_retreatment_count',valuesiter),
        'c_child_aidsmother_count':s('c_child_aidsmother_count',valuesiter),
        'c_child_alivebirth_aidsmother_count':s('c_child_alivebirth_aidsmother_count',valuesiter),
        'c_child_died_aidsmother_count':s('c_child_died_aidsmother_count',valuesiter),
        'c_child_died_168h_aidsmother_count':s('c_child_died_168h_aidsmother_count',valuesiter),
        'c_child_died_7d_27d_aidsmother_count':s('c_child_died_7d_27d_aidsmother_count',valuesiter),        
    } for key,valuesiter  in items]   


    context = {
        'datetime':datetime.now(),   
        'caption':'XI.1.1 Таблица',
        'organization':organization,
        'items':items,
    }
    return render(request, 'morbidity/reports/XI_1_1.html', context)               


@login_required
def XI_2(request,pk):    
    # ..
    organization = Organization.objects.get(pk=pk)        

    m_fields = [
        # .. card_id
        "card.id as card_id",

        # .. is_card
        "1 as is_card",

        # .. card_year
        "date_part('year',(card.store->'finishepicris'->>'datetime')::timestamp)::text as card_year",
    ]
    c_fields = [
        # .Родилось живыми
        ('c_child_alivebirth_count',"(select \
                count(*)\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where (\
                not child->'data' ? 'mortepicris' \
            or child->'data'->'birthdatetime' < child->'data'->'mortepicris'->'data'->'mortdatetime'\
            ) and ( \
                (child->'data'->>'childweight')::int between 500 and 999\
            )\
            %(exist)s \
        ) as c_child_alivebirth_count_%(name)s"),

        # ..из них умерло - всего
        ('c_child_died_count',"(select \
                count(*)\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where (\
                child->'data'->'birthdatetime' < child->'data'->'mortepicris'->'data'->'mortdatetime'\
            ) and ( \
                (child->'data'->>'childweight')::int between 500 and 999 \
            )\
            %(exist)s \
        ) as c_child_died_count_%(name)s"),

        # ..из них:    умерло в первые 6 суток
        ('c_child_died_6d_count',"(select \
                count(*)\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where (\
                date_part('day', \
                    age(\
                        (child->'data'->'mortepicris'->'data'->>'mortdatetime')::timestamp \
                        ,\
                        (child->'data'->>'birthdatetime')::timestamp  \
                    ) \
                ) <= 6 \
            ) and ((child->'data'->>'childweight')::int between 500 and 999)\
            %(exist)s \
        ) as c_child_died_6d_count_%(name)s"),

        # # ..из них  в первые 0-24  часа  
        # ('c_child_died_24h_count',"(select \
        #         count(*)\
        #     from \
        #          jsonb_array_elements(card.store->'children') as child \
        #     where (\
        #         date_part('hour', \
        #             age(\
        #                 (child->'data'->'mortepicris'->'data'->>'mortdatetime')::timestamp \
        #                 ,\
        #                 (child->'data'->>'birthdatetime')::timestamp  \
        #             ) \
        #         ) < 24 \
        #     ) %(exist)s \
        # ) as c_child_died_24h_count_%(name)s"),

        # # ..Родилось мёртвыми
        # ('c_child_mortalbirth_count',"(select \
        #         count(*)\
        #     from \
        #          jsonb_array_elements(card.store->'children') as child \
        #     where (\
        #         child->'data'->'birthdatetime' = child->'data'->'mortepicris'->'data'->'mortdatetime' \
        #     ) %(exist)s \
        # ) as c_child_mortalbirth_count_%(name)s"),

        # # ..из них смерть наступила до начала родовой деятельности
        # ('c_child_mortalbirth_antenatal_count',"(select \
        #         count(*)\
        #     from \
        #         jsonb_array_elements(card.store->'children') as child \
        #     where ( \
        #         child->'data'->'birthdatetime' = child->'data'->'mortepicris'->'data'->'mortdatetime' \
        #     and ( \
        #         exists( \
        #             select \
        #                 * \
        #             from \
        #                 jsonb_array_elements(child->'data'->'diagnoses') as ds \
        #             where \
        #                 ds @> '{"'"'"id"'"'": "'"'"antenatal"'"'"}' \
        #         ) or \
        #         exists( \
        #             select \
        #                 * \
        #             from \
        #                 jsonb_array_elements(child->'data'->'mortepicris'->'data'->'diagnoses') as ds \
        #             where \
        #                 ds @> '{"'"'"id"'"'": "'"'"antenatal"'"'"}' \
        #         ) \
        #     )\
        #     ) %(exist)s \
        # ) as c_child_mortalbirth_antenatal_count_%(name)s"),

    ]
    # ...
    j_fields = [
        ('all'," \
            and exists( \
                select * from jsonb_array_elements(child->'data'->'diagnoses') as ds \
            )\
        ",),
        ('birthtrauma',"\
            and \
                exists( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'birthtrauma' \
                ) \
        ",),

        ('intracranlacerhaemorrhage',"\
            and \
                exists( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'intracranlacerhaemorrhage' \
                    and ds->>'id' = 'birthtrauma' \
                ) \
        ",),

        ('intracrannontraumhaemorrhage',"\
            and \
                exists( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'intracrannontraumhaemorrhage' \
                ) \
        ",),

        ('intrauterinehypoxia_birthasphyxia',"\
            and \
                exists( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'intrauterinehypoxia' \
                        or ds->>'id' = 'birthasphyxia' \
                ) \
        ",),

        ('respiratorydistressnewborn',"\
            and \
                exists( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'respiratorydistressnewborn' \
                ) \
        ",),

        ('congenitalpneumonia',"\
            and \
                exists( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'congenitalpneumonia' \
                ) \
        ",),

        ('neoaspsynd',"\
            and \
                exists( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'neoaspsynd' \
                ) \
        ",),

        ('neoasppneumonia',"\
            and \
                exists( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'neoasppneumonia' \
                ) \
        ",),
        
        ('bacterialsepsisnewborn',"\
            and \
                exists( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'bacterialsepsisnewborn' \
                ) \
        ",), 

        ('disturbances_of_cerebral_status',"\
            and \
                exists( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'neonatalcoma' \
                        /*or*/ \
                ) \
        ",),

        ('congenital_anomalies',"\
            and \
                exists( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'arnoldchiarisyndrome' \
                        /*or*/ \
                ) \
        ",),        
    ]

    f_fields = []
    for c_name,c_field in c_fields:
        for j_name,j_field in j_fields:
            f_fields.append(c_field%dict(exist=j_field,name=j_name))            
        
    # ....
    kwargs = {
        'organization':json.dumps({'id':pk}),
        'fields':', '.join(m_fields+f_fields)
    }
    # ..
    query = "\
        select \
            %(fields)s \
        from \
            orgzdrav_card as card \
        where \
            card.organization @> '%(organization)s'\
        and card.store ? 'enterorganization'\
        and card.store ? 'finishepicris'\
    "%(kwargs)
    # print(query)
    #...
    cursor = connection.cursor()
    cursor.execute(query)    
    cards = dictfetchall(cursor)  
    # print(cards)           

    items = cards
    items = sorted(items, key=lambda x: x['card_year'])
    items = groupby(items, key=lambda x: x['card_year']) 
    items = [(key,[item for item in values]) for key,values in items]    

    items = [concat({
        'year':key,
        'is_card':s('is_card',valuesiter), 
    },da(c_fields,j_fields,valuesiter)) for key,valuesiter  in items]   

    # print(items)
    at_fields_a_1 = [
        'bacterialsepsisnewborn'
    ]
    at_fields_a = [
        'birthtrauma',
        'intracrannontraumhaemorrhage',
        'intrauterinehypoxia_birthasphyxia',
        'respiratorydistressnewborn',
        'congenitalpneumonia',
        'neoaspsynd',
        'neoasppneumonia',
        'disturbances_of_cerebral_status'

    ] + at_fields_a_1

    at_fields_b = [
        'congenital_anomalies'
    ]

    at_fields_c = [

    ]

    at_fields = at_fields_a + at_fields_b + at_fields_c 

    context = {
        'datetime':datetime.now(),   
        'caption':'XI.2. Заболевания и причины смерти новорожденных (плодов), родившихся с массой тела 500-999 грамм.',
        'organization':organization,
        'items':items,
        'at_fields':at_fields,
        'at_fields_a':at_fields_a,
        'at_fields_a_1':at_fields_a_1,        
        'at_fields_b':at_fields_b,
        'at_fields_c':at_fields_c,                        
        # 'aj_fields':list(map(lambda x:x[0],j_fields)),
    }
    return render(request, 'morbidity/reports/XI_2.html', context)         

@login_required
def XI_3(request,pk):    
    # ..
    organization = Organization.objects.get(pk=pk)        

    m_fields = [
        # .. card_id
        "card.id as card_id",

        # .. is_card
        "1 as is_card",

        # .. card_year
        "date_part('year',(card.store->'finishepicris'->>'datetime')::timestamp)::text as card_year",
    ]
    # c_fields = [
    #     # .Родилось живыми и больными
    #     ('c_child_alivebirth_count',"(select \
    #             count(*)\
    #         from \
    #              jsonb_array_elements(card.store->'children') as child \
    #         where (\
    #             not child->'data' ? 'mortepicris' \
    #         or child->'data'->'birthdatetime' < child->'data'->'mortepicris'->'data'->'mortdatetime'\
    #         ) and ( \
    #             (child->'data'->>'childweight')::int >= 1000 \
    #         ) \
    #         %(exist)s \
    #     ) as c_child_alivebirth_count_%(name)s"),

    #     ('mc_child_alivebirth_count',"(select \
    #             coalesce( sum( \
    #                 (select \
    #                     count(*) \
    #                 from  \
    #                     jsonb_array_elements(child->'data'->'diagnoses') as ds \
    #                     %(where)s \
    #                 ) \
    #             ),0)\
    #         from \
    #              jsonb_array_elements(card.store->'children') as child \
    #         where (\
    #             not child->'data' ? 'mortepicris' \
    #         or child->'data'->'birthdatetime' < child->'data'->'mortepicris'->'data'->'mortdatetime'\
    #         ) and ( \
    #             (child->'data'->>'childweight')::int >= 1000 \
    #         ) \
    #     ) as mc_child_alivebirth_count_%(name)s"),

    #     # .Родилось живыми , больными  и недоношенными
    #     ('c_child_alivebirth_prematureinfant_count',"(select \
    #             count(*)\
    #         from \
    #              jsonb_array_elements(card.store->'children') as child \
    #         where (\
    #             not child->'data' ? 'mortepicris' \
    #             or child->'data'->'birthdatetime' < child->'data'->'mortepicris'->'data'->'mortdatetime'\
    #         ) and ( \
    #             (child->'data'->>'childweight')::int >= 1000 \
    #         ) and exists( \
    #                 select \
    #                     * \
    #                 from \
    #                     jsonb_array_elements(child->'data'->'diagnoses') as ds \
    #                 where \
    #                     ds->>'id' = 'prematureinfant' \
    #         ) \
    #         %(exist)s \
    #     ) as c_child_alivebirth_prematureinfant_count_%(name)s"),

    #     ('mc_child_alivebirth_prematureinfant_count',"(select \
    #             coalesce( sum( \
    #                 (select \
    #                     count(*) \
    #                 from  \
    #                     jsonb_array_elements(child->'data'->'diagnoses') as ds \
    #                     %(where)s \
    #                 ) \
    #             ),0)\
    #         from \
    #              jsonb_array_elements(card.store->'children') as child \
    #         where (\
    #             not child->'data' ? 'mortepicris' \
    #             or child->'data'->'birthdatetime' < child->'data'->'mortepicris'->'data'->'mortdatetime'\
    #         ) and ( \
    #             (child->'data'->>'childweight')::int >= 1000 \
    #         ) and exists( \
    #                 select \
    #                     * \
    #                 from \
    #                     jsonb_array_elements(child->'data'->'diagnoses') as ds \
    #                 where \
    #                     ds->>'id' = 'prematureinfant' \
    #         ) \
    #     ) as mc_child_alivebirth_prematureinfant_count_%(name)s"),        

    #     # ..из них умерло - всего
    #     ('c_child_died_count',"(select \
    #             count(*)\
    #         from \
    #              jsonb_array_elements(card.store->'children') as child \
    #         where (\
    #             child->'data'->'birthdatetime' < child->'data'->'mortepicris'->'data'->'mortdatetime'\
    #         ) and ( \
    #             (child->'data'->>'childweight')::int >= 1000 \
    #         )\
    #         %(exist)s \
    #     ) as c_child_died_count_%(name)s"),
    #     ('mc_child_died_count',"(select \
    #             coalesce( sum( \
    #                 (select \
    #                     count(*) \
    #                 from  \
    #                     jsonb_array_elements(child->'data'->'diagnoses') as ds \
    #                     %(where)s \
    #                 ) \
    #             ),0)\
    #         from \
    #              jsonb_array_elements(card.store->'children') as child \
    #         where (\
    #             child->'data'->'birthdatetime' < child->'data'->'mortepicris'->'data'->'mortdatetime'\
    #         ) and ( \
    #             (child->'data'->>'childweight')::int >= 1000 \
    #         )\
    #     ) as mc_child_died_count_%(name)s"),        

    #     # ..из них умерло - всего  недоношенные
    #     ('c_child_died_prematureinfant_count',"(select \
    #             count(*)\
    #         from \
    #              jsonb_array_elements(card.store->'children') as child \
    #         where (\
    #             child->'data'->'birthdatetime' < child->'data'->'mortepicris'->'data'->'mortdatetime'\
    #         ) and ( \
    #             (child->'data'->>'childweight')::int >= 1000 \
    #         ) and exists( \
    #                 select \
    #                     * \
    #                 from \
    #                     jsonb_array_elements(child->'data'->'diagnoses') as ds \
    #                 where \
    #                     ds->>'id' = 'prematureinfant' \
    #         ) \
    #         %(exist)s \
    #     ) as c_child_died_prematureinfant_count_%(name)s"),     

    #     ('mc_child_died_prematureinfant_count',"(select \
    #             coalesce( sum( \
    #                 (select \
    #                     count(*) \
    #                 from  \
    #                     jsonb_array_elements(child->'data'->'diagnoses') as ds \
    #                     %(where)s \
    #                 ) \
    #             ),0)\
    #         from \
    #              jsonb_array_elements(card.store->'children') as child \
    #         where (\
    #             child->'data'->'birthdatetime' < child->'data'->'mortepicris'->'data'->'mortdatetime'\
    #         ) and ( \
    #             (child->'data'->>'childweight')::int >= 1000 \
    #         ) and exists( \
    #                 select \
    #                     * \
    #                 from \
    #                     jsonb_array_elements(child->'data'->'diagnoses') as ds \
    #                 where \
    #                     ds->>'id' = 'prematureinfant' \
    #         ) \
    #     ) as mc_child_died_prematureinfant_count_%(name)s"),                

    #     # ..из них:    умерло в первые 6 суток
    #     ('c_child_died_6d_count',"(select \
    #             count(*)\
    #         from \
    #              jsonb_array_elements(card.store->'children') as child \
    #         where (\
    #             date_part('day', \
    #                 age(\
    #                     (child->'data'->'mortepicris'->'data'->>'mortdatetime')::timestamp \
    #                     ,\
    #                     (child->'data'->>'birthdatetime')::timestamp  \
    #                 ) \
    #             ) <= 6 \
    #         ) and ( \
    #             (child->'data'->>'childweight')::int >= 1000 \
    #         )\
    #         %(exist)s \
    #     ) as c_child_died_6d_count_%(name)s"),

    #     ('mc_child_died_6d_count',"(select \
    #             coalesce( sum( \
    #                 (select \
    #                     count(*) \
    #                 from  \
    #                     jsonb_array_elements(child->'data'->'diagnoses') as ds \
    #                     %(where)s \
    #                 ) \
    #             ),0)\
    #         from \
    #              jsonb_array_elements(card.store->'children') as child \
    #         where (\
    #             date_part('day', \
    #                 age(\
    #                     (child->'data'->'mortepicris'->'data'->>'mortdatetime')::timestamp \
    #                     ,\
    #                     (child->'data'->>'birthdatetime')::timestamp  \
    #                 ) \
    #             ) <= 6 \
    #         ) and ( \
    #             (child->'data'->>'childweight')::int >= 1000 \
    #         )\
    #     ) as mc_child_died_6d_count_%(name)s"),        

    #     # ..Родилось мёртвыми
    #     ('c_child_mortalbirth_count',"(select \
    #             count(*)\
    #         from \
    #              jsonb_array_elements(card.store->'children') as child \
    #         where (\
    #             child->'data'->'birthdatetime' = child->'data'->'mortepicris'->'data'->'mortdatetime' \
    #         ) and ( \
    #             (child->'data'->>'childweight')::int >= 1000 \
    #         )\
    #         %(exist)s \
    #     ) as c_child_mortalbirth_count_%(name)s"),

    #     ('mc_child_mortalbirth_count',"(select \
    #             coalesce( sum( \
    #                 (select \
    #                     count(*) \
    #                 from  \
    #                     jsonb_array_elements(child->'data'->'diagnoses') as ds \
    #                     %(where)s \
    #                 ) \
    #             ),0)\
    #         from \
    #              jsonb_array_elements(card.store->'children') as child \
    #         where (\
    #             child->'data'->'birthdatetime' = child->'data'->'mortepicris'->'data'->'mortdatetime' \
    #         ) and ( \
    #             (child->'data'->>'childweight')::int >= 1000 \
    #         )\
    #     ) as mc_child_mortalbirth_count_%(name)s"),        


    # ]

    
    pc_fields = [
        # .Родилось живыми и больными
        ('c_child_alivebirth_count',"(select \
                %(fn)s\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where (\
                not child->'data' ? 'mortepicris' \
            or child->'data'->'birthdatetime' < child->'data'->'mortepicris'->'data'->'mortdatetime'\
            ) and ( \
                (child->'data'->>'childweight')::int >= 1000 \
            ) \
            %(exists)s \
        ) as %(name)s"),

        # .Родилось живыми , больными  и недоношенными
        ('c_child_alivebirth_prematureinfant_count',"(select \
                %(fn)s\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where (\
                not child->'data' ? 'mortepicris' \
                or child->'data'->'birthdatetime' < child->'data'->'mortepicris'->'data'->'mortdatetime'\
            ) and ( \
                (child->'data'->>'childweight')::int >= 1000 \
            ) and exists( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'prematureinfant' \
            ) \
            %(exists)s \
        ) as %(name)s"),

        # ..из них умерло - всего
        ('c_child_died_count',"(select \
                %(fn)s\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where (\
                child->'data'->'birthdatetime' < child->'data'->'mortepicris'->'data'->'mortdatetime'\
            ) and ( \
                (child->'data'->>'childweight')::int >= 1000 \
            )\
            %(exists)s \
        ) as %(name)s"),

        # ..из них умерло - всего  недоношенные
        ('c_child_died_prematureinfant_count',"(select \
                %(fn)s\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where (\
                child->'data'->'birthdatetime' < child->'data'->'mortepicris'->'data'->'mortdatetime'\
            ) and ( \
                (child->'data'->>'childweight')::int >= 1000 \
            ) and exists( \
                    select \
                        * \
                    from \
                        jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where \
                        ds->>'id' = 'prematureinfant' \
            ) \
            %(exists)s \
        ) as %(name)s"),

        # ..из них:    умерло в первые 6 суток
        ('c_child_died_6d_count',"(select \
                %(fn)s\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where (\
                date_part('day', \
                    age(\
                        (child->'data'->'mortepicris'->'data'->>'mortdatetime')::timestamp \
                        ,\
                        (child->'data'->>'birthdatetime')::timestamp  \
                    ) \
                ) <= 6 \
            ) and ( \
                (child->'data'->>'childweight')::int >= 1000 \
            )\
            %(exists)s \
        ) as %(name)s"),

        # ..Родилось мёртвыми
        ('c_child_mortalbirth_count',"(select \
                %(fn)s\
            from \
                 jsonb_array_elements(card.store->'children') as child \
            where (\
                child->'data'->'birthdatetime' = child->'data'->'mortepicris'->'data'->'mortdatetime' \
            ) and ( \
                (child->'data'->>'childweight')::int >= 1000 \
            )\
            %(exists)s \
        ) as %(name)s"),
    ]

    p_fields= [{
        'fn':" count(*) ",
        'exists':"  %(exist)s ",
        'pref':"",
    },{
        'fn':" coalesce(\
                    sum(\
                        ( \
                            select \
                                count(*) \
                            from \
                                jsonb_array_elements(child->'data'->'diagnoses') as ds \
                            %(where)s \
                        )\
                    )\
                ,0) ",
        'exists':"",
        'pref':"m",
    }]

    def gen_c_fields(pc_fields,p_fields):
        for px,py in pc_fields:
            for p_field in p_fields:
                yield (p_field['pref']+px, py\
                    %dict(
                        fn=p_field['fn'],
                        exists=p_field['exists'],
                        name='%(pref)s%(corn)s_%(name)s'%dict(
                            pref=p_field['pref'],
                            corn=px,
                            name='%(name)s'
                        )
                    )
                ) 
    c_fields = list(gen_c_fields(pc_fields,p_fields))


    # ...
    j_fields_dict = {
        'j_fields_1':[(
                'gr_1'," and exists( select * from jsonb_array_elements(child->'data'->'diagnoses') )",
        )],
        'j_fields_2':[(
                'gr_2'," and exists( select * from jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where ds->>'id' = 'pharyngitis') ",
        )],
        'j_fields_3':[(
                'gr_3'," and exists( select * from jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where ds->>'id' = 'impetigo' ) ",
        )],
        'j_fields_4_1':[(
                'gr_4_1'," and exists( select * from jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where ds->>'id' = 'slfetgrowthmalnut' \
                ) ",
        )],               
        'j_fields_4_2':[(
                'gr_4_2'," and exists( select * from jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where ds->>'id' = 'birthtrauma' \
                ) ",
        )],            
        'j_fields_4_2_1':[(
                'gr_4_2_1'," and exists( select * from jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where ds->>'id' = 'birthtrauma' \
                    and ds->>'id' = 'intracranlacerhaemorrhage' ) ",
        )],
        'j_fields_4_3':[(
                'gr_4_3'," and exists( select * from jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where ds->>'id' = 'birthasphyxia' ) ",
        )],         
        'j_fields_4_4':[(
                'gr_4_4_1'," and exists( select * from jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where ds->>'id' = 'respiratorydistressnewborn') ",
            ),(
                'gr_4_4_2'," and exists( select * from jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where ds->>'id' = 'congenitalpneumonia') ",
            ),(
                'gr_4_4_3'," and exists( select * from jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where ds->>'id' = 'neoaspsynd') ",
            ),(
                'gr_4_4_4'," and exists( select * from jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where ds->>'id' = 'neoasppneumonia') ",
        )],        
        'j_fields_4_5':[(
                'gr_4_5_1'," and exists( select * from jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where ds->>'id' = 'bacterialsepsisnewborn') ",
        )],
        'j_fields_4_6':[(
                'gr_4_6'," and exists( select * from jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where ds->>'id' = 'dissemintravascoag') ",
        )],   
        'j_fields_4_7':[(
                'gr_4_7'," and exists( select * from jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where ds->>'id' = 'intracrannontraumhaemorrhage') ",
        )],                       
        'j_fields_4_8':[(
                'gr_4_8'," and exists( select * from jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where ds->>'id' = 'haemoldisnewborn' ) ",   
        )],                       
        'j_fields_4_9':[(
                'gr_4_9'," and exists( select * from jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where ds->>'id' = 'neonataljaundice' ) ",
        )],                       
        'j_fields_4_10':[(
                'gr_4_10'," and exists( select * from jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where ds->>'id' = 'neonatalcoma' ) ",
        )],                       
        'j_fields_4_11':[(
                'gr_4_11'," and exists( select * from jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where ds->>'id' = 'syndromeinfantdiabeticmother' ) ",                    
        )],           
        'j_fields_5':[(
                'gr_5'," and exists( select * from jsonb_array_elements(child->'data'->'diagnoses') as ds \
                    where ds->>'id' = 'arnoldchiarisyndrome' ) ",
        )],                
    }
    # ...
    j_fields_dict['j_fields_6'] = [(
        'gr_6', reduce(        
            lambda x,y:x+re.sub('^\W+and\ +exists',' and not exists ',y),
                reduce(lambda x,y:x+[m[1] for m in j_fields_dict[y]],[key for key in  j_fields_dict.keys() if not key=='j_fields_1' ],[])
        ,'')
    )]
    
    j_fields = reduce(lambda x,y:x+j_fields_dict[y],j_fields_dict.keys(),[])
    # ...
    f_fields = []
    p1 = re.compile(r'(?:and\ *)([not]*)(?:\ *exists)')
    p2 = re.compile(r'(?:where)([ds\->>\'id\'\ *=\ *\'[a-z]+\'\ *]*)')
    for c_name,c_field in c_fields:
        for j_name,j_field in j_fields:
            # ...
            r1 = list(re.findall(p1, j_field))
            r2 = list(re.findall(p2, j_field))
            where = ''
            if len(r1)!=0 and len(r2)!=0 and len(r1)==len(r2):
                z = list(zip(r1,r2))
                where = 'where '+' and '.join([n+' ('+m.strip()+')' for n,m in z])
            # ...
            f_fields.append(c_field%dict(exist=j_field,name=j_name,where=where))            
        
    # ....
    kwargs = {
        'organization':json.dumps({'id':pk}),
        'fields':', '.join(m_fields+f_fields)
    }
    # ..
    query = "\
        select \
            %(fields)s \
        from \
            orgzdrav_card as card \
        where \
            card.organization @> '%(organization)s'\
        and card.store ? 'enterorganization'\
        and card.store ? 'finishepicris'\
    "%(kwargs)
    # print(query)
    #...
    cursor = connection.cursor()
    cursor.execute(query)    
    cards = dictfetchall(cursor)  
    # print(cards)           

    items = cards
    items = sorted(items, key=lambda x: x['card_year'])
    items = groupby(items, key=lambda x: x['card_year']) 
    items = [(key,[item for item in values]) for key,values in items]    

    items = [concat({
        'year':key,
        'is_card':s('is_card',valuesiter), 
    },da(c_fields,j_fields,valuesiter)) for key,valuesiter  in items]   

    #...
    total = reduce(lambda x,y:concat(x,{
        '%s'%(y):list(map(lambda x:x[0],j_fields_dict[y]))
    }),j_fields_dict.keys(),[])
    # ...
    total['j_fields_4'] =  \
        total['j_fields_4_1'] \
        + total['j_fields_4_2'] \
        + total['j_fields_4_3'] \
        + total['j_fields_4_4'] \
        + total['j_fields_4_5'] \
        + total['j_fields_4_6'] \
        + total['j_fields_4_7'] \
        + total['j_fields_4_8'] \
        + total['j_fields_4_9'] \
        + total['j_fields_4_10'] \
        + total['j_fields_4_11']

    total['j_fields_0'] = \
        total['j_fields_2'] \
        + total['j_fields_3'] \
        + total['j_fields_4'] \
        + total['j_fields_5'] \
        + total['j_fields_6']
    # ...
    context = {
        'datetime':datetime.now(),   
        'caption':'XI.3. Заболевания новорожденных и причины смерти, родившихся с массой тела 1000 грамм и более',
        'organization':organization,
        'items':items,
        'total':total,

    }
    return render(request, 'morbidity/reports/XI_3.html', context)             