# ..
def q_ds_exists(**kwargs):
    antd = ""
    # ...
    if kwargs.get('ds_field',None) or kwargs.get('ds_cev',None):
        antd = "and (ds->'fields'->'%(ds_field)s'->'value')%(ds_cev)s "%(kwargs)
    # ...
    kwargs['antd'] = antd
    # ...
    return " \
        when exists( \
            select \
                * \
            from \
                jsonb_array_elements(card.store->'%(doc)s'->'data'->'diagnoses') as ds \
            where \
                ds @> '%(ds_id)s' \
            %(antd)s \
        ) then 1 \
    "%(kwargs)

def ds_exists(**kwargs):
    # ...
    docs = kwargs.get('docs')
    when = []
    # ....
    for doc in docs:
        when.append(q_ds_exists(doc = doc,**kwargs))
    # ...
    return "case %(when)s  else 0 end as %(block)s%(ds_nick)s "%dict(
        when = ' '.join(when),
        **kwargs
    )      