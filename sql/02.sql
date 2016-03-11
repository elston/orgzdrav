SELECT x.name, x.country, x.hobby   FROM json_to_recordset(
  '[{"name":"Roy","country":"USA","hobby":"Swim"},
    {"name":"Roy","country":"USA","hobby":"Cricket"},
    {"name":"Anam","country":"Greece","hobby":"Polo"}]')
AS x(name text, country text, hobby text)
WHERE x.name like '%m%';
