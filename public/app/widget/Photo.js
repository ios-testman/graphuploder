/**
 * @class PS.widget.Photo
 * @extends Ext.Component
 * Photo widget
 */
Ext.define('PS.widget.Photo', {
    extend: 'Ext.Component',
    xtype: 'photofield',
    config: {
        name: '',
        value: '',
        style: 'padding: .5em;'
    },
    template: [
        {
            tag: 'img',
            reference: 'imgElement',
            width: '100%',
            hidden: true,
            style: 'margin: 0 0 .5em; border-radius: .3em;'
        },
        {
            tag: 'input',
            reference: 'fileElement',
            type: 'file',
            accept: 'image/*',
            hidden: true
        },
        {
            tag: 'div',
            reference: 'iconElement',
            html: 'P',
            style: 'font-family: "Pictos"; text-align: center; font-size: 2em;',
            hidden: true
        }
    ],
    isField: true,

    initialize: function() {
        var me = this,
            fileElem = me.fileElement.dom;

        fileElem.onchange = function() {
            me.onChanged.apply(me, arguments);
        };

        me.element.on('tap', function() {
            me.fileElement.dom.click();
        });
    },

    onChanged: function(e) {
        var me = this,
            files = e.target.files;

        var reader = new FileReader();

        reader.onerror = function(e) {
            Ext.Msg.alert('Error', 'Failed to upload data.');
        };

        reader.onload = function(e) {
            var value = this.result;
            me.setValue(value);
            me.showPreview(value);
        };

        reader.readAsDataURL(files[0]);
    },

    showPreview: function(data) {
        var me = this,
            elem = me.imgElement.dom;

        elem.src = data;
    },

    updateValue: function(value) {
        var me = this;
        me.showPreview(value);
        me.displayElement();
    },

    displayElement: function() {
        var me = this,
            hasValue = Ext.isEmpty(me.getValue()) === false;

        me.iconElement.dom.style.display = hasValue ? 'none' : 'block';
        me.imgElement.dom.style.display = hasValue ? 'block' : 'none';
    },

    reset: function() {
        var me = this,
            elem = me.imgElement.dom;

        me.setValue('');
        elem.innerHTML = elem.innerHTML;
        me.displayElement();
    }

});
