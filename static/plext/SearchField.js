
Ext.ns('Plext.form');
Plext.form.SearchField = function (config) {
    this.addEvents(
        'clear',
        'select'
    );
    //..
    Plext.form.SearchField.superclass.constructor.call(this,config);     
};
Ext.extend(Plext.form.SearchField,Ext.form.TwinTriggerField, {
    initComponent : function(){
        //...
        Plext.form.SearchField.superclass.initComponent.call(this);
        //....
        this.on('specialkey', function(f, e){
            if(e.getKey() == e.ENTER){
                this.onTrigger2Click();
            }
        }, this);

    },

    validationEvent:false,
    validateOnBlur:false,
    trigger1Class:'x-form-clear-trigger',
    trigger2Class:'x-form-search-trigger',
    hideTrigger1:true,
    width:180,
    hasSearch : false,
    paramName : 'query',

    onTrigger1Click : function(){
        if(this.hasSearch){
            this.el.dom.value = '';
            this.triggers[0].hide();
            this.hasSearch = false;
            //..
            this.fireEvent('clear', this);              
        }
    },

    onTrigger2Click : function(){
        var v = this.getRawValue();
        if(v.length < 1){
            this.onTrigger1Click();
            return;
        }
        //..
        this.hasSearch = true;
        this.triggers[0].show();
        ///..
        this.fireEvent('select', this);          
    },
    
    clear:function(){
        this.setValue(null);                
    },       

});
Ext.reg('plext:form:searchfield', Plext.form.SearchField);
