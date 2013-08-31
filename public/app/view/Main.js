Ext.define('PS.view.Main', {
    extend: 'Ext.Container',
    xtype: 'main',
    config: {
        layout: 'card',
        items: [
            {
                xtype: 'feed'
            },
            {
                xtype: 'photoform'
            }
        ]
    },

    initialize: function() {
        this.callParent(arguments);

        // this.down('photoform').setRecord(Ext.create('PS.model.Photo', {
        //     data: 'Hello!',
        //     caption: 'Sencha'
        // }));



    }
});
