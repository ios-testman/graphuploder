/**
 * @class PS.view.Feed
 * @extends Ext.Container
 * Description
 */
Ext.define('PS.view.Feed', {
    extend: 'Ext.Container',
    xtype: 'feed',
    requires: [
        'Ext.dataview.DataView'
    ],

    config: {
        layout: 'vbox',
        items: [
            {
                xtype: 'titlebar',
                title: 'Photo Sharing'
            },
            {
                xtype: 'dataview',
                // data: [
                //     { caption: 'apple' },
                //     { caption: 'grape' },
                //     { caption: 'cake' }
                // ],
                store: 'Photos',
                cls: 'feed',
                itemCls: 'feed-item',
                itemTpl: [
                    '<img src="{data}" width="100%">',
                    '<div class="description">',
                        '{caption}',
                    '</div>'
                ],
                flex: 1
            },
            {
                xtype: 'toolbar',
                docked: 'bottom',
                layout: {
                    pack: 'center'
                },
                items: [
                    {
                        itemId: 'camera',
                        iconMask: true,
                        iconCls: 'camera'
                    }
                ]
            }
        ],
        control: {
            'button[itemId=camera]': {
                tap: function() {
                    this.fireEvent('create');
                }
            },
            'dataview': {
                itemtap: function(list, item, target, record) {
                    this.fireEvent('edit', record);
                }
            }
        }
    }
});
