Ext.ns('Plext.Components');
Ext.ns('Plext.Components.Functions');
Ext.ns('Plext.Components.EntryGrid');
Ext.ns('Plext.Components.OrganizationChangeForm');
Ext.ns('Plext.Components.BranchComboBox') ;


__Renderers = {__:''}
Plext.Components.Functions.BulletBlackRenderer = function(val,obj,record){
    return "<img src='" + STATIC_URL + "plext/resources/fam/bullet_black.png'>";
};

Plext.Components.Functions.SourcesRenderer = function(val,obj,record){
    sources = record.get('sources');
    if (!!sources.length){
        return "<img src='" + STATIC_URL + "plext/resources/fam/bullet_blue.png'>";                    
    };
    return "<img src='" + STATIC_URL + "plext/resources/fam/bullet_black.png'>";
};

Plext.Components.Functions.TimelineCrtStatusIconRenderer =  function (val,obj,record) {
    timeline = record.get('timelines')[0];
//    timeline = record.get('timelines').slice(-1)[0];    
    return "<img src='" + STATIC_URL + "plext/resources/fam/" + timeline.status.icon + ".png'>";
};

Plext.Components.Functions.TimelineCrtVerifyIconRenderer =  function (val,obj,record) {
    timeline = record.get('timelines')[0];
//    timeline = record.get('timelines').slice(-1)[0];    
    return "<img src='" + STATIC_URL + "plext/resources/fam/" + timeline.verify.icon + ".png'>";
};


//Plext.Components.Functions.TimelineCrtDateRenderer =  function (val,obj,record) {
//    timeline = record.get('timelines')[0];
////    timeline = record.get('timelines').slice(-1)[0];    
//    return Ext.util.Format.date(timeline.created, 'd.m.Y');
//};
Plext.Components.Functions.TimelineCrtDateRenderer = function (val,obj,record) {
    timelines = record.get('timelines');
    if ((!timelines)||(timelines.length==0))
        return '';
    //...
    timeline = Ext.findByFn(timelines,'crt',function(item,data){
        return (item.status.id == data)
    }); 
    if (!timeline)
        return '';        
    //...
    return Ext.util.Format.date(timeline.created, 'd.m.Y G:i');
};

Plext.Components.Functions.TimelineRmDateRenderer = function (val,obj,record) {
    timelines = record.get('timelines');
    if ((!timelines)||(timelines.length==0))
        return '';
    //...
    timeline = Ext.findByFn(timelines,'rm',function(item,data){
        return (item.status.id == data)
    }); 
    if (!timeline)
        return '';        
    //...
    return Ext.util.Format.date(timeline.created, 'd.m.Y G:i');
};

//**********************************
Plext.Components.Functions.TimelineStatusIconRenderer =  function (val,obj,record) {
    timeline = record.get('timelines').slice(-1)[0];    
    return "<img src='" + STATIC_URL + "plext/resources/fam/" + timeline.status.icon + ".png'>";
};
Plext.Components.Functions.TimelineVerifyIconRenderer =  function (val,obj,record) {
    timeline = record.get('timelines').slice(-1)[0];    
    return "<img src='" + STATIC_URL + "plext/resources/fam/" + timeline.verify.icon + ".png'>";
};
Plext.Components.Functions.TimelineDateRenderer =  function (val,obj,record) {
    timeline = record.get('timelines').slice(-1)[0];    
    return Ext.util.Format.date(timeline.created, 'd.m.Y G:i');
};

//**********************************

Plext.Components.Functions.ShortCutMenu =  function (pref,grid) {
        ret = {};
        all =  {
            'abs':{
                text: '<b>Не проверен</b>',
                iconCls : 'silk-exclamation',
                command : pref+'abs',
                listeners: {
                    scope: grid,                            
                    click: grid.toClickRowMenu,
                },                  
            },
            'cns':{
                text: '<b>Проверен</b>',
                iconCls : 'silk-information',
                command : pref+'cns',
                listeners: {
                    scope: grid,                            
                    click: grid.toClickRowMenu,
                },                  
            },
            'apr':{
                text: '<b>Утвержден</b>',
                iconCls: 'silk-accept',                    
                command: pref+'apr',
                listeners: {
                    scope: grid,                            
                    click: grid.toClickRowMenu,
                },                  
            },
            
        };
        //..
        arr = USER_OBJ.timelineverify;
        for(var i=0; i<arr.length; i++){        
            ret[arr[i]] = all[arr[i]];
        };
        return ret;
};

Plext.Components.Functions.ShortCutVerify =  function (pref) {
    return {
        'crtapr':{
            verify :{
                icon: "accept",
                id: "apr",
                lavel: 3,
                name: "Утвержден",
            },     
            get:function(arr){
                return arr[0];
            },           
        },
        'crtcns':{
            verify :{
                icon: "information",
                id: "cns",
                lavel: 2,
                name: "Проверен",
            },           
            get:function(arr){
                return arr[0];
            },                                      
        },
        'crtabs':{
            verify :{
                icon: "exclamation",
                id: "abs",
                lavel: 1,
                name: "не проверен",
            },                
            get:function(arr){
                return arr[0];
            },                                                        
        },
        //....
        'rmapr':{
            verify :{
                icon: "accept",
                id: "apr",
                lavel: 3,
                name: "Утвержден",
            },     
            get:function(arr){
                return arr.slice(-1)[0];
            },           
        },
        'rmcns':{
            verify :{
                icon: "information",
                id: "cns",
                lavel: 2,
                name: "Проверен",
            },           
            get:function(arr){
                return arr.slice(-1)[0];
            },                                      
        },
        'rmabs':{
            verify :{
                icon: "exclamation",
                id: "abs",
                lavel: 1,
                name: "не проверен",
            },                
            get:function(arr){
                return arr.slice(-1)[0];
            },                                                        
        },        
    };
}

Plext.Components.Functions.StandartKillPermission = function(record){
    ///.
    timelines = record.get('timelines');
    //..
    lavel = 1;    
    if ((timelines)&&(timelines.length>0))
        lavel = Math.max.apply(null, timelines.map(function(item){ return item.verify.lavel }));        
    //..
    if (lavel == 1)
        return true;        
    //..
    return false
};  

Plext.Components.Functions.ArraySort = function(arr,func) {
    //...    
    arr.sort(function(ax,bx){
        a = func(ax);
        b = func(bx);            
        //..
        var len = a.length > b.length ? b.length : a.length;
        //..
        for(var i=0; i<len; ++i) {
            if(a[i] - b[i] !== 0)
            return a[i] - b[i];
        }
        //.
        return (a.length - b.length);        
    })
}

Plext.Components.Functions.SortDictKeysByAttr = function(dict,attr) {
    //...    
    var sorted = [],
        names = [];
    // ..
    for(var key in dict) {
        sorted.push({
            attr:dict[key][attr],
            name:key
        });
    };
    // ..
    sorted.sort(function(ax,bx) {
        if(ax.attr > bx.attr) return 1  
        if(ax.attr < bx.attr) return -1 
        return 0
    });
    //..
    for(var i = 0; i < sorted.length; i++) {
        var name = sorted[i].name;
        // ..
        names.push(name);
    };
    // ...
    return names;
}

Plext.Components.Functions.DateSort = function(arr,func) {
    //...    
    arr.sort(function(ax,bx){
        a = Date.parseDate(func(ax),'Y-m-d H:i O');
        b = Date.parseDate(func(bx),'Y-m-d H:i O');
        //..
        return (a - b);        
    })
}
//**********************************
Plext.Components.Functions.EntryIntegerRenderer = function (val,obj,record) {
    entries = record.get('entries');
    if (!entries){
        return '';
    };
    total = entries.reduce(function(x, item, i){
        return x + (item.value||0);
    },0);
    
    var ret = '<span style="color:green;">' + total + '</span>';
    if(total < 0)
        ret = '<span style="color:red;">' + total + '</span>';
    return ret;
};


__Entry = {__:''}; 


Plext.Components.EntryGrid = function(){};
Plext.Components.EntryGrid = Ext.extend(Plext.form.PropertySummaryGridPanel, {
    name:'entries',
	allowBlank:false,     
	width : 420,  
    //..
    initComponent: function(){

        var data = [
            {id:1, valuetype: 'fdr', valuetype_name: 'Федеральный',value: 0},
            {id:2, valuetype: 'rgl', valuetype_name: 'Региональный',value: 0},
            {id:3, valuetype: 'mnl', valuetype_name: 'Муниципальный',value: 0},
            {id:4, valuetype: 'oth', valuetype_name: 'Иной',value: 0},                                    
        ];    
    
        var fields = [{
            name: 'id',
        }, {
            name: 'valuetype',
        }, {
            name: 'valuetype_name', 
        }, {
            name: 'value',     
        }];
        ///.
        var columns = [{
            width: 150,               
            dataIndex: 'valuetype_name',
            header: 'Бюджет',
            summaryType:'count',
            summaryRenderer: function (value, metadata, record, rowIndex, colIndex, store) {
                return 'Всего:'
            } 
        },{   
            dataIndex: 'value',
            header: 'Значение',
            width: 130,       
            summaryType:'sum',                        
            editor: new Ext.form.NumberField({
                style: 'text-align:left',
            	allowBlank:true,
            	allowDecimals: true,
            	allowNegative : true,
                decimalPrecision : 5,  
                decimalSeparator : ',',                   
            })                      
        },{   
            dataIndex: 'money',
            header: '',
            width: 120,       
            renderer:function(){
                return 'тыс.руб'
            },                         
            summaryRenderer: function (value, metadata, record, rowIndex, colIndex, store) {
                return 'тыс.руб'
            },   
        }]; 
        //..
        var selModel = new Ext.grid.CellSelectionModel();	                                             	        
        //..
        Ext.apply(this, Ext.apply(this.initialConfig, {
            fields:fields,
            columns:columns,
            selModel:selModel,
            data:data,
        }));
        //..
        Plext.Components.EntryGrid.superclass.initComponent.call(this,arguments); 

    },

//    presetValue:function(){
//        this.store.loadData(this.data);
//        this.setTotalSize();
//    },

//    setValue:function(val){
//        if (!val) return;
//        this.store.loadData(this.data);
//        for (item in val){
//            rec = this.store.getAt(this.store.find('valuetype',item));
//            if (rec){
//                rec.set('value',val[item]);
//                rec.commit();
//            };
//        };
//        this.setTotalSize();
//    },    

//    getValue:function(){
//        var ret ={};
//        this.store.data.each(function(item){
//            ret[item.data.valuetype]=item.data.value||0;
//        });
//        return ret;
//    },    



    
});
Ext.reg('plext:components:entrygrid', Plext.Components.EntryGrid);

__Timeline = {__:''}

Plext.Components.TimelineGrid = function(){};
Plext.Components.TimelineGrid = Ext.extend(Plext.form.SimpleGridPanel, {
    sortInfo:{field: 'created', direction: "ASC"},        
    winClass:'Plext.Components.TimelineForm',  
    isTbar:false,  
    //..
    initComponent: function(){
        var fields = [
            {name: 'id'},
            {name: 'created'},
            {name: 'status'},
            {name: 'verify'}, 
            {name: 'removty'},                                       
            {name: 'user'},
        ];
        ///.
        var columns = [{
            dataIndex: 'verify',
            width: 5,
            renderer: function (val) {
                return "<img src='" + STATIC_URL + "plext/resources/fam/" + val.icon + ".png'>"
            },
        },{   
            dataIndex: 'created',
            header: 'Создан',
            sortable:true,
            width: 50,    
            renderer:Ext.util.Format.dateRenderer('d.m.Y H:i'),                                       
        },{   
            header: 'Статус',        
            dataIndex: 'status',
            width: 50,       
            renderer: function (val) {
                return val.name
            },                        
        },{   
            dataIndex: 'user',
            header: 'Пользователь',
            renderer: function (val) {
                return Ext.slugUser(val)
            },            
        }]; 
        //..
//        var isTbar = (USER_OBJ.is_admin)?true:false;
//        var tbar = {
//            xtype: "toolbar",
//            items: [{
//                text: 'Добавить',
//                iconCls: 'silk-add',
//                listeners: {
//                    click: {
//                        scope: this,
//                        fn: this.toCreate,
//                    },
//                },                
//            }]
//        };

        var viewConfig = {
            getRowClass : function(record,id){
                if(record.get('removty')){
                    return 'hide-row';
                }
            },
        };    
        //..
        Ext.apply(this, Ext.apply(this.initialConfig, {
            fields:fields,
            columns:columns,
            isTbar:this.isTbar,
//            tbar:tbar,
            viewConfig:viewConfig,        
        }));
       Plext.Components.TimelineGrid.superclass.initComponent.call(this,arguments); 
        
    },

    validate : function(){
        //  
        if (this.store.getCount()>2){
            Ext.ux.msg('Failure', 'В таблицу <<Экспертиза>> допускаются 2 записи', Ext.Msg.ERROR);	            
            return false
        };
        //..        
        if (!!this.store.getCount()){
            return true
        };
        //..
        Ext.ux.msg('Failure', 'Необходимо заполнить таблицу <<Экспертиза>>', Ext.Msg.ERROR);	    
        return false
        //..
    },      


    getValue:function(){
        var ret =[];
        this.store.data.each(function(item){
            data = item.data;
            data.dirty = item.dirty || false;
            ret.push(data);
        });
        return ret;
    },

    presetValue:function(){
	    var Record = this.store.recordType;	
	    var record = new Record();	    
	    //..
        record.set('created', new Date().format('Y-m-d H:i O'));         
        record.set('status', {
            'id':'crt',
            'name':'в работе',  
            'icon':'new',          
        }); 
        record.set('verify', {
            'id':'abs',
            'name':'не проверен', 
            'icon':'exclamation',           
        });                         
        record.set('user',USER_OBJ);
        ///..
        this.store.add(record);        
        //..
        this.fireEvent('rowafterupdate',record,0);  
    },    

//    initValue : function(){
//        
//        Plext.Components.TimelineGrid.superclass.initValue.call(this);
//    },


    getPermissionUpdate:function(record){
        if (USER_OBJ.is_admin)
            return true;
        //..
        return false
    },   

    toRemove:function(){
        var rec = this.getSelectionModel().getSelected();
        if (!rec) return; 
        ///.
        var id = rec.get('id');
        if (!!id)
            rec.beginEdit();       
            rec.set('removty',true);
            rec.endEdit();           
            //.
            return;
        //...
        Plext.Components.TimelineGrid.superclass.toRemove.call(this,arguments);         
    },

});
Ext.reg('plext:components:timelinegrid', Plext.Components.TimelineGrid);

Plext.Components.TimelineForm = function(){};
Plext.Components.TimelineForm = Ext.extend(Plext.form.FormWindow, {
    //..
	width:350,
    labelWidth: 120,    	
	height:170,    
	autoScroll:true,
    //..
    title:'Экспертиза',
    statusReadOnly:false,
    //...
    focusAt:{id:'plext_components_timelineform_cls_date'},
    //..    
    initComponent: function(){

        var fields =[{
                style: {
                    padding: '0px 0px 0px 0px',
                },             
    //            labelWidth: 120,                                                
                layout:'column',   
                baseCls: 'x-plain',
                items:[{
                    layout: 'form',baseCls: 'x-plain',
                    items:{           
                        id:'plext_components_timelineform_cls_date',                     
                        name:'date',        
	                    fieldLabel: 'Создан',                    
                        xtype:'datefield',
                        allowBlank:false,	                    
                        value:new Date(),   
                        loadValue:function(instance){
                            this.setValue(new Date(instance.get('created')));
                        },                        
                    },
                },{
                    layout: 'form',baseCls: 'x-plain',labelWidth: 2,                                                
                    items:{            
                    	width:50,
                        xtype: 'textfield',
                        name:'time',                              
                        allowBlank:false,	
                        vtype:'Time',   
                        value:new Date().format('G:i'),       
                        loadValue:function(instance){
                            this.setValue(new Date(instance.get('created')).format('G:i'));
                        },                        
                    },            
                }],  
          },{
            readOnly:this.statusReadOnly,
            xtype:'plext:form:combobox',
            name: 'status',
            fieldLabel: 'Статус',

            displayField: 'name',  
            displayTpl:new Ext.XTemplate('{name}'),        

            pageSize:10,   
            apifunction:TimelineStatusAction.read,
            //..

            triggersConfig: [{
                hideTrigger: true,
                iconCls: "x-form-clear-trigger"
            }],

            tpl:new Ext.XTemplate(
                '<tpl for=".">',
                '<div class="x-combo-list-item" style="white-space:normal !important;">',
                '{name}',
                '</div>',
                '</tpl>'
            ),     

            listWidth:260,
            allowBlank:false,  
        },{
            xtype:'plext:form:combobox',
            name: 'verify',
            fieldLabel: 'Верификация',
            listWidth:260,
            allowBlank:false,         
            pageSize:10,   
            apifunction:TimelineVerifyAction.read,
            triggersConfig: [{
                hideTrigger: true,
                iconCls: "x-form-clear-trigger"
            }],
            showIcon:true,                
            displayField: 'name',  
            displayTpl:new Ext.XTemplate('{name}'),        
            tpl:new Ext.XTemplate(
                '<tpl for=".">',
                '<div class="x-combo-list-item" style="white-space:normal !important;">',
                "<img hspace='3' align='middle' src='" + STATIC_URL + "plext/resources/fam/{icon}.png'>",                
                '{name}',
                '</div>',
                '</tpl>'
            ),     
        }];

        Ext.apply(this, Ext.apply(this.initialConfig, {
            fields:fields,
        }));
        //..
        Plext.Components.TimelineForm.superclass.initComponent.apply(this,arguments);     
    },    

    extraSubmit:function(record){
        record.set('user',USER_OBJ);             
        //...   
        val  = record.get('date').format('Y-m-d ')+record.get('time');
        datetime = Date.parseDate(val,'Y-m-d G:i')
        if (!Ext.isDate(datetime)) {
            throw new Ext.Error(' -=error=- ',val);            
        };
        record.set('created',datetime.format('Y-m-d H:i O'));                     
    },

    getRecDupls:function(record,instance){
        //..
        items = this.store.queryBy(function(item){
            ///...
            if (instance)
                if (instance.id == item.id)
                    return false
            //..
            if (item.get('status').id === record.get('status').id){
                Ext.ux.msg('Failure', 'Запись со статусом <<'+item.get('status').name+'>> уже существует', Ext.Msg.ERROR);	                    
                return true;
            };
            ///..    
            return false;
        }); 
        //..
        return items.getRange()
    },

    
});
Ext.reg('plext:components:timelineform', Plext.Components.TimelineForm);


Plext.Components.TimelineCommandColumn = function (config) {
    this.alignIcon = 'right';
    Ext.apply(this, config); 
    //...
    var header =  "<img align='"+this.alignIcon+"' src='" + STATIC_URL + "plext/resources/fam/"+this.headerIcon+".png' >";
//    var header =  "<img src='" + STATIC_URL + "plext/resources/fam/"+config.headerIcon+".png' >";    
    //...
    Ext.apply(this, Ext.apply(config, {
        header: header,            
    }));    
    Plext.Components.TimelineCommandColumn.superclass.constructor.call(this,config);     
};
Ext.extend(Plext.Components.TimelineCommandColumn, Ext.net.CommandColumn, {
    //..
    fixed:true,                     
    width: 48,   
//    width: 60,   
    hideable: false,
    commands: [],
    //..    
    prepareToolbar: function (grid, toolbar, rowIndex, record) {
        //..
        timelines = record.get('timelines');
        if ((!timelines)&&(timelines.length<1))
            return;   
        //..
        Plext.Components.Functions.DateSort(timelines,function(item){return item.created});
//        timeline = timelines[0];
        timeline = Ext.findByFn(timelines,this.idStatus,function(item,data){
            return (item.status.id == data)
        }); 
        if (!timeline)
            return;
        if (!(timeline.status.id == this.idStatus))
            return;
        //..
        tb = Plext.Components.Functions.ShortCutMenu(this.idStatus,grid);
        delete tb[timeline.verify.id];
        var menu = [];
        for (i in tb){     
            menu.push(tb[i]);                                       
        };
        //...                                        
        if ((!menu)||(menu.length==0))
            return;
        //..
//        toolbar.buttonAlign  = 'right';
        toolbar.add(
            new Ext.Button({
                iconCls : 'silk-'+timeline.verify.icon,
                command : 'timeline',
                tooltip: {
                    text: '<b>'+timeline.verify.name+'</b>',
                },   
                menu:menu,                      
            })
        );

        toolbar.doLayout();    
                        
    },
    
});


Plext.Components.LabelCommandColumn = function (config) {
    //..
    Ext.apply(this, config); 
    //...
    Ext.apply(this, Ext.apply(config, {

    }));    
    Plext.Components.LabelCommandColumn.superclass.constructor.call(this,config);     
};
Ext.extend(Plext.Components.LabelCommandColumn, Ext.net.CommandColumn, {
    //..
    fixed:true,                     
    width: 38,   
//    width: 60,   
    hideable: false,
    commands: [],
    //..    
    prepareToolbar: function (grid, toolbar, rowIndex, record) {
        //...
        buttonCls = {
            iconCls : 'glyph-flagred',
            command : 'label',
        };
        //..
        labels = record.get('labels');
        if ((!labels)||(labels.length<1))  
            buttonCls = {
                iconCls : 'glyph-flagblank',
                command : 'label',
            };
        //..
        toolbar.add(new Ext.Button(buttonCls));
        toolbar.doLayout();    
    },
    
});


Plext.Components.Functions.TimelineToClickRowMenu = function(objMenu){
    //...
    command = objMenu.command
    if (!command)
        return;
    var currentrecord = this.getSelectionModel().getSelected();
    if (!currentrecord)
        return;
    prem = Plext.form.UpdatePermission(currentrecord);
    if (!prem){
		Ext.MessageBox.alert('Ошибка','Уровень доступа пользователя не позволяет выполнить операцию');
		return;        
    };
    //..
    tb = Plext.Components.Functions.ShortCutVerify();
    obj = tb[command];
    if (!obj)
        return ;
    timelines = currentrecord.get('timelines').concat([]);
    Plext.Components.Functions.DateSort(timelines,function(item){return item.created});        
    timeline = obj.get(timelines);
    timeline.verify = obj.verify;
    timeline.dirty = true;        
    //..
    currentrecord.beginEdit();
    currentrecord.set('timelines',timelines);      
    currentrecord.markDirty();                
    currentrecord.endEdit();

    this.store.save();           
};

Plext.Components.Functions.OnRowCommand = function(command, record, rowIndex, colIndex){
    this.focusRow(record); 

    //..  label command
    if (/^label/.test(command)){    
        var currentrecord = this.getSelectionModel().getSelected();
        if (!currentrecord)
            return;
    
        var label = {
            'document':currentrecord.get('id'),
            'removty':false,
            'dirty':true,            
        };
        //..
        var labels = currentrecord.get('labels');
        if ((labels)&&(labels.length>0)){
            label = labels[0];
            label.removty = true;
            label.dirty = true;
        };
        //...
        labels = [label];
        //..
        currentrecord.beginEdit();
        currentrecord.set('labels',labels);      
        currentrecord.markDirty();                
        currentrecord.endEdit();
        //..
        this.store.save();          
    };
};

// -----------------------------------------------------------------------------
__Source = {__:''}
Plext.Components.SourceGrid = function(){};
Plext.Components.SourceGrid = Ext.extend(Plext.form.TottalGridPanel, {
    name:'files',
    fieldLabel: '<b>Файлы сканированной копии документа</b>',
	allowBlank:false,   
	stripeRows:true,  

    //..
    initComponent: function(){
        var fields = [
            {name: 'id'},
            {name: 'name'},
            {name: 'ext',},            
            {name: 'file'},
            {name: 'path'},
            {name: 'cached'},
            {name: 'created'},            
            {name: 'size'},   
            {name: 'removty'},                                     
        ];
        ///.
        var columns = [{
            dataIndex: 'created',
            header: 'Создан',
            sortable:true,
            width: 15,    
            renderer:Ext.util.Format.dateRenderer('d.m.Y H:i'),                                               
        },{
            dataIndex: "name",
            header: "Наименование",
            sortable:true,
//            summaryType:'count',
//            summaryRenderer: function (value, metadata, record, rowIndex, colIndex, store) {
//                if (value){
//                    
//                    return 'Всего: '+value+' файлов';
//                };
//                return '&nbsp'
//            },
            width: 50,   
            summaryRenderer: function (value, metadata, record, rowIndex, colIndex, store) {
                var ret = 0,arr = store.getRange();
                //./.
                if (arr.length>0){
                    ret = arr.reduce(function(x, item, i){
                        if (item.get('removty'))
                            return x;
                        return x + 1;
                    },0);
                }
                //..
                if (ret>0){
                    
                    return 'Всего: '+ret+' файлов';
                };
                return '&nbsp'
            },                          
        },{   
            dataIndex: "size",
            header: "Размер",
            width: 10,       
            sortable:true,   
//            summaryType:'sum',   
            renderer: function(val){
                ret = '-';
                if (val)
                    ret = Ext.toSizeString(val,2)                 
                //...            
                return ret;
            },   
            summaryRenderer: function (value, metadata, record, rowIndex, colIndex, store) {
                var ret = 0,arr = store.getRange();
                //./.
                if (arr.length>0){
                    ret = arr.reduce(function(x, item, i){
                        if (item.get('removty'))
                            return x;
                        y  = item.get('size');
                        if (!y)
                            y = 0;
                        return x + y;
                    },0);
                }
                return (ret==0)?'-':Ext.toSizeString(ret,2);
            },                     
        },{   
            dataIndex: "ext",
            header: "Тип",
            width: 10,       
            sortable:true,                             
        }]; 
        //..
        var tbar = {
            xtype: "toolbar",
            items: [{
                text: 'Добавить',
                iconCls: 'silk-add',
                listeners: {
                    click: {
                        scope: this,
                        fn: this.toCreate,
                    },
                },                
            }, '-', {                
                text: 'Удалить',
                iconCls: 'silk-delete',
                listeners: {
                    click: {
                        scope: this,
                        fn: this.toRemove,
                    },
                },  
            }, '-', {                
                text: 'Посмотр',
                iconCls: 'silk-eye',
                listeners: {
                    click: {
                        scope: this,
                        fn: this.toWatch,
                    },
                },                                                
            }]
        };    

        var viewConfig = {
            getRowClass : function(record,id){
                if(!!record.get('removty')){
                    return 'hide-row';
                }
            },
        };                                        
        //..
        Ext.apply(this, Ext.apply(this.initialConfig, {
            fields:fields,
            columns:columns,
            tbar:tbar,
            viewConfig:viewConfig,
        }));
        Plext.Components.SourceGrid.superclass.initComponent.call(this,arguments); 
        
    },

    permision:function(){
		var arr = this.cxt.timelines.getStore().getRange().map(function(record){
		    return record.get('verify').lavel;;
		});

		if ((!arr)||(arr.length==0)){
            Ext.ux.msg('ERROR', 'Нет экспретизы!', Ext.Msg.ERROR);					
		    return false;
		};
		//..
		
        var recordLavel = Math.max(arr);
        if (USER_OBJ.lavel < recordLavel){
            Ext.ux.msg('ERROR', 'Уровень доступа пользователья не позволяет изменять документы!', Ext.Msg.ERROR);			            
            return false;
        };
        return true    
    },
    validate : function(){
        //...
        totalSize = this.getStore().sum('size');
        if (totalSize > MAXSIZEUPLOAD){
            Ext.ux.msg('ERROR', 'Превышен максимальный объем загруженных файлов для текущего документа!', Ext.Msg.ERROR);			
            return false
		};   
		//... 
		perm = this.permision();
		if (!perm){
		    return false;
		};
		//..
        return true;        
    },      

    toCreate:function(){
        if (!this.validate())
            return;
        //...
		var win = new Plext.Components.SourceUploadForm({
			store:this.store,
		});
		win.show(this);
        win.items.get(this.focusAt).focus('', 10);
    }, 

    toUpdate:function(){
		var rec = this.getSelectionModel().getSelected();
		if (!rec) return;
		//..
		var win = new Plext.Components.SourceEditForm({
			store:this.store,
			instance:rec,
		});

		win.show(this);
		win.toUpdate();
        win.items.first().focus('', 10);
    },

    toWatch:function(){
		var record = this.getSelectionModel().getSelected();
		if (!record) return;
		//..
		if (record.get('cached')==false){
            window.open(STORAGE_URL+record.get('path'));        		
        }else{
            fname = record.get('file').replace('/^\w+\//g','');
            window.open(UPLOAD_URL+fname);        		            
        };
    },   
    getValue:function(){
        var ret =[];
        this.store.data.each(function(item){
            data = item.data;
            data.dirty = item.dirty || false;
            ret.push(data);
        });
        return ret;
    },

    toRemove:function(){
		perm = this.permision();
		if (!perm){
		    return false;
		};
		///..    
		var record = this.getSelectionModel().getSelected();    
        if (!/^ext-record/.test(record.id)){
            //..
            record.beginEdit();       
            record.set('removty',true);
            record.endEdit();           
            //..
            return;
        };
        ///..
        Plext.Components.SourceGrid.superclass.toRemove.call(this,arguments);         
        //..
        
    },
    
});


Plext.Components.SourceEditForm = function(){};
Plext.Components.SourceEditForm = Ext.extend(Plext.form.FormWindow, {
	width:505,
    labelWidth: 100,    	
	height:130,    
	autoScroll:true,
    //..
    title:'Наименование файла',
    focusAt:{id:'plext_components_sourceeditform_name'},    
    //...
    initComponent: function(){

        var fields =[{
            fieldLabel: 'Создан',                    
            xtype:'plext:form:datetimefield',
            name:'created',
            allowBlank:true,    
            value:new Date().format('M j, Y, G:i'),   
        },{
            id:'plext_components_sourceeditform_name',
            xtype:'textfield',
	        name:'name',
	        fieldLabel: 'Наименование',
	        allowBlank:true,
	        width : 350, 
            vtype:'fileName',
        
        }];
        //..
        Ext.apply(this, Ext.apply(this.initialConfig, {
            fields:fields,
        }));
        //..
        Plext.Components.SourceEditForm.superclass.initComponent.apply(this,arguments);     
    },    
    //..

    getRecDupls:function(record,instance){
        items = this.store.queryBy(function(item){
            var ret = (item.data.name === record.data.name);                        
            if (instance)
                ret = (ret && instance.id !== item.id);
            return ret;
        });        
        return items.getRange()
    },

});


Plext.Components.SourceUploadForm = function(){}
Plext.Components.SourceUploadForm  = Ext.extend( Plext.form.FormWindow, {
	width:500,
    labelWidth: 40,    	
	height:130,    
    //..
    title:'Загрузка файла',
    fileUpload:true,
    //...
    initComponent: function(){
        //..
        var fields =[{
            fieldLabel: 'Создан',                    
            xtype:'plext:form:datetimefield',
            name:'created',
            allowBlank:true,    
            value:new Date().format('M j, Y, G:i'),   
            listeners:{
                render:{
                    scope:this,
                    fn:this.initcmp,
                },
            },       
        },{        
            xtype: 'fileuploadfield',
            emptyText: 'Выберите файл',
            fieldLabel: 'Файл',
            name: 'file',
            buttonText: '',
            buttonCfg: {
                iconCls: 'silk-script-add',
            }, 	
            anchor:'100%',  
            vtype:'fileUpload',            
        }];
        //...
        Ext.apply(this, Ext.apply(this.initialConfig, {
            fields:fields,
        }));
        //..
        Plext.Components.SourceUploadForm.superclass.initComponent.apply(this,arguments); 
    },    
    //..
	toSubmit: function(){
		var form = this.getForm();
		if (!form.isValid()){
			Ext.MessageBox.alert('Ошибка при заполнении формы','Необходимо заполнить все поля, подчеркнутые красной линией!');
			return false;
		};
		//..
        form.submit({
            url: '/files/upload/',
            waitMsg: 'Выполняется загрузка...',
            success: this.toSuccessUpload.createDelegate(this),
            failure: this.toFailureUpload.createDelegate(this),  
//            csrfmiddlewaretoken:getCookie('csrftoken'),   
        });		
	},
	 
	toSuccessUpload:function(fp, o){
        Ext.ux.msg('Success', 'Файл успешно загружен', Ext.Msg.INFO);

		var form = this.getForm();
	    var Record = this.store.recordType;
	    var record = new Record();
        var data  = o.result.data;
        
        for (var attr in data){
    		record.set(attr, data[attr]);		            
        };
        
		record.set('created', this.cmp.created.getValue());		

//		record.set('ext', o.result.ext);										
//		record.set('size', o.result.size);												
//		record.set('file', o.result.file);				
//		record.set('cached', o.result.cached);						
//		record.set('path', o.result.path);								

        this.store.add(record);

        this.close();	          	
	},
	   
	toFailureUpload:function(form, action){
        switch (action.failureType) {
        case Ext.form.Action.CLIENT_INVALID:
            Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
            break;
        case Ext.form.Action.CONNECT_FAILURE:
            Ext.Msg.alert('Failure', 'Ajax communication failed');
            break;
        case Ext.form.Action.SERVER_INVALID:
           Ext.Msg.alert('Ошибка', action.result.msg);
        };
	},   
});


// ----------------------------------------------------------------------------
Ext.reg('plext:components:sourcegrid', Plext.Components.SourceGrid);
Ext.reg('plext:components:sourceeditform', Plext.Components.SourceEditForm);
Ext.reg('plext:components:sourceuploadform', Plext.Components.SourceUploadForm);

// ----------------------------------------------------------------------------
__Discus = {__:''}
// ----------------------------------------------------------------------------
Plext.Components.DiscusGrid = function(){};
Plext.Components.DiscusGrid = Ext.extend(Plext.form.TottalGridPanel, {
    //..
    fieldLabel: '<b>Обсуждение</b>',
	allowBlank:false,     
    winClass:'Plext.Components.DiscusForm', 
    sortInfo:{field: 'created', direction: "ASC"},        
    //..
    initComponent: function(){
        var fields = [
            {name:'id'},
            {name:'created'},
            {name:'text'},
            {name:'user'},
            {name:'catchers'},
        ];
        ///.
        var columns = [{
            dataIndex: 'text',
            renderer:(function(value, p, record){
                //..
                return String.format(
                    '<div> \
                        <span style=" \
                            margin: 0 0 5px 15px; \
                            width: 200px; \
                            float: right; \
                            white-space: normal; \
                        "> \
                            <b>Опубликовано:</b> {0} \
                            </br><b>От:</b> {1}\
                            </br><b>Кому:</b> {2}\
                            </br><b>Прочитано:</b>{3} \
                        </span>\
                        <p style="white-space: normal;">{4}{5}</p>\
                    </div>',
                    this.CreatedRenderer(record),
                    this.UseRenderer(record),
                    this.ReceiversRenderer(record),
                    this.ReadersRenderer(record),
                    this.PictRenderer(record,value),
                    this.TextRenderer(record,value)  
                );
            }).createDelegate(this),            
//            summaryType:'count',
            summaryRenderer: function (value, metadata, record, rowIndex, colIndex, store) {
                return '&nbsp'
            } 
        }]; 
        //..
        Ext.apply(this, Ext.apply(this.initialConfig, {
            fields:fields,
            columns:columns,
        }));
        //..
        Plext.Components.DiscusGrid.superclass.initComponent.call(this,arguments); 
        //..
    },
    //.............................................
    CreatedRenderer:function(record){
        return new Date(Date.parse(record.get('created'))).format('M j, Y, G:i')
    },   
    UseRenderer:function(record){
        return Ext.slugUser(record.get('user'))
    },        
    ReceiversRenderer:function(record){
        var arr = record.get('catchers');
        if (!arr) return '&nbsp'
        //..
        var ret = arr.map(function(item){
            return Ext.slugUser(item.user)
        });
        return ret.join(', ')
    },
    ReadersRenderer:function(record){
        var arr = record.get('catchers');
        if (!arr) return '&nbsp'
        //..
        arr = arr.filter(function(item){
            return item.is_readed
        });        
        //..        
        var ret = arr.map(function(item){
            return Ext.slugUser(item.user)+' ('+new Date(Date.parse(item.modified)).format('M j, Y, G:i')+')'
        });
        return ret.join(', ')
    },    
    PictRenderer:function(record){
        ret = '';
        //...
        is_unsaved = /^ext-record/.test(record.id);
//        is_readed = record.get('catchers').some(function(item){
//            ///..
//            if (parseInt(item.user.id) == parseInt(USER_OBJ.id))
//                return item.user.is_readed
//            return false
//        });    
//        is_owner = (parseInt(record.get('user').id) == parseInt(USER_OBJ.id));
        //..
        if (is_unsaved)
            ret = '<img src="' + STATIC_URL + 'plext/resources/fam/new.png" style="margin: 0 5 0 0;">';
//        if (!is_readed && !is_owner)
//            ret = '<img src="' + STATIC_URL + 'plext/resources/fam/new.png" style="margin: 0 5 0 0;">';            
        return ret
    },    
    TextRenderer:function(record,value){
        ret = value;
        is_readed = record.get('catchers').some(function(item){
            ///..
            if (parseInt(item.user.id) == parseInt(USER_OBJ.id)){
                return item.is_readed
            };
            return false
        });      
        is_owner = (parseInt(record.get('user').id) == parseInt(USER_OBJ.id));
        //..

        if (!is_readed && !is_owner)
            ret = value.slice(0,15)+'...<span style="color:#7f7f7f;font-style:italic">(чтобы увидеть полный \
                            текст сообщения выполните двойной щелчок по текущей строке)</span>';
        return ret
    },            
    //.............................................
    
    validate : function(){
        return true;        
    },      

    getValue:function(){
        var ret =[];
        this.store.data.each(function(item){
            data = item.data;
            data.dirty = item.dirty || false;
            ret.push(data);
        });
        return ret;
    },

    onRender : function(ct, position){
        Plext.Components.DiscusGrid.superclass.onRender.call(this,ct, position);
        //.
        this.getView()
            .el
            .select('.x-grid3-header')
            .setStyle('display', 'none');
                
    },

    toCreate:function(){
        arr = this.store.getRange();
        if (arr.length>0) {
            var record = arr[arr.length-1];
            if (/^ext-record/.test(record.id)){
			    Ext.MessageBox.alert('Добаление невозможно!!!','Удалите вновь созданные сообщения');
                return;                  
            };
        };
        //..
        Plext.Components.DiscusGrid.superclass.toCreate.call(this);    
    },

    toRemove:function(){
        var record = this.getSelectionModel().getSelected();
        if (!record) return; 
        //..        
        if (!/^ext-record/.test(record.id)) return;
        //..
        this.store.remove(record);
        this.setTotalSize();
    },     

    toUpdate:function(){
        //..    
		var record = this.getSelectionModel().getSelected();
		if (!record) return;
		//.
        is_new = (/^ext-record/.test(record.id))
		is_owner = (parseInt(record.get('user').id) == parseInt(USER_OBJ.id));
        is_readed = record.get('catchers').some(function(item){
            ///..
            if (parseInt(item.user.id) == parseInt(USER_OBJ.id)){
                return item.is_readed
            };
            return false
        }); 		
        //...
        if (is_new || is_owner || is_readed) return;		        
		//..
//		var arr = record.get('catchers').filter(function(item){
//		    return (!parseInt(item.user.id)==parseInt(USER_OBJ.id))
//		});
//		var catcher = {
//		    'user':USER_OBJ,
//		    'created':new Date().format('Y-m-d H:i O'),
//		    'is_readed':true,
//		    'dirty':true,
//		}
//		arr  = arr.concat([catcher,])
//        var arr = record.get('catchers');
//        for(var i=0; i<arr.length; i++){
//            if (parseInt(arr[i].user.id)==parseInt(USER_OBJ.id)) {
//                arr[i].created = new Date().format('Y-m-d H:i O');
//                arr[i].is_readed = true;
//                arr[i].dirty = true;
//            };
//        }      
		var arr  = record.get('catchers');
        Ext.each(arr,function(item){
            if (parseInt(item.user.id)==parseInt(USER_OBJ.id)) {
                Ext.apply(item,{
                    'created':new Date().format('Y-m-d H:i O'),
                    'is_readed':true,
                    'dirty':true,
                });
            };            
        });
        //..
        record.beginEdit();
	    record.set('catchers',arr);        
	    record.set('dirty',true);        	    
        record.endEdit();      
        //..
    },
    
});
// ----------------------------------------------------------------------------
Plext.Components.DiscusForm = function(){};
Plext.Components.DiscusForm = Ext.extend(Plext.form.FormWindow, {
    //..
	width:505,
    labelWidth: 50,    	
	height:230,    
	autoScroll:true,
    //..
    title:'Комментарий',
    focusAt:{id:'plext_components_discusform_text'},        
    //...
    initComponent: function(){

        var fields =[{
	        fieldLabel: 'Время',                    
            xtype:'plext:form:datetimefield',
            name:'created',
            value:new Date().format('M j, Y, G:i'),            
        },{
            id:'plext_components_discusform_text',            
            xtype:'textarea',
	        name:'text',
	        fieldLabel: 'Текст',
	        allowBlank:false,
	        width : 410, 
        },{
            xtype:'plext:form:superboxselect',
	        name:'receivers',
            fieldLabel: 'Кому',	        
//            anchor:'-12',
	        width : 410, 
        	allowBlank:false,    
            exclude:true,        	
        	//..
	        apiFnRead:DiscusReceiversComboClamp.read,
            itemSelector: "div.x-combo-list-item",	        
            displayFieldTpl: new Ext.XTemplate('{lastname} {firstname} {midname} ({username})'),
            tpl:new Ext.XTemplate(
                '<tpl for=".">',
                    '<div class="x-combo-list-item" style="white-space:normal !important;">',
                        '{lastname} {firstname} {midname} ({username})',
                    '</div>',
                '</tpl>'
            ),          	                                    	        
//        },{
//            xtype:'textfield',
//	        name:'user',
//            hidden:true,
//            value:USER_OBJ,
//        },{
//            xtype:'checkbox',
//	        name:'is_unreaded',
//            hidden:true,
//            checked : true  
            listeners:{
                scope:this,
                render:this.initcmp,
            },          
        }];

        Ext.apply(this, Ext.apply(this.initialConfig, {
            fields:fields,
        }));
        //..
        Plext.Components.DiscusForm.superclass.initComponent.apply(this,arguments);     
    },    
    
    extraSubmit:function(record){
        //..
        record.set('user',USER_OBJ);        
        record.set('catchers',this.cmp.receivers.getValue().map(function(item){
            return {
                'user':item,
                'is_readed':false,
    		    'created':new Date().format('Y-m-d H:i O'),   
    		    'dirty':true,    		                 
            }
        }));                
        //..
        Plext.Components.DiscusForm.superclass.extraSubmit.call(this,record);         
    },
    
});

// ----------------------------------------------------------------------------
Ext.reg('plext:components:discusgrid', Plext.Components.DiscusGrid);
Ext.reg('plext:components:discusform', Plext.Components.DiscusForm);


__Organization = {__:''};
// ----------------------------------------------------------------------------


Plext.Components.OrganizationChangeForm = function(){}
Plext.Components.OrganizationChangeForm  = Ext.extend( Plext.form.FormWindow, {
	width:500,
    labelWidth: 80,    	
	height:100,    
    //..
    title:'Смена учреждения',
    fileUpload:true,
    focusAt:{id:'plext_components_organizationchangeform_organization'},            
    //...
    initComponent: function(){
        //..
        var fields =[{
            id:'plext_components_organizationchangeform_organization',
            width:380,
            xtype:'plext:form:combobox',
            name: 'organization',
            fieldLabel: 'Организация',
            listWidth:350,                
            ///.
            apifunction:OrganizationChangeAction.read,
            displayTpl:new Ext.XTemplate('{name} ({code})'),
            tpl:new Ext.XTemplate(
                '<tpl for=".">',
                    '<div class="x-combo-list-item" style="white-space:normal !important;">',
                        '{name} ({code})',
                    '</div>',
                '</tpl>'
            ),

            listeners:{
                render:{
                    scope:this,
                    fn:this.initcmp,
                },
            },            
        }];
        //...
        Ext.apply(this, Ext.apply(this.initialConfig, {
            fields:fields,
        }));
        //..
        Plext.Components.OrganizationChangeForm.superclass.initComponent.apply(this,arguments); 
    },    
    //..
	toSubmit: function(){
		var form = this.getForm();
		if (!form.isValid()){
			Ext.MessageBox.alert('Ошибка при заполнении формы','Необходимо заполнить все поля, подчеркнутые красной линией!');
			return false;
		};
		//..
        form.submit({
            params: {'organization_id': this.cmp.organization.getValue()},        
            url: '/accounts/organization_change/',
            waitMsg: 'Выполняется смена учреждения...',
            success: this.toSuccessUpload.createDelegate(this),
            failure: this.toFailureUpload.createDelegate(this),  
        });		
	},
	 
	toSuccessUpload:function(fp, o){
        Ext.ux.msg('Success', 'Смена учреждения успешно проведена', Ext.Msg.INFO);
        this.close();	          	
        location.reload();
	},
	   
	toFailureUpload:function(form, action){
        switch (action.failureType) {
        case Ext.form.Action.CLIENT_INVALID:
            Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
            break;
        case Ext.form.Action.CONNECT_FAILURE:
            Ext.Msg.alert('Failure', 'Ajax communication failed');
            break;
        case Ext.form.Action.SERVER_INVALID:
           Ext.Msg.alert('Ошибка', action.result.msg);
        };
	},   
});




Plext.Components.OrganizationReportForm = function(){};
Plext.Components.OrganizationReportForm = Ext.extend(Ext.Window, {
    //..
    title:'Отчеты',
	width:600,
	height:400,
	layout:'vbox',
	modal:true,
	frame:true,
	initComponent:function(){

        //..win config         
		config = {
            items:[{
                layout:'column', bodyCssClass: 'x-panel-mc', style: { padding: '0px 0px 0px 5px',},    
                items:[{
                    xtype:'button',
                    width: 100, style: { padding: '0px 0px 0px 5px',},                    
                    text: '<h1 style="padding:5px;">Помещения (все)</h1>',
                    scale: 'large', 
	                handler: (function(){
	                    organization_id = this.cxt.organization.id;	                
                        window.open(['/frontend/v2/pasport/report/rooms_ma',organization_id,''].join('/'));                                
	                }).createDelegate(this,[]),	      
                }],               
            },{   
                layout:'column', bodyCssClass: 'x-panel-mc', style: { padding: '0px 0px 0px 5px',},    
                items:[{
                    xtype:'button',
                    width: 100, style: { padding: '0px 0px 0px 5px',},                    
                    text: '<h1 style="padding:5px;">Этажи (все)</h1>',
                    scale: 'large', 
	                handler: (function(){
	                    organization_id = this.cxt.organization.id;	                
                        window.open(['/frontend/v2/pasport/report/storey_ma',organization_id,''].join('/'));                                
	                }).createDelegate(this,[]),	                 
                }], 
            },{   
                layout:'column', bodyCssClass: 'x-panel-mc', style: { padding: '0px 0px 0px 5px',},    
                items:[{
                    xtype:'button',
                    width: 100, style: { padding: '0px 0px 0px 5px',},                    
                    text: '<h1 style="padding:5px;">Лифты (все)</h1>',
                    scale: 'large', 
	                handler: (function(){
	                    organization_id = this.cxt.organization.id;	                
                        window.open(['/frontend/v2/pasport/report/lift_ma',organization_id,''].join('/'));                                
	                }).createDelegate(this,[]),	                 
                }],
            },{   
                layout:'column', bodyCssClass: 'x-panel-mc', style: { padding: '0px 0px 0px 5px',},    
                items:[{
                    xtype:'button',
                    width: 100, style: { padding: '0px 0px 0px 5px',},                    
                    text: '<h1 style="padding:5px;">Фасады (все)</h1>',
                    scale: 'large', 
	                handler: (function(){
	                    organization_id = this.cxt.organization.id;	                
                        window.open(['/frontend/v2/pasport/report/facade_ma',organization_id,''].join('/'));                                
	                }).createDelegate(this,[]),	                 
                }],                  
            },{   
                layout:'column', bodyCssClass: 'x-panel-mc', style: { padding: '0px 0px 0px 5px',},    
                items:[{
                    xtype:'button',
                    width: 100, style: { padding: '0px 0px 0px 5px',},                    
                    text: '<h1 style="padding:5px;">Строения (все)</h1>',
                    scale: 'large', 
	                handler: (function(){
	                    organization_id = this.cxt.organization.id;	                
                        window.open(['/frontend/v2/pasport/report/building_ma',organization_id,''].join('/'));                                
	                }).createDelegate(this,[]),	                 
                }],      
            },{   
                layout:'column', bodyCssClass: 'x-panel-mc', style: { padding: '0px 0px 0px 5px',},    
                items:[{
                    xtype:'button',
                    width: 100, style: { padding: '0px 0px 0px 5px',},                    
                    text: '<h1 style="padding:5px;">Замощения (все)</h1>',
                    scale: 'large', 
	                handler: (function(){
	                    organization_id = this.cxt.organization.id;	                
                        window.open(['/frontend/v2/pasport/report/terrain_ma',organization_id,''].join('/'));                                
	                }).createDelegate(this,[]),	   
                }],                                  	                              
            },{   
                layout:'column', bodyCssClass: 'x-panel-mc', style: { padding: '0px 0px 0px 5px',},    
                items:[{
                    xtype:'button',
                    width: 100, style: { padding: '0px 0px 0px 5px',},                    
                    text: '<h1 style="padding:5px;">Ограждение (все)</h1>',
                    scale: 'large', 
	                handler: (function(){
	                    organization_id = this.cxt.organization.id;	                
                        window.open(['/frontend/v2/pasport/report/fence_ma',organization_id,''].join('/'));                                
	                }).createDelegate(this,[]),	                 	                
                }],                                  
                
            }],
			buttons:[{
				text:'Закрыть',
				handler:(function(){
		    		this.close();
				}).createDelegate(this,[])
			}],            
	
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Plext.Components.OrganizationReportForm.superclass.initComponent.apply(this, arguments);	

	},
		
});

__Branch = {__:''};
// ----------------------------------------------------------------------------


Plext.Components.BranchComboBox = function(){};
Plext.Components.BranchComboBox = Ext.extend( Plext.form.ComboBox, {
    //...
    name: 'branch',
    fieldLabel: 'Подразделение',
//    listWidth:400,
    allowBlank:false,         
    pageSize:10,   

    triggersConfig: [{
        hideTrigger: true,
        iconCls: "x-form-clear-trigger"
    }],

    displayField: 'name',  
    displayTpl:new Ext.XTemplate('{tcode} - {name}'),        
    tpl:new Ext.XTemplate(
        '<tpl for=".">',
        '<div class="x-combo-list-item" style="white-space:normal !important;">',
        '{tcode} - {name}',
        '</div>',
        '</tpl>'
    ),     
    anchor:'-3',  


});

Ext.reg('plext:components:branchcombobox', Plext.Components.BranchComboBox);


