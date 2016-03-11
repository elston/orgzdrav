//******************************************************************************
__Util = {__:''}
//******************************************************************************
Ext.apply(Ext, {

    goDeep:function(obj, path) {
        var parts = path.split('.'),
            rv,
            index;
        for (rv = obj, index = 0; rv && index < parts.length; ++index) {
            rv = rv[parts[index]];
        }
        return rv;
    },


    isEmptyObject:function(o) {
        for (var p in o) { 
            if (o.hasOwnProperty(p)) 
                return false;
        }
        return true;
    },    
    
    groupBy:function(arr, groupKey){
        if (!Ext.isArray(arr)) return null;    
        var result = new Ext.util.MixedCollection(false);
        arr.forEach(function(item) {
            var groupValue = item[groupKey];
            var group = result.find(function(item){return item.group == groupValue })
            var items  = (group) ? group.items : result.add({group:groupValue,items:[]}).items;
            items.push(item);
        });

        return result;    
    },

    groupByStore:function(store, groupKey){
        if ((!store) || (!store instanceof Ext.data.Store)) return null;    
        var result = new Ext.util.MixedCollection(false);
        store.each(function(item) {
            var groupValue = item.get(groupKey);
            var group = result.find(function(item){return item.group == groupValue })
            var items  = (group) ? group.items : result.add({group:groupValue,items:[]}).items;
            items.push(item);
        });

        return result;    
    },    

    equalObj:function(obj1,obj2,fields){
        var res = false;
        res = fields.map(function(field){
            return obj1[field]==obj2[field]
        });
        //..
        res = res.reduce(function(x, y, i){
            return x && y;
        }, true)
        return res        
    },
    uniqObj:function(items,fields) {
        var results = new Ext.util.MixedCollection(false);
        items.forEach(function(item) {
            if (!results.find(function(result){
                return Ext.equalObj(item,result,fields)
            })) results.add(item);
        });

        return results.getRange(); 
    },
    
    splitSpace:function(val,num){
        if (!val) return '';
        var ret = '';
        if (!num)
            num = 4;

        for(var i=1; i<val.length+1; i++){
           sim = val.charAt(i-1);
           ret += sim;     
           if ((i%num==0)&&(sim!=' '))
               ret += ' ';                        
        }      
        
        return ret
    },

    slugUser:function(obj){
        return obj.last_name+' '
                +(obj.first_name?obj.first_name.charAt(0):'')+'. '
                +(obj.mid_name?obj.mid_name.charAt(0):'')+'. ('
                +obj.username+')';
    }, 

    gluxOrgUser:function(){
        return ORG_OBJ.name + ' @ '
           + USER_OBJ.last_name + ' '
           + USER_OBJ.first_name + ' '
           + USER_OBJ.mid_name + ' ('
           + USER_OBJ.username + ')'
    },     

    gluxUser:function(){
        return USER_OBJ.last_name + ' '
           + USER_OBJ.first_name + ' '
           + USER_OBJ.mid_name + ' ('
           + USER_OBJ.username + ')'
    },            

    bytesToSize:function (bytes) {
       if(bytes == 0) return '0 Byte';
       var k = 1000;
       var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
       var i = Math.floor(Math.log(bytes) / Math.log(k));
       return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    },

    /**
     * Convert content length to fixed string
     * @static
     * @param {Number} n - number of byte kibibyte or mibi..., cannot not be NaN, indefinite or negative
     * @param {Number} [f=0] - max fraction digits in range of 0..20
     * @param {Number} [e=0] - exponent based 1024, Math.pow(1024,e) stands for the unit of n
     * @return {String}
     * @throws {RangeError}
     */
    toSizeString:function (n,f,e){
	    n=parseFloat(n);
	    f>>>=0;
	    e>>>=0;
	    if(n!==n||1/n<0||1/n===-1/n||f<0||f>20||e<0){
		    throw new RangeError("One of the three argument (number, fraction, exponent) is out of range");
	    }
	    var kibi=1024,mibi=1048576,gibi=1073741824,tebi=1099511627776;
	    var v,u;
	    n*=Math.pow(1024,e);
	    if(n<kibi){
		    v=n.toFixed(0);
		    u="B";
	    }else if(n<mibi){
		    v=(n/kibi).toFixed(f);
		    u="KiB";
	    }else if(n<gibi){
		    v=(n/mibi).toFixed(f);
		    u="MiB";
	    }else if(n<tebi){
		    v=(n/gibi).toFixed(f);
		    u="GiB";
	    }else{
		    v=(n/tebi).toFixed(f);
		    u="TiB";
	    }
	    return v+" "+u;
    },    

    findByFn: function(arr, obj,fn) {
        for(var i=0; i<arr.length; i++) {
            if (!!fn(arr[i],obj)) return arr[i];
        };
        return false;
    },
//    example:
//    d2 = new Date(this.cxt.created.getValue());
//    if (!d2) return ;
//    timeline = Ext.findByFn(record.get('timelines'),d2,function(item,data){
//        return (new Date(item.created).valueOf() == data.valueOf())
//    });    
    
});

__Functions = {__:''}
Plext.form.UpdatePermission = function(record){
    timelines = record.get('timelines')    
    if ((timelines)&&(timelines.length>0)){
        recordLavel = Math.max.apply(null, timelines.map(function(item){ return item.verify.lavel }));
        //.
        if (USER_OBJ.lavel >= recordLavel){
            return true;
        };
    };
    return false;
};
//******************************************************************************
__VTypes = {__:''}
//******************************************************************************

Ext.apply(Ext.form.VTypes, {
    fileUpload:  function(v) {
        return /^[a-zA-Z0-9а-яА-Я_\s\(\)][a-zA-Z0-9а-яА-Я_-\s\(\)]{0,256}\.(pdf|jpeg|jpg)$/.test(v);
    },
    fileUploadText: 'Допускаются к загрузке только <b> jpg </b> и <b> pdf </b> </br> \
    - длина наименования файла не может быть больше 256 знаков и меньше 1 </br>\
    - в наименования допускаются цифры, русские, латинские буквы, символ <b>"_"</b>,символ <b>"-"</b> </br>\
    - наименование не может начинаться с символа <b>"-"</b> </br>\
    - пробелы не допускаются \
    - размер одного файла не может превышать 15 Мб \
    - количество файлов в документе не более 50',        
    fileUploadMask:  /^[a-zA-Z0-9а-яА-Я_\s\(\)][a-zA-Z0-9а-яА-Я_-\s\(\)]{0,256}\.(pdf|jpeg|jpg)$/,
});

Ext.apply(Ext.form.VTypes, {
    fileName:  function(v) {
        return /^[a-zA-Z0-9а-яА-Я_\s\(\)][a-zA-Z0-9а-яА-Я_-\s\(\)]{0,256}$/.test(v);
    },
    fileNameText: '\
    - длина наименования файла не может быть больше 256 знаков и меньше 1 </br>\
    - в наименования допускаются цифры, русские, латинские буквы, символ <b>"_"</b>,символ <b>"-"</b> </br>\
    - наименование не может начинаться с символа <b>"-"</b> </br>\
    - точки не допускаются\
    - пробелы не допускаются',
    fileNameMask:  /^[a-zA-Z0-9а-яА-Я_\s\(\)][a-zA-Z0-9а-яА-Я_-\s\(\)]{0,256}$/,
});

Ext.apply(Ext.form.VTypes, {
    MPCode:  function(v) {
        return /^(\d{1,10}){0,10}(\d\.{0,1}){0,100}(\d{0,10})$/g.test(v);
    },
    MPCodeText: '\
    - длина кода не может быть больше 128 знаков и меньше 1 </br>\
    - в наименования допускаются цифры и символ <b>"."</b> </br>\
    - код не может начинаться с символа <b>"."</b> </br>',
//    MPCodeMask:  /^([\d]{1,10})(\d{1,10})$/g,
});

Ext.apply(Ext.form.VTypes, {
    Time:  function(v) {
        return /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/g.test(v);
    },
    TimeText: '\
    - часы 0-24 </br>\
    - минуты 0-60</b> </br>\
    - разделитель  - символ <b>":"</b> </br>',
//    TimeMask:  /[0-9:]/ig,
});

Ext.apply(Ext.form.VTypes, {
    Rualphanum:  function(v) {
        return /^[a-zA-Zа-яА-Я0-9_]+$/g.test(v);
    },
    RualphanumText: '\
      - только буквы и цыфры...latinskie toje',
    RualphanumMask: /[a-zA-Zа-яА-Я0-9_]/i,
});

Ext.apply(Ext.form.VTypes, {
    Fio:  function(v) {
        return /^([a-zA-Zа-яА-Я]{1,80})([\s]{1}[a-zA-Zа-яА-Я]{1,80})*$/ig.test(v);
    },
    FioText: '\
      - только буквы...latinskie toje </br>\
       - "фамилия имя отчество"',
    FioMask: /[a-zA-Zа-яА-Я\s]/i,
});
//******************************************************************************
__Fields = {__:''}
//******************************************************************************

Ext.ns('Plext.form');

//------------------------------------------------------------------------------
Plext.form.TextArea = function(){};
Ext.override(Ext.form.TextArea, {
    initComponent: function () {
        Ext.form.TextArea.superclass.initComponent.call(this);
        if (this.maxLength !== Number.MAX_VALUE && this.truncate === true) {
            this.on("invalid", function () {
                if (this.getValue().length > this.maxLength) {
                    this.setValue(this.getValue().substr(0, this.maxLength));
                }
            });
        }
    },
    
    appendLine: function (text) {
        this.append(text + "\n");
    },
    
    getValue : function(){
        if(!this.rendered) {
            return this.value;
        }
        var v = this.el.getValue();
        if(v === this.emptyText || v === undefined){
            v = '';
        }
        return v.replace(/&nbsp;/g, '__probel__')
            .replace(/\x22/g, '__comma__')
            .replace(/=/g, '__ravno__')
            .replace(/:/g, '__doubldot__')
            .replace(/;/g, '__dotcomma__')
        ;
    },      
});


//------------------------------------------------------------------------------
Plext.form.DataTimeField = function(){};
Plext.form.DateTimeField = Ext.extend(Ext.form.TextField, {
    ///...
//    value:new Date().format('M j, Y, G:i'),
    style: ' \
        text-align: right;\
        color:#000000;\
        font-weight: bold \
    ',    	        
    allowBlank:false,
    disabled:true,
    allowPreset:false,
    width:140,            
    //...    
    getValue : function(val){
        //...
        var val = Plext.form.DateTimeField.superclass.getValue.call(this); 
        //..
        var date = (Ext.isDate(val))?val:Date.parseDate(val, 'M j, Y, G:i');       
        if ((!date)&&(val))
            date = Date.parseDate(val,'Y-m-d H:i O');
        if ((!date)&&(val))
            date = new Date(val);                  
        //..
        if (date)
            val  = date.format('Y-m-d H:i O');
        return val;
    },   
  
    setValue : function(val){
        //..
        var date = (Ext.isDate(val))?val:Date.parseDate(val,'Y-m-d H:i O');
        if ((!date)&&(val))
            date = Date.parseDate(val,'M j, Y, G:i');
        if ((!date)&&(val))
            date = new Date(val);                  
        //..            
        if (date)
            val = date.format('M j, Y, G:i');
        //..            
		Plext.form.DateTimeField.superclass.setValue.call(this, val);	    
    },   
});
Ext.reg('plext:form:datetimefield', Plext.form.DateTimeField);


/**
 * @class Plext.form.SeparateDataTimeField
 * @extends Ext.Container
 * Numeric text field that provides automatic keystroke filtering and numeric validation and mesurement unit name.
 * @constructor
 * Creates a new SeparateDataTimeField
 * @param {Object} config Configuration options
 * @xtype plext:form:separatedatatimefield
 */
Plext.form.SeparateDataTimeField = function(){};
Plext.form.SeparateDataTimeField = Ext.extend(Ext.Container,{
    layout:'hbox',
    anchor:'95%',
    fieldLabel:'Дата/время',                                  	            	               
    allowBlank:false,
    focusId:null,
    //..
    initcmpScope:null,
    initcmpFn:Ext.emptyFn,
    //.
    dateName:'date',
    timeName:'time',
    datetimeName:'datetime',
    //..
    initComponent: function(){
        //..
        var items = [{
            id:this.focusId,                     
            name:this.dateName,        
            datetimeName:this.datetimeName,
            fieldLabel:this.fieldLabel,                    
            xtype:'datefield',
            allowBlank:false,                       
            value:new Date(),   
            maxValue : new Date(),                                
            exclude:true,  
            loadValue:function(instance){
                var val = Ext.goDeep(instance.data,this.datetimeName);
                this.setValue(new Date(val));
            },           
            listeners:{
                render:{
                    scope:this.initcmpScope,
                    fn:this.initcmpFn,
                },
            },                                                                 
        },{
            width:50,
            xtype: 'textfield',
            name:this.timeName, 
            datetimeName:this.datetimeName,                             
            allowBlank:false,   
            vtype:'Time',   
            value:new Date().format('G:i'),       
            exclude:true,
            style: {
                marginLeft: '10px'
            },
            loadValue:function(instance){
                var val = Ext.goDeep(instance.data,this.datetimeName);
                this.setValue(new Date(val).format('G:i'));
            },    
            listeners:{
                render:{
                    scope:this.initcmpScope,
                    fn:this.initcmpFn,
                },
            },    
        }]          
        //..
        Ext.apply(this, Ext.apply(this.initialConfig, {
            items:items,
        }));        
        Plext.form.SeparateDataTimeField.superclass.initComponent.call(this,arguments);     
    },    
});	     
Ext.reg('plext:form:separatedatatimefield', Plext.form.SeparateDataTimeField);


//------------------------------------------------------------------------------
Plext.form.BooleanRadioGroup = function(){};
Plext.form.BooleanRadioGroup = Ext.extend(Ext.form.RadioGroup, {
    vertical: true,
    columns: 1,
    boxName:'plext_form_booleanradiogroupbox',    
    boxLabelTrue:'box label true',
    boxLabelFalse:'box label false',   
    blankText : 'Нужно выбрать что нибудь из группы...полюбому..',     
    //..
	initComponent:function(){
        //..win config 
        items = [{
            boxLabel: this.boxLabelTrue, 
            name:this.boxName,
            dataIndex:true,
        },{
            boxLabel: this.boxLabelFalse,
            name:this.boxName,         
            dataIndex:false,            
        }];
		config = {
            //..
            items:items,
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Plext.form.BooleanRadioGroup.superclass.initComponent.apply(this, arguments);	
		//..
	},    
    //...
    getValue : function(){
		var box = Plext.form.BooleanRadioGroup.superclass.getValue.call(this);	    
        return box.dataIndex;
    },            
    setValue: function(val){
        this.onSetValue(val,true)
        return this;
    },        
});
Ext.reg('plext:form:booleanradiogroup', Plext.form.BooleanRadioGroup);



// ------------------------------ SuperBoxSelect -------------------------------
Plext.form.SuperBoxSelect = function(){};
Plext.form.SuperBoxSelect = Ext.extend(Ext.ux.form.SuperBoxSelect, {

	apiFnRead:{},
    autoLoad:false,            
    fields:[],
    //..
    emptyText: 'Выберете из списка...',
	queryDelay: 300,    
	minChars: 1,	
    usedRecordsQuery:true,                                         	

	triggerAction: 'all',
    extraItemCls: 'x-tag',
	msgTarget: 'qtip',
    //..
	initComponent:function(){
        //.. 
        var store = new Ext.data.DirectStore({
		    autoLoad:this.autoLoad,
		    root:'data',
		    idProperty:'id',
		    fields:this.fields,
            api: {
                read: this.apiFnRead,
            },
        }),
            
		config = {
            //..
            store:store,
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Plext.form.SuperBoxSelect.superclass.initComponent.apply(this, arguments);	
		//..
	},
	//.............................

//    afterRender:function(){
//		Plext.form.SuperBoxSelect.superclass.afterRender.apply(this, arguments);	    

//		this.disable();
//    },

	checkOnBlur:function(){
	    //pass
	},

});
Ext.reg('plext:form:superboxselect', Plext.form.SuperBoxSelect);


// ---------------------------------------------------------------------------
Plext.form.YearSpinnerField = function (config) {
    this.addEvents('changex');
    Plext.form.YearSpinnerField.superclass.constructor.call(this,config);     
};
Ext.extend(Plext.form.YearSpinnerField,Ext.ux.form.SpinnerField,{
	name:'year',
	fieldLabel: 'Год',
	allowBlank:true,	    
    minValue: 1900,
	maxValue: new Date().getFullYear(),
	allowDecimals: false,
	incrementValue: 1,
	accelerate: true,
	width:100,
    ///...
    initComponent: function(){
        //..
        Plext.form.YearSpinnerField.superclass.initComponent.call(this,arguments);     
        ///..
        this.on('specialkey',function(f, e){
            if (e.getKey() == e.ENTER ) {
                this.fireEvent('changex', this);          
            };
        }, this);   
        this.on('spin',function(f, e){
            this.fireEvent('changex', this);          
        }, this);           
        
    },   
    clear:function(){
        this.setValue(null);                
    },     
});	     
Ext.reg('plext:form:yearspinnerfield', Plext.form.YearSpinnerField);

// ----------------------------------------------------------------------------
Plext.form.YearNumberField = function(){};
Plext.form.YearNumberField = Ext.extend(Ext.form.NumberField,{
    minValue: 1900,
	maxValue: new Date().getFullYear(),
});      
Ext.reg('plext:form:yearnumberfield', Plext.form.YearNumberField);

// ----------------------------------------------------------------------------
Plext.form.QuarterSpinnerField = function (config) {
    Plext.form.QuarterSpinnerField.superclass.constructor.call(this,config);     
};
Ext.extend(Plext.form.QuarterSpinnerField,Ext.ux.form.SpinnerField,{
	name:'quarter',
	fieldLabel: 'Квартал',
	allowBlank:true,	    
    minValue: 1,
	maxValue: 4,
	allowDecimals: false,
	incrementValue: 1,
	accelerate: true,
	width:100,
//    listeners:{
////         scope: this,
//         specialkey:function(f,e){
//            if(e.getKey() == e.ENTER || e.getKey() == e.UP || e.getKey() == e.DOWN ){
//                return this.quarter_change();
//            };                 
//         },
//         spin:function(){
//            return this.quarter_change();
//         },
//    },           	
//    quarter_change:Ext.emptyFn,
    initComponent: function(){
        //..
        Plext.form.YearSpinnerField.superclass.initComponent.call(this,arguments);     
        ///..
        this.on('specialkey',function(f, e){
            if (e.getKey() == e.ENTER ) {
                this.fireEvent('changex', this);          
            };
        }, this);   
        this.on('spin',function(f, e){
            this.fireEvent('changex', this);          
        }, this);           
        
    },   
    clear:function(){
        this.setValue(null);                
    },   
});	 
Ext.reg('plext:form:quarterspinnerfield', Plext.form.QuarterSpinnerField);


// ------------------------------ Subject field --------------------------------
Plext.form.SubjectTextArea = function (config) {
    Plext.form.SubjectTextArea.superclass.constructor.call(this,config);     
};
Ext.extend(Plext.form.SubjectTextArea,Ext.form.TextArea,{
	name:'subject',
	fieldLabel: 'Объект',
	allowBlank:false,	        
	width : 400,
	height : 50,       	        	
});	     
Ext.reg('plext:form:subjecttextarea', Plext.form.SubjectTextArea);

/**
 * @class Plext.form.NumberField
 * @extends Ext.form.NumberField
 * Numeric text field that provides automatic keystroke filtering and numeric validation.
 * @constructor
 * Creates a new NumberField
 * @param {Object} config Configuration options
 * @xtype plext:form:numberfield
 */
Plext.form.NumberField = function(){};
Plext.form.NumberField = Ext.extend(Ext.form.NumberField,{
});      
Ext.reg('plext:form:numberfield', Plext.form.NumberField);

/**
 * @class Plext.form.NumberFieldWithMu
 * @extends Ext.Container
 * Numeric text field that provides automatic keystroke filtering and numeric validation and mesurement unit name.
 * @constructor
 * Creates a new NumberFieldWithMu
 * @param {Object} config Configuration options
 * @xtype plext:form:numberfieldwithmu
 */
Plext.form.NumberFieldWithMu = function(){};
Plext.form.NumberFieldWithMu = Ext.extend(Ext.Container,{
    layout  : 'hbox',
    anchor:'95%',
    fieldLabel: '',                                  	            	               
  	muText:'',
    allowBlank:false,
    allowDecimals: true,
    allowNegative : false,  	
    focusId:null,
    fieldName:'',
    initComponent: function(){
        //..
        var items = [{
            id:this.focusId ,           
            xtype:'numberfield',
            name:this.fieldName,
            width : 100,
            style: ' \
                text-align: right;\
                color:#000000;\
                font-weight: bold \
            ',    	        
            allowBlank:this.allowBlank,
            allowDecimals: this.allowDecimals,
            allowNegative : this.allowNegative,
            decimalPrecision : 2,   
            decimalSeparator : ',',  
        },{
            xtype:'displayfield',
            value:this.muText,
            style: 'margin:0 0 0 5',    	        	            
        }]          
        //..
        Ext.apply(this, Ext.apply(this.initialConfig, {
            items:items,
        }));        
        Plext.form.NumberFieldWithMu.superclass.initComponent.call(this,arguments);     
    },    
});	     
Ext.reg('plext:form:numberfieldwithmu', Plext.form.NumberFieldWithMu);



//******************************************************************************
__Form = {__:''}
//******************************************************************************

Plext.form.FormPanel = function (config) {
    Plext.form.FormPanel.superclass.constructor.call(this,config);     
};
Plext.form.FormPanel = Ext.extend(Ext.form.FormPanel, {
    autoScroll:true,
    border:false,                        
    bodyStyle:'padding:10px 15px 10px 10px;background:#e5e5e5;',  
    labelAlign:'right',                         
    labelWidth: 100,   
    forceClass:'', 
    //..
    msg: "Сохранение...",
    msgCls: "x-mask-loading",
    cursorPos:0,       

    getByName:function(name){
        return this.getForm().items.find(function(item){
            return item.name===name;
         });
    },
    toCreate:function(store,filters,master){
    
        //..
        this.store = store; 
        //..
        var form = this.getForm()
        form.reset();
        //..
        form.items.each(function(item) {
            if (item.presetValue) {
                item.presetValue();
            };
            //.
            if (filters){
                var filter = filters[item.name];
                if (filter){
                    var val = filter.getValue({is_obj:true});
                    if (val){
                        var func = item.presetValueFromFilter;
                        if (func) {
                            func(item,val);
                        };
                    };
                };
            };
            //..
            if (master){
                var val = master.data;            
                if (val){
                    var func = item.presetValueFromMaster;
                    if (func) {
                        func(item,val);
                    };       
                };
            };            
        },this);	  		
		//..
        delete this.instance;
		//..
        if (Ext.isNumber(this.cursorPos)){
            this.items.itemAt(this.cursorPos).focus('', 10);            
        };
        if (Ext.isString(this.cursorPos)){
            this.getByName(this.cursorPos).focus('',10);
        };
        if (Ext.isObject(this.cursorPos)){
            Ext.getCmp(this.cursorPos.id).focus('',10);
        };        
        
    },
    toCancel:function(){
        //.
        this.getForm().reset();            
    },  

//    toUpdate:function(){
//        //.
//		var form = this.getForm().reset();
//        //..		    
//		if (this.instance){
//            form.items.each(function(item) {
//                if (item.loadValue){
//                    item.loadValue(this.instance);                
//                };
//            },this);	                
//		};
//        //..
//        form.loadRecord(this.instance); 
//   }, 

    toUpdate:function(instance, store){
        //..
        this.instance = instance;
        this.store = store; 
        //...
        var form = this.getForm().reset();
        //..
		if (this.instance){
            form.items.each(function(item) {
                if (item.loadValue){
                    item.loadValue(this.instance);                
                };
            },this);	                
		};          
        //..
	    form.loadRecord(this.instance);        
	    //..
    },

    toSubmit:function(){
		var form = this.getForm();
	    var Record = this.store.recordType;
	    var record = new Record();
		//..		
		if (!form.isValid()){
			Ext.MessageBox.alert('Ошибка при заполнении формы','Необходимо заполнить все поля,\
			 подчеркнутые красной линией');
			return false;
		};
        //..
		if (this.instance){
		    record = this.instance;		  		    
            record.beginEdit();
        };

        //...
	    form.items.each(function(item) {
	        if ((!!item.name)&&(!item.exclude)){
		        record.set(item.name, item.getValue({is_obj:true})); 
            };		        
	    });	
        //..
	    this.extraSubmit(record);	    
        //..
		if (this.instance){        
            record.endEdit();
		}else{
            this.store.insert(0, record);
		};
        //..
        Ext.apply(this.store.baseParams, {
            force:this.forceClass,
	    });          
        this.store.save();
        ///..
        delete this.store.baseParams.force;
		return true;        
    },

//    init_cmp : function (cmp) {
//        if (!this.cxt)
//            this.cxt = {};
//        //..
//        this.cxt[cmp.name]=cmp;
//        //..
//    },   

    init_cmp : function (cmp) {
        if (!this.cxt)
            this.cxt = {};
        //..
        this.cxt[cmp.name]=cmp;
        //..
        cmp.cxt = this.cxt;
    },       

    
    extraSubmit:function(record){
        //..timeline
		if (this.instance){
		    var timeline = this.instance.get('timeline');
		    if (timeline) {
                record.set('timeline',this.instance.get('timeline'));        		
            };
        };
    },
});
Ext.reg('plext:form:formpanel', Plext.form.FormPanel);



// ------------------------------ FormWindow -------------------------------
Plext.form.FormWindow = function(){};
Plext.form.FormWindow = Ext.extend(Ext.Window, {
    //..
	width:560,
	height:500,
	layout:'form',
	modal:true,
	closable: false,
	bodyStyle:'padding:5px',
    labelAlign:'right',                         
    labelWidth: 100,    
    fileUpload:false,
	
    
  initComponent : function(){
		var buttons = [{
			text:'Сохранить',
            listeners: {
                click: {
                    scope: this,
                    fn: function (item, e) {
                        this.toSubmit();
                    }
                }
            }	
		},{
			text:'Закрыть',
            listeners: {
                click: {
                    scope: this,
                    fn: function (item, e) {
                        this.close();
                    }
                }
            }				
		}];


		config = {
            items:this.fields,		
			buttons:buttons,
			fileUpload:this.fileUpload,
		};  
        ///.
		Ext.apply(this, Ext.apply(this.initialConfig, config));        
        var form = this.form = this.createForm();		
        Plext.form.FormWindow.superclass.initComponent.call(this,config);

        this.bodyCfg = {
            tag: 'form',
            cls: this.baseCls + '-body',
            method : this.method || 'POST',
            id : this.formId || Ext.id()
        };

        this.initItems();
        this.relayEvents(this.form, ['beforeaction', 'actionfailed', 'actioncomplete']);
        //.
    },

    // private
    createForm : function(){
        var config = Ext.applyIf({listeners: {}}, this.initialConfig);
        return new Ext.form.BasicForm(null, config);
    },

    // private
    initFields : function(){
        var f = this.form;
        var formPanel = this;
        var fn = function(c){
            if(formPanel.isField(c)){
                f.add(c);
            }else if(c.findBy && c != formPanel){
                formPanel.applySettings(c);
                //each check required for check/radio groups.
                if(c.items && c.items.each){
                    c.items.each(fn, this);
                }
            }
        };
        this.items.each(fn, this);
    },

    // private
    applySettings: function(c){
        var ct = c.ownerCt;
        Ext.applyIf(c, {
            labelAlign: ct.labelAlign,
            labelWidth: ct.labelWidth,
            itemCls: ct.itemCls
        });
    },

    /**
     * Provides access to the {@link Ext.form.BasicForm Form} which this Panel contains.
     * @return {Ext.form.BasicForm} The {@link Ext.form.BasicForm Form} which this Panel contains.
     */
    getForm : function(){
        return this.form;
    },

    // private
    onRender : function(ct, position){
        this.initFields();
        Plext.form.FormWindow.superclass.onRender.call(this, ct, position);
        this.form.initEl(this.body);
    },

    // private
    beforeDestroy : function(){
//        this.stopMonitoring();
        this.form.destroy(true);
        Plext.form.FormWindow.superclass.beforeDestroy.call(this);
    },

    // Determine if a Component is usable as a form Field.
    isField : function(c) {
        return !!c.setValue && !!c.getValue && !!c.markInvalid && !!c.clearInvalid;
    },

    // private
    onDisable : function(){
        Plext.form.FormWindow.superclass.onDisable.call(this);
        if(this.form){
            this.form.items.each(function(){
                 this.disable();
            });
        }
    },

    // private
    onEnable : function(){
        Plext.form.FormWindow.superclass.onEnable.call(this);
        if(this.form){
            this.form.items.each(function(){
                 this.enable();
            });
        }
    },
    
    
    /**
    * open and set form field from table record instance
    * @param {none} nothing 
    * @return {FormWindow} this
    */
    toUpdate:function(){
        //.
		var form = this.getForm().reset();
        //..		    
		if (this.instance){
            form.items.each(function(item) {
                if (item.loadValue){
                    item.loadValue(this.instance,this);                
                };
            },this);	                
		};
        //..
        form.loadRecord(this.instance); 
        //...
        return this;      
   },     
    //...
	toSubmit: function(){
	    var Record = this.store.recordType;	
	    var record = new Record();	    
		var form = this.getForm();
		//..
		if (!form.isValid()){
			Ext.MessageBox.alert('Ошибка при заполнении формы','Необходимо заполнить все поля, подчеркнутые красной линией!');
			return false;
		};
        //..begin
		if (this.instance){
		    record = this.instance;		  		    
            record.beginEdit();
        };

        //..edit
	    form.items.each(function(item) {
	        if ((item.name)&&(!item.exclude)){
                var name = item.name,
                val = item.getValue({is_obj:true});
                //...
		        record.set(name,val); 
            };
		    //..
	    });	
	    this.extraSubmit(record,this.instance);
	    //..
	    dup = this.getRecDupls(record,this.instance);
	    if (dup) {
	        if (dup.length>0) {
//			    Ext.MessageBox.alert('Ошибка при заполнении формы','Дублирующиеся записи недопустимы!');
			    return false;	        
            };		
        };	
        //..end
		if (this.instance){		    
            record.endEdit();
            if (!!this.store.sortInfo)
                this.store.singleSort(this.store.sortInfo.field,this.store.sortInfo.direction);                    
		}else{
            this.store.addSorted(record);
		};
		//..
        this.close();	
        //..
        if (!this.instance){
            index = this.store.indexOf(record);           
            this.store.fireEvent('afteraddrecord',this.store, record,index);                          	    
        };
        //..
        if (!!this.instance){
            index = this.store.indexOf(record);      
            if (!!this.grid){
                this.grid.fireEvent('rowafterupdate',record,index);                          	    
            };
        };
        
	},   
	//..
	extraSubmit: function(record){	
	},
	//..
    getRecDupls:function(rec,instance){
       return []; 
    },
    //..
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

Ext.reg('plext:form:formwindow', Plext.form.FormWindow);


//******************************************************************************
__Grid = {__:''}
//******************************************************************************

Ext.ns('Plext.grid');
Plext.grid.GridPanel = function(){};
Plext.grid.GridPanel = Ext.extend(Ext.net.GridPanel, {
    viewConfig: {
        forceFit: true,
        emptyText: 'Нет записей'        
    },
	loadMask : {
		msg : 'Подождите, идет загрузка...'
	},
	border: false,
    disabled:true,  
    //..
    fields:[],
    columns:[],
    action:{},
    //..
    tbar:null,
    sm:null,
    //..
    pageSize: 20,
    store:null,
    plugins:null,
    //.
    msg: "Сохранение...",
    msgCls: "x-mask-loading",    
    //..
    filters:{},
    //..
    cls: 'middle-align-grid',                 
    //....................................
    initComponent: function(){
        this.addEvents('storewrite','storeexception','storeload');	    
        //..
		var proxy = new  Ext.data.DirectProxy({
            api: {
                read: this.action.read,
                create: this.action.create,
                destroy: this.action.remove,            
                update: this.action.update,                     
            }
		});
		    
		var reader = new Ext.data.JsonReader({
		        idProperty: 'id',		
        		successProperty: 'success',
        		messageProperty :'message',
                root: 'data',    		    
                totalProperty: 'total_count',    
                fields: this.fields,                    
		    }
		);

		var writer = new Ext.data.JsonWriter({
		    encode: false,
		    writeAllFields: true
		});

		var store = this.store || new Ext.data.Store({
		    proxy: proxy,
		    reader: reader,
		    writer: writer,    
			autoSave:false,
		    listeners:{
		    	scope:this,
		    	'write':this.onStoreWrite,
                'exception':this.onStoreException,
		    	'load':this.onStoreLoad,                  
		    }			
		});
		

        var bbar = new Ext.PagingToolbar({
            pageSize: this.pageSize,
            store: store,
            displayInfo: true,
            displayMsg: 'запись {0} - {1} из {2}',
            emptyMsg: "записей нет"
	    });

    	//..selection model
		var sm  = this.sm || new Ext.grid.RowSelectionModel({
			singleSelect : true,
		});  

        //..config
        var config = {
            sm: sm,
			store: store,
			columns: this.columns,
            bbar: bbar,
            plugins:this.plugins,
        };
        
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        Plext.grid.GridPanel.superclass.initComponent.call(this,arguments); 
       
    },
  	//..
    initFilters: function(obj){  
        //..
        this.filters[obj.name] = obj;
    },	

    applyFilter:function(obj){
        if (!obj) return;
        //...
        var param = {};
        param[obj.name] = obj.getValue();
        Ext.apply(this.store.baseParams,param);
        //..
        this.toLoad();            
    },  
    resetFilter:function(){
        for(var key in this.filters) {        
            this.filters[key].clear();
            delete this.store.baseParams[key];            
        };
        //.
        this.toLoad();                          
    },    
    //....................................
	onStoreWrite:function(store,action,result,res,rs){
        switch (action) {
            case 'destroy':
                Ext.ux.msg('Success', 'Данные успешно удалены', Ext.Msg.INFO);
                this.el.unmask();                
                break;
            default:
                Ext.ux.msg('Success', 'Данные успешно сохранены', Ext.Msg.INFO);
        };		    	
        //..
        if (action=='create'){
//                        this.getSelectionModel().selectLastRow();
//                        this.getView().focusEl.focus(); 
            this.getView().refresh();
            this.getSelectionModel().selectRow(0);
        };               
        //..
        this.fireEvent('afterstorewrite', this, store,action,result,res,rs);          
	},   

//    onAfterStoreWrite:function(controller,instance, store,action,result,res,rs){
//        //..
//        if ((!action=='create')||(!action=='update')) return;        
//        //...
//	    controller.Edit.unmask();        
//        controller.Group.setActiveItem(0);		        
//    }, 
    	   
    onStoreException:function(me,type,action,options,response,arg){
        //..
        if (Ext.type(response.message)=='object') {
    	    for (item in response.message){
                Ext.ux.msg('Error', item.toUpperCase()+': '+response.message[item], Ext.Msg.ERROR,10)    		    	    
    	    };		    	            
        }else{
             Ext.ux.msg('Error', response.message, Ext.Msg.ERROR,10)    		    	                            
        };	
        //...	 
        if (action=='destroy')
            this.el.unmask();                        
            this.store.load();
        //..
        if (action=='create') {
            this.getStore().each(function(record){
                if(record.dirty == true)
                    this.store.remove(record);
            },this);      
        //TODO обновить счетчик                 
        };
        //..
        if (action=='update') {
//            var record = this.getSelectionModel().getSelected();        
//            this.store.rejectChanges();
//            if (record){
//                //..
//                for(var field in record.modified){
//        			record.set(field, record.modified[field]);
//                }
//                record.commit();    
//            }
        };                
        //..
        this.fireEvent('afterstoreexception', this, type,action,options,response,arg);                  
    },	

//    onAfterStoreException:function(controller,instance, type,action,options,response,arg){
//        if ((action=='create')||(action=='update'))
//	        controller.Edit.unmask();        
//    },
        
	onStoreLoad:function(store,records,options){
        this.enable();
        //.
//        this.getSelectionModel().selectRow(0);        
        this.focusActiveRow();
        this.fireEvent('afterstoreload', this, store,records,options);                          
	},        

//    onAfterStoreLoad:function(controller,instance, store,records,options){
//        controller.GridMenu.enable();
//    },	
    //....................................
	toCreate: Ext.emptyFn, //to controller
    //..    
	toUpdate: Ext.emptyFn, //to controller
    //...
    toKill: function() {
        //..
        var currentrecord = this.getSelectionModel().getSelected();
        if (!currentrecord) {
			Ext.MessageBox.alert('Удаление невозможно!!!','Укажите запись которую хотите удалить');
            return;         
        }          
        //..
        if (!this.killPermission(currentrecord)){
			Ext.MessageBox.alert('Удаление невозможно!!!','Запись заблокирована');
            return;         
        }              
        

        Ext.apply(this.store.baseParams, {
            force:currentrecord.data.force,
		}); 
        
        this.store.remove(currentrecord);
        this.store.save();
        delete this.store.baseParams.force;        
        this.el.mask("Выполняется удаление...", this.msgCls);        
        
//        this.store.load();
    },	
    	

    getPermission:function(record){
        if (USER_OBJ.is_admin==true)
            return true;
        ///.
        var timelines = record.get('timelines');
        if (!timelines)
            return false;
        //..           
        if (!timelines.length>0)         
            return false;
        //..
        var timeline = timelines[timelines.length-1]
        //..
        if (timeline.is_consided || timeline.is_approved)
            return false;        
        //..
        return false
    },    

    updatePermission:Plext.form.UpdatePermission,
//    updatePermission:function(record){
//        timelines = record.get('timelines')    
//        if ((timelines)&&(timelines.length>0)){
//            recordLavel = Math.max.apply(null, timelines.map(function(item){ return item.verify.lavel }));
//            //.
//            if (USER_OBJ.lavel >= recordLavel){
//                return true;
//            };
//        };
//        return false;
//    },

    killPermission:function(record){
        var perm = this.getPermission(record);
        return perm;
    },
    
    toLoad: function(){
		this.store.load();
    },

    
//    preLoad:function(obj){
//	    if (!obj){
//	        this.disable();	
//	        return;
//	    };
//	    this.master = obj;
//	    this.load(obj);

//    },    

    focusActiveRow:function(){
        var rec = this.getSelectionModel().getSelected();
        if(!rec) return;
        index = this.store.indexOf(rec);   
        this.getView().focusRow(index);              
    }, 

    focusRow:function(rec){
        if(!rec) return;
        index = this.store.indexOf(rec);   
        this.getSelectionModel().selectRow(index);        
        this.getView().focusRow(index);              
    }, 
	
});
Ext.reg('plext:grid:gridpanel', Plext.grid.GridPanel);


Plext.form.TottalSummaryGridPanel = function(){};
Plext.form.TottalSummaryGridPanel = Ext.extend(Ext.grid.GridPanel, {
//    height:200,
    autoHeight:true,     
//    autoWidth :true,    
    autoSave:true,    
    isFormField: true,
    getName: Ext.emptyFn,
    ///..   reader                               
    fields:[],
    idProperty:'id',
    ///..   store
    data:[],
    sortInfo:{field: 'summary', direction: "ASC"},
    groupField:'summary',			
    //.. cm
    columns:[],
    //..
    winClass:{},
    //....................................
    initComponent: function(){

        //..
        var reader =  new Ext.data.JsonReader({
            fields:this.fields,
            idProperty:this.idProperty,
        });


        var store = new Ext.data.GroupingStore({
            reader: reader,
            data: this.data,
            sortInfo:this.sortInfo,
            groupField:this.groupField,
            listeners:{
                add:{
                    scope:this,
                    fn:function(item, records, index ){
                        this.setTotalSize();
                        this.getView().refresh();
                    },
                },
                update:{
                    scope:this,
                    fn:function(item, records, index ){
                        this.setTotalSize();
                        this.getView().refresh();
                    },                
                },
            },
        });

        var view = new Ext.grid.GroupingView({        
            forceFit: true,
            markDirty: false,
            hideGroupedColumn: true,
            showGroupName: false,
            emptyText: 'Нет записей',
        });

        var cm = new Ext.grid.ColumnModel({
            columns:this.columns,
            listeners: {
                widthchange: {
                    fn: function (item, columnIndex, newWidth) {
                        this.setTotalSize();
                    }
                },
                headerchange: {
                    fn: function (item, columnIndex, newWidth) {
                        this.setTotalSize();
                    }
                }                
            }
        });

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
            }]
        };

        var bbar = {
            xtype: "toolbar",
            items: [],
        };
        for (var i=0; i < cm.columns.length; i++) {
            column = cm.columns[i];
            if (column.dataIndex == store.groupField) continue;
            //..            
            bbar.items.push(new Ext.form.DisplayField({
                cls: "total-field",
                dataIndex: column.dataIndex,
                value: "-",
                setValue : function(v){
                    if (!v) return this;
                    if (this.rendered){
                        v = Ext.isEmpty(v) ? '' : v;
                        this.el.dom.innerHTML = v; 
                    }else {
                        this.value = v;                    
                    }
                    return this;
                },                
            }));
        };        


        var config = {
            tbar:tbar, 
            bbar:bbar,       
            store: store,
            view: view,
            cm:cm,
            plugins: new Ext.grid.GroupSummary({}),     
        };
      
        //..
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        Plext.form.TottalSummaryGridPanel.superclass.initComponent.call(this,arguments); 
        //..
        this.on({
            scope:this,        
            'resize': this.setTotalSize,
            'columnresize': this.setTotalSize,
            'rowdblclick':this.toUpdate,
        });
    },

    setTotalSize:function(){
        var grid = this;
        var fbar = grid.getBottomToolbar(),
            column,
            field,
            width,
            data = {},
            c,
            cs = grid.view.getColumnData();
        //..     
        for (var j = 0, jlen = grid.store.getCount(); j < jlen; j++) {
            var r = grid.store.getAt(j);
            
            for (var i = 0, len = cs.length; i < len; i++) {
                c = cs[i];
                column = grid.getColumnModel().columns[i];

                if (column.summaryType) {
                    data[c.name] = Ext.grid.GroupSummary.Calculations[column.summaryType](data[c.name] || 0, r, c.name, data);
                }
            }
        }
        //..
        for (var i=0; i < grid.getColumnModel().columns.length; i++) {
            column = grid.getColumnModel().columns[i];

            if (column.dataIndex != grid.store.groupField) {
                field = fbar.findBy(function (item) {
                    return item.dataIndex === column.dataIndex;
                })[0];
                //..
                fbar.remove(field, false);
                fbar.insert(i, field);
                width = grid.getColumnModel().getColumnWidth(i);
                field.setWidth(width-1);  
                //..
                c = cs[i];
                val = (column.summaryRenderer || c.renderer)(data[c.name], {}, {}, 0, i, grid.store);
                field.setValue(val || '-');
                //..
            }
        }
    },
        
    toCreate:function(){
        var winClass = Ext.decode(this.winClass);
		var win = new winClass({
			store:this.store,
		});
		win.show(this);
        win.items.first().focus('', 10);
    },        

    toUpdate:function(){
		var rec = this.getSelectionModel().getSelected();
		if (!rec) return;
		//..
        var winClass = Ext.decode(this.winClass);
		var win = new winClass({
			store:this.store,
			instance:rec,
		});

		win.show(this);
		win.toUpdate();
        win.items.first().focus('', 10);
    },

    toRemove:function(){
        var rec = this.getSelectionModel().getSelected();
        if (!rec) return; 
        //..        
        this.store.remove(rec);
        //..
        this.setTotalSize();
    },    
    //..
    setValue:function(val){
        if (!val) return;
        this.store.loadData(val);
        //..
        this.setTotalSize();
    },
    
    getValue:function(){
        val =  this.store.getRange().map(function(item){
            var data = item.data;
            data.dirty = item.dirty || false;
            return data;
        });
        return val;
    },
    
    markInvalid:function(){
        //..pass
        this.el.addClass('x-form-invalid');     
    },
    
    clearInvalid:function(){
        //..pass
    },    
    
    validate : function(){
//        if(this.disabled || this.getValue().length){
//            return true;
//        }
//        return false;        
        return true;
    },     
    
    reset: function(){
        this.store.removeAll();
    },    

});
Ext.reg('plext:form:tottalsummarygridpanel', Plext.form.TottalSummaryGridPanel);

// -----------------------------------------------------------------------------
Plext.form.TottalGridPanel = function(){};
Plext.form.TottalGridPanel = Ext.extend(Ext.grid.GridPanel, {
//    height:200,
    autoHeight:true,     
    autoSave:true,    
    isFormField: true,
    getName: Ext.emptyFn,
    ///..   reader                               
    fields:[],
    idProperty:'id',
    ///..   store
    data:[],
    //.. cm
    columns:[],
    //..
    winClass:{},
    focusAt:0,
    sortInfo:null,
    viewConfig:{},
    //....................................
    initComponent: function(){

        //..
        var reader =  new Ext.data.JsonReader({
            fields:this.fields,
            idProperty:this.idProperty,
        });


        var store = new Ext.data.Store({
            reader: reader,
            data: this.data,
            sortInfo:this.sortInfo,
            listeners:{
                add:{
                    scope:this,
                    fn:function(item, records, index ){
                        this.setTotalSize();
//                        this.getView().refresh();
                    },
                },
                update:{
                    scope:this,
                    fn:function(item, records, index ){
                        this.setTotalSize();
//                        this.getView().refresh();
                    },                
                },
            },
        });


         var viewConfig = {        
            forceFit: true,
            emptyText: 'Нет записей',
        };
        Ext.apply(viewConfig,this.viewConfig);
        var view = new Ext.grid.GridView(viewConfig);


//        var view = new Ext.grid.GridView({        
//            forceFit: true,
//            emptyText: 'Нет записей',
//        });

        var cm = new Ext.grid.ColumnModel({
            columns:this.columns,
            listeners: {
                widthchange: {
                    fn: function (item, columnIndex, newWidth) {
                        this.setTotalSize();
                    }
                },
                headerchange: {
                    fn: function (item, columnIndex, newWidth) {
                        this.setTotalSize();
                    }
                }                
            }
        });

        var tbar = this.tbar || {
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
            }]
        };

        var bbar = {
            xtype: "toolbar",
            items: [],
        };
        for (var i=0; i < cm.columns.length; i++) {
            column = cm.columns[i];
            if (column.dataIndex == store.groupField) continue;
            //..            
            bbar.items.push(new Ext.form.DisplayField({
                cls: "total-field",
                dataIndex: column.dataIndex,
                value: "-",
                setValue : function(v){
                    if (!v) return this;
                    if (this.rendered){
                        v = Ext.isEmpty(v) ? '' : v;
                        this.el.dom.innerHTML = v; 
                    }else {
                        this.value = v;                    
                    }
                    return this;
                },                
            }));
        };        


        var config = {
            tbar:tbar, 
            bbar:bbar,       
            store: store,
            view: view,
            cm:cm,
//            listeners: {            
//                resize: {
//                    fn: function (columnIndex, newSize) {
//                        this.setTotalSize()
//                    },
//                },   
//                columnresize: {
//                    fn: function (columnIndex, newSize) {
//                        this.setTotalSize()
//                    },
//                },                     
//                rowdblclick:{
//                    scope:this,
//                    fn:this.toUpdateRecord,
//                },
//            },
        };
      
        //..
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        Plext.form.TottalGridPanel.superclass.initComponent.call(this,arguments); 
        //...
        this.on({
            scope:this,        
            'resize': this.setTotalSize,
            'columnresize': this.setTotalSize,
            'rowdblclick':this.toUpdate,
        });        
    },

    setTotalSize:function(){
        var grid = this;
        var fbar = grid.getBottomToolbar(),
            column,
            field,
            width,
            data = {},
            c,
            cs = grid.view.getColumnData();
        //..     
        for (var j = 0, jlen = grid.store.getCount(); j < jlen; j++) {
            var r = grid.store.getAt(j);
            
            for (var i = 0, len = cs.length; i < len; i++) {
                c = cs[i];
                column = grid.getColumnModel().columns[i];

                if (column.summaryType) {
                    data[c.name] = Ext.grid.GroupSummary.Calculations[column.summaryType](data[c.name] || 0, r, c.name, data);
                }
            }
        }
        //..
        for (var i=0; i < grid.getColumnModel().columns.length; i++) {
            column = grid.getColumnModel().columns[i];

            if (column.dataIndex != grid.store.groupField) {
                field = fbar.findBy(function (item) {
                    return item.dataIndex === column.dataIndex;
                })[0];
                //..
                fbar.remove(field, false);
                fbar.insert(i, field);
                width = grid.getColumnModel().getColumnWidth(i);
                field.setWidth(width-1);  
                //..
                c = cs[i];
                val = (column.summaryRenderer || c.renderer)(data[c.name], {}, {}, 0, i, grid.store);
                field.setValue(val || '-');
                //..
            }
        }
    },
        
    toCreate:function(){
        var winClass = Ext.decode(this.winClass);
		var win = new winClass({
			store:this.store,
		});
		win.show(this);
//        win.items.get(this.focusAt).focus('', 10);
        if (Ext.isObject(win.focusAt)){
            Ext.getCmp(win.focusAt.id).focus('',10);
        }else{
            throw new Ext.Error('focus object incorrect');
        }; 
    },        

    toUpdate:function(){
		var rec = this.getSelectionModel().getSelected();
		if (!rec) return;
		//..
        var winClass = Ext.decode(this.winClass);
		var win = new winClass({
			store:this.store,
			instance:rec,
		});

		win.show(this);
		win.toUpdate();
//        win.items.first().focus('', 10);
        if (Ext.isObject(win.focusAt)){
            Ext.getCmp(win.focusAt.id).focus('',10);
        }else{
            throw new Ext.Error('focus object incorrect');
        }; 
    },

    toRemove:function(){
        var rec = this.getSelectionModel().getSelected();
        if (!rec) return; 
        //..        
        this.store.remove(rec);
        this.setTotalSize();
    },    
    //..
    setValue:function(val){
        if (!val) return;
        this.store.loadData(val);
        this.setTotalSize();
    },
//    getValue:function(){
//        var ret =[];
//        this.store.data.each(function(item){
//            ret.push(item.data);
//        });
//        return ret;
//    },

    getValue:function(){
        val =  this.store.getRange().map(function(item){
            var data = item.data;
            data.dirty = item.dirty || false;
            return data;
        });
        return val;
    },
        
    markInvalid:function(){
        //..pass
        this.el.addClass('x-form-invalid');     
    },
    clearInvalid:function(){
        //..pass
    },    
    validate : function(){
//        if(this.disabled || this.getValue().length){
//            return true;
//        }
//        return false;        
        return true;
    },     
    reset: function(){
        this.store.removeAll();
    },    

});
Ext.reg('plext:form:tottalgridpanel', Plext.form.TottalGridPanel);


// -----------------------------------------------------------------------------

Plext.form.PropertyGridPanel = function (config) {
    Plext.form.PropertyGridPanel.superclass.constructor.call(this, config);
};
Ext.extend(Plext.form.PropertyGridPanel,Ext.grid.EditorGridPanel, {
    autoHeight:true,     
    isFormField: true,
    getName: Ext.emptyFn,
    fields:[],
    data:[],
    columns:[],
    //....................................
    initComponent: function(){
        //..
        var store = new Ext.data.Store({
            reader: new Ext.data.JsonReader({
                fields:this.fields,
                idProperty:'id',
            }),
            data: this.data,
        });
//        store.on('add',this.setTotalSize,this);
//        store.on('update',this.setTotalSize,this);        
        //...
        var view = new Ext.grid.GridView({        
            forceFit: true,
            emptyText: 'Нет записей',
        });
        //...
        var cm = new Ext.grid.ColumnModel({
            columns:this.columns,
        });
//        cm.on({
//            scope:this,        
//            widthchange: this.setTotalSize,
//            headerchange: this.setTotalSize,
//        });        
        
//        var bbar = {
//            xtype: "toolbar",
//            items: [],
//        };
//        for (var i=0; i < cm.columns.length; i++) {
//            column = cm.columns[i];
//            if (column.dataIndex == store.groupField) continue;
//            //..            
//            bbar.items.push(new Ext.form.DisplayField({
//                cls: "total-field",
//                dataIndex: column.dataIndex,
//                value: "-",
//                setValue : function(v){
//                    if (!v) return this;
//                    if (this.rendered){
//                        v = Ext.isEmpty(v) ? '' : v;
//                        this.el.dom.innerHTML = v; 
//                    }else {
//                        this.value = v;                    
//                    }
//                    return this;
//                },                
//            }));
//        };        
      
        //..
        Ext.apply(this, Ext.apply(this.initialConfig, {
//            bbar:bbar,       
            store: store,
            view: view,
            cm:cm,        
        }));
        ///..        
        Plext.form.PropertyGridPanel.superclass.initComponent.call(this,arguments); 
        //...
//        this.on({
//            scope:this,        
//            'resize': this.setTotalSize,
//            'columnresize': this.setTotalSize,
////            rowdblclick:this.toUpdate,
//        });

    },

//    setTotalSize:function(){
//        var grid = this;
//        var fbar = grid.getBottomToolbar(),
//            column,
//            field,
//            width,
//            data = {},
//            c,
//            cs = grid.view.getColumnData();
//        //..     
//        for (var j = 0, jlen = grid.store.getCount(); j < jlen; j++) {
//            var r = grid.store.getAt(j);
//            
//            for (var i = 0, len = cs.length; i < len; i++) {
//                c = cs[i];
//                column = grid.getColumnModel().columns[i];

//                if (column.summaryType) {
//                    data[c.name] = Ext.grid.GroupSummary.Calculations[column.summaryType](data[c.name] || 0, r, c.name, data);
//                }
//            }
//        }
//        //..
//        for (var i=0; i < grid.getColumnModel().columns.length; i++) {
//            column = grid.getColumnModel().columns[i];

//            if (column.dataIndex != grid.store.groupField) {
//                field = fbar.findBy(function (item) {
//                    return item.dataIndex === column.dataIndex;
//                })[0];
//                //..
//                fbar.remove(field, false);
//                fbar.insert(i, field);
//                width = grid.getColumnModel().getColumnWidth(i);
//                field.setWidth(width-1);  
//                //..
//                c = cs[i];
//                val = (column.summaryRenderer || c.renderer)(data[c.name], {}, {}, 0, i, grid.store);
//                field.setValue(val || '-');
//                //..
//            }
//        }
//    },

    presetValue:function(){
        this.store.loadData(this.data);
//        this.setTotalSize();
    },
        
    //..
    setValue:function(val){
        if (!val) return;
        this.store.loadData(val);
//        this.setTotalSize();
    },

//    getValue:function(){
//        val =  this.store.getRange().map(function(item){
//            var data = item.data;
//            data.dirty = item.dirty || false;
//            return data;
//        });
//        return val;
//    },

    getValue:function(){
        val =  this.store
            .getRange().map(function(item){
                var data = item.data;
                data.dirty = item.dirty || false;
                return data;
            })
            .filter(function(rec){
                return (!rec.value == 0)
            });
        return val;
    },


    markInvalid:function(){
        //..pass
        this.el.addClass('x-form-invalid');     
    },
    clearInvalid:function(){
        //..pass
    },    
    validate : function(){
        if(this.disabled || this.getValue().length){
            return true;
        }
        return false;        
    },     

//    validate : function(){
//        if(this.disabled || (!Ext.isEmptyObject(this.getValue()))){
//            return true;
//        }
//        return false;        
//    },    


    reset: function(){
        this.store.removeAll();
    },    

    getRawValue:function(){
        return '';
    },

});
Ext.reg('plext:form:propertygridpanel', Plext.form.PropertyGridPanel);



Plext.form.PropertySummaryGridPanel = function (config) {
    Plext.form.PropertySummaryGridPanel.superclass.constructor.call(this, config);
};
Ext.extend(Plext.form.PropertySummaryGridPanel,Ext.grid.EditorGridPanel, {
    autoHeight:true,     
    isFormField: true,
    getName: Ext.emptyFn,
    fields:[],
    data:[],
    columns:[],
    //....................................
    initComponent: function(){
        //..
        var store = new Ext.data.Store({
            reader: new Ext.data.JsonReader({
                fields:this.fields,
                idProperty:'id',
            }),
            data: this.data,
        });
        store.on('add',this.setTotalSize,this);
        store.on('update',this.setTotalSize,this);        
        //...
        var view = new Ext.grid.GridView({        
            forceFit: true,
            emptyText: 'Нет записей',
        });
        //...
        var cm = new Ext.grid.ColumnModel({
            columns:this.columns,
        });
        cm.on({
            scope:this,        
            widthchange: this.setTotalSize,
            headerchange: this.setTotalSize,
        });        
        
        var bbar = {
            xtype: "toolbar",
            items: [],
        };
        for (var i=0; i < cm.columns.length; i++) {
            column = cm.columns[i];
            if (column.dataIndex == store.groupField) continue;
            //..            
            bbar.items.push(new Ext.form.DisplayField({
                cls: "total-field",
                dataIndex: column.dataIndex,
                value: "-",
                setValue : function(v){
                    if (!v) return this;
                    if (this.rendered){
                        v = Ext.isEmpty(v) ? '' : v;
                        this.el.dom.innerHTML = v; 
                    }else {
                        this.value = v;                    
                    }
                    return this;
                },                
            }));
        };        
      
        //..
        Ext.apply(this, Ext.apply(this.initialConfig, {
            bbar:bbar,       
            store: store,
            view: view,
            cm:cm,        
        }));
        ///..        
        Plext.form.PropertySummaryGridPanel.superclass.initComponent.call(this,arguments); 
        //...
        this.on({
            scope:this,        
            'resize': this.setTotalSize,
            'columnresize': this.setTotalSize,
//            rowdblclick:this.toUpdate,
        });

    },

    setTotalSize:function(){
        var grid = this;
        var fbar = grid.getBottomToolbar(),
            column,
            field,
            width,
            data = {},
            c,
            cs = grid.view.getColumnData();
        //..     
        for (var j = 0, jlen = grid.store.getCount(); j < jlen; j++) {
            var r = grid.store.getAt(j);
            
            for (var i = 0, len = cs.length; i < len; i++) {
                c = cs[i];
                column = grid.getColumnModel().columns[i];

                if (column.summaryType) {
                    data[c.name] = Ext.grid.GroupSummary.Calculations[column.summaryType](data[c.name] || 0, r, c.name, data);
                }
            }
        }
        //..
        for (var i=0; i < grid.getColumnModel().columns.length; i++) {
            column = grid.getColumnModel().columns[i];

            if (column.dataIndex != grid.store.groupField) {
                field = fbar.findBy(function (item) {
                    return item.dataIndex === column.dataIndex;
                })[0];
                //..
                fbar.remove(field, false);
                fbar.insert(i, field);
                width = grid.getColumnModel().getColumnWidth(i);
                field.setWidth(width-1);  
                //..
                c = cs[i];
                val = (column.summaryRenderer || c.renderer)(data[c.name], {}, {}, 0, i, grid.store);
                field.setValue(val || '-');
                //..
            }
        }
    },

    presetValue:function(){
        this.store.loadData(this.data);
        this.setTotalSize();
    },
        
    //..
    setValue:function(val){
        if (!val) return;
        this.store.loadData(val);
        this.setTotalSize();
    },

    getValue:function(){
        val =  this.store.getRange().map(function(item){
            var data = item.data;
            data.dirty = item.dirty || false;
            return data;
        });
        return val;
    },


    markInvalid:function(){
        //..pass
        this.el.addClass('x-form-invalid');     
    },
    clearInvalid:function(){
        //..pass
    },    
    validate : function(){
        if(this.disabled || this.getValue().length){
            return true;
        }
        return false;        
    },     

//    validate : function(){
//        if(this.disabled || (!Ext.isEmptyObject(this.getValue()))){
//            return true;
//        }
//        return false;        
//    },    


    reset: function(){
        this.store.removeAll();
    },    

    getRawValue:function(){
        return '';
    },

});
Ext.reg('plext:form:propertysummarygridpanel', Plext.form.PropertySummaryGridPanel);



Plext.form.SimpleGridPanel = function(){};
Plext.form.SimpleGridPanel = Ext.extend(Ext.grid.GridPanel, {
//    height:200,
    autoHeight:true,     
//    autoWidth :true,    
    autoSave:true,    
    isFormField: true,
    getName: Ext.emptyFn,
    ///..   reader                               
    fields:[],
    idProperty:'id',
    ///..   store
    data:[],
    sortInfo:{},
    SortFunction:Ext.EmptyFn,
    //.. cm
    columns:[],
    //..
    winClass:{},   
    winClassContext:{},
    isTbar:false, 
    viewConfig:{},
    //....................................
    initComponent: function(){
        //..
       var reader =  new Ext.data.JsonReader({
            fields:this.fields,
            idProperty:this.idProperty,
        });

        //...
        var store = new Ext.data.Store({
            reader: reader,
            data: this.data,
            sortInfo:this.sortInfo,
            listeners:{
                scope:this,
                'afteraddrecord':function(store, records,index){
                    this.getSelectionModel().selectRow(index);        
//                    this.getSelectionModel().selectLastRow();
                },
            },

            createSortFunction:this.SortFunction || function(field, direction) {
                direction = direction || "ASC";
                var directionModifier = direction.toUpperCase() == "DESC" ? -1 : 1;

                var sortType = this.fields.get(field).sortType;

                //create a comparison function. Takes 2 records, returns 1 if record 1 is greater,
                //-1 if record 2 is greater or 0 if they are equal
                return function(r1, r2) {
                    var v1 = sortType(r1.data[field]),
                        v2 = sortType(r2.data[field]);

                    return directionModifier * (v1 > v2 ? 1 : (v1 < v2 ? -1 : 0));
                };
            },            
        });

        //..
        var viewConfig = {        
            forceFit: true,
            emptyText: 'Нет записей',
           
        };
        Ext.apply(viewConfig,this.viewConfig);
        var view = new Ext.grid.GridView(viewConfig);

        var cm = new Ext.grid.ColumnModel({
            columns:this.columns,
        });

		var sm  = new Ext.grid.RowSelectionModel({
			singleSelect : true,
		});  


        var tbar = (this.isTbar)?this.tbar||{
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
            }]
        }:'';


        var config = {
            tbar:tbar,
            store: store,
            view: view,
            cm:cm,
            sm:sm,
        };
      
        //..
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        Plext.form.SimpleGridPanel.superclass.initComponent.call(this,arguments); 

        this.on({
            scope:this,        
            'rowdblclick':this.toUpdate,
        });                
    },
    
    //..
    setValue:function(val){
        if (val){
            this.store.loadData(val);
        };
    },
    
    getValue:function(){
        val =  this.store.getRange().map(function(item){
            var data = item.data;
            data.dirty = item.dirty || false;
            return data;
        });
        return val;
    },
    
    markInvalid:function(){
        //..pass
        this.el.addClass('x-form-invalid');     
    },
    clearInvalid:function(){
        //..pass
    },    
    validate : function(){
        return true;
    },     
    reset: function(){
        this.store.removeAll();
    },    

    toCreate:function(winClass,winClassContext){
        //..
//        var winObj = Ext.decode(winClass||this.winClass);
        var winObj = COMPONENTS[winClass||this.winClass];
		var cxt = {
			grid:this,		
			store:this.store,
		};
		Ext.apply(cxt,winClassContext||this.winClassContext);
		var win = new winObj(cxt);
		win.show(this);
//        win.items.get(this.focusAt).focus('', 10);
        if (Ext.isObject(win.focusAt)){
            Ext.getCmp(win.focusAt.id).focus('',10);
        }else{
            throw new Ext.Error('focus object incorrect');
        }; 
    },        

    toUpdate:function(winClass,winClassContext){
        if (!this.getPermissionUpdate()) return;
        //...
		var rec = this.getSelectionModel().getSelected();
		if (!rec) return;
		//..
        var winObj = COMPONENTS[winClass||this.winClass];
//        var winClass = Ext.decode(this.winClass);
        //...
		var cxt = {
			grid:this,				
			store:this.store,
			instance:rec,
		};
		Ext.apply(cxt,winClassContext||this.winClassContext);        		
		var win = new winObj(cxt);
        //..
		win.show(this);
		win.toUpdate();
//        win.items.first().focus('', 10);
//        win.items.get(this.focusAt).focus('', 10);
        if (Ext.isObject(win.focusAt)){
            Ext.getCmp(win.focusAt.id).focus('',10);
        }else{
            throw new Ext.Error('focus object incorrect');
        }; 
    },

    toRemove:function(){
        var rec = this.getSelectionModel().getSelected();
        if (!rec) return; 
        //..        
        this.store.remove(rec);
        this.setTotalSize();
    },   

    getPermission:function(record){
        return true

    },

    setTotalSize:function(){
        return true
    },
//    // private
//    afterRender : function(){
//        Plext.form.SimpleGridPanel.superclass.afterRender.call(this);
//        this.initValue();
//    },

//    initValue : Ext.emptyFn,


});
Ext.reg('plext:form:simplegridpanel', Plext.form.SimpleGridPanel);





//******************************************************************************
__Combo = {__:''}
//******************************************************************************
Ext.ns('Plext.form.ComboBox');

Plext.form.ComboBox = function (config) {
    this.addEvents('clear');
    Plext.form.ComboBox.superclass.constructor.call(this,config);     
};
Ext.extend(Plext.form.ComboBox,Ext.form.ComboBox, {
    //..
	emptyText:'Выберете из списка...',
    allowBlank:true,  

    mode: 'remote',  

	apifunction:null,
    autoLoad:false,            
    fields:['id','name'],
    baseParams:{},   

    valueField:'id',
    displayField:'name',    

    queryDelay: 700,    
    minChars:1, 
    editable:true,    

    submitValue: true,
    typeAhead: false,
    triggerAction: 'all',
    forceSelection:true,
    selectOnFocus:true,
    //..
    listWidth:260,    
    pageSize:10,   
    triggersConfig: [{
        hideTrigger: true,
        iconCls: "x-form-clear-trigger"
    }],
    //..
    showIcon:false,
    //.
    tpl:new Ext.XTemplate(
        '<tpl for=".">',
        '<div class="x-combo-list-item" style="white-space:normal !important;">',
        '{name}',
        '</div>',
        '</tpl>'
    ),     
                                
	initComponent:function(){
        //..win config 
        var api = {
            read: this.apifunction
        };

        var store = new Ext.data.DirectStore({
		    autoLoad:this.autoLoad,
		    root:'data',
		    idProperty:'id',
		    fields:this.fields,
            api:api,
            baseParams:this.baseParams,  
        });
		var config = {
            //..
            store:this.store || store,
		};
        //..
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Plext.form.ComboBox.superclass.initComponent.apply(this, arguments);	
		//..
        this.on({
            scope:this,
            'expand':function(combo){
                this.lastQuery = null;
            },
            'triggerclick':function (item, trigger, index, tag, e) {
                if (index == 0) {
                    this.focus().clearValue();
                    trigger.hide();
                    if (this.showIcon)
                        this.removeIconCls();                      
                    //..
                    this.fireEvent('clear', this);                                  
                };
            },
            'beforequery': function (queryEvent) {
                this.triggers[0][this.getRawValue().toString().length == 0 ? 'hide' : 'show']();
            },
            'select':function(item, record, index) {
                this.triggers[0].show();
                if (this.showIcon)
                    if (record.data.icon)
                        this.setIconCls('silk-'+record.data.icon.replace(/_/g,'-'));                
            },
        });
	},
	//.............................
	loadValue:function(instance){
	    //..
	    if ((!instance) || (!this.name)) return;
        //..
        var val = instance;
        //..
	    if (instance instanceof Ext.data.Record){
            val = instance.get(this.name);	    
	    };        
        //..
        if (!Ext.isObject(val)) return;
	    //..
        var fields = [];
        for(var p in val){
            fields.push(p);            
        };
        var data = {
            metaData: {
                idProperty: 'id',
                root: 'data',
                totalProperty: 'total_count',
                successProperty: 'success',
                fields: fields,
            },
            success:true,
            data:[val],
            total_count:1,      
        };
        this.store.loadData(data);    
        //.
        this.clearValue();        
        //..
        var r = this.findRecord('id', val.id);   
        if (!Ext.isEmpty(r)) {
            this.setValueAndFireSelect(val.id);
        };
        //..
        this.enable();    
	},
	
    setValue:function(val){
        var id = val;
        if (Ext.isObject(val)){
            id = val.id;
        };
		return Plext.form.ComboBox.superclass.setValue.call(this, id);	
    },    
 
    getValue:function(kwargs){
        //..
        var id = Plext.form.ComboBox.superclass.getValue.call(this);  
        var val = id;          
        //..
        if ((!!kwargs) && (kwargs.is_obj==true)) {
            //..
            record = this.findRecord('id',id);
            if (record)
                val = record.data;
        };
        //.
//        if ((!!kwargs) && (kwargs.is_rec==true)) {
//            //..
//            val = this.findRecord('id',id);
//        };                
        //.
        return val;
    },

});

Ext.reg('plext:form:combobox', Plext.form.ComboBox);


Plext.form.ComboBoxLocal = function (config) {
    this.addEvents('clear');
    Plext.form.ComboBoxLocal.superclass.constructor.call(this,config);     
};
Ext.extend(Plext.form.ComboBoxLocal,Ext.form.ComboBox, {
    //..
    emptyText:'Выберете из списка...',
    allowBlank:false,  
    mode: 'local',
    fields:['id','name'],
    data:[],
    valueField:'id',
    displayField:'name',    

    queryDelay: 700,    
    minChars:1, 
    editable:true,    

    submitValue: true,
    typeAhead: false,
    triggerAction: 'all',
    forceSelection:true,
    selectOnFocus:true,
    //..
    listWidth:260,    
    pageSize:10,   
    triggersConfig: [{
        hideTrigger: true,
        iconCls: "x-form-clear-trigger"
    }],
    //..
    showIcon:false,
    //.
    tpl:new Ext.XTemplate(
        '<tpl for=".">',
        '<div class="x-combo-list-item" style="white-space:normal !important;">',
        '{name}',
        '</div>',
        '</tpl>'
    ),     
                                
    initComponent:function(){
        //..
        var store = new Ext.data.ArrayStore({
            fields: this.fields,
            data: this.data
        });
        var config = {
            store:store,
        };
        //..
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        Plext.form.ComboBoxLocal.superclass.initComponent.apply(this, arguments);    
        //..
        this.on({
            scope:this,
            'triggerclick':function (item, trigger, index, tag, e) {
                if (index == 0) {
                    this.focus().clearValue();
                    trigger.hide();
                    if (this.showIcon)
                        this.removeIconCls();                      
                    //..
                    this.fireEvent('clear', this);                                  
                };
            },
            'beforequery': function (queryEvent) {
                this.triggers[0][this.getRawValue().toString().length == 0 ? 'hide' : 'show']();
            },
            'select':function(item, record, index) {
                this.triggers[0].show();
                if (this.showIcon)
                    if (record.data.icon)
                        this.setIconCls('silk-'+record.data.icon.replace(/_/g,'-'));                
            },
        });
    },
    //.............................
    loadValue:function(instance){
        //..
        this.store.loadData(this.data);    
        //.
        this.clearValue();        
        //..
        var r = this.findRecord('id', val.id);   
        if (!Ext.isEmpty(r)) {
         this.setValueAndFireSelect(val.id);
        };
        //..
        this.enable();    
    },

    setValue:function(val){
      id = val;
      if (val.id) 
          id = val.id;
     // ...
     return Plext.form.ComboBoxLocal.superclass.setValue.call(this, id);
    },    
 
    getValue:function(kwargs){
     //..
     var val = Plext.form.ComboBoxLocal.superclass.getValue.call(this);  
     // ...
      id = val;        
      record = this.findRecord('id',id);
      if (record)
          val = record.data;
     // ...
     return val;
    },

});

Ext.reg('plext:form:comboboxlocal', Plext.form.ComboBoxLocal);




