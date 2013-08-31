Ext.define('PS.model.Photo', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            { name: 'id', type: 'string' },
            { name: 'data', type: 'string' },
            { name: 'caption', type: 'string' },
            { name: '_id', type: 'string' }  // XXX for MongoDB
        ],
        identifier: 'uuid'
    }
});
