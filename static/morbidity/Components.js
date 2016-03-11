Ext.ns('Morbidity.Components.Functions')

Morbidity.Components.OrganizationChangeForm = function(){}
Morbidity.Components.OrganizationChangeForm  = Ext.extend( Plext.form.FormWindow, {
    width:500,
    labelWidth: 80,     
    height:100,    
    //..
    title:'Смена учреждения',
    fileUpload:false,
    focusAt:{id:'morbidity_components_organizationchangeform_organization'},            
    //...
    initComponent: function(){
        //..
        var fields =[{
            id:'morbidity_components_organizationchangeform_organization',
            width:380,
            xtype:'plext:form:combobox',
            name: 'organization',
            fieldLabel: 'Организация',
            listWidth:350,                
            ///.
            apifunction:MorbidityOrganizationAction.read,
            displayTpl:new Ext.XTemplate('{fullname}'),
            tpl:new Ext.XTemplate(
                '<tpl for=".">',
                    '<div class="x-combo-list-item" style="white-space:normal !important;">',
                        '{fullname}',
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
        Morbidity.Components.OrganizationChangeForm.superclass.initComponent.apply(this,arguments); 
    },    
    //..
    toSubmit: function(){
        var form = this.getForm();
        if (!form.isValid()){
            Ext.MessageBox.alert('Ошибка при заполнении формы','Необходимо заполнить все поля, подчеркнутые красной линией!');
            return false;
        };
        //..
        ORG_OBJ = this.cmp.organization.getValue({is_obj:true});
        this.orgstatus.update([
            '<h1 style="color:#eeeeec;" align="center">',
                ORG_OBJ.fullname,
            '</h1>',
        ].join(' '));
        // ..
        this.gridInstance
        Ext.apply(this.gridInstance.store.baseParams,{
            'organization':{
                'id':ORG_OBJ.id,
            },
        });                
        this.gridInstance.toLoad();        
        // ...
        if (this.Group.getLayout().activeItem.xtype == "morbidity:card:edit:cls")
            this.Form.toCancel();
        //..
        this.Group.setActiveItem(0);
        // ...
        this.close();               
    },
     
});
// ...
Morbidity.Components.DiagnosesSuperbox = function(){};
Morbidity.Components.DiagnosesSuperbox = Ext.extend(Plext.form.SuperBoxSelect, {

    // anchor:'-12',
    // width : 200, 

    allowBlank:false,    
    multiSelectMode:true,
    exclude:true,           
    //..
    apiFnRead:MorbidityDiagnosisAction.read,
    itemSelector: "div.x-combo-list-item",          
    displayFieldTpl: new Ext.XTemplate('{name}'),
    tpl:new Ext.XTemplate(
        '<tpl for=".">',
            '<div class="x-combo-list-item" style="white-space:normal !important;">',
                '{name} ',
            '</div>',
        '</tpl>'
    ),
    dataField:'diagnoses',

    extraAddItem:function(obj,box){

        var record = {},
            sortkeys = Plext.Components.Functions.SortDictKeysByAttr,
            fields = obj.fields;
        //..
        if ((fields)&&(typeof fields == 'object')&&(Object.keys(fields).length)) {
            var keys = sortkeys(fields,'order');
            for (var i = 0; i < keys.length; i++) {
                // ...
                var name = keys[i];
                var field = fields[name];
                var valueField = Plext.form[field.type.name];
                // ...
                var config = {
                    label:{
                        renderTo: box.el.id,
                        text:(field.label=="")?"":' '+field.label.replace(/<s>(.*?)<\/s>/,'$1')+' ',
                        value:field.label,
                        hidden:field.type.config.hidden,
                    },
                    value:{
                        renderTo: box.el.id,
                        width: 40,
                        style:{
                            margin:'3px 3px 3px 5px',
                        },
                        value:field.value,
                        allowBlank: false,
                    },
                    mu:{
                        renderTo: box.el.id,
                        text:(field.mu=="")?"":' '+field.mu,
                        value:field.mu,
                        style:{
                            margin:'0px 3px 0px 0px',
                        },
                        hidden:field.type.config.hidden,
                    }
                };

                // ...extra config value
                if (field.type.config){
                    for (cfg in field.type.config){
                        config.value[cfg] = field.type.config[cfg];
                        if (field.type.config.rule) {
                            config.value.listeners = {
                                scope:box,
                                select:this.boxValueFieldSelect,
                            };
                        };
                    };                    
                };

                // ..
                record[name] = {
                    'order':field.order,
                    'labelField':new Ext.form.Label(config.label),
                    'valueField':new valueField(config.value),
                    'muField':new Ext.form.Label(config.mu),
                };
            };
        };
        // ..
        box.value = {
            id:obj.id,
            name:obj.name,
            fields:record,
        };

    },

    boxValueFieldSelect: function(item, record, index) {
        // ...
        var fields = item.rule.fields;
        // ...
        for (var i = 0; i < fields.length; i++) {
            // ...
            var field = this.value.fields[fields[i]];
            // ...
            var labelField = field.labelField;
            var valueField = field.valueField;
            var muField = field.muField;
            // ...
            if ((item.rule.value.id == record.get('id'))==item.rule.condition) {
                labelField.show();
                valueField.show();
                muField.show();
            }else{
                labelField.hide();
                valueField.hide();
                muField.hide();
            };
        };
    },

    getValue : function() {
        return this.items.getRange().map(function(item){
            // ...
            var obj = item.value,
                fields = {};
            // ...
            for(var key in item.value.fields) {
                var field = item.value.fields[key];
                var order = field.order;
                var label = field.labelField.value;
                var value = field.valueField.getValue();
                var mu = field.muField.value;

                // ...
                if ((!field.valueField.hidden)&&(value)) {
                    fields[key] = {
                        order:order,
                        label:label,
                        value:value,
                        mu:mu,
                    };                    
                };
            };
            // ...
            return {
                id:obj.id,
                name:obj.name,
                fields:fields,
            };
        });
    },

    loadValue:function(instance,win){
        // ...
        win.el.mask("Выполняется загрузка...", win.msgCls);
        // ...
        var idArr = [],
            data = instance.get('data')[this.dataField];
        // ...
        if (!data) return;
        // ..
        for (var i = 0; i < data.length; i++) {
            idArr.push(data[i].id)
        };
        // ..
        this.store.load({
            params:{
                include:idArr,                        
            },
            callback:this.afteLoadValue,
            scope:this,
            win:win,
            instance:instance,
        });
        // ...
    },
    afteLoadValue:function(records,options,success){
        var win = options.win,
            instance = options.instance,
            values = [];
        var instanceDiagnoses = instance.get('data')[this.dataField];
        // ...
        win.el.unmask();
        delete this.store.baseParams.include;
        // ....
        for (var i = 0; i < instanceDiagnoses.length; i++) {
            var instanceDiagnosis = instanceDiagnoses[i],
                diagnosis = {};
            // ..
            for (var j = records.length - 1; j >= 0; j--) {
                var recordDiagnosis = records[j].data;
                if ((recordDiagnosis.id == instanceDiagnosis.id)
                        // &&(recordDiagnosis.name == instanceDiagnosis.name)
                    ){
                    diagnosis = instanceDiagnosis;
                    break;
                };
            };
            // ..
            if (!Ext.isEmptyObject(diagnosis)){
                var fields = diagnosis.fields;
                for (k in fields){
                    var field = fields[k];
                    // ...value
                    if (Ext.isObject(field.value)) {
                        recordDiagnosis.fields[k].value = {
                            id:field.value.id,
                            name:field.value.name,
                        };
                    }else{
                        recordDiagnosis.fields[k].value = field.value ;
                    };
                    // ...hidden
                    var hidden = true;
                    if (!Ext.isEmpty(field.value))
                        hidden = false;
                    // ...
                    recordDiagnosis.fields[k].type.config.hidden = hidden;
                };
                // ...
                values.push(recordDiagnosis);
            }else{
                throw 'элемент <<'+recordDiagnosis.name+'>> отсутствует в справочнике';
            };
        };
        // ..
        this.setValue(values);
    },

});
Ext.reg('morbidity:components:diagnosessuperbox', Morbidity.Components.DiagnosesSuperbox);


Morbidity.Components.ServicesSuperbox = function(){};
Morbidity.Components.ServicesSuperbox = Ext.extend(Morbidity.Components.DiagnosesSuperbox, {
    apiFnRead:MorbidityServiceAction.read,
    dataField:'services',

});
Ext.reg('morbidity:components:servicessuperbox', Morbidity.Components.ServicesSuperbox);


Ext.ns('Morbidity.Components');
Morbidity.Components.HistoryGridGrid = function(){};
Morbidity.Components.HistoryGridGrid = Ext.extend(Plext.form.SimpleGridPanel, {
    sortInfo:{
        field: 'datetime', 
        direction: "ASC"
    },        
    //..
    initComponent: function(){
        var fields = [
            // {name: 'removty'}, // флажок скрытия строки для уделния
            // {name: 'id'},
            {name: 'datetime'},
            {name: 'object'},             
            {name: 'data'}, 
        ];
        ///.
        var columns = [{
            dataIndex: 'datetime',
            header: 'Дата/время',
            sortable:true,
            width: 15,    
            renderer:Ext.util.Format.dateRenderer('d.m.Y H:i'),                                       
        },{
            dataIndex:'object',
            header:'Документ',
            width:20,
            renderer:function(val){
                return val.name;
            }
        },{
            header: 'Содержание',        
            dataIndex: 'data',
            renderer: function (data,cell,record) {
                // ...
                var rendererName = record.get('object').renderer;
                var rendererFunc = Morbidity.Components.Functions[rendererName];
                // ...
                if (rendererFunc)
                    return rendererFunc(data);
                return ''
            },               
        // },{   
        //     dataIndex: 'employer',
        //     header: 'Сотрудник',
        //     width: 30,            
        //     renderer: function (val) {
        //         return Ext.slugUser(val)
        //     },            
        }]; 
        // ..
        var tbar = {
            xtype: "toolbar",
            items: [{
                text: 'Взрослые',
                iconCls: 'silk-add',
                menu:[{
                    text: '01 - Медкарта',
                    iconCls: 'silk-page',
                    listeners: {
                        click: {
                            scope: this,
                            fn: this.toCreateEnterOrganization,
                        },
                    },
                },{
                    text: '02 - Обменнка',
                    iconCls: 'silk-page',
                    listeners: {
                        click: {
                            scope: this,
                            fn: this.toCreateObmenka,
                        },
                    },
                },{
                    text: '03 - Первичный осмотр',
                    iconCls: 'silk-page',
                    listeners: {
                        click: {
                            scope: this,
                            fn: this.toCreateBeginEpicris,
                        },
                    },
                },{
                    text: '04 - Протокол родов',
                    iconCls: 'silk-page',
                    listeners: {
                        click: {
                            scope: this,
                            fn: this.toCreateDelivery,
                        },
                    },                    
                },{
                    text: '05 - Протокол кесарева сечения',
                    iconCls: 'silk-page',
                    listeners: {
                        click: {
                            scope: this,
                            fn: this.toCreateCesarean,
                        },
                    },
                },{           
                    text: '06 - Выписной эпикриз',
                    iconCls: 'silk-page',
                    listeners: {
                        click: {
                            scope: this,
                            fn: this.toCreateFinishEpicris,
                        },
                    },  
                },{              
                    text: '07 - Посмертный эпикриз',
                    iconCls: 'silk-page',
                    // listeners: {
                    //     click: {
                    //         scope: this,
                    //         fn: this.toCreateChild,
                    //     },
                    // },                  
                }],       
            }, '-', {                  
                text: 'Дети',
                iconCls: 'silk-add',
                menu:[{
                    text: '01 - Медкарта',
                    iconCls: 'silk-page',
                    listeners: {
                        click: {
                            scope: this,
                            fn: this.toCreateChild,
                        },
                    },         
                },{              
                    text: '02 - Посмертный эпикриз',
                    iconCls: 'silk-page',
                    listeners: {
                        click: {
                            scope: this,
                            fn: this.toCreateСhildmortpicrisis,
                        },
                    },
                }],                           
            }, '-', {                                 
                text: 'Удалить',
                iconCls: 'silk-delete',
                listeners: {
                    click: {
                        scope: this,
                        fn: this.toRemove,
                    },
                },                                
            }]
        };      

        var viewConfig =  {
            forceFit: true,
            emptyText: 'Нет fgsd записей',
            getRowClass: function(record, rowIndex, rp, ds){ 
                if (/^child/.test(record.get('object').id)){                
                    return String.format('child{0}-row', record.get('data').childnumber);
                }
            }            
        };
        //..
        Ext.apply(this, Ext.apply(this.initialConfig, {
            fields:fields,
            columns:columns,
            // isTbar:this.isTbar,
           tbar:tbar,
           viewConfig:viewConfig,
        }));
        // ...
        Morbidity.Components.HistoryGridGrid.superclass.initComponent.call(this,arguments); 
        
    },

    toCreateBeginEpicris: function(){
        // ..
        this.toCreate('EpicrisGridForm',{
            title:'Первичный осмотр',
            object:{
                id:'beginepicris',
                name:'Первичный осмотр',
                renderer:'beginEpicrisRenderer',
                form:'EpicrisGridForm',
            }
        });
    },
    toCreateFinishEpicris:function(){
        this.toCreate('EpicrisGridForm',{
            title:'Выписной эпикриз',            
            object:{
                id:'finishepicris',
                name:'Выписной эпикриз',
                renderer:'finishEpicrisRenderer',
                form:'EpicrisGridForm',
            }
        });
    },
    
    toCreateEnterOrganization:function(){
        this.toCreate('EnterOrganizationGridForm',{
            title:'Поступление в мед.уч.',
            object:{
                id:'enterorganization',
                name:'Поступление в мед.уч.',
                renderer:'enterOrganizationRenderer',
                form:'EnterOrganizationGridForm',
            }
        });
    },

    toCreateObmenka:function(){
        this.toCreate('ObmenkaGridForm',{
            title:'Диспансерная книжка / обменная карта',
            object:{
                id:'obmenka',
                name:'Oбменная карта',
                renderer:'obmenkaRenderer',
                form:'ObmenkaGridForm',
            }
        });
    },

    toCreateCesarean:function(){
        this.toCreate('CesareanGridForm',{
            title:'Протокол кесарева сечения',
            object:{
                id:'cesarean',
                name:'Протокол кесарева сечения',
                renderer:'cesareanRenderer',
                form:'CesareanGridForm',
            }
        });
    },
    toCreateDelivery:function(){
        this.toCreate('DeliveryGridForm',{
            title:'Протокол родов',
            object:{
                id:'delivery',
                name:'Протокол родов',
                renderer:'deliveryRenderer',
                form:'DeliveryGridForm',
            }
        });
    },

    // *********************************************
    toCreateChild:function(){
        this.toCreate('ChildGridForm',{
            title:'История новорожденного',
            object:{
                id:'child',
                name:'История новорожденного',
                renderer:'childRenderer',
                form:'ChildGridForm',
            }
        });        
    },

    toCreateСhildmortpicrisis:function(){
        this.toCreate('ChildmortepicrisGridForm',{
            title:'Посмертный эпикриз новорожденного',
            object:{
                id:'childmortepicris',
                name:'Посмертный эпикриз новорожденного',
                renderer:'childmortepicrisRenderer',
                form:'ChildmortepicrisGridForm',
            }
        });        
    },    

    validate : function(){
        //  
        // if (this.store.getCount()>2){
        //     Ext.ux.msg('Failure', 'В таблицу <<Экспертиза>> допускаются 2 записи', Ext.Msg.ERROR);              
        //     return false
        // };
        // //..        
        if (!!this.store.getCount()){
            return true
        };
        //..
        Ext.ux.msg('Failure', 'Необходимо заполнить таблицу <<История>>', Ext.Msg.ERROR);        
        return false
        //..
    },      


    getValue:function(){
        var ret =[];
        this.store.data.each(function(item){
            data = item.data;
            // data.dirty = item.dirty || false;
            ret.push(data);
        });
        return ret;
    },


    getPermissionUpdate:function(record){
        return true
        // if (USER_OBJ.is_admin)
        //     return true;
        // //..
        // return false
    },   

    toRemove:function(){
        var rec = this.getSelectionModel().getSelected();
        if (!rec) return; 
        ///.
        // var id = rec.get('id');
        // if (!!id)
        //     rec.beginEdit();       
        //     rec.set('removty',true);
        //     rec.endEdit();           
        //     //.
        //     return;
        //...
        Morbidity.Components.HistoryGridGrid.superclass.toRemove.call(this,arguments);
    },

    toUpdate:function(){
        if (!this.getPermissionUpdate()) return;
        //...
        var currentrecord = this.getSelectionModel().getSelected();
        if (!currentrecord) 
            return;
        //..
        var object = currentrecord.get('object');
        if (Ext.isEmptyObject(object)){
            throw 'объект не найден';
            return;
        };
        // ..
        var formName = object.form,
            formCxt = Ext.apply({},{
                title:object.name,            
                object:Ext.apply({},object),
            });
        // ..
        // console.log(formName,formCxt);
        //...
        Morbidity.Components.HistoryGridGrid.superclass.toUpdate.call(this,formName,formCxt);
    },

});
Ext.reg('morbidity:components:historygrid', Morbidity.Components.HistoryGridGrid);

// ********************************* Forms*****************************

Morbidity.Components.EpicrisGridForm = function(){};
Morbidity.Components.EpicrisGridForm = Ext.extend(Plext.form.FormWindow, {
    //..
    width:500,
    labelWidth: 80,        
    height:350,    
    autoScroll:true,
    //..
    // title:'Диагнозы',
    statusReadOnly:false,
    //...
    focusAt:{id:'morbidity_components_epicrisgridform_cls_date'},
    //..    
    msgCls: "x-mask-loading",    
    initComponent: function(){

        var fields =[{
                style: {
                    padding: '0px 0px 0px 0px',
                },             
    //            labelWidth: 120,                                                
                layout:'column',   
                baseCls: 'x-plain',
                anchor:'-15',                
                items:[{
                    layout: 'form',baseCls: 'x-plain',
                    items:{           
                        id:'morbidity_components_epicrisgridform_cls_date',                     
                        name:'date',        
                        fieldLabel: 'Дата/время',                    
                        xtype:'datefield',
                        allowBlank:false,                       
                        value:new Date(),   
                        maxValue : new Date(),                                
                        exclude:true,  
                        loadValue:function(instance){
                            this.setValue(new Date(instance.get('datetime')));
                        },           
                        listeners:{
                            render:{
                                scope:this,
                                fn:this.initcmp,
                            },
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
                        exclude:true,
                        loadValue:function(instance){
                            this.setValue(new Date(instance.get('datetime')).format('G:i'));
                        },    
                        listeners:{
                            render:{
                                scope:this,
                                fn:this.initcmp,
                            },
                        },                              
                    },            
                }],  
        },{
            // xtype:'plext:form:superboxselect',
            xtype:'morbidity:components:diagnosessuperbox',
            name:'diagnoses',
            fieldLabel: 'Диагноз', 
            exclude:true,
            listeners:{
                render:{
                    scope:this,
                    fn:this.initcmp,
                },
            },    
            anchor:'-15',
        }];

        Ext.apply(this, Ext.apply(this.initialConfig, {
            fields:fields,
        }));
        //..
        Morbidity.Components.EpicrisGridForm.superclass.initComponent.apply(this,arguments);     
    },    

    extraSubmit:function(record){

        //... datetime
        date = this.cmp.date.getValue().format('Y-m-d ') 
        time = this.cmp.time.getValue();
        val = date + time;
        datetime = Date.parseDate(val,'Y-m-d G:i')
        if (!Ext.isDate(datetime)) {
            throw new Ext.Error(' -=error=- ',val);            
        };
        // ..
        record.set('datetime',datetime.format('Y-m-d H:i O'));
        record.set('object',this.object);
        record.set('data',{
            diagnoses:this.cmp.diagnoses.getValue()
        });        
    },

    getRecDuplsBeginEpicris:function(record,instance){
        items = this.store.queryBy(function(item){
            // .... change this
            var ret = (
                (item.data.object.id === record.data.object.id)
                &&(item.data.object.id === 'beginepicris')
                &&(record.data.object.id === 'beginepicris')                
            );

            //..this don't change!!!!
            if (instance)
                ret = (ret && (instance.id !== item.id));
            return ret;
        });        
        return items.getRange()
    },

    getRecDuplsFinishEpicris:function(record,instance){
        items = this.store.queryBy(function(item){
            // .... change this
            var ret = (
                (item.data.object.id === record.data.object.id)
                &&(item.data.object.id === 'finishepicris')
                &&(record.data.object.id === 'finishepicris')                
            );

            //..this don't change!!!!
            if (instance)
                ret = (ret && (instance.id !== item.id));
            return ret;
        });        
        return items.getRange()
    },

    getRecDupls:function(record,instance){
        
        dupBeginEpicris = this.getRecDuplsBeginEpicris(record,instance);
        if ((dupBeginEpicris)&&(dupBeginEpicris.length>0)) {
            Ext.MessageBox.alert('Ошибка при заполнении формы','Дублирующиеся первичные осмотры недопустимы!');
            return dupBeginEpicris;           
        };  

        dupFinishEpicris = this.getRecDuplsFinishEpicris(record,instance);
        if ((dupFinishEpicris)&&(dupFinishEpicris.length>0)) {
            Ext.MessageBox.alert('Ошибка при заполнении формы','Дублирующиеся выписные эпикризы недопустимы!');
            return dupFinishEpicris;           
        };  

        // ...
        return []; 
    },

    
});
Ext.reg('morbidity:components:EnterOrganizationGridform', Morbidity.Components.EpicrisGridForm);


Morbidity.Components.EnterOrganizationGridForm = function(){};
Morbidity.Components.EnterOrganizationGridForm = Ext.extend(Plext.form.FormWindow, {
    //..
    width:300,
    labelWidth: 80,        
    height:130,    
    autoScroll:true,
    //..
    // title:'Диагнозы',
    statusReadOnly:false,
    //...
    focusAt:{id:'morbidity_components_enterorganizationgridform_cls_date'},
    //..    
    msgCls: "x-mask-loading",    
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
                        id:'morbidity_components_enterorganizationgridform_cls_date',                     
                        name:'date',        
                        fieldLabel: 'Дата/время',                    
                        xtype:'datefield',
                        allowBlank:false,                       
                        value:new Date(),   
                        maxValue : new Date(),                                
                        exclude:true,  
                        loadValue:function(instance){
                            this.setValue(new Date(instance.get('datetime')));
                        },           
                        listeners:{
                            render:{
                                scope:this,
                                fn:this.initcmp,
                            },
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
                        exclude:true,
                        loadValue:function(instance){
                            this.setValue(new Date(instance.get('datetime')).format('G:i'));
                        },    
                        listeners:{
                            render:{
                                scope:this,
                                fn:this.initcmp,
                            },
                        },                              
                    },            
                }],  
        },{
            // xtype:'plext:form:superboxselect',
            xtype:'numberfield',
            name:'cardnumber',
            fieldLabel: '№ карты', 
            // ..
            allowDecimals: false,
            allowNegative: false,
            minValue:1,
            // ...
            exclude:true,            
            loadValue:function(instance){
                this.setValue(instance.get('data').cardnumber);
            },                
            listeners:{
                render:{
                    scope:this,
                    fn:this.initcmp,
                },
            },                               
        }];

        Ext.apply(this, Ext.apply(this.initialConfig, {
            fields:fields,
        }));
        //..
        Morbidity.Components.EnterOrganizationGridForm.superclass.initComponent.apply(this,arguments);     
    },    

    extraSubmit:function(record){

        //... datetime
        date = this.cmp.date.getValue().format('Y-m-d ') 
        time = this.cmp.time.getValue();
        val = date + time;
        datetime = Date.parseDate(val,'Y-m-d G:i')
        if (!Ext.isDate(datetime)) {
            throw new Ext.Error(' -=error=- ',val);            
        };
        // ..
        record.set('datetime',datetime.format('Y-m-d H:i O'));
        record.set('object',this.object);
        // ....
        record.set('data',{
            'cardnumber':this.cmp.cardnumber.getValue(),
        });        
    },

    getRecDuplsEnterOrganization:function(record,instance){
        items = this.store.queryBy(function(item){
            // .... change this
            var ret = (
                (item.data.object.id === record.data.object.id)
                &&(item.data.object.id === 'enterorganization')
                &&(record.data.object.id === 'enterorganization')                
            );

            //..this don't change!!!!
            if (instance)
                ret = (ret && (instance.id !== item.id));
            return ret;
        });        
        return items.getRange()
    },


    getRecDupls:function(record,instance){
        
        dup = this.getRecDuplsEnterOrganization(record,instance);
        if ((dup)&&(dup.length>0)) {
            Ext.MessageBox.alert('Ошибка при заполнении формы','Дублирующиеся карты поступления недопустимы!');
            return dup;           
        };  

        // ...
        return []; 
    },

    
});
Ext.reg('morbidity:components:enterorganizationgridform', Morbidity.Components.EnterOrganizationGridForm);


Morbidity.Components.ObmenkaGridForm = function(){};
Morbidity.Components.ObmenkaGridForm = Ext.extend(Plext.form.FormWindow, {
    //..
    width:320,
    labelWidth: 160,        
    height:140,    
    autoScroll:true,
    //..
    // title:'Диагнозы',
    statusReadOnly:false,
    //...
    focusAt:{id:'morbidity_components_obmenkagridform_cls_visit'},
    //..    
    msgCls: "x-mask-loading",    
    // ..
    initComponent: function(){

        var fields =[{
            id:'morbidity_components_obmenkagridform_cls_visit',
            name:'visit',        
            fieldLabel: 'Дата первого посещения',
            xtype:'datefield',
            allowBlank:false,                       
            value:new Date(),   
            maxValue : new Date(),                                
            exclude:true,  
            loadValue:function(instance){
                this.setValue(new Date(instance.get('data').visit));
            },           
            listeners:{
                render:{
                    scope:this,
                    fn:this.initcmp,
                },
            },           
        },{
            // xtype:'plext:form:superboxselect',
            xtype:'numberfield',
            name:'gestation',
            fieldLabel: 'недель беременности', 
            // ..
            allowDecimals: false,
            allowNegative: false,
            allowBlank:false,
            minValue:4,
            maxValue:42,
            width:30,
            // ...
            exclude:true,            
            loadValue:function(instance){
                this.setValue(instance.get('data').gestation);
            },                
            listeners:{
                render:{
                    scope:this,
                    fn:this.initcmp,
                },
            },                               
        }];

        Ext.apply(this, Ext.apply(this.initialConfig, {
            fields:fields,
        }));
        //..
        Morbidity.Components.ObmenkaGridForm.superclass.initComponent.apply(this,arguments);     
    },    

    extraSubmit:function(record,instance){

        var firstrec = this.store.getAt(0);
        if (!firstrec)
            throw 'нет первовй записи';
        // ...
        var datetime = Date.parseDate(firstrec.get('datetime'),'Y-m-d H:i O');
        var m = parseInt(datetime.getMinutes());
        datetime.setMinutes(m+1);
        // ..
        record.set('datetime',datetime.format('Y-m-d H:i O'));
        record.set('object',this.object);
        record.set('data',{
            'visit':this.cmp.visit.getValue().format('Y-m-d'),
            'gestation':this.cmp.gestation.getValue(),            
        });        
    },

    getRecDuplsObmenka:function(record,instance){
        items = this.store.queryBy(function(item){
            // .... change this
            var ret = (
                (item.data.object.id === record.data.object.id)
                &&(item.data.object.id === 'obmenka')
                &&(record.data.object.id === 'obmenka')                
            );

            //..this don't change!!!!
            if (instance)
                ret = (ret && (instance.id !== item.id));
            return ret;
        });        
        return items.getRange()
    },


    getRecDupls:function(record,instance){
        
        dup = this.getRecDuplsObmenka(record,instance);
        if ((dup)&&(dup.length>0)) {
            Ext.MessageBox.alert('Ошибка при заполнении формы','Дублирующиеся обенные карты поступления недопустимы!');
            return dup;           
        };  

        // ...
        return []; 
    },

    
});
Ext.reg('morbidity:components:obmenkagridform', Morbidity.Components.ObmenkaGridForm);




Morbidity.Components.CesareanGridForm = function(){};
Morbidity.Components.CesareanGridForm = Ext.extend(Plext.form.FormWindow, {
    //..
    width:500,
    labelWidth: 120,        
    height:350,    
    autoScroll:true,
    //..
    // title:'Диагнозы',
    statusReadOnly:false,
    //...
    focusAt:{id:'morbidity_components_cesareangridform_cls_date'},
    //..    
    msgCls: "x-mask-loading",    
    // ..
    initComponent: function(){

        var fields =[{
            focusId:'morbidity_components_cesareangridform_cls_date',
            anchor:'-15',
            fieldLabel:'Дата/время начала операции',
            xtype:'plext:form:separatedatatimefield',            
            initcmpScope:this,
            initcmpFn:this.initcmp,
        },{
            xtype:'morbidity:components:diagnosessuperbox',
            name:'diagnoses',
            fieldLabel: 'Предоперационный диагноз', 
            exclude:true,
            listeners:{
                render:{
                    scope:this,
                    fn:this.initcmp,
                },
            },    
            anchor:'-15',
        },{
            anchor:'-15',
            fieldLabel:'Дата/время извлечения плода',
            xtype:'plext:form:separatedatatimefield',            
            initcmpScope:this,
            initcmpFn:this.initcmp,
            dateName:'birthdate',
            timeName:'birthtime',      
            datetimeName:'data.birthdatetime',
        }];

        Ext.apply(this, Ext.apply(this.initialConfig, {
            fields:fields,
        }));
        //..
        Morbidity.Components.CesareanGridForm.superclass.initComponent.apply(this,arguments);     
    },    

    extraSubmit:function(record,instance){

        //... datetime
        var val = this.cmp.date.getValue().format('Y-m-d ') + this.cmp.time.getValue();
        var datetime = Date.parseDate(val,'Y-m-d G:i')
        if (!Ext.isDate(datetime)) {
            throw new Ext.Error(' -=error=- ',val);            
        };
        // ...
        var val2 = this.cmp.birthdate.getValue().format('Y-m-d ') + this.cmp.birthtime.getValue();
        var birthdatetime = Date.parseDate(val2,'Y-m-d G:i')
        if (!Ext.isDate(birthdatetime)) {
            throw new Ext.Error(' -=error=- ',val2);            
        };        
        // ..
        record.set('datetime',datetime.format('Y-m-d H:i O'));
        record.set('object',this.object);
        record.set('data',{
            birthdatetime:birthdatetime.format('Y-m-d H:i O'),
            diagnoses:this.cmp.diagnoses.getValue(),
        });
    },

    getRecDuplsCesarean:function(record,instance){
        items = this.store.queryBy(function(item){
            // .... change this
            var ret = (
                (item.data.object.id === record.data.object.id)
                &&(item.data.object.id === 'cesarean')
                &&(record.data.object.id === 'cesarean')                
            );

            //..this don't change!!!!
            if (instance)
                ret = (ret && (instance.id !== item.id));
            return ret;
        });        
        return items.getRange()
    },

    getRecDuplsDelivery:function(record,instance){
        items = this.store.queryBy(function(item){
            // .... change this
            var ret = (
                (item.data.object.id === 'delivery')                
            );

            //..this don't change!!!!
            if (instance)
                ret = (ret && (instance.id !== item.id));
            return ret;
        });        
        return items.getRange()
    },

    getRecDupls:function(record,instance){
        
        dup = this.getRecDuplsCesarean(record,instance);
        if ((dup)&&(dup.length>0)) {
            Ext.MessageBox.alert('Ошибка при заполнении формы','Дублирующиеся протоколы кесарева сечения недопустимы!');
            return dup;           
        };  
        // ..
        dup = this.getRecDuplsDelivery(record,instance);
        if ((dup)&&(dup.length>0)) {
            Ext.MessageBox.alert('Ошибка при заполнении формы','Дублирующиеся протоколы 2-го периода \
                и кесарева сечения недопустимы!');
            return dup;           
        };  
        // ...
        return []; 
    },

    
});
Ext.reg('morbidity:components:cesareangridform', Morbidity.Components.CesareanGridForm);


Morbidity.Components.DeliveryGridForm = function(){};
Morbidity.Components.DeliveryGridForm = Ext.extend(Plext.form.FormWindow, {
    //..
    width:500,
    labelWidth: 120,        
    height:350,    
    autoScroll:true,
    //..
    // title:'Диагнозы',
    statusReadOnly:false,
    //...
    focusAt:{id:'morbidity_components_deliverygridform_cls_date'},
    //..    
    msgCls: "x-mask-loading",    
    // ..
    initComponent: function(){

        var fields =[{
            focusId:'morbidity_components_deliverygridform_cls_date',
            anchor:'-15',
            fieldLabel:'Дата/время начала 2-го перода',
            xtype:'plext:form:separatedatatimefield',            
            initcmpScope:this,
            initcmpFn:this.initcmp,
        },{
            xtype:'morbidity:components:diagnosessuperbox',
            name:'diagnoses',
            fieldLabel: 'Диагноз в начале 2-го перода', 
            exclude:true,
            listeners:{
                render:{
                    scope:this,
                    fn:this.initcmp,
                },
            },    
            anchor:'-15',
        },{
            anchor:'-15',
            fieldLabel:'Дата/время рождения плода',
            xtype:'plext:form:separatedatatimefield',            
            initcmpScope:this,
            initcmpFn:this.initcmp,
            dateName:'birthdate',
            timeName:'birthtime',      
            datetimeName:'data.birthdatetime',
        }];

        Ext.apply(this, Ext.apply(this.initialConfig, {
            fields:fields,
        }));
        //..
        Morbidity.Components.DeliveryGridForm.superclass.initComponent.apply(this,arguments);     
    },    

    extraSubmit:function(record,instance){

        //... datetime
        var val = this.cmp.date.getValue().format('Y-m-d ') + this.cmp.time.getValue();
        var datetime = Date.parseDate(val,'Y-m-d G:i')
        if (!Ext.isDate(datetime)) {
            throw new Ext.Error(' -=error=- ',val);            
        };
        // ...
        var val2 = this.cmp.birthdate.getValue().format('Y-m-d ') + this.cmp.birthtime.getValue();
        var birthdatetime = Date.parseDate(val2,'Y-m-d G:i')
        if (!Ext.isDate(birthdatetime)) {
            throw new Ext.Error(' -=error=- ',val2);            
        };        
        // ..
        record.set('datetime',datetime.format('Y-m-d H:i O'));
        record.set('object',this.object);
        record.set('data',{
            birthdatetime:birthdatetime.format('Y-m-d H:i O'),
            diagnoses:this.cmp.diagnoses.getValue(),
        });
    },

    getRecDuplsDelivery:function(record,instance){
        items = this.store.queryBy(function(item){
            // .... change this
            var ret = (
                (item.data.object.id === record.data.object.id)
                &&(item.data.object.id === 'delivery')
                &&(record.data.object.id === 'delivery')                
            );

            //..this don't change!!!!
            if (instance)
                ret = (ret && (instance.id !== item.id));
            return ret;
        });        
        return items.getRange()
    },

    getRecDuplsCesarean:function(record,instance){
        items = this.store.queryBy(function(item){
            // .... change this
            var ret = (
                (item.data.object.id === 'cesarean')                
            );

            //..this don't change!!!!
            if (instance)
                ret = (ret && (instance.id !== item.id));
            return ret;
        });        
        return items.getRange()
    },

    getRecDupls:function(record,instance){
        
        dup = this.getRecDuplsDelivery(record,instance);
        if ((dup)&&(dup.length>0)) {
            Ext.MessageBox.alert('Ошибка при заполнении формы','Дублирующиеся протоколы 2-го периода недопустимы!');
            return dup;           
        };  
        // ..
        dup = this.getRecDuplsCesarean(record,instance);
        if ((dup)&&(dup.length>0)) {
            Ext.MessageBox.alert('Ошибка при заполнении формы','Дублирующиеся протоколы 2-го перода и \
                кесарева сечения недопустимы!');
            return dup;           
        };          
        // ...
        return []; 
    },

    
});
Ext.reg('morbidity:components:deliverygridform', Morbidity.Components.DeliveryGridForm);

// *********************************** child ************************************

Morbidity.Components.ChildGridForm = function(){};
Morbidity.Components.ChildGridForm = Ext.extend(Plext.form.FormWindow, {
    //..
    width:500,
    labelWidth: 120,        
    height:350,    
    autoScroll:true,
    //..
    // title:'Диагнозы',
    statusReadOnly:false,
    //...
    focusAt:{id:'morbidity_components_childgridform_cls_childnumber'},
    //..    
    msgCls: "x-mask-loading",    
    // ..
    initComponent: function(){

        var fields =[{
            id:'morbidity_components_childgridform_cls_childnumber',
            xtype:'numberfield',
            name:'childnumber',
            fieldLabel: '№ ребенка', 
            // ..
            allowDecimals: false,
            allowNegative: false,
            allowBlank:false,
            minValue:1,
            maxValue:8,
            value:1,
            // ...
            exclude:true,            
            loadValue:function(instance){
                this.setValue(instance.get('data').childnumber);
            },                
            listeners:{
                render:{
                    scope:this,
                    fn:this.initcmp,
                },
            },  
        },{            
            anchor:'-15',
            fieldLabel:'Дата/время рождения',
            xtype:'plext:form:separatedatatimefield',            
            initcmpScope:this,
            initcmpFn:this.initcmp,
        },{
            layout: 'hbox',
            xtype: 'container',
            fieldLabel:'Вес',
            anchor:'-15',            
            items:[{
                xtype:'numberfield',
                name:'childweight',
                width : 40,
                style: 'text-align: right; color:#000000; font-weight:bold; ',              
                allowBlank:false,
                allowDecimals:false,
                allowNegative:false,
                minValue:100,
                maxValue:7000,
                exclude:true,  
                loadValue:function(instance){
                    this.setValue(instance.get('data').childweight);
                },           
                listeners:{
                    render:{
                        scope:this,
                        fn:this.initcmp,
                    },
                },
            },{
                xtype:'displayfield',
                value:'гр.',
                style: {
                    marginLeft: '3px'
                },
            },{
                xtype:'displayfield',
                value:'Рост',
                width : 40,                
                style: {
                    marginLeft: '10px'
                },
            },{
                xtype:'numberfield',
                name:'childheight',
                width : 30,
                style: 'text-align: right; color:#000000; font-weight:bold; ',
                allowBlank:false,
                allowDecimals:false,
                allowNegative:false,
                minValue:1,
                maxValue:70,                
                exclude:true,
                loadValue:function(instance){
                    this.setValue(instance.get('data').childheight);
                },
                listeners:{
                    render:{
                        scope:this,
                        fn:this.initcmp,
                    },
                },
            },{
                xtype:'displayfield',
                value:'см.',
                style: {
                    marginLeft: '3px'
                },                
            }],           
        },{
            xtype:'morbidity:components:diagnosessuperbox',
            name:'diagnoses',
            fieldLabel: 'Диагноз', 
            exclude:true,
            listeners:{
                render:{
                    scope:this,
                    fn:this.initcmp,
                },
            },    
            anchor:'-15',
        },{
            xtype:'morbidity:components:servicessuperbox',
            name:'services',
            fieldLabel: 'Назначения', 
            exclude:true,
            listeners:{
                render:{
                    scope:this,
                    fn:this.initcmp,
                },
            },    
            anchor:'-15',     
            allowBlank:true,
        },{
            xtype:'checkbox',
            name:'is_retreatment', 
            fieldLabel:'Переведен на долечивание',
            anchor:'-15',
            checked : false,
            exclude:true,            
            loadValue:function(instance){
                this.setValue(instance.get('data').is_retreatment);
            },    
            listeners:{
                render:{
                    scope:this,
                    fn:this.initcmp,
                },
            },                               
        }];

        Ext.apply(this, Ext.apply(this.initialConfig, {
            fields:fields,
        }));
        //..
        Morbidity.Components.ChildGridForm.superclass.initComponent.apply(this,arguments);     
    },    

    extraSubmit:function(record,instance){

        //... datetime
        var val = this.cmp.date.getValue().format('Y-m-d ') + this.cmp.time.getValue();
        var datetime = Date.parseDate(val,'Y-m-d G:i')
        if (!Ext.isDate(datetime)) {
            throw new Ext.Error(' -=error=- ',val);            
        };
        // ..
        record.set('datetime',datetime.format('Y-m-d H:i O'));
        record.set('object',this.object);
        record.set('data',{
            birthdatetime:datetime.format('Y-m-d H:i O'),
            diagnoses:this.cmp.diagnoses.getValue(),
            childnumber:this.cmp.childnumber.getValue(),
            childweight:this.cmp.childweight.getValue(),
            childheight:this.cmp.childheight.getValue(),            
            services:this.cmp.services.getValue(),            
            is_retreatment:this.cmp.is_retreatment.getValue(),             
        });
    },

    getRecDuplsChild:function(record,instance){
        items = this.store.queryBy(function(item){
            // .... change this
            var ret = (
                (item.data.object.id === record.data.object.id)
                &&(item.data.object.id === 'child')
                &&(record.data.object.id === 'child')
                &&(item.data.data.childnumber === record.data.data.childnumber)                
            );

            //..this don't change!!!!
            if (instance)
                ret = (ret && (instance.id !== item.id));
            return ret;
        });        
        return items.getRange()
    },

    getRecDupls:function(record,instance){
        
        dup = this.getRecDuplsChild(record,instance);
        if ((dup)&&(dup.length>0)) {
            Ext.MessageBox.alert('Ошибка при заполнении формы','Дублирующиеся номера детей недопустимы!');
            return dup;           
        };  

        // ...
        return []; 
    },

    
});
Ext.reg('morbidity:components:childgridform', Morbidity.Components.ChildGridForm);

Morbidity.Components.ChildmortepicrisGridForm = function(){};
Morbidity.Components.ChildmortepicrisGridForm = Ext.extend(Plext.form.FormWindow, {
    //..
    width:500,
    labelWidth: 120,        
    height:350,    
    autoScroll:true,
    //..
    // title:'Диагнозы',
    statusReadOnly:false,
    //...
    focusAt:{id:'morbidity_components_childmortepicrisgridform_cls_childnumber'},
    //..    
    msgCls: "x-mask-loading",    
    // ..
    initComponent: function(){

        var fields =[{
            id:'morbidity_components_childmortepicrisgridform_cls_childnumber',
            xtype:'numberfield',
            name:'childnumber',
            fieldLabel: '№ ребенка', 
            // ..
            allowDecimals: false,
            allowNegative: false,
            allowBlank:false,
            minValue:1,
            maxValue:8,
            value:1,
            // ...
            exclude:true,            
            loadValue:function(instance){
                this.setValue(instance.get('data').childnumber);
            },                
            listeners:{
                render:{
                    scope:this,
                    fn:this.initcmp,
                },
            },  
        },{            
            anchor:'-15',
            fieldLabel:'Дата/время смерти',
            xtype:'plext:form:separatedatatimefield',            
            initcmpScope:this,
            initcmpFn:this.initcmp,
            datetimeName:'data.mortdatetime',
   
        },{
            xtype:'morbidity:components:diagnosessuperbox',
            name:'diagnoses',
            fieldLabel: 'Диагноз', 
            exclude:true,
            listeners:{
                render:{
                    scope:this,
                    fn:this.initcmp,
                },
            },    
            anchor:'-15',
        }];

        Ext.apply(this, Ext.apply(this.initialConfig, {
            fields:fields,
        }));
        //..
        Morbidity.Components.ChildmortepicrisGridForm.superclass.initComponent.apply(this,arguments);     
    },    

    extraSubmit:function(record,instance){

        //... datetime
        var val = this.cmp.date.getValue().format('Y-m-d ') + this.cmp.time.getValue();
        var datetime = Date.parseDate(val,'Y-m-d G:i')
        if (!Ext.isDate(datetime)) {
            throw new Ext.Error(' -=error=- ',val);            
        };
        // ..
        record.set('datetime',datetime.format('Y-m-d H:i O'));
        record.set('object',this.object);
        record.set('data',{
            mortdatetime:datetime.format('Y-m-d H:i O'),
            diagnoses:this.cmp.diagnoses.getValue(),
            childnumber:this.cmp.childnumber.getValue(),
        });
    },

    getRecDuplsChildmortepicris:function(record,instance){
        items = this.store.queryBy(function(item){
            // .... change this
            var ret = (
                (item.data.object.id === record.data.object.id)
                &&(item.data.object.id === 'childmortepicris')
                &&(record.data.object.id === 'childmortepicris')
                &&(item.data.data.childnumber === record.data.data.childnumber)                
            );

            //..this don't change!!!!
            if (instance)
                ret = (ret && (instance.id !== item.id));
            return ret;
        });        
        return items.getRange()
    },

    getRecChild:function(record,instance){
        items = this.store.queryBy(function(item){
            // .... 
            var ret = (
                (item.get('object').id === 'child')
                &&(item.get('data').childnumber === record.get('data').childnumber)                
            );

            return ret;
        });        
        return items.getRange()
    },


    getRecDatetimeChild:function(record,instance){
        items = this.store.queryBy(function(item){
            // .... 
            var ret = (
                (item.get('object').id === 'child')
                &&(item.get('data').childnumber === record.get('data').childnumber)
                &&(item.get('data').birthdatetime > record.get('data').mortdatetime)                
            );

            return ret;
        });        
        return items.getRange()
    },

    getRecDupls:function(record,instance){
        
        dup = this.getRecDuplsChildmortepicris(record,instance);
        if ((dup)&&(dup.length>0)) {
            Ext.MessageBox.alert('Ошибка при заполнении формы','Дублирующиеся номера детей недопустимы!');
            return dup;           
        };  

        l = this.getRecChild(record,instance);
        if (l.length==0) {
            Ext.MessageBox.alert('Ошибка при заполнении формы','Нет карты новорожденного!');
            return ['err'];           
        };          

        l = this.getRecDatetimeChild(record,instance);
        if (l.length>0) {
            Ext.MessageBox.alert('Ошибка при заполнении формы','Время констатации смерти может \
                быть больше или равно вренмени констатации рождения !');
            return l;           
        };   
        // ...
        return []; 
    },

    
});
Ext.reg('morbidity:components:childmortepicrisgridform', Morbidity.Components.ChildmortepicrisGridForm);

// *********************************** Renderers ************************************
Morbidity.Components.Functions.diagnosesRenderer =  function (data) {
    // ..
    if (!data) return [];
    // ...
    var ds = [],
        dsData = data;
    // ..
    for(var i=0; i<dsData.length; i++){        
        var name = dsData[i].name,
            fields = dsData[i].fields;
            arrField = [];
        // ...
        var keys = Plext.Components.Functions.SortDictKeysByAttr(fields,'order');
        for (var j = 0; j < keys.length; j++) {                    
            var field = fields[keys[j]];
            var label = field.label.match(/<s>(.*?)<\/s>/);
            var value = field.value;
            var mu = field.mu;
            // ...
            if (Ext.isObject(value))
                value = value.name;
            // ....
            arrField.push([
                (label)?' '+label[1]+' ':'',
                value,
                (mu)?' '+mu:'',
            ].join(''));
        };
        //..
        ds[i] = String.format('{0}{1}.{2}',
            i==0 ? '<b>' : '',
            name + (i==0 ? ' ' : '') + arrField.join(', '),
            i==0 ? '</b>' : ''
        );
    };
    return ds
};

Morbidity.Components.Functions.ServicesRenderer =  function (data) {
    // ..
    if (!data) return [];
    // ...
    var ds = [],
        dsData = data;
    // ..
    for(var i=0; i<dsData.length; i++){        
        var name = dsData[i].name,
            fields = dsData[i].fields;
            arrField = [];
        // ...
        var keys = Plext.Components.Functions.SortDictKeysByAttr(fields,'order');
        for (var j = 0; j < keys.length; j++) {                    
            var field = fields[keys[j]];
            var label = field.label.match(/<s>(.*?)<\/s>/);
            var value = field.value;
            var mu = field.mu;
            // ...
            if (Ext.isObject(value))
                value = value.name;
            // ....
            arrField.push([
                (label)?' '+label[1]+' ':'',
                value,
                (mu)?' '+mu:'',
            ].join(''));
        };
        //..
        ds[i] = String.format('{0}{1}.{2}',
            '',
            name + (i==0 ? ' ' : '') + arrField.join(', '),
            ''
        );
    };
    return ds
};

Morbidity.Components.Functions.enterOrganizationRenderer =  function (data) {
    return '№ истории: <b>'+data.cardnumber+'</b>';
};

Morbidity.Components.Functions.beginEpicrisRenderer =  function (data) {
    var diagnoses = Morbidity.Components.Functions.diagnosesRenderer(data.diagnoses);
    return '<p style="white-space: normal;">'+diagnoses.join(' ')+'</p>'    
};

Morbidity.Components.Functions.finishEpicrisRenderer =  function (data) {
    var diagnoses = Morbidity.Components.Functions.diagnosesRenderer(data.diagnoses);
    return '<p style="white-space: normal;">'+diagnoses.join(' ')+'</p>'    
};

Morbidity.Components.Functions.obmenkaRenderer =  function (data) {
    return 'Первое посещение: <b>'+data.gestation+' недель </b>';
};

Morbidity.Components.Functions.cesareanRenderer =  function (data) {
    var diagnoses = Morbidity.Components.Functions.diagnosesRenderer(data.diagnoses);
    var birthdatetime = Date.parseDate(data.birthdatetime,'Y-m-d H:i O')    
    var birthdate = birthdatetime.format('d.m.Y');
    var birthhour = birthdatetime.format('H');
    var birthmin = birthdatetime.format('i');    
    return '<p style="white-space: normal;">'+diagnoses.join(' ')
        +'</p> Плод извлечен '+birthdate + ' в ' + birthhour +' часов '+ birthmin+' минут';    
};

Morbidity.Components.Functions.childRenderer =  function (data) {
    is_retreatment = function(v){
        if (!v) return '';
        // ..
        return '<p> Переведен в другое подраделение на долечивание </p>'
    };
    // ...
    return '<p style="white-space: normal;">'
            +'<p>'
                +'Номер ребенка: <b>'+data.childnumber+'</b>'
                +' Вес: <b>'+data.childweight+'</b> гр.'
                +' Рост: <b>'+data.childheight+'</b> см.'                
            +'</p>'    
            +'<p>'
                +Morbidity.Components.Functions.diagnosesRenderer(data.diagnoses).join(' ')
            +'</p>'
            +'<p>'
                +Morbidity.Components.Functions.ServicesRenderer(data.services).join(' ')
            +'</p>'            
            + is_retreatment(data.is_retreatment)
        +'</p>';    
};

Morbidity.Components.Functions.deliveryRenderer =  function (data) {
    var birthdatetime = Date.parseDate(data.birthdatetime,'Y-m-d H:i O')    
    return '<p style="white-space: normal;">'
        +'<p>'
            +Morbidity.Components.Functions.diagnosesRenderer(data.diagnoses).join(' ')
        +'</p>'
        +'<p> Плод извлечен '
            +birthdatetime.format('d.m.Y')
            + ' в ' 
            + birthdatetime.format('H') +' часов '
            + birthdatetime.format('i') +' минут'
        +'</p>'
    +'</p>';
    
};


Morbidity.Components.Functions.childmortepicrisRenderer =  function (data) {
    var mortdatetime = Date.parseDate(data.mortdatetime,'Y-m-d H:i O')    

    return '<p style="white-space: normal;">'
            +'<p>'
                +'Номер ребенка: <b>'+data.childnumber+'</b>'
            +'</p>'    
            +'<p> Смерть констатирована '
                +mortdatetime.format('d.m.Y')
                + ' в ' 
                + mortdatetime.format('H') +' часов '
                + mortdatetime.format('i') +' минут'
            +'</p>'            
            +'<p>'
                +Morbidity.Components.Functions.diagnosesRenderer(data.diagnoses).join(' ')
            +'</p>'
        +'</p>';    
};



// ******************************************************************
// Morbidity.Components.GlobalReportForm = function(){};
// Morbidity.Components.GlobalReportForm = Ext.extend(Ext.Window, {
//     //..
//     title:'Отчеты',
//     width:600,
//     height:300,
//     layout:'vbox',
//     modal:true,
//     frame:true,
//     initComponent:function(){

//         //..win config         
//         config = {
//             items:[{
//                 layout:'column', bodyCssClass: 'x-panel-mc', style: { padding: '0px 0px 0px 5px',},    
//                 items:[{
//                     xtype:'button',
//                     width: 100, style: { padding: '0px 0px 0px 0px',},                    
//                     text: '<h1 style="padding:5px;">'
//                         +'IX.1. Форма № 32. Родовспоможение в стационаре.'+
//                     '</h1>',
//                     scale: 'large', 
//                     handler: function(){
//                         window.open(['/morbidity/reports/IX_1',ORG_OBJ.id,''].join('/'));                                
//                     },   
//                 },{     
//                     xtype:'button',
//                     width: 100, style: { padding: '5px 0px 0px 0px',},
//                     text: '<h1 style="padding:5px;">'
//                         +'IX.2. Форма № 32. Заболевания осложнившие роды (осложнения родов и послеродового периода).'+
//                     '</h1>',
//                     scale: 'large', 
//                     handler: function(){
//                         window.open(['/morbidity/reports/IX_2',ORG_OBJ.id,''].join('/'));                                
//                     },
//                 },{     
//                     xtype:'button',
//                     width: 100, style: { padding: '5px 0px 0px 0px',},                    
//                     text: '<h1 style="padding:5px;">'
//                         +'IX.3. Анализ родов,включая отчетную форму № 32 Родовспоможение в стационаре (таблица 2210)'+
//                     '</h1>',
//                     scale: 'large', 
//                     handler: function(){
//                         window.open(['/morbidity/reports/IX_3',ORG_OBJ.id,''].join('/'));                                
//                     },                       
//                 }],               
//             }],
//             buttons:[{
//                 text:'Закрыть',
//                 handler:(function(){
//                     this.close();
//                 }).createDelegate(this,[])
//             }],            
    
//         };
        
//         Ext.apply(this, Ext.apply(this.initialConfig, config));
//         Morbidity.Components.GlobalReportForm.superclass.initComponent.apply(this, arguments);  

//     },
        
// });


Morbidity.Components.GlobalReportForm = function(){};
Morbidity.Components.GlobalReportForm = Ext.extend(Ext.Window, {
    //..
    title:'Отчеты',
    width:600,
    height:350,
    layout:'fit',
    modal:true,
    frame:true,
    cxt:{},
    initComponent:function(){

                              

        //..win config         
        config = {
            items:[{
                xtype:'tabpanel',
                activeTab: 0,
                defaults:{
                    autoScroll: true
                },
                items:[{
                    title:'IX',
                    bodyCssClass: 'x-panel-mc',
                    items:[{
                        xtype:'button',
                        width: 100, style: { padding: '0px 0px 0px 5px',},                    
                        text: '<h1 style="padding:5px;">'
                            +'IX.1. Форма № 32. Родовспоможение в стационаре.'+
                        '</h1>',
                        scale: 'large', 
                        handler: function(){
                            window.open(['/morbidity/reports/IX_1',ORG_OBJ.id,''].join('/'));                                
                        },   
                    },{     
                        xtype:'button',
                        width: 100, style: { padding: '5px 0px 0px 5px',},
                        text: '<h1 style="padding:5px;">'
                            +'IX.2. Форма № 32. Заболевания осложнившие роды (осложнения родов и послеродового периода).'+
                        '</h1>',
                        scale: 'large', 
                        handler: function(){
                            window.open(['/morbidity/reports/IX_2',ORG_OBJ.id,''].join('/'));                                
                        },
                    },{     
                        xtype:'button',
                        width: 100, style: { padding: '5px 0px 0px 5px',},                    
                        text: '<h1 style="padding:5px;">'
                            +'IX.3. Анализ родов,включая отчетную форму № 32 Родовспоможение в стационаре (таблица 2210)'+
                        '</h1>',
                        scale: 'large', 
                        handler: function(){
                            window.open(['/morbidity/reports/IX_3',ORG_OBJ.id,''].join('/'));                                
                        },
                    },{     
                        xtype:'button',
                        width: 100, style: { padding: '5px 0px 0px 5px',},                    
                        text: '<h1 style="padding:5px;">\
                            IX.4.  Заболевания осложнившие роды \
                            (осложнения родов и послеродового периода) </br> \
                            включая отчётную форму № 32  (таблица 2211)\
                        </h1>',
                        scale: 'large', 
                        handler: function(){
                            window.open(['/morbidity/reports/IX_4',ORG_OBJ.id,''].join('/'));                                
                        },                 
                    },{
                        xtype:'button',
                        width: 100, style: { padding: '5px 0px 0px 5px',},                    
                        text: '<h1 style="padding:5px;">IX.5. Анализ поздних гестозов     (по классификации принятой в РФ). </h1>',
                        scale: 'large', 
                        handler: function(){
                            window.open(['/morbidity/reports/IX_5',ORG_OBJ.id,''].join('/'));                                
                        },                                                
                    }],                    
                },{
                    title:'XI',
                    bodyCssClass: 'x-panel-mc',
                    items:[{
                        xtype:'button',
                        width: 100, style: { padding: '0px 0px 0px 5px',},                    
                        text: '<h1 style="padding:5px;">'
                            +'XI.1. Распределение родившихся и умерших по массе тела при рождении'+
                        '</h1>',
                        scale: 'large', 
                        handler: function(){
                            window.open(['/morbidity/reports/XI_1',ORG_OBJ.id,''].join('/'));                                
                        },                       
                    },{
                        xtype:'button',
                        width: 100, style: { padding: '5px 0px 0px 5px',},                    
                        text: '<h1 style="padding:5px;">'
                            +'XI.1. Таблица'+
                        '</h1>',
                        scale: 'large', 
                        handler: function(){
                            window.open(['/morbidity/reports/XI_1_1',ORG_OBJ.id,''].join('/'));                                
                        },
                    },{
                        xtype:'button',
                        width: 100, style: { padding: '5px 0px 0px 5px',},                    
                        text: '<h1 style="padding:5px;">'
                            +'XI.2. Заболевания и причины смерти новорожденных (плодов), родившихся с массой тела </br> 500-999 грамм.'+
                        '</h1>',
                        scale: 'large', 
                        handler: function(){
                            window.open(['/morbidity/reports/XI_2',ORG_OBJ.id,''].join('/'));                                
                        },
                    },{
                        xtype:'button',
                        width: 100, style: { padding: '5px 0px 0px 5px',},                    
                        text: '<h1 style="padding:5px;">'
                            +'XI.3. Заболевания новорожденных и причины смерти, родившихся с массой тела 1000 грамм и более'+
                        '</h1>',
                        scale: 'large', 
                        handler: function(){
                            window.open(['/morbidity/reports/XI_3',ORG_OBJ.id,''].join('/'));                                
                        },                                                  

                    }],
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
        Morbidity.Components.GlobalReportForm.superclass.initComponent.apply(this, arguments);  

    
    },
    //.....................................................

});

