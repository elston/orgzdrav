select             
    card.id as card_id, 
    1 as is_card, 
(             
    select 
--        count(*)            
        array_agg(q.dss)
    from                 
        (
        select 
            ds->>'id' as dss
        from
            jsonb_array_elements(card.store->'finishepicris'->'data'->'diagnoses') as ds             
        where                 
            ds->>'id' in ('pregnancy','delivery','postcesarean','postpartum','weaknesslabor','discoordinationlabor','delivhemorhag','preghemorhag','postpartumhemorhag','badcoagblood','detachplacent','peritonitis','sepsis','septicemia','rupturemembranes','preeclampsia','proteinuria','uterotear','perinealtear','perinealtear','diabetes','eclampsia','amnioticembolism','arterialhypertension','cystitis','ironanemia','legvienvaricosity','shellattachmentcord','cesarean','сonheartdefect','mitralprolapse','ventseptdefect','pulmhypertension')         
        union
        select
            ds->>'id' dss
        from
            jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds             
        where                 
            ds->>'id' in ('pregnancy','delivery','postcesarean','postpartum','weaknesslabor','discoordinationlabor','delivhemorhag','preghemorhag','postpartumhemorhag','badcoagblood','detachplacent','peritonitis','sepsis','septicemia','rupturemembranes','preeclampsia','proteinuria','uterotear','perinealtear','perinealtear','diabetes','eclampsia','amnioticembolism','arterialhypertension','cystitis','ironanemia','legvienvaricosity','shellattachmentcord','cesarean','сonheartdefect','mitralprolapse','ventseptdefect','pulmhypertension')         
        ) as q
) as ds_count
from             
    orgzdrav_card as card         
where             
    card.organization @> '{"id": "c71ddfe1-ca69-445f-a2fd-60da7f1f92c6"}'        
and card.store ? 'enterorganization'        
and card.store ? 'finishepicris'  