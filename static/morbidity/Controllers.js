//************************* Card *******************************************
__Card = {__:''}; 
Ext.ns('Morbidity.Card.Head');
Ext.ns('Morbidity.Card.Group');
Ext.ns('Morbidity.Card.Table');
Ext.ns('Morbidity.Card.GridMenu');
Ext.ns('Morbidity.Card.Grid');
Ext.ns('Morbidity.Card.Edit');
Ext.ns('Morbidity.Card.FormMenu');
Ext.ns('Morbidity.Card.Form');
Ext.ns('Morbidity.Card.Form.DeliveryForm');

Morbidity.Card.Head.Ctrl = Ext.extend(Plext.Controller.Base, {
    //Head
    init: function () {
        Ext.apply(this, Morbidity.Card.ctrls);
        Morbidity.Card.Head.Ctrl.superclass.init.apply(this, arguments);
    },

    changeOrganization: function(){
        //.
        var win = new Morbidity.Components.OrganizationChangeForm();
        win.show(this.instance);
        win.items.get(0).focus('', 10);
        win['orgstatus'] = this.instance.cmp.orgstatus;
        win['gridInstance'] = this.Grid.instance;
        win['Group'] = this.Group;
        win['Form'] = this.Form;        
    },    
});


Morbidity.Card.Group.Ctrl = Ext.extend(Plext.Controller.Group, {
    //Group
    init: function () {
        Ext.apply(this, Morbidity.Card.ctrls);
        Morbidity.Card.Group.Ctrl.superclass.init.apply(this, arguments);
    },
});

Morbidity.Card.Table.Ctrl = Ext.extend(Plext.Controller.Table, {
    //..Table
    init: function () {
        Ext.apply(this, Morbidity.Card.ctrls);
        Morbidity.Card.Table.Ctrl.superclass.init.apply(this, arguments);
    },
});

Morbidity.Card.GridMenu.Ctrl = Ext.extend(Plext.Controller.GridMenu, {
    //..GridMenu
    init: function () {
        Ext.apply(this, Morbidity.Card.ctrls);
        Morbidity.Card.GridMenu.Ctrl.superclass.init.apply(this, arguments);
    },
    toMenu:function(item,event){
        // console.log(item.cardname);
        var formid = item.cardname.id;
        var formname = formid.charAt(0).toUpperCase()+formid.slice(1,formid.length)+'Form';
        var form = this[formname];
        // ..
        form.toCreate(
            this.Grid.getStore(),
            this.Grid.instance.filters,
            this.Grid.instance.master
        );
        form.instance.cardname = item.cardname;
        this.Group.setActiveItem(1);
        this.Form.setActiveLayer(item.cardname.id);
    },
});
Morbidity.Card.Grid.Ctrl = Ext.extend(Plext.Controller.Grid, {
    //Grid
    init: function () {
        Ext.apply(this, Morbidity.Card.ctrls);
        Morbidity.Card.Grid.Ctrl.superclass.init.apply(this, arguments);
        //..
        this.instance.on({
            scope:this, 
            'afterrender':function(){
                if (Ext.isEmptyObject(ORG_OBJ)){
                    Ext.Msg.show({
                       title:'Внимание!',
                       msg: 'Нет доступных организаций',
                       buttons: Ext.Msg.OK,
                       animEl: 'elId',
                       fn:function(){
                            window.location = '/';
                       },
                       scope:this,                                      
                    });    
                    return;
                };
                // ...
                Ext.apply(this.instance.store.baseParams,{
                    'organization':{
                        'id':ORG_OBJ.id,
                        // 'name':ORG_OBJ.name,
                    },
                });                
                this.instance.toLoad();
            },
        });   
    },
});
Morbidity.Card.Edit.Ctrl = Ext.extend(Plext.Controller.Edit, {
    init: function () {
        Ext.apply(this, Morbidity.Card.ctrls);
        Morbidity.Card.Edit.Ctrl.superclass.init.apply(this, arguments);
    },
});

//FormMenu
Morbidity.Card.FormMenu.Ctrl = Ext.extend(Plext.Controller.FormMenu, {
    init: function () {
        Ext.apply(this, Morbidity.Card.ctrls);
        Morbidity.Card.FormMenu.Ctrl.superclass.init.apply(this, arguments);
    },

});

Morbidity.Card.Form.Ctrl = Ext.extend(Plext.Controller.Card, {
    //..
    init: function(){
        //..
        this.ctrls = {
            'delivery':{
                'layer':0,
                'ctrl':Morbidity.Card.ctrls.DeliveryForm,
             },
        };
        //.
        Morbidity.Card.Form.Ctrl.superclass.init.apply(this,arguments);      
        //..
    },    

    toCancel:function(){
        var form = this.getActiveLayerCtrl('cardname','id');
        form.instance.toCancel();
    },

    toSubmit:function(){
        var form = this.getActiveLayerCtrl('cardname','id');
        form.instance.toSubmit();
    },
    toUpdate:function(record,store){
        var cardname = record.get('cardname');
        var form = this.getCtrl(cardname.id);
        // ...
        form.instance['cardname'] = cardname;
        form.instance.toUpdate(record,store);
    },
});

Morbidity.Card.Form.DeliveryForm.Ctrl = Ext.extend(Plext.Controller.Form, {
    init: function () {
        Ext.apply(this, Morbidity.Card.ctrls);
        Morbidity.Card.Form.DeliveryForm.Ctrl.superclass.init.apply(this, arguments);
    },
})

Morbidity.Card.ctrls = {
    'Head'     :new Morbidity.Card.Head.Ctrl(),
    'Group'     :new Morbidity.Card.Group.Ctrl(),
    'Table'     :new Morbidity.Card.Table.Ctrl(),
    'GridMenu'  :new Morbidity.Card.GridMenu.Ctrl(),
    'Grid'      :new Morbidity.Card.Grid.Ctrl(),
    'Edit'      :new Morbidity.Card.Edit.Ctrl(),
    'FormMenu'  :new Morbidity.Card.FormMenu.Ctrl(),
    'Form'      :new Morbidity.Card.Form.Ctrl(),
    'DeliveryForm':new Morbidity.Card.Form.DeliveryForm.Ctrl(),    
};
