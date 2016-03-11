Ext.namespace('Ext.ux.form');
Ext.ux.form.SuperBoxSelect = function(config) {
    Ext.ux.form.SuperBoxSelect.superclass.constructor.call(this,config);
    this.addEvents(
        'beforeadditem',
        'additem',
        'newitem',
        'beforeremoveitem',
        'removeitem',
        'clear'
    );
    
};
//..
Ext.ux.form.SuperBoxSelect = Ext.extend(Ext.ux.form.SuperBoxSelect,Ext.form.ComboBox,{
    mode: 'remote', 
    valueField: 'id',    
    hideTrigger      : true,
    resizable        : false,
    multiSelectMode  : false,
    preRenderValue   : null,    
    itemSelector: "tr.list-item",   
    forceSelection: false,   
    /**
    * @cfg {Boolean} pageSize
    * The number of records to display per page (defaults to <tt>10</tt>)
    */
    pageSize:10,
    //.. 

    initComponent:function() {
       //..
       Ext.apply(this, {
            items: new Ext.util.MixedCollection(false),
        });
        //..
        Ext.ux.form.SuperBoxSelect.superclass.initComponent.call(this);
    },

    //******************************** Render *********************************    
    
    autoSize : function(){
        if(!this.rendered){
            return this;
        }
        if(!this.metrics){
            this.metrics = Ext.util.TextMetrics.createInstance(this.el);
        }
        var el = this.el,
            v = el.dom.value,
            d = document.createElement('div');

        if(v === "" && this.emptyText && this.items.getCount() < 1){
            v = this.emptyText;
        }
        d.appendChild(document.createTextNode(v));
        v = d.innerHTML;
        d = null;
        v += "&#160;";
        var w = Math.max(this.metrics.getWidth(v) +  24, 24);
        if(typeof this._width != 'undefined'){
            w = Math.min(this._width, w);
        }
        this.el.setWidth(w);
        
        if(Ext.isIE){
            this.el.dom.style.top='0';
        }
        this.fireEvent('autosize', this, w);
        return this;
    },

    markInvalid : function(msg) {
        var elp, t;

        if (!this.rendered || this.preventMark ) {
            return;
        }
        this.outerWrapEl.addClass(this.invalidClass);
        msg = msg || this.invalidText;

        switch (this.msgTarget) {
            case 'qtip':
                Ext.apply(this.el.dom, {
                    qtip    : msg,
                    qclass  : 'x-form-invalid-tip'
                });
                Ext.apply(this.wrapEl.dom, {
                    qtip    : msg,
                    qclass  : 'x-form-invalid-tip'
                });
                if (Ext.QuickTips) { // fix for floating editors interacting with DND
                    Ext.QuickTips.enable();
                }
                break;
            case 'title':
                this.el.dom.title = msg;
                this.wrapEl.dom.title = msg;
                this.outerWrapEl.dom.title = msg;
                break;
            case 'under':
                if (!this.errorEl) {
                    elp = this.getErrorCt();
                    if (!elp) { // field has no container el
                        this.el.dom.title = msg;
                        break;
                    }
                    this.errorEl = elp.createChild({cls:'x-form-invalid-msg'});
                    this.errorEl.setWidth(elp.getWidth(true) - 20);
                }
                this.errorEl.update(msg);
                Ext.form.Field.msgFx[this.msgFx].show(this.errorEl, this);
                break;
            case 'side':
                if (!this.errorIcon) {
                    elp = this.getErrorCt();
                    if (!elp) { // field has no container el
                        this.el.dom.title = msg;
                        break;
                    }
                    this.errorIcon = elp.createChild({cls:'x-form-invalid-icon'});
                }
                this.alignErrorIcon();
                Ext.apply(this.errorIcon.dom, {
                    qtip    : msg,
                    qclass  : 'x-form-invalid-tip'
                });
                this.errorIcon.show();
                this.on('resize', this.alignErrorIcon, this);
                break;
            default:
                t = Ext.getDom(this.msgTarget);
                t.innerHTML = msg;
                t.style.display = this.msgDisplay;
                break;
        }
        this.fireEvent('invalid', this, msg);
    },
    clearInvalid : function(){
        if(!this.rendered || this.preventMark){ // not rendered
            return;
        }
        this.outerWrapEl.removeClass(this.invalidClass);
        switch(this.msgTarget){
            case 'qtip':
                this.el.dom.qtip = '';
                this.wrapEl.dom.qtip ='';
                break;
            case 'title':
                this.el.dom.title = '';
                this.wrapEl.dom.title = '';
                this.outerWrapEl.dom.title = '';
                break;
            case 'under':
                if(this.errorEl){
                    Ext.form.Field.msgFx[this.msgFx].hide(this.errorEl, this);
                }
                break;
            case 'side':
                if(this.errorIcon){
                    this.errorIcon.dom.qtip = '';
                    this.errorIcon.hide();
                    this.un('resize', this.alignErrorIcon, this);
                }
                break;
            default:
                var t = Ext.getDom(this.msgTarget);
                t.innerHTML = '';
                t.style.display = 'none';
                break;
        }
        this.fireEvent('valid', this);
    },
    alignErrorIcon : function(){
        if(this.wrap){
            this.errorIcon.alignTo(this.wrap, 'tl-tr', [Ext.isIE ? 5 : 2, 3]);
        }
    },    

    applyEmptyText : function(){
		this.setRawValue('');
        if(this.items.getCount() > 0){
            this.el.removeClass(this.emptyClass);
            this.setRawValue('');
            return this;
        }
        if(this.rendered && this.emptyText && this.getRawValue().length < 1){
            this.setRawValue(this.emptyText);
            this.el.addClass(this.emptyClass);
        }
        return this;
    },    
    //..
    //******************************** Buttons *********************************
    setupFieldButtons : function(){
        this.buttonWrap = this.outerWrapEl.createChild({
            cls: 'x-superboxselect-btns'
        });
        
        this.buttonClear = this.buttonWrap.createChild({
            tag:'div',
            cls: 'x-superboxselect-btn-clear ',
        });
        
        this.buttonExpand = this.buttonWrap.createChild({
            tag:'div',
            cls: 'x-superboxselect-btn-expand ',
        });
        
        this.initButtonEvents();
        
        return this;
    },
    //..
    initButtonEvents : function() {
        //..
        this.buttonClear.addClassOnOver('x-superboxselect-btn-over');
        this.buttonClear.addClassOnClick('x-superboxselect-btn-click');            
        this.buttonClear.on('click', function(e) {
            e.stopEvent();
            if (this.disabled) {
                return;
            }
            this.clearValue();
            this.el.focus();
        }, this);


        //..                    
        this.buttonExpand.addClassOnOver('x-superboxselect-btn-over');
        this.buttonExpand.addClassOnClick('x-superboxselect-btn-click');            
        this.buttonExpand.on('click', function(e) {
            e.stopEvent();
            if (this.disabled) {
                return;
            }
            this.onTriggerClick();
        }, this);

    },
    removeButtonEvents : function() {
        this.buttonClear.removeAllListeners();
        this.buttonExpand.removeAllListeners();
        //..
        return this;
    },

    manageClearBtn : function() {
        if (!this.rendered) {
            return this;
        };
        //..
        if (this.items.getCount() === 0) {
            this.buttonClear.addClass('x-superboxselect-btn-hide');
        } else {
            this.buttonClear.removeClass('x-superboxselect-btn-hide');
        }
        return this;
    },

    //******************************** Focus *********************************
    clearCurrentFocus : function(){
        if(this.currentFocus){
            this.currentFocus.onLnkBlur();
            this.currentFocus = null;
        }  
        return this;        
    },
    
    onFocus: function() {
        this.outerWrapEl.addClass(this.focusClass);

        Ext.ux.form.SuperBoxSelect.superclass.onFocus.call(this);
    },

    onBlur: function() {
        this.outerWrapEl.removeClass(this.focusClass);

        this.clearCurrentFocus();

        if (this.el.dom.value !== '') {
            this.applyEmptyText();
            this.autoSize();
        }

        Ext.ux.form.SuperBoxSelect.superclass.onBlur.call(this);
    },

    beforeBlur : function(){
//        this.assertValue();
    },


    //******************************** Events *********************************    
    initEvents : function() {
        var el = this.el;
        el.on({
            click   : this.onClick,
            focus   : this.clearCurrentFocus,
            blur    : this.onBlur,
            keydown : this.onKeyDownHandler,
            keyup   : this.onKeyUpBuffered,
            scope   : this
        });

        this.on({
            collapse: this.onCollapse,
            expand: this.clearCurrentFocus,
            scope: this
        });

        this.wrapEl.on('click', this.onWrapClick, this);
        this.outerWrapEl.on('click', this.onWrapClick, this);
        
        this.inputEl.focus = function() {
            el.focus();
        };

        Ext.ux.form.SuperBoxSelect.superclass.initEvents.call(this);

        Ext.apply(this.keyNav, {
            tab: function(e) {
                if (this.fixFocusOnTabSelect && this.isExpanded()) {
                    e.stopEvent();
                    el.blur();
                    this.onViewClick(false);
                    this.focus(false, 10);
                    return true;
                }

                this.onViewClick(false);
                if (el.dom.value !== '') {
                    this.setRawValue('');
                }

                return true;
            },

            down: function(e) {
                if (!this.isExpanded() && !this.currentFocus) {
                    this.onTriggerClick();
                } else {
                    this.inKeyMode = true;
                    this.selectNext();
                }
            },

            enter: function(e){
                if (this.isExpanded()) {
                    e.stopEvent();
                    el.blur();
                    this.onViewClick(false);
                    this.focus(false, 10);
                    return true;
                }                
            }
        });
    },

    onRender:function(ct, position) {
    	var h = this.hiddenName;
    	this.hiddenName = null;
        Ext.ux.form.SuperBoxSelect.superclass.onRender.call(this, ct, position);
        this.hiddenName = h;
        //...

        this.el.removeClass('x-form-text').addClass('x-superboxselect-input-field');
        
        this.wrapEl = this.el.wrap({
            tag : 'ul'
        });
        
        this.outerWrapEl = this.wrapEl.wrap({
            tag : 'div',
            cls: 'x-form-text x-superboxselect x-superboxselect-display-btns'
        });
       
        this.inputEl = this.el.wrap({
            tag : 'li',
            cls : 'x-superboxselect-input'
        });
        

        this.setupFieldButtons().manageClearBtn();

        
    },

    onClick: function() {
        this.clearCurrentFocus();
        this.collapse();
        this.autoSize();
    },

    onWrapClick: function(e) {
        e.stopEvent();
        this.collapse();
        this.el.focus();
        this.clearCurrentFocus();
    },

    onResize : function(w, h, rw, rh) {
//        var reduce = Ext.isIE6 ? 4 : Ext.isIE7 ? 1 : Ext.isIE8 ? 1 : 0;
//        if(this.wrapEl){
//            this._width = w;
//            this.outerWrapEl.setWidth(w - reduce);
//            //..buttons
//            reduce += (this.buttonWrap.getWidth() + 20);
//            this.wrapEl.setWidth(w - reduce);

//        }
        Ext.ux.form.SuperBoxSelect.superclass.onResize.call(this, w, h, rw, rh);
        this.autoSize();
    },    

    onEnable: function(){
        Ext.ux.form.SuperBoxSelect.superclass.onEnable.call(this);
        this.items.each(function(item){
            item.enable();
        });
        //..buttons
        this.initButtonEvents();

    },
    onDisable: function(){
        Ext.ux.form.SuperBoxSelect.superclass.onDisable.call(this);
        this.items.each(function(item){
            item.disable();
        });
        //..buttons
        this.removeButtonEvents();

    },

    onKeyUp : function(e) {
        if (this.editable !== false && (!e.isSpecialKey() || e.getKey() === e.BACKSPACE) && (!e.hasModifier() || e.shiftKey)) {
            this.lastKey = e.getKey();
            this.dqTask.delay(this.queryDelay);
        }        
    },
    onKeyDownHandler : function(e,t) {
        //..
        var toDestroy,nextFocus,idx;
        
        if(e.getKey() === e.ESC){
            if(!this.isExpanded()){
                if(this.el.dom.value != '' && (this.clearOnEscape || this.clearLastQueryOnEscape)){
                    if(this.clearOnEscape){
                        this.el.dom.value = '';    
                    }
                    if(this.clearLastQueryOnEscape){
                        this.lastQuery = '';    
                    }
                    e.stopEvent();
                }
            }
        }
        if ((e.getKey() === e.DELETE || e.getKey() === e.SPACE) && this.currentFocus){
            e.stopEvent();
            toDestroy = this.currentFocus;
            this.on('expand',function(){this.collapse();},this,{single: true});
            idx = this.items.indexOfKey(this.currentFocus.key);
            this.clearCurrentFocus();
            
            if(idx < (this.items.getCount() -1)){
                nextFocus = this.items.itemAt(idx+1);
            }
            
            toDestroy.preDestroy(true);
            if(nextFocus){
                (function(){
                    nextFocus.onLnkFocus();
                    this.currentFocus = nextFocus;
                }).defer(200,this);
            }
        
            return true;
        }
        
        var val = this.el.dom.value, it, ctrl = e.ctrlKey;
        
        if(val !== '') {
            this.autoSize();
            return;
        }
        
        //select first item
        if(e.getKey() === e.HOME){
            e.stopEvent();
            if(this.items.getCount() > 0){
                this.collapse();
                it = this.items.get(0);
                it.el.focus();
                
            }
            return true;
        }

        //backspace remove
        if(e.getKey() === e.BACKSPACE){
            //..
            e.stopEvent();
            if(this.currentFocus) {
                toDestroy = this.currentFocus;
                this.on('expand',function(){
                    this.collapse();
                },this,{single: true});
                
                idx = this.items.indexOfKey(toDestroy.key);
                
                this.clearCurrentFocus();
                if(idx < (this.items.getCount() -1)){
                    nextFocus = this.items.itemAt(idx+1);
                }
                
                toDestroy.preDestroy(true);
                
                if(nextFocus){
                    (function(){
                        nextFocus.onLnkFocus();
                        this.currentFocus = nextFocus;
                    }).defer(200,this);
                }
                
                return;
            }else{
                it = this.items.get(this.items.getCount() -1);
                if(it){
                    this.on('expand',function(){this.collapse();},this,{single: true});
                    it.preDestroy(true);
                };
                return true;
            }
        }
        
        if(!e.isNavKeyPress()){
//            this.multiSelectMode = false;
            this.clearCurrentFocus();
            return;
        }
        //arrow nav
        if(e.getKey() === e.LEFT || (e.getKey() === e.UP && !this.isExpanded())){
            e.stopEvent();
            this.collapse();
            //get last item
            it = this.items.get(this.items.getCount()-1);
            if(this.navigateItemsWithTab){ 
                //focus last el
                if(it){
                    it.focus(); 
                }
            }else{
                //focus prev item
                if(this.currentFocus){
                    idx = this.items.indexOfKey(this.currentFocus.key);
                    this.clearCurrentFocus();
                    
                    if(idx !== 0){
                        this.currentFocus = this.items.itemAt(idx-1);
                        this.currentFocus.onLnkFocus();
                    }
                }else{
                    this.currentFocus = it;
                    if(it){
                        it.onLnkFocus();
                    }
                }
            }
            return true;
        }
        if(e.getKey() === e.DOWN){
            if(this.currentFocus){
                this.collapse();
                e.stopEvent();
                idx = this.items.indexOfKey(this.currentFocus.key);
                if(idx == (this.items.getCount() -1)){
                    this.clearCurrentFocus.defer(10,this);
                }else{
                    this.clearCurrentFocus();
                    this.currentFocus = this.items.itemAt(idx+1);
                    if(this.currentFocus){
                        this.currentFocus.onLnkFocus();
                    }
                }
                return true;
            }
        }
        if(e.getKey() === e.RIGHT){
            this.collapse();
            it = this.items.itemAt(0);
            if(this.navigateItemsWithTab){ 
                //focus first el
                if(it){
                    it.focus(); 
                }
            }else{
                if(this.currentFocus){
                    idx = this.items.indexOfKey(this.currentFocus.key);
                    this.clearCurrentFocus();
                    if(idx < (this.items.getCount() -1)){
                        this.currentFocus = this.items.itemAt(idx+1);
                        if(this.currentFocus){
                            this.currentFocus.onLnkFocus();
                        }
                    }
                }else{
                    this.currentFocus = it;
                    if(it){
                        it.onLnkFocus();
                    }
                }
            }
        }
    },
    
    onKeyUpBuffered : function(e){
        if(!e.isNavKeyPress()){
            this.autoSize();
        }
    },

    onCollapse: function() {
    	this.view.clearSelections();
    },    
    //..
    onSelect : function(record, index) {
    	if (this.fireEvent('beforeselect', this, record, index) == false) return;
        if (this.fireEvent('beforeadditem',this,record) == false) return ;
        //..
        this.addItem(record.data);
        this.store.remove(record);                    
        //..
        if(this.store.getCount() === 0){
            this.collapse();
        }else{
            this.restrictHeight();
        };
        //..
        this.fireEvent('select', this, record, index);
    },
    ///.
    onDestroy : function() {
        this.items.purgeListeners();
        this.killItems();
        //..
        Ext.destroy(
            this.buttonExpand,
            //...        
            this.buttonClear,
            this.buttonWrap,
            //..        
            this.inputEl,
            this.wrapEl,
            this.outerWrapEl
        );

        Ext.ux.form.SuperBoxSelect.superclass.onDestroy.call(this);
    },

    //******************************** List *********************************    
    expand : function(){
        if (this.isExpanded() || !this.hasFocus) {
            return;
        }
        if(this.bufferSize){
            this.doResize(this.bufferSize);
            delete this.bufferSize;
        }
        this.list.alignTo(this.outerWrapEl, this.listAlign).show();
        this.innerList.setOverflow('auto'); // necessary for FF 2.0/Mac
        this.mon(Ext.getDoc(), {
            scope: this,
            mousewheel: this.collapseIf,
            mousedown: this.collapseIf
        });
        //...
        this.lastQuery = null;        
        //..
        this.fireEvent('expand', this);
    },

    restrictHeight : function(){
        var inner = this.innerList.dom,
            st = inner.scrollTop, 
            list = this.list;
        
        inner.style.height = '';
        
        var pad = list.getFrameWidth('tb')+(this.resizable?this.handleHeight:0)+this.assetHeight,
            h = Math.max(inner.clientHeight, inner.offsetHeight, inner.scrollHeight),
            ha = this.getPosition()[1]-Ext.getBody().getScroll().top,
            hb = Ext.lib.Dom.getViewHeight()-ha-this.getSize().height,
            space = Math.max(ha, hb, this.minHeight || 0)-list.shadowOffset-pad-5;
        
        h = Math.min(h, space, this.maxHeight);
        this.innerList.setHeight(h);

        list.beginUpdate();
        list.setHeight(h+pad);
        list.alignTo(this.outerWrapEl, this.listAlign);
        list.endUpdate();
        
    },

    //******************************** Items *****************************    
    getCaption: function(obj){
        return this.displayFieldTpl.apply(obj);
    },

    //..        
    addItem : function(obj) {
        //...
        var box = new Ext.ux.form.SuperBoxSelectItem({
            owner: this,
            disabled: this.disabled,
            renderTo: this.wrapEl,
            caption: this.getCaption(obj),
            value:  obj,
            key: obj[this.valueField],
            listeners: {
                scope: this,
                remove: this.removeItem,
                destroy: this.destroyItem,
            }
        });

        // console.log(obj);
        this.extraAddItem(obj,box);
        //..
        box.render();
        //..        
        this.items.add(box.key,box);
        this.setBaseParams();
        //..
        this.applyEmptyText().autoSize().manageClearBtn().validateValue();        
        //..
        this.fireEvent('additem', this, obj);
    },

    extraAddItem:function(obj,box){
        // pass
    },

    removeItem: function(item){
        //...
        if(this.fireEvent('beforeremoveitem',this,item.value) === false) return;
        //..
        this.items.removeKey(item.key);
        this.setBaseParams();        
        //..
        if(!this.preventMultipleRemoveEvents){
        	this.fireEvent.defer(250,this,['removeitem',this,item.value]);
        }
    },

    destroyItem: function(){
        this.collapse();
        this.autoSize().manageClearBtn().validateValue();
    },
    
    removeAllItems: function(){
        //...
    	this.items.each(function(item){
            item.preDestroy(true);
        },this);
        //..
        this.manageClearBtn();
        return this;
    },
    
    killItems : function(){
        //..
    	this.items.each(function(item){
            item.kill();
        },this);
        this.items.clear();
        //..
        this.manageClearBtn();
        return this;
    },

    reset :  function(){
    	this.killItems();
    	this.setBaseParams();
        Ext.ux.form.SuperBoxSelect.superclass.reset.call(this);
        //...
        this.autoSize().setRawValue('');
    },

    getCount : function() {
        return this.items.getCount();
    },
    
    //******************************** Value *********************************    
    validateValue: function(val){
        if(this.items.getCount() === 0){
             if(this.allowBlank){
                 this.clearInvalid();
                 return true;
             }else{
                 this.markInvalid(this.blankText);
                 return false;
             }
        }
        this.clearInvalid();
        return true;
    },

    getValue : function() {
        return this.items.getRange().map(function(item){
            return item.value;
        });
    },

     
    setValue : function(values){
        if(!this.rendered) return;
        //.
        this.removeAllItems();
        //..
        Ext.each(values,function(item){
            this.addItem(item)            
        },this);
        //..
    	this.setBaseParams();        
        this.fireEvent("select",this);    	
    },
    
    //..
    clearValue : function(supressRemoveEvent){
        //..
        Ext.ux.form.SuperBoxSelect.superclass.clearValue.call(this);
        //...
        this.preventMultipleRemoveEvents = false;        
    	this.removeAllItems();
    	this.preventMultipleRemoveEvents = false;
        this.fireEvent('clear',this);
        return this;
    },

    //******************************** store *********************************    
    setBaseParams:function(){
        Ext.apply(this.store.baseParams,{
            exclude:this.items.getRange().map(function(item){return item.value.id}),
        });         
    },

});
Ext.reg('superboxselect', Ext.ux.form.SuperBoxSelect);







Ext.ux.form.SuperBoxSelectItem = Ext.extend(Ext.Component, {


    //****************************** el ***********************************            
    onElClick : function(e){
        //..
        var o = this.owner;
        o.clearCurrentFocus().collapse();
        o.el.dom.focus();
        //..
        (function(){
            this.onLnkFocus();
            o.currentFocus = this;
        }).defer(10,this);

    },

    //********************************** lnk *******************************            
    onLnkClick : function(e){
        //...
        if(e) {
            e.stopEvent();
        }
        this.preDestroy();
        this.owner.el.focus();
    },

    onLnkFocus : function(){
        this.el.addClass("x-superboxselect-item-focus");
        this.owner.outerWrapEl.addClass("x-form-focus");
    },

    onLnkBlur : function(){
        this.el.removeClass("x-superboxselect-item-focus");
        this.owner.outerWrapEl.removeClass("x-form-focus");
    },
    
    //*********************************** listeners ******************************        
    enableElListeners : function() {
        this.el.on('click', this.onElClick, this, {stopEvent:true});
        this.el.addClassOnOver('x-superboxselect-item-hover');
    },    
    enableLnkListeners : function() {
        this.lnk.on({
            click: this.onLnkClick,
            focus: this.onLnkFocus,
            blur:  this.onLnkBlur,
            scope: this,
        });
    },
    enableAllListeners : function() {
        this.enableElListeners();
        this.enableLnkListeners();
    },
    disableAllListeners : function() {
        this.el.removeAllListeners();
        this.lnk.un('click', this.onLnkClick, this);
        this.lnk.un('focus', this.onLnkFocus, this);
        this.lnk.un('blur', this.onLnkBlur, this);
    },
    
    
    //*****************************************************************        
    onRender : function(ct, position){
        Ext.ux.form.SuperBoxSelectItem.superclass.onRender.call(this, ct, position);
        
        var el = this.el;

        if(el) el.remove();
        
        el = this.el = ct.createChild({
            'tag':'li'
        }, ct.last());
        el.addClass('x-superboxselect-item');
        
        Ext.apply(el, {
            focus: function(){
                var c = this.down('span.x-superboxselect-item-close');
                if(c){
                    c.focus();
                }
            },
            preDestroy: function(){
                this.preDestroy();
            }.createDelegate(this)
        });
        
        this.enableElListeners();

        el.update(this.caption);

        this.lnk = el.createChild({
            'tag': 'span',
            'class': 'x-superboxselect-item-close',
            'tabIndex' : '-1'
        });
        
        
        if(!this.disabled) {
            this.enableLnkListeners();
        }else {
            this.disableAllListeners();
        }        

        //..      
        this.on({
            disable: this.disableAllListeners,
            enable: this.enableAllListeners,
            scope: this
        });

        this.setupKeyMap();
    },
    onDisable : function() {
//    	if(this.hidden){
//    	    this.hidden.dom.setAttribute('disabled', 'disabled');
//    	}
    	this.keyMap.disable();
    	Ext.ux.form.SuperBoxSelectItem.superclass.onDisable.call(this);
    },
    onEnable : function() {
//    	if(this.hidden){
//    	    this.hidden.dom.removeAttribute('disabled');
//    	}
    	this.keyMap.enable();
    	Ext.ux.form.SuperBoxSelectItem.superclass.onEnable.call(this);
    },
    onDestroy : function() {
        Ext.destroy(
            this.lnk,
            this.el
        );
        
        Ext.ux.form.SuperBoxSelectItem.superclass.onDestroy.call(this);
    },

    //*****************************************************************        
    setupKeyMap : function(){
        this.keyMap = new Ext.KeyMap(this.lnk, [{
            key: [
                Ext.EventObject.BACKSPACE, 
                Ext.EventObject.DELETE, 
                Ext.EventObject.SPACE
            ],
            fn: this.preDestroy,
            scope: this
        },{
            key: [
                Ext.EventObject.RIGHT,
                Ext.EventObject.DOWN
            ],
            fn: function(){
                this.moveFocus('right');
            },
            scope: this
        },{
            key: [Ext.EventObject.LEFT,Ext.EventObject.UP],
            fn: function(){
                this.moveFocus('left');
            },
            scope: this
        },{
            key: [Ext.EventObject.HOME],
            fn: function(){
                var l = this.owner.items.get(0).el.focus();
                if(l){
                    l.el.focus();
                }
            },
            scope: this
        },{
            key: [Ext.EventObject.END],
            fn: function(){
                this.owner.el.focus();
            },
            scope: this
        },{
            key: Ext.EventObject.ENTER,
            fn: function(){
            },
        }]);
        this.keyMap.stopEvent = true;
    },
    moveFocus : function(dir) {
        var el = this.el[dir == 'left' ? 'prev' : 'next']() || this.owner.el;
	    el.focus.defer(100,el);
    },

    preDestroy : function(supressEffect) {
    	if(this.fireEvent('remove', this) === false){
	    	return;
	    }	
    	var actionDestroy = function(){
            this.destroy();
        };
        
        if(supressEffect){
            actionDestroy.call(this);
        } else {
            this.el.hide({
                duration: 0.2,
                callback: actionDestroy,
                scope: this
            });
        }
        return this;
    },
    kill : function(){
        ///.
        this.purgeListeners();
        this.destroy();
    },

    
});
