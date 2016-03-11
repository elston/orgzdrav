function yesno(msg,vfn){
    //..
    if (this && this['getSelectionModel'] && !this.getSelectionModel().getSelected()) return;            
    //..                
    function fn(btn,ev){
        if (btn !== 'yes')  return ;        
        if (!vfn)  return ;    
        vfn.createDelegate(this)();
    };
    Ext.Msg.show({
       title:'Внимание!',
       msg: msg,
       buttons: Ext.Msg.YESNO,
       animEl: 'elId',
       fn:fn,
       scope:this,                                      
    });     
}
