select             
    card.id as card_id, 
    1 as is_card, 
    case          
        when exists(             
            select                 
                *             
            from                 
                jsonb_array_elements(card.store->'beginepicris'->'data'->'diagnoses') as ds             
            where                 
                ds @> '{"id": "postcesarean"}'                      ) 
        then 1       
    else 0 end as a_postcesarean ,
    (
        select
            count(*)
        from 
             jsonb_array_elements(card.store->'children') as children
    ) as children_count,
    (
        select
            count(*)
        from 
             jsonb_array_elements(card.store->'children') as children
        where
            children->'data'->'birthdatetime' = children->'data'->'mortepicris'->'data'->'mortdatetime'
    ) as children_mortalbirth_count,
    (
        select
            count(*)
        from 
             jsonb_array_elements(card.store->'children') as child
        where
            child->'data'->'birthdatetime' = child->'data'->'mortepicris'->'data'->'mortdatetime'
        and (exists(
                select
                    *
                from
                    jsonb_array_elements(child->'data'->'diagnoses') as ds
                where
                    ds @> '{"id": "bronchitis"}'
            )or exists(
                select
                    *
                from
                    jsonb_array_elements(child->'data'->'mortepicris'->'data'->'diagnoses') as ds
                where
                    ds @> '{"id": "bronchitis"}'        
        ))
    ) as children_mortalbirth_antenatl_count,
    (select 
            count(*)
        from 
             jsonb_array_elements(card.store->'children') as child 
        where 
            date_part('hour', 
                age(
                    timestamp child->'data'->'mortepicris'->'data'->'mortdatetime' 
                    ,
                    timestamp child->'data'->'birthdatetime'  
                ) \
            ) < 168 
    ) as c_child_died_168h_count ,
from             
    orgzdrav_card as card         
where             
    card.organization @> '{"id": "c71ddfe1-ca69-445f-a2fd-60da7f1f92c6"}'        
and card.store ? 'enterorganization'        
and card.store ? 'finishepicris'  