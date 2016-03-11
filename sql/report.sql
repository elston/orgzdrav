select             
    card.id as card_id,
    EXTRACT (YEAR FROM to_date(replace(cast(card.store->'enterorganization'->'datetime' as text),'"',''),'YYYY-MM-DD')) as card_year,

    -- ***************************** deliv_and_ces_gestation_between_22_and_27 ***************************
    case 
        when (
            select 
                ds->'fields'->'gestation'->'value'
            from 
                jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "f615c006-7b6b-405d-a0ac-f9e55eab1ec6"}' -- кесарево беременность
        )::text::int between 22 and 27 then 1 
        when (
            select 
                ds->'fields'->'gestation'->'value'
            from 
                jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "79776759-17e3-4445-8b31-ef589c44f8d0"}' -- кесарево роды 
        )::text::int between 22 and 27 then 1 
        when (
            select 
                ds->'fields'->'gestation'->'value'
            from 
                jsonb_array_elements(card.store->'delivery'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "79776759-17e3-4445-8b31-ef589c44f8d0"}' -- роды роды 
        )::text::int between 22 and 27 then 1 
        else 0
    end as deliv_and_ces_gestation_between_22_and_27,

    -- ************************************* deliv_and_ces_gestation_between_22_and_37 ************************
    case 
        when (
            select 
                ds->'fields'->'gestation'->'value'
            from 
                jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "f615c006-7b6b-405d-a0ac-f9e55eab1ec6"}' -- кесарево беременность
        )::text::int between 22 and 37 then 1 
        when (
            select 
                ds->'fields'->'gestation'->'value'
            from 
                jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "79776759-17e3-4445-8b31-ef589c44f8d0"}' -- кесарево роды 
        )::text::int between 22 and 37 then 1 
        when (
            select 
                ds->'fields'->'gestation'->'value'
            from 
                jsonb_array_elements(card.store->'delivery'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "79776759-17e3-4445-8b31-ef589c44f8d0"}' -- роды роды 
        )::text::int between 22 and 37 then 1 
        else 0
    end as deliv_and_ces_gestation_between_22_and_37,

    -- ************************************* deliv_and_ces_gestation_gt_28 ************************
    case 
        when (
            select 
                ds->'fields'->'gestation'->'value'
            from 
                jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "f615c006-7b6b-405d-a0ac-f9e55eab1ec6"}' -- кесарево беременность
        )::text::int > 28 then 1 
        when (
            select 
                ds->'fields'->'gestation'->'value'
            from 
                jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "79776759-17e3-4445-8b31-ef589c44f8d0"}' -- кесарево роды 
        )::text::int > 28  then 1 
        when (
            select 
                ds->'fields'->'gestation'->'value'
            from 
                jsonb_array_elements(card.store->'delivery'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "79776759-17e3-4445-8b31-ef589c44f8d0"}' -- роды роды 
        )::text::int > 28  then 1 
        else 0
    end as deliv_and_ces_gestation_gt_28,

    -- ************************************* without_obmenka ************************
    case when card.store ? 'obmenka' then 0 else 1 end as without_obmenka,

    -- ************************************* is_perinatalcenter ************************    
    case when card.organization->'is_perinatalcenter'::text = 'true' then 1 else 0 end as is_perinatalcenter,

    -- ************************************* age_lt_14 ************************        
    case when date_part('year',age(to_date(replace(cast(card.store->'enterorganization'->'datetime' as text),'"',''),'YYYY-MM-DD'),card.birthday))
            < 14 then 1
        else 0
    end as age_lt_14,

    -- ************************************* is_delivery_or_cesarian ************************        
    case when card.store ? 'delivery' or card.store ? 'cesarean' then 1 else 0 end as is_delivery_or_cesarean,
    
    -- ************************************* deliv_and_ces_uno ************************
    case 
        when (
            select 
                ds->'fields'->'multiplety'->'value'
            from 
                jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "f615c006-7b6b-405d-a0ac-f9e55eab1ec6"}' -- кесарево беременность
        )@> '{"id":"uno"}'  then 1 
        when (
            select 
                ds->'fields'->'multiplety'->'value'
            from 
                jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "79776759-17e3-4445-8b31-ef589c44f8d0"}' -- кесарево роды 
        )@> '{"id":"uno"}'  then 1 
        when (
            select 
                ds->'fields'->'multiplety'->'value'
            from 
                jsonb_array_elements(card.store->'delivery'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "79776759-17e3-4445-8b31-ef589c44f8d0"}' -- роды роды 
        ) @> '{"id":"uno"}'  then 1 
        else 0
    end as deliv_and_ces_uno,
    -- ************************************* deliv_and_ces_duo ************************
    case 
        when (
            select 
                ds->'fields'->'multiplety'->'value'
            from 
                jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "f615c006-7b6b-405d-a0ac-f9e55eab1ec6"}' -- кесарево беременность
        )@> '{"id":"duo"}'  then 1 
        when (
            select 
                ds->'fields'->'multiplety'->'value'
            from 
                jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "79776759-17e3-4445-8b31-ef589c44f8d0"}' -- кесарево роды 
        )@> '{"id":"duo"}'  then 1 
        when (
            select 
                ds->'fields'->'multiplety'->'value'
            from 
                jsonb_array_elements(card.store->'delivery'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "79776759-17e3-4445-8b31-ef589c44f8d0"}' -- роды роды 
        ) @> '{"id":"duo"}'  then 1 
        else 0
    end as deliv_and_ces_duo,
    -- ************************************* deliv_and_ces_tre ************************
    case 
        when (
            select 
                ds->'fields'->'multiplety'->'value'
            from 
                jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "f615c006-7b6b-405d-a0ac-f9e55eab1ec6"}' -- кесарево беременность
        )@> '{"id":"tre"}'  then 1 
        when (
            select 
                ds->'fields'->'multiplety'->'value'
            from 
                jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "79776759-17e3-4445-8b31-ef589c44f8d0"}' -- кесарево роды 
        )@> '{"id":"tre"}'  then 1 
        when (
            select 
                ds->'fields'->'multiplety'->'value'
            from 
                jsonb_array_elements(card.store->'delivery'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "79776759-17e3-4445-8b31-ef589c44f8d0"}' -- роды роды 
        ) @> '{"id":"tre"}'  then 1 
        else 0
    end as deliv_and_ces_tre,
    -- ************************************* deliv_and_ces_qua ************************
    case 
        when (
            select 
                ds->'fields'->'multiplety'->'value'
            from 
                jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "f615c006-7b6b-405d-a0ac-f9e55eab1ec6"}' -- кесарево беременность
        )@> '{"id":"qua"}'  then 1 
        when (
            select 
                ds->'fields'->'multiplety'->'value'
            from 
                jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "79776759-17e3-4445-8b31-ef589c44f8d0"}' -- кесарево роды 
        )@> '{"id":"qua"}'  then 1 
        when (
            select 
                ds->'fields'->'multiplety'->'value'
            from 
                jsonb_array_elements(card.store->'delivery'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "79776759-17e3-4445-8b31-ef589c44f8d0"}' -- роды роды 
        ) @> '{"id":"qua"}'  then 1 
        else 0
    end as deliv_and_ces_qua,
    -- ************************************* deliv_and_ces_cin ************************
    case 
        when (
            select 
                ds->'fields'->'multiplety'->'value'
            from 
                jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "f615c006-7b6b-405d-a0ac-f9e55eab1ec6"}' -- кесарево беременность
        )@> '{"id":"cin"}'  then 1 
        when (
            select 
                ds->'fields'->'multiplety'->'value'
            from 
                jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "79776759-17e3-4445-8b31-ef589c44f8d0"}' -- кесарево роды 
        )@> '{"id":"cin"}'  then 1 
        when (
            select 
                ds->'fields'->'multiplety'->'value'
            from 
                jsonb_array_elements(card.store->'delivery'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "79776759-17e3-4445-8b31-ef589c44f8d0"}' -- роды роды 
        ) @> '{"id":"cin"}'  then 1 
        else 0
    end as deliv_and_ces_cin,
    -- ************************************* deliv_and_ces_aids ************************
    case 
        when exists(
            select 
                *
            from 
                jsonb_array_elements(card.store->'cesarean'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "ae60c780-e06a-44a7-b116-fc4ceaf0184e"}' -- кесарево ВИЧ
        )  then 1 
        when exists(
            select 
                *
            from 
                jsonb_array_elements(card.store->'delivery'->'data'->'diagnoses') as ds 
            where 
                ds @> '{"id": "ae60c780-e06a-44a7-b116-fc4ceaf0184e"}' -- роды ВИЧ 
        )  then 1 
        else 0
    end as deliv_and_ces_aids
from             
    orgzdrav_card as card         
where             
    card.organization @> '{"id": "c71ddfe1-ca69-445f-a2fd-60da7f1f92c6"}'   
and card.store ? 'enterorganization'    