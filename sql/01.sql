select
	q.id,
  	q.data->'id' as id,
  	q.data->'name' as name,
  	q.data->'fields' as fields
--    (data_text::jsonb)->'id' as id,
--    (data_text::jsonb)->'name' as name,
--    (data_text::jsonb)->'fields'->'gestation' as fields
    
from
(SELECT 
--	daybooks->>'diagnoses'
--jsonb_array_elements(daybooks) 
--jsonb_array_length(daybooks)
--!!!!!!!jsonb_array_elements(jsonb_array_elements(daybooks)->'diagnoses')
id,
jsonb_array_elements(jsonb_array_elements(daybooks)->'data') as data
--jsonb_array_elements(jsonb_array_elements(daybooks)->'data')::text as data_text
--daybooks
FROM 
  orgzdrav_patient

--where daybooks @> '[{"datetime": "2016-01-05 18:33 +0300"}]'
--where daybooks @> '[{"datetime": "2016-01-05 18:33 +0300"}]'
--where daybooks @> '[{"name": "Бронхит"}]'
--where daybooks->>'diagnoses' ->> '[{"name": "Бронхит"}]'
--"[{"datetime": "2016-01-05 18:33 +0300", "diagnoses": [{"id": "6eea2727-1000-465d-bb6b-3a80f890cd69", "name": "Бронхит"}, {"id": "56598fd6-9011-4713-93cd-892c51720d0d", "name": "Кистома яичника"}, {"id": "46cf7ebc-e3d1-4d18-871f-f97ac40455de", "name": "Миом (...)"
--where  jsonb_array_elements(jsonb_array_elements(daybooks)->'diagnoses') -> 
) as q
--where q.data @> '{"name": "Беременность"}'
--where q.diagnoses ?& 'nam'
--where q.diagnoses_text LIKE '%Бронх%'