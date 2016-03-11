Ext.ns('Morbidity.Group');
Ext.ns('Morbidity.Head.Cls');
Ext.ns('Morbidity.Card.Cls');
Ext.ns('Morbidity.Tab.Cls');
// ----------------------------------------------------------------------------

Morbidity.Group.Cls = function () {};
Morbidity.Group.Cls = Ext.extend( Ext.Viewport, {
    renderTo: Ext.getBody(),
    layout:'vbox',
    layoutConfig: {
        align : 'stretch',
        pack  : 'start',
    },         
    initComponent: function(){
    
        var items = [{
            xtype:'morbidity:head:cls', 
            style: {
                padding: '5px 5px 0px 0px'
            },  
            listeners:{
                scope:Morbidity.Card.ctrls.Head,
                render:Morbidity.Card.ctrls.Head.init,
            },              
        },{    
            style: {
                padding: '0px 5px 5px 5px'
            },            
            xtype:'morbidity:card:group:cls',   
            flex:1,    
            listeners:{
                scope:Morbidity.Card.ctrls.Group,
                render:Morbidity.Card.ctrls.Group.init,
            },  
        }];
        //.        
        Ext.apply(this, Ext.apply(this.initialConfig, {items:items}));
        Morbidity.Group.Cls.superclass.initComponent.apply(this, arguments);
    },      
});



Morbidity.Head.Cls = function () {};
Morbidity.Head.Cls = Ext.extend(Ext.Container, {
    layout:'column',
    initComponent: function(){
        //.
        var items = [{
            xtype:'box',  
            style: {
                padding: '0px 0px 0px 5px'
            },                
            // width: 200,
            html:[
                '<h4 style="font-size:16pt;padding:0px 5px 0px 0px;color:white;" align="left">',
                 'Заболеваемость',
                '</h1>',
            ].join(' '),
        },{
            xtype:'container',                                                                                        
            columnWidth: 1,
            html:[
                '<h1 style="color:#eeeeec;" align="center">',
                    ORG_OBJ.fullname,
                '</h1>',
            ].join(' '),
            name:'orgstatus',
            listeners:{
                render:{
                    scope:this,
                    fn:this.initcmp,
                },
            },                        
        },{
            xtype:'button',
            // tooltip:[
            //         '<h1 style="padding:4px 4px 4px 4px;" align="center">',
            //          Ext.gluxUser(),
            //         '</h1>',
            //     ].join(' '),

            width: 70,                
            style: {
                padding: '0px 0px 0px 5px',
            },                    
            // iconCls: 'silk-menu',
            iconCls:'silk-photo-menu',
            scale: 'medium', 
            menu:[{
                // iconCls:'silk-user',                
                xtype:'label',
                html:[
                    '<h1 style="padding:10px 10px 10px 10px; background:#CCC;" align="center">',
                     Ext.gluxUser(),
                    '</h1>',
                ].join(' '),
            },{
                xtype:'menuseparator',
            },{
                text:'Смена учреждения',            
                iconCls:'silk-building',                    
                listeners:{
                    // scope:this,
                    // click:this.changeOrganization,
                    scope:Morbidity.Card.ctrls.Head,
                    click:Morbidity.Card.ctrls.Head.changeOrganization,                    
                }                  
            },{
                xtype:'menuseparator',
            },{
				text:'Отчеты',			
				iconCls:'silk-report',
                listeners:{
                    click:function(){
                        var winClass = Morbidity.Components.GlobalReportForm;
		                var win = new winClass();
		                win.show(this);
                    }
                }  
            },{
                xtype:'menuseparator',
                       
            },{            
				text:'На главную страницу',			
				iconCls:'silk-application-home',					
                listeners:{
                    click:function(){
                        window.location = '/';                                
                    }
                }
            },{
				text:'Выход',
				iconCls:'silk-door-in',	
                listeners:{
                    click:function(){
                        window.location = '/accounts/logout/?next=/';        
                    }
                }
            }],
        }]; 
        //..
        Ext.apply(this, Ext.apply(this.initialConfig, {
            items:items,
        }));
        //..
        Morbidity.Head.Cls.superclass.initComponent.apply(this, arguments);
    },     

    initcmp : function (cmp) {
        //..
        if (!this.cmp)
            this.cmp = {};
        ///..
        if (!cmp.name)
            return;
        //..
        this.cmp[cmp.name]=cmp;
    },     

});
Ext.reg('morbidity:head:cls', Morbidity.Head.Cls);


__Card = {__:''}
Ext.ns('Morbidity.Card.Group');
Ext.ns('Morbidity.Card.Table');
Ext.ns('Morbidity.Card.GridMenu');
Ext.ns('Morbidity.Card.Grid');
Ext.ns('Morbidity.Card.Edit');
Ext.ns('Morbidity.Card.FormMenu');
Ext.ns('Morbidity.Card.Form');
Ext.ns('Morbidity.Card.Form.DeliveryForm');
//...
Morbidity.Card.Group.Cls = Ext.extend(Plext.Main.Group, {
    //..                      
    initComponent: function(){
        //..
        Ext.apply(this.TableCls,{
            xtype:'morbidity:card:table:cls',   
            listeners:{
                scope:Morbidity.Card.ctrls.Table,
                render:Morbidity.Card.ctrls.Table.init,
            },
        });
        Ext.apply(this.EditCls,{
            xtype:'morbidity:card:edit:cls',
            listeners:{
                scope:Morbidity.Card.ctrls.Edit,
                render:Morbidity.Card.ctrls.Edit.init,
            },            
        });        
        //..
        Morbidity.Card.Group.Cls.superclass.initComponent.call(this);          
    },
});


//...
Morbidity.Card.Table.Cls = Ext.extend(Plext.Main.Table, {
    //...
    initComponent: function(){
        //...
        Ext.apply(this.MenuCls,{
            xtype:'morbidity:card:gridmenu:cls',
            listeners:{
                scope:Morbidity.Card.ctrls.GridMenu,
                render:Morbidity.Card.ctrls.GridMenu.init,
            },                                    
        });
        Ext.apply(this.GridCls,{
            xtype:'morbidity:card:grid:cls',
            listeners:{
                scope:Morbidity.Card.ctrls.Grid,
                render:Morbidity.Card.ctrls.Grid.init,
            },                        
        });          
        //...
        Morbidity.Card.Table.Cls.superclass.initComponent.call(this);  
        //..
    },    
});

//...
Morbidity.Card.GridMenu.Cls = Ext.extend(Plext.Main.GridMenu, {
    //...
    initComponent: function(){
        var AddClsMenu = [],
            cardnames = CARD_NAMES;
        // ...
        for (var i = cardnames.length - 1; i >= 0; i--) {
            var cardname = cardnames[i];
            // var cardid = cardname.id;
            // var formname = cardid.charAt(0).toUpperCase()+cardid.slice(1,cardid.length);
            // ...
            AddClsMenu[i] = {
                iconCls:'silk-script',
                text:'<b>'+cardname.name+'</b>',
                cardname:cardname,
                listeners:{
                    scope:Morbidity.Card.ctrls.GridMenu,
                    click:Morbidity.Card.ctrls.GridMenu.toMenu,
                },
            };
        };
        //...
        Ext.apply(this, Ext.apply(this.initialConfig, {
            'ctrl':Morbidity.Card.ctrls.GridMenu,
            'AddClsMenu':AddClsMenu,
        }));          
        //.
        Morbidity.Card.GridMenu.Cls.superclass.initComponent.call(this);  
    },         
});

Morbidity.Card.Grid.Cls = function(){};
Morbidity.Card.Grid.Cls = Ext.extend(Plext.Main.Grid, {
    //..
    action:MorbidityCardAction,
    filters:{},  
    killPermission:Plext.Components.Functions.StandartKillPermission,      
    //..
    initComponent: function(){
        //..
        var columns = [{
            sortable: false,
            renderer: Plext.Components.Functions.BulletBlackRenderer,
            fixed:true,
            width: 25,
        },{
            header: "ФИО",
            sortable: true,
            dataIndex: 'fio',
            width: 50,
            filter: {
                field:{
                    xtype:'plext:form:searchfield',
                    name:'fio',               
                	allowBlank:true,
                    listeners:{
                        scope:this,
                        render:this.initFilters,
                        select:this.applyFilter,
                        clear:this.applyFilter,
                    },
                },
            },
        },{                    
            header: "день рождения",
            sortable: true,
            dataIndex: 'birthday',
            width: 25,                          
        },{                    
            header: "документ",
            sortable: true,
            dataIndex: 'cardname',
            width: 25,     
            renderer:function(val){
                return val.name;
            }                   
        }]

        var plugins = [
            new Ext.ux.grid.FilterRow({
                autoFilter: false,
            }),
        ];                 
        //..
        Ext.apply(this, Ext.apply(this.initialConfig, {
            columns:columns,
            plugins:plugins,   
        }));
        //..
        Morbidity.Card.Grid.Cls.superclass.initComponent.call(this,arguments); 
        //..

    },
    updatePermission:function (record) {
        return true;
    },
    killPermission:function (argument) {
        return true;
    },

});


//...
Morbidity.Card.Edit.Cls = Ext.extend(Plext.Main.Edit, {

    initComponent: function(){  
        Ext.apply(this.FormMenuCls,{
            xtype:'morbidity:card:formmenu:cls',
            listeners:{
                scope:    Morbidity.Card.ctrls.FormMenu,
                render:    Morbidity.Card.ctrls.FormMenu.init,
            },
        });
    
        Ext.apply(this.FormCls,{
            xtype:'morbidity:card:form:cls',
            listeners:{
                scope:Morbidity.Card.ctrls.Form,
                render:Morbidity.Card.ctrls.Form.init,
            },
        });
        
        Morbidity.Card.Edit.Cls.superclass.initComponent.call(this);
    },
});

Morbidity.Card.FormMenu.Cls = Ext.extend(Plext.Main.FormMenu, {
    initComponent: function(){
        Ext.apply(this, Ext.apply(this.initialConfig, {
            'ctrl':Morbidity.Card.ctrls.FormMenu,
        }));          
        Morbidity.Card.FormMenu.Cls.superclass.initComponent.call(this);  
    },        
});


Morbidity.Card.Form.Cls = function () {};
Morbidity.Card.Form.Cls = Ext.extend(Ext.Container, {
    layout:'card',
    activeItem: 0,  
    //..    
    initComponent: function(){
        //..
        var items = [{
            xtype:'morbidity:card:form:deliveryform:cls',
            listeners:{
                scope:  Morbidity.Card.ctrls.DeliveryForm,
                render:Morbidity.Card.ctrls.DeliveryForm.init,
            },  
        }];

        Ext.apply(this, Ext.apply(this.initialConfig, {
            items:items,
        }));
        Morbidity.Card.Form.Cls.superclass.initComponent.call(this);  
    },
});


Morbidity.Card.Form.DeliveryForm.Cls = Ext.extend(Plext.Main.Form, {
    //..
    cardname:{
        id:'delivery',
        name:"Роды"
    },
    cursorPos:{id:'morbidity_card_form_deliveryform_cls_fio'},
    //..
    initComponent: function(){
        //..
        var items = [{
            id:'morbidity_card_form_deliveryform_cls_fio',            
            // xtype:'textfield',
            // name:'fio',
            // fieldLabel: 'ФИО',
            // allowBlank:false,
            // width : 400,    
            // vtype:'Fio',
            // maxLength:128,
            
            apifunction:MorbidityFioAction.read,
            // ...
            xtype:'plext:form:combobox',
            vtype:'Fio',            
            name: 'fio',
            fieldLabel: 'ФИО',
            listWidth:400,
            allowBlank:false,         
            pageSize:10,   
            // anchor:'-3',      
            width:400,
            // ...
            typeAhead: true,            
            // ...
            triggersConfig: [{
                hideTrigger: true,
                iconCls: "x-form-clear-trigger"
            }],
            // ...
            displayField: 'fio',  
            displayTpl:new Ext.XTemplate('{fio}'),        
            tpl:new Ext.XTemplate(
                '<tpl for=".">',
                '<div class="x-combo-list-item" style="white-space:normal !important;">',
                '{fio}',
                '</div>',
                '</tpl>'
            ),     
            getValue:function(){
                return this.getRawValue().trim();
            },
            checkOnBlur:function(){

            },
            assertValue:function(){

            },
        },{
            xtype:'datefield',
            name:'birthday',
            fieldLabel: 'дата рождения',
            allowBlank:false,
            // width : 400,    
            format:'d.m.Y',                 
            maxValue : new Date(),                                
      },{              
            layout:'form', labelAlign:'top', baseCls: 'x-plain',            
            items:{    
                name:'history',
                exclude:true,
                fieldLabel: '<b>История</b>',
                xtype: 'morbidity:components:historygrid',
                anchor:'-3',       
                allowBlank:false,  
                isTbar:true,
                // flex:1,
                loadValue:function(instance){
                    var storeObjs = instance.get('store'),
                        historyArr = [];
                    // ...
                    for (obj in storeObjs) {
                        var val = storeObjs[obj];
                        // ...
                        if (obj=='children') {
                            for (var i = 0; i < val.length; i++) {
                                var child = val[i];

                                // ..mortepicris
                                var childmortepicris = {};
                                if (child.data.mortepicris) {
                                    Ext.apply(childmortepicris,child.data.mortepicris);
                                    // delete child.data['mortepicris'];
                                };
                                // ....
                                historyArr.push(child);

                                // ..mortepicris
                                if (!Ext.isEmptyObject(childmortepicris))
                                    historyArr.push(childmortepicris);                                    
                            };
                        }else{
                            historyArr.push(val);
                        }
                    };
                    // ...
                    this.setValue(historyArr);
                },                    
                listeners:{
                    render:{
                        scope:this,
                        fn:this.init_cmp,
                    },
                },    
            },                                    
        }];
        //..
        Ext.apply(this, Ext.apply(this.initialConfig, {
            items:items,
        }));
        //..
        Morbidity.Card.Form.DeliveryForm.Cls.superclass.initComponent.call(this);  
    },

    extraSubmit:function(record){
        //... organization
        record.set('organization',{
            'id':ORG_OBJ.id,
            'name':ORG_OBJ.name,
            'fullname':ORG_OBJ.fullname,
            'is_perinatalcenter':ORG_OBJ.is_perinatalcenter,
            'lavelmz':ORG_OBJ.lavelmz,
        });

        // ..cardname
        record.set('cardname',this.cardname)

        // ..store
        var history = this.cxt.history.getValue(),
            store = {},
            children = [],
            childmortepicris = {};
        // ..

        for (var i = 0; i < history.length; i++) {
            var val = history[i];
            var id = val.object.id;
            // ..
            if (id=='child') {
                // ...childmortepicris
                delete val.data['mortepicris'];
                // ....
                children.push(val);
                // ...
            }else if (id=='childmortepicris'){
                childmortepicris[val.data.childnumber+''] = val;
            }else{
                store[id] = val;
            };
        };

        // ...mortepicris
        if (!Ext.isEmptyObject(childmortepicris))
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                var mortepicris = childmortepicris[child.data.childnumber];
                if(mortepicris)
                    child.data['mortepicris'] = mortepicris;

            };
        // ..
        store['children'] = children;
        // ..
        record.set('store',store);
    },    
});


// ----------------------------------------------------------------------------

Ext.reg('morbidity:card:group:cls',             Morbidity.Card.Group.Cls);
Ext.reg('morbidity:card:table:cls',             Morbidity.Card.Table.Cls);
Ext.reg('morbidity:card:gridmenu:cls',          Morbidity.Card.GridMenu.Cls);
Ext.reg('morbidity:card:grid:cls',              Morbidity.Card.Grid.Cls);
Ext.reg('morbidity:card:edit:cls',              Morbidity.Card.Edit.Cls);
Ext.reg('morbidity:card:formmenu:cls',          Morbidity.Card.FormMenu.Cls);
Ext.reg('morbidity:card:form:cls',              Morbidity.Card.Form.Cls);
Ext.reg('morbidity:card:form:deliveryform:cls', Morbidity.Card.Form.DeliveryForm.Cls);
