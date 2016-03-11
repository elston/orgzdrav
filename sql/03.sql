SELECT 
    *
FROM 
    orgzdrav_card
where
--    organization = '{"id": "c71ddfe1-ca69-445f-a2fd-60da7f1f92c6", "name": "ККБ №2", "fullname": "Краевая клиническая больница №2"}' -- yes
--    organization @> '{"id": "c71ddfe1-ca69-445f-a2fd-60da7f1f92c6"}' -- yes
--    organization = '{"id": "c71ddfe1-ca69-445f-a2fd-60da7f1f92c6"}' -- empty
--    organization->'id' = '"c71ddfe1-ca69-445f-a2fd-60da7f1f92c6"' -- yes
--    organization->'id' @> '"c71ddfe1-ca69-445f-a2fd-60da7f1f92c6"' -- yes
      (organization->'id')::text like '%c71dd%' -- yes