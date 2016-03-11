


// ----------------------------------------  --------------------------------
Ext.ns('Plext.Controller');
// ----------------------------------------  --------------------------------

Plext.Controller.Base = {__:''};
Plext.Controller.Base = Ext.extend(Object, {
    //..
    'instance':{},
    //..
    init:function (instance) {
        this.instance = instance;
    },
    init_cmp : function (cmp) {
        if (!this.cmp)
            this.cmp = {};
        //..
        if (cmp.name)        
            this.cmp[cmp.name]=cmp;
        //..
    },       
    enable:function(){
        this.instance.enable();
    },
    disable:function(){
        this.instance.disable();
    },    
    mask:function(msg,msgCls){
        this.instance.el.mask(msg,msgCls);
    },
    unmask:function(){
        this.instance.el.unmask();    
    },

});

Plext.Controller.Card = {__:''};
Plext.Controller.Card = Ext.extend(Plext.Controller.Base, {
    //..
    init: function(){
        //..
        Plext.Controller.Card.superclass.init.apply(this,arguments);      

    },    

    getLayout:function(){
        return this.instance.getLayout();
    },
    
    setActiveItem:function(id){
        var layout = this.getLayout()
        layout.setActiveItem(id);    
    },
    
    getActiveItem:function(){
        return this.instance.activeItem; 
    },    

    setActiveZero:function(){
        this.getLayout().setActiveItem(0);            
    },
    setActiveLayer:function(name){
        var layer = this.getLayer(name);
        //..
        this.setActiveItem(layer);         
    },
    getCtrl:function(name){
        return this.ctrls[name].ctrl
    },

    getLayer:function(name){
        return this.ctrls[name].layer
    }, 
    
    getActiveLayerCtrl(objname,idname){
        var layout = this.getLayout();
        var obj = layout.activeItem[objname];
        var name = obj[idname];
        //...
        return this.ctrls[name].ctrl
    },
});
// ----------------------------------------  --------------------------------
Plext.Controller.Group = {__:''};
Plext.Controller.Group = Ext.extend(Plext.Controller.Base, {
    //..
    getLayout:function(){
        return this.instance.getLayout();
    },
    setActiveItem: function(id){
        var layout = this.getLayout()
        layout.setActiveItem(id);    
    },  
    getActiveItem:function(){
        return this.instance.activeItem; 
    },
    init: function(){
        //..
        Plext.Controller.Group.superclass.init.apply(this,arguments);      

    },    
});

// ----------------------------------------  --------------------------------
Plext.Controller.Table = {__:''};
Plext.Controller.Table = Ext.extend(Plext.Controller.Base, {
    //...
    init: function(){
        //..
        Plext.Controller.Table.superclass.init.apply(this,arguments);     
        //.. 
        this.instance.on({
            scope:this,                    
            'activate':this.onActivate,
        });
    },    

    onActivate:function(){
        this.Grid.focusActiveRow()        
    },
    
});

Plext.Controller.GridMenu = {__:''};
Plext.Controller.GridMenu = Ext.extend(Plext.Controller.Base, {
    //..
    toCreate:function(){
        this.Grid.toCreate();
    },    

    toKill:function(){
        this.Grid.toKill();
    },   
    resetFilter:function(){
        this.Grid.resetFilter();
    }, 

    toReport:function(){
        this.Grid.toReport();
    },     


    toBack:function(){
        console.log('хьюстон у нас проблемы ..процедура не переопределена!!! ');
    },    
});

Plext.Controller.Grid = {__:''}; 
Plext.Controller.Grid = Ext.extend(Plext.Controller.Base, {
    //...
    init: function(){
        //..
        Plext.Controller.Grid.superclass.init.apply(this,arguments);     
        //.. 
        this.instance.on({
            scope:this,                    
            'afterstoreload':this.onAfterStoreLoad,
            'rowdblclick':this.toUpdate,
            'afterstorewrite':this.onAfterStoreWrite,
            'afterstoreexception':this.onAfterStoreException,
        });
    },    
    //...
    focusActiveRow:function(){
        this.instance.focusActiveRow();
    },
    
    toLoad:function(){
        this.instance.toLoad();
    },   
     
    getStore:function(){
        return this.instance.getStore();
    },
    
    toKill:function(){
        this.instance.toKill();
    },      
    resetFilter:function(){
        this.instance.resetFilter();    
    },   
    toReport:function(){
        this.instance.toReport();        
    },    
    setBaseParams:function(baseParams){
        Ext.apply(this.instance.store.baseParams, baseParams);      
    },
    setMaster:function(master){
        this.instance.master = master;
    },
    onAfterStoreLoad:function(instance, store,records,options){
        this.GridMenu.enable();
    },

    toCreate:function(){
        this.Form.toCreate(this.getStore(),this.instance.filters,this.instance.master)    
        this.Group.setActiveItem(1);
    },    

    toUpdate:function(controller){
        //..
	    var record = this.instance.getSelectionModel().getSelected();
	    var store = this.instance.getStore();	    
	    var saveBtn = null;
        if ((this.FormMenu.cmp)&&(this.FormMenu.cmp.saveBtn))
            saveBtn = this.FormMenu.cmp.saveBtn;	    
        //..	    
	    if ((!record)||(!store)) 
	        return;            
	    this.Form.toUpdate(record,store);
        this.Group.setActiveItem(1);	
        //..
        if (!this.instance.updatePermission(record))
            if (saveBtn)
                saveBtn.disable();	
    },

    onAfterStoreException:function(instance, type,action,options,response,arg){
        if ((action=='create')||(action=='update')){
	        this.Edit.unmask();        
        };
    },

    onAfterStoreWrite:function(instance, store,action,result,res,rs){
        if ((!action=='create')||(!action=='update')) return;        
        //...
	    this.Edit.unmask();        
        this.Group.setActiveItem(0);	
    },    
    
    
});

Plext.Controller.Edit = {__:''}; 
Plext.Controller.Edit  = Ext.extend(Plext.Controller.Base, {
});

Plext.Controller.FormMenu = {__:''}; 
Plext.Controller.FormMenu  = Ext.extend(Plext.Controller.Base, {
    //..
    toCancel:function(){
        this.Form.toCancel();
        this.Group.setActiveItem(0); 
        this.cmp.saveBtn.enable();                           
    },
    toSubmit:function(){
        if (this.Form.toSubmit())
            this.Edit.mask(this.Form.instance.msg, this.Form.instance.msgCls);                
    },
    //..
    toSetting:function(){
        this.Form.toSetting();        
    },
    //...
    
});

Plext.Controller.Form = {__:''}; 
Plext.Controller.Form = Ext.extend(Plext.Controller.Base, {
    //..
    toCreate:function(store,filters,master){
                                     
        //..            
        this.instance.toCreate(store,filters,master);
    },

    toCancel:function(){
        this.instance.toCancel();
    },

    toUpdate:function(record, store){
                                      
            
        //..
        this.instance.toUpdate(record, store);
    },    
    toSubmit:function(){
        return this.instance.toSubmit();    
    },    
    toSetting:function(){
        console.log('процеедура не переопределена в модуле формы')
//        this.Card.setActiveItem(1);     
    },    
});
