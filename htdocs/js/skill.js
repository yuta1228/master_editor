Ext.Loader.setConfig({
    enabled: true
});
//    Ext.Loader.setPath('Ext.ux', 'http://dev.sencha.com/deploy/ext-4.0.0/examples/ux');
Ext.require([
    'Ext.selection.CellModel',
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.state.*',
    'Ext.form.*',
    'Ext.encode',
    'Ext.app.Controller'
]);

Ext.onReady(function(){
    Ext.define('Skill', {
        extend: 'Ext.data.Model',
        idProperty:'_id',
        fields: ["_id",
            "name_ja","name_en", "desc_ja", "desc_en", "animation", "element", "attribute", "buff", "atk"]
    });

    function rendererFactory(category, enums){
        if (category === null){
            return null
        }
        var f = function(v){
            return enums[category][v];
        }
        return f;

    }
    function editorFactory(type, cat, enums){
        if (type == "combo" && cat != null){
            var combo_values = [];
            for (i=0; i<enums[cat].length; i++){
                combo_values.push([i,enums[cat][i]]);
            }
            var func = {
                id: cat+'Combo',
                xtype: 'combo',
                typeAhead: true,
                selectOnTab: true,
                triggerAction: 'all',
                transform:'light',
                lazyRenderer: true,
                listClass: 'x-combo-list-small',
                store:combo_values
            };
            return func;
        }else if (type == "int"){
            return {xtype: 'numberfield',allowBlank: false,minValue: 0,maxValue: 100000};
        }else{
            return {xtype: 'textfield', allowBlank:true};
        }
        return null;
    }


    // create the Data Store
    store = Ext.create('Ext.data.Store', {
        model: 'Skill',
        updated: false,
        pageSize: 5,
        listeners:{
            update:function(){
                this.updated = true;
            }
        },
        actionMethods: {
            //create: 'POST',
            //destroy: 'POST',
            read: 'POST',
            update: 'POST'
        },
        api:{
            read: 'api/skill',
            update: 'api/skill'
        },
        proxy: {
            type: 'ajax',
            url: 'api/skill',
            writer: 'json',

            reader: {
                type: 'json',
                root: 'data',
                data_type:'data_type'
            }
        }
    });

    store.load({
        // store loading is asynchronous, use a load listener or callback to handle results
        callback: function(records, operation, success){
            var raw_data = this.proxy.getReader().rawData;
            var grid_columns = [];
            var ref = raw_data.reference;
            for (var i =0; i< ref.length; i++){
                grid_columns.push({
                    header:ref[i][1],
                    dataIndex:ref[i][0],
                    renderer:rendererFactory(ref[i][3],raw_data['enums']),
                    field:editorFactory(ref[i][4],ref[i][3],raw_data['enums'])
                });
            }
            var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 1
            });

            var grid = Ext.create('Ext.grid.Panel', {
                storeId: "SkillGrid",
                store: store,
                columns: grid_columns,
                selModel: {selType: 'cellmodel'},
                renderTo: 'editor-grid',
                height: 300,
                title: 'Edit Skills?',
                frame: true,
                tbar: [{text: 'Add Skill',
                    handler : function(){
                        // Create a model instance
                        var r = Ext.create('Skill', {
                            name_ja: '新スキル',
                            desc_ja: '',
                            animation: 0,
                            element: 0,
                            attribute: 0,
                            buff: 0,
                            atk: 100
                        });
                        store.insert(0, r);
                        cellEditing.startEditByPosition({row: 0, column: 0});
                    }
                },
                    {
                        xtype: 'button',
                        text: 'Save',
                        handler : function(){
                            store.sync();
                        }}
                ],
                dockedItems: [{
                    xtype: 'pagingtoolbar',
                    store: store,   // same store GridPanel is using
                    dock: 'bottom',
                    displayInfo: true,
                    listeners:{
                        beforechange:function(){
                            if(store.updated == true){
                                store.sync();
                                store.updated = false;
                            }
                        }
                    }
                }],
                plugins: [cellEditing]
            });
        }
    });

});