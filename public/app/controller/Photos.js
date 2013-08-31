Ext.define('PS.controller.Photos', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
            'main': 'main',
            'feed': 'feed',
            'form': 'photoform'
        },
        control: {
            'feed': {
                'create': 'onCreate',
                'edit': 'onEdit'
            },
            'photoform': {
                'back': 'onBack',
                'save': 'onSave',
                'delete': 'onDelete'
            }
        }
    },

    onCreate: function() {
        var me = this,
            form = me.getForm();

        form.reset();
        form.setRecord(null);
        form.setTitle('');
        form.showDeleteButton(false);
        me.showForm();
    },

    onEdit: function(record) {
        var me = this,
            form = me.getForm();

        form.setRecord(record);
        form.setTitle(record.get('caption'));
        form.showDeleteButton(true);
        me.showForm();
    },

    onBack: function() {
        this.showFeed();
    },

    onSave: function() {
        var me = this,
            form = me.getForm(),
            record = form.getRecord(),
            store = Ext.getStore('Photos');

        if (Ext.isEmpty(record)) {
            record = Ext.create('PS.model.Photo');
            store.add(record);
        }

        Ext.Object.each(form.getValues(), function(key, value) {
            record.set(key, value);
        });

        me.patchForMongo(record);  // XXX
        store.sync();

        me.showFeed();
    },

    onDelete: function() {
        var me = this,
            form = me.getForm(),
            record = form.getRecord(),
            store = Ext.getStore('Photos');

        store.remove(record);

        me.patchForMongo(record);  // XXX
        store.sync();

        me.showFeed();
    },

    showForm: function() {
        var me = this,
            main = me.getMain(),
            form = me.getForm();

        main.animateActiveItem(form, {
            type: 'slide',
            direction: 'left'
        });
    },

    showFeed: function() {
        var me = this,
            main = me.getMain(),
            feed = me.getFeed();

        main.animateActiveItem(feed, {
            type: 'slide',
            direction: 'right'
        });
    },

    patchForMongo: function(record) {
        var mongoId = record.get('_id');
        if (mongoId) {
            record.set('id', mongoId);
        }
    }

});
