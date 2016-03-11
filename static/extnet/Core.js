Ext.ns('Ext.net');


____StringUtils = {'____':''};
//------------------------------------------------------------------------------
Ext.net.StringUtils = function () {
    return {
        startsWith: function (str, value) {
            return str.match("^" + value) !== null;
        },
        endsWith: function (str, value) {
            return str.match(value + "$") !== null;
        }
    };
}();


____Field = {'____':''};
//------------------------------------------------------------------------------
Ext.form.Field.override({
    clear: function () {
        this.setValue("");
    },
});


____FormPanel = {'____':''};
//------------------------------------------------------------------------------
Ext.form.BasicForm.override({
    getValues: function (asString) {
        var isForm = !Ext.isEmpty(this.el.dom.elements),
            fs = Ext.lib.Ajax.serializeForm(isForm ? this.el.dom : this.el.up("form").dom, isForm ? undefined : this.el);
        if (asString === true) {
            return fs;
        }
        return Ext.urlDecode(fs);
    },
    getFieldValues: function (dirtyOnly, keyField) {
        var o = {},
            n, key, val, addField = function (f) {
                if (dirtyOnly !== true || f.isDirty()) {
                    n = keyField ? f[keyField] : f.getName();
                    key = o[n];
                    val = f.getValue();
                    if (Ext.isDefined(key)) {
                        if (Ext.isArray(key)) {
                            o[n].push(val);
                        } else {
                            o[n] = [key, val];
                        }
                    } else {
                        o[n] = val;
                    }
                }
            };
        this.items.each(function (f) {
            if (f.isComposite && f.eachItem) {
                f.eachItem(function (cf) {
                    addField(cf);
                });
            } else {
                addField(f);
            }
        });
        return o;
    },
    findField: function (id) {
        var field = this.items.get(id);
        if (!Ext.isObject(field)) {
            var findMatchingField = function (f) {
                if (f.isFormField) {
                    if (f.dataIndex === id || f.id === id || f.getName() === id || f.name === id) {
                        field = f;
                        return false;
                    } else if ((f.isComposite && f.rendered) || (f instanceof Ext.form.CheckboxGroup && f.items)) {
                        return f.items.each(findMatchingField);
                    }
                }
            };
            this.items.each(findMatchingField);
        }
        return field || null;
    },
    updateRecord: function (record) {
        record.beginEdit();
        var fs = record.fields;
        fs.each(function (f) {
            var field = this.findField(f.name);
            if (field) {
                var value = field.getValue();
                if (value && value.getGroupValue) {
                    value = value.getGroupValue();
                } else if (field.eachItem && field.arrayedValue) {
                    value = [];
                    field.eachItem(function (item) {
                        value.push(item.getValue());
                    });
                }
                record.set(f.name, value);
            }
        }, this);
        record.endEdit();
        return this;
    }
});

//------------------------------------------------------------------------------
Ext.form.FormPanel.override({
    initComponent: function () {
        this.form = this.createForm();
        this.bodyCfg = {
            tag: "form",
            cls: this.baseCls + "-body",
            method: this.method || "POST",
            id: this.formId || Ext.id()
        };
        if (this.fileUpload) {
            this.bodyCfg.enctype = "multipart/form-data";
        }
        if (this.renderFormElement === false) {
            this.bodyCfg.tag = "div";
        }
        Ext.FormPanel.superclass.initComponent.call(this);
        this.initItems();
        this.addEvents("clientvalidation");
        this.relayEvents(this.form, ["beforeaction", "actionfailed", "actioncomplete"]);
    },
    createElement: function (name, pnode) {
        if ((name === "body" || this.elements.indexOf(name) !== -1) && this[name + "Cfg"]) {
            if (this[name + "Cfg"].tag === "form" && Ext.fly(pnode).up("form")) {
                this[name + "Cfg"].tag = "div";
            }
        }
        Ext.FormPanel.superclass.createElement.apply(this, arguments);
    },
    bindHandler: function () {
        var valid = true;
        this.form.items.each(function (f) {
            if (f.isValid && !f.isValid(true)) {
                valid = false;
                return false;
            }
        });
        if (this.fbar) {
            var fitems = this.fbar.items.items,
                i = 0,
                len;
            for (i, len = fitems.length; i < len; i++) {
                var btn = fitems[i];
                if (btn.formBind === true && btn.disabled === valid) {
                    btn.setDisabled(!valid);
                }
            }
        }
        this.fireEvent("clientvalidation", this, valid);
    },
    isValid: function () {
        return this.getForm().isValid();
    },
    validate: function () {
        return this.getForm().isValid();
    },
    isDirty: function () {
        return this.getForm().isDirty();
    },
    getName: function () {
        return this.id || '';
    },
    clearInvalid: function () {
        return this.getForm().clearInvalid();
    },
    markInvalid: function (msg) {
        return this.getForm().markInvalid(msg);
    },
    getValue: function () {
        return this.getForm().getValues();
    },
    setValue: function (value) {
        return this.getForm().setValues(value);
    },
    reset: function () {
        return this.getForm().reset();
    }
});



____TextField = {'____':''};
//------------------------------------------------------------------------------
Ext.form.TextField.prototype.initComponent = Ext.form.TextField.prototype.initComponent.createSequence(function () {
    this.addEvents("iconclick");
    this.setIconClass = this.setIconCls;
});
Ext.override(Ext.form.TextField, {
    truncate: true,
    afterRender: function () {
        Ext.form.TextField.superclass.afterRender.call(this);
        if (this.maxLength !== Number.MAX_VALUE && this.truncate === true) {
            this.setMaxLength(this.maxLength);
        }
        if (this.iconCls) {
            this.setIconCls(this.iconCls);
        }
    },
    setMaxLength: function (val) {
        this.el.dom.setAttribute("maxlength", val);
        this.maxLength = val;
    },
    isIconIgnore: function () {
        return !!this.el.up(".x-menu-list-item");
    },
    renderIconEl: function () {
        if (!this.wrap) {
            this.wrap = this.el.wrap();
            this.positionEl = this.wrap;
        }
        this.wrap.addClass("x-form-field-wrap");
        this.wrap.applyStyles({
            position: "relative"
        });
        this.el.addClass("x-textfield-icon-input");
        this.icon = Ext.DomHelper.append(this.el.up("div.x-form-field-wrap") || this.wrap, {
            tag: "div",
            style: "position:absolute"
        }, true);
        if (this.initialConfig.width) {
            delete this.lastSize;
            this.setWidth(this.initialConfig.width);
        }
        this.icon.on("click", function (e, t) {
            this.fireEvent("iconclick", this, e, t);
        }, this);
    },
    setIconCls: function (iconCls) {
        if (this.isIconIgnore()) {
            return;
        }
        if (!this.icon) {
            this.renderIconEl();
            this.on("hide", function () {
                this.icon.hide();
            });
            this.on("show", function () {
                this.icon.show();
            });
        }
        this.iconCls = iconCls;
        this.icon.dom.className = "x-textfield-icon " + iconCls;
        if (this.hidden) {
            this.icon.hide();
            this.on("show", function () {
                this.syncSize();
            }, this, {
                single: true
            });
        } else {
            this.syncSize();
        }
    },
    removeIconCls:function(){
        if (this.isIconIgnore()) return;
        if (!this.icon) return;    
        //...
        this.icon.hide();
        this.el.removeClass('x-textfield-icon-input'); 
        this.icon.un('click');
        delete this.icon;       
    },
//    filterKeys: function (e) {
//        if (e.ctrlKey) {
//            return;
//        }
//        var k = e.getKey();
//        if ((Ext.isGecko || Ext.isOpera) && (e.isNavKeyPress() || k === e.BACKSPACE || (k === e.DELETE && e.button === -1))) {
//            return;
//        }
//        var cc = String.fromCharCode(e.getCharCode());
//        if (!Ext.isGecko && !Ext.isOpera && e.isSpecialKey() && !cc) {
//            return;
//        }
//        if (!this.maskRe.test(cc)) {
//            e.stopEvent();
//        }
//    }
});


____TriggerField = {'____':''};
//------------------------------------------------------------------------------
Ext.form.TriggerField.override({
    standardTrigger: true,
    checkTab: function (e, me) {
        if (!e.getKey) {
            var t = e;
            e = me;
            me = t;
        }
        if (e.getKey() === e.TAB && !this.inEditor) {
            this.triggerBlur();
        }
    },
    getTriggerWidth: function () {
        var tw = this.trigger.getWidth(),
            noTrigger = true;
        if (tw < 1) {
            tw = 0;
            Ext.each(this.triggers, function (t) {
                if (t.dom.style.display !== "none") {
                    noTrigger = false;
                    tw += this.defaultTriggerWidth;
                }
            }, this);
            if (this.trigger && noTrigger) {
                if (this.trigger.dom.style.display !== "none") {
                    noTrigger = false;
                    tw += this.defaultTriggerWidth;
                }
            }
            if (noTrigger) {
                return 0;
            }
        }
        return tw;
    },
    getNoteWidthAjustment: function () {
        return this.getTriggerWidth();
    },
    initComponent: function () {
        Ext.form.TriggerField.superclass.initComponent.call(this);
        this.addEvents("triggerclick");
        if (this.triggersConfig) {
            var cn = [],
                triggerCfg, isSimple, i = 0;
            for (i; i < this.triggersConfig.length; i++) {
                var trigger = this.triggersConfig[i],
                    triggerIcon = trigger.iconCls || this.triggerClass;
                triggerCfg = {
                    "ext:tid": trigger.tag || "",
                    tag: "img",
                    "ext:qtip": trigger.qtip || "",
                    src: Ext.BLANK_IMAGE_URL,
                    cls: "x-form-trigger" + (trigger.triggerCls || "") + " " + triggerIcon
                };
                if (Ext.net.StringUtils.startsWith(triggerIcon || "", "x-form-simple")) {
                    if (i !== 0 || this.shiftLastSimpleIcon) {
                        triggerCfg.cls += " shift-trigger";
                    }
                    isSimple = true;
                }
                if (trigger.hideTrigger) {
                    Ext.apply(triggerCfg, {
                        style: "display:none",
                        hidden: true
                    });
                }
                cn.push(triggerCfg);
            }
            if (this.standardTrigger) {
                triggerCfg = {
                    tag: "img",
                    src: Ext.BLANK_IMAGE_URL,
                    cls: "x-form-trigger"
                };
                if (!Ext.isEmpty(this.triggerClass, false)) {
                    triggerCfg.cls += " " + this.triggerClass;
                }
                if (Ext.net.StringUtils.startsWith(this.triggerClass || "", "x-form-simple")) {
                    triggerCfg.cls += " shift-trigger";
                    isSimple = true;
                }
                if (this.hideTrigger) {
                    Ext.apply(triggerCfg, {
                        style: "display:none",
                        hidden: true
                    });
                    this.hideTrigger = false;
                }
                if (this.firstBaseTrigger) {
                    cn.splice(0, 0, triggerCfg);
                } else {
                    cn.push(triggerCfg);
                }
            }
            if (isSimple) {
                this.addClass("clear-right");
            }
            this.triggerConfig = {
                tag: "span",
                cls: "x-form-twin-triggers",
                cn: cn
            };
        }
        if (Ext.isEmpty(this.triggersConfig) && Ext.net.StringUtils.startsWith(this.triggerClass || "", "x-form-simple")) {
            this.addClass("clear-right");
        }
    },
    getTrigger: function (index) {
        return this.triggers[index];
    },
    initTrigger: function () {
        if (!this.triggersConfig) {
            this.mon(this.trigger, "click", this.onTriggerClick, this, {
                preventDefault: true
            });
            this.trigger.addClassOnOver("x-form-trigger-over");
            this.trigger.addClassOnClick("x-form-trigger-click");
            return;
        }
        var ts = this.trigger.select(".x-form-trigger", true),
            triggerField = this;
        this.wrap.setStyle("overflow", "hidden");
        ts.each(function (t, all, index, length) {
            t.hide = function () {
                var w = triggerField.wrap.getWidth();
                if (w === 0) {
                    w = triggerField.wrap.getStyleSize().width;
                }
                this.hidden = true;
                this.dom.style.display = "none";
                triggerField.el.setWidth(w - triggerField.getTriggerWidth());
            };
            t.show = function () {
                var w = triggerField.wrap.getWidth();
                if (w === 0) {
                    w = triggerField.wrap.getStyleSize().width || 0;
                }
                this.dom.style.display = "";
                this.dom.removeAttribute("hidden");
                this.hidden = false;
                triggerField.el.setWidth(w - triggerField.getTriggerWidth());
            };
            if ((this.firstBaseTrigger && index === 0) || (!this.firstBaseTrigger && index === (all.getCount() - 1))) {
                t.on("click", this.onTriggerClick, this);
            } else {
                t.on("click", this.onCustomTriggerClick, this, {
                    index: index,
                    t: t,
                    tag: t.getAttributeNS("ext", "tid"),
                    preventDefault: true
                });
            }
            t.addClassOnOver("x-form-trigger-over");
            t.addClassOnClick("x-form-trigger-click");
        }, this);
        this.triggers = ts.elements;
    },
    onCustomTriggerClick: function (evt, el, o) {
        if (!this.disabled) {
            this.fireEvent("triggerclick", this, o.t, o.index, o.tag, evt);
        }
    },
    initDefaultWidth: function () {
        if (!this.width) {
            var w = this.el.getWidth(),
                tw = this.getTriggerWidth();
            if (w < 1) {
                w = 90 - tw;
                this.el.setWidth(w);
            }
            this.wrap.setWidth(w + tw);
        }
    },
    onRender: function (ct, position) {
        this.doc = Ext.isIE ? Ext.getBody() : Ext.getDoc();
        Ext.form.TriggerField.superclass.onRender.call(this, ct, position);
        this.wrap = this.el.wrap({
            cls: "x-form-field-wrap x-form-field-trigger-wrap"
        });
        this.trigger = this.wrap.createChild(this.triggerConfig || {
            tag: "img",
            src: Ext.BLANK_IMAGE_URL,
            cls: "x-form-trigger " + this.triggerClass
        });
        this.initTrigger();
        this.initDefaultWidth();
        this.resizeEl = this.positionEl = this.wrap;
        if (this.trigger && this.trigger.setStyle && Ext.isWebKit && this.note) {
            this.trigger.setStyle("position", "inherit");
            this.trigger.setStyle.defer(10, this.trigger, ["position", "absolute"]);
        }
    },
    removeTriggersWidth: function (w) {
        if (!Ext.isNumber(w) || w === 0) {
            return;
        }
        var tw = this.getTriggerWidth();
        if (Ext.isNumber(w)) {
            this.el.setWidth(w - tw);
        }
        this.wrap.setWidth((this.el.getWidth() || (w - tw)) + tw);
    },
    onResize: function (w, h) {
        Ext.form.TriggerField.superclass.onResize.call(this, w, h);
        this.removeTriggersWidth(w);
    },
    autoSize: function () {
        if (!this.grow || !this.rendered) {
            return;
        }
        if (!this.metrics) {
            this.metrics = Ext.util.TextMetrics.createInstance(this.el);
        }
        var el = this.el,
            v = el.dom.value,
            d = document.createElement("div");
        d.appendChild(document.createTextNode(v));
        v = d.innerHTML;
        Ext.removeNode(d);
        d = null;
        v += "&#160;";
        var w = Math.min(this.growMax, Math.max(this.metrics.getWidth(v) + 10, this.growMin)),
            tw = this.getTriggerWidth();
        this.el.setWidth(w);
        this.wrap.setWidth(w + tw);
        this.fireEvent("autosize", this, w + tw);
    }
});


//------------------------------------------------------------------------------
Ext.net.TriggerField =  function(){}
Ext.net.TriggerField = Ext.extend(Ext.form.TriggerField, {
    standardTrigger: false,
    initTrigger: function () {
        var ts = this.trigger.select(".x-form-trigger", true),
            triggerField = this;
        this.wrap.setStyle("overflow", "hidden");
        ts.each(function (t, all, index) {
            t.hide = function () {
                var w = triggerField.wrap.getWidth();
                this.dom.style.display = "none";
                triggerField.el.setWidth(w - triggerField.trigger.getWidth());
            };
            t.show = function () {
                var w = triggerField.wrap.getWidth();
                this.dom.style.display = "";
                this.dom.removeAttribute("hidden");
                triggerField.el.setWidth(w - triggerField.trigger.getWidth());
            };
            t.on("click", this.onCustomTriggerClick, this, {
                index: index,
                t: t,
                tag: t.getAttributeNS("ext", "tid"),
                preventDefault: true
            });
            t.addClassOnOver("x-form-trigger-over");
            t.addClassOnClick("x-form-trigger-click");
        }, this);
        this.triggers = ts.elements;
    }
});
Ext.reg("nettrigger", Ext.net.TriggerField);


____ComboBox = {'____':''};
//------------------------------------------------------------------------------
Ext.form.ComboBox.prototype.initComponent = Ext.form.ComboBox.prototype.initComponent.createSequence(function () {
    this.initMerge();
    if (!Ext.isEmpty(this.initSelectedIndex) && this.store) {
        this.setInitValueByIndex(this.initSelectedIndex);
    } else if (!Ext.isEmpty(this.value) && this.store) {
        this.setInitValue(this.value);
    }
});
Ext.form.ComboBox.prototype.onRender = Ext.form.ComboBox.prototype.onRender.createSequence(function (el) {
    if (this.submitValue !== false) {
        this.getEl().dom.setAttribute("name", this.uniqueName || this.id);
        this.getSelectionField().render(this.el.parent() || this.el);
    }
    this.on("focus", function (el) {
        this.oldValue = this.getValue();
        var t = this.getEl().dom.value ? this.getEl().dom.value.trim() : "";
        this.oldText = (t === this.emptyText) ? "" : t;
    });
});
Ext.form.ComboBox.prototype.initEvents = Ext.form.ComboBox.prototype.initEvents.createSequence(function () {
    this.keyNav.tab = function () {
        if (this.isExpanded() || this.inEditor) {
            this.onViewClick(false);
        }
    };
});
Ext.form.ComboBox.prototype.clearValue = Ext.form.ComboBox.prototype.clearValue.createSequence(function () {
    this.oldValue = null;
    this.oldText = null;
    this.getSelectionField().clear();
});
Ext.form.ComboBox.prototype.setValue = Ext.form.ComboBox.prototype.setValue.createSequence(function () {
    this.getSelectionField().setValue(this.getSelectedIndex());
});
Ext.form.ComboBox.override({
    alwaysMergeItems: true,
    forceSelection: true,
    displayTpl: new Ext.XTemplate('{name}'),            
    checkTab: function (e, me) {
        if (!e.getKey) {
            var t = e;
            e = me;
            me = t;
        }
        if (e.getKey() === e.TAB) {
            if (this.isExpanded()) {
                this.onViewClick(false);
            }
            if (!this.inEditor) {
                this.triggerBlur();
            }
        }
    },
    initMerge: function () {
        if (this.mergeItems) {
            if (this.store.getCount() > 0) {
                this.doMerge();
            }
            if (this.store.getCount() === 0 || this.alwaysMergeItems) {
                this.store.on("load", this.doMerge, this, {
                    single: !this.alwaysMergeItems
                });
            }
        }
    },
    doMerge: function () {
        var mi;
        for (mi = this.mergeItems.getCount() - 1; mi > -1; mi--) {
            var f = this.store.recordType.prototype.fields,
                dv = [],
                i = 0;
            for (i; i < f.length; i++) {
                dv[f.items[i].name] = f.items[i].defaultValue;
            }
            if (!Ext.isEmpty(this.displayField, false)) {
                dv[this.displayField] = this.mergeItems.getAt(mi).data.text;
            }
            if (!Ext.isEmpty(this.valueField, false) && this.displayField !== this.valueField) {
                dv[this.valueField] = this.mergeItems.getAt(mi).data.value;
            }
            this.store.insert(0, new this.store.recordType(dv));
        }
    },
    addRecord: function (values) {
        var rowIndex = this.store.data.length,
            record = this.insertRecord(rowIndex, values);
        return {
            index: rowIndex,
            record: record
        };
    },
    addItem: function (text, value) {
        var rowIndex = this.store.data.length,
            record = this.insertItem(rowIndex, text, value);
        return {
            index: rowIndex,
            record: record
        };
    },
    insertRecord: function (rowIndex, values) {
        this.store.clearFilter(true);
        values = values || {};
        var f = this.store.recordType.prototype.fields,
            dv = {},
            i = 0;
        for (i; i < f.length; i++) {
            dv[f.items[i].name] = f.items[i].defaultValue;
        }
        var record = new this.store.recordType(dv, values[this.store.metaId()]),
            v;
        this.store.insert(rowIndex, record);
        for (v in values) {
            record.set(v, values[v]);
        }
        if (!Ext.isEmpty(this.store.metaId())) {
            record.set(this.store.metaId(), record.id);
        }
        return record;
    },
    insertItem: function (rowIndex, text, value) {
        var f = this.store.recordType.prototype.fields,
            dv = {},
            i = 0;
        for (i; i < f.length; i++) {
            dv[f.items[i].name] = f.items[i].defaultValue;
        }
        if (!Ext.isEmpty(this.displayField, false)) {
            dv[this.displayField] = text;
        }
        if (!Ext.isEmpty(this.valueField, false) && this.displayField !== this.valueField) {
            dv[this.valueField] = value;
        }
        var record = new this.store.recordType(dv);
        this.store.insert(rowIndex, record);
        return record;
    },
    removeByField: function (field, value) {
        var index = this.store.find(field, value);
        if (index < 0) {
            return;
        }
        this.store.remove(this.store.getAt(index));
    },
    removeByIndex: function (index) {
        if (index < 0 || index >= this.store.getCount()) {
            return;
        }
        this.store.remove(this.store.getAt(index));
    },
    removeByValue: function (value) {
        this.removeByField(this.valueField, value);
    },
    removeByText: function (text) {
        this.removeByField(this.displayField, text);
    },
    getSelectionField: function () {
        if (!this.selectedIndexField) {
            this.selectedIndexField = new Ext.form.Hidden({
                id: this.id + "_SelIndex",
                name: this.id + "_SelIndex"
            });
            this.on("beforedestroy", function () {
                if (this.rendered) {
                    this.destroy();
                }
            }, this.selectedIndexField);
        }
        return this.selectedIndexField;
    },
    getText: function () {
        return this.el.getValue();
    },
    getSelectedItem: function () {
        return {
            text: this.getText(),
            value: this.getValue()
        };
    },
    initSelect: false,
    setValueAndFireSelect: function (v) {
        this.setValue(v);
        var r = this.findRecord(this.valueField, v);
        if (!Ext.isEmpty(r)) {
            var index = this.store.indexOf(r);
            this.getSelectionField().setValue(this.getSelectedIndex());
            this.initSelect = true;
            this.fireEvent("select", this, r, index);
            this.initSelect = false;
        }
    },
    findRecordByText: function (prop, text) {
        var record;
        if (this.store.getCount() > 0) {
            this.store.each(function (r) {
                if (r.data[prop] == text) {
                    record = r;
                    return false;
                }
            });
        }
        return record;
    },
    origFindRecord: Ext.form.ComboBox.prototype.findRecord,
    findRecord: function (prop, value) {
        if (this.store.snapshot && this.store.snapshot.getCount() > 0) {
            var record;
            if (this.store.snapshot.getCount() > 0) {
                this.store.snapshot.each(function (r) {
                    if (r.data[prop] == value) {
                        record = r;
                        return false;
                    }
                });
            }
            return record;
        }
        return this.origFindRecord(prop, value);
    },
    indexOfEx: function (record) {
        if (this.store.snapshot && this.store.snapshot.getCount() > 0) {
            return this.store.snapshot.indexOf(record);
        }
        return this.store.data.indexOf(record);
    },
    getSelectedIndex: function () {
        var r = this.findRecord(this.forceSelection ? this.valueField : this.displayField, this.getValue());
        return (!Ext.isEmpty(r)) ? this.indexOfEx(r) : -1;
    },
    onSelect: function (record, index) {
        if (this.fireEvent("beforeselect", this, record, index) !== false) {
            this.setValue(record.data[this.valueField || this.displayField]);
            this.collapse();
            this.getSelectionField().setValue(this.getSelectedIndex());
            this.fireEvent("select", this, record, index);
            this.oldValue = this.getValue();
            var t = this.getEl().dom.value ? this.getEl().dom.value.trim() : "";
            this.oldText = (t === this.emptyText) ? "" : t;
        }
    },
    //.............
    //...
    setInitValue: function (value) {
        if (this.store.getCount() > 0) {
            this.setLoadedValue(value);
        } else {
            this.setValue(value);
            this.store.on("load", this.setLoadedValue.createDelegate(this, [value]), this, {
                single: true
            });
        }
    },
    //..
    setLoadedValue: function (value) {
        this[this.fireSelectOnLoad ? "setValueAndFireSelect" : "setValue"](value);
        this.clearInvalid();
    },
    //..
    setValue : function(v){
        var text = v;
        if(this.valueField){
            var r = this.findRecord(this.valueField, v);
            if(r){
                text = this.displayTpl.applyTemplate(r.data);
            }else if(Ext.isDefined(this.valueNotFoundText)){
                text = this.valueNotFoundText;
            }
        }
        this.lastSelectionText = text;
        if(this.hiddenField){
            this.hiddenField.value = Ext.value(v, '');
        }
        Ext.form.ComboBox.superclass.setValue.call(this, text);
        this.value = v;
        return this;
    },    
    //..........
    checkOnBlur: function () {
        var t = this.getEl().dom.value ? this.getEl().dom.value.trim() : "",
            v = this.getValue();
        if (this.oldValue !== v || (t !== this.oldText && t !== this.emptyText)) {
            if (!Ext.isEmpty(this.selValue) && this.selText !== t && this.selValue === this.getValue()) {
                this.hiddenField.value = "";
            }

            var val = this.el.dom.value,
                r = this.findRecordByText(this.displayField, val);
            if (!Ext.isEmpty(r)) {
                this.onSelect(r, this.store.indexOf(r), false, true);
            } else {
                if (this.forceSelection) {
                    if (Ext.isEmpty(this.findRecord(this.valueField, this.oldValue))) {
                        this.clearValue();
                    } else {
                        this.setValue(this.oldValue);
                    }
                } else {
                    this.setValue(val);
                }
            }
            this.getSelectionField().setValue(this.getSelectedIndex());
        }
    },
    triggerBlur: function () {
        this.mimicing = false;
        Ext.getDoc().un("mousedown", this.mimicBlur, this);
        if (this.monitorTab && this.el) {
            this.el.un("keydown", this.checkTab, this);
        }
        this.checkOnBlur();
        Ext.form.TriggerField.superclass.onBlur.call(this);
        if (this.wrap) {
            this.wrap.removeClass(this.wrapFocusClass);
        }
    },
    onFocus: function () {
        Ext.form.TriggerField.superclass.onFocus.call(this);
        if (!this.mimicing) {
            this.wrap.addClass(this.wrapFocusClass);
            this.mimicing = true;
            Ext.getDoc().on("mousedown", this.mimicBlur, this, {
                delay: 10
            });
            if (this.monitorTab) {
                this.el.on("keydown", this.checkTab, this);
            }
        }
    },
    
    selectByIndex: function (index, fireSelect) {
        var r;
        if (index >= 0) {
            r = this.store.getAt(index);
            if (r) {
                this[fireSelect ? "setValueAndFireSelect" : "setValue"](r.get(this.valueField || this.displayField));
            }
        }
    },

    selectByValue : function(v, scrollIntoView){
        if(!Ext.isEmpty(v, true)){
            var r = this.findRecord(this.valueField, v);
            if(r){
                this.select(this.store.indexOf(r), scrollIntoView);
                return true;
            }
        }
        return false;
    },
    
    setInitValueByIndex: function (index) {
        if (this.store.getCount() > 0) {
            this.setLoadedIndex(index);
        } else {
            this.store.on("load", this.setLoadedIndex.createDelegate(this, [index]), this, {
                single: true
            });
        }
    },
    setLoadedIndex: function (index) {
        this.selectByIndex(index, this.fireSelectOnLoad);
        this.clearInvalid();
    },
    onLoad: Ext.form.ComboBox.prototype.onLoad.createInterceptor(function () {
        if (this.mode === "single") {
            this.mode = "local";
        }
    }),
    initList: Ext.form.ComboBox.prototype.initList.createSequence(function () {
        if (this.mode === "single" && this.store.isLoaded) {
            this.mode = "local";
        }
    }),
    doForce: Ext.emptyFn
});

//------------------------------------------------------------------------------
____DropDownField = {'____':''};
Ext.net.DropDownField = function(){}
Ext.net.DropDownField = Ext.extend(Ext.net.TriggerField, {
    lazyInit: true,
    componentAlign: "tl-bl?",
    allowBlur: false,
    mode: "text",
    syncValue: Ext.emptyFn,
    initComponent: function () {
        Ext.net.DropDownField.superclass.initComponent.call(this);
        this.addEvents("expand", "collapse");
        var cn = [],
            triggerCfg, isSimple;
        triggerCfg = {
            tag: "img",
            src: Ext.BLANK_IMAGE_URL,
            cls: "x-form-trigger"
        };
        if (!Ext.isEmpty(this.triggerClass, false)) {
            triggerCfg.cls += " " + this.triggerClass;
        }
        if (Ext.net.StringUtils.startsWith(this.triggerClass || "", "x-form-simple")) {
            if (this.triggersConfig && this.triggersConfig.length > 0) {
                triggerCfg.cls += " shift-trigger";
            }
            isSimple = true;
        }
        if (this.hideTrigger || this.readOnly) {
            Ext.apply(triggerCfg, {
                style: "display:none",
                hidden: true
            });
            this.hideTrigger = false;
        }
        if (isSimple) {
            this.addClass("clear-right");
        }
        if (this.triggersConfig) {
            this.triggerConfig.cn.push(triggerCfg);
        } else {
            cn.push(triggerCfg);
            this.triggerConfig = {
                tag: "span",
                cls: "x-form-twin-triggers",
                cn: cn
            };
        }
    },
    initTrigger: function () {
        Ext.net.DropDownField.superclass.initTrigger.call(this);
        this.triggers[this.triggers.length - 1].removeListener("click", this.onCustomTriggerClick, this);
        this.triggers[this.triggers.length - 1].on("click", this.onTriggerClick, this);
    },
    getListParent: function () {
//        return this.componentRenderTo || Ext.net.ResourceMgr.getAspForm() || document.body;
        return document.body;
    },
    getParentZIndex: function () {
        var zindex;
        if (this.ownerCt) {
            this.findParentBy(function (ct) {
                zindex = parseInt(ct.getPositionEl().getStyle('z-index'), 10);
                return !!zindex;
            });
        }
        return zindex;
    },
    getZIndex: function (listParent) {
        listParent = listParent || Ext.getDom(this.getListParent() || Ext.getBody());
        var zindex = parseInt(Ext.fly(listParent).getStyle('z-index'), 10);
        if (!zindex) {
            zindex = this.getParentZIndex();
        }
        return (zindex || 12000) + 5;
    },
    initDropDownComponent: function () {
        if (this.component && !this.component.render) {
            this.component.floating = true;
            this.component = new Ext.ComponentMgr.create(this.component, "panel");
        }
//        var renderTo = this.componentRenderTo || Ext.net.ResourceMgr.getAspForm() || document.body;
        var renderTo = document.body;
        this.component.setWidth(this.component.initialConfig.width || this.getWidth());
        this.component.dropDownField = this;
        this.component.render(renderTo);
        this.component.hide();
        this.first = true;
        this.component.getPositionEl().position("absolute", this.getZIndex());
        if (this.component.initialConfig.height) {
            this.component.setHeight(this.component.initialConfig.height);
        }
        this.syncValue(this.getValue(), this.getText());
    },
    onRender: function (ct, position) {
        Ext.net.DropDownField.superclass.onRender.call(this, ct, position);
        if (Ext.isGecko) {
            this.el.dom.setAttribute("autocomplete", "off");
        }
        if (!this.lazyInit) {
            this.initDropDownComponent();
        } else {
            this.on("focus", this.initDropDownComponent, this, {
                single: true
            });
        }
        if (this.mode !== "text") {
            this.getUnderlyingValueField().render(ct);
        }
    },
    isExpanded: function () {
        return this.component && this.component.isVisible && this.component.isVisible();
    },
    collapse: function () {
        if (!this.isExpanded()) {
            return;
        }
        this.component.hide();
        if (this.allowBlur === false) {
            Ext.getDoc().un("mousewheel", this.collapseIf, this);
            Ext.getDoc().un("mousedown", this.collapseIf, this);
        }
        this.fireEvent("collapse", this);
    },
    collapseIf: function (e) {
        if (!e.within(this.wrap) && !e.within(this.component.el)) {
            this.collapse();
        }
    },
    expand: function () {
        if (this.isExpanded() || !this.hasFocus) {
            return;
        }
        if (this.first) {
            this.doResize(this.el.getWidth() + this.getTriggerWidth());
            delete this.first;
        } else if (this.bufferSize) {
            this.doResize(this.bufferSize);
            delete this.bufferSize;
        }
        var el = this.component.getPositionEl();
        el.position("absolute", this.getZIndex());        //...I'm FIXED
        el.setLeft(0);
        el.setTop(0);
        if (Ext.isIE6 || Ext.isIE7) {
            this.component.show();
        }
        el.setZIndex(this.getZIndex());
        el.alignTo(this.wrap, this.componentAlign);
        if (!(Ext.isIE6 || Ext.isIE7)) {
            this.component.show();
        }
        if (this.allowBlur === false) {
            this.mon(Ext.getDoc(), {
                scope: this,
                mousewheel: this.collapseIf,
                mousedown: this.collapseIf
            });
        }
        this.fireEvent("expand", this);
    },
    onTriggerClick: function () {
        if (this.readOnly || this.disabled) {
            return;
        }
        if (this.isExpanded()) {
            this.collapse();
        } else {
            this.onFocus({});
            this.expand();
        }
        this.el.focus();
    },
    validateBlur: function () {
        return !this.component || !this.component.isVisible();
    },
    onResize: function (w, h) {
        Ext.net.DropDownField.superclass.onResize.apply(this, arguments);
        if (this.isVisible() && this.component && this.componentAlign.render) {
            this.doResize(w);
        } else {
            this.bufferSize = w;
        }
    },
    doResize: function (w) {
        if (!Ext.isDefined(this.component.initialConfig.width)) {
            this.component.setWidth(w);
        }
    },
    checkTab: function (me, e) {
        if (!this.isExpanded() && e.getKey() === e.TAB) {
            this.triggerBlur();
        }
    },
    onDestroy: function () {
        if (this.component && this.component.rendered) {
            this.component.destroy();
        }
        if (this.underlyingValueField && this.underlyingValueField.rendered) {
            this.underlyingValueField.destroy();
        }
        Ext.net.DropDownField.superclass.onDestroy.call(this);
    },
    setValue: function (value, text, collapse) {
        if (this.mode === "text") {
            collapse = text;
            text = value;
        }
        Ext.net.DropDownField.superclass.setValue.apply(this, [text]);
        this.getUnderlyingValueField().setValue(value);
        if (!this.isExpanded()) {
            this.syncValue(value, text);
        }
        if (collapse !== false) {
            this.collapse();
        }
        return this;
    },
    setRawValue: function (value, text) {
        Ext.net.DropDownField.superclass.setRawValue.call(this, value);
        this.getUnderlyingValueField().setValue(value);
        if (!this.isExpanded()) {
            this.syncValue(value, text);
        }
        return this;
    },
    initEvents: function () {
        Ext.net.DropDownField.superclass.initEvents.call(this);
        this.keyNav = new Ext.KeyNav(this.el, {
            "down": function (e) {
                if (!this.isExpanded()) {
                    this.onTriggerClick();
                }
            },
            "esc": function (e) {
                this.collapse();
            },
            "tab": function (e) {
                this.collapse();
                return true;
            },
            scope: this,
            doRelay: function (e, h, hname) {
                if (hname === "down" || this.scope.isExpanded()) {
                    var relay = Ext.KeyNav.prototype.doRelay.apply(this, arguments);
                    if (!Ext.isIE && Ext.EventManager.useKeydown) {
                        this.scope.fireKey(e);
                    }
                    return relay;
                }
                return true;
            },
            forceKeyDown: true,
            defaultEventAction: "stopEvent"
        });
    },
    getUnderlyingValueField: function () {
        if (!this.underlyingValueField) {
            this.underlyingValueField = new Ext.form.Hidden({
                id: this.id + "_Value",
                name: this.id + "_Value",
                value: this.underlyingValue || ""
            });
            this.on("beforedestroy", function () {
                if (this.rendered) {
                    this.destroy();
                }
            }, this.underlyingValueField);
        }
        return this.underlyingValueField;
    },
    getText: function () {
        return Ext.net.DropDownField.superclass.getValue.call(this);
    },
    getValue: function () {
        return this.getUnderlyingValueField().getValue();
    },
    getRawValue: function () {
        return this.getValue();
    },
    reset: function () {
        if (this.isTextMode()) {
            this.setValue(this.originalText, false);
        } else {
            this.setValue(this.originalValue, this.originalText, false);
        }
        this.clearInvalid();
        this.applyEmptyText();
    },
    isTextMode: function () {
        return this.mode === "text";
    },
    initValue: function () {
        Ext.net.DropDownField.superclass.initValue.call(this);
        if (this.text !== undefined) {
            if (this.isTextMode()) {
                this.setValue(this.text, false);
            } else {
                this.setValue(this.getValue(), this.text, false);
            }
        }
        this.originalText = this.getText();
    },
    clearValue: function () {
        this.setRawValue("", "");
        this.applyEmptyText();
    },
    clear: function () {
        this.clearValue();
    },    
});
Ext.reg("netdropdown", Ext.net.DropDownField);


____GridPanel = {'____':''};
//------------------------------------------------------------------------------
Ext.net.GridPanel = function (config) {
    Ext.net.GridPanel.superclass.constructor.call(this, config);
};
//Ext.extend(Ext.net.GridPanel, Ext.grid.EditorGridPanel, {
Ext.extend(Ext.net.GridPanel, Ext.grid.GridPanel, {

    removeOrphanColumnPlugins: function (column) {
        var p, i = 0;
        while (i < this.plugins.length) {
            p = this.plugins[i];
            if (p.isColumnPlugin) {
                if (this.getColumnModel().config.indexOf(p) === -1) {
                    this.plugins.remove(p);
                    if (p.destroy) {
                        p.destroy();
                    }
                } else {
                    i++;
                }
            } else {
                i++;
            }
        }
    },
    addColumnPlugins: function (plugins, init) {
        if (Ext.isArray(plugins)) {
            var i = 0;
            for (i; i < plugins.length; i++) {
                this.plugins.push(plugins[i]);
                if (init && plugins[i].init) {
                    plugins[i].init(this);
                }
            }
        } else {
            this.plugins.push(plugins);
            if (init && plugins.init) {
                plugins.init(this);
            }
        }
    },
    initColumnPlugins: function (plugins, init) {
        var cp = [],
            p, i = 0;
        this.initGridPlugins();
        if (init) {
            this.removeOrphanColumnPlugins();
        }
        for (i; i < plugins.length; i++) {
            p = this.getColumnModel().config[plugins[i]];
            p.isColumnPlugin = true;
            cp.push(p);
        }
        this.addColumnPlugins(cp, init);
    },
    initGridPlugins: function () {
        if (Ext.isEmpty(this.plugins)) {
            this.plugins = [];
        } else if (!Ext.isArray(this.plugins)) {
            this.plugins = [this.plugins];
        }
    },

    initComponent: function () {
        Ext.net.GridPanel.superclass.initComponent.call(this);
        this.initGridPlugins();
        if (this.columnPlugins) {
            this.initColumnPlugins(this.columnPlugins, false);
        }

    },

});
Ext.reg("netgrid", Ext.net.GridPanel);

____CommandColumn = {'____':''};
//-----------------------------------------------------------------------------
Ext.net.CommandColumn = function (config) {
    Ext.apply(this, config);
    if (!this.id) {
        this.id = Ext.id();
    }
    Ext.net.CommandColumn.superclass.constructor.call(this);
};
Ext.extend(Ext.net.CommandColumn, Ext.util.Observable, {
    dataIndex: "",
    header: "",
    menuDisabled: true,
    sortable: false,
    autoWidth: false,
    init: function (grid) {
        this.grid = grid;
        var view = this.grid.getView(),
            func;
        view.rowSelectorDepth = 100;
        this.cache = [];
        this.commands = this.commands || [];
        if (this.commands) {
            this.shareMenus(this.commands, "initMenu");
            func = function () {
                this.insertToolbars();
                view.on("beforerefresh", this.removeToolbars, this);
                view.on("refresh", this.insertToolbars, this);
            };
            if (this.grid.rendered) {
                func.call(this);
            } else {
                this.grid.on("viewready", func, this);
            }
            view.on("beforerowupdate", this.removeToolbar, this);
            view.on("beforerowremoved", this.removeToolbar, this);
            view.on("rowsinserted", this.insertToolbar, this);
            view.on("rowupdated", this.rowUpdated, this);
        }
        var sm = grid.getSelectionModel();
        if (sm.id === "checker") {
            sm.onMouseDown = sm.onMouseDown.createInterceptor(this.onMouseDown, this);
        } else if (sm.selectRows) {
            sm.handleMouseDown = sm.handleMouseDown.createInterceptor(this.rmHandleMouseDown, this);
        } else {
            sm.handleMouseDown = sm.handleMouseDown.createInterceptor(this.handleMouseDown, this);
        }
        if (view.groupTextTpl && this.groupCommands) {
            this.shareMenus(this.groupCommands, "initGroupMenu");
            func = function () {
                this.insertGroupToolbars();
                view.on("beforerefresh", this.removeToolbars, this);
                view.on("refresh", this.insertGroupToolbars, this);
            };
            if (view.groupTextTpl && this.groupCommands) {
                view.groupTextTpl = '<div class="standart-view-group">' + view.groupTextTpl + '</div>';
            }
            if (this.grid.rendered) {
                func.call(this);
            } else {
                view.on("afterRender", func, this);
            }
            view.processEvent = view.processEvent.createInterceptor(this.interceptMouse, this);
        }
    },
    onMouseDown: function (e, t) {
        return this.interceptMouse("mousedown", e);
    },
    rmHandleMouseDown: function (g, rowIndex, e) {
        return this.interceptMouse("mousedown", e);
    },
    handleMouseDown: function (g, row, cell, e) {
        return this.interceptMouse("mousedown", e);
    },
    interceptMouse: function (name, e) {
        if (name !== "mousedown") {
            return;
        }
        var tb = e.getTarget('.x-toolbar', this.grid.view.mainBody);
        if (tb) {
            e.stopEvent();
            return false;
        }
    },
    renderer: function (value, meta, record, row, col, store) {
        meta.css = "row-cmd-cell";
        return "";
    },
    insertToolbar: function (view, firstRow, lastRow, row) {
        this.insertToolbars(firstRow, lastRow + 1, row);
    },
    rowUpdated: function (view, firstRow, record) {
        this.insertToolbars(firstRow, firstRow + 1);
    },
    select: function (row) {
        var classSelector = "x-grid3-td-" + this.id + ".row-cmd-cell",
            el = row ? Ext.fly(row) : this.grid.getEl();
        return el.query("td." + classSelector);
    },
    selectGroups: function () {
        return this.grid.getEl().query("div.x-grid-group div.x-grid-group-hd");
    },
    shareMenus: function (items, initMenu) {
        Ext.each(items, function (item) {
            if (item.menu) {
                if (item.menu.shared) {
                    item.menu.autoDestroy = false;
                    item.destroyMenu = false;
                    item.onMenuShow = Ext.emptyFn;
                    item.showMenu = function () {
                        if (this.rendered && this.menu) {
                            if (this.tooltip) {
                                Ext.QuickTips.getQuickTip().cancelShow(this.btnEl);
                            }
                            this.menu.show(this.el, this.menuAlign);
                            this.menu.ownerCt = this;
                            this.ignoreNextClick = 0;
                            this.el.addClass('x-btn-menu-active');
                            this.fireEvent('menushow', this, this.menu);
                        }
                        return this;
                    };
                    item.menu = Ext.ComponentMgr.create(item.menu, "menu");
                    this.sharedMenus = this.sharedMenus || [];
                    this.sharedMenus.push(item.menu);
                    this[initMenu](item.menu, null, true);
                } else {
                    this.shareMenus(item.menu.items || []);
                }
            }
        }, this);
    },
    insertGroupToolbars: function () {
        var groupCmd = this.selectGroups(),
            i;
        if (this.groupCommands) {
            for (i = 0; i < groupCmd.length; i++) {
                var toolbar = new Ext.Toolbar({
                    items: this.groupCommands,
                    enableOverflow: false
                }),
                    div = Ext.fly(groupCmd[i]).first("div");
                this.cache.push(toolbar);
                div.addClass("row-cmd-cell-ct");
                toolbar.render(div);
                var group = this.grid.view.findGroup(div),
                    groupId = group ? group.id.replace(/ext-gen[0-9]+-gp-/, "") : null,
                    records = this.getRecords(group.id);
                if (this.prepareGroupToolbar && this.prepareGroupToolbar(this.grid, toolbar, groupId, records) === false) {
                    toolbar.destroy();
                    continue;
                }
                toolbar.grid = this.grid;
                toolbar.groupId = groupId;
                toolbar._groupId = group.id;
                toolbar.items.each(function (button) {
                    if (button.on) {
                        button.toolbar = toolbar;
                        button.column = this;
                        if (button.standOut) {
                            button.on("mouseout", function () {
                                this.getEl().addClass("x-btn-over");
                            }, button);
                        }
                        if (!Ext.isEmpty(button.command, false)) {
                            button.on("click", function (e) {
                                this.toolbar.grid.fireEvent("groupcommand", this.command, this.toolbar.groupId, this.column.getRecords.apply(this.column, [this.toolbar._groupId]));
                            }, button);
                        }
                        if (button.menu && !button.menu.shared) {
                            this.initGroupMenu(button.menu, toolbar);
                        }
                    }
                }, this);
            }
        }
    },
    initGroupMenu: function (menu, toolbar, shared) {
        menu.items.each(function (item) {
            if (item.on) {
                item.toolbar = toolbar;
                item.column = this;
                if (!Ext.isEmpty(item.command, false)) {
                    if (shared) {
                        item.on("click", function () {
                            var pm = this.parentMenu;
                            while (pm && !pm.shared) {
                                pm = pm.parentMenu;
                            }
                            if (pm && pm.shared && pm.ownerCt && pm.ownerCt.toolbar) {
                                var toolbar = pm.ownerCt.toolbar;
                                toolbar.grid.fireEvent("groupcommand", this.command, toolbar.groupId, this.column.getRecords.apply(this.column, [toolbar._groupId]));
                            }
                        }, item);
                        item.getGroup = function () {
                            var pm = this.parentMenu;
                            while (pm && !pm.shared) {
                                pm = pm.parentMenu;
                            }
                            if (pm && pm.shared && pm.ownerCt && pm.ownerCt.toolbar) {
                                var toolbar = pm.ownerCt.toolbar;
                                return {
                                    groupId: toolbar.groupId,
                                    records: this.column.getRecords.apply(this.column, [toolbar._groupId])
                                };
                            }
                        };
                    } else {
                        item.getGroup = function () {
                            return {
                                groupId: this.toolbar.groupId,
                                records: this.column.getRecords.apply(this.column, [this.toolbar._groupId])
                            };
                        };
                        item.on("click", function () {
                            this.toolbar.grid.fireEvent("groupcommand", this.command, this.toolbar.groupId, this.column.getRecords.apply(this.column, [this.toolbar._groupId]));
                        }, item);
                    }
                }
                if (item.menu) {
                    this.initGroupMenu(item.menu, toolbar, shared);
                }
            }
        }, this);
    },
    getRecords: function (groupId) {
        if (groupId) {
            groupId = Ext.util.Format.htmlEncode(groupId);
            var records = this.grid.store.queryBy(function (r) {
                return r._groupId === groupId;
            });
            return records ? records.items : [];
        }
    },
    getAllGroupToolbars: function () {
        var groups = this.selectGroups(),
            toolbars = [],
            i;
        for (i = 0; i < groups.length; i++) {
            var div = Ext.fly(groups[i]).first("div"),
                el = div.last();
            if (!Ext.isEmpty(el)) {
                var cmp = Ext.getCmp(el.id);
                toolbars.push(cmp);
            }
        }
        return toolbars;
    },
    getGroupToolbar: function (groupId) {
        var groups = this.selectGroups(),
            i;
        for (i = 0; i < groups.length; i++) {
            var div = Ext.fly(groups[i]).first("div"),
                _group = this.grid.view.findGroup(div),
                _groupId = _group ? _group.id.replace(/ext-gen[0-9]+-gp-/, "") : null;
            if (_groupId === groupId) {
                var el = div.last();
                if (!Ext.isEmpty(el)) {
                    var cmp = Ext.getCmp(el.id);
                    return cmp;
                }
            }
        }
        return undefined;
    },
    insertToolbars: function (start, end, row) {
        var tdCmd = this.select(),
            width = 0;
        if (Ext.isEmpty(start) || Ext.isEmpty(end)) {
            start = 0;
            end = tdCmd.length;
        }
        if (this.commands) {
            var i = start;
            for (i; i < end; i++) {
                var toolbar = new Ext.Toolbar({
                    items: this.commands,
                    enableOverflow: false,
                    buttonAlign: this.buttonAlign,
                    cls:'x-row-toolbar',                      
                }),
                    div;
                if (row) {
                    div = Ext.fly(this.select(row)[0]).first("div");
                } else {
                    div = Ext.fly(tdCmd[i]).first("div");
                }
                this.cache.push(toolbar);
                div.dom.innerHTML = "";
                div.addClass("row-cmd-cell-ct");
                toolbar.render(div);
                var record = this.grid.store.getAt(i);
                toolbar.record = record;
                if (this.prepareToolbar && this.prepareToolbar(this.grid, toolbar, i, record) === false) {
                    toolbar.destroy();
                    continue;
                }
                toolbar.grid = this.grid;
                toolbar.rowIndex = i;
                toolbar.record = record;
                toolbar.items.each(function (button) {
                    if (button.on) {
                        button.toolbar = toolbar;
                        if (button.standOut) {
                            button.on("mouseout", function () {
                                this.getEl().addClass("x-btn-over");
                            }, button);
                        }
                        if (!Ext.isEmpty(button.command, false)) {
                            button.on("click", function () {
                                this.toolbar.grid.fireEvent("command", this.command, this.toolbar.record, this.toolbar.record.store.indexOf(this.toolbar.record));
                            }, button);
                        }
                        if (button.menu && !button.menu.shared) {
                            this.initMenu(button.menu, toolbar);
                        }
                    }
                }, this);
                if (this.autoWidth) {
                    var tbTable = toolbar.getEl().first("table"),
                        tbWidth = tbTable.getComputedWidth();
                    width = tbWidth > width ? tbWidth : width;
                }
            }
            if (this.autoWidth && width > 0) {
                var cm = this.grid.getColumnModel();
                cm.setColumnWidth(cm.getIndexById(this.id), width + 4);
                this.grid.view.autoExpand();
            }
            if (this.grid.view.syncRows) {
                this.grid.view.syncRows(start);
            }
        }
    },
    initMenu: function (menu, toolbar, shared) {
        menu.items.each(function (item) {
            if (item.on) {
                item.toolbar = toolbar;
                if (shared) {
                    item.on("click", function () {
                        var pm = this.parentMenu;
                        while (pm && !pm.shared) {
                            pm = pm.parentMenu;
                        }
                        if (pm && pm.shared && pm.ownerCt && pm.ownerCt.toolbar) {
                            var toolbar = pm.ownerCt.toolbar;
                            toolbar.grid.fireEvent("command", this.command, toolbar.record, toolbar.record.store.indexOf(toolbar.record));
                        }
                    }, item);
                    item.getRecord = function () {
                        var pm = this.parentMenu;
                        while (pm && !pm.shared) {
                            pm = pm.parentMenu;
                        }
                        if (pm && pm.shared && pm.ownerCt && pm.ownerCt.toolbar) {
                            var toolbar = pm.ownerCt.toolbar;
                            return toolbar.record;
                        }
                    };
                } else {
                    if (!Ext.isEmpty(item.command, false)) {
                        item.on("click", function () {
                            this.toolbar.grid.fireEvent("command", this.command, this.toolbar.record, this.toolbar.rowIndex);
                        }, item);
                        item.getRecord = function () {
                            return this.toolbar.record;
                        };
                    }
                }
                if (item.menu) {
                    this.initMenu(item.menu, toolbar, shared);
                }
            }
        }, this);
    },
    removeToolbar: function (view, rowIndex, record) {
        var i, l;
        for (i = 0, l = this.cache.length; i < l; i++) {
            if (this.cache[i].record && (this.cache[i].record.id === record.id)) {
                try {
                    this.cache[i].destroy();
                    this.cache.remove(this.cache[i]);
                } catch (ex) {}
                break;
            }
        }
    },
    removeToolbars: function () {
        var i, l;
        for (i = 0, l = this.cache.length; i < l; i++) {
            try {
                this.cache[i].destroy();
            } catch (ex) {}
        }
        this.cache = [];
    },
    getToolbar: function (rowIndex) {
        var tdCmd = this.select(),
            div = Ext.fly(tdCmd[rowIndex]).first("div"),
            el = div.first();
        if (!Ext.isEmpty(el)) {
            var cmp = Ext.getCmp(el.id);
            return cmp;
        }
        return undefined;
    },
    getAllToolbars: function () {
        var tdCmd = this.select(),
            toolbars = [],
            i = 0;
        for (i; i < tdCmd.length; i++) {
            var div = Ext.fly(tdCmd[i]).first("div"),
                el = div.first();
            if (!Ext.isEmpty(el)) {
                var cmp = Ext.getCmp(el.id);
                toolbars.push(cmp);
            }
        }
        return toolbars;
    },
    destroy: function () {
        var view = this.grid.getView();
        Ext.each(this.sharedMenus || [], function (menu) {
            if (menu) {
                menu.destroy();
            }
        });
        delete this.shareMenus;
        this.removeToolbars();
        view.un("refresh", this.insertToolbars, this);
        view.un("beforerowupdate", this.removeToolbar, this);
        view.un("beforerefresh", this.removeToolbars, this);
        view.un("beforerowremoved", this.removeToolbar, this);
        view.un("rowsinserted", this.insertToolbar, this);
        view.un("rowupdated", this.rowUpdated, this);
        view.un("refresh", this.insertGroupToolbars, this);
    }
});


____FileUploadField = {'____':''};

Ext.form.FileUploadField = function(){};
Ext.form.FileUploadField = Ext.extend(Ext.form.TextField, {
    buttonText: "Browse...",
    buttonOnly: false,
    buttonOffset: 3,
    readOnly: true,
    autoSize: Ext.emptyFn,
    actionMode: "wrap",
    initComponent: function () {
        Ext.form.FileUploadField.superclass.initComponent.call(this);
        this.addEvents("fileselected");
    },
    isIconIgnore: function () {
        return true;
    },
    syncSize: function () {
        Ext.form.FileUploadField.superclass.syncSize.apply(this, arguments);
        this.fileInput.setWidth(this.button.getEl().getWidth() + (Ext.isIE ? 4 : 0));
    },
    onRender: function (ct, position) {
        Ext.form.FileUploadField.superclass.onRender.call(this, ct, position);
        this.wrap = this.el.wrap({
            cls: "x-form-field-wrap x-form-file-wrap",
            style: "overflow:hidden;" + (Ext.isIE ? "height:22px;" : "")
        });
        this.el.addClass("x-form-file-text");
        this.el.dom.removeAttribute("name");
        this.createFileInput();
        var btnCfg = Ext.applyIf(this.buttonCfg || {}, {
            text: this.buttonText,
            disabled: this.disabled,
            iconCls: this.iconCls
        });
        this.button = new Ext.Button(Ext.apply(btnCfg, {
            renderTo: this.wrap,
            cls: "x-form-file-btn" + (btnCfg.iconCls ? (btnCfg.text ? " x-btn-text-icon" : " x-btn-icon") : "")
        }));
        var fiWidth = this.button.getEl().getWidth() + (Ext.isIE ? 4 : 0);
        if (fiWidth > (Ext.isIE ? 4 : 0)) {
            this.fileInput.setWidth(fiWidth);
        }
        if (this.buttonOnly) {
            this.el.setVisibilityMode(Ext.Element.DISPLAY);
            this.el.hide();
            this.wrap.setWidth(this.button.getEl().getWidth());
        }
        this.bindListeners();
        this.resizeEl = this.positionEl = this.wrap;
    },
    bindListeners: function () {
        this.fileInput.on({
            scope: this,
            mouseenter: function () {
                this.button.addClass(["x-btn-over", "x-btn-focus"]);
            },
            mouseleave: function () {
                this.button.removeClass(["x-btn-over", "x-btn-focus", "x-btn-click"]);
            },
            mousedown: function () {
                this.button.addClass("x-btn-click");
            },
            mouseup: function () {
                this.button.removeClass(["x-btn-over", "x-btn-focus", "x-btn-click"]);
            },
            change: function () {
                var v = this.fileInput.dom.value,
                    fileNameRegex = /[^\\]*$/im,
                    match = fileNameRegex.exec(v);
                if (match !== null) {
                    v = match[0];
                }
                this.setValue(v);
                this.fireEvent("fileselected", this, v);
            }
        });
    },
    createFileInput: function () {
        if (this.fileInput) {
            this.fileInput.remove();
        }
        this.fileInput = this.wrap.createChild({
            id: this.getFileInputId(),
            name: this.name || this.getFileInputId(),
            cls: "x-form-file",
            tag: "input",
            type: "file",
            size: 1
        });
        if (this.buttonOnly && this.button) {
            var fiWidth = this.button.getEl().getWidth() + (Ext.isIE ? 4 : 0);
            if (fiWidth > (Ext.isIE ? 4 : 0)) {
                this.fileInput.setWidth(fiWidth);
            }
        }
        if (this.disabled) {
            this.fileInput.dom.disabled = true;
        }
    },
    getFileInputId: function () {
        return this.id + "-file";
    },
    onResize: function (w, h) {
        Ext.form.FileUploadField.superclass.onResize.call(this, w, h);
        this.wrap.setWidth(w);
        if (!this.buttonOnly) {
            w = this.wrap.getWidth() - this.button.getEl().getWidth() - this.buttonOffset;
            if (w > 0) {
                this.el.setWidth(w);
            }
        }
    },
    onDestroy: function () {
        Ext.form.FileUploadField.superclass.onDestroy.call(this);
        Ext.destroy(this.fileInput, this.button, this.wrap);
    },
    onDisable: function () {
        Ext.form.FileUploadField.superclass.onDisable.call(this);
        this.doDisable(true);
    },
    onEnable: function () {
        Ext.form.FileUploadField.superclass.onEnable.call(this);
        this.doDisable(false);
    },
    doDisable: function (disabled) {
        this.fileInput.dom.disabled = disabled;
        this.button.setDisabled(disabled);
    },
    preFocus: Ext.emptyFn,
    alignErrorIcon: function () {
        this.errorIcon.alignTo(this.wrap, "tl-tr", [2, 0]);
    },
    reset: function () {
        this.createFileInput();
        this.bindListeners();
        Ext.form.FileUploadField.superclass.reset.call(this);
    }
});
Ext.reg("fileuploadfield", Ext.form.FileUploadField);



____Tree = {'____':''};
//Ext.net.TreePanel = function (config) {
//    Ext.net.TreePanel.superclass.constructor.call(this, config);
//};
//Ext.extend(Ext.net.TreePanel, Ext.tree.TreePanel, {
//    mode: "local",
//    initNoLeafIcon: function () {
//        if (this.noLeafIcon) {
//            var css = "#" + this.id + " .x-tree-node-leaf .x-tree-node-icon{background-image: none;width:0px;}";
//            Ext.net.ResourceMgr.registerCssClass("treepanel_css_" + this.id, css);
//        }
//    },
//    initComponent: function () {
//        Ext.net.TreePanel.superclass.initComponent.call(this);
//        this.initEditors();
//        this.initChildren(this.nodes);
//        this.initNoLeafIcon();
//        if (Ext.isEmpty(this.selectionSubmitConfig) || this.selectionSubmitConfig.disableAutomaticSubmit !== true) {
//            this.getSelectionModel().on("selectionchange", this.updateSelection, this);
//            this.on("checkchange", this.updateCheckSelection, this, {
//                buffer: 10
//            });
//            this.on("append", this.updateCheckSelection, this, {
//                buffer: 10
//            });
//            this.on("insert", this.updateCheckSelection, this, {
//                buffer: 10
//            });
//        }
//        if (!this.loader.hasListener("loadexception")) {
//            this.loader.on("loadexception", function (loader, node, response) {
//                if (Ext.net.DirectEvent.fireEvent("ajaxrequestexception", response, {
//                    "errorMessage": response.responseText
//                }, null, null, null, null, null) !== false) {
//                    if ((this.directEventConfig || {}).showWarningFailure !== false) {
//                        Ext.net.DirectEvent.showFailure(response, response.responseText);
//                    }
//                }
//            }, this);
//        }
//        this.addEvents({
//            "submit": true,
//            "submitexception": true,
//            "beforeremoteaction": true,
//            "remoteactionexception": true,
//            "remoteactionrefusal": true,
//            "remoteactionsuccess": true,
//            "beforeremotemove": true,
//            "beforeremoterename": true,
//            "beforeremoteremove": true,
//            "beforeremoteinsert": true,
//            "beforeremoteappend": true
//        });
//        if (this.sorter && !this.sorter.doSort) {
//            this.sorter = new Ext.tree.TreeSorter(this, this.sorter);
//        }
//        if (this.mode === "remote") {
//            this.mode = "local";
//            this.setMode("remote");
//        }
//        this.on("nodedragover", this.onNodeDragOver, this);
//    },
//    setMode: function (mode) {
//        if (mode === "remote" && this.mode === "local") {
//            this.localActions = this.localActions || [];
//            if (this.loader.preloadChildren) {
//                this.loader.on("load", this.onRemoteDoPreload);
//            }
//            if (this.editors) {
//                Ext.each(this.editors, function (editor) {
//                    editor.on("complete", this.onRemoteNodeEditComplete, this);
//                    editor.on("canceledit", this.onRemoteNodeCancelEdit, this);
//                }, this);
//            }
//            if (this.enableDD) {
//                this.on("beforenodedrop", this.onRemoteBeforeNodeDrop, this);
//            }
//        } else if (mode === "local" && this.mode === "remote") {
//            if (this.loader.preloadChildren) {
//                this.loader.un("load", this.onRemoteDoPreload);
//            }
//            if (this.editors) {
//                Ext.each(this.editors, function (editor) {
//                    editor.un("complete", this.onRemoteNodeEditComplete, this);
//                    editor.un("canceledit", this.onRemoteNodeCancelEdit, this);
//                }, this);
//            }
//            if (this.enableDD) {
//                this.un("beforenodedrop", this.onRemoteBeforeNodeDrop, this);
//            }
//        }
//        this.mode = mode;
//    },
//    onRemoteBeforeNodeDrop: function (e) {
//        if (this.mode === "local" || this.localActions.indexOf("move") !== -1) {
//            return true;
//        }
//        this.moveNodeRequest(e);
//        e.dropStatus = true;
//        return false;
//    },
//    remoteOptions: function (action, node) {
//        var dc = this.directEventConfig || {},
//            options = {
//                action: action,
//                node: node,
//                params: {}
//            };
//        if (this.fireEvent("beforeremoteaction", this, node, options, action) !== false) {
//            dc.userSuccess = this.remoteActionSuccess.createDelegate(this);
//            dc.userFailure = this.remoteActionFailure.createDelegate(this);
//            dc.extraParams = options.params;
//            dc.node = node;
//            dc.control = this;
//            dc.eventType = "postback";
//            dc.action = action;
//            if (!Ext.isEmpty(this[action + "Url"], false)) {
//                dc.url = this[action + "Url"];
//                dc.cleanRequest = true;
//            }
//            return dc;
//        }
//        return false;
//    },
//    remoteActionSuccess: function (response, result, context, type, action, extraParams, o) {
//        if (o.node) {
//            o.node.getUI().afterLoad();
//        }
//        var rParams;
//        try {
//            rParams = result.extraParamsResponse || result.response || (result.d ? result.d.response : {}) || {};
//            var responseObj = result.serviceResponse || result.d || result;
//            result = {
//                success: Ext.isDefined(responseObj.actionSuccess) ? responseObj.actionSuccess : responseObj.success,
//                msg: responseObj.message
//            };
//        } catch (ex) {
//            this.fireEvent("remoteactionexception", this, response, ex, o);
//            if (o.cancelWarningFailure !== true && (this.directEventConfig || {}).showWarningFailure !== false && !this.hasListener("remoteactionexception")) {
//                Ext.net.DirectEvent.showFailure(response, result.msg);
//            }
//            return;
//        }
//        if (result.success === false) {
//            this.fireEvent("remoteactionrefusal", this, response, {
//                message: result.msg
//            }, o, rParams);
//            if (o.action === "raAppend" || o.action === "reInsert") {
//                o.node.parentNode.removeChild(o.node);
//            }
//            return;
//        }
//        switch (o.action) {
//        case "raRename":
//            o.node.setText(rParams.ra_newText || rParams.text || Ext.util.Format.htmlDecode(o.raConfig.newText));
//            break;
//        case "raRemove":
//            o.node.parentNode.removeChild(o.node);
//            break;
//        case "raMove":
//            if (o.e.point === "append") {
//                o.e.target.expand();
//            }
//            if (!o.e.target.isLoaded || o.loaded) {
//                this.dropZone.completeDrop(o.e);
//            } else {
//                o.e.dropNode.remove();
//            }
//            break;
//        case "raAppend":
//        case "raInsert":
//            var id = rParams.ra_id || rParams.id;
//            if (id) {
//                o.node.setId(id);
//            }
//            if (rParams.ra_text || rParams.text) {
//                o.node.setText(rParams.ra_text || rParams.text);
//            }
//            o.node.select();
//            break;
//        }
//        this.fireEvent("remoteactionsuccess", this, o.node, action, o, rParams);
//    },
//    remoteActionFailure: function (response, result, context, type, action, extraParams, o) {
//        if (o.node) {
//            o.node.getUI().afterLoad();
//        }
//        this.fireEvent("remoteactionexception", this, response, {
//            message: response.statusText
//        }, o);
//        if (o.cancelWarningFailure !== true && (this.directEventConfig || {}).showWarningFailure !== false && !this.hasListener("remoteactionexception")) {
//            Ext.net.DirectEvent.showFailure(response, response.responseText);
//        }
//    },
//    onRemoteDoPreload: function (loader, node) {
//        node.cascade(function (n) {
//            loader.doPreload(n);
//        });
//    },
//    onRemoteNodeEditComplete: function (editor, value, startValue) {
//        if (editor.editNode.isNew) {
//            var insert = editor.editNode.insertAction;
//            delete editor.editNode.isNew;
//            delete editor.editNode.insertAction;
//            editor.editNode.setText(value);
//            this.appendChildRequest(editor.editNode, insert);
//            return;
//        }
//        this.renameNode(editor.editNode, value);
//        return false;
//    },
//    onRemoteNodeCancelEdit: function (editor, value, startValue) {
//        if (editor.editNode.isNew) {
//            editor.editNode.parentNode.removeChild(editor.editNode);
//        }
//    },
//    performRemoteAction: function (config) {
//        if (config.cleanRequest) {
//            if (this.remoteJson) {
//                config.json = true;
//                config.method = "POST";
//            }
//            config.extraParams = Ext.apply(config.extraParams, config.raConfig);
//            config.type = "load";
//        } else {
//            config.serviceParams = Ext.encode(config.raConfig);
//        }
//        config.node.getUI().beforeLoad();
//        Ext.net.DirectEvent.request(config);
//    },
//    moveNodeRequest: function (e) {
//        if (this.mode === "local" || this.localActions.indexOf("move") !== -1) {
//            return;
//        }
//        var dc = this.remoteOptions("raMove", e.dropNode);
//        if (dc !== false && this.fireEvent("beforeremotemove", this, e.dropNode, e.target, e, dc.extraParams) !== false) {
//            dc.e = e;
//            dc.loaded = e.target.loaded || e.target.loading;
//            dc.raConfig = {
//                id: e.dropNode.id,
//                targetId: e.target.id,
//                point: e.point
//            };
//            this.performRemoteAction(dc);
//        }
//    },
//    convertText: function (text) {
//        if (text === "&#160;") {
//            return "";
//        }
//        return Ext.util.Format.htmlEncode(text);
//    },
//    renameNode: function (node, newText) {
//        if (this.mode === "local" || this.localActions.indexOf("rename") !== -1) {
//            node.setText(newText);
//            return;
//        }
//        var dc = this.remoteOptions("raRename", node);
//        if (dc !== false && this.fireEvent("beforeremoterename", this, node, dc.extraParams) !== false) {
//            dc.raConfig = {
//                id: node.id,
//                newText: this.convertText(newText),
//                oldText: this.convertText(node.text)
//            };
//            this.performRemoteAction(dc);
//        }
//    },
//    removeNode: function (node) {
//        if (node.isRoot) {
//            return;
//        }
//        if (this.mode === "local" || this.localActions.indexOf("remove") !== -1) {
//            node.parentNode.removeChild(node);
//            return;
//        }
//        var dc = this.remoteOptions("raRemove", node);
//        if (dc !== false && this.fireEvent("beforeremoteremove", this, node, dc.extraParams) !== false) {
//            dc.raConfig = {
//                id: node.id
//            };
//            this.performRemoteAction(dc);
//        }
//    },
//    appendChildRequest: function (node, insert) {
//        if (this.mode === "local" || this.localActions.indexOf(insert ? "insert" : "append") !== -1) {
//            return;
//        }
//        var dc = this.remoteOptions("ra" + (insert ? "Insert" : "Append"), node);
//        if (dc !== false && this.fireEvent("beforeremote" + (insert ? "insert" : "append"), this, node, dc.extraParams, insert) !== false) {
//            dc.raConfig = {
//                id: node.id,
//                parentId: node.parentNode.id,
//                text: this.convertText(node.text)
//            };
//            this.performRemoteAction(dc);
//        }
//    },
//    onNodeDragOver: function (e) {
//        if (this.allowLeafDrop) {
//            e.target.leaf = false;
//        }
//    },
//    appendChild: function (parentNode, defaultText, insert, index) {
//        var node = parentNode,
//            nodeAttr = {},
//            child;
//        node.leaf = false;
//        node.expand(false, false);
//        if (Ext.isString(defaultText)) {
//            nodeAttr = {
//                text: defaultText || "",
//                loaded: true
//            };
//        } else {
//            nodeAttr = Ext.applyIf(defaultText, {
//                text: "",
//                loaded: true
//            });
//        }
//        if (insert) {
//            var beforeNode = index ? node.childNodes[index] : node.firstChild;
//            child = node.insertBefore(this.loader.createNode(nodeAttr), beforeNode);
//        } else {
//            child = node.appendChild(this.loader.createNode(nodeAttr));
//        }
//        child.isNew = true;
//        child.insertAction = insert;
//        this.startEdit(child);
//    },
//    insertBefore: function (node, defaultText) {
//        var nodeAttr = {},
//            child;
//        if (Ext.isString(defaultText)) {
//            nodeAttr = {
//                text: defaultText || "",
//                loaded: true
//            };
//        } else {
//            nodeAttr = Ext.applyIf(defaultText, {
//                text: "",
//                loaded: true
//            });
//        }
//        child = node.parentNode.insertBefore(this.loader.createNode(nodeAttr), node);
//        child.isNew = true;
//        child.insertAction = true;
//        this.startEdit(child);
//    },
//    startEdit: function (node, defer) {
//        if (typeof node === "string") {
//            node = this.getNodeById(node);
//        }
//        node.select();
//        if (this.editors) {
//            Ext.each(this.editors, function (ed) {
//                ed.beforeNodeClick(node, undefined, defer);
//            }, this);
//        }
//    },
//    completeEdit: function () {
//        if (this.editors) {
//            Ext.each(this.editors, function (ed) {
//                ed.completeEdit();
//            }, this);
//        }
//    },
//    cancelEdit: function () {
//        if (this.editors) {
//            Ext.each(this.editors, function (ed) {
//                ed.cancelEdit();
//            }, this);
//        }
//    },
//    onRender: function (ct, position) {
//        Ext.net.TreePanel.superclass.onRender.call(this, ct, position);
//        if (Ext.isEmpty(this.selectionSubmitConfig) || this.selectionSubmitConfig.disableAutomaticSubmit !== true) {
//            this.getSelectionModelField().render(this.el.parent() || this.el);
//            this.getCheckNodesField().render(this.el.parent() || this.el);
//            this.updateCheckSelection();
//        }
//    },
//    initEditors: function () {
//        if (this.editors) {
//            if (!Ext.isArray(this.editors)) {
//                this.editors = [this.editors];
//            }
//            Ext.each(this.editors, function (editor, index) {
//                editor.tree = this;
//                this.editors[index] = new Ext.net.TreeEditor(editor);
//            }, this);
//        }
//    },
//    initChildren: function (nodes) {
//        if (!Ext.isEmpty(nodes) && nodes.length > 0) {
//            var root = nodes[0],
//                rootNode = this.createNode(root);
//            this.setRootNode(rootNode);
//            if (root.children) {
//                rootNode.beginUpdate();
//                this.setChildren(root, rootNode);
//                rootNode.endUpdate();
//            }
//        }
//    },
//    setChildren: function (parent, node) {
//        var i = 0;
//        for (i; i < parent.children.length; i++) {
//            var child = parent.children[i],
//                childNode = this.createNode(child);
//            node.appendChild(childNode);
//            if (child.children) {
//                this.setChildren(child, childNode);
//            }
//        }
//    },
//    createNode: function (config) {
//        var type = config.nodeType || "node";
//        if (this.loader.baseAttrs) {
//            Ext.applyIf(config, this.loader.baseAttrs);
//        }
//        if (Ext.isString(config.uiProvider)) {
//            config.uiProvider = this.loader.uiProviders[config.uiProvider] || eval(config.uiProvider);
//        }
//        if (config.nodeType) {
//            return new Ext.tree.TreePanel.nodeTypes[config.nodeType](config);
//        } else {
//            if (type === "node" || config.leaf) {
//                return new Ext.tree.TreeNode(config);
//            }
//        }
//        return new Ext.tree.AsyncTreeNode(config);
//    },
//    getSelectionModelField: function () {
//        if (!this.selectionModelField) {
//            this.selectionModelField = new Ext.form.Hidden({
//                id: this.id + "_SM",
//                name: this.id + "_SM"
//            });
//            this.on("beforedestroy", function () {
//                if (this.rendered) {
//                    this.destroy();
//                }
//            }, this.selectionModelField);
//        }
//        return this.selectionModelField;
//    },
//    getCheckNodesField: function () {
//        if (!this.checkNodesField) {
//            this.checkNodesField = new Ext.form.Hidden({
//                id: this.id + "_CheckNodes",
//                name: this.id + "_CheckNodes"
//            });
//            this.on("beforedestroy", function () {
//                if (this.rendered) {
//                    this.destroy();
//                }
//            }, this.checkNodesField);
//        }
//        return this.checkNodesField;
//    },
//    excludeAttributes: ["expanded", "allowDrag", "allowDrop", "disabled", "icon", "cls", "loader", "children", "iconCls", "href", "hrefTarget", "qtip", "singleClickExpand", "uiProvider"],
//    defaultAttributeFilter: function (attrName, attrValue) {
//        return typeof attrValue !== "function" && this.excludeAttributes.indexOf(attrName) === -1;
//    },
//    defaultNodeFilter: function (node) {
//        return true;
//    },
//    serializeTree: function (config) {
//        config = config || {};
//        if (Ext.isEmpty(config.withChildren)) {
//            config.withChildren = true;
//        }
//        return Ext.encode(this.convertToSubmitNode(this.getRootNode(), config));
//    },
//    convertToSubmitNode: function (node, config) {
//        config = config || {};
//        if (!config.prepared) {
//            config.attributeFilter = config.attributeFilter || this.defaultAttributeFilter.createDelegate(this);
//            config.nodeFilter = config.nodeFilter || this.defaultNodeFilter.createDelegate(this);
//            config.prepared = true;
//        }
//        if (!config.nodeFilter(node)) {
//            return;
//        }
//        var sNode = {},
//            path = node.getPath(config.pathAttribute || "id"),
//            deleteAttrs = true;
//        if (config.attributeFilter("id", node.id)) {
//            sNode.nodeID = node.id;
//        }
//        if (config.attributeFilter("text", node.text)) {
//            sNode.text = config.encode ? Ext.util.Format.htmlEncode(node.text) : node.text;
//        }
//        if (config.attributeFilter("path", path)) {
//            sNode.path = path;
//        }
//        sNode.attributes = {};
//        var attr;
//        for (attr in node.attributes) {
//            if (attr === "id" || attr === "text") {
//                continue;
//            }
//            var attrValue = node.attributes[attr];
//            if (config.attributeFilter(attr, attrValue)) {
//                sNode.attributes[attr] = attrValue;
//                deleteAttrs = false;
//            }
//        }
//        if (deleteAttrs) {
//            delete sNode.attributes;
//        }
//        if (config.withChildren) {
//            var children = node.childNodes,
//                i = 0;
//            if (children.length !== 0) {
//                sNode.children = [];
//                for (i; i < children.length; i++) {
//                    var cNode = this.convertToSubmitNode(children[i], config);
//                    if (!Ext.isEmpty(cNode)) {
//                        sNode.children.push(cNode);
//                    }
//                }
//                if (sNode.children.length === 0) {
//                    delete sNode.children;
//                }
//            }
//        }
//        return sNode;
//    },
//    getSelectedNodes: function (config) {
//        var sm = this.getSelectionModel();
//        if (!sm.selMap) {
//            if (sm.selNode) {
//                return this.convertToSubmitNode(sm.selNode, config);
//            }
//            return;
//        }
//        if (Ext.isEmpty(sm.selNodes)) {
//            return [];
//        }
//        var selNodes = [];
//        Ext.each(sm.selNodes, function (node) {
//            selNodes.push(this.convertToSubmitNode(node, config));
//        }, this);
//        return selNodes;
//    },
//    getCheckedNodes: function (config) {
//        var checkedNodes = this.getChecked();
//        if (Ext.isEmpty(checkedNodes)) {
//            return [];
//        }
//        var nodes = [];
//        Ext.each(checkedNodes, function (node) {
//            nodes.push(this.convertToSubmitNode(node, config));
//        }, this);
//        return nodes;
//    },
//    updateSelection: function () {
//        this.selectionSubmitConfig = this.selectionSubmitConfig || {};
//        if (Ext.isEmpty(this.selectionSubmitConfig.withChildren)) {
//            this.selectionSubmitConfig.withChildren = false;
//        }
//        var selection = this.getSelectedNodes(this.selectionSubmitConfig);
//        if (!Ext.isEmpty(selection)) {
//            this.getSelectionModelField().setValue(Ext.encode(selection));
//        } else {
//            this.getSelectionModelField().setValue("");
//        }
//    },
//    updateCheckSelection: function () {
//        this.selectionSubmitConfig = this.selectionSubmitConfig || {};
//        if (Ext.isEmpty(this.selectionSubmitConfig.withChildren)) {
//            this.selectionSubmitConfig.withChildren = false;
//        }
//        var selection = this.getCheckedNodes(this.selectionSubmitConfig);
//        if (!Ext.isEmpty(selection)) {
//            this.getCheckNodesField().setValue(Ext.encode(selection));
//        } else {
//            this.getCheckNodesField().setValue("");
//        }
//    },
//    submitNodes: function (config) {
//        var nodes = this.serializeTree(config),
//            ac = Ext.apply(this.directEventConfig || {}, config);
//        if (ac.params) {
//            ac.extraParams = ac.params;
//            delete ac.params;
//        }
//        if (ac.callback) {
//            ac.userCallback = ac.callback;
//            delete ac.callback;
//        }
//        if (ac.scope) {
//            ac.userScope = ac.scope;
//            delete ac.scope;
//        }
//        Ext.apply(ac, {
//            control: this,
//            eventType: "postback",
//            action: "submit",
//            serviceParams: nodes,
//            userSuccess: this.submitSuccess,
//            userFailure: this.submitFailure
//        });
//        Ext.net.DirectEvent.request(ac);
//    },
//    submitFailure: function (response, result, context, type, action, extraParams, o) {
//        var msg = {
//            message: result.errorMessage || response.statusText
//        };
//        if (o && o.userCallback) {
//            o.userCallback.call(o.userScope || context, o, false, response);
//        }
//        if (!context.hasListener("submitexception")) {
//            if (o.showWarningOnFailure !== false && o.cancelFailureWarning !== true) {
//                Ext.net.DirectEvent.showFailure(response, msg.message);
//            }
//        }
//        context.fireEvent("submitexception", context, o, response, msg);
//    },
//    submitSuccess: function (response, result, context, type, action, extraParams, o) {
//        try {
//            var responseObj = result.serviceResponse;
//            result = {
//                success: responseObj.success,
//                msg: responseObj.message
//            };
//        } catch (e) {
//            if (o && o.userCallback) {
//                o.userCallback.call(o.userScope || context, o, false, response);
//            }
//            if (Ext.net.DirectEvent.fireEvent("ajaxrequestexception", {}, {
//                "errorMessage": e.message
//            }, null, null, null, null, o) !== false) {
//                if (!context.hasListener("submitexception")) {
//                    if (o.showWarningOnFailure !== false) {
//                        Ext.net.DirectEvent.showFailure(response, e.message);
//                    }
//                }
//            }
//            context.fireEvent("submitexception", context, o, response, e);
//            return;
//        }
//        if (!result.success) {
//            if (o && o.userCallback) {
//                o.userCallback.call(o.userScope || context, o, false, response);
//            }
//            if (Ext.net.DirectEvent.fireEvent("ajaxrequestexception", {}, {
//                "errorMessage": result.msg
//            }, null, null, null, null, o) !== false) {
//                if (!context.hasListener("submitexception")) {
//                    if (o.showWarningOnFailure !== false) {
//                        Ext.net.DirectEvent.showFailure(response, result.msg);
//                    }
//                }
//            }
//            context.fireEvent("submitexception", context, o, response, {
//                message: result.msg
//            });
//            return;
//        }
//        if (o && o.userCallback) {
//            o.userCallback.call(o.userScope || context, o, true, response);
//        }
//        context.fireEvent("submit", context, o);
//    },
//    filterBy: function (fn, config) {
//        config = config || {};
//        var startNode = config.startNode || this.root;
//        if (config.autoClear) {
//            this.clearFilter();
//        }
//        var af = this.filtered;
//        var f = function (n) {
//            if (n === startNode) {
//                return true;
//            }
//            if (af[n.id]) {
//                return false;
//            }
//            var m = fn.call(config.scope || n, n);
//            if (!m) {
//                af[n.id] = n;
//                n.ui.hide();
//            } else {
//                n.ui.show();
//                n.bubble(function (p) {
//                    if (p.id === this.root.id) {
//                        return false;
//                    }
//                    p.ui.show();
//                }, this);
//            }
//            return true;
//        };
//        startNode.cascade(f, this);
//        if (config.expandNodes !== false) {
//            startNode.expand(true, false);
//        }
//        if (config.remove) {
//            var id;
//            for (id in af) {
//                if (typeof id !== "function") {
//                    var n = af[id];
//                    if (n && n.parentNode) {
//                        n.parentNode.removeChild(n);
//                    }
//                }
//            }
//        }
//    },
//    clearFilter: function () {
//        var af = this.filtered || {},
//            id;
//        for (id in af) {
//            if (typeof id !== "function") {
//                var n = af[id];
//                if (n) {
//                    n.ui.show();
//                }
//            }
//        }
//        this.filtered = {};
//    },
//    toggleChecked: function (startNode, value) {
//        startNode = startNode || this.root;
//        var f = function () {
//            if (this.getUI().rendered) {
//                this.getUI().toggleCheck(Ext.isDefined(value) ? value : !this.attributes.checked);
//            } else {
//                if (Ext.isDefined(this.attributes.checked)) {
//                    this.attributes.checked = Ext.isDefined(value) ? value : !this.attributes.checked;
//                }
//            }
//        };
//        startNode.cascade(f);
//    },
//    clearChecked: function (startNode) {
//        this.toggleChecked(startNode, false);
//    },
//    setAllChecked: function (startNode) {
//        this.toggleChecked(startNode, true);
//    },
//    setChecked: function (cfg) {
//        cfg = cfg || {};
//        if (cfg.silent) {
//            this.suspendEvents();
//        }
//        if (cfg.keepExisting !== true) {
//            this.clearChecked();
//        }
//        cfg.value = Ext.isDefined(cfg.value) ? cfg.value : true;
//        var i = 0,
//            l;
//        for (i, l = cfg.ids.length; i < l; i++) {
//            var node = this.getNodeById(cfg.ids[i]);
//            if (node.getUI().rendered) {
//                node.getUI().toggleCheck(cfg.value);
//            } else {
//                node.attributes.checked = cfg.value;
//            }
//        }
//        if (cfg.silent) {
//            this.resumeEvents();
//        }
//    },
//    clearContent: Ext.emptyFn
//});
//Ext.reg("nettreepanel", Ext.net.TreePanel);

//Ext.override(Ext.tree.TreeNode, {
//    removeChildren: function () {
//        while (this.childNodes.length > 0) {
//            this.removeChild(this.childNodes[0]);
//        }
//    },
//    clone: function (newId) {
//        var atts = this.attributes;
//        atts.id = (newId !== false) ? Ext.id() : this.id;
//        var clonedNode = new Ext.tree.TreeNode(Ext.apply({}, atts)),
//            i = 0;
//        clonedNode.text = this.text;
//        for (i; i < this.childNodes.length; i++) {
//            clonedNode.appendChild(this.childNodes[i].clone(newId));
//        }
//        return clonedNode;
//    }
//});

//Ext.tree.TreeNodeUI.prototype.renderElements = Ext.tree.TreeNodeUI.prototype.renderElements.createSequence(function (n, a, targetNode, bulkRender) {
//    if (n.hidden) {
//        this.hide();
//    }
//});
//Ext.tree.TreeNodeUI.override({
//    collapse: function () {
//        this.updateExpandIcon();
//        if (this.rendered) {
//            this.ctNode.style.display = "none";
//        }
//    }
//});

//Ext.tree.AsyncTreeNode.override({
//    loadNodes: function (nodes) {
//        this.beginUpdate();
//        var i = 0,
//            len;
//        for (i, len = nodes.length; i < len; i++) {
//            var n = this.getOwnerTree().getLoader().createNode(nodes[i]);
//            if (!Ext.isEmpty(n)) {
//                if (this.getOwnerTree().getLoader().preloadChildren) {
//                    this.getOwnerTree().getLoader().doPreload(n);
//                }
//                this.appendChild(n);
//            }
//        }
//        this.endUpdate();
//        this.loadComplete();
//    }
//});

//Ext.tree.TreeLoader.override({
//    requestData: function (node, callback, scope) {
//        if (this.fireEvent("beforeload", this, node, callback) !== false) {
//            var o = {
//                method: this.requestMethod,
//                url: this.dataUrl || this.url,
//                success: this.handleResponse,
//                failure: this.handleFailure,
//                scope: this,
//                timeout: this.timeout || 30000,
//                argument: {
//                    callback: callback,
//                    node: node,
//                    scope: scope
//                }
//            };
//            if (this.json) {
//                o.jsonData = this.getParams(node);
//            } else {
//                o.params = this.getParams(node);
//            }
//            this.transId = Ext.Ajax.request(o);
//        } else {
//            this.runCallback(callback, scope || node, []);
//        }
//    },
//    createNode: function (attr) {
//        if (this.baseAttrs) {
//            Ext.applyIf(attr, this.baseAttrs);
//        }
//        if (this.applyLoader !== false && !attr.loader) {
//            attr.loader = this;
//        }
//        if (typeof attr.uiProvider === "string") {
//            attr.uiProvider = this.uiProviders[attr.uiProvider] || eval(attr.uiProvider);
//        }
//        var node;
//        if (attr.nodeType) {
//            node = new Ext.tree.TreePanel.nodeTypes[attr.nodeType](attr);
//        } else {
//            node = attr.leaf ? new Ext.tree.TreeNode(attr) : new Ext.tree.AsyncTreeNode(attr);
//        }
//        if (this.preloadChildren) {
//            this.doPreload(node);
//        }
//        return node;
//    }
//});

//Ext.NetServiceTreeLoader = Ext.extend(Ext.tree.TreeLoader, {
//    processResponse: function (response, node, callback, scope) {
//        var json, root;
//        if (this.json) {
//            root = Ext.decode(response.responseText);
//            json = root.d || root;
//        } else {
//            var xmlData = response.responseXML;
//            root = xmlData.documentElement || xmlData;
//            json = Ext.DomQuery.selectValue("json", root, "");
//        }
//        try {
//            var o = Ext.isString(json) ? eval("(" + json + ")") : json,
//                i = 0,
//                len;
//            node.beginUpdate();
//            for (i, len = o.length; i < len; i++) {
//                var n = this.createNode(o[i]);
//                if (n) {
//                    node.appendChild(n);
//                }
//            }
//            node.endUpdate();
//            this.runCallback(callback, scope || node, [node]);
//        } catch (e) {
//            this.handleFailure(response);
//        }
//    }
//});

//Ext.net.PageTreeLoader = Ext.extend(Ext.tree.TreeLoader, {
//    load: function (node, callback) {
//        if (this.clearOnLoad) {
//            while (node.firstChild) {
//                node.removeChild(node.firstChild);
//            }
//        }
//        if (this.doPreload(node)) {
//            if (typeof callback === "function") {
//                callback();
//            }
//        } else {
//            this.requestData(node, callback);
//        }
//    },
//    requestData: function (node, callback) {
//        if (this.fireEvent("beforeload", this, node, callback) !== false) {
//            var config = {};
//            Ext.apply(config, {
//                control: node.getOwnerTree(),
//                eventType: "postback",
//                action: "nodeload",
//                userSuccess: this.handleSuccess,
//                userFailure: this.handleFailure,
//                argument: {
//                    callback: callback,
//                    node: node
//                },
//                extraParams: this.getParams(node),
//                method: this.method,
//                timeout: this.timeout || 30000,
//                isUpload: this.isUpload,
//                viewStateMode: this.viewStateMode,
//                type: this.type,
//                url: this.url,
//                formProxyArg: this.formProxyArg,
//                eventMask: this.eventMask
//            });
//            Ext.net.DirectEvent.request(config);
//        } else {
//            if (typeof callback === "function") {
//                callback();
//            }
//        }
//    },
//    handleFailure: function (response, result, context, type, action, extraParams) {
//        var loader = context.getLoader(),
//            a;
//        loader.transId = false;
//        a = response.argument;
//        loader.fireEvent("loadexception", loader, a.node, response, result.errorMessage || response.statusText);
//        if (typeof a.callback === "function") {
//            a.callback(loader, a.node);
//        }
//    },
//    handleSuccess: function (response, result, context, type, action, extraParams) {
//        var loader = context.getLoader(),
//            serviceResponse = result.serviceResponse || {},
//            a;
//        loader.transId = false;
//        a = response.argument;
//        loader.processResponse(response, serviceResponse.data || [], a.node, a.callback);
//        loader.fireEvent("load", loader, a.node, response);
//    },
//    getParams: function (node) {
//        var buf = {},
//            bp = this.baseParams,
//            key;
//        for (key in bp) {
//            if (typeof bp[key] !== "function") {
//                buf[key] = bp[key];
//            }
//        }
//        buf.node = node.id;
//        return buf;
//    },
//    processResponse: function (response, data, node, callback) {
//        try {
//            var o = data,
//                i = 0,
//                len;
//            node.beginUpdate();
//            for (i, len = o.length; i < len; i++) {
//                var n = this.createNode(o[i]);
//                if (n) {
//                    node.appendChild(n);
//                }
//            }
//            node.endUpdate();
//            if (typeof callback === "function") {
//                callback(this, node);
//            }
//        } catch (e) {
//            this.handleFailure(response);
//        }
//    }
//});

//Ext.override(Ext.tree.MultiSelectionModel, {
//    onNodeClick: function (node, e) {
//        var keep = e.ctrlKey || this.keepSelectionOnClick === "always";
//        if (keep && this.isSelected(node)) {
//            this.unselect(node);
//        } else {
//            this.select(node, e, keep);
//        }
//    }
//});

//Ext.net.TreeEditor = function (config) {
//    Ext.net.TreeEditor.superclass.constructor.call(this, config.tree, {}, config);
//};
//Ext.extend(Ext.net.TreeEditor, Ext.tree.TreeEditor, {
//    autoEdit: true,
//    initEditor: function (tree) {
//        if (this.autoEdit) {
//            this.autoEdit = false;
//            this.setAutoEdit(true);
//        }
//        this.on("complete", this.updateNode, this);
//        this.on("beforestartedit", this.fitToTree, this);
//        this.on("startedit", this.bindScroll, this, {
//            delay: 10
//        });
//        this.on("specialkey", this.onSpecialKey, this);
//        tree.on("beforedestroy", function () {
//            this.destroy();
//        }, this);
//    },
//    setAutoEdit: function (autoEdit) {
//        if (autoEdit && !this.autoEdit) {
//            this.tree.on("beforeclick", this.beforeNodeClick, this);
//            this.tree.on("dblclick", this.onNodeDblClick, this);
//            this.autoEdit = autoEdit;
//            return;
//        }
//        if (!autoEdit && this.autoEdit) {
//            this.tree.un("beforeclick", this.beforeNodeClick, this);
//            this.tree.un("dblclick", this.onNodeDblClick, this);
//            this.autoEdit = autoEdit;
//            return;
//        }
//    },
//    beforeNodeClick: function (node, e, defer) {
//        clearTimeout(this.autoEditTimer);
//        if (this.tree.getSelectionModel().isSelected(node)) {
//            if (this.filter) {
//                if (((this.filter.attribute === "text" || this.filter.attribute === "id") ? node[this.filter.attribute] : node.attributes[this.filter.attribute]) !== this.filter.value) {
//                    return;
//                }
//            }
//            if (!Ext.isEmpty(this.tree.activeEditor, false) && this.tree.activeEditor !== this.id) {
//                return;
//            }
//            Ext.each(this.tree.editors, function (editor) {
//                editor.completeEdit();
//            }, this);
//            return this.triggerEdit(node, defer);
//        }
//    }
//});
//Ext.reg("treeeditor", Ext.net.TreeEditor);

