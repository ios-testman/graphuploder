Ext.define('PS.view.PhotoForm', {
    extend: 'Ext.form.Panel',
    xtype: 'photoform',
    requires: [
        'PS.widget.Photo',
        'Ext.TitleBar',
        'Ext.form.FieldSet'
    ],

    config: {
        cls: 'photo-form',
        title: 'PhotoForm',
        items: [
            {
                xtype: 'titlebar',
                docked: 'top',
                items: [
                    {
                        ui: 'back',
                        text: 'back',
                        itemId: 'back'
                    }
                ]
            },
            {
                xtype: 'fieldset',
                title: 'Photo',
                items: [
                    {
                        name: 'data',
                        xtype: 'photofield'
                    },
                    {
                        name: 'caption',
                        xtype: 'textareafield',
                        label: 'Caption'
                    }
                ]
            },
            {
                xtype: 'button',
                itemId: 'share',
                text: 'Share',
                ui: 'action'
            },
            {
                xtype: 'toolbar',
                docked: 'bottom',
                layout: {
                    pack: 'right'
                },
                items: [
                    {
                        itemId: 'delete',
                        iconCls: 'trash',
                        iconMask: true
                    }
                ]
            }
        ],
        control: {
            'button[itemId=back]': {
                tap: function() {
                    this.fireEvent('back');
                }
            },
            'button[itemId=share]': {
                tap: function() {
                    this.fireEvent('save');
                }
            },
            'button[itemId=delete]': {
                tap: function() {
                    this.fireEvent('delete');
                }
            }
        }
    },

    setTitle: function(title) {
       this.down('titlebar').setTitle(title);
    },

    showDeleteButton: function(show) {
        this.down('button[itemId=delete]').setHidden(!show);
    }
});
