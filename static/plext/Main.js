
Ext.ns('Plext.Main');

Plext.Main.Group = function(){}
Plext.Main.Group = Ext.extend(Ext.Container, {
    //...    
    layout:'card',
    activeItem: 0,  
    //..
    title: '',                
    tabTip: '',         
    //..
    TableCls:{
        xtype:'',
    },
    EditCls:{
        xtype:'',    
    },    
    //...
    initComponent: function(){
        //..
        Ext.apply(this, Ext.apply(this.initialConfig, {
            items:[
                this.TableCls,
                this.EditCls,                
            ],
        }));    
        //..
        Plext.Main.Group.superclass.initComponent.call(this);          
    },                   
});

Plext.Main.Table = function(){}
Plext.Main.Table = Ext.extend(Ext.Container, {
    layout:'vbox',
    layoutConfig: {
        align : 'stretch',
        pack  : 'start',
    },    
    //..     
    name:'',
    MenuCls:{
        xtype:'',
    },
    GridCls:{
        style: {
            padding: '5px 0px 0px 0px',
        },          
        flex:1,    
    },
    //..
    initComponent: function(){
        //..
        Ext.apply(this, Ext.apply(this.initialConfig, {
            items:[
                this.MenuCls,
                this.GridCls,                
            ],
        }));    
        //..
        Plext.Main.Group.superclass.initComponent.call(this);          
    },                   
});

Plext.Main.GridMenu = function(){};
Plext.Main.GridMenu = Ext.extend(Ext.Container, {
    disabled:true,      
    layout:'hbox', 
//    layoutConfig: {
//        align : 'stretch',
//        pack  : 'start',
//    },  
    //..

    RightpanelCls:{
        xtype:'container',
        layout:'hbox', 
        layoutConfig: {
            pack : 'end',
        },  
        items:[],
        flex:1,           
    },

   
    AddClsOn:true,
    AddClsMenu:[],
    AddCls:{
        name:'addBtn',                                  
        xtype:'button',
        text: 'Добавить',                                         
        scale: 'medium',   
        iconCls: 'glyph-add',  
        style: {
            padding: '0px 3px 0px 0px',
        },                    
    },

    RemoveClsOn:true,    
    RemoveCls:{
        name:'removeBtn',                                      
        xtype:'button',
        text: 'Удалить',   
        scale: 'medium',                           
        iconCls: 'glyph-remove',                                                          
        style: {
            padding: '0px 10px 0px 0px',
        },                
    },
    

    FilterClsOn:true,
    FilterClsToLeft:false,
    FilterCls:{
        name:'filterBtn',                                          
        xtype:'button',
        text: 'Убрать фильтр',                                         
        scale: 'medium',   
        iconCls: 'glyph-filter',  
        style: {
            padding: '0px 0px 0px 0px',
        },         
    },


    //.
    initComponent: function(){

        //..cls
        if ((this.ctrl)&&(this.AddCls)&&(this.AddClsOn)&&(this.AddClsMenu.length==0))
            Ext.apply(this.AddCls,{
                scope:this.ctrl,                
                handler: this.ctrl.toCreate,	    
            });

        if ((this.ctrl)&&(this.AddCls)&&(this.AddClsOn)&&(this.AddClsMenu.length>0))
            Ext.apply(this.AddCls,{
                menu: this.AddClsMenu,	    
            });


        if ((this.ctrl)&&(this.RemoveCls)&&(this.RemoveClsOn))
            Ext.apply(this.RemoveCls,{
                handler:yesno.createDelegate(this.ctrl,['Удалить текущую строку?',this.ctrl.toKill]),
            });

        if ((this.ctrl)&&(this.FilterCls)&&(this.FilterClsOn))
            Ext.apply(this.FilterCls,{
                scope:this.ctrl,
                handler:this.ctrl.resetFilter,
            });                  
                        
        //..items
        var items =  [],itemsright=[];

        //..to left
        if (this.AddClsOn)        
            items = items.concat([this.AddCls]);
        if (this.RemoveClsOn)        
            items = items.concat([this.RemoveCls]);  
        if ((this.FilterClsOn)&&(this.FilterClsToLeft))        
            items = items.concat([this.FilterCls]);        
        //..to right
        if ((this.FilterClsOn)&&(!this.FilterClsToLeft))                
            itemsright = itemsright.concat([this.FilterCls]);   

        //..right panel on
        if (this.RightpanelCls){  
            this.RightpanelCls.items = itemsright;
            items = items.concat([this.RightpanelCls]);   
        };
        //...
        Ext.apply(this, Ext.apply(this.initialConfig, {
            items:items,
        }));
        Plext.Main.GridMenu.superclass.initComponent.call(this);  
    },
    
});

Plext.Main.Grid = function(){}
Plext.Main.Grid = Ext.extend(Plext.grid.GridPanel, {
    pageSize:20,  
    stripeRows: true,  
});

Plext.Main.Edit = function(){}
Plext.Main.Edit = Ext.extend(Ext.Container, {
    layout:'vbox',
    layoutConfig: {
        align : 'stretch',
        pack  : 'start',
    },         
    forceLayout:true,
    //...
    FormMenuCls:{
    },
    FormCls:{
        style: {
            padding: '5px 0px 0px 0px',
        },          
        flex:1,        
    },    
    //..
    initComponent: function(){
        //..
        Ext.apply(this, Ext.apply(this.initialConfig, {
            items:[
                this.FormMenuCls,
                this.FormCls,
            ],
        }));
        //..
        Plext.Main.Edit.superclass.initComponent.call(this);          
    },      
});


Plext.Main.FormMenu = function(){};
Plext.Main.FormMenu = Ext.extend(Ext.Container, {
//    disabled:true,      
    layout:'hbox', 
    height:30,    
    //..
    BackClsOn:true,
    BackCls:{
        name:'backBtn',                              
        xtype:'button',
        text: 'Назад',                                         
        scale: 'medium',   
        iconCls: 'glyph-back',     
        width:80,
    },
    SaveClsOn:true,    
    SaveCls:{
        style: {
            padding: '0px 20px 0px 5px',
        },                            
        xtype:'button',
        text: 'Сохранить',   
        scale: 'medium', 
        name:'saveBtn',                          
        iconCls: 'glyph-save',   
    },

    
    //.
    initComponent: function(){
        if ((this.ctrl)&&(this.BackCls)&&(this.BackClsOn))
            Ext.apply(this.BackCls,{
//                handler: yesno.createDelegate(this.ctrl,['Закрыть форму без изменений?',this.ctrl.toCancel]),
                scope:this.ctrl,                
                handler:this.ctrl.toCancel,                
            });
            
        if ((this.ctrl)&&(this.SaveCls)&&(this.SaveClsOn))
            Ext.apply(this.SaveCls,{
                listeners: {
                    click: {
                        fn:yesno.createDelegate(this.ctrl,['Сохранить все изменения?',this.ctrl.toSubmit]),
                    },
                    render:{
                        scope:this.ctrl,
                        fn:this.ctrl.init_cmp,
                    },
                },                
            });
            
                                                  
        //..
        var items =  [];
        if (this.BackClsOn)        
            items = items.concat([this.BackCls]);        
        if (this.SaveClsOn)        
            items = items.concat([this.SaveCls]);
            
        //...
        Ext.apply(this, Ext.apply(this.initialConfig, {
            items:items,
        }));
        Plext.Main.FormMenu.superclass.initComponent.call(this);  
    },
    
});

Plext.Main.Form = function(){}
Plext.Main.Form = Ext.extend(Plext.form.FormPanel, {
    cursorPos:'begin',    
});
