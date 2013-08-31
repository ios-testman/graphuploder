/**
 * @class PS.store.Photos
 * @extends Ext.data.Store
 * Description
 */
Ext.define('PS.store.Photos', {
    extend: 'Ext.data.Store',
    requires: [
        'Ext.data.proxy.Rest',
        'Ext.data.proxy.LocalStorage'
    ],

    config: {
        model: 'PS.model.Photo',
        proxy: {
            // type: 'localstorage',
            // id: 'PS',
            type: 'rest',
            url: '/photos'
        },
        autoLoad: true
    }
});
