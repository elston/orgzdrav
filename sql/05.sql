select             
    card.id as card_id, 
    1 as is_card, 
    date_part('year',(card.store->'finishepicris'->'datetime')::text::timestamp)::text as card_year, 
    (
        select                 
            sum( 
                    (select 
                        count(*) 
                    from 
                        jsonb_array_elements(child->'data'->'services') as service 
                    where 
                        service ->> 'id' = 'vaccinationhepatitisB' 
                    ) 
                )
        from                  
            jsonb_array_elements(card.store->'children') as child             
        where                 
            child->'data' ? 'services'        
        
    ) as c_child_vaccinationhepatitisB_count         
from             
    orgzdrav_card as card         
where             
    card.organization @> '{"id": "c71ddfe1-ca69-445f-a2fd-60da7f1f92c6"}'        
and card.store ? 'enterorganization'        
and card.store ? 'finishepicris'