(function() {
    var global = this,
        objectPrototype = Object.prototype,
        toString = objectPrototype.toString,
        enumerables = true,
        enumerablesTest = { toString: 1 },
        emptyFn = function(){},
        i;

    if (typeof Ext === 'undefined') {
        global.Ext = {};
    }

    Ext.global = global;

    for (i in enumerablesTest) {
        enumerables = null;
    }

    if (enumerables) {
        enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable',
                       'toLocaleString', 'toString', 'constructor'];
    }

    Ext.enumerables = enumerables;

    Ext.apply = function(object, config, defaults) {
        if (defaults) {
            Ext.apply(object, defaults);
        }

        if (object && config && typeof config === 'object') {
            var i, j, k;

            for (i in config) {
                object[i] = config[i];
            }

            if (enumerables) {
                for (j = enumerables.length; j--;) {
                    k = enumerables[j];
                    if (config.hasOwnProperty(k)) {
                        object[k] = config[k];
                    }
                }
            }
        }

        return object;
    };

    Ext.buildSettings = Ext.apply({
        baseCSSPrefix: 'x-',
        scopeResetCSS: false
    }, Ext.buildSettings || {});

    Ext.apply(Ext, {
        emptyFn: emptyFn,

        baseCSSPrefix: Ext.buildSettings.baseCSSPrefix,

        applyIf: function(object, config) {
            var property;

            if (object) {
                for (property in config) {
                    if (object[property] === undefined) {
                        object[property] = config[property];
                    }
                }
            }

            return object;
        },

        iterate: function(object, fn, scope) {
            if (Ext.isEmpty(object)) {
                return;
            }

            if (scope === undefined) {
                scope = object;
            }

            if (Ext.isIterable(object)) {
                Ext.Array.each.call(Ext.Array, object, fn, scope);
            }
            else {
                Ext.Object.each.call(Ext.Object, object, fn, scope);
            }
        }
    });

    Ext.apply(Ext, {
	extend: function() {
               // inline overrides
               var objectConstructor = objectPrototype.constructor,
                   inlineOverrides = function(o) {
                   for (var m in o) {
                       if (!o.hasOwnProperty(m)) {
                           continue;
                       }
                       this[m] = o[m];
                   }
               };
  
               return function(subclass, superclass, overrides) {
                   // First we check if the user passed in just the superCl      ass with overrides
                   if (Ext.isObject(superclass)) {
                      overrides = superclass;
                       superclass = subclass;
                       subclass = overrides.constructor !== objectConstructor ? overrides.constructor : function() {
                           superclass.apply(this, arguments);
                       };
                   }
  
                   //<debug>
                   if (!superclass) {
                       Ext.Error.raise({
                           sourceClass: 'Ext',
                           sourceMethod: 'extend',
                           msg: 'Attempting to extend from a class which has not been loaded on the page.'
                       });
                   }
                   //</debug>
   
                   // We create a new temporary class
                   var F = function() {},
                       subclassProto, superclassProto = superclass.prototype;
  
                   F.prototype = superclassProto;
                   subclassProto = subclass.prototype = new F();
                   subclassProto.constructor = subclass;
                   subclass.superclass = superclassProto;
   
                   if (superclassProto.constructor === objectConstructor) {
                       superclassProto.constructor = superclass;
                   }
   
                   subclass.override = function(overrides) {
                       Ext.override(subclass, overrides);
                   };
   
                   subclassProto.override = inlineOverrides;
                   subclassProto.proto = subclassProto;
   
                   subclass.override(overrides);
                   subclass.extend = function(o) {
                       return Ext.extend(subclass, o);
                   };
			return subclass;
            };
      }(),
	override: function(cls, overrides) {
             if (cls.$isClass) {
                 return cls.override(overrides);
             }
             else {
                 Ext.apply(cls.prototype, overrides);
             }
         }
    });

    Ext.apply(Ext, {

        valueFrom: function(value, defaultValue, allowBlank){
            return Ext.isEmpty(value, allowBlank) ? defaultValue : value;
        },

        typeOf: function(value) {
            if (value === null) {
                return 'null';
            }

            var type = typeof value;

            if (type === 'undefined' || type === 'string' || type === 'number' || type === 'boolean') {
                return type;
            }

            var typeToString = toString.call(value);

            switch(typeToString) {
                case '[object Array]':
                    return 'array';
                case '[object Date]':
                    return 'date';
                case '[object Boolean]':
                    return 'boolean';
                case '[object Number]':
                    return 'number';
                case '[object RegExp]':
                    return 'regexp';
            }

            if (type === 'function') {
                return 'function';
            }

            if (type === 'object') {
                if (value.nodeType !== undefined) {
                    if (value.nodeType === 3) {
                        return (/\S/).test(value.nodeValue) ? 'textnode' : 'whitespace';
                    }
                    else {
                        return 'element';
                    }
                }

                return 'object';
            }

            Ext.Error.raise({
                sourceClass: 'Ext',
                sourceMethod: 'typeOf',
                msg: 'Failed to determine the type of the specified value "' + value + '". This is most likely a bug.'
            });
        },

        isEmpty: function(value, allowEmptyString) {
            return (value === null) || (value === undefined) || (!allowEmptyString ? value === '' : false) || (Ext.isArray(value) && value.length === 0);
        },

        isArray: ('isArray' in Array) ? Array.isArray : function(value) {
            return toString.call(value) === '[object Array]';
        },

        isDate: function(value) {
            return toString.call(value) === '[object Date]';
        },

        isMSDate: function(value) {
            if (!Ext.isString(value)) {
                return false;
            } else {
                return value.match("\\\\?/Date\\(([-+])?(\\d+)(?:[+-]\\d{4})?\\)\\\\?/") !== null;
            }
        },

        isObject: (toString.call(null) === '[object Object]') ?
        function(value) {
            return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
        } :
        function(value) {
            return toString.call(value) === '[object Object]';
        },

        isSimpleObject: function(value) {
            return value instanceof Object && value.constructor === Object;
        },
        isPrimitive: function(value) {
            var type = typeof value;

            return type === 'string' || type === 'number' || type === 'boolean';
        },

        isFunction:
        (typeof document !== 'undefined' && typeof document.getElementsByTagName('body') === 'function') ? function(value) {
            return toString.call(value) === '[object Function]';
        } : function(value) {
            return typeof value === 'function';
        },

        isNumber: function(value) {
            return typeof value === 'number' && isFinite(value);
        },

        isNumeric: function(value) {
            return !isNaN(parseFloat(value)) && isFinite(value);
        },

        isString: function(value) {
            return typeof value === 'string';
        },

        isBoolean: function(value) {
            return typeof value === 'boolean';
        },

        isElement: function(value) {
            return value ? value.nodeType === 1 : false;
        },

        isTextNode: function(value) {
            return value ? value.nodeName === "#text" : false;
        },

        isDefined: function(value) {
            return typeof value !== 'undefined';
        },

        isIterable: function(value) {
            return (value && typeof value !== 'string') ? value.length !== undefined : false;
        }
    });

    Ext.apply(Ext, {

        clone: function(item) {
            if (item === null || item === undefined) {
                return item;
            }

            if (item.nodeType && item.cloneNode) {
                return item.cloneNode(true);
            }

            var type = toString.call(item);

            if (type === '[object Date]') {
                return new Date(item.getTime());
            }

            var i, j, k, clone, key;

            if (type === '[object Array]') {
                i = item.length;

                clone = [];

                while (i--) {
                    clone[i] = Ext.clone(item[i]);
                }
            }
            else if (type === '[object Object]' && item.constructor === Object) {
                clone = {};

                for (key in item) {
                    clone[key] = Ext.clone(item[key]);
                }

                if (enumerables) {
                    for (j = enumerables.length; j--;) {
                        k = enumerables[j];
                        clone[k] = item[k];
                    }
                }
            }

            return clone || item;
        },

        getUniqueGlobalNamespace: function() {
            var uniqueGlobalNamespace = this.uniqueGlobalNamespace;

            if (uniqueGlobalNamespace === undefined) {
                var i = 0;

                do {
                    uniqueGlobalNamespace = 'ExtBox' + (++i);
                } while (Ext.global[uniqueGlobalNamespace] !== undefined);

                Ext.global[uniqueGlobalNamespace] = Ext;
                this.uniqueGlobalNamespace = uniqueGlobalNamespace;
            }

            return uniqueGlobalNamespace;
        },

        functionFactory: function() {
            var args = Array.prototype.slice.call(arguments),
                ln = args.length;

            if (ln > 0) {
                args[ln - 1] = 'var Ext=window.' + this.getUniqueGlobalNamespace() + ';' + args[ln - 1];
            }

            return Function.prototype.constructor.apply(Function.prototype, args);
        },

        globalEval: ('execScript' in global) ? function(code) {
            global.execScript(code)
        } : function(code) {
            (function(){
                eval(code);
            })();
        }

        ,Logger: {
            log: function(message, priority) {
                if ('console' in global) {
                    if (!priority || !(priority in global.console)) {
                        priority = 'log';
                    }
                    message = '[' + priority.toUpperCase() + '] ' + message;
                    global.console[priority](message);
                }
            },
            verbose: function(message) {
                this.log(message, 'verbose');
            },
            info: function(message) {
                this.log(message, 'info');
            },
            warn: function(message) {
                this.log(message, 'warn');
            },
            error: function(message) {
                throw new Error(message);
            },
            deprecate: function(message) {
                this.log(message, 'warn');
            }
        }
    });

    Ext.type = Ext.typeOf;

})();

(function() {

var version = '4.1.0', Version;
    Ext.Version = Version = Ext.extend(Object, {

        constructor: function(version) {
            var toNumber = this.toNumber,
                parts, releaseStartIndex;

            if (version instanceof Version) {
                return version;
            }

            this.version = this.shortVersion = String(version).toLowerCase().replace(/_/g, '.').replace(/[\-+]/g, '');

            releaseStartIndex = this.version.search(/([^\d\.])/);

            if (releaseStartIndex !== -1) {
                this.release = this.version.substr(releaseStartIndex, version.length);
                this.shortVersion = this.version.substr(0, releaseStartIndex);
            }

            this.shortVersion = this.shortVersion.replace(/[^\d]/g, '');

            parts = this.version.split('.');

            this.major = toNumber(parts.shift());
            this.minor = toNumber(parts.shift());
            this.patch = toNumber(parts.shift());
            this.build = toNumber(parts.shift());

            return this;
        },

        toNumber: function(value) {
            value = parseInt(value || 0, 10);

            if (isNaN(value)) {
                value = 0;
            }

            return value;
        },

        toString: function() {
            return this.version;
        },

        valueOf: function() {
            return this.version;
        },

        getMajor: function() {
            return this.major || 0;
        },

        getMinor: function() {
            return this.minor || 0;
        },

        getPatch: function() {
            return this.patch || 0;
        },

        getBuild: function() {
            return this.build || 0;
        },

        getRelease: function() {
            return this.release || '';
        },

        isGreaterThan: function(target) {
            return Version.compare(this.version, target) === 1;
        },

        isGreaterThanOrEqual: function(target) {
            return Version.compare(this.version, target) >= 0;
        },

        isLessThan: function(target) {
            return Version.compare(this.version, target) === -1;
        },

        isLessThanOrEqual: function(target) {
            return Version.compare(this.version, target) <= 0;
        },

        equals: function(target) {
            return Version.compare(this.version, target) === 0;
        },

        match: function(target) {
            target = String(target);
            return this.version.substr(0, target.length) === target;
        },

        toArray: function() {
            return [this.getMajor(), this.getMinor(), this.getPatch(), this.getBuild(), this.getRelease()];
        },

        getShortVersion: function() {
            return this.shortVersion;
        },

        gt: function() {
            return this.isGreaterThan.apply(this, arguments);
        },

        lt: function() {
            return this.isLessThan.apply(this, arguments);
        },

        gtEq: function() {
            return this.isGreaterThanOrEqual.apply(this, arguments);
        },

        ltEq: function() {
            return this.isLessThanOrEqual.apply(this, arguments);
        }
    });

    Ext.apply(Version, {
        releaseValueMap: {
            'dev': -6,
            'alpha': -5,
            'a': -5,
            'beta': -4,
            'b': -4,
            'rc': -3,
            '#': -2,
            'p': -1,
            'pl': -1
        },

        getComponentValue: function(value) {
            return !value ? 0 : (isNaN(value) ? this.releaseValueMap[value] || value : parseInt(value, 10));
        },

        compare: function(current, target) {
            var currentValue, targetValue, i;

            current = new Version(current).toArray();
            target = new Version(target).toArray();

            for (i = 0; i < Math.max(current.length, target.length); i++) {
                currentValue = this.getComponentValue(current[i]);
                targetValue = this.getComponentValue(target[i]);

                if (currentValue < targetValue) {
                    return -1;
                } else if (currentValue > targetValue) {
                    return 1;
                }
            }

            return 0;
        }
    });

    Ext.apply(Ext, {
        versions: {},

        lastRegisteredVersion: null,

        setVersion: function(packageName, version) {
            Ext.versions[packageName] = new Version(version);
            Ext.lastRegisteredVersion = Ext.versions[packageName];

            return this;
        },

        getVersion: function(packageName) {
            if (packageName === undefined) {
                return Ext.lastRegisteredVersion;
            }

            return Ext.versions[packageName];
        },

        deprecate: function(packageName, since, closure, scope) {
            if (Version.compare(Ext.getVersion(packageName), since) < 1) {
                closure.call(scope);
            }
        }
    }); // End Versioning

    Ext.setVersion('core', version);

})();



Ext.String = {
    trimRegex: /^[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+|[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+$/g,
    escapeRe: /('|\\)/g,
    formatRe: /\{(\d+)\}/g,
    escapeRegexRe: /([-.*+?^${}()|[\]\/\\])/g,

    htmlEncode: (function() {
        var entities = {
            '&': '&amp;',
            '>': '&gt;',
            '<': '&lt;',
            '"': '&quot;'
        }, keys = [], p, regex;

        for (p in entities) {
            keys.push(p);
        }

        regex = new RegExp('(' + keys.join('|') + ')', 'g');

        return function(value) {
            return (!value) ? value : String(value).replace(regex, function(match, capture) {
                return entities[capture];
            });
        };
    })(),

    htmlDecode: (function() {
        var entities = {
            '&amp;': '&',
            '&gt;': '>',
            '&lt;': '<',
            '&quot;': '"'
        }, keys = [], p, regex;

        for (p in entities) {
            keys.push(p);
        }

        regex = new RegExp('(' + keys.join('|') + '|&#[0-9]{1,5};' + ')', 'g');

        return function(value) {
            return (!value) ? value : String(value).replace(regex, function(match, capture) {
                if (capture in entities) {
                    return entities[capture];
                } else {
                    return String.fromCharCode(parseInt(capture.substr(2), 10));
                }
            });
        };
    })(),

    urlAppend : function(url, string) {
        if (!Ext.isEmpty(string)) {
            return url + (url.indexOf('?') === -1 ? '?' : '&') + string;
        }

        return url;
    },

    trim: function(string) {
        return string.replace(Ext.String.trimRegex, "");
    },

    capitalize: function(string) {
        return string.charAt(0).toUpperCase() + string.substr(1);
    },

    ellipsis: function(value, len, word) {
        if (value && value.length > len) {
            if (word) {
                var vs = value.substr(0, len - 2),
                index = Math.max(vs.lastIndexOf(' '), vs.lastIndexOf('.'), vs.lastIndexOf('!'), vs.lastIndexOf('?'));
                if (index !== -1 && index >= (len - 15)) {
                    return vs.substr(0, index) + "...";
                }
            }
            return value.substr(0, len - 3) + "...";
        }
        return value;
    },

    escapeRegex: function(string) {
        return string.replace(Ext.String.escapeRegexRe, "\\$1");
    },

    escape: function(string) {
        return string.replace(Ext.String.escapeRe, "\\$1");
    },

    toggle: function(string, value, other) {
        return string === value ? other : value;
    },

    leftPad: function(string, size, character) {
        var result = String(string);
        character = character || " ";
        while (result.length < size) {
            result = character + result;
        }
        return result;
    },

    format: function(format) {
        var args = Ext.Array.toArray(arguments, 1);
        return format.replace(Ext.String.formatRe, function(m, i) {
            return args[i];
        });
    },

    repeat: function(pattern, count, sep) {
         for (var buf = [], i = count; i--; ) {
             buf.push(pattern);
         }
         return buf.join(sep || '');
     }
};

Ext.htmlEncode = Ext.String.htmlEncode;
Ext.htmlDecode = Ext.String.htmlDecode;
Ext.urlAppend = Ext.String.urlAppend;

(function() {
      var arrayPrototype = Array.prototype,
         slice = arrayPrototype.slice,
         supportsSplice = function () {
             var array = [],
                 lengthBefore,
                 j = 20;
 
             if (!array.splice) {
                 return false;
             }
 
             while (j--) {
                 array.push("A");
             }
 
             array.splice(15, 0, "F", "F", "F", "F", "F","F","F","F","F","F","F","F","F","F","F","F","F","F","F","F","F      ");
 
             lengthBefore = array.length; //41
             array.splice(13, 0, "XXX"); // add one element
 
             if (lengthBefore+1 != array.length) {
                 return false;
             }
             // end IE8 bug
 
             return true;
         }(),
         supportsForEach = 'forEach' in arrayPrototype,
         supportsMap = 'map' in arrayPrototype,
         supportsIndexOf = 'indexOf' in arrayPrototype,
         supportsEvery = 'every' in arrayPrototype,
         supportsSome = 'some' in arrayPrototype,
         supportsFilter = 'filter' in arrayPrototype,
         supportsSort = function() {
             var a = [1,2,3,4,5].sort(function(){ return 0; });
             return a[0] === 1 && a[1] === 2 && a[2] === 3 && a[3] === 4 && a[4] === 5;
         }(),
         supportsSliceOnNodeList = true,
         ExtArray;
 
    try {
          // IE 6 - 8 will throw an error when using Array.prototype.slice on NodeList
         if (typeof document !== 'undefined') {
             slice.call(document.getElementsByTagName('body'));
          }
    } catch (e) {
        supportsSliceOnNodeList = false;
    }
 
    function fixArrayIndex (array, index) {
        return (index < 0) ? Math.max(0, array.length + index)
                           : Math.min(array.length, index);
    }

    function replaceSim (array, index, removeCount, insert) {
        var add = insert ? insert.length : 0,
            length = array.length,
            pos = fixArrayIndex(array, index);

        if (pos === length) {
            if (add) {
                array.push.apply(array, insert);
            }
        } else {
            var remove = Math.min(removeCount, length - pos),
                tailOldPos = pos + remove,
                tailNewPos = tailOldPos + add - remove,
                tailCount = length - tailOldPos,
                lengthAfterRemove = length - remove,
                i;

            if (tailNewPos < tailOldPos) { // case A
                for (i = 0; i < tailCount; ++i) {
                    array[tailNewPos+i] = array[tailOldPos+i];
                }
            } else if (tailNewPos > tailOldPos) { // case B
                for (i = tailCount; i--; ) {
                    array[tailNewPos+i] = array[tailOldPos+i];
                }
            } // else, add == remove (nothing to do)

            if (add && pos === lengthAfterRemove) {
                array.length = lengthAfterRemove; // truncate array
                array.push.apply(array, insert);
            } else {
                array.length = lengthAfterRemove + add; // reserves space
                for (i = 0; i < add; ++i) {
                    array[pos+i] = insert[i];
                }
            }
        }

        return array;
    }

    function replaceNative (array, index, removeCount, insert) {
        if (insert && insert.length) {
            if (index < array.length) {
                array.splice.apply(array, [index, removeCount].concat(insert));
            } else {
                array.push.apply(array, insert);
            }
        } else {
            array.splice(index, removeCount);
        }
        return array;
    }

    function eraseSim (array, index, removeCount) {
        return replaceSim(array, index, removeCount);
    }

    function eraseNative (array, index, removeCount) {
        array.splice(index, removeCount);
        return array;
    }

    function spliceSim (array, index, removeCount) {
        var pos = fixArrayIndex(array, index),
            removed = array.slice(index, fixArrayIndex(array, pos+removeCount));

        if (arguments.length < 4) {
            replaceSim(array, pos, removeCount);
        } else {
            replaceSim(array, pos, removeCount, slice.call(arguments, 3));
        }

        return removed;
    }

    function spliceNative (array) {
        return array.splice.apply(array, slice.call(arguments, 1));
    }

    var erase = supportsSplice ? eraseNative : eraseSim,
        replace = supportsSplice ? replaceNative : replaceSim,
        splice = supportsSplice ? spliceNative : spliceSim;

    ExtArray = Ext.Array = {
        each: function(array, fn, scope, reverse) {
            array = ExtArray.from(array);

            var i,
                ln = array.length;

            if (reverse !== true) {
                for (i = 0; i < ln; i++) {
                    if (fn.call(scope || array[i], array[i], i, array) === false) {
                        return i;
                    }
                }
            }
            else {
                for (i = ln - 1; i > -1; i--) {
                    if (fn.call(scope || array[i], array[i], i, array) === false) {
                        return i;
                    }
                }
            }

            return true;
        },

        forEach: supportsForEach ? function(array, fn, scope) {
                return array.forEach(fn, scope);
        } : function(array, fn, scope) {
            var i = 0,
                ln = array.length;

            for (; i < ln; i++) {
                fn.call(scope, array[i], i, array);
            }
        },

        indexOf: (supportsIndexOf) ? function(array, item, from) {
            return array.indexOf(item, from);
        } : function(array, item, from) {
            var i, length = array.length;

            for (i = (from < 0) ? Math.max(0, length + from) : from || 0; i < length; i++) {
                if (array[i] === item) {
                    return i;
                }
            }

            return -1;
        },

        contains: supportsIndexOf ? function(array, item) {
            return array.indexOf(item) !== -1;
        } : function(array, item) {
            var i, ln;

            for (i = 0, ln = array.length; i < ln; i++) {
                if (array[i] === item) {
                    return true;
                }
            }

            return false;
        },

        toArray: function(iterable, start, end){
            if (!iterable || !iterable.length) {
                return [];
            }

            if (typeof iterable === 'string') {
                iterable = iterable.split('');
            }

            if (supportsSliceOnNodeList) {
                return slice.call(iterable, start || 0, end || iterable.length);
            }

            var array = [],
                i;

            start = start || 0;
            end = end ? ((end < 0) ? iterable.length + end : end) : iterable.length;

            for (i = start; i < end; i++) {
                array.push(iterable[i]);
            }

            return array;
        },

        pluck: function(array, propertyName) {
            var ret = [],
                i, ln, item;

            for (i = 0, ln = array.length; i < ln; i++) {
                item = array[i];

                ret.push(item[propertyName]);
            }

            return ret;
        },

        map: supportsMap ? function(array, fn, scope) {
            return array.map(fn, scope);
        } : function(array, fn, scope) {
            var results = [],
                i = 0,
                len = array.length;

            for (; i < len; i++) {
                results[i] = fn.call(scope, array[i], i, array);
            }

            return results;
        },

        every: function(array, fn, scope) {
            //<debug>
            if (!fn) {
                Ext.Error.raise('Ext.Array.every must have a callback function passed as second argument.');
            }
            //</debug>
            if (supportsEvery) {
                return array.every(fn, scope);
            }

            var i = 0,
                ln = array.length;

            for (; i < ln; ++i) {
                if (!fn.call(scope, array[i], i, array)) {
                    return false;
                }
            }

            return true;
        },

        some: function(array, fn, scope) {
            //<debug>
            if (!fn) {
                Ext.Error.raise('Ext.Array.some must have a callback function passed as second argument.');
            }
            //</debug>
            if (supportsSome) {
                return array.some(fn, scope);
            }

            var i = 0,
                ln = array.length;

            for (; i < ln; ++i) {
                if (fn.call(scope, array[i], i, array)) {
                    return true;
                }
            }

            return false;
        },

                clean: function(array) {
            var results = [],
                i = 0,
                ln = array.length,
                item;

            for (; i < ln; i++) {
                item = array[i];

                if (!Ext.isEmpty(item)) {
                    results.push(item);
                }
            }

            return results;
        },

              unique: function(array) {
            var clone = [],
                i = 0,
                ln = array.length,
                item;

            for (; i < ln; i++) {
                item = array[i];

                if (ExtArray.indexOf(clone, item) === -1) {
                    clone.push(item);
                }
            }

            return clone;
        },

               filter: function(array, fn, scope) {
            if (supportsFilter) {
                return array.filter(fn, scope);
            }

            var results = [],
                i = 0,
                ln = array.length;

            for (; i < ln; i++) {
                if (fn.call(scope, array[i], i, array)) {
                    results.push(array[i]);
                }
            }

            return results;
        },

                from: function(value, newReference) {
            if (value === undefined || value === null) {
                return [];
            }

            if (Ext.isArray(value)) {
                return (newReference) ? slice.call(value) : value;
            }

            if (value && value.length !== undefined && typeof value !== 'string') {
                return ExtArray.toArray(value);
            }

            return [value];
        },

              remove: function(array, item) {
            var index = ExtArray.indexOf(array, item);

            if (index !== -1) {
                erase(array, index, 1);
            }

            return array;
        },

              include: function(array, item) {
            if (!ExtArray.contains(array, item)) {
                array.push(item);
            }
        },

               clone: function(array) {
            return slice.call(array);
        },

               merge: function() {
            var args = slice.call(arguments),
                array = [],
                i, ln;

            for (i = 0, ln = args.length; i < ln; i++) {
                array = array.concat(args[i]);
            }

            return ExtArray.unique(array);
        },

        intersect: function() {
            var intersect = [],
                arrays = slice.call(arguments),
                item, minArray, itemIndex, arrayIndex;

            if (!arrays.length) {
                return intersect;
            }

            //Find the Smallest Array
            arrays = arrays.sort(function(a, b) {
                if (a.length > b.length) {
                    return 1;
                } else if (a.length < b.length) {
                    return -1;
                } else {
                    return 0;
                }
            });

            //Remove duplicates from smallest array
            minArray = ExtArray.unique(arrays[0]);

            //Populate intersecting values
            for (itemIndex = 0; itemIndex < minArray.length; itemIndex++) {
                item = minArray[itemIndex];
                for (arrayIndex = 1; arrayIndex < arrays.length; arrayIndex++) {
                    if (arrays[arrayIndex].indexOf(item) === -1) {
                        break;
                    }

                    if (arrayIndex == (arrays.length - 1)) {
                        intersect.push(item);
                    }
                }
            }

            return intersect;
        },

        difference: function(arrayA, arrayB) {
            var clone = slice.call(arrayA),
                ln = clone.length,
                i, j, lnB;

            for (i = 0,lnB = arrayB.length; i < lnB; i++) {
                for (j = 0; j < ln; j++) {
                    if (clone[j] === arrayB[i]) {
                        erase(clone, j, 1);
                        j--;
                        ln--;
                    }
                }
            }

            return clone;
        },

        slice: function(array, begin, end) {
            return slice.call(array, begin, end);
        },

        sort: function(array, sortFn) {
            if (supportsSort) {
                if (sortFn) {
                    return array.sort(sortFn);
                } else {
                    return array.sort();
                }
            }

            var length = array.length,
                i = 0,
                comparison,
                j, min, tmp;

            for (; i < length; i++) {
                min = i;
                for (j = i + 1; j < length; j++) {
                    if (sortFn) {
                        comparison = sortFn(array[j], array[min]);
                        if (comparison < 0) {
                            min = j;
                        }
                    } else if (array[j] < array[min]) {
                        min = j;
                    }
                }
                if (min !== i) {
                    tmp = array[i];
                    array[i] = array[min];
                    array[min] = tmp;
                }
            }

            return array;
        },

        flatten: function(array) {
            var worker = [];

            function rFlatten(a) {
                var i, ln, v;

                for (i = 0, ln = a.length; i < ln; i++) {
                    v = a[i];

                    if (Ext.isArray(v)) {
                        rFlatten(v);
                    } else {
                        worker.push(v);
                    }
                }

                return worker;
            }

            return rFlatten(array);
        },

         min: function(array, comparisonFn) {
            var min = array[0],
                i, ln, item;

            for (i = 0, ln = array.length; i < ln; i++) {
                item = array[i];

                if (comparisonFn) {
                    if (comparisonFn(min, item) === 1) {
                        min = item;
                    }
                }
                else {
                    if (item < min) {
                        min = item;
                    }
                }
            }

            return min;
        },

         max: function(array, comparisonFn) {
            var max = array[0],
                i, ln, item;

            for (i = 0, ln = array.length; i < ln; i++) {
                item = array[i];

                if (comparisonFn) {
                    if (comparisonFn(max, item) === -1) {
                        max = item;
                    }
                }
                else {
                    if (item > max) {
                        max = item;
                    }
                }
            }

            return max;
        },

        mean: function(array) {
            return array.length > 0 ? ExtArray.sum(array) / array.length : undefined;
        },


        sum: function(array) {
            var sum = 0,
                i, ln, item;

            for (i = 0,ln = array.length; i < ln; i++) {
                item = array[i];

                sum += item;
            }

            return sum;
        },

        //<debug>
        _replaceSim: replaceSim, // for unit testing
        _spliceSim: spliceSim,
        //</debug>

        erase: erase,


        insert: function (array, index, items) {
            return replace(array, index, 0, items);
        },

        replace: replace,

        splice: splice
    };

    Ext.each = ExtArray.each;

    ExtArray.union = ExtArray.merge;

    Ext.min = ExtArray.min;

    Ext.max = ExtArray.max;

    Ext.sum = ExtArray.sum;

    Ext.mean = ExtArray.mean;

    Ext.flatten = ExtArray.flatten;

    Ext.clean = ExtArray.clean;

    Ext.unique = ExtArray.unique;

    Ext.pluck = ExtArray.pluck;

    Ext.toArray = function() {
        return ExtArray.toArray.apply(ExtArray, arguments);
    };
})();

//@tag foundation,core
//@define Ext.Number
//@require Ext.Array

(function() {

var isToFixedBroken = (0.9).toFixed() !== '1';

Ext.Number = {
    constrain: function(number, min, max) {
        number = parseFloat(number);

        if (!isNaN(min)) {
            number = Math.max(number, min);
        }
        if (!isNaN(max)) {
            number = Math.min(number, max);
        }
        return number;
    },

    snap : function(value, increment, minValue, maxValue) {
        var newValue = value,
            m;

        if (!(increment && value)) {
            return value;
        }
        m = value % increment;
        if (m !== 0) {
            newValue -= m;
            if (m * 2 >= increment) {
                newValue += increment;
            } else if (m * 2 < -increment) {
                newValue -= increment;
            }
        }
        return Ext.Number.constrain(newValue, minValue,  maxValue);
    },

     toFixed: function(value, precision) {
        if (isToFixedBroken) {
            precision = precision || 0;
            var pow = Math.pow(10, precision);
            return (Math.round(value * pow) / pow).toFixed(precision);
        }

        return value.toFixed(precision);
    },

     from: function(value, defaultValue) {
        if (isFinite(value)) {
            value = parseFloat(value);
        }

        return !isNaN(value) ? value : defaultValue;
    }
};

})();

Ext.num = function() {
    return Ext.Number.from.apply(this, arguments);
};


(function() {

// The "constructor" for chain:
var TemplateClass = function(){};

var ExtObject = Ext.Object = {

     chain: ('create' in Object) ? function(object){
        return Object.create(object);
    } : function (object) {
        TemplateClass.prototype = object;
        var result = new TemplateClass();
        TemplateClass.prototype = null;
        return result;
    },

     toQueryObjects: function(name, value, recursive) {
        var self = ExtObject.toQueryObjects,
            objects = [],
            i, ln;

        if (Ext.isArray(value)) {
            for (i = 0, ln = value.length; i < ln; i++) {
                if (recursive) {
                    objects = objects.concat(self(name + '[' + i + ']', value[i], true));
                }
                else {
                    objects.push({
                        name: name,
                        value: value[i]
                    });
                }
            }
        }
        else if (Ext.isObject(value)) {
            for (i in value) {
                if (value.hasOwnProperty(i)) {
                    if (recursive) {
                        objects = objects.concat(self(name + '[' + i + ']', value[i], true));
                    }
                    else {
                        objects.push({
                            name: name,
                            value: value[i]
                        });
                    }
                }
            }
        }
        else {
            objects.push({
                name: name,
                value: value
            });
        }

        return objects;
    },

     toQueryString: function(object, recursive) {
        var paramObjects = [],
            params = [],
            i, j, ln, paramObject, value;

        for (i in object) {
            if (object.hasOwnProperty(i)) {
                paramObjects = paramObjects.concat(ExtObject.toQueryObjects(i, object[i], recursive));
            }
        }

        for (j = 0, ln = paramObjects.length; j < ln; j++) {
            paramObject = paramObjects[j];
            value = paramObject.value;

            if (Ext.isEmpty(value)) {
                value = '';
            }
            else if (Ext.isDate(value)) {
                value = Ext.Date.toString(value);
            }

            params.push(encodeURIComponent(paramObject.name) + '=' + encodeURIComponent(String(value)));
        }

        return params.join('&');
    },

     fromQueryString: function(queryString, recursive) {
        var parts = queryString.replace(/^\?/, '').split('&'),
            object = {},
            temp, components, name, value, i, ln,
            part, j, subLn, matchedKeys, matchedName,
            keys, key, nextKey;

        for (i = 0, ln = parts.length; i < ln; i++) {
            part = parts[i];

            if (part.length > 0) {
                components = part.split('=');
                name = decodeURIComponent(components[0]);
                value = (components[1] !== undefined) ? decodeURIComponent(components[1]) : '';

                if (!recursive) {
                    if (object.hasOwnProperty(name)) {
                        if (!Ext.isArray(object[name])) {
                            object[name] = [object[name]];
                        }

                        object[name].push(value);
                    }
                    else {
                        object[name] = value;
                    }
                }
                else {
                    matchedKeys = name.match(/(\[):?([^\]]*)\]/g);
                    matchedName = name.match(/^([^\[]+)/);

                    //<debug error>
                    if (!matchedName) {
                        throw new Error('[Ext.Object.fromQueryString] Malformed query string given, failed parsing name from "' + part + '"');
                    }
                    //</debug>

                    name = matchedName[0];
                    keys = [];

                    if (matchedKeys === null) {
                        object[name] = value;
                        continue;
                    }

                    for (j = 0, subLn = matchedKeys.length; j < subLn; j++) {
                        key = matchedKeys[j];
                        key = (key.length === 2) ? '' : key.substring(1, key.length - 1);
                        keys.push(key);
                    }

                    keys.unshift(name);

                    temp = object;

                    for (j = 0, subLn = keys.length; j < subLn; j++) {
                        key = keys[j];

                        if (j === subLn - 1) {
                            if (Ext.isArray(temp) && key === '') {
                                temp.push(value);
                            }
                            else {
                                temp[key] = value;
                            }
                        }
                        else {
                            if (temp[key] === undefined || typeof temp[key] === 'string') {
                                nextKey = keys[j+1];

                                temp[key] = (Ext.isNumeric(nextKey) || nextKey === '') ? [] : {};
                            }

                            temp = temp[key];
                        }
                    }
                }
            }
        }

        return object;
    },

    each: function(object, fn, scope) {
        for (var property in object) {
            if (object.hasOwnProperty(property)) {
                if (fn.call(scope || object, property, object[property], object) === false) {
                    return;
                }
            }
        }
    },

    merge: function(source) {
        var i = 1,
            ln = arguments.length,
            mergeFn = ExtObject.merge,
            cloneFn = Ext.clone,
            object, key, value, sourceKey;

        for (; i < ln; i++) {
            object = arguments[i];

            for (key in object) {
                value = object[key];
                if (value && value.constructor === Object) {
                    sourceKey = source[key];
                    if (sourceKey && sourceKey.constructor === Object) {
                        mergeFn(sourceKey, value);
                    }
                    else {
                        source[key] = cloneFn(value);
                    }
                }
                else {
                    source[key] = value;
                }
            }
        }

        return source;
    },

    mergeIf: function(source) {
        var i = 1,
            ln = arguments.length,
            cloneFn = Ext.clone,
            object, key, value;

        for (; i < ln; i++) {
            object = arguments[i];

            for (key in object) {
                if (!(key in source)) {
                    value = object[key];

                    if (value && value.constructor === Object) {
                        source[key] = cloneFn(value);
                    }
                    else {
                        source[key] = value;
                    }
                }
            }
        }

        return source;
    },

    getKey: function(object, value) {
        for (var property in object) {
            if (object.hasOwnProperty(property) && object[property] === value) {
                return property;
            }
        }

        return null;
    },

    getValues: function(object) {
        var values = [],
            property;

        for (property in object) {
            if (object.hasOwnProperty(property)) {
                values.push(object[property]);
            }
        }

        return values;
    },

     getKeys: ('keys' in Object) ? Object.keys : function(object) {
        var keys = [],
            property;

        for (property in object) {
            if (object.hasOwnProperty(property)) {
                keys.push(property);
            }
        }

        return keys;
    },

     getSize: function(object) {
        var size = 0,
            property;

        for (property in object) {
            if (object.hasOwnProperty(property)) {
                size++;
            }
        }

        return size;
    },

     classify: function(object) {
        var objectProperties = [],
            arrayProperties = [],
            propertyClassesMap = {},
            objectClass = function() {
                var i = 0,
                    ln = objectProperties.length,
                    property;

                for (; i < ln; i++) {
                    property = objectProperties[i];
                    this[property] = new propertyClassesMap[property];
                }

                ln = arrayProperties.length;

                for (i = 0; i < ln; i++) {
                    property = arrayProperties[i];
                    this[property] = object[property].slice();
                }
            },
            key, value, constructor;

        for (key in object) {
            if (object.hasOwnProperty(key)) {
                value = object[key];

                if (value) {
                    constructor = value.constructor;

                    if (constructor === Object) {
                        objectProperties.push(key);
                        propertyClassesMap[key] = ExtObject.classify(value);
                    }
                    else if (constructor === Array) {
                        arrayProperties.push(key);
                    }
                }
            }
        }

        objectClass.prototype = object;

        return objectClass;
    },

    equals: function(origin, target) {
        var originType = typeof origin,
            targetType = typeof target,
            key;

        if (targetType === targetType) {
            if (originType === 'object') {
                for (key in origin) {
                    if (!(key in target)) {
                        return false;
                    }

                    if (!ExtObject.equals(origin[key], target[key])) {
                        return false;
                    }
                }

                for (key in target) {
                    if (!(key in origin)) {
                        return false;
                    }
                }

                return true;
            }
            else {
                return origin === target;
            }
        }

        return false;
    },

    defineProperty: ('defineProperty' in Object) ? Object.defineProperty : function(object, name, descriptor) {
        if (descriptor.get) {
            object.__defineGetter__(name, descriptor.get);
        }

        if (descriptor.set) {
            object.__defineSetter__(name, descriptor.set);
        }
    }
};


Ext.merge = Ext.Object.merge;

Ext.mergeIf = Ext.Object.mergeIf;

Ext.urlEncode = function() {
    var args = Ext.Array.from(arguments),
        prefix = '';

    // Support for the old `pre` argument
    if ((typeof args[1] === 'string')) {
        prefix = args[1] + '&';
        args[1] = false;
    }

    return prefix + ExtObject.toQueryString.apply(ExtObject, args);
};

Ext.urlDecode = function() {
    return ExtObject.fromQueryString.apply(ExtObject, arguments);
};

})();

Ext.Function = {

     flexSetter: function(fn) {
        return function(a, b) {
            var k, i;

            if (a === null) {
                return this;
            }

            if (typeof a !== 'string') {
                for (k in a) {
                    if (a.hasOwnProperty(k)) {
                        fn.call(this, k, a[k]);
                    }
                }

                if (Ext.enumerables) {
                    for (i = Ext.enumerables.length; i--;) {
                        k = Ext.enumerables[i];
                        if (a.hasOwnProperty(k)) {
                            fn.call(this, k, a[k]);
                        }
                    }
                }
            } else {
                fn.call(this, a, b);
            }

            return this;
        };
    },

     bind: function(fn, scope, args, appendArgs) {
        if (arguments.length === 2) {
            return function() {
                return fn.apply(scope, arguments);
            }
        }

        var method = fn,
            slice = Array.prototype.slice;

        return function() {
            var callArgs = args || arguments;

            if (appendArgs === true) {
                callArgs = slice.call(arguments, 0);
                callArgs = callArgs.concat(args);
            }
            else if (typeof appendArgs == 'number') {
                callArgs = slice.call(arguments, 0); // copy arguments first
                Ext.Array.insert(callArgs, appendArgs, args);
            }

            return method.apply(scope || window, callArgs);
        };
    },

     pass: function(fn, args, scope) {
        if (!Ext.isArray(args)) {
            args = Ext.Array.clone(args);
        }

        return function() {
            args.push.apply(args, arguments);
            return fn.apply(scope || this, args);
        };
    },

     alias: function(object, methodName) {
        return function() {
            return object[methodName].apply(object, arguments);
        };
    },

    clone: function(method) {
        return function() {
            return method.apply(this, arguments);
        };
    },

    createInterceptor: function(origFn, newFn, scope, returnValue) {
        var method = origFn;
        if (!Ext.isFunction(newFn)) {
            return origFn;
        }
        else {
            return function() {
                var me = this,
                    args = arguments;
                newFn.target = me;
                newFn.method = origFn;
                return (newFn.apply(scope || me || window, args) !== false) ? origFn.apply(me || window, args) : returnValue || null;
            };
        }
    },

    createDelayed: function(fn, delay, scope, args, appendArgs) {
        if (scope || args) {
            fn = Ext.Function.bind(fn, scope, args, appendArgs);
        }

        return function() {
            var me = this,
                args = Array.prototype.slice.call(arguments);

            setTimeout(function() {
                fn.apply(me, args);
            }, delay);
        }
    },

    defer: function(fn, millis, scope, args, appendArgs) {
        fn = Ext.Function.bind(fn, scope, args, appendArgs);
        if (millis > 0) {
            return setTimeout(fn, millis);
        }
        fn();
        return 0;
    },

     createSequence: function(originalFn, newFn, scope) {
        if (!newFn) {
            return originalFn;
        }
        else {
            return function() {
                var result = originalFn.apply(this, arguments);
                newFn.apply(scope || this, arguments);
                return result;
            };
        }
    },


    createBuffered: function(fn, buffer, scope, args) {
        var timerId;

        return function() {
            var callArgs = args || Array.prototype.slice.call(arguments, 0),
                me = scope || this;

            if (timerId) {
                clearTimeout(timerId);
            }

            timerId = setTimeout(function(){
                fn.apply(me, callArgs);
            }, buffer);
        };
    },

    createThrottled: function(fn, interval, scope) {
        var lastCallTime, elapsed, lastArgs, timer, execute = function() {
            fn.apply(scope || this, lastArgs);
            lastCallTime = new Date().getTime();
        };

        return function() {
            elapsed = new Date().getTime() - lastCallTime;
            lastArgs = arguments;

            clearTimeout(timer);
            if (!lastCallTime || (elapsed >= interval)) {
                execute();
            } else {
                timer = setTimeout(execute, interval - elapsed);
            }
        };
    },

    interceptBefore: function(object, methodName, fn) {
        var method = object[methodName] || Ext.emptyFn;

        return object[methodName] = function() {
            var ret = fn.apply(this, arguments);
            method.apply(this, arguments);

            return ret;
        };
    },

    interceptAfter: function(object, methodName, fn) {
        var method = object[methodName] || Ext.emptyFn;

        return object[methodName] = function() {
            method.apply(this, arguments);
            return fn.apply(this, arguments);
        };
    }
};


Ext.defer = Ext.Function.alias(Ext.Function, 'defer');

Ext.pass = Ext.Function.alias(Ext.Function, 'pass');

Ext.bind = Ext.Function.alias(Ext.Function, 'bind');

Ext.JSON = new(function() {
    var useHasOwn = !! {}.hasOwnProperty,
    isNative = function() {
        var useNative = null;

        return function() {
            if (useNative === null) {
                useNative = Ext.USE_NATIVE_JSON && window.JSON && JSON.toString() == '[object JSON]';
            }

            return useNative;
        };
    }(),
    pad = function(n) {
        return n < 10 ? "0" + n : n;
    },
    doDecode = function(json) {
        return eval("(" + json + ')');
    },
    doEncode = function(o) {
        if (!Ext.isDefined(o) || o === null) {
            return "null";
        } else if (Ext.isArray(o)) {
            return encodeArray(o);
        } else if (Ext.isDate(o)) {
            return Ext.JSON.encodeDate(o);
        } else if (Ext.isString(o)) {
            if (Ext.isMSDate(o)) {
               return encodeMSDate(o);
            } else {
                return encodeString(o);
            }
        } else if (typeof o == "number") {
            //don't use isNumber here, since finite checks happen inside isNumber
            return isFinite(o) ? String(o) : "null";
        } else if (Ext.isBoolean(o)) {
            return String(o);
        } else if (Ext.isObject(o)) {
            return encodeObject(o);
        } else if (typeof o === "function") {
            return "null";
        }
        return 'undefined';
    },
    m = {
        "\b": '\\b',
        "\t": '\\t',
        "\n": '\\n',
        "\f": '\\f',
        "\r": '\\r',
        '"': '\\"',
        "\\": '\\\\',
        '\x0b': '\\u000b' //ie doesn't handle \v
    },
    charToReplace = /[\\\"\x00-\x1f\x7f-\uffff]/g,
    encodeString = function(s) {
        return '"' + s.replace(charToReplace, function(a) {
            var c = m[a];
            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"';
    },
    encodeArray = function(o) {
        var a = ["[", ""],
        // Note empty string in case there are no serializable members.
        len = o.length,
        i;
        for (i = 0; i < len; i += 1) {
            a.push(doEncode(o[i]), ',');
        }
        // Overwrite trailing comma (or empty string)
        a[a.length - 1] = ']';
        return a.join("");
    },
    encodeObject = function(o) {
        var a = ["{", ""],
        // Note empty string in case there are no serializable members.
        i;
        for (i in o) {
            if (!useHasOwn || o.hasOwnProperty(i)) {
                a.push(doEncode(i), ":", doEncode(o[i]), ',');
            }
        }
        // Overwrite trailing comma (or empty string)
        a[a.length - 1] = '}';
        return a.join("");
    },
    encodeMSDate = function(o) {
        return '"' + o + '"';
    };

    this.encodeDate = function(o) {
        return '"' + o.getFullYear() + "-" 
        + pad(o.getMonth() + 1) + "-"
        + pad(o.getDate()) + "T"
        + pad(o.getHours()) + ":"
        + pad(o.getMinutes()) + ":"
        + pad(o.getSeconds()) + '"';
    };

    this.encode = function() {
        var ec;
        return function(o) {
            if (!ec) {
                // setup encoding function on first access
                ec = isNative() ? JSON.stringify : doEncode;
            }
            return ec(o);
        };
    }();


    this.decode = function() {
        var dc;
        return function(json, safe) {
            if (!dc) {
                // setup decoding function on first access
                dc = isNative() ? JSON.parse : doDecode;
            }
            try {
                return dc(json);
            } catch (e) {
                if (safe === true) {
                    return null;
                }
                Ext.Error.raise({
                    sourceClass: "Ext.JSON",
                    sourceMethod: "decode",
                    msg: "You're trying to decode an invalid JSON String: " + json
                });
            }
        };
    }();

})();
Ext.encode = Ext.JSON.encode;
Ext.decode = Ext.JSON.decode;

Ext.Error = {
    raise: function(object) {
        throw new Error(object.msg);
    }
};

Ext.Date = {
    now: Date.now,

    toString: function(date) {
        if (!date) {
            date = new Date();
        }

        var pad = Ext.String.leftPad;

        return date.getFullYear() + "-"
            + pad(date.getMonth() + 1, 2, '0') + "-"
            + pad(date.getDate(), 2, '0') + "T"
            + pad(date.getHours(), 2, '0') + ":"
            + pad(date.getMinutes(), 2, '0') + ":"
            + pad(date.getSeconds(), 2, '0');
    }
};


//@tag foundation,core
//@define Ext.Base
//@require Ext.Date

(function(flexSetter) {

var noArgs = [],
    Base = function(){};

    // These static properties will be copied to every newly created class with {@link Ext#define}
    Ext.apply(Base, {
        $className: 'Ext.Base',

        $isClass: true,

        create: function() {
            return Ext.create.apply(Ext, [this].concat(Array.prototype.slice.call(arguments, 0)));
        },

        extend: function(parent) {
            var parentPrototype = parent.prototype,
                prototype, i, ln, name, statics;

            prototype = this.prototype = Ext.Object.chain(parentPrototype);
            prototype.self = this;

            this.superclass = prototype.superclass = parentPrototype;

            if (!parent.$isClass) {
                Ext.apply(prototype, Ext.Base.prototype);
                prototype.constructor = function() {
                    parentPrototype.constructor.apply(this, arguments);
                };
            }

            //<feature classSystem.inheritableStatics>
            // Statics inheritance
            statics = parentPrototype.$inheritableStatics;

            if (statics) {
                for (i = 0,ln = statics.length; i < ln; i++) {
                    name = statics[i];

                    if (!this.hasOwnProperty(name)) {
                        this[name] = parent[name];
                    }
                }
            }
            //</feature>

            if (parent.$onExtended) {
                this.$onExtended = parent.$onExtended.slice();
            }

            //<feature classSystem.config>
            prototype.config = prototype.defaultConfig = new prototype.configClass;
            prototype.initConfigList = prototype.initConfigList.slice();
            prototype.initConfigMap = Ext.Object.chain(prototype.initConfigMap);
            //</feature>
        },

        '$onExtended': [],

        triggerExtended: function() {
            var callbacks = this.$onExtended,
                ln = callbacks.length,
                i, callback;

            if (ln > 0) {
                for (i = 0; i < ln; i++) {
                    callback = callbacks[i];
                    callback.fn.apply(callback.scope || this, arguments);
                }
            }
        },

        onExtended: function(fn, scope) {
            this.$onExtended.push({
                fn: fn,
                scope: scope
            });

            return this;
        },

        addConfig: function(config, fullMerge) {
            var prototype = this.prototype,
                initConfigList = prototype.initConfigList,
                initConfigMap = prototype.initConfigMap,
                defaultConfig = prototype.defaultConfig,
                hasInitConfigItem, name, value;

            fullMerge = Boolean(fullMerge);

            for (name in config) {
                if (config.hasOwnProperty(name) && (fullMerge || !(name in defaultConfig))) {
                    value = config[name];
                    hasInitConfigItem = initConfigMap[name];

                    if (value !== null) {
                        if (!hasInitConfigItem) {
                            initConfigMap[name] = true;
                            initConfigList.push(name);
                        }
                    }
                    else if (hasInitConfigItem) {
                        initConfigMap[name] = false;
                        Ext.Array.remove(initConfigList, name);
                    }
                }
            }

            if (fullMerge) {
                Ext.merge(defaultConfig, config);
            }
            else {
                Ext.mergeIf(defaultConfig, config);
            }

            prototype.configClass = Ext.Object.classify(defaultConfig);
        },

        addStatics: function(members) {
            var member, name;
            //<debug>
            var className = Ext.getClassName(this);
            //</debug>

            for (name in members) {
                if (members.hasOwnProperty(name)) {
                    member = members[name];
                    //<debug>
                    if (typeof member == 'function') {
                        member.displayName = className + '.' + name;
                    }
                    //</debug>
                    this[name] = member;
                }
            }

            return this;
        },

        addInheritableStatics: function(members) {
            var inheritableStatics,
                hasInheritableStatics,
                prototype = this.prototype,
                name, member;

            inheritableStatics = prototype.$inheritableStatics;
            hasInheritableStatics = prototype.$hasInheritableStatics;

            if (!inheritableStatics) {
                inheritableStatics = prototype.$inheritableStatics = [];
                hasInheritableStatics = prototype.$hasInheritableStatics = {};
            }

            //<debug>
            var className = Ext.getClassName(this);
            //</debug>

            for (name in members) {
                if (members.hasOwnProperty(name)) {
                    member = members[name];
                    //<debug>
                    if (typeof member == 'function') {
                        member.displayName = className + '.' + name;
                    }
                    //</debug>
                    this[name] = member;

                    if (!hasInheritableStatics[name]) {
                        hasInheritableStatics[name] = true;
                        inheritableStatics.push(name);
                    }
                }
            }

            return this;
        },

        addMembers: function(members) {
            var prototype = this.prototype,
                names = [],
                name, member;

            //<debug>
            var className = this.$className || '';
            //</debug>

            for (name in members) {
                if (members.hasOwnProperty(name)) {
                    member = members[name];

                    if (typeof member == 'function' && !member.$isClass && member !== Ext.emptyFn) {
                        member.$owner = this;
                        member.$name = name;
                        //<debug>
                        member.displayName = className + '#' + name;
                        //</debug>
                    }

                    prototype[name] = member;
                }
            }

            return this;
        },

        addMember: function(name, member) {
            if (typeof member == 'function' && !member.$isClass && member !== Ext.emptyFn) {
                member.$owner = this;
                member.$name = name;
                //<debug>
                member.displayName = (this.$className || '') + '#' + name;
                //</debug>
            }

            this.prototype[name] = member;

            return this;
        },

        implement: function() {
            this.addMembers.apply(this, arguments);
        },

        borrow: function(fromClass, members) {
            var prototype = this.prototype,
                fromPrototype = fromClass.prototype,
                //<debug>
                className = Ext.getClassName(this),
                //</debug>
                i, ln, name, fn, toBorrow;

            members = Ext.Array.from(members);

            for (i = 0,ln = members.length; i < ln; i++) {
                name = members[i];

                toBorrow = fromPrototype[name];

                if (typeof toBorrow == 'function') {
                    fn = function() {
                        return toBorrow.apply(this, arguments);
                    };

                    //<debug>
                    if (className) {
                        fn.displayName = className + '#' + name;
                    }
                    //</debug>

                    fn.$owner = this;
                    fn.$name = name;

                    prototype[name] = fn;
                }
                else {
                    prototype[name] = toBorrow;
                }
            }

            return this;
        },

        override: function(members) {
            var me = this,
                enumerables = Ext.enumerables,
                target = me.prototype,
                cloneFunction = Ext.Function.clone,
                currentConfig = target.config,
                name, index, member, statics, names, previous, newConfig, prop;

            if (arguments.length === 2) {
                name = members;
                members = {};
                members[name] = arguments[1];
                enumerables = null;
            }

            do {
                names = []; // clean slate for prototype (1st pass) and static (2nd pass)
                statics = null; // not needed 1st pass, but needs to be cleared for 2nd pass

                for (name in members) { // hasOwnProperty is checked in the next loop...
                    if (name == 'statics') {
                        statics = members[name];
                    }
                    else if (name == 'config') {
                        newConfig = members[name];
                        //<debug error>
                        for (prop in newConfig) {
                            if (!(prop in currentConfig)) {
                                throw new Error("Attempting to override a non-existant config property. This is not " +
                                    "supported, you must extend the Class.");
                            }
                        }
                        //</debug>
                        me.addConfig(newConfig, true);
                    }
                    else {
                        names.push(name);
                    }
                }

                if (enumerables) {
                    names.push.apply(names, enumerables);
                }

                for (index = names.length; index--; ) {
                    name = names[index];

                    if (members.hasOwnProperty(name)) {
                        member = members[name];

                        if (typeof member == 'function' && !member.$className && member !== Ext.emptyFn) {
                            if (typeof member.$owner != 'undefined') {
                                member = cloneFunction(member);
                            }

                            //<debug>
                            var className = me.$className;
                            if (className) {
                                member.displayName = className + '#' + name;
                            }
                            //</debug>

                            member.$owner = me;
                            member.$name = name;

                            previous = target[name];
                            if (previous) {
                                member.$previous = previous;
                            }
                        }

                        target[name] = member;
                    }
                }

                target = me; // 2nd pass is for statics
                members = statics; // statics will be null on 2nd pass
            } while (members);

            return this;
        },

        callParent: function(args) {
            var method;

            // This code is intentionally inlined for the least amount of debugger stepping
            return (method = this.callParent.caller) && (method.$previous ||
                  ((method = method.$owner ? method : method.caller) &&
                        method.$owner.superclass.$class[method.$name])).apply(this, args || noArgs);
        },

        //<feature classSystem.mixins>
        mixin: function(name, mixinClass) {
            var mixin = mixinClass.prototype,
                prototype = this.prototype,
                key;

            if (typeof mixin.onClassMixedIn != 'undefined') {
                mixin.onClassMixedIn.call(mixinClass, this);
            }

            if (!prototype.hasOwnProperty('mixins')) {
                if ('mixins' in prototype) {
                    prototype.mixins = Ext.Object.chain(prototype.mixins);
                }
                else {
                    prototype.mixins = {};
                }
            }

            for (key in mixin) {
                if (key === 'mixins') {
                    Ext.merge(prototype.mixins, mixin[key]);
                }
                else if (typeof prototype[key] == 'undefined' && key != 'mixinId' && key != 'config') {
                    prototype[key] = mixin[key];
                }
            }

            //<feature classSystem.config>
            if ('config' in mixin) {
                this.addConfig(mixin.config, false);
            }
            //</feature>

            prototype.mixins[name] = mixin;
        },
        //</feature>

        getName: function() {
            return Ext.getClassName(this);
        },

        createAlias: flexSetter(function(alias, origin) {
            this.override(alias, function() {
                return this[origin].apply(this, arguments);
            });
        }),

        addXtype: function(xtype) {
            var prototype = this.prototype,
                xtypesMap = prototype.xtypesMap,
                xtypes = prototype.xtypes,
                xtypesChain = prototype.xtypesChain;

            if (!prototype.hasOwnProperty('xtypesMap')) {
                xtypesMap = prototype.xtypesMap = Ext.merge({}, prototype.xtypesMap || {});
                xtypes = prototype.xtypes = prototype.xtypes ? [].concat(prototype.xtypes) : [];
                xtypesChain = prototype.xtypesChain = prototype.xtypesChain ? [].concat(prototype.xtypesChain) : [];
                prototype.xtype = xtype;
            }

            if (!xtypesMap[xtype]) {
                xtypesMap[xtype] = true;
                xtypes.push(xtype);
                xtypesChain.push(xtype);
                Ext.ClassManager.setAlias(this, 'widget.' + xtype);
            }

            return this;
        }
    });

    Base.implement({
        isInstance: true,

        $className: 'Ext.Base',

        configClass: Ext.emptyFn,

        initConfigList: [],

        initConfigMap: {},

        statics: function() {
            var method = this.statics.caller,
                self = this.self;

            if (!method) {
                return self;
            }

            return method.$owner;
        },

        callParent: function(args) {
            // NOTE: this code is deliberately as few expressions (and no function calls)
            // as possible so that a debugger can skip over this noise with the minimum number
            // of steps. Basically, just hit Step Into until you are where you really wanted
            // to be.
            var method,
                superMethod = (method = this.callParent.caller) && (method.$previous ||
                        ((method = method.$owner ? method : method.caller) &&
                                method.$owner.superclass[method.$name]));

            //<debug error>
            if (!superMethod) {
                method = this.callParent.caller;
                var parentClass, methodName;

                if (!method.$owner) {
                    if (!method.caller) {
                        throw new Error("Attempting to call a protected method from the public scope, which is not allowed");
                    }

                    method = method.caller;
                }

                parentClass = method.$owner.superclass;
                methodName = method.$name;

                if (!(methodName in parentClass)) {
                    throw new Error("this.callParent() was called but there's no such method (" + methodName +
                                ") found in the parent class (" + (Ext.getClassName(parentClass) || 'Object') + ")");
                }
            }
            //</debug>

            return superMethod.apply(this, args || noArgs);
        },

        callSuper: function(args) {
            var method,
                superMethod = (method = this.callSuper.caller) && ((method = method.$owner ? method : method.caller) &&
                                method.$owner.superclass[method.$name]);

            //<debug error>
            if (!superMethod) {
                method = this.callSuper.caller;
                var parentClass, methodName;

                if (!method.$owner) {
                    if (!method.caller) {
                        throw new Error("Attempting to call a protected method from the public scope, which is not allowed");
                    }

                    method = method.caller;
                }

                parentClass = method.$owner.superclass;
                methodName = method.$name;

                if (!(methodName in parentClass)) {
                    throw new Error("this.callSuper() was called but there's no such method (" + methodName +
                                ") found in the parent class (" + (Ext.getClassName(parentClass) || 'Object') + ")");
                }
            }
            //</debug>

            return superMethod.apply(this, args || noArgs);
        },

        callOverridden: function(args) {
            var method = this.callOverridden.caller;
            return method  && method.$previous.apply(this, args || noArgs);
        },

        self: Base,

        // Default constructor, simply returns `this`
        constructor: function() {
            return this;
        },

        //<feature classSystem.config>

        wasInstantiated: false,

        initConfig: function(instanceConfig) {
            //<debug>
            //</debug>
            var configNameCache = Ext.Class.configNameCache,
                prototype = this.self.prototype,
                initConfigList = this.initConfigList,
                initConfigMap = this.initConfigMap,
                config = new this.configClass,
                defaultConfig = this.defaultConfig,
                i, ln, name, value, nameMap, getName;

            this.initConfig = Ext.emptyFn;

            this.initialConfig = instanceConfig || {};

            if (instanceConfig) {
                Ext.merge(config, instanceConfig);
            }

            this.config = config;

            // Optimize initConfigList *once* per class based on the existence of apply* and update* methods
            // Happens only once during the first instantiation
            if (!prototype.hasOwnProperty('wasInstantiated')) {
                prototype.wasInstantiated = true;

                for (i = 0,ln = initConfigList.length; i < ln; i++) {
                    name = initConfigList[i];
                    nameMap = configNameCache[name];
                    value = defaultConfig[name];

                    if (!(nameMap.apply in prototype)
                        && !(nameMap.update in prototype)
                        && prototype[nameMap.set].$isDefault
                        && typeof value != 'object') {
                        prototype[nameMap.internal] = defaultConfig[name];
                        initConfigMap[name] = false;
                        Ext.Array.remove(initConfigList, name);
                        i--;
                        ln--;
                    }
                }
            }

            if (instanceConfig) {
                initConfigList = initConfigList.slice();

                for (name in instanceConfig) {
                    if (name in defaultConfig && !initConfigMap[name]) {
                        initConfigList.push(name);
                    }
                }
            }

            // Point all getters to the initGetters
            for (i = 0,ln = initConfigList.length; i < ln; i++) {
                name = initConfigList[i];
                nameMap = configNameCache[name];
                this[nameMap.get] = this[nameMap.initGet];
            }

            this.beforeInitConfig(config);

            for (i = 0,ln = initConfigList.length; i < ln; i++) {
                name = initConfigList[i];
                nameMap = configNameCache[name];
                getName = nameMap.get;

                if (this.hasOwnProperty(getName)) {
                    this[nameMap.set].call(this, config[name]);
                    delete this[getName];
                }
            }

            return this;
        },

        beforeInitConfig: Ext.emptyFn,

        getCurrentConfig: function() {
            var defaultConfig = this.defaultConfig,
                configNameCache = Ext.Class.configNameCache,
                config = {},
                name, nameMap;

            for (name in defaultConfig) {
                nameMap = configNameCache[name];
                config[name] = this[nameMap.get].call(this);
            }

            return config;
        },

        setConfig: function(config, applyIfNotSet) {
            if (!config) {
                return this;
            }

            var configNameCache = Ext.Class.configNameCache,
                currentConfig = this.config,
                defaultConfig = this.defaultConfig,
                initialConfig = this.initialConfig,
                configList = [],
                name, i, ln, nameMap;

            applyIfNotSet = Boolean(applyIfNotSet);

            for (name in config) {
                if ((applyIfNotSet && (name in initialConfig))) {
                    continue;
                }

                currentConfig[name] = config[name];

                if (name in defaultConfig) {
                    configList.push(name);
                    nameMap = configNameCache[name];
                    this[nameMap.get] = this[nameMap.initGet];
                }
            }

            for (i = 0,ln = configList.length; i < ln; i++) {
                name = configList[i];
                nameMap = configNameCache[name];
                this[nameMap.set].call(this, config[name]);
                delete this[nameMap.get];
            }

            return this;
        },

        set: function(name, value) {
            return this[Ext.Class.configNameCache[name].set].call(this, value);
        },

        get: function(name) {
            return this[Ext.Class.configNameCache[name].get].call(this);
        },

         getConfig: function(name) {
            return this[Ext.Class.configNameCache[name].get].call(this);
        },

        hasConfig: function(name) {
            return (name in this.defaultConfig);
        },

        getInitialConfig: function(name) {
            var config = this.config;

            if (!name) {
                return config;
            }
            else {
                return config[name];
            }
        },

        onConfigUpdate: function(names, callback, scope) {
            var self = this.self,
                //<debug>
                className = self.$className,
                //</debug>
                i, ln, name,
                updaterName, updater, newUpdater;

            names = Ext.Array.from(names);

            scope = scope || this;

            for (i = 0,ln = names.length; i < ln; i++) {
                name = names[i];
                updaterName = 'update' + Ext.String.capitalize(name);
                updater = this[updaterName] || Ext.emptyFn;
                newUpdater = function() {
                    updater.apply(this, arguments);
                    scope[callback].apply(scope, arguments);
                };
                newUpdater.$name = updaterName;
                newUpdater.$owner = self;
                //<debug>
                newUpdater.displayName = className + '#' + updaterName;
                //</debug>

                this[updaterName] = newUpdater;
            }
        },
        //</feature>

        link: function(name, value) {
            this.$links = {};
            this.link = this.doLink;
            return this.link.apply(this, arguments);
        },

        doLink: function(name, value) {
            this.$links[name] = true;

            this[name] = value;

            return value;
        },

      
        unlink: function() {
            var i, ln, link, value;

            for (i = 0, ln = arguments.length; i < ln; i++) {
                link = arguments[i];
                if (this.hasOwnProperty(link)) {
                    value = this[link];
                    if (value) {
                        if (value.isInstance && !value.isDestroyed) {
                            value.destroy();
                        }
                        else if (value.parentNode && 'nodeType' in value) {
                            value.parentNode.removeChild(value);
                        }
                    }
                    delete this[link];
                }
            }

            return this;
        },

      
        destroy: function() {
            this.destroy = Ext.emptyFn;
            this.isDestroyed = true;

            if (this.hasOwnProperty('$links')) {
                this.unlink.apply(this, Ext.Object.getKeys(this.$links));
                delete this.$links;
            }
        }
    });

    Ext.Base = Base;

})(Ext.Function.flexSetter);

//@tag foundation,core
//@define Ext.Class
//@require Ext.Base

(function() {
    var ExtClass,
        Base = Ext.Base,
        baseStaticMembers = [],
        baseStaticMember, baseStaticMemberLength;

    for (baseStaticMember in Base) {
        if (Base.hasOwnProperty(baseStaticMember)) {
            baseStaticMembers.push(baseStaticMember);
        }
    }

    baseStaticMemberLength = baseStaticMembers.length;

      Ext.Class = ExtClass = function(Class, data, onCreated) {
        if (typeof Class != 'function') {
            onCreated = data;
            data = Class;
            Class = null;
        }

        if (!data) {
            data = {};
        }

        Class = ExtClass.create(Class);

        ExtClass.process(Class, data, onCreated);

        return Class;
    };

    Ext.apply(ExtClass, {
      
        onBeforeCreated: function(Class, data, hooks) {
            Class.addMembers(data);

            hooks.onCreated.call(Class, Class);
        },

             create: function(Class) {
            var name, i;

            if (!Class) {
                Class = function() {
                    return this.constructor.apply(this, arguments);
                };
            }

            for (i = 0; i < baseStaticMemberLength; i++) {
                name = baseStaticMembers[i];
                Class[name] = Base[name];
            }

            return Class;
        },

      
        process: function(Class, data, onCreated) {
            var preprocessorStack = data.preprocessors || ExtClass.defaultPreprocessors,
                preprocessors = this.preprocessors,
                hooks = {
                    onBeforeCreated: this.onBeforeCreated,
                    onCreated: onCreated || Ext.emptyFn
                },
                index = 0,
                name, preprocessor, properties,
                i, ln, fn, property, process;

            delete data.preprocessors;

            process = function(Class, data, hooks) {
                fn = null;

                while (fn === null) {
                    name = preprocessorStack[index++];

                    if (name) {
                        preprocessor = preprocessors[name];
                        properties = preprocessor.properties;

                        if (properties === true) {
                            fn = preprocessor.fn;
                        }
                        else {
                            for (i = 0,ln = properties.length; i < ln; i++) {
                                property = properties[i];

                                if (data.hasOwnProperty(property)) {
                                    fn = preprocessor.fn;
                                    break;
                                }
                            }
                        }
                    }
                    else {
                        hooks.onBeforeCreated.apply(this, arguments);
                        return;
                    }
                }

                if (fn.call(this, Class, data, hooks, process) !== false) {
                    process.apply(this, arguments);
                }
            };

            process.call(this, Class, data, hooks);
        },

       
        preprocessors: {},

               registerPreprocessor: function(name, fn, properties, position, relativeTo) {
            if (!position) {
                position = 'last';
            }

            if (!properties) {
                properties = [name];
            }

            this.preprocessors[name] = {
                name: name,
                properties: properties || false,
                fn: fn
            };

            this.setDefaultPreprocessorPosition(name, position, relativeTo);

            return this;
        },

               getPreprocessor: function(name) {
            return this.preprocessors[name];
        },

       
        getPreprocessors: function() {
            return this.preprocessors;
        },

       
        defaultPreprocessors: [],

        
        getDefaultPreprocessors: function() {
            return this.defaultPreprocessors;
        },

       
        setDefaultPreprocessors: function(preprocessors) {
            this.defaultPreprocessors = Ext.Array.from(preprocessors);

            return this;
        },

      
        setDefaultPreprocessorPosition: function(name, offset, relativeName) {
            var defaultPreprocessors = this.defaultPreprocessors,
                index;

            if (typeof offset == 'string') {
                if (offset === 'first') {
                    defaultPreprocessors.unshift(name);

                    return this;
                }
                else if (offset === 'last') {
                    defaultPreprocessors.push(name);

                    return this;
                }

                offset = (offset === 'after') ? 1 : -1;
            }

            index = Ext.Array.indexOf(defaultPreprocessors, relativeName);

            if (index !== -1) {
                Ext.Array.splice(defaultPreprocessors, Math.max(0, index + offset), 0, name);
            }

            return this;
        },

       
        configNameCache: {},

        
        getConfigNameMap: function(name) {
            var cache = this.configNameCache,
                map = cache[name],
                capitalizedName;

            if (!map) {
                capitalizedName = name.charAt(0).toUpperCase() + name.substr(1);

                map = cache[name] = {
                    name: name,
                    internal: '_' + name,
                    initializing: 'is' + capitalizedName + 'Initializing',
                    apply: 'apply' + capitalizedName,
                    update: 'update' + capitalizedName,
                    set: 'set' + capitalizedName,
                    get: 'get' + capitalizedName,
                    initGet: 'initGet' + capitalizedName,
                    doSet : 'doSet' + capitalizedName,
                    changeEvent: name.toLowerCase() + 'change'
                }
            }

            return map;
        },

       
        generateSetter: function(nameMap) {
            var internalName = nameMap.internal,
                getName = nameMap.get,
                applyName = nameMap.apply,
                updateName = nameMap.update,
                setter;

            setter = function(value) {
                var oldValue = this[internalName],
                    applier = this[applyName],
                    updater = this[updateName];

                delete this[getName];

                if (applier) {
                    value = applier.call(this, value, oldValue);
                    if (typeof value == 'undefined') {
                        return this;
                    }
                }

                this[internalName] = value;

                if (updater && value !== oldValue) {
                    updater.call(this, value, oldValue);
                }

                return this;
            };

            setter.$isDefault = true;

            return setter;
        },
   
        generateInitGetter: function(nameMap) {
            var name = nameMap.name,
                setName = nameMap.set,
                getName = nameMap.get,
                initializingName = nameMap.initializing;

            return function() {
                this[initializingName] = true;
                delete this[getName];

                this[setName].call(this, this.config[name]);
                delete this[initializingName];

                return this[getName].apply(this, arguments);
            }
        },
        generateGetter: function(nameMap) {
            var internalName = nameMap.internal;

            return function() {
                return this[internalName];
            }
        }
    });

    ExtClass.registerPreprocessor('extend', function(Class, data) {
        var Base = Ext.Base,
            extend = data.extend,
            Parent;

        delete data.extend;

        if (extend && extend !== Object) {
            Parent = extend;
        }
        else {
            Parent = Base;
        }

        Class.extend(Parent);

        Class.triggerExtended.apply(Class, arguments);

        if (data.onClassExtended) {
            Class.onExtended(data.onClassExtended, Class);
            delete data.onClassExtended;
        }

    }, true);

     ExtClass.registerPreprocessor('statics', function(Class, data) {
        Class.addStatics(data.statics);

        delete data.statics;
    });
    //</feature>

    //<feature classSystem.inheritableStatics>

    ExtClass.registerPreprocessor('inheritableStatics', function(Class, data) {
        Class.addInheritableStatics(data.inheritableStatics);

        delete data.inheritableStatics;
    });
    //</feature>

        //<feature classSystem.platformConfig>
    ExtClass.registerPreprocessor('platformConfig', function(Class, data, hooks) {
        var platformConfigs = data.platformConfig,
            config = data.config || {},
            platform, theme, platformConfig, i, ln, j , ln2;

        delete data.platformConfig;

        if (!Ext.filterPlatform) {
            Ext.filterPlatform = function(platform) {
                var profileMatch = false,
                    ua = navigator.userAgent,
                    j, jln;

                platform = [].concat(platform);

                function isPhone(ua) {
                    var isMobile = /Mobile(\/|\s)/.test(ua);

                    // Either:
                    // - iOS but not iPad
                    // - Android 2
                    // - Android with "Mobile" in the UA

                    return /(iPhone|iPod)/.test(ua) ||
                              (!/(Silk)/.test(ua) && (/(Android)/.test(ua) && (/(Android 2)/.test(ua) || isMobile))) ||
                              (/(BlackBerry|BB)/.test(ua) && isMobile) ||
                              /(Windows Phone)/.test(ua);
                }

                function isTablet(ua) {
                    return !isPhone(ua) && (/iPad/.test(ua) || /Android/.test(ua) || /(RIM Tablet OS)/.test(ua) ||
                        (/MSIE 10/.test(ua) && /; Touch/.test(ua)));
                }

                // Check if the ?platform parameter is set in the URL
                var paramsString = window.location.search.substr(1),
                    paramsArray = paramsString.split("&"),
                    params = {},
                    testPlatform, i;

                for (i = 0; i < paramsArray.length; i++) {
                    var tmpArray = paramsArray[i].split("=");
                    params[tmpArray[0]] = tmpArray[1];
                }

                testPlatform = params.platform;
                if (testPlatform) {
                    return platform.indexOf(testPlatform) != -1;
                }

                for (j = 0, jln = platform.length; j < jln; j++) {
                    switch (platform[j]) {
                        case 'phone':
                            profileMatch = isPhone(ua);
                            break;
                        case 'tablet':
                            profileMatch = isTablet(ua);
                            break;
                        case 'desktop':
                            profileMatch = !isPhone(ua) && !isTablet(ua);
                            break;
                        case 'ios':
                            profileMatch = /(iPad|iPhone|iPod)/.test(ua);
                            break;
                        case 'android':
                            profileMatch = /(Android|Silk)/.test(ua);
                            break;
                        case 'blackberry':
                            profileMatch = /(BlackBerry|BB)/.test(ua);
                            break;
                        case 'safari':
                            profileMatch = /Safari/.test(ua) && !(/(BlackBerry|BB)/.test(ua));
                            break;
                        case 'chrome':
                            profileMatch = /Chrome/.test(ua);
                            break;
                        case 'ie10':
                            profileMatch = /MSIE 10/.test(ua);
                            break;
                    }
                    if (profileMatch) {
                        return true;
                    }
                }
                return false;
            };
        }

        for (i = 0, ln = platformConfigs.length; i < ln; i++) {
            platformConfig = platformConfigs[i];

            platform = platformConfig.platform;
            delete platformConfig.platform;

            theme = [].concat(platformConfig.theme);
            ln2 = theme.length;
            delete platformConfig.theme;

            if (platform && Ext.filterPlatform(platform)) {
                Ext.merge(config, platformConfig);
            }

            if (ln2) {
                for (j = 0; j < ln2; j++) {
                    if (Ext.theme.name == theme[j]) {
                        Ext.merge(config, platformConfig);
                    }
                }
            }
        }
    });
    ExtClass.registerPreprocessor('config', function(Class, data) {
        var config = data.config,
            prototype = Class.prototype,
            defaultConfig = prototype.config,
            nameMap, name, setName, getName, initGetName, internalName, value;

        delete data.config;

        for (name in config) {
            // Once per config item, per class hierarchy
            if (config.hasOwnProperty(name) && !(name in defaultConfig)) {
                value = config[name];
                nameMap = this.getConfigNameMap(name);
                setName = nameMap.set;
                getName = nameMap.get;
                initGetName = nameMap.initGet;
                internalName = nameMap.internal;

                data[initGetName] = this.generateInitGetter(nameMap);

                if (value === null && !data.hasOwnProperty(internalName)) {
                    data[internalName] = null;
                }

                if (!data.hasOwnProperty(getName)) {
                    data[getName] = this.generateGetter(nameMap);
                }

                if (!data.hasOwnProperty(setName)) {
                    data[setName] = this.generateSetter(nameMap);
                }
            }
        }

        Class.addConfig(config, true);
    });
     ExtClass.registerPreprocessor('mixins', function(Class, data, hooks) {
        var mixins = data.mixins,
            name, mixin, i, ln;

        delete data.mixins;

        Ext.Function.interceptBefore(hooks, 'onCreated', function() {
            if (mixins instanceof Array) {
                for (i = 0,ln = mixins.length; i < ln; i++) {
                    mixin = mixins[i];
                    name = mixin.prototype.mixinId || mixin.$className;

                    Class.mixin(name, mixin);
                }
            }
            else {
                for (name in mixins) {
                    if (mixins.hasOwnProperty(name)) {
                        Class.mixin(name, mixins[name]);
                    }
                }
            }
        });
    });
    //</feature>

    //<feature classSystem.backwardsCompatible>
    // Backwards compatible
    Ext.extend = function(Class, Parent, members) {
        if (arguments.length === 2 && Ext.isObject(Parent)) {
            members = Parent;
            Parent = Class;
            Class = null;
        }

        var cls;

        if (!Parent) {
            throw new Error("[Ext.extend] Attempting to extend from a class which has not been loaded on the page.");
        }

        members.extend = Parent;
        members.preprocessors = [
            'extend'

            //<feature classSystem.statics>
            ,'statics'
            //</feature>

            //<feature classSystem.inheritableStatics>
            ,'inheritableStatics'
            //</feature>

            //<feature classSystem.mixins>
            ,'mixins'
            //</feature>

            //<feature classSystem.platformConfig>
            ,'platformConfig'
            //</feature>

            //<feature classSystem.config>
            ,'config'
            //</feature>
        ];

        if (Class) {
            cls = new ExtClass(Class, members);
        }
        else {
            cls = new ExtClass(members);
        }

        cls.prototype.override = function(o) {
            for (var m in o) {
                if (o.hasOwnProperty(m)) {
                    this[m] = o[m];
                }
            }
        };

        return cls;
    };
    //</feature>
})();

(function(Class, alias, arraySlice, arrayFrom, global) {
    var Manager = Ext.ClassManager = {

      
        classes: {},

        existCache: {},

      
        namespaceRewrites: [{
            from: 'Ext.',
            to: Ext
        }],

        maps: {
            alternateToName: {},
            aliasToName: {},
            nameToAliases: {},
            nameToAlternates: {}
        },

        enableNamespaceParseCache: true,
        namespaceParseCache: {},

        instantiators: [],
        isCreated: function(className) {
            var existCache = this.existCache,
                i, ln, part, root, parts;

            //<debug error>
            if (typeof className != 'string' || className.length < 1) {
                throw new Error("[Ext.ClassManager] Invalid classname, must be a string and must not be empty");
            }
            //</debug>

            if (this.classes[className] || existCache[className]) {
                return true;
            }

            root = global;
            parts = this.parseNamespace(className);

            for (i = 0, ln = parts.length; i < ln; i++) {
                part = parts[i];

                if (typeof part != 'string') {
                    root = part;
                } else {
                    if (!root || !root[part]) {
                        return false;
                    }

                    root = root[part];
                }
            }

            existCache[className] = true;

            this.triggerCreated(className);

            return true;
        },

        createdListeners: [],

        nameCreatedListeners: {},

        triggerCreated: function(className) {
            var listeners = this.createdListeners,
                nameListeners = this.nameCreatedListeners,
                alternateNames = this.maps.nameToAlternates[className],
                names = [className],
                i, ln, j, subLn, listener, name;

            for (i = 0,ln = listeners.length; i < ln; i++) {
                listener = listeners[i];
                listener.fn.call(listener.scope, className);
            }

            if (alternateNames) {
                names.push.apply(names, alternateNames);
            }

            for (i = 0,ln = names.length; i < ln; i++) {
                name = names[i];
                listeners = nameListeners[name];

                if (listeners) {
                    for (j = 0,subLn = listeners.length; j < subLn; j++) {
                        listener = listeners[j];
                        listener.fn.call(listener.scope, name);
                    }
                    delete nameListeners[name];
                }
            }
        },

        onCreated: function(fn, scope, className) {
            var listeners = this.createdListeners,
                nameListeners = this.nameCreatedListeners,
                listener = {
                    fn: fn,
                    scope: scope
                };

            if (className) {
                if (this.isCreated(className)) {
                    fn.call(scope, className);
                    return;
                }

                if (!nameListeners[className]) {
                    nameListeners[className] = [];
                }

                nameListeners[className].push(listener);
            }
            else {
                listeners.push(listener);
            }
        },

         parseNamespace: function(namespace) {
            //<debug error>
            if (typeof namespace != 'string') {
                throw new Error("[Ext.ClassManager] Invalid namespace, must be a string");
            }
            //</debug>

            var cache = this.namespaceParseCache;

            if (this.enableNamespaceParseCache) {
                if (cache.hasOwnProperty(namespace)) {
                    return cache[namespace];
                }
            }

            var parts = [],
                rewrites = this.namespaceRewrites,
                root = global,
                name = namespace,
                rewrite, from, to, i, ln;

            for (i = 0, ln = rewrites.length; i < ln; i++) {
                rewrite = rewrites[i];
                from = rewrite.from;
                to = rewrite.to;

                if (name === from || name.substring(0, from.length) === from) {
                    name = name.substring(from.length);

                    if (typeof to != 'string') {
                        root = to;
                    } else {
                        parts = parts.concat(to.split('.'));
                    }

                    break;
                }
            }

            parts.push(root);

            parts = parts.concat(name.split('.'));

            if (this.enableNamespaceParseCache) {
                cache[namespace] = parts;
            }

            return parts;
        },

         setNamespace: function(name, value) {
            var root = global,
                parts = this.parseNamespace(name),
                ln = parts.length - 1,
                leaf = parts[ln],
                i, part;

            for (i = 0; i < ln; i++) {
                part = parts[i];

                if (typeof part != 'string') {
                    root = part;
                } else {
                    if (!root[part]) {
                        root[part] = {};
                    }

                    root = root[part];
                }
            }

            root[leaf] = value;

            return root[leaf];
        },

        createNamespaces: function() {
            var root = global,
                parts, part, i, j, ln, subLn;

            for (i = 0, ln = arguments.length; i < ln; i++) {
                parts = this.parseNamespace(arguments[i]);

                for (j = 0, subLn = parts.length; j < subLn; j++) {
                    part = parts[j];

                    if (typeof part != 'string') {
                        root = part;
                    } else {
                        if (!root[part]) {
                            root[part] = {};
                        }

                        root = root[part];
                    }
                }
            }

            return root;
        },

        set: function(name, value) {
            var me = this,
                maps = me.maps,
                nameToAlternates = maps.nameToAlternates,
                targetName = me.getName(value),
                alternates;

            me.classes[name] = me.setNamespace(name, value);

            if (targetName && targetName !== name) {
                maps.alternateToName[name] = targetName;
                alternates = nameToAlternates[targetName] || (nameToAlternates[targetName] = []);
                alternates.push(name);
            }

            return this;
        },

        get: function(name) {
            var classes = this.classes;

            if (classes[name]) {
                return classes[name];
            }

            var root = global,
                parts = this.parseNamespace(name),
                part, i, ln;

            for (i = 0, ln = parts.length; i < ln; i++) {
                part = parts[i];

                if (typeof part != 'string') {
                    root = part;
                } else {
                    if (!root || !root[part]) {
                        return null;
                    }

                    root = root[part];
                }
            }

            return root;
        },

         setAlias: function(cls, alias) {
            var aliasToNameMap = this.maps.aliasToName,
                nameToAliasesMap = this.maps.nameToAliases,
                className;

            if (typeof cls == 'string') {
                className = cls;
            } else {
                className = this.getName(cls);
            }

            if (alias && aliasToNameMap[alias] !== className) {
                //<debug info>
                if (aliasToNameMap[alias]) {
                    Ext.Logger.info("[Ext.ClassManager] Overriding existing alias: '" + alias + "' " +
                        "of: '" + aliasToNameMap[alias] + "' with: '" + className + "'. Be sure it's intentional.");
                }
                //</debug>

                aliasToNameMap[alias] = className;
            }

            if (!nameToAliasesMap[className]) {
                nameToAliasesMap[className] = [];
            }

            if (alias) {
                Ext.Array.include(nameToAliasesMap[className], alias);
            }

            return this;
        },

        addNameAliasMappings: function(aliases){
            var aliasToNameMap = this.maps.aliasToName,
                nameToAliasesMap = this.maps.nameToAliases,
                className, aliasList, alias, i;

            for (className in aliases) {
                aliasList = nameToAliasesMap[className] ||
                    (nameToAliasesMap[className] = []);

                for (i = 0; i < aliases[className].length; i++) {
                    alias = aliases[className][i];
                    if (!aliasToNameMap[alias]) {
                        aliasToNameMap[alias] = className;
                        aliasList.push(alias);
                    }
                }

            }
            return this;
        },

         addNameAlternateMappings: function(alternates) {
            var alternateToName = this.maps.alternateToName,
                nameToAlternates = this.maps.nameToAlternates,
                className, aliasList, alternate, i;

            for (className in alternates) {
                aliasList = nameToAlternates[className] ||
                    (nameToAlternates[className] = []);

                for (i  = 0; i < alternates[className].length; i++) {
                    alternate = alternates[className];
                    if (!alternateToName[alternate]) {
                        alternateToName[alternate] = className;
                        aliasList.push(alternate);
                    }
                }

            }
            return this;
        },

        getByAlias: function(alias) {
            return this.get(this.getNameByAlias(alias));
        },


        getNameByAlias: function(alias) {
            return this.maps.aliasToName[alias] || '';
        },

        getNameByAlternate: function(alternate) {
            return this.maps.alternateToName[alternate] || '';
        },

         getAliasesByName: function(name) {
            return this.maps.nameToAliases[name] || [];
        },

        getName: function(object) {
            return object && object.$className || '';
        },

        getClass: function(object) {
            return object && object.self || null;
        },
	create: function(className, data, createdFn) {
            //<debug error>
            if (typeof className != 'string') {
                throw new Error("[Ext.define] Invalid class name '" + className + "' specified, must be a non-empty string");
            }
            //</debug>

            data.$className = className;

            return new Class(data, function() {
                var postprocessorStack = data.postprocessors || Manager.defaultPostprocessors,
                    registeredPostprocessors = Manager.postprocessors,
                    index = 0,
                    postprocessors = [],
                    postprocessor, process, i, ln, j, subLn, postprocessorProperties, postprocessorProperty;

                delete data.postprocessors;

                for (i = 0,ln = postprocessorStack.length; i < ln; i++) {
                    postprocessor = postprocessorStack[i];

                    if (typeof postprocessor == 'string') {
                        postprocessor = registeredPostprocessors[postprocessor];
                        postprocessorProperties = postprocessor.properties;

                        if (postprocessorProperties === true) {
                            postprocessors.push(postprocessor.fn);
                        }
                        else if (postprocessorProperties) {
                            for (j = 0,subLn = postprocessorProperties.length; j < subLn; j++) {
                                postprocessorProperty = postprocessorProperties[j];

                                if (data.hasOwnProperty(postprocessorProperty)) {
                                    postprocessors.push(postprocessor.fn);
                                    break;
                                }
                            }
                        }
                    }
                    else {
                        postprocessors.push(postprocessor);
                    }
                }

                process = function(clsName, cls, clsData) {
                    postprocessor = postprocessors[index++];

                    if (!postprocessor) {
                        Manager.set(className, cls);

                        if (createdFn) {
                            createdFn.call(cls, cls);
                        }

                        Manager.triggerCreated(className);
                        return;
                    }

                    if (postprocessor.call(this, clsName, cls, clsData, process) !== false) {
                        process.apply(this, arguments);
                    }
                };

                process.call(Manager, className, this, data);
            });
        },

        createOverride: function(className, data) {
            var overriddenClassName = data.override,
                requires = Ext.Array.from(data.requires);

            delete data.override;
            delete data.requires;

            this.existCache[className] = true;

            Ext.require(requires, function() {
                // Override the target class right after it's created
                this.onCreated(function() {
                    var overridenClass = this.get(overriddenClassName);
                    if (overridenClass.singleton) {
                        overridenClass.self.override(data);
                    }
                    else {
                        overridenClass.override(data);
                    }

                    // This push the overridding file itself into Ext.Loader.history
                    // Hence if the target class never exists, the overriding file will
                    // never be included in the build
                    this.triggerCreated(className);
                }, this, overriddenClassName);
            }, this);

            return this;
        },

        instantiateByAlias: function() {
            var alias = arguments[0],
                args = arraySlice.call(arguments),
                className = this.getNameByAlias(alias);

            if (!className) {
                className = this.maps.aliasToName[alias];

                //<debug error>
                if (!className) {
                    throw new Error("[Ext.createByAlias] Cannot create an instance of unrecognized alias: " + alias);
                }
                //</debug>

                //<debug warn>
                Ext.Logger.warn("[Ext.Loader] Synchronously loading '" + className + "'; consider adding " +
                     "Ext.require('" + alias + "') above Ext.onReady");
                //</debug>

                Ext.syncRequire(className);
            }

            args[0] = className;

            return this.instantiate.apply(this, args);
        },

         instantiate: function() {
            var name = arguments[0],
                args = arraySlice.call(arguments, 1),
                alias = name,
                possibleName, cls;

            if (typeof name != 'function') {
                //<debug error>
                if ((typeof name != 'string' || name.length < 1)) {
                    throw new Error("[Ext.create] Invalid class name or alias '" + name + "' specified, must be a non-empty string");
                }
                //</debug>

                cls = this.get(name);
            }
            else {
                cls = name;
            }

            // No record of this class name, it's possibly an alias, so look it up
            if (!cls) {
                possibleName = this.getNameByAlias(name);

                if (possibleName) {
                    name = possibleName;

                    cls = this.get(name);
                }
            }

            // Still no record of this class name, it's possibly an alternate name, so look it up
            if (!cls) {
                possibleName = this.getNameByAlternate(name);

                if (possibleName) {
                    name = possibleName;

                    cls = this.get(name);
                }
            }

            // Still not existing at this point, try to load it via synchronous mode as the last resort
            if (!cls) {
                //<debug warn>
                Ext.Logger.warn("[Ext.Loader] Synchronously loading '" + name + "'; consider adding '" +
                    ((possibleName) ? alias : name) + "' explicitly as a require of the corresponding class");
                //</debug>

                Ext.syncRequire(name);

                cls = this.get(name);
            }

            //<debug error>
            if (!cls) {
                throw new Error("[Ext.create] Cannot create an instance of unrecognized class name / alias: " + alias);
            }

            if (typeof cls != 'function') {
                throw new Error("[Ext.create] '" + name + "' is a singleton and cannot be instantiated");
            }
            //</debug>

            return this.getInstantiator(args.length)(cls, args);
        },

         dynInstantiate: function(name, args) {
            args = arrayFrom(args, true);
            args.unshift(name);

            return this.instantiate.apply(this, args);
        },

        getInstantiator: function(length) {
            var instantiators = this.instantiators,
                instantiator;

            instantiator = instantiators[length];

            if (!instantiator) {
                var i = length,
                    args = [];

                for (i = 0; i < length; i++) {
                    args.push('a[' + i + ']');
                }

                instantiator = instantiators[length] = new Function('c', 'a', 'return new c(' + args.join(',') + ')');
                //<debug>
                instantiator.displayName = "Ext.ClassManager.instantiate" + length;
                //</debug>
            }

            return instantiator;
        },

         postprocessors: {},

        defaultPostprocessors: [],

        registerPostprocessor: function(name, fn, properties, position, relativeTo) {
            if (!position) {
                position = 'last';
            }

            if (!properties) {
                properties = [name];
            }

            this.postprocessors[name] = {
                name: name,
                properties: properties || false,
                fn: fn
            };

            this.setDefaultPostprocessorPosition(name, position, relativeTo);

            return this;
        },

         setDefaultPostprocessors: function(postprocessors) {
            this.defaultPostprocessors = arrayFrom(postprocessors);

            return this;
        },

        setDefaultPostprocessorPosition: function(name, offset, relativeName) {
            var defaultPostprocessors = this.defaultPostprocessors,
                index;

            if (typeof offset == 'string') {
                if (offset === 'first') {
                    defaultPostprocessors.unshift(name);

                    return this;
                }
                else if (offset === 'last') {
                    defaultPostprocessors.push(name);

                    return this;
                }

                offset = (offset === 'after') ? 1 : -1;
            }

            index = Ext.Array.indexOf(defaultPostprocessors, relativeName);

            if (index !== -1) {
                Ext.Array.splice(defaultPostprocessors, Math.max(0, index + offset), 0, name);
            }

            return this;
        },

        getNamesByExpression: function(expression) {
            var nameToAliasesMap = this.maps.nameToAliases,
                names = [],
                name, alias, aliases, possibleName, regex, i, ln;

            //<debug error>
            if (typeof expression != 'string' || expression.length < 1) {
                throw new Error("[Ext.ClassManager.getNamesByExpression] Expression " + expression + " is invalid, must be a non-empty string");
            }
            //</debug>

            if (expression.indexOf('*') !== -1) {
                expression = expression.replace(/\*/g, '(.*?)');
                regex = new RegExp('^' + expression + '$');

                for (name in nameToAliasesMap) {
                    if (nameToAliasesMap.hasOwnProperty(name)) {
                        aliases = nameToAliasesMap[name];

                        if (name.search(regex) !== -1) {
                            names.push(name);
                        }
                        else {
                            for (i = 0, ln = aliases.length; i < ln; i++) {
                                alias = aliases[i];

                                if (alias.search(regex) !== -1) {
                                    names.push(name);
                                    break;
                                }
                            }
                        }
                    }
                }

            } else {
                possibleName = this.getNameByAlias(expression);

                if (possibleName) {
                    names.push(possibleName);
                } else {
                    possibleName = this.getNameByAlternate(expression);

                    if (possibleName) {
                        names.push(possibleName);
                    } else {
                        names.push(expression);
                    }
                }
            }

            return names;
        }
    };

    Manager.registerPostprocessor('alias', function(name, cls, data) {
        var aliases = data.alias,
            i, ln;

        for (i = 0,ln = aliases.length; i < ln; i++) {
            alias = aliases[i];

            this.setAlias(cls, alias);
        }

    }, ['xtype', 'alias']);
    Manager.registerPostprocessor('singleton', function(name, cls, data, fn) {
        fn.call(this, name, new cls(), data);
        return false;
    });
    Manager.registerPostprocessor('alternateClassName', function(name, cls, data) {
        var alternates = data.alternateClassName,
            i, ln, alternate;

        if (!(alternates instanceof Array)) {
            alternates = [alternates];
        }

        for (i = 0, ln = alternates.length; i < ln; i++) {
            alternate = alternates[i];

            //<debug error>
            if (typeof alternate != 'string') {
                throw new Error("[Ext.define] Invalid alternate of: '" + alternate + "' for class: '" + name + "'; must be a valid string");
            }
            //</debug>

            this.set(alternate, cls);
        }
    });
    //</feature>

    Ext.apply(Ext, {
        create: alias(Manager, 'instantiate'),

         widget: function(name) {
            var args = arraySlice.call(arguments);
            args[0] = 'widget.' + name;

            return Manager.instantiateByAlias.apply(Manager, args);
        },

       createByAlias: alias(Manager, 'instantiateByAlias'),

        define: function (className, data, createdFn) {
            if ('override' in data) {
                return Manager.createOverride.apply(Manager, arguments);
            }

            return Manager.create.apply(Manager, arguments);
        },

             getClassName: alias(Manager, 'getName'),

             getDisplayName: function(object) {
            if (object) {
                if (object.displayName) {
                    return object.displayName;
                }

                if (object.$name && object.$class) {
                    return Ext.getClassName(object.$class) + '#' + object.$name;
                }

                if (object.$className) {
                    return object.$className;
                }
            }

            return 'Anonymous';
        },

            getClass: alias(Manager, 'getClass'),

              namespace: alias(Manager, 'createNamespaces')
    });

      Ext.createWidget = Ext.widget;
    Ext.ns = Ext.namespace;

    Class.registerPreprocessor('className', function(cls, data) {
        if (data.$className) {
            cls.$className = data.$className;
            //<debug>
            cls.displayName = cls.$className;
            //</debug>
        }
    }, true, 'first');

    Class.registerPreprocessor('alias', function(cls, data) {
        var prototype = cls.prototype,
            xtypes = arrayFrom(data.xtype),
            aliases = arrayFrom(data.alias),
            widgetPrefix = 'widget.',
            widgetPrefixLength = widgetPrefix.length,
            xtypesChain = Array.prototype.slice.call(prototype.xtypesChain || []),
            xtypesMap = Ext.merge({}, prototype.xtypesMap || {}),
            i, ln, alias, xtype;

        for (i = 0,ln = aliases.length; i < ln; i++) {
            alias = aliases[i];

            //<debug error>
            if (typeof alias != 'string' || alias.length < 1) {
                throw new Error("[Ext.define] Invalid alias of: '" + alias + "' for class: '" + name + "'; must be a valid string");
            }
            //</debug>

            if (alias.substring(0, widgetPrefixLength) === widgetPrefix) {
                xtype = alias.substring(widgetPrefixLength);
                Ext.Array.include(xtypes, xtype);
            }
        }

        cls.xtype = data.xtype = xtypes[0];
        data.xtypes = xtypes;

        for (i = 0,ln = xtypes.length; i < ln; i++) {
            xtype = xtypes[i];

            if (!xtypesMap[xtype]) {
                xtypesMap[xtype] = true;
                xtypesChain.push(xtype);
            }
        }

        data.xtypesChain = xtypesChain;
        data.xtypesMap = xtypesMap;

        Ext.Function.interceptAfter(data, 'onClassCreated', function() {
            var mixins = prototype.mixins,
                key, mixin;

            for (key in mixins) {
                if (mixins.hasOwnProperty(key)) {
                    mixin = mixins[key];

                    xtypes = mixin.xtypes;

                    if (xtypes) {
                        for (i = 0,ln = xtypes.length; i < ln; i++) {
                            xtype = xtypes[i];

                            if (!xtypesMap[xtype]) {
                                xtypesMap[xtype] = true;
                                xtypesChain.push(xtype);
                            }
                        }
                    }
                }
            }
        });

        for (i = 0,ln = xtypes.length; i < ln; i++) {
            xtype = xtypes[i];

            //<debug error>
            if (typeof xtype != 'string' || xtype.length < 1) {
                throw new Error("[Ext.define] Invalid xtype of: '" + xtype + "' for class: '" + name + "'; must be a valid non-empty string");
            }
            //</debug>

            Ext.Array.include(aliases, widgetPrefix + xtype);
        }

        data.alias = aliases;

    }, ['xtype', 'alias']);

})(Ext.Class, Ext.Function.alias, Array.prototype.slice, Ext.Array.from, Ext.global);

(function(Manager, Class, flexSetter, alias, pass, arrayFrom, arrayErase, arrayInclude) {

    var
        dependencyProperties = ['extend', 'mixins', 'requires'],
        Loader,
        setPathCount = 0;;

    Loader = Ext.Loader = {

            isInHistory: {},

        history: [],

        config: {
ed: true,

            disableCaching: true,

            disableCachingParam: '_dc',


            paths: {
                'Ext': '.'
            }
        },

        setConfig: function(name, value) {
            if (Ext.isObject(name) && arguments.length === 1) {
                Ext.merge(this.config, name);
            }
            else {
                this.config[name] = (Ext.isObject(value)) ? Ext.merge(this.config[name], value) : value;
            }
            setPathCount += 1;
            return this;
        },

        getConfig: function(name) {
            if (name) {
                return this.config[name];
            }

            return this.config;
        },

         setPath: flexSetter(function(name, path) {
            this.config.paths[name] = path;
            setPathCount += 1;
            return this;
        }),

        addClassPathMappings: function(paths) {
            var name;

            if(setPathCount == 0){
                Loader.config.paths = paths;
            } else {
                for(name in paths){
                    Loader.config.paths[name] = paths[name];
                }
            }
            setPathCount++;
            return Loader;
        },

        getPath: function(className) {
            var path = '',
                paths = this.config.paths,
                prefix = this.getPrefix(className);

            if (prefix.length > 0) {
                if (prefix === className) {
                    return paths[prefix];
                }

                path = paths[prefix];
                className = className.substring(prefix.length + 1);
            }

            if (path.length > 0) {
                path += '/';
            }

            return path.replace(/\/\.\//g, '/') + className.replace(/\./g, "/") + '.js';
        },

 
        getPrefix: function(className) {
            var paths = this.config.paths,
                prefix, deepestPrefix = '';

            if (paths.hasOwnProperty(className)) {
                return className;
            }

            for (prefix in paths) {
                if (paths.hasOwnProperty(prefix) && prefix + '.' === className.substring(0, prefix.length + 1)) {
                    if (prefix.length > deepestPrefix.length) {
                        deepestPrefix = prefix;
                    }
                }
            }

            return deepestPrefix;
        },

        require: function(expressions, fn, scope, excludes) {
            if (fn) {
                fn.call(scope);
            }
        },

        syncRequire: function() {},

        exclude: function(excludes) {
            var me = this;

            return {
                require: function(expressions, fn, scope) {
                    return me.require(expressions, fn, scope, excludes);
                },

                syncRequire: function(expressions, fn, scope) {
                    return me.syncRequire(expressions, fn, scope, excludes);
                }
            };
        },

         onReady: function(fn, scope, withDomReady, options) {
            var oldFn;

            if (withDomReady !== false && Ext.onDocumentReady) {
                oldFn = fn;

                fn = function() {
                    Ext.onDocumentReady(oldFn, scope, options);
                };
            }

            fn.call(scope);
        }
    };

    //<feature classSystem.loader>
    Ext.apply(Loader, {
         documentHead: typeof document != 'undefined' && (document.head || document.getElementsByTagName('head')[0]),

        isLoading: false,

        queue: [],

        isClassFileLoaded: {},

        isFileLoaded: {},
        readyListeners: [],
        optionalRequires: [],
        requiresMap: {},
        numPendingFiles: 0,
        numLoadedFiles: 0,
        hasFileLoadError: false,
        classNameToFilePathMap: {},

        syncModeEnabled: false,

        scriptElements: {},
        refreshQueue: function() {
            var queue = this.queue,
                ln = queue.length,
                i, item, j, requires, references;

            if (ln === 0) {
                this.triggerReady();
                return;
            }

            for (i = 0; i < ln; i++) {
                item = queue[i];

                if (item) {
                    requires = item.requires;
                    references = item.references;

                    // Don't bother checking when the number of files loaded
                    // is still less than the array length
                    if (requires.length > this.numLoadedFiles) {
                        continue;
                    }

                    j = 0;

                    do {
                        if (Manager.isCreated(requires[j])) {
                            // Take out from the queue
                            arrayErase(requires, j, 1);
                        }
                        else {
                            j++;
                        }
                    } while (j < requires.length);

                    if (item.requires.length === 0) {
                        arrayErase(queue, i, 1);
                        item.callback.call(item.scope);
                        this.refreshQueue();
                        break;
                    }
                }
            }

            return this;
        },


        injectScriptElement: function(url, onLoad, onError, scope) {
            var script = document.createElement('script'),
                me = this,
                onLoadFn = function() {
                    me.cleanupScriptElement(script);
                    onLoad.call(scope);
                },
                onErrorFn = function() {
                    me.cleanupScriptElement(script);
                    onError.call(scope);
                };

            script.type = 'text/javascript';
            script.src = url;
            script.onload = onLoadFn;
            script.onerror = onErrorFn;
            script.onreadystatechange = function() {
                if (this.readyState === 'loaded' || this.readyState === 'complete') {
                    onLoadFn();
                }
            };

            this.documentHead.appendChild(script);

            return script;
        },

        removeScriptElement: function(url) {
            var scriptElements = this.scriptElements;

            if (scriptElements[url]) {
                this.cleanupScriptElement(scriptElements[url], true);
                delete scriptElements[url];
            }

            return this;
        },

        cleanupScriptElement: function(script, remove) {
            script.onload = null;
            script.onreadystatechange = null;
            script.onerror = null;

            if (remove) {
                this.documentHead.removeChild(script);
            }

            return this;
        },

        loadScriptFile: function(url, onLoad, onError, scope, synchronous) {
            var me = this,
                isFileLoaded = this.isFileLoaded,
                scriptElements = this.scriptElements,
                noCacheUrl = url + (this.getConfig('disableCaching') ? ('?' + this.getConfig('disableCachingParam') + '=' + Ext.Date.now()) : ''),
                xhr, status, content, onScriptError;

            if (isFileLoaded[url]) {
                return this;
            }

            scope = scope || this;

            this.isLoading = true;

            if (!synchronous) {
                onScriptError = function() {
                    //<debug error>
                    onError.call(scope, "Failed loading '" + url + "', please verify that the file exists", synchronous);
                    //</debug>
                };

                if (!Ext.isReady && Ext.onDocumentReady) {
                    Ext.onDocumentReady(function() {
                        if (!isFileLoaded[url]) {
                            scriptElements[url] = me.injectScriptElement(noCacheUrl, onLoad, onScriptError, scope);
                        }
                    });
                }
                else {
                    scriptElements[url] = this.injectScriptElement(noCacheUrl, onLoad, onScriptError, scope);
                }
            }
            else {
                if (typeof XMLHttpRequest != 'undefined') {
                    xhr = new XMLHttpRequest();
                } else {
                    xhr = new ActiveXObject('Microsoft.XMLHTTP');
                }

                try {
                    xhr.open('GET', noCacheUrl, false);
                    xhr.send(null);
                }
                catch (e) {
                    //<debug error>
                    onError.call(this, "Failed loading synchronously via XHR: '" + url + "'; It's likely that the file is either " +
                                       "being loaded from a different domain or from the local file system whereby cross origin " +
                                       "requests are not allowed due to security reasons. Use asynchronous loading with " +
                                       "Ext.require instead.", synchronous);
                    //</debug>
                }

                status = (xhr.status == 1223) ? 204 : xhr.status;
                content = xhr.responseText;

                if ((status >= 200 && status < 300) || status == 304 || (status == 0 && content.length > 0)) {
                    // Debugger friendly, file names are still shown even though they're eval'ed code
                    // Breakpoints work on both Firebug and Chrome's Web Inspector
                    Ext.globalEval(content + "\n//@ sourceURL=" + url);
                    onLoad.call(scope);
                }
                else {
                    //<debug>
                    onError.call(this, "Failed loading synchronously via XHR: '" + url + "'; please " +
                                       "verify that the file exists. " +
                                       "XHR status code: " + status, synchronous);
                    //</debug>
                }

                // Prevent potential IE memory leak
                xhr = null;
            }
        },

        // documented above
        syncRequire: function() {
            var syncModeEnabled = this.syncModeEnabled;

            if (!syncModeEnabled) {
                this.syncModeEnabled = true;
            }

            this.require.apply(this, arguments);

            if (!syncModeEnabled) {
                this.syncModeEnabled = false;
            }

            this.refreshQueue();
        },

        // documented above
        require: function(expressions, fn, scope, excludes) {
            var excluded = {},
                included = {},
                queue = this.queue,
                classNameToFilePathMap = this.classNameToFilePathMap,
                isClassFileLoaded = this.isClassFileLoaded,
                excludedClassNames = [],
                possibleClassNames = [],
                classNames = [],
                references = [],
                callback,
                syncModeEnabled,
                filePath, expression, exclude, className,
                possibleClassName, i, j, ln, subLn;

            if (excludes) {
                excludes = arrayFrom(excludes);

                for (i = 0,ln = excludes.length; i < ln; i++) {
                    exclude = excludes[i];

                    if (typeof exclude == 'string' && exclude.length > 0) {
                        excludedClassNames = Manager.getNamesByExpression(exclude);

                        for (j = 0,subLn = excludedClassNames.length; j < subLn; j++) {
                            excluded[excludedClassNames[j]] = true;
                        }
                    }
                }
            }

            expressions = arrayFrom(expressions);

            if (fn) {
                if (fn.length > 0) {
                    callback = function() {
                        var classes = [],
                            i, ln, name;

                        for (i = 0,ln = references.length; i < ln; i++) {
                            name = references[i];
                            classes.push(Manager.get(name));
                        }

                        return fn.apply(this, classes);
                    };
                }
                else {
                    callback = fn;
                }
            }
            else {
                callback = Ext.emptyFn;
            }

            scope = scope || Ext.global;

            for (i = 0,ln = expressions.length; i < ln; i++) {
                expression = expressions[i];

                if (typeof expression == 'string' && expression.length > 0) {
                    possibleClassNames = Manager.getNamesByExpression(expression);
                    subLn = possibleClassNames.length;

                    for (j = 0; j < subLn; j++) {
                        possibleClassName = possibleClassNames[j];

                        if (excluded[possibleClassName] !== true) {
                            references.push(possibleClassName);

                            if (!Manager.isCreated(possibleClassName) && !included[possibleClassName]) {
                                included[possibleClassName] = true;
                                classNames.push(possibleClassName);
                            }
                        }
                    }
                }
            }

            // If the dynamic dependency feature is not being used, throw an error
            // if the dependencies are not defined
            if (classNames.length > 0) {
                if (!this.config.enabled) {
                    throw new Error("Ext.Loader is not enabled, so dependencies cannot be resolved dynamically. " +
                             "Missing required class" + ((classNames.length > 1) ? "es" : "") + ": " + classNames.join(', '));
                }
            }
            else {
                callback.call(scope);
                return this;
            }

            syncModeEnabled = this.syncModeEnabled;

            if (!syncModeEnabled) {
                queue.push({
                    requires: classNames.slice(), // this array will be modified as the queue is processed,
                                                  // so we need a copy of it
                    callback: callback,
                    scope: scope
                });
            }

            ln = classNames.length;

            for (i = 0; i < ln; i++) {
                className = classNames[i];

                filePath = this.getPath(className);

                // If we are synchronously loading a file that has already been asynchronously loaded before
                // we need to destroy the script tag and revert the count
                // This file will then be forced loaded in synchronous
                if (syncModeEnabled && isClassFileLoaded.hasOwnProperty(className)) {
                    this.numPendingFiles--;
                    this.removeScriptElement(filePath);
                    delete isClassFileLoaded[className];
                }

                if (!isClassFileLoaded.hasOwnProperty(className)) {
                    isClassFileLoaded[className] = false;

                    classNameToFilePathMap[className] = filePath;

                    this.numPendingFiles++;

                    this.loadScriptFile(
                        filePath,
                        pass(this.onFileLoaded, [className, filePath], this),
                        pass(this.onFileLoadError, [className, filePath]),
                        this,
                        syncModeEnabled
                    );
                }
            }

            if (syncModeEnabled) {
                callback.call(scope);

                if (ln === 1) {
                    return Manager.get(className);
                }
            }

            return this;
        },

       onFileLoaded: function(className, filePath) {
            this.numLoadedFiles++;

            this.isClassFileLoaded[className] = true;
            this.isFileLoaded[filePath] = true;

            this.numPendingFiles--;

            if (this.numPendingFiles === 0) {
                this.refreshQueue();
            }

            //<debug>
            if (!this.syncModeEnabled && this.numPendingFiles === 0 && this.isLoading && !this.hasFileLoadError) {
                var queue = this.queue,
                    missingClasses = [],
                    missingPaths = [],
                    requires,
                    i, ln, j, subLn;

                for (i = 0,ln = queue.length; i < ln; i++) {
                    requires = queue[i].requires;

                    for (j = 0,subLn = requires.length; j < subLn; j++) {
                        if (this.isClassFileLoaded[requires[j]]) {
                            missingClasses.push(requires[j]);
                        }
                    }
                }

                if (missingClasses.length < 1) {
                    return;
                }

                missingClasses = Ext.Array.filter(Ext.Array.unique(missingClasses), function(item) {
                    return !this.requiresMap.hasOwnProperty(item);
                }, this);

                for (i = 0,ln = missingClasses.length; i < ln; i++) {
                    missingPaths.push(this.classNameToFilePathMap[missingClasses[i]]);
                }

                throw new Error("The following classes are not declared even if their files have been " +
                            "loaded: '" + missingClasses.join("', '") + "'. Please check the source code of their " +
                            "corresponding files for possible typos: '" + missingPaths.join("', '"));
            }
            //</debug>
        },


        onFileLoadError: function(className, filePath, errorMessage, isSynchronous) {
            this.numPendingFiles--;
            this.hasFileLoadError = true;

            //<debug error>
            throw new Error("[Ext.Loader] " + errorMessage);
            //</debug>
        },


        addOptionalRequires: function(requires) {
            var optionalRequires = this.optionalRequires,
                i, ln, require;

            requires = arrayFrom(requires);

            for (i = 0, ln = requires.length; i < ln; i++) {
                require = requires[i];

                arrayInclude(optionalRequires, require);
            }

            return this;
        },

        triggerReady: function(force) {
            var readyListeners = this.readyListeners,
                optionalRequires = this.optionalRequires,
                listener;

            if (this.isLoading || force) {
                this.isLoading = false;

                if (optionalRequires.length !== 0) {
                    // Clone then empty the array to eliminate potential recursive loop issue
                    optionalRequires = optionalRequires.slice();

                    // Empty the original array
                    this.optionalRequires.length = 0;

                    this.require(optionalRequires, pass(this.triggerReady, [true], this), this);
                    return this;
                }

                while (readyListeners.length) {
                    listener = readyListeners.shift();
                    listener.fn.call(listener.scope);

                    if (this.isLoading) {
                        return this;
                    }
                }
            }

            return this;
        },

        // duplicate definition (documented above)
        onReady: function(fn, scope, withDomReady, options) {
            var oldFn;

            if (withDomReady !== false && Ext.onDocumentReady) {
                oldFn = fn;

                fn = function() {
                    Ext.onDocumentReady(oldFn, scope, options);
                };
            }

            if (!this.isLoading) {
                fn.call(scope);
            }
            else {
                this.readyListeners.push({
                    fn: fn,
                    scope: scope
                });
            }
        },


        historyPush: function(className) {
            var isInHistory = this.isInHistory;

            if (className && this.isClassFileLoaded.hasOwnProperty(className) && !isInHistory[className]) {
                isInHistory[className] = true;
                this.history.push(className);
            }

            return this;
        }
    });

    //</feature>


    Ext.require = alias(Loader, 'require');


    Ext.syncRequire = alias(Loader, 'syncRequire');

    Ext.exclude = alias(Loader, 'exclude');

    Ext.onReady = function(fn, scope, options) {
        Loader.onReady(fn, scope, true, options);
    };

    Class.registerPreprocessor('loader', function(cls, data, hooks, continueFn) {
        var me = this,
            dependencies = [],
            className = Manager.getName(cls),
            i, j, ln, subLn, value, propertyName, propertyValue;

 
        for (i = 0,ln = dependencyProperties.length; i < ln; i++) {
            propertyName = dependencyProperties[i];

            if (data.hasOwnProperty(propertyName)) {
                propertyValue = data[propertyName];

                if (typeof propertyValue == 'string') {
                    dependencies.push(propertyValue);
                }
                else if (propertyValue instanceof Array) {
                    for (j = 0, subLn = propertyValue.length; j < subLn; j++) {
                        value = propertyValue[j];

                        if (typeof value == 'string') {
                            dependencies.push(value);
                        }
                    }
                }
                else if (typeof propertyValue != 'function') {
                    for (j in propertyValue) {
                        if (propertyValue.hasOwnProperty(j)) {
                            value = propertyValue[j];

                            if (typeof value == 'string') {
                                dependencies.push(value);
                            }
                        }
                    }
                }
            }
        }

        if (dependencies.length === 0) {
            return;
        }

        //<feature classSystem.loader>
        //<debug error>
        var deadlockPath = [],
            requiresMap = Loader.requiresMap,
            detectDeadlock;


        if (className) {
            requiresMap[className] = dependencies;
            //<debug>
            if (!Loader.requiredByMap) Loader.requiredByMap = {};
            Ext.Array.each(dependencies, function(dependency){
                if (!Loader.requiredByMap[dependency]) Loader.requiredByMap[dependency] = [];
                Loader.requiredByMap[dependency].push(className);
            });
            //</debug>
            detectDeadlock = function(cls) {
                deadlockPath.push(cls);

                if (requiresMap[cls]) {
                    if (Ext.Array.contains(requiresMap[cls], className)) {
                        throw new Error("Deadlock detected while loading dependencies! '" + className + "' and '" +
                                deadlockPath[1] + "' " + "mutually require each other. Path: " +
                                deadlockPath.join(' -> ') + " -> " + deadlockPath[0]);
                    }

                    for (i = 0,ln = requiresMap[cls].length; i < ln; i++) {
                        detectDeadlock(requiresMap[cls][i]);
                    }
                }
            };

            detectDeadlock(className);
        }

        //</debug>
        //</feature>

        Loader.require(dependencies, function() {
            for (i = 0,ln = dependencyProperties.length; i < ln; i++) {
                propertyName = dependencyProperties[i];

                if (data.hasOwnProperty(propertyName)) {
                    propertyValue = data[propertyName];

                    if (typeof propertyValue == 'string') {
                        data[propertyName] = Manager.get(propertyValue);
                    }
                    else if (propertyValue instanceof Array) {
                        for (j = 0, subLn = propertyValue.length; j < subLn; j++) {
                            value = propertyValue[j];

                            if (typeof value == 'string') {
                                data[propertyName][j] = Manager.get(value);
                            }
                        }
                    }
                    else if (typeof propertyValue != 'function') {
                        for (var k in propertyValue) {
                            if (propertyValue.hasOwnProperty(k)) {
                                value = propertyValue[k];

                                if (typeof value == 'string') {
                                    data[propertyName][k] = Manager.get(value);
                                }
                            }
                        }
                    }
                }
            }

            continueFn.call(me, cls, data, hooks);
        });

        return false;
    }, true, 'after', 'className');

    //<feature classSystem.loader>
    Manager.registerPostprocessor('uses', function(name, cls, data) {
        var uses = arrayFrom(data.uses),
            items = [],
            i, ln, item;

        for (i = 0,ln = uses.length; i < ln; i++) {
            item = uses[i];

            if (typeof item == 'string') {
                items.push(item);
            }
        }

        Loader.addOptionalRequires(items);
    });

    Manager.onCreated(function(className) {
        this.historyPush(className);
    }, Loader);
    //</feature>

})(Ext.ClassManager, Ext.Class, Ext.Function.flexSetter, Ext.Function.alias,
   Ext.Function.pass, Ext.Array.from, Ext.Array.erase, Ext.Array.include);

// initalize the default path of the framework
// trimmed down version of sench-touch-debug-suffix.js
// with alias / alternates removed, as those are handled separately by
// compiler-generated metadata
(function() {
    var scripts = document.getElementsByTagName('script'),
        currentScript = scripts[scripts.length - 1],
        src = currentScript.src,
        path = src.substring(0, src.lastIndexOf('/') + 1),
        Loader = Ext.Loader;

    //<debug>
    // if we're running in dev mode out of the repo src tree, then this
    // file will potentially be loaded from the touch/src/core/class folder
    // so we'll need to adjust for that
    if(src.indexOf("src/core/class/") != -1) {
        path = path + "../../../";
    }
    //</debug>


    Loader.setConfig({
        enabled: true,
        disableCaching: !/[?&](cache|breakpoint)/i.test(location.search),
        paths: {
            'Ext' : path + 'src'
        }
    });

})();

Ext.setVersion('touch', '2.2.1');

Ext.apply(Ext, {
     version: Ext.getVersion('touch'),
    idSeed: 0,
    repaint: function() {
        var mask = Ext.getBody().createChild({
            cls: Ext.baseCSSPrefix + 'mask ' + Ext.baseCSSPrefix + 'mask-transparent'
        });
        setTimeout(function() {
            mask.destroy();
        }, 0);
    },

    id: function(el, prefix) {
        if (el && el.id) {
            return el.id;
        }

        el = Ext.getDom(el) || {};

        if (el === document || el === document.documentElement) {
            el.id = 'ext-app';
        }
        else if (el === document.body) {
            el.id = 'ext-body';
        }
        else if (el === window) {
            el.id = 'ext-window';
        }

        el.id = el.id || ((prefix || 'ext-') + (++Ext.idSeed));

        return el.id;
    },

    getBody: function() {
        if (!Ext.documentBodyElement) {
            if (!document.body) {
                throw new Error("[Ext.getBody] document.body does not exist at this point");
            }

            Ext.documentBodyElement = Ext.get(document.body);
        }

        return Ext.documentBodyElement;
    },

    getHead: function() {
        if (!Ext.documentHeadElement) {
            Ext.documentHeadElement = Ext.get(document.head || document.getElementsByTagName('head')[0]);
        }

        return Ext.documentHeadElement;
    },

    getDoc: function() {
        if (!Ext.documentElement) {
            Ext.documentElement = Ext.get(document);
        }

        return Ext.documentElement;
    },

    getCmp: function(id) {
        return Ext.ComponentMgr.get(id);
    },

    copyTo : function(dest, source, names, usePrototypeKeys) {
        if (typeof names == 'string') {
            names = names.split(/[,;\s]/);
        }
        Ext.each (names, function(name) {
            if (usePrototypeKeys || source.hasOwnProperty(name)) {
                dest[name] = source[name];
            }
        }, this);
        return dest;
    },

    destroy: function() {
        var args = arguments,
            ln = args.length,
            i, item;

        for (i = 0; i < ln; i++) {
            item = args[i];

            if (item) {
                if (Ext.isArray(item)) {
                    this.destroy.apply(this, item);
                }
                else if (Ext.isFunction(item.destroy)) {
                    item.destroy();
                }
            }
        }
    },

    getDom: function(el) {
        if (!el || !document) {
            return null;
        }

        return el.dom ? el.dom : (typeof el == 'string' ? document.getElementById(el) : el);
    },

    removeNode: function(node) {
        if (node && node.parentNode && node.tagName != 'BODY') {
            Ext.get(node).clearListeners();
            node.parentNode.removeChild(node);
            delete Ext.cache[node.id];
        }
    },

    defaultSetupConfig: {
        eventPublishers: {
            dom: {
                xclass: 'Ext.event.publisher.Dom'
            },
            touchGesture: {
                xclass: 'Ext.event.publisher.TouchGesture',
                recognizers: {
                    drag: {
                        xclass: 'Ext.event.recognizer.Drag'
                    },
                    tap: {
                        xclass: 'Ext.event.recognizer.Tap'
                    },
                    doubleTap: {
                        xclass: 'Ext.event.recognizer.DoubleTap'
                    },
                    longPress: {
                        xclass: 'Ext.event.recognizer.LongPress'
                    },
                    swipe: {
                        xclass: 'Ext.event.recognizer.HorizontalSwipe'
                    },
                    pinch: {
                        xclass: 'Ext.event.recognizer.Pinch'
                    },
                    rotate: {
                        xclass: 'Ext.event.recognizer.Rotate'
                    }
                }
            },
            componentDelegation: {
                xclass: 'Ext.event.publisher.ComponentDelegation'
            },
            componentPaint: {
                xclass: 'Ext.event.publisher.ComponentPaint'
            },
//            componentSize: {
//                xclass: 'Ext.event.publisher.ComponentSize'
//            },
            elementPaint: {
                xclass: 'Ext.event.publisher.ElementPaint'
            },
            elementSize: {
                xclass: 'Ext.event.publisher.ElementSize'
            }
            //<feature charts>
            ,seriesItemEvents: {
                xclass: 'Ext.chart.series.ItemPublisher'
            }
            //</feature>
        },

        //<feature logger>
        logger: {
            enabled: true,
            xclass: 'Ext.log.Logger',
            minPriority: 'deprecate',
            writers: {
                console: {
                    xclass: 'Ext.log.writer.Console',
                    throwOnErrors: true,
                    formatter: {
                        xclass: 'Ext.log.formatter.Default'
                    }
                }
            }
        },
        //</feature>

        animator: {
            xclass: 'Ext.fx.Runner'
        },

        viewport: {
            xclass: 'Ext.viewport.Viewport'
        }
    },

    isSetup: false,

    frameStartTime: +new Date(),
    setupListeners: [],
    onSetup: function(fn, scope) {
        if (Ext.isSetup) {
            fn.call(scope);
        }
        else {
            Ext.setupListeners.push({
                fn: fn,
                scope: scope
            });
        }
    },

    setup: function(config) {
        var defaultSetupConfig = Ext.defaultSetupConfig,
            emptyFn = Ext.emptyFn,
            onReady = config.onReady || emptyFn,
            onUpdated = config.onUpdated || emptyFn,
            scope = config.scope,
            requires = Ext.Array.from(config.requires),
            extOnReady = Ext.onReady,
            head = Ext.getHead(),
            callback, viewport, precomposed;

        Ext.setup = function() {
            throw new Error("Ext.setup has already been called before");
        };

        delete config.requires;
        delete config.onReady;
        delete config.onUpdated;
        delete config.scope;

        Ext.require(['Ext.event.Dispatcher']);

        callback = function() {
            var listeners = Ext.setupListeners,
                ln = listeners.length,
                i, listener;

            delete Ext.setupListeners;
            Ext.isSetup = true;

            for (i = 0; i < ln; i++) {
                listener = listeners[i];
                listener.fn.call(listener.scope);
            }

            Ext.onReady = extOnReady;
            Ext.onReady(onReady, scope);
        };

        Ext.onUpdated = onUpdated;
        Ext.onReady = function(fn, scope) {
            var origin = onReady;

            onReady = function() {
                origin();
                Ext.onReady(fn, scope);
            };
        };

        config = Ext.merge({}, defaultSetupConfig, config);

        Ext.onDocumentReady(function() {
            Ext.factoryConfig(config, function(data) {
                Ext.event.Dispatcher.getInstance().setPublishers(data.eventPublishers);

                if (data.logger) {
                    Ext.Logger = data.logger;
                }

                if (data.animator) {
                    Ext.Animator = data.animator;
                }

                if (data.viewport) {
                    Ext.Viewport = viewport = data.viewport;

                    if (!scope) {
                        scope = viewport;
                    }

                    Ext.require(requires, function() {
                        Ext.Viewport.on('ready', callback, null, {single: true});
                    });
                }
                else {
                    Ext.require(requires, callback);
                }
            });

            if (!Ext.microloaded && navigator.userAgent.match(/IEMobile\/10\.0/)) {
                var msViewportStyle = document.createElement("style");
                msViewportStyle.appendChild(
                    document.createTextNode(
                        "@media screen and (orientation: portrait) {" +
                            "@-ms-viewport {width: 320px !important;}" +
                        "}" +
                        "@media screen and (orientation: landscape) {" +
                            "@-ms-viewport {width: 560px !important;}" +
                        "}"
                    )
                );
                head.appendChild(msViewportStyle);
            }
        });

        function addMeta(name, content) {
            var meta = document.createElement('meta');

            meta.setAttribute('name', name);
            meta.setAttribute('content', content);
            head.append(meta);
        }

        function addIcon(href, sizes, precomposed) {
            var link = document.createElement('link');
            link.setAttribute('rel', 'apple-touch-icon' + (precomposed ? '-precomposed' : ''));
            link.setAttribute('href', href);
            if (sizes) {
                link.setAttribute('sizes', sizes);
            }
            head.append(link);
        }

        function addStartupImage(href, media) {
            var link = document.createElement('link');
            link.setAttribute('rel', 'apple-touch-startup-image');
            link.setAttribute('href', href);
            if (media) {
                link.setAttribute('media', media);
            }
            head.append(link);
        }

        var icon = config.icon,
            isIconPrecomposed = Boolean(config.isIconPrecomposed),
            startupImage = config.startupImage || {},
            statusBarStyle = config.statusBarStyle,
            devicePixelRatio = window.devicePixelRatio || 1;


        if (navigator.standalone) {
            addMeta('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0');
        }
        else {
            addMeta('viewport', 'initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0');
        }
        addMeta('apple-mobile-web-app-capable', 'yes');
        addMeta('apple-touch-fullscreen', 'yes');
        if (Ext.browser.is.ie) {
            addMeta('msapplication-tap-highlight', 'no');
        }

        // status bar style
        if (statusBarStyle) {
            addMeta('apple-mobile-web-app-status-bar-style', statusBarStyle);
        }

        if (Ext.isString(icon)) {
            icon = {
                57: icon,
                72: icon,
                114: icon,
                144: icon
            };
        }
        else if (!icon) {
            icon = {};
        }


        if (Ext.os.is.iPad) {
            if (devicePixelRatio >= 2) {
                // Retina iPad - Landscape
                if ('1496x2048' in startupImage) {
                    addStartupImage(startupImage['1496x2048'], '(orientation: landscape)');
                }
                // Retina iPad - Portrait
                if ('1536x2008' in startupImage) {
                    addStartupImage(startupImage['1536x2008'], '(orientation: portrait)');
                }

                // Retina iPad
                if ('144' in icon) {
                    addIcon(icon['144'], '144x144', isIconPrecomposed);
                }
            }
            else {
                // Non-Retina iPad - Landscape
                if ('748x1024' in startupImage) {
                    addStartupImage(startupImage['748x1024'], '(orientation: landscape)');
                }
                // Non-Retina iPad - Portrait
                if ('768x1004' in startupImage) {
                    addStartupImage(startupImage['768x1004'], '(orientation: portrait)');
                }

                // Non-Retina iPad
                if ('72' in icon) {
                    addIcon(icon['72'], '72x72', isIconPrecomposed);
                }
            }
        }
        else {
            // Retina iPhone, iPod touch with iOS version >= 4.3
            if (devicePixelRatio >= 2 && Ext.os.version.gtEq('4.3')) {
                if (Ext.os.is.iPhone5) {
                    addStartupImage(startupImage['640x1096']);
                } else {
                    addStartupImage(startupImage['640x920']);
                }

                // Retina iPhone and iPod touch
                if ('114' in icon) {
                    addIcon(icon['114'], '114x114', isIconPrecomposed);
                }
            }
            else {
                addStartupImage(startupImage['320x460']);

                // Non-Retina iPhone, iPod touch, and Android devices
                if ('57' in icon) {
                    addIcon(icon['57'], null, isIconPrecomposed);
                }
            }
        }
    },

     application: function(config) {
        var appName = config.name,
            onReady, scope, requires;

        if (!config) {
            config = {};
        }

        if (!Ext.Loader.config.paths[appName]) {
            Ext.Loader.setPath(appName, config.appFolder || 'app');
        }

        requires = Ext.Array.from(config.requires);
        config.requires = ['Ext.app.Application'];

        onReady = config.onReady;
        scope = config.scope;

        config.onReady = function() {
            config.requires = requires;
            new Ext.app.Application(config);

            if (onReady) {
                onReady.call(scope);
            }
        };

        Ext.setup(config);
    },

    factoryConfig: function(config, callback) {
        var isSimpleObject = Ext.isSimpleObject(config);

        if (isSimpleObject && config.xclass) {
            var className = config.xclass;

            delete config.xclass;

            Ext.require(className, function() {
                Ext.factoryConfig(config, function(cfg) {
                    callback(Ext.create(className, cfg));
                });
            });

            return;
        }

        var isArray = Ext.isArray(config),
            keys = [],
            key, value, i, ln;

        if (isSimpleObject || isArray) {
            if (isSimpleObject) {
                for (key in config) {
                    if (config.hasOwnProperty(key)) {
                        value = config[key];
                        if (Ext.isSimpleObject(value) || Ext.isArray(value)) {
                            keys.push(key);
                        }
                    }
                }
            }
            else {
                for (i = 0,ln = config.length; i < ln; i++) {
                    value = config[i];

                    if (Ext.isSimpleObject(value) || Ext.isArray(value)) {
                        keys.push(i);
                    }
                }
            }

            i = 0;
            ln = keys.length;

            if (ln === 0) {
                callback(config);
                return;
            }

            function fn(value) {
                config[key] = value;
                i++;
                factory();
            }

            function factory() {
                if (i >= ln) {
                    callback(config);
                    return;
                }

                key = keys[i];
                value = config[key];

                Ext.factoryConfig(value, fn);
            }

            factory();
            return;
        }

        callback(config);
    },

     factory: function(config, classReference, instance, aliasNamespace) {
        var manager = Ext.ClassManager,
            newInstance;

        if (!config || config.isInstance) {
            if (instance && instance !== config) {
                instance.destroy();
            }

            return config;
        }

        if (aliasNamespace) {
             // If config is a string value, treat it as an alias
            if (typeof config == 'string') {
                return manager.instantiateByAlias(aliasNamespace + '.' + config);
            }
            // Same if 'type' is given in config
            else if (Ext.isObject(config) && 'type' in config) {
                return manager.instantiateByAlias(aliasNamespace + '.' + config.type, config);
            }
        }

        if (config === true) {
            return instance || manager.instantiate(classReference);
        }

        //<debug error>
        if (!Ext.isObject(config)) {
            Ext.Logger.error("Invalid config, must be a valid config object");
        }
        //</debug>

        if ('xtype' in config) {
            newInstance = manager.instantiateByAlias('widget.' + config.xtype, config);
        }
        else if ('xclass' in config) {
            newInstance = manager.instantiate(config.xclass, config);
        }

        if (newInstance) {
            if (instance) {
                instance.destroy();
            }

            return newInstance;
        }

        if (instance) {
            return instance.setConfig(config);
        }

        return manager.instantiate(classReference, config);
    },

    deprecateClassMember: function(cls, oldName, newName, message) {
        return this.deprecateProperty(cls.prototype, oldName, newName, message);
    },
    deprecateClassMembers: function(cls, members) {
       var prototype = cls.prototype,
           oldName, newName;

       for (oldName in members) {
           if (members.hasOwnProperty(oldName)) {
               newName = members[oldName];

               this.deprecateProperty(prototype, oldName, newName);
           }
       }
    },

     deprecateProperty: function(object, oldName, newName, message) {
        if (!message) {
            message = "'" + oldName + "' is deprecated";
        }
        if (newName) {
            message += ", please use '" + newName + "' instead";
        }

        if (newName) {
            Ext.Object.defineProperty(object, oldName, {
                get: function() {
                    //<debug warn>
                    Ext.Logger.deprecate(message, 1);
                    //</debug>
                    return this[newName];
                },
                set: function(value) {
                    //<debug warn>
                    Ext.Logger.deprecate(message, 1);
                    //</debug>

                    this[newName] = value;
                },
                configurable: true
            });
        }
    },

    deprecatePropertyValue: function(object, name, value, message) {
        Ext.Object.defineProperty(object, name, {
            get: function() {
                //<debug warn>
                Ext.Logger.deprecate(message, 1);
                //</debug>
                return value;
            },
            configurable: true
        });
    },

    deprecateMethod: function(object, name, method, message) {
        object[name] = function() {
            //<debug warn>
            Ext.Logger.deprecate(message, 2);
            //</debug>
            if (method) {
                return method.apply(this, arguments);
            }
        };
    },

    deprecateClassMethod: function(cls, name, method, message) {
        if (typeof name != 'string') {
            var from, to;

            for (from in name) {
                if (name.hasOwnProperty(from)) {
                    to = name[from];
                    Ext.deprecateClassMethod(cls, from, to);
                }
            }
            return;
        }

        var isLateBinding = typeof method == 'string',
            member;

        if (!message) {
            message = "'" + name + "()' is deprecated, please use '" + (isLateBinding ? method : method.name) +
                "()' instead";
        }

        if (isLateBinding) {
            member = function() {
                //<debug warn>
                Ext.Logger.deprecate(message, this);
                //</debug>

                return this[method].apply(this, arguments);
            };
        }
        else {
            member = function() {
                //<debug warn>
                Ext.Logger.deprecate(message, this);
                //</debug>

                return method.apply(this, arguments);
            };
        }

        if (name in cls.prototype) {
            Ext.Object.defineProperty(cls.prototype, name, {
                value: null,
                writable: true,
                configurable: true
            });
        }

        cls.addMember(name, member);
    },


    showLeaks: function() {
        var map = Ext.ComponentManager.all.map,
            leaks = [],
            parent;

        Ext.Object.each(map, function(id, component) {
            while ((parent = component.getParent()) && map.hasOwnProperty(parent.getId())) {
                component = parent;
            }

            if (leaks.indexOf(component) === -1) {
                leaks.push(component);
            }
        });

        console.log(leaks);
    },
    //</debug>

    isReady : false,
    readyListeners: [],
    triggerReady: function() {
        var listeners = Ext.readyListeners,
            i, ln, listener;

        if (!Ext.isReady) {
            Ext.isReady = true;

            for (i = 0,ln = listeners.length; i < ln; i++) {
                listener = listeners[i];
                listener.fn.call(listener.scope);
            }
            delete Ext.readyListeners;
        }
    },

     onDocumentReady: function(fn, scope) {
        if (Ext.isReady) {
            fn.call(scope);
        }
        else {
            var triggerFn = Ext.triggerReady;

            Ext.readyListeners.push({
                fn: fn,
                scope: scope
            });

            if (Ext.browser.is.PhoneGap && !Ext.os.is.Desktop) {
                if (!Ext.readyListenerAttached) {
                    Ext.readyListenerAttached = true;
                    document.addEventListener('deviceready', triggerFn, false);
                }
            }
            else {
                var readyStateRe =  (/MSIE 10/.test(navigator.userAgent)) ? /complete|loaded/ : /interactive|complete|loaded/;
                if (document.readyState.match(readyStateRe) !== null) {
                    triggerFn();
                }
                else if (!Ext.readyListenerAttached) {
                    Ext.readyListenerAttached = true;
                    window.addEventListener('DOMContentLoaded', function() {
                        if (navigator.standalone) {
                            // When running from Home Screen, the splash screen will not disappear until all
                            // external resource requests finish.
                            // The first timeout clears the splash screen
                            // The second timeout allows inital HTML content to be displayed
                            setTimeout(function() {
                                setTimeout(function() {
                                    triggerFn();
                                }, 1);
                            }, 1);
                        }
                        else {
                          setTimeout(function() {
                              triggerFn();
                          }, 1);
                        }
                    }, false);
                }
            }
        }
    },

    callback: function(callback, scope, args, delay) {
        if (Ext.isFunction(callback)) {
            args = args || [];
            scope = scope || window;
            if (delay) {
                Ext.defer(callback, delay, scope, args);
            } else {
                callback.apply(scope, args);
            }
        }
    }
});

//<debug>
Ext.Object.defineProperty(Ext, 'Msg', {
    get: function() {
        Ext.Logger.error("Using Ext.Msg without requiring Ext.MessageBox");
        return null;
    },
    set: function(value) {
        Ext.Object.defineProperty(Ext, 'Msg', {
            value: value
        });
        return value;
    },
    configurable: true
});
//</debug>


//@tag dom,core
//@require Ext-more

Ext.define('Ext.env.Browser', {
               
                     
      

    statics: {
        browserNames: {
            ie: 'IE',
            firefox: 'Firefox',
            safari: 'Safari',
            chrome: 'Chrome',
            opera: 'Opera',
            dolfin: 'Dolfin',
            webosbrowser: 'webOSBrowser',
            chromeMobile: 'ChromeMobile',
            silk: 'Silk',
            other: 'Other'
        },
        engineNames: {
            webkit: 'WebKit',
            gecko: 'Gecko',
            presto: 'Presto',
            trident: 'Trident',
            other: 'Other'
        },
        enginePrefixes: {
            webkit: 'AppleWebKit/',
            gecko: 'Gecko/',
            presto: 'Presto/',
            trident: 'Trident/'
        },
        browserPrefixes: {
            ie: 'MSIE ',
            firefox: 'Firefox/',
            chrome: 'Chrome/',
            safari: 'Version/',
            opera: 'OPR/',
            dolfin: 'Dolfin/',
            webosbrowser: 'wOSBrowser/',
            chromeMobile: 'CrMo/',
            silk: 'Silk/'
        }
    },

    styleDashPrefixes: {
        WebKit: '-webkit-',
        Gecko: '-moz-',
        Trident: '-ms-',
        Presto: '-o-',
        Other: ''
    },

    stylePrefixes: {
        WebKit: 'Webkit',
        Gecko: 'Moz',
        Trident: 'ms',
        Presto: 'O',
        Other: ''
    },

    propertyPrefixes: {
        WebKit: 'webkit',
        Gecko: 'moz',
        Trident: 'ms',
        Presto: 'o',
        Other: ''
    },

    // scope: Ext.env.Browser.prototype

    is: Ext.emptyFn,

    name: null,

    version: null,

    engineName: null,

    engineVersion: null,

    setFlag: function(name, value) {
        if (typeof value == 'undefined') {
            value = true;
        }

        this.is[name] = value;
        this.is[name.toLowerCase()] = value;

        return this;
    },

    constructor: function(userAgent) {
        this.userAgent = userAgent;

        var statics = this.statics(),
            browserMatch = userAgent.match(new RegExp('((?:' + Ext.Object.getValues(statics.browserPrefixes).join(')|(?:') + '))([\\w\\._]+)')),
            engineMatch = userAgent.match(new RegExp('((?:' + Ext.Object.getValues(statics.enginePrefixes).join(')|(?:') + '))([\\w\\._]+)')),
            browserNames = statics.browserNames,
            browserName = browserNames.other,
            engineNames = statics.engineNames,
            engineName = engineNames.other,
            browserVersion = '',
            engineVersion = '',
            isWebView = false,
            is, i, name;

        is = this.is = function(name) {
            return is[name] === true;
        };

        if (browserMatch) {
            browserName = browserNames[Ext.Object.getKey(statics.browserPrefixes, browserMatch[1])];
            browserVersion = new Ext.Version(browserMatch[2]);
        }

        if (engineMatch) {
            engineName = engineNames[Ext.Object.getKey(statics.enginePrefixes, engineMatch[1])];
            engineVersion = new Ext.Version(engineMatch[2]);
        }

        // Facebook changes the userAgent when you view a website within their iOS app. For some reason, the strip out information
        // about the browser, so we have to detect that and fake it...
        if (userAgent.match(/FB/) && browserName == "Other") {
            browserName = browserNames.safari;
            engineName = engineNames.webkit;
        }

        if (userAgent.match(/Android.*Chrome/g)) {
            browserName = 'ChromeMobile';
        }

        if (userAgent.match(/OPR/)) {
            browserName = 'Opera';
            browserMatch = userAgent.match(/OPR\/(\d+.\d+)/);
            browserVersion = new Ext.Version(browserMatch[1]);
        }

        Ext.apply(this, {
            engineName: engineName,
            engineVersion: engineVersion,
            name: browserName,
            version: browserVersion
        });

        this.setFlag(browserName);

        if (browserVersion) {
            this.setFlag(browserName + (browserVersion.getMajor() || ''));
            this.setFlag(browserName + browserVersion.getShortVersion());
        }

        for (i in browserNames) {
            if (browserNames.hasOwnProperty(i)) {
                name = browserNames[i];

                this.setFlag(name, browserName === name);
            }
        }

        this.setFlag(name);

        if (engineVersion) {
            this.setFlag(engineName + (engineVersion.getMajor() || ''));
            this.setFlag(engineName + engineVersion.getShortVersion());
        }

        for (i in engineNames) {
            if (engineNames.hasOwnProperty(i)) {
                name = engineNames[i];

                this.setFlag(name, engineName === name);
            }
        }

        this.setFlag('Standalone', !!navigator.standalone);

        this.setFlag('Ripple', !!document.getElementById("tinyhippos-injected") && !Ext.isEmpty(window.top.ripple));
        this.setFlag('WebWorks', !!window.blackberry);

        if (typeof window.PhoneGap != 'undefined' || typeof window.Cordova != 'undefined' || typeof window.cordova != 'undefined') {
            isWebView = true;
            this.setFlag('PhoneGap');
            this.setFlag('Cordova');
        }
        else if (!!window.isNK) {
            isWebView = true;
            this.setFlag('Sencha');
        }

        // Check if running in UIWebView
        if (/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)(?!.*FBAN)/i.test(userAgent)) {
            isWebView = true;
        }

        // Flag to check if it we are in the WebView
        this.setFlag('WebView', isWebView);


        this.isStrict = document.compatMode == "CSS1Compat";
        this.isSecure = /^https/i.test(window.location.protocol);

        return this;
    },

    getStyleDashPrefix: function() {
        return this.styleDashPrefixes[this.engineName];
    },

    getStylePrefix: function() {
        return this.stylePrefixes[this.engineName];
    },

    getVendorProperyName: function(name) {
        var prefix = this.propertyPrefixes[this.engineName];

        if (prefix.length > 0) {
            return prefix + Ext.String.capitalize(name);
        }

        return name;
    },

    getPreferredTranslationMethod: function(config) {
        if (typeof config == 'object' && 'translationMethod' in config && config.translationMethod !== 'auto') {
            return config.translationMethod;
        } else {
            if (this.is.AndroidStock2 || this.is.IE) {
                return 'scrollposition';
            }
            else {
                return 'csstransform';
            }
        }
    }

}, function() {
    var browserEnv = Ext.browser = new this(Ext.global.navigator.userAgent);

});

Ext.define('Ext.env.OS', {

                              

    statics: {
        names: {
            ios: 'iOS',
            android: 'Android',
            windowsPhone: 'WindowsPhone',
            webos: 'webOS',
            blackberry: 'BlackBerry',
            rimTablet: 'RIMTablet',
            mac: 'MacOS',
            win: 'Windows',
            linux: 'Linux',
            bada: 'Bada',
            chrome: 'ChromeOS',
            other: 'Other'
        },
        prefixes: {
            ios: 'i(?:Pad|Phone|Pod)(?:.*)CPU(?: iPhone)? OS ',
            android: '(Android |HTC_|Silk/)', // Some HTC devices ship with an OSX userAgent by default,
                                        // so we need to add a direct check for HTC_
            windowsPhone: 'Windows Phone ',
            blackberry: '(?:BlackBerry|BB)(?:.*)Version\/',
            rimTablet: 'RIM Tablet OS ',
            webos: '(?:webOS|hpwOS)\/',
            bada: 'Bada\/',
            chrome: 'CrOS '
        }
    },

     is: Ext.emptyFn,

    name: null,

    version: null,

    setFlag: function(name, value) {
        if (typeof value == 'undefined') {
            value = true;
        }

        this.is[name] = value;
        this.is[name.toLowerCase()] = value;

        return this;
    },

    constructor: function(userAgent, platform, browserScope) {
        var statics = this.statics(),
            names = statics.names,
            prefixes = statics.prefixes,
            name,
            version = '',
            i, prefix, match, item, is, match1;

        browserScope = browserScope || Ext.browser;

        is = this.is = function(name) {
            return this.is[name] === true;
        };

        for (i in prefixes) {
            if (prefixes.hasOwnProperty(i)) {
                prefix = prefixes[i];

                match = userAgent.match(new RegExp('(?:'+prefix+')([^\\s;]+)'));

                if (match) {
                    name = names[i];
                    match1 = match[1];

                    // This is here because some HTC android devices show an OSX Snow Leopard userAgent by default.
                    // And the Kindle Fire doesn't have any indicator of Android as the OS in its User Agent
                    if (match1 && match1 == "HTC_") {
                        version = new Ext.Version("2.3");
                    }
                    else if (match1 && match1 == "Silk/") {
                        version = new Ext.Version("2.3");
                    }
                    else {
                        version = new Ext.Version(match[match.length - 1]);
                    }

                    break;
                }
            }
        }

        if (!name) {
            name = names[(userAgent.toLowerCase().match(/mac|win|linux/) || ['other'])[0]];
            version = new Ext.Version('');
        }

        this.name = name;
        this.version = version;

        if (platform) {
            this.setFlag(platform.replace(/ simulator$/i, ''));
        }

        this.setFlag(name);

        if (version) {
            this.setFlag(name + (version.getMajor() || ''));
            this.setFlag(name + version.getShortVersion());
        }

        for (i in names) {
            if (names.hasOwnProperty(i)) {
                item = names[i];

                if (!is.hasOwnProperty(name)) {
                    this.setFlag(item, (name === item));
                }
            }
        }

        // Detect if the device is the iPhone 5.
        if (this.name == "iOS" && window.screen.height == 568) {
            this.setFlag('iPhone5');
        }


        if (browserScope.is.Safari || browserScope.is.Silk) {
            // Ext.browser.version.shortVersion == 501 is for debugging off device
            if (this.is.Android2 || this.is.Android3 || browserScope.version.shortVersion == 501) {
                browserScope.setFlag("AndroidStock");
                browserScope.setFlag("AndroidStock2");
            }
            if (this.is.Android4) {
                browserScope.setFlag("AndroidStock");
                browserScope.setFlag("AndroidStock4");
            }
        }

        return this;
    }

}, function() {

    var navigation = Ext.global.navigator,
        userAgent = navigation.userAgent,
        osEnv, osName, deviceType;


    Ext.os = osEnv = new this(userAgent, navigation.platform);

    osName = osEnv.name;

    var search = window.location.search.match(/deviceType=(Tablet|Phone)/),
        nativeDeviceType = window.deviceType;

    // Override deviceType by adding a get variable of deviceType. NEEDED FOR DOCS APP.
    // E.g: example/kitchen-sink.html?deviceType=Phone
    if (search && search[1]) {
        deviceType = search[1];
    }
    else if (nativeDeviceType === 'iPhone') {
        deviceType = 'Phone';
    }
    else if (nativeDeviceType === 'iPad') {
        deviceType = 'Tablet';
    }
    else {
        if (!osEnv.is.Android && !osEnv.is.iOS && !osEnv.is.WindowsPhone && /Windows|Linux|MacOS/.test(osName)) {
            deviceType = 'Desktop';

            // always set it to false when you are on a desktop
            Ext.browser.is.WebView = false;
        }
        else if (osEnv.is.iPad || osEnv.is.RIMTablet || osEnv.is.Android3 || Ext.browser.is.Silk || (osEnv.is.Android4 && userAgent.search(/mobile/i) == -1)) {
            deviceType = 'Tablet';
        }
        else {
            deviceType = 'Phone';
        }
    }

    osEnv.setFlag(deviceType, true);
    osEnv.deviceType = deviceType;

});

//@tag dom,core
Ext.define('Ext.env.Feature', {

                                                

    constructor: function() {
        this.testElements = {};

        this.has = function(name) {
            return !!this.has[name];
        };

        if (!Ext.theme) {
            Ext.theme = {
                name: 'Default'
            };
        }

        Ext.onDocumentReady(function() {
            this.registerTest({
                ProperHBoxStretching: function() {
                    // IE10 currently has a bug in their flexbox row layout. We feature detect the issue here.
                    var bodyElement = document.createElement('div'),
                        innerElement = bodyElement.appendChild(document.createElement('div')),
                        contentElement = innerElement.appendChild(document.createElement('div')),
                        innerWidth;

                    bodyElement.setAttribute('style', 'width: 100px; height: 100px; position: relative;');
                    innerElement.setAttribute('style', 'position: absolute; display: -ms-flexbox; display: -webkit-flex; display: -moz-flexbox; display: flex; -ms-flex-direction: row; -webkit-flex-direction: row; -moz-flex-direction: row; flex-direction: row; min-width: 100%;');
                    contentElement.setAttribute('style', 'width: 200px; height: 50px;');
                    document.body.appendChild(bodyElement);
                    innerWidth = innerElement.offsetWidth;
                    document.body.removeChild(bodyElement);

                    return (innerWidth > 100);
                }
            });
        }, this);
    },

    getTestElement: function(tag, createNew) {
        if (tag === undefined) {
            tag = 'div';
        }
        else if (typeof tag !== 'string') {
            return tag;
        }

        if (createNew) {
            return document.createElement(tag);
        }

        if (!this.testElements[tag]) {
            this.testElements[tag] = document.createElement(tag);
        }

        return this.testElements[tag];
    },

    isStyleSupported: function(name, tag) {
        var elementStyle = this.getTestElement(tag).style,
            cName = Ext.String.capitalize(name);

        if (typeof elementStyle[name] !== 'undefined'
            || typeof elementStyle[Ext.browser.getStylePrefix(name) + cName] !== 'undefined') {
            return true;
        }

        return false;
    },

    isStyleSupportedWithoutPrefix: function(name, tag) {
        var elementStyle = this.getTestElement(tag).style;

        if (typeof elementStyle[name] !== 'undefined') {
            return true;
        }

        return false;
    },

    isEventSupported: function(name, tag) {
        if (tag === undefined) {
            tag = window;
        }

        var element = this.getTestElement(tag),
            eventName = 'on' + name.toLowerCase(),
            isSupported = (eventName in element);

        if (!isSupported) {
            if (element.setAttribute && element.removeAttribute) {
                element.setAttribute(eventName, '');
                isSupported = typeof element[eventName] === 'function';

                if (typeof element[eventName] !== 'undefined') {
                    element[eventName] = undefined;
                }

                element.removeAttribute(eventName);
            }
        }

        return isSupported;
    },

    getSupportedPropertyName: function(object, name) {
        var vendorName = Ext.browser.getVendorProperyName(name);

        if (vendorName in object) {
            return vendorName;
        }
        else if (name in object) {
            return name;
        }

        return null;
    },

    registerTest: Ext.Function.flexSetter(function(name, fn) {
        this.has[name] = fn.call(this);

        return this;
    })

}, function() {

    Ext.feature = new this;

    var has = Ext.feature.has;

    Ext.feature.registerTest({
        Canvas: function() {
            var element = this.getTestElement('canvas');
            return !!(element && element.getContext && element.getContext('2d'));
        },

        Svg: function() {
            var doc = document;

            return !!(doc.createElementNS && !!doc.createElementNS("http:/" + "/www.w3.org/2000/svg", "svg").createSVGRect);
        },

        Vml: function() {
            var element = this.getTestElement(),
                ret = false;

            element.innerHTML = "<!--[if vml]><br><![endif]-->";
            ret = (element.childNodes.length === 1);
            element.innerHTML = "";

            return ret;
        },

        Touch: function() {
            return Ext.browser.is.Ripple || (this.isEventSupported('touchstart') && !(Ext.os && Ext.os.name.match(/Windows|MacOS|Linux/) && !Ext.os.is.BlackBerry6));
        },

        Pointer: function() {
            return !!window.navigator.msPointerEnabled;
        },

        Orientation: function() {
            return ('orientation' in window) && this.isEventSupported('orientationchange');
        },

        OrientationChange: function() {
            return this.isEventSupported('orientationchange');
        },

        DeviceMotion: function() {
            return this.isEventSupported('devicemotion');
        },

        Geolocation: function() {
            return 'geolocation' in window.navigator;
        },

        SqlDatabase: function() {
            return 'openDatabase' in window;
        },

        WebSockets: function() {
            return 'WebSocket' in window;
        },

        Range: function() {
            return !!document.createRange;
        },

        CreateContextualFragment: function() {
            var range = !!document.createRange ? document.createRange() : false;
            return range && !!range.createContextualFragment;
        },

        History: function() {
            return ('history' in window && 'pushState' in window.history);
        },

        CssTransforms: function() {
            return this.isStyleSupported('transform');
        },

        CssTransformNoPrefix: function() {
            return this.isStyleSupportedWithoutPrefix('transform');
        },

        Css3dTransforms: function() {
            // See https://sencha.jira.com/browse/TOUCH-1544
            return this.has('CssTransforms') && this.isStyleSupported('perspective') && !Ext.browser.is.AndroidStock2;
        },

        CssAnimations: function() {
            return this.isStyleSupported('animationName');
        },

        CssTransitions: function() {
            return this.isStyleSupported('transitionProperty');
        },

        Audio: function() {
            return !!this.getTestElement('audio').canPlayType;
        },

        Video: function() {
            return !!this.getTestElement('video').canPlayType;
        },

        ClassList: function() {
            return "classList" in this.getTestElement();
        },

        LocalStorage : function() {
            var supported = false;

            try {
                if ('localStorage' in window && window['localStorage'] !== null) {
                    //this should throw an error in private browsing mode in iOS
                    localStorage.setItem('sencha-localstorage-test', 'test success');
                    //clean up if setItem worked
                    localStorage.removeItem('sencha-localstorage-test');
                    supported = true;
                }
            } catch ( e ) {}

            return supported;
        }
    });

});

Ext.define('Ext.dom.Query', {
      select: function(q, root) {
        var results = [],
            nodes,
            i,
            j,
            qlen,
            nlen;

        root = root || document;

        if (typeof root == 'string') {
            root = document.getElementById(root);
        }

        q = q.split(",");

        for (i = 0,qlen = q.length; i < qlen; i++) {
            if (typeof q[i] == 'string') {

                //support for node attribute selection
                if (q[i][0] == '@') {
                    nodes = root.getAttributeNode(q[i].substring(1));
                    results.push(nodes);
                }
                else {
                    nodes = root.querySelectorAll(q[i]);

                    for (j = 0,nlen = nodes.length; j < nlen; j++) {
                        results.push(nodes[j]);
                    }
                }
            }
        }

        return results;
    },
    selectNode: function(q, root) {
        return this.select(q, root)[0];
    },

    is: function(el, q) {
        var root = el.parentNode,
            is;

        if (typeof el == "string") {
            el = document.getElementById(el);
        }

        if (!root) {
            root = document.createDocumentFragment();
            root.appendChild(el);
            is = this.select(q, root).indexOf(el) !== -1;
            root.removeChild(el);
            root = null;
        }
        else {
            is = this.select(q).indexOf(el) !== -1;
        }

        return is;
    },

    isXml: function(el) {
        var docEl = (el ? el.ownerDocument || el : 0).documentElement;
        return docEl ? docEl.nodeName !== "HTML" : false;
    }

}, function() {
    Ext.ns('Ext.core');
    Ext.core.DomQuery = Ext.DomQuery = new this();
    Ext.query = Ext.Function.alias(Ext.DomQuery, 'select');
});

Ext.define('Ext.dom.Helper', {
    emptyTags : /^(?:br|frame|hr|img|input|link|meta|range|spacer|wbr|area|param|col)$/i,
    confRe : /tag|children|cn|html|tpl|tplData$/i,
    endRe : /end/i,

    attribXlat: { cls : 'class', htmlFor : 'for' },

    closeTags: {},

    decamelizeName : function () {
        var camelCaseRe = /([a-z])([A-Z])/g,
            cache = {};

        function decamel (match, p1, p2) {
            return p1 + '-' + p2.toLowerCase();
        }

        return function (s) {
            return cache[s] || (cache[s] = s.replace(camelCaseRe, decamel));
        };
    }(),

    generateMarkup: function(spec, buffer) {
        var me = this,
            attr, val, tag, i, closeTags;

        if (typeof spec == "string") {
            buffer.push(spec);
        } else if (Ext.isArray(spec)) {
            for (i = 0; i < spec.length; i++) {
                if (spec[i]) {
                    me.generateMarkup(spec[i], buffer);
                }
            }
        } else {
            tag = spec.tag || 'div';
            buffer.push('<', tag);

            for (attr in spec) {
                if (spec.hasOwnProperty(attr)) {
                    val = spec[attr];
                    if (!me.confRe.test(attr)) {
                        if (typeof val == "object") {
                            buffer.push(' ', attr, '="');
                            me.generateStyles(val, buffer).push('"');
                        } else {
                            buffer.push(' ', me.attribXlat[attr] || attr, '="', val, '"');
                        }
                    }
                }
            }

            // Now either just close the tag or try to add children and close the tag.
            if (me.emptyTags.test(tag)) {
                buffer.push('/>');
            } else {
                buffer.push('>');

                // Apply the tpl html, and cn specifications
                if ((val = spec.tpl)) {
                    val.applyOut(spec.tplData, buffer);
                }
                if ((val = spec.html)) {
                    buffer.push(val);
                }
                if ((val = spec.cn || spec.children)) {
                    me.generateMarkup(val, buffer);
                }

                // we generate a lot of close tags, so cache them rather than push 3 parts
                closeTags = me.closeTags;
                buffer.push(closeTags[tag] || (closeTags[tag] = '</' + tag + '>'));
            }
        }

        return buffer;
    },

     generateStyles: function (styles, buffer) {
        var a = buffer || [],
            name;

        for (name in styles) {
            if (styles.hasOwnProperty(name)) {
                a.push(this.decamelizeName(name), ':', styles[name], ';');
            }
        }

        return buffer || a.join('');
    },

    markup: function(spec) {
        if (typeof spec == "string") {
            return spec;
        }

        var buf = this.generateMarkup(spec, []);
        return buf.join('');
    },

    applyStyles: function(el, styles) {
        Ext.fly(el).applyStyles(styles);
    },

    createContextualFragment: function(html){
        var div = document.createElement("div"),
            fragment = document.createDocumentFragment(),
            i = 0,
            length, childNodes;

        div.innerHTML = html;
        childNodes = div.childNodes;
        length = childNodes.length;

        for (; i < length; i++) {
            fragment.appendChild(childNodes[i].cloneNode(true));
        }

        return fragment;
    },

     insertHtml: function(where, el, html) {
        var setStart, range, frag, rangeEl, isBeforeBegin, isAfterBegin;

        where = where.toLowerCase();

        if (Ext.isTextNode(el)) {
            if (where == 'afterbegin' ) {
                where = 'beforebegin';
            }
            else if (where == 'beforeend') {
                where = 'afterend';
            }
        }

        isBeforeBegin = where == 'beforebegin';
        isAfterBegin = where == 'afterbegin';

        range = (Ext.feature.has.CreateContextualFragment && Ext.get(el).isPainted()) ? el.ownerDocument.createRange() : undefined;
        setStart = 'setStart' + (this.endRe.test(where) ? 'After' : 'Before');

        if (isBeforeBegin || where == 'afterend') {
            if (range) {
                range[setStart](el);
                frag = range.createContextualFragment(html);
            }
            else {
                frag = this.createContextualFragment(html);
            }
            el.parentNode.insertBefore(frag, isBeforeBegin ? el : el.nextSibling);
            return el[(isBeforeBegin ? 'previous' : 'next') + 'Sibling'];
        }
        else {
            rangeEl = (isAfterBegin ? 'first' : 'last') + 'Child';
            if (el.firstChild) {
                if (range) {
                    range[setStart](el[rangeEl]);
                    frag = range.createContextualFragment(html);
                } else {
                    frag = this.createContextualFragment(html);
                }

                if (isAfterBegin) {
                    el.insertBefore(frag, el.firstChild);
                } else {
                    el.appendChild(frag);
                }
            } else {
                el.innerHTML = html;
            }
            return el[rangeEl];
        }
    },

     insertBefore: function(el, o, returnElement) {
        return this.doInsert(el, o, returnElement, 'beforebegin');
    },
    insertAfter: function(el, o, returnElement) {
        return this.doInsert(el, o, returnElement, 'afterend');
    },
    insertFirst: function(el, o, returnElement) {
        return this.doInsert(el, o, returnElement, 'afterbegin');
    },

    append: function(el, o, returnElement) {
        return this.doInsert(el, o, returnElement, 'beforeend');
    },
    overwrite: function(el, o, returnElement) {
        el = Ext.getDom(el);
        el.innerHTML = this.markup(o);
        return returnElement ? Ext.get(el.firstChild) : el.firstChild;
    },

    doInsert: function(el, o, returnElement, pos) {
        var newNode = this.insertHtml(pos, Ext.getDom(el), this.markup(o));
        return returnElement ? Ext.get(newNode, true) : newNode;
    },

    createTemplate: function(o) {
        var html = this.markup(o);
        return new Ext.Template(html);
    }
}, function() {
    Ext.ns('Ext.core');
    Ext.core.DomHelper = Ext.DomHelper = new this;
});
Ext.define('Ext.mixin.Identifiable', {
    statics: {
        uniqueIds: {}
    },

    isIdentifiable: true,

    mixinId: 'identifiable',

    idCleanRegex: /\.|[^\w\-]/g,

    defaultIdPrefix: 'ext-',

    defaultIdSeparator: '-',

    getOptimizedId: function() {
        return this.id;
    },

    getUniqueId: function() {
        var id = this.id,
            prototype, separator, xtype, uniqueIds, prefix;

        if (!id) {
            prototype = this.self.prototype;
            separator = this.defaultIdSeparator;

            uniqueIds = Ext.mixin.Identifiable.uniqueIds;

            if (!prototype.hasOwnProperty('identifiablePrefix')) {
                xtype = this.xtype;

                if (xtype) {
                    prefix = this.defaultIdPrefix + xtype + separator;
                }
                else {
                    prefix = prototype.$className.replace(this.idCleanRegex, separator).toLowerCase() + separator;
                }

                prototype.identifiablePrefix = prefix;
            }

            prefix = this.identifiablePrefix;

            if (!uniqueIds.hasOwnProperty(prefix)) {
                uniqueIds[prefix] = 0;
            }

            id = this.id = prefix + (++uniqueIds[prefix]);
        }

        this.getUniqueId = this.getOptimizedId;

        return id;
    },

    setId: function(id) {
        this.id = id;
    },

 
    getId: function() {
        var id = this.id;

        if (!id) {
            id = this.getUniqueId();
        }

        this.getId = this.getOptimizedId;

        return id;
    }
});

Ext.define('Ext.dom.Element', {
    alternateClassName: 'Ext.Element',

    mixins: [
         Ext.mixin.Identifiable 
    ],

               
                        
                        
      

    observableType: 'element',

    xtype: 'element',

    statics: {
        CREATE_ATTRIBUTES: {
            style: 'style',
            className: 'className',
            cls: 'cls',
            classList: 'classList',
            text: 'text',
            hidden: 'hidden',
            html: 'html',
            children: 'children'
        },

        create: function(attributes, domNode) {
            var ATTRIBUTES = this.CREATE_ATTRIBUTES,
                element, elementStyle, tag, value, name, i, ln;

            if (!attributes) {
                attributes = {};
            }

            if (attributes.isElement) {
                return attributes.dom;
            }
            else if ('nodeType' in attributes) {
                return attributes;
            }

            if (typeof attributes == 'string') {
                return document.createTextNode(attributes);
            }

            tag = attributes.tag;

            if (!tag) {
                tag = 'div';
            }
            if (attributes.namespace) {
                element = document.createElementNS(attributes.namespace, tag);
            } else {
                element = document.createElement(tag);
            }
            elementStyle = element.style;

            for (name in attributes) {
                if (name != 'tag') {
                    value = attributes[name];

                    switch (name) {
                        case ATTRIBUTES.style:
                                if (typeof value == 'string') {
                                    element.setAttribute(name, value);
                                }
                                else {
                                    for (i in value) {
                                        if (value.hasOwnProperty(i)) {
                                            elementStyle[i] = value[i];
                                        }
                                    }
                                }
                            break;

                        case ATTRIBUTES.className:
                        case ATTRIBUTES.cls:
                            element.className = value;
                            break;

                        case ATTRIBUTES.classList:
                            element.className = value.join(' ');
                            break;

                        case ATTRIBUTES.text:
                            element.textContent = value;
                            break;

                        case ATTRIBUTES.hidden:
                            if (value) {
                                element.style.display = 'none';
                            }
                            break;

                        case ATTRIBUTES.html:
                            element.innerHTML = value;
                            break;

                        case ATTRIBUTES.children:
                            for (i = 0,ln = value.length; i < ln; i++) {
                                element.appendChild(this.create(value[i], true));
                            }
                            break;

                        default:
                            element.setAttribute(name, value);
                    }
                }
            }

            if (domNode) {
                return element;
            }
            else {
                return this.get(element);
            }
        },

        documentElement: null,

        cache: {},

        get: function(element) {
            var cache = this.cache,
                instance, dom, id;

            if (!element) {
                return null;
            }

            if (typeof element == 'string') {
                if (cache.hasOwnProperty(element)) {
                    return cache[element];
                }

                if (!(dom = document.getElementById(element))) {
                    return null;
                }

                cache[element] = instance = new this(dom);

                return instance;
            }

            if ('tagName' in element) { // dom element
                id = element.id;

                if (cache.hasOwnProperty(id)) {
                    return cache[id];
                }

                instance = new this(element);
                cache[instance.getId()] = instance;

                return instance;
            }

            if (element.isElement) {
                return element;
            }

            if (element.isComposite) {
                return element;
            }

            if (Ext.isArray(element)) {
                return this.select(element);
            }

            if (element === document) {
                // create a bogus element object representing the document object
                if (!this.documentElement) {
                    this.documentElement = new this(document.documentElement);
                    this.documentElement.setId('ext-application');
                }

                return this.documentElement;
            }

            return null;
        },

        data: function(element, key, value) {
            var cache = Ext.cache,
                id, data;

            element = this.get(element);

            if (!element) {
                return null;
            }

            id = element.id;

            data = cache[id].data;

            if (!data) {
                cache[id].data = data = {};
            }

            if (arguments.length == 2) {
                return data[key];
            }
            else {
                return (data[key] = value);
            }
        }
    },

    isElement: true,
    constructor: function(dom) {
        if (typeof dom == 'string') {
            dom = document.getElementById(dom);
        }

        if (!dom) {
            throw new Error("Invalid domNode reference or an id of an existing domNode: " + dom);
        }

        this.dom = dom;

        this.getUniqueId();
    },

    attach: function (dom) {
        this.dom = dom;
        this.id = dom.id;
        return this;
    },

    getUniqueId: function() {
        var id = this.id,
            dom;

        if (!id) {
            dom = this.dom;

            if (dom.id.length > 0) {
                this.id = id = dom.id;
            }
            else {
                dom.id = id = this.mixins.identifiable.getUniqueId.call(this);
            }

            Ext.Element.cache[id] = this;
        }

        return id;
    },

    setId: function(id) {
        var currentId = this.id,
            cache = Ext.Element.cache;

        if (currentId) {
            delete cache[currentId];
        }

        this.dom.id = id;

        this.id = id;

        cache[id] = this;

        return this;
    },
    setHtml: function(html) {
        this.dom.innerHTML = html;
    },

     getHtml: function() {
        return this.dom.innerHTML;
    },

    setText: function(text) {
        this.dom.textContent = text;
    },

    redraw: function() {
        var dom = this.dom,
            domStyle = dom.style;

        domStyle.display = 'none';
        dom.offsetHeight;
        domStyle.display = '';
    },

    isPainted: (function() {
        return !Ext.browser.is.IE ? function() {
            var dom = this.dom;
            return Boolean(dom && dom.offsetParent);
        } : function() {
            var dom = this.dom;
            return Boolean(dom && (dom.offsetHeight !== 0 && dom.offsetWidth !== 0));
        }
    })(),
    set: function(attributes, useSet) {
        var dom = this.dom,
            attribute, value;

        for (attribute in attributes) {
            if (attributes.hasOwnProperty(attribute)) {
                value = attributes[attribute];

                if (attribute == 'style') {
                    this.applyStyles(value);
                }
                else if (attribute == 'cls') {
                    dom.className = value;
                }
                else if (useSet !== false) {
                    if (value === undefined) {
                        dom.removeAttribute(attribute);
                    } else {
                        dom.setAttribute(attribute, value);
                    }
                }
                else {
                    dom[attribute] = value;
                }
            }
        }

        return this;
    },
    is: function(selector) {
        return Ext.DomQuery.is(this.dom, selector);
    },

    getValue: function(asNumber) {
        var value = this.dom.value;

        return asNumber ? parseInt(value, 10) : value;
    },

     getAttribute: function(name, namespace) {
        var dom = this.dom;

        return dom.getAttributeNS(namespace, name) || dom.getAttribute(namespace + ":" + name)
               || dom.getAttribute(name) || dom[name];
    },

    setSizeState: function(state) {
        var classes = ['x-sized', 'x-unsized', 'x-stretched'],
            states = [true, false, null],
            index = states.indexOf(state),
            addedClass;

        if (index !== -1) {
            addedClass = classes[index];
            classes.splice(index, 1);
            this.addCls(addedClass);
        }

        this.removeCls(classes);

        return this;
    },

    destroy: function() {
        this.isDestroyed = true;

        var cache = Ext.Element.cache,
            dom = this.dom;

        if (dom && dom.parentNode && dom.tagName != 'BODY') {
            dom.parentNode.removeChild(dom);
        }

        delete cache[this.id];
        delete this.dom;
    }

}, function(Element) {
    Ext.elements = Ext.cache = Element.cache;

    this.addStatics({
        Fly: new Ext.Class({
            extend: Element,

            constructor: function(dom) {
                this.dom = dom;
            }
        }),

        _flyweights: {},

         fly: function(element, named) {
            var fly = null,
                flyweights = Element._flyweights,
                cachedElement;

            named = named || '_global';

            element = Ext.getDom(element);

            if (element) {
                fly = flyweights[named] || (flyweights[named] = new Element.Fly());
                fly.dom = element;
                fly.isSynchronized = false;
                cachedElement = Ext.cache[element.id];
                if (cachedElement && cachedElement.isElement) {
                    cachedElement.isSynchronized = false;
                }
            }

            return fly;
        }
    });

    Ext.get = function(element) {
        return Element.get.call(Element, element);
    };
    Ext.fly = function() {
        return Element.fly.apply(Element, arguments);
    };

    Ext.ClassManager.onCreated(function() {
        Element.mixin('observable', Ext.mixin.Observable);
    }, null, 'Ext.mixin.Observable');


});

Ext.dom.Element.addStatics({
    numberRe: /\d+$/,
    unitRe: /\d+(px|em|%|en|ex|pt|in|cm|mm|pc)$/i,
    camelRe: /(-[a-z])/gi,
    cssRe: /([a-z0-9-]+)\s*:\s*([^;\s]+(?:\s*[^;\s]+)*);?/gi,
    opacityRe: /alpha\(opacity=(.*)\)/i,
    propertyCache: {},
    defaultUnit: "px",
    borders: {l: 'border-left-width', r: 'border-right-width', t: 'border-top-width', b: 'border-bottom-width'},
    paddings: {l: 'padding-left', r: 'padding-right', t: 'padding-top', b: 'padding-bottom'},
    margins: {l: 'margin-left', r: 'margin-right', t: 'margin-top', b: 'margin-bottom'},

    addUnits: function(size, units) {
        // Size set to a value which means "auto"
        if (size === "" || size == "auto" || size === undefined || size === null) {
            return size || '';
        }

        // Otherwise, warn if it's not a valid CSS measurement
        if (Ext.isNumber(size) || this.numberRe.test(size)) {
            return size + (units || this.defaultUnit || 'px');
        }
        else if (!this.unitRe.test(size)) {
            //<debug>
            Ext.Logger.warn("Warning, size detected (" + size + ") not a valid property value on Element.addUnits.");
            //</debug>
            return size || '';
        }

        return size;
    },

     isAncestor: function(p, c) {
        var ret = false;

        p = Ext.getDom(p);
        c = Ext.getDom(c);
        if (p && c) {
            if (p.contains) {
                return p.contains(c);
            } else if (p.compareDocumentPosition) {
                return !!(p.compareDocumentPosition(c) & 16);
            } else {
                while ((c = c.parentNode)) {
                    ret = c == p || ret;
                }
            }
        }
        return ret;
    },

    parseBox: function(box) {
        if (typeof box != 'string') {
            box = box.toString();
        }

        var parts = box.split(' '),
            ln = parts.length;

        if (ln == 1) {
            parts[1] = parts[2] = parts[3] = parts[0];
        }
        else if (ln == 2) {
            parts[2] = parts[0];
            parts[3] = parts[1];
        }
        else if (ln == 3) {
            parts[3] = parts[1];
        }

        return {
            top: parts[0] || 0,
            right: parts[1] || 0,
            bottom: parts[2] || 0,
            left: parts[3] || 0
        };
    },

    unitizeBox: function(box, units) {
        var me = this;
        box = me.parseBox(box);

        return me.addUnits(box.top, units) + ' ' +
               me.addUnits(box.right, units) + ' ' +
               me.addUnits(box.bottom, units) + ' ' +
               me.addUnits(box.left, units);
    },

    // @private
    camelReplaceFn: function(m, a) {
        return a.charAt(1).toUpperCase();
    },

    normalize: function(prop) {
        // TODO: Mobile optimization?
//        if (prop == 'float') {
//            prop = Ext.supports.Float ? 'cssFloat' : 'styleFloat';
//        }
        return this.propertyCache[prop] || (this.propertyCache[prop] = prop.replace(this.camelRe, this.camelReplaceFn));
    },

    fromPoint: function(x, y) {
        return Ext.get(document.elementFromPoint(x, y));
    },

    parseStyles: function(styles) {
        var out = {},
            cssRe = this.cssRe,
            matches;

        if (styles) {
            // Since we're using the g flag on the regex, we need to set the lastIndex.
            // This automatically happens on some implementations, but not others, see:
            // http://stackoverflow.com/questions/2645273/javascript-regular-expression-literal-persists-between-function-calls
            // http://blog.stevenlevithan.com/archives/fixing-javascript-regexp
            cssRe.lastIndex = 0;
            while ((matches = cssRe.exec(styles))) {
                out[matches[1]] = matches[2];
            }
        }
        return out;
    }
});




Ext.dom.Element.addMembers({

    appendChild: function(element) {
        this.dom.appendChild(Ext.getDom(element));

        return this;
    },

    removeChild: function(element) {
        this.dom.removeChild(Ext.getDom(element));

        return this;
    },

    append: function() {
        this.appendChild.apply(this, arguments);
    },


    appendTo: function(el) {
        Ext.getDom(el).appendChild(this.dom);
        return this;
    },

    insertBefore: function(el) {
        el = Ext.getDom(el);
        el.parentNode.insertBefore(this.dom, el);
        return this;
    },

    insertAfter: function(el) {
        el = Ext.getDom(el);
        el.parentNode.insertBefore(this.dom, el.nextSibling);
        return this;
    },


    insertFirst: function(element) {
        var elementDom = Ext.getDom(element),
            dom = this.dom,
            firstChild = dom.firstChild;

        if (!firstChild) {
            dom.appendChild(elementDom);
        }
        else {
            dom.insertBefore(elementDom, firstChild);
        }

        return this;
    },

     insertSibling: function(el, where, returnDom) {
        var me = this, rt,
            isAfter = (where || 'before').toLowerCase() == 'after',
            insertEl;

        if (Ext.isArray(el)) {
            insertEl = me;
            Ext.each(el, function(e) {
                rt = Ext.fly(insertEl, '_internal').insertSibling(e, where, returnDom);
                if (isAfter) {
                    insertEl = rt;
                }
            });
            return rt;
        }

        el = el || {};

        if (el.nodeType || el.dom) {
            rt = me.dom.parentNode.insertBefore(Ext.getDom(el), isAfter ? me.dom.nextSibling : me.dom);
            if (!returnDom) {
                rt = Ext.get(rt);
            }
        } else {
            if (isAfter && !me.dom.nextSibling) {
                rt = Ext.core.DomHelper.append(me.dom.parentNode, el, !returnDom);
            } else {
                rt = Ext.core.DomHelper[isAfter ? 'insertAfter' : 'insertBefore'](me.dom, el, !returnDom);
            }
        }
        return rt;
    },

    replace: function(element) {
        element = Ext.getDom(element);

        element.parentNode.replaceChild(this.dom, element);

        return this;
    },

    replaceWith: function(el) {
        var me = this;

        if (el.nodeType || el.dom || typeof el == 'string') {
            el = Ext.get(el);
            me.dom.parentNode.insertBefore(el, me.dom);
        } else {
            el = Ext.core.DomHelper.insertBefore(me.dom, el);
        }

        delete Ext.cache[me.id];
        Ext.removeNode(me.dom);
        me.id = Ext.id(me.dom = el);
        Ext.dom.Element.addToCache(me.isFlyweight ? new Ext.dom.Element(me.dom) : me);
        return me;
    },

    doReplaceWith: function(element) {
        var dom = this.dom;
        dom.parentNode.replaceChild(Ext.getDom(element), dom);
    },

     createChild: function(config, insertBefore, returnDom) {
        config = config || {tag: 'div'};
        if (insertBefore) {
            return Ext.core.DomHelper.insertBefore(insertBefore, config, returnDom !== true);
        }
        else {
            return Ext.core.DomHelper[!this.dom.firstChild ? 'insertFirst' : 'append'](this.dom, config, returnDom !== true);
        }
    },

    wrap: function(config, domNode) {
        var dom = this.dom,
            wrapper = this.self.create(config, domNode),
            wrapperDom = (domNode) ? wrapper : wrapper.dom,
            parentNode = dom.parentNode;

        if (parentNode) {
            parentNode.insertBefore(wrapperDom, dom);
        }

        wrapperDom.appendChild(dom);

        return wrapper;
    },

    wrapAllChildren: function(config) {
        var dom = this.dom,
            children = dom.childNodes,
            wrapper = this.self.create(config),
            wrapperDom = wrapper.dom;

        while (children.length > 0) {
            wrapperDom.appendChild(dom.firstChild);
        }

        dom.appendChild(wrapperDom);

        return wrapper;
    },

    unwrapAllChildren: function() {
        var dom = this.dom,
            children = dom.childNodes,
            parentNode = dom.parentNode;

        if (parentNode) {
            while (children.length > 0) {
                parentNode.insertBefore(dom, dom.firstChild);
            }

            this.destroy();
        }
    },

    unwrap: function() {
        var dom = this.dom,
            parentNode = dom.parentNode,
            grandparentNode;

        if (parentNode) {
            grandparentNode = parentNode.parentNode;
            grandparentNode.insertBefore(dom, parentNode);
            grandparentNode.removeChild(parentNode);
        }
        else {
            grandparentNode = document.createDocumentFragment();
            grandparentNode.appendChild(dom);
        }

        return this;
    },

    detach: function() {
        var dom = this.dom;

        if (dom && dom.parentNode && dom.tagName !== 'BODY') {
            dom.parentNode.removeChild(dom);
        }

        return this;
    },

    insertHtml: function(where, html, returnEl) {
        var el = Ext.core.DomHelper.insertHtml(where, this.dom, html);
        return returnEl ? Ext.get(el) : el;
    }
});

Ext.dom.Element.override({

    getX: function(el) {
        return this.getXY(el)[0];
    },

    getY: function(el) {
        return this.getXY(el)[1];
    },


    getXY: function() {
        var rect = this.dom.getBoundingClientRect(),
            round = Math.round;

        return [round(rect.left + window.pageXOffset), round(rect.top + window.pageYOffset)];
    },

     getOffsetsTo: function(el) {
        var o = this.getXY(),
            e = Ext.fly(el, '_internal').getXY();
        return [o[0] - e[0], o[1] - e[1]];
    },

    setX: function(x) {
        return this.setXY([x, this.getY()]);
    },

     setY: function(y) {
        return this.setXY([this.getX(), y]);
    },

    setXY: function(pos) {
        var me = this;

        if (arguments.length > 1) {
            pos = [pos, arguments[1]];
        }

        // me.position();
        var pts = me.translatePoints(pos),
            style = me.dom.style;

        for (pos in pts) {
            if (!pts.hasOwnProperty(pos)) {
                continue;
            }
            if (!isNaN(pts[pos])) style[pos] = pts[pos] + "px";
        }
        return me;
    },

     getLeft: function() {
        return parseInt(this.getStyle('left'), 10) || 0;
    },

    getRight: function() {
        return parseInt(this.getStyle('right'), 10) || 0;
    },

    getTop: function() {
        return parseInt(this.getStyle('top'), 10) || 0;
    },

     getBottom: function() {
        return parseInt(this.getStyle('bottom'), 10) || 0;
    },

    translatePoints: function(x, y) {
        y = isNaN(x[1]) ? y : x[1];
        x = isNaN(x[0]) ? x : x[0];

        var me = this,
            relative = me.isStyle('position', 'relative'),
            o = me.getXY(),
            l = parseInt(me.getStyle('left'), 10),
            t = parseInt(me.getStyle('top'), 10);

        l = !isNaN(l) ? l : (relative ? 0 : me.dom.offsetLeft);
        t = !isNaN(t) ? t : (relative ? 0 : me.dom.offsetTop);

        return {left: (x - o[0] + l), top: (y - o[1] + t)};
    },

     setBox: function(box) {
        var me = this,
            width = box.width,
            height = box.height,
            top = box.top,
            left = box.left;

        if (left !== undefined) {
            me.setLeft(left);
        }
        if (top !== undefined) {
            me.setTop(top);
        }
        if (width !== undefined) {
            me.setWidth(width);
        }
        if (height !== undefined) {
            me.setHeight(height);
        }

        return this;
    },

     getBox: function(contentBox, local) {
        var me = this,
            dom = me.dom,
            width = dom.offsetWidth,
            height = dom.offsetHeight,
            xy, box, l, r, t, b;

        if (!local) {
            xy = me.getXY();
        }
        else if (contentBox) {
            xy = [0, 0];
        }
        else {
            xy = [parseInt(me.getStyle("left"), 10) || 0, parseInt(me.getStyle("top"), 10) || 0];
        }

        if (!contentBox) {
            box = {
                x: xy[0],
                y: xy[1],
                0: xy[0],
                1: xy[1],
                width: width,
                height: height
            };
        }
        else {
            l = me.getBorderWidth.call(me, "l") + me.getPadding.call(me, "l");
            r = me.getBorderWidth.call(me, "r") + me.getPadding.call(me, "r");
            t = me.getBorderWidth.call(me, "t") + me.getPadding.call(me, "t");
            b = me.getBorderWidth.call(me, "b") + me.getPadding.call(me, "b");
            box = {
                x: xy[0] + l,
                y: xy[1] + t,
                0: xy[0] + l,
                1: xy[1] + t,
                width: width - (l + r),
                height: height - (t + b)
            };
        }

        box.left = box.x;
        box.top = box.y;
        box.right = box.x + box.width;
        box.bottom = box.y + box.height;

        return box;
    },

     getPageBox: function(getRegion) {
        var me = this,
            el = me.dom,
            w = el.offsetWidth,
            h = el.offsetHeight,
            xy = me.getXY(),
            t = xy[1],
            r = xy[0] + w,
            b = xy[1] + h,
            l = xy[0];

        if (!el) {
            return new Ext.util.Region();
        }

        if (getRegion) {
            return new Ext.util.Region(t, r, b, l);
        }
        else {
            return {
                left: l,
                top: t,
                width: w,
                height: h,
                right: r,
                bottom: b
            };
        }
    }
});


Ext.dom.Element.addMembers({
    WIDTH: 'width',
    HEIGHT: 'height',
    MIN_WIDTH: 'min-width',
    MIN_HEIGHT: 'min-height',
    MAX_WIDTH: 'max-width',
    MAX_HEIGHT: 'max-height',
    TOP: 'top',
    RIGHT: 'right',
    BOTTOM: 'bottom',
    LEFT: 'left',
    VISIBILITY: 1,

    DISPLAY: 2,

     OFFSETS: 3,

    SEPARATOR: '-',

    trimRe: /^\s+|\s+$/g,
    wordsRe: /\w/g,
    spacesRe: /\s+/,
    styleSplitRe: /\s*(?::|;)\s*/,
    transparentRe: /^(?:transparent|(?:rgba[(](?:\s*\d+\s*[,]){3}\s*0\s*[)]))$/i,
    classNameSplitRegex: /[\s]+/,

    borders: {
        t: 'border-top-width',
        r: 'border-right-width',
        b: 'border-bottom-width',
        l: 'border-left-width'
    },

    paddings: {
        t: 'padding-top',
        r: 'padding-right',
        b: 'padding-bottom',
        l: 'padding-left'
    },

    margins: {
        t: 'margin-top',
        r: 'margin-right',
        b: 'margin-bottom',
        l: 'margin-left'
    },

      defaultUnit: "px",

    isSynchronized: false,
    synchronize: function() {
        var dom = this.dom,
            hasClassMap = {},
            className = dom.className,
            classList, i, ln, name;

        if (className.length > 0) {
            classList = dom.className.split(this.classNameSplitRegex);

            for (i = 0, ln = classList.length; i < ln; i++) {
                name = classList[i];
                hasClassMap[name] = true;
            }
        }
        else {
            classList = [];
        }

        this.classList = classList;

        this.hasClassMap = hasClassMap;

        this.isSynchronized = true;

        return this;
    },
    addCls: function(names, prefix, suffix) {
        if (!names) {
            return this;
        }

        if (!this.isSynchronized) {
            this.synchronize();
        }

        var dom = this.dom,
            map = this.hasClassMap,
            classList = this.classList,
            SEPARATOR = this.SEPARATOR,
            i, ln, name;

        prefix = prefix ? prefix + SEPARATOR : '';
        suffix = suffix ? SEPARATOR + suffix : '';

        if (typeof names == 'string') {
            names = names.split(this.spacesRe);
        }

        for (i = 0, ln = names.length; i < ln; i++) {
            name = prefix + names[i] + suffix;

            if (!map[name]) {
                map[name] = true;
                classList.push(name);
            }
        }

        dom.className = classList.join(' ');

        return this;
    },

    removeCls: function(names, prefix, suffix) {
        if (!names) {
            return this;
        }

        if (!this.isSynchronized) {
            this.synchronize();
        }

        if (!suffix) {
            suffix = '';
        }

        var dom = this.dom,
            map = this.hasClassMap,
            classList = this.classList,
            SEPARATOR = this.SEPARATOR,
            i, ln, name;

        prefix = prefix ? prefix + SEPARATOR : '';
        suffix = suffix ? SEPARATOR + suffix : '';

        if (typeof names == 'string') {
            names = names.split(this.spacesRe);
        }

        for (i = 0, ln = names.length; i < ln; i++) {
            name = prefix + names[i] + suffix;

            if (map[name]) {
                delete map[name];
                Ext.Array.remove(classList, name);
            }
        }

        dom.className = classList.join(' ');

        return this;
    },

     replaceCls: function(oldName, newName, prefix, suffix) {
        if (!oldName && !newName) {
            return this;
        }

        oldName = oldName || [];
        newName = newName || [];

        if (!this.isSynchronized) {
            this.synchronize();
        }

        if (!suffix) {
            suffix = '';
        }

        var dom = this.dom,
            map = this.hasClassMap,
            classList = this.classList,
            SEPARATOR = this.SEPARATOR,
            i, ln, name;

        prefix = prefix ? prefix + SEPARATOR : '';
        suffix = suffix ? SEPARATOR + suffix : '';

        if (typeof oldName == 'string') {
            oldName = oldName.split(this.spacesRe);
        }
        if (typeof newName == 'string') {
            newName = newName.split(this.spacesRe);
        }

        for (i = 0, ln = oldName.length; i < ln; i++) {
            name = prefix + oldName[i] + suffix;

            if (map[name]) {
                delete map[name];
                Ext.Array.remove(classList, name);
            }
        }

        for (i = 0, ln = newName.length; i < ln; i++) {
            name = prefix + newName[i] + suffix;

            if (!map[name]) {
                map[name] = true;
                classList.push(name);
            }
        }

        dom.className = classList.join(' ');

        return this;
    },

     hasCls: function(name) {
        if (!this.isSynchronized) {
            this.synchronize();
        }

        return this.hasClassMap.hasOwnProperty(name);
    },

 
    setCls: function(className) {
        var map = this.hasClassMap,
            i, ln, name;

        if (typeof className == 'string') {
            className = className.split(this.spacesRe);
        }

        for (i = 0, ln = className.length; i < ln; i++) {
            name = className[i];
            if (!map[name]) {
                map[name] = true;
            }
        }

        this.classList = className.slice();
        this.dom.className = className.join(' ');
    },

 
    toggleCls: function(className, force){
        if (typeof force !== 'boolean') {
            force = !this.hasCls(className);
        }

   		return (force) ? this.addCls(className) : this.removeCls(className);
   	},

    swapCls: function(firstClass, secondClass, flag, prefix) {
        if (flag === undefined) {
            flag = true;
        }

        var addedClass = flag ? firstClass : secondClass,
            removedClass = flag ? secondClass : firstClass;

        if (removedClass) {
            this.removeCls(prefix ? prefix + '-' + removedClass : removedClass);
        }

        if (addedClass) {
            this.addCls(prefix ? prefix + '-' + addedClass : addedClass);
        }

        return this;
    },

     setWidth: function(width) {
        return this.setLengthValue(this.WIDTH, width);
    },

     setHeight: function(height) {
        return this.setLengthValue(this.HEIGHT, height);
    },

    setSize: function(width, height) {
        if (Ext.isObject(width)) {
            // in case of object from getSize()
            height = width.height;
            width = width.width;
        }

        this.setWidth(width);
        this.setHeight(height);

        return this;
    },

     setMinWidth: function(width) {
        return this.setLengthValue(this.MIN_WIDTH, width);
    },

     setMinHeight: function(height) {
        return this.setLengthValue(this.MIN_HEIGHT, height);
    },

     setMaxWidth: function(width) {
        return this.setLengthValue(this.MAX_WIDTH, width);
    },


    setMaxHeight: function(height) {
        return this.setLengthValue(this.MAX_HEIGHT, height);
    },

     setTop: function(top) {
        return this.setLengthValue(this.TOP, top);
    },

      setRight: function(right) {
        return this.setLengthValue(this.RIGHT, right);
    },

     setBottom: function(bottom) {
        return this.setLengthValue(this.BOTTOM, bottom);
    },

    setLeft: function(left) {
        return this.setLengthValue(this.LEFT, left);
    },

    setMargin: function(margin) {
        var domStyle = this.dom.style;

        if (margin || margin === 0) {
            margin = this.self.unitizeBox((margin === true) ? 5 : margin);
            domStyle.setProperty('margin', margin, 'important');
        }
        else {
            domStyle.removeProperty('margin-top');
            domStyle.removeProperty('margin-right');
            domStyle.removeProperty('margin-bottom');
            domStyle.removeProperty('margin-left');
        }
    },

    setPadding: function(padding) {
        var domStyle = this.dom.style;

        if (padding || padding === 0) {
            padding = this.self.unitizeBox((padding === true) ? 5 : padding);
            domStyle.setProperty('padding', padding, 'important');
        }
        else {
            domStyle.removeProperty('padding-top');
            domStyle.removeProperty('padding-right');
            domStyle.removeProperty('padding-bottom');
            domStyle.removeProperty('padding-left');
        }
    },

    setBorder: function(border) {
        var domStyle = this.dom.style;

        if (border || border === 0) {
            border = this.self.unitizeBox((border === true) ? 1 : border);
            domStyle.setProperty('border-width', border, 'important');
        }
        else {
            domStyle.removeProperty('border-top-width');
            domStyle.removeProperty('border-right-width');
            domStyle.removeProperty('border-bottom-width');
            domStyle.removeProperty('border-left-width');
        }
    },

    setLengthValue: function(name, value) {
        var domStyle = this.dom.style;

        if (value === null) {
            domStyle.removeProperty(name);
            return this;
        }

        if (typeof value == 'number') {
            value = value + 'px';
        }

        domStyle.setProperty(name, value, 'important');
        return this;
    },

     setVisible: function(visible) {
        var mode = this.getVisibilityMode(),
            method = visible ? 'removeCls' : 'addCls';

        switch (mode) {
            case this.VISIBILITY:
                this.removeCls(['x-hidden-display', 'x-hidden-offsets']);
                this[method]('x-hidden-visibility');
                break;

            case this.DISPLAY:
                this.removeCls(['x-hidden-visibility', 'x-hidden-offsets']);
                this[method]('x-hidden-display');
                break;

            case this.OFFSETS:
                this.removeCls(['x-hidden-visibility', 'x-hidden-display']);
                this[method]('x-hidden-offsets');
                break;
        }

        return this;
    },

    getVisibilityMode: function() {
        var dom = this.dom,
            mode = Ext.dom.Element.data(dom, 'visibilityMode');

        if (mode === undefined) {
            Ext.dom.Element.data(dom, 'visibilityMode', mode = this.DISPLAY);
        }

        return mode;
    },

     setVisibilityMode: function(mode) {
        this.self.data(this.dom, 'visibilityMode', mode);

        return this;
    },

     show: function() {
        var dom = this.dom;
        if (dom) {
            dom.style.removeProperty('display');
        }
    },

    hide: function() {
        this.dom.style.setProperty('display', 'none', 'important');
    },

    setVisibility: function(isVisible) {
        var domStyle = this.dom.style;

        if (isVisible) {
            domStyle.removeProperty('visibility');
        }
        else {
            domStyle.setProperty('visibility', 'hidden', 'important');
        }
    },

    styleHooks: {},

    // @private
    addStyles: function(sides, styles) {
        var totalSize = 0,
            sidesArr = sides.match(this.wordsRe),
            i = 0,
            len = sidesArr.length,
            side, size;
        for (; i < len; i++) {
            side = sidesArr[i];
            size = side && parseInt(this.getStyle(styles[side]), 10);
            if (size) {
                totalSize += Math.abs(size);
            }
        }
        return totalSize;
    },

    isStyle: function(style, val) {
        return this.getStyle(style) == val;
    },

    getStyleValue: function(name) {
        return this.dom.style.getPropertyValue(name);
    },

    getStyle: function(prop) {
        var me = this,
            dom = me.dom,
            hook = me.styleHooks[prop],
            cs, result;

        if (dom == document) {
            return null;
        }
        if (!hook) {
            me.styleHooks[prop] = hook = { name: Ext.dom.Element.normalize(prop) };
        }
        if (hook.get) {
            return hook.get(dom, me);
        }

        cs = window.getComputedStyle(dom, '');

        // why the dom.style lookup? It is not true that "style == computedStyle" as
        // well as the fact that 0/false are valid answers...
        result = (cs && cs[hook.name]); // || dom.style[hook.name];

        // WebKit returns rgb values for transparent, how does this work n IE9+
        //        if (!supportsTransparentColor && result == 'rgba(0, 0, 0, 0)') {
        //            result = 'transparent';
        //        }

        return result;
    },

     setStyle: function(prop, value) {
        var me = this,
            dom = me.dom,
            hooks = me.styleHooks,
            style = dom.style,
            valueFrom = Ext.valueFrom,
            name, hook;

        // we don't promote the 2-arg form to object-form to avoid the overhead...
        if (typeof prop == 'string') {
            hook = hooks[prop];

            if (!hook) {
                hooks[prop] = hook = { name: Ext.dom.Element.normalize(prop) };
            }
            value = valueFrom(value, '');

            if (hook.set) {
                hook.set(dom, value, me);
            } else {
                style[hook.name] = value;
            }
        }
        else {
            for (name in prop) {
                if (prop.hasOwnProperty(name)) {
                    hook = hooks[name];

                    if (!hook) {
                        hooks[name] = hook = { name: Ext.dom.Element.normalize(name) };
                    }

                    value = valueFrom(prop[name], '');

                    if (hook.set) {
                        hook.set(dom, value, me);
                    }
                    else {
                        style[hook.name] = value;
                    }
                }
            }
        }

        return me;
    },

     getHeight: function(contentHeight) {
        var dom = this.dom,
            height = contentHeight ? (dom.clientHeight - this.getPadding("tb")) : dom.offsetHeight;
        return height > 0 ? height : 0;
    },

    getWidth: function(contentWidth) {
        var dom = this.dom,
            width = contentWidth ? (dom.clientWidth - this.getPadding("lr")) : dom.offsetWidth;
        return width > 0 ? width : 0;
    },

    getBorderWidth: function(side) {
        return this.addStyles(side, this.borders);
    },
    getPadding: function(side) {
        return this.addStyles(side, this.paddings);
    },
    applyStyles: function(styles) {
        if (styles) {
            var dom = this.dom,
                styleType, i, len;

            if (typeof styles == 'function') {
                styles = styles.call();
            }
            styleType = typeof styles;
            if (styleType == 'string') {
                styles = Ext.util.Format.trim(styles).split(this.styleSplitRe);
                for (i = 0, len = styles.length; i < len;) {
                    dom.style[Ext.dom.Element.normalize(styles[i++])] = styles[i++];
                }
            }
            else if (styleType == 'object') {
                this.setStyle(styles);
            }
        }
        return this;
    },

    getSize: function(contentSize) {
        var dom = this.dom;
        return {
            width: Math.max(0, contentSize ? (dom.clientWidth - this.getPadding("lr")) : dom.offsetWidth),
            height: Math.max(0, contentSize ? (dom.clientHeight - this.getPadding("tb")) : dom.offsetHeight)
        };
    },

    repaint: function() {
        var dom = this.dom;
        this.addCls(Ext.baseCSSPrefix + 'repaint');
        setTimeout(function() {
            Ext.fly(dom).removeCls(Ext.baseCSSPrefix + 'repaint');
        }, 1);
        return this;
    },

    getMargin: function(side) {
        var me = this,
            hash = {t: "top", l: "left", r: "right", b: "bottom"},
            o = {},
            key;

        if (!side) {
            for (key in me.margins) {
                o[hash[key]] = parseFloat(me.getStyle(me.margins[key])) || 0;
            }
            return o;
        } else {
            return me.addStyles.call(me, side, me.margins);
        }
    },

    translate: function() {
        var transformStyleName = 'webkitTransform' in document.createElement('div').style ? 'webkitTransform' : 'transform';

        return function(x, y, z) {
            this.dom.style[transformStyleName] = 'translate3d(' + (x || 0) + 'px, ' + (y || 0) + 'px, ' + (z || 0) + 'px)';
        }
    }()
});


Ext.dom.Element.addMembers({
    getParent: function() {
        return Ext.get(this.dom.parentNode);
    },

    getFirstChild: function() {
        return Ext.get(this.dom.firstElementChild);
    },

    contains: function(element) {
        if (!element) {
            return false;
        }

        var dom = Ext.getDom(element);

        // we need el-contains-itself logic here because isAncestor does not do that:
        return (dom === this.dom) || this.self.isAncestor(this.dom, dom);
    },

     findParent: function(simpleSelector, maxDepth, returnEl) {
        var p = this.dom,
            b = document.body,
            depth = 0,
            stopEl;

        maxDepth = maxDepth || 50;
        if (isNaN(maxDepth)) {
            stopEl = Ext.getDom(maxDepth);
            maxDepth = Number.MAX_VALUE;
        }
        while (p && p.nodeType == 1 && depth < maxDepth && p != b && p != stopEl) {
            if (Ext.DomQuery.is(p, simpleSelector)) {
                return returnEl ? Ext.get(p) : p;
            }
            depth++;
            p = p.parentNode;
        }
        return null;
    },

    findParentNode: function(simpleSelector, maxDepth, returnEl) {
        var p = Ext.fly(this.dom.parentNode, '_internal');
        return p ? p.findParent(simpleSelector, maxDepth, returnEl) : null;
    },

    up: function(simpleSelector, maxDepth) {
        return this.findParentNode(simpleSelector, maxDepth, true);
    },

    select: function(selector, composite) {
        return Ext.dom.Element.select(selector, composite, this.dom);
    },

     query: function(selector) {
        return Ext.DomQuery.select(selector, this.dom);
    },
    down: function(selector, returnDom) {
        var n = Ext.DomQuery.selectNode(selector, this.dom);
        return returnDom ? n : Ext.get(n);
    },
    child: function(selector, returnDom) {
        var node,
            me = this,
            id;
        id = Ext.get(me).id;
           id = id.replace(/[\.:]/g, "\\$0");
        node = Ext.DomQuery.selectNode('#' + id + " > " + selector, me.dom);
        return returnDom ? node : Ext.get(node);
    },

    parent: function(selector, returnDom) {
        return this.matchNode('parentNode', 'parentNode', selector, returnDom);
    },

    next: function(selector, returnDom) {
        return this.matchNode('nextSibling', 'nextSibling', selector, returnDom);
    },

    prev: function(selector, returnDom) {
        return this.matchNode('previousSibling', 'previousSibling', selector, returnDom);
    },


    first: function(selector, returnDom) {
        return this.matchNode('nextSibling', 'firstChild', selector, returnDom);
    },

    last: function(selector, returnDom) {
        return this.matchNode('previousSibling', 'lastChild', selector, returnDom);
    },

    matchNode: function(dir, start, selector, returnDom) {
        if (!this.dom) {
            return null;
        }

        var n = this.dom[start];
        while (n) {
            if (n.nodeType == 1 && (!selector || Ext.DomQuery.is(n, selector))) {
                return !returnDom ? Ext.get(n) : n;
            }
            n = n[dir];
        }
        return null;
    },

    isAncestor: function(element) {
        return this.self.isAncestor.call(this.self, this.dom, element);
    }
});


Ext.define('Ext.dom.CompositeElementLite', {
    alternateClassName: ['Ext.CompositeElementLite', 'Ext.CompositeElement'],

    statics: {
        importElementMethods: function() {

        }
    },

    constructor: function(elements, root) {
        this.elements = [];
        this.add(elements, root);
        this.el = new Ext.dom.Element.Fly();
    },

    isComposite: true,

    getElement: function(el) {
               return this.el.attach(el).synchronize();
    },

       transformElement: function(el) {
        return Ext.getDom(el);
    },

    getCount: function() {
        return this.elements.length;
    },

    add: function(els, root) {
        var elements = this.elements,
            i, ln;

        if (!els) {
            return this;
        }

        if (typeof els == "string") {
            els = Ext.dom.Element.selectorFunction(els, root);
        }
        else if (els.isComposite) {
            els = els.elements;
        }
        else if (!Ext.isIterable(els)) {
            els = [els];
        }

        for (i = 0, ln = els.length; i < ln; ++i) {
            elements.push(this.transformElement(els[i]));
        }

        return this;
    },

    invoke: function(fn, args) {
        var elements = this.elements,
            ln = elements.length,
            element,
            i;

        for (i = 0; i < ln; i++) {
            element = elements[i];

            if (element) {
                Ext.dom.Element.prototype[fn].apply(this.getElement(element), args);
            }
        }
        return this;
    },

    item: function(index) {
        var el = this.elements[index],
            out = null;

        if (el) {
            out = this.getElement(el);
        }

        return out;
    },

    // fixes scope with flyweight.
    addListener: function(eventName, handler, scope, opt) {
        var els = this.elements,
                len = els.length,
                i, e;

        for (i = 0; i < len; i++) {
            e = els[i];
            if (e) {
                e.on(eventName, handler, scope || e, opt);
            }
        }
        return this;
    },
    each: function(fn, scope) {
        var me = this,
                els = me.elements,
                len = els.length,
                i, e;

        for (i = 0; i < len; i++) {
            e = els[i];
            if (e) {
                e = this.getElement(e);
                if (fn.call(scope || e, e, me, i) === false) {
                    break;
                }
            }
        }
        return me;
    },

    fill: function(els) {
        var me = this;
        me.elements = [];
        me.add(els);
        return me;
    },

    filter: function(selector) {
        var els = [],
                me = this,
                fn = Ext.isFunction(selector) ? selector
                        : function(el) {
                    return el.is(selector);
                };

        me.each(function(el, self, i) {
            if (fn(el, i) !== false) {
                els[els.length] = me.transformElement(el);
            }
        });

        me.elements = els;
        return me;
    },

    indexOf: function(el) {
        return Ext.Array.indexOf(this.elements, this.transformElement(el));
    },

    replaceElement: function(el, replacement, domReplace) {
        var index = !isNaN(el) ? el : this.indexOf(el),
                d;
        if (index > -1) {
            replacement = Ext.getDom(replacement);
            if (domReplace) {
                d = this.elements[index];
                d.parentNode.insertBefore(replacement, d);
                Ext.removeNode(d);
            }
            Ext.Array.splice(this.elements, index, 1, replacement);
        }
        return this;
    },

    clear: function() {
        this.elements = [];
    },

    addElements: function(els, root) {
        if (!els) {
            return this;
        }

        if (typeof els == "string") {
            els = Ext.dom.Element.selectorFunction(els, root);
        }

        var yels = this.elements;

        Ext.each(els, function(e) {
            yels.push(Ext.get(e));
        });

        return this;
    },

    first: function() {
        return this.item(0);
    },

    last: function() {
        return this.item(this.getCount() - 1);
    },

    contains: function(el) {
        return this.indexOf(el) != -1;
    },

    removeElement: function(keys, removeDom) {
        var me = this,
                elements = this.elements,
                el;

        Ext.each(keys, function(val) {
            if ((el = (elements[val] || elements[val = me.indexOf(val)]))) {
                if (removeDom) {
                    if (el.dom) {
                        el.remove();
                    }
                    else {
                        Ext.removeNode(el);
                    }
                }
                Ext.Array.erase(elements, val, 1);
            }
        });

        return this;
    }

}, function() {
    var Element = Ext.dom.Element,
        elementPrototype = Element.prototype,
        prototype = this.prototype,
        name;

    for (name in elementPrototype) {
        if (typeof elementPrototype[name] == 'function'){
            (function(key) {
                prototype[key] = prototype[key] || function() {
                    return this.invoke(key, arguments);
                };
            }).call(prototype, name);
        }
    }

    prototype.on = prototype.addListener;

    Element.selectorFunction = Ext.DomQuery.select;

    Ext.dom.Element.select = function(selector, composite, root) {
        var elements;

        if (typeof selector == "string") {
            elements = Ext.dom.Element.selectorFunction(selector, root);
        }
        else if (selector.length !== undefined) {
            elements = selector;
        }
        else {
            //<debug>
            throw new Error("[Ext.select] Invalid selector specified: " + selector);
            //</debug>
        }

        return (composite === true) ? new Ext.dom.CompositeElement(elements) : new Ext.dom.CompositeElementLite(elements);
    };

    Ext.select = function() {
        return Element.select.apply(Element, arguments);
    };
});

Ext.ClassManager.addNameAlternateMappings({
  "Ext.app.Profile": [],
  "Ext.event.recognizer.MultiTouch": [],
  "Ext.fx.Runner": [],
  "Ext.chart.grid.CircularGrid": [],
  "Ext.mixin.Templatable": [],
  "Ext.event.recognizer.Pinch": [],
  "Ext.util.Format": [],
  "Ext.direct.JsonProvider": [],
  "Ext.data.identifier.Simple": [],
  "Ext.dataview.DataView": [
    "Ext.DataView"
  ],
  "Ext.field.Hidden": [
    "Ext.form.Hidden"
  ],
  "Ext.device.SQLite.SQLTransaction": [],
  "Ext.field.Number": [
    "Ext.form.Number"
  ],
  "Ext.chart.series.CandleStick": [],
  "Ext.device.Connection": [],
  "Ext.data.Model": [
    "Ext.data.Record"
  ],
  "Ext.data.reader.Reader": [
    "Ext.data.Reader",
    "Ext.data.DataReader"
  ],
  "Ext.Sheet": [],
  "Ext.tab.Tab": [
    "Ext.Tab"
  ],
  "Ext.chart.series.sprite.StackedCartesian": [],
  "Ext.util.Grouper": [],
  "Ext.util.translatable.CssPosition": [],
  "Ext.util.paintmonitor.Abstract": [],
  "Ext.direct.RemotingProvider": [],
  "Ext.data.NodeInterface": [
    "Ext.data.Node"
  ],
  "Ext.chart.interactions.PanZoom": [],
  "Ext.util.PositionMap": [],
  "Ext.chart.series.ItemPublisher": [],
  "Ext.util.Sortable": [],
  "Ext.chart.series.sprite.AbstractRadial": [],
  "Ext.fx.runner.Css": [],
  "Ext.fx.runner.CssTransition": [],
  "Ext.draw.Group": [],
  "Ext.XTemplateCompiler": [],
  "Ext.util.Wrapper": [],
  "Ext.app.Router": [],
  "Ext.direct.Transaction": [
    "Ext.Direct.Transaction"
  ],
  "Ext.util.Offset": [],
  "Ext.device.device.Abstract": [],
  "Ext.mixin.Mixin": [],
  "Ext.fx.animation.FadeOut": [],
  "Ext.util.Geolocation": [
    "Ext.util.GeoLocation"
  ],
  "Ext.ComponentManager": [
    "Ext.ComponentMgr"
  ],
  "Ext.util.sizemonitor.OverflowChange": [],
  "Ext.event.publisher.ElementSize": [],
  "Ext.tab.Bar": [
    "Ext.TabBar"
  ],
  "Ext.event.Dom": [],
  "Ext.app.Application": [],
  "Ext.dataview.List": [
    "Ext.List"
  ],
  "Ext.util.translatable.Dom": [],
  "Ext.fx.layout.card.Scroll": [],
  "Ext.draw.LimitedCache": [],
  "Ext.device.geolocation.Sencha": [],
  "Ext.dataview.component.SimpleListItem": [],
  "Ext.dataview.ListItemHeader": [],
  "Ext.event.publisher.TouchGesture": [],
  "Ext.AnimationQueue": [],
  "Ext.data.SortTypes": [],
  "Ext.device.contacts.Abstract": [],
  "Ext.device.push.Sencha": [],
  "Ext.fx.animation.WipeOut": [],
  "Ext.slider.Slider": [],
  "Ext.Component": [
    "Ext.lib.Component"
  ],
  "Ext.device.communicator.Default": [],
  "Ext.fx.runner.CssAnimation": [],
  "Ext.chart.axis.Axis": [],
  "Ext.fx.animation.Cube": [],
  "Ext.chart.Markers": [],
  "Ext.chart.series.sprite.Radar": [],
  "Ext.device.device.Simulator": [],
  "Ext.Ajax": [],
  "Ext.dataview.component.ListItem": [],
  "Ext.util.Filter": [],
  "Ext.layout.wrapper.Inner": [],
  "Ext.draw.Animator": [],
  "Ext.device.geolocation.Simulator": [],
  "Ext.data.association.BelongsTo": [
    "Ext.data.BelongsToAssociation"
  ],
  "Ext.draw.Surface": [],
  "Ext.scroll.indicator.ScrollPosition": [],
  "Ext.field.Email": [
    "Ext.form.Email"
  ],
  "Ext.fx.layout.card.Abstract": [],
  "Ext.event.Controller": [],
  "Ext.dataview.component.Container": [],
  "Ext.log.writer.Remote": [],
  "Ext.fx.layout.card.Style": [],
  "Ext.device.purchases.Sencha": [],
  "Ext.chart.axis.segmenter.Segmenter": [],
  "Ext.viewport.Android": [],
  "Ext.log.formatter.Identity": [],
  "Ext.chart.interactions.ItemHighlight": [],
  "Ext.picker.Picker": [
    "Ext.Picker"
  ],
  "Ext.data.Batch": [],
  "Ext.draw.modifier.Animation": [],
  "Ext.chart.AbstractChart": [],
  "Ext.field.File": [],
  "Ext.tab.Panel": [
    "Ext.TabPanel"
  ],
  "Ext.draw.Path": [],
  "Ext.util.sizemonitor.Default": [],
  "Ext.fx.animation.SlideOut": [],
  "Ext.device.connection.Sencha": [],
  "Ext.fx.layout.card.Pop": [],
  "Ext.chart.axis.layout.Discrete": [],
  "Ext.data.Field": [],
  "Ext.chart.series.Gauge": [],
  "Ext.data.StoreManager": [
    "Ext.StoreMgr",
    "Ext.data.StoreMgr",
    "Ext.StoreManager"
  ],
  "Ext.fx.animation.PopOut": [],
  "Ext.chart.label.Callout": [],
  "Ext.device.push.Abstract": [],
  "Ext.util.DelayedTask": [],
  "Ext.fx.easing.Momentum": [],
  "Ext.device.sqlite.Sencha": [],
  "Ext.fx.easing.Abstract": [],
  "Ext.Title": [],
  "Ext.event.recognizer.Drag": [],
  "Ext.field.TextArea": [
    "Ext.form.TextArea"
  ],
  "Ext.fx.Easing": [],
  "Ext.chart.series.sprite.Scatter": [],
  "Ext.picker.Date": [
    "Ext.DatePicker"
  ],
  "Ext.data.reader.Array": [
    "Ext.data.ArrayReader"
  ],
  "Ext.data.proxy.JsonP": [
    "Ext.data.ScriptTagProxy"
  ],
  "Ext.device.communicator.Android": [],
  "Ext.chart.series.Area": [],
  "Ext.device.device.PhoneGap": [],
  "Ext.field.Checkbox": [
    "Ext.form.Checkbox"
  ],
  "Ext.chart.Legend": [],
  "Ext.Media": [],
  "Ext.TitleBar": [],
  "Ext.chart.interactions.RotatePie3D": [],
  "Ext.draw.gradient.Linear": [],
  "Ext.util.TapRepeater": [],
  "Ext.event.Touch": [],
  "Ext.mixin.Bindable": [],
  "Ext.data.proxy.Server": [
    "Ext.data.ServerProxy"
  ],
  "Ext.chart.series.Cartesian": [],
  "Ext.util.sizemonitor.Scroll": [],
  "Ext.data.ResultSet": [],
  "Ext.data.association.HasMany": [
    "Ext.data.HasManyAssociation"
  ],
  "Ext.draw.TimingFunctions": [],
  "Ext.draw.engine.Canvas": [],
  "Ext.data.proxy.Ajax": [
    "Ext.data.HttpProxy",
    "Ext.data.AjaxProxy"
  ],
  "Ext.fx.animation.Fade": [
    "Ext.fx.animation.FadeIn"
  ],
  "Ext.layout.Default": [],
  "Ext.util.paintmonitor.CssAnimation": [],
  "Ext.data.writer.Writer": [
    "Ext.data.DataWriter",
    "Ext.data.Writer"
  ],
  "Ext.event.recognizer.Recognizer": [],
  "Ext.form.FieldSet": [],
  "Ext.scroll.Indicator": [
    "Ext.util.Indicator"
  ],
  "Ext.XTemplateParser": [],
  "Ext.behavior.Scrollable": [],
  "Ext.chart.series.sprite.CandleStick": [],
  "Ext.data.JsonP": [
    "Ext.util.JSONP"
  ],
  "Ext.device.connection.PhoneGap": [],
  "Ext.event.publisher.Dom": [],
  "Ext.fx.layout.card.Fade": [],
  "Ext.app.Controller": [],
  "Ext.fx.State": [],
  "Ext.layout.wrapper.BoxDock": [],
  "Ext.chart.series.sprite.Pie3DPart": [],
  "Ext.viewport.Default": [],
  "Ext.layout.HBox": [],
  "Ext.data.ModelManager": [
    "Ext.ModelMgr",
    "Ext.ModelManager"
  ],
  "Ext.data.Validations": [
    "Ext.data.validations"
  ],
  "Ext.util.translatable.Abstract": [],
  "Ext.scroll.indicator.Abstract": [],
  "Ext.Button": [],
  "Ext.field.Radio": [
    "Ext.form.Radio"
  ],
  "Ext.util.HashMap": [],
  "Ext.field.Input": [],
  "Ext.device.Camera": [],
  "Ext.mixin.Filterable": [],
  "Ext.draw.TextMeasurer": [],
  "Ext.device.SQLite.SQLResultSet": [],
  "Ext.dataview.element.Container": [],
  "Ext.chart.series.sprite.PieSlice": [],
  "Ext.data.Connection": [],
  "Ext.direct.ExceptionEvent": [],
  "Ext.Panel": [
    "Ext.lib.Panel"
  ],
  "Ext.data.association.HasOne": [
    "Ext.data.HasOneAssociation"
  ],
  "Ext.device.geolocation.Abstract": [],
  "Ext.viewport.WindowsPhone": [
    "Ext.viewport.WP"
  ],
  "Ext.ActionSheet": [],
  "Ext.layout.Box": [],
  "Ext.Video": [],
  "Ext.chart.series.Line": [],
  "Ext.fx.layout.card.Cube": [],
  "Ext.event.recognizer.HorizontalSwipe": [],
  "Ext.data.writer.Json": [
    "Ext.data.JsonWriter"
  ],
  "Ext.layout.Fit": [],
  "Ext.fx.animation.Slide": [
    "Ext.fx.animation.SlideIn"
  ],
  "Ext.device.Purchases.Purchase": [],
  "Ext.table.Row": [],
  "Ext.log.formatter.Formatter": [],
  "Ext.Container": [
    "Ext.lib.Container"
  ],
  "Ext.fx.animation.Pop": [
    "Ext.fx.animation.PopIn"
  ],
  "Ext.draw.sprite.Circle": [],
  "Ext.fx.layout.card.Reveal": [],
  "Ext.fx.layout.card.Cover": [],
  "Ext.log.Base": [],
  "Ext.data.reader.Xml": [
    "Ext.data.XmlReader"
  ],
  "Ext.event.publisher.ElementPaint": [],
  "Ext.chart.axis.Category": [],
  "Ext.data.reader.Json": [
    "Ext.data.JsonReader"
  ],
  "Ext.Decorator": [],
  "Ext.data.TreeStore": [],
  "Ext.device.Purchases": [],
  "Ext.device.orientation.HTML5": [],
  "Ext.draw.gradient.Gradient": [],
  "Ext.event.recognizer.DoubleTap": [],
  "Ext.log.Logger": [],
  "Ext.picker.Slot": [
    "Ext.Picker.Slot"
  ],
  "Ext.device.notification.Simulator": [],
  "Ext.field.Field": [
    "Ext.form.Field"
  ],
  "Ext.log.filter.Priority": [],
  "Ext.util.sizemonitor.Abstract": [],
  "Ext.device.SQLite.Database": [],
  "Ext.chart.series.sprite.Polar": [],
  "Ext.util.paintmonitor.OverflowChange": [],
  "Ext.util.LineSegment": [],
  "Ext.SegmentedButton": [],
  "Ext.Sortable": [],
  "Ext.fx.easing.Linear": [],
  "Ext.chart.series.sprite.Aggregative": [],
  "Ext.dom.CompositeElement": [
    "Ext.CompositeElement"
  ],
  "Ext.data.identifier.Uuid": [],
  "Ext.data.proxy.Client": [
    "Ext.proxy.ClientProxy"
  ],
  "Ext.util.InputBlocker": [],
  "Ext.fx.easing.Bounce": [],
  "Ext.data.Types": [],
  "Ext.chart.series.sprite.Cartesian": [],
  "Ext.app.Action": [],
  "Ext.util.Translatable": [],
  "Ext.device.camera.PhoneGap": [],
  "Ext.draw.sprite.Path": [],
  "Ext.LoadMask": [],
  "Ext.data.association.Association": [
    "Ext.data.Association"
  ],
  "Ext.chart.axis.sprite.Axis": [],
  "Ext.behavior.Draggable": [],
  "Ext.chart.grid.RadialGrid": [],
  "Ext.util.TranslatableGroup": [],
  "Ext.fx.Animation": [],
  "Ext.draw.sprite.Ellipse": [],
  "Ext.util.Inflector": [],
  "Ext.Map": [],
  "Ext.XTemplate": [],
  "Ext.data.NodeStore": [],
  "Ext.draw.sprite.AttributeParser": [],
  "Ext.form.Panel": [
    "Ext.form.FormPanel"
  ],
  "Ext.chart.series.Series": [],
  "Ext.data.Request": [],
  "Ext.draw.sprite.Text": [],
  "Ext.layout.Float": [],
  "Ext.dataview.component.DataItem": [],
  "Ext.chart.CartesianChart": [
    "Ext.chart.Chart"
  ],
  "Ext.data.proxy.WebStorage": [
    "Ext.data.WebStorageProxy"
  ],
  "Ext.log.writer.Writer": [],
  "Ext.device.Communicator": [],
  "Ext.fx.animation.Flip": [],
  "Ext.util.Point": [],
  "Ext.chart.series.StackedCartesian": [],
  "Ext.fx.layout.card.Slide": [],
  "Ext.Anim": [],
  "Ext.field.DatePickerNative": [
    "Ext.form.DatePickerNative"
  ],
  "Ext.data.DirectStore": [],
  "Ext.dataview.NestedList": [
    "Ext.NestedList"
  ],
  "Ext.app.Route": [],
  "Ext.device.connection.Simulator": [],
  "Ext.chart.PolarChart": [],
  "Ext.event.publisher.ComponentSize": [],
  "Ext.slider.Toggle": [],
  "Ext.data.identifier.Sequential": [],
  "Ext.AbstractComponent": [],
  "Ext.Template": [],
  "Ext.device.Push": [],
  "Ext.fx.easing.BoundMomentum": [],
  "Ext.viewport.Viewport": [],
  "Ext.event.recognizer.VerticalSwipe": [],
  "Ext.BingMap": [],
  "Ext.chart.series.Polar": [],
  "Ext.event.Event": [
    "Ext.EventObject"
  ],
  "Ext.behavior.Behavior": [],
  "Ext.chart.grid.VerticalGrid": [],
  "Ext.chart.label.Label": [],
  "Ext.draw.sprite.EllipticalArc": [],
  "Ext.fx.easing.EaseOut": [],
  "Ext.Toolbar": [],
  "Ext.event.recognizer.LongPress": [],
  "Ext.device.notification.Sencha": [],
  "Ext.chart.series.sprite.Line": [],
  "Ext.data.ArrayStore": [],
  "Ext.event.recognizer.Rotate": [],
  "Ext.mixin.Sortable": [],
  "Ext.fx.layout.card.Flip": [],
  "Ext.chart.interactions.CrossZoom": [],
  "Ext.event.publisher.ComponentPaint": [],
  "Ext.util.TranslatableList": [],
  "Ext.carousel.Item": [],
  "Ext.event.recognizer.Swipe": [],
  "Ext.util.translatable.ScrollPosition": [],
  "Ext.device.camera.Simulator": [],
  "Ext.chart.series.sprite.Area": [],
  "Ext.event.recognizer.Touch": [],
  "Ext.plugin.ListPaging": [],
  "Ext.draw.sprite.Sector": [],
  "Ext.chart.axis.segmenter.Names": [],
  "Ext.mixin.Observable": [
    "Ext.util.Observable"
  ],
  "Ext.carousel.Infinite": [],
  "Ext.draw.Matrix": [],
  "Ext.Mask": [],
  "Ext.event.publisher.Publisher": [],
  "Ext.layout.wrapper.Dock": [],
  "Ext.app.History": [],
  "Ext.data.proxy.Direct": [
    "Ext.data.DirectProxy"
  ],
  "Ext.chart.axis.layout.Continuous": [],
  "Ext.data.proxy.Sql": [
    "Ext.data.proxy.SQL"
  ],
  "Ext.table.Cell": [],
  "Ext.fx.layout.card.ScrollCover": [],
  "Ext.device.orientation.Sencha": [],
  "Ext.util.Droppable": [],
  "Ext.draw.sprite.Composite": [],
  "Ext.chart.series.Pie": [],
  "Ext.device.Purchases.Product": [],
  "Ext.device.Orientation": [],
  "Ext.direct.Provider": [],
  "Ext.draw.sprite.Arc": [],
  "Ext.chart.axis.segmenter.Time": [],
  "Ext.util.Draggable": [],
  "Ext.device.contacts.Sencha": [],
  "Ext.chart.grid.HorizontalGrid": [],
  "Ext.mixin.Traversable": [],
  "Ext.util.AbstractMixedCollection": [],
  "Ext.data.JsonStore": [],
  "Ext.draw.SegmentTree": [],
  "Ext.direct.RemotingEvent": [],
  "Ext.device.SQLite": [],
  "Ext.plugin.PullRefresh": [],
  "Ext.log.writer.Console": [],
  "Ext.field.Spinner": [
    "Ext.form.Spinner"
  ],
  "Ext.chart.axis.segmenter.Numeric": [],
  "Ext.data.proxy.LocalStorage": [
    "Ext.data.LocalStorageProxy"
  ],
  "Ext.fx.animation.Wipe": [
    "Ext.fx.animation.WipeIn"
  ],
  "Ext.fx.layout.Card": [],
  "Ext.Label": [],
  "Ext.TaskQueue": [],
  "Ext.util.translatable.CssTransform": [],
  "Ext.viewport.Ios": [],
  "Ext.Spacer": [],
  "Ext.mixin.Selectable": [],
  "Ext.draw.sprite.Image": [],
  "Ext.data.proxy.Rest": [
    "Ext.data.RestProxy"
  ],
  "Ext.Img": [],
  "Ext.chart.series.sprite.Bar": [],
  "Ext.log.writer.DocumentTitle": [],
  "Ext.data.Error": [],
  "Ext.util.Sorter": [],
  "Ext.draw.gradient.Radial": [],
  "Ext.layout.Abstract": [],
  "Ext.device.notification.Abstract": [],
  "Ext.log.filter.Filter": [],
  "Ext.device.camera.Sencha": [],
  "Ext.draw.sprite.Sprite": [],
  "Ext.draw.Color": [],
  "Ext.chart.series.Bar": [],
  "Ext.field.Slider": [
    "Ext.form.Slider"
  ],
  "Ext.field.Search": [
    "Ext.form.Search"
  ],
  "Ext.chart.series.Scatter": [],
  "Ext.device.Device": [],
  "Ext.event.Dispatcher": [],
  "Ext.data.Store": [],
  "Ext.draw.modifier.Highlight": [],
  "Ext.behavior.Translatable": [],
  "Ext.direct.Manager": [
    "Ext.Direct"
  ],
  "Ext.data.proxy.Proxy": [
    "Ext.data.DataProxy",
    "Ext.data.Proxy"
  ],
  "Ext.draw.modifier.Modifier": [],
  "Ext.navigation.View": [
    "Ext.NavigationView"
  ],
  "Ext.draw.modifier.Target": [],
  "Ext.draw.sprite.AttributeDefinition": [],
  "Ext.device.SQLite.SQLResultSetRowList": [],
  "Ext.device.Notification": [],
  "Ext.draw.Component": [],
  "Ext.layout.VBox": [],
  "Ext.slider.Thumb": [],
  "Ext.MessageBox": [],
  "Ext.dataview.IndexBar": [
    "Ext.IndexBar"
  ],
  "Ext.dataview.element.List": [],
  "Ext.layout.FlexBox": [],
  "Ext.field.Url": [
    "Ext.form.Url"
  ],
  "Ext.draw.Solver": [],
  "Ext.data.proxy.Memory": [
    "Ext.data.MemoryProxy"
  ],
  "Ext.chart.axis.Time": [],
  "Ext.layout.Card": [],
  "Ext.ComponentQuery": [],
  "Ext.chart.series.Pie3D": [],
  "Ext.device.camera.Abstract": [],
  "Ext.device.device.Sencha": [],
  "Ext.scroll.View": [
    "Ext.util.ScrollView"
  ],
  "Ext.draw.sprite.Rect": [],
  "Ext.util.Region": [],
  "Ext.field.Select": [
    "Ext.form.Select"
  ],
  "Ext.draw.Draw": [],
  "Ext.ItemCollection": [],
  "Ext.log.formatter.Default": [],
  "Ext.navigation.Bar": [],
  "Ext.chart.axis.layout.CombineDuplicate": [],
  "Ext.device.Geolocation": [],
  "Ext.chart.SpaceFillingChart": [],
  "Ext.data.proxy.SessionStorage": [
    "Ext.data.SessionStorageProxy"
  ],
  "Ext.fx.easing.EaseIn": [],
  "Ext.draw.sprite.AnimationParser": [],
  "Ext.field.Password": [
    "Ext.form.Password"
  ],
  "Ext.device.connection.Abstract": [],
  "Ext.direct.Event": [],
  "Ext.direct.RemotingMethod": [],
  "Ext.Evented": [
    "Ext.EventedBase"
  ],
  "Ext.carousel.Indicator": [
    "Ext.Carousel.Indicator"
  ],
  "Ext.util.Collection": [],
  "Ext.chart.interactions.ItemInfo": [],
  "Ext.chart.MarkerHolder": [],
  "Ext.carousel.Carousel": [
    "Ext.Carousel"
  ],
  "Ext.Audio": [],
  "Ext.device.Contacts": [],
  "Ext.table.Table": [],
  "Ext.draw.engine.SvgContext.Gradient": [],
  "Ext.chart.axis.layout.Layout": [],
  "Ext.data.Errors": [],
  "Ext.field.Text": [
    "Ext.form.Text"
  ],
  "Ext.field.TextAreaInput": [],
  "Ext.field.DatePicker": [
    "Ext.form.DatePicker"
  ],
  "Ext.draw.engine.Svg": [],
  "Ext.event.recognizer.Tap": [],
  "Ext.device.orientation.Abstract": [],
  "Ext.AbstractManager": [],
  "Ext.chart.series.Radar": [],
  "Ext.chart.interactions.Abstract": [],
  "Ext.scroll.indicator.CssTransform": [],
  "Ext.util.PaintMonitor": [],
  "Ext.direct.PollingProvider": [],
  "Ext.device.notification.PhoneGap": [],
  "Ext.data.writer.Xml": [
    "Ext.data.XmlWriter"
  ],
  "Ext.event.recognizer.SingleTouch": [],
  "Ext.draw.sprite.Instancing": [],
  "Ext.event.publisher.ComponentDelegation": [],
  "Ext.chart.axis.Numeric": [],
  "Ext.field.Toggle": [
    "Ext.form.Toggle"
  ],
  "Ext.fx.layout.card.ScrollReveal": [],
  "Ext.data.Operation": [],
  "Ext.scroll.indicator.Rounded": [],
  "Ext.fx.animation.Abstract": [],
  "Ext.chart.interactions.Rotate": [],
  "Ext.draw.engine.SvgContext": [],
  "Ext.scroll.Scroller": [],
  "Ext.util.SizeMonitor": [],
  "Ext.event.ListenerStack": [],
  "Ext.util.MixedCollection": []
});
Ext.ClassManager.addNameAliasMappings({
  "Ext.app.Profile": [],
  "Ext.event.recognizer.MultiTouch": [],
  "Ext.fx.Runner": [],
  "Ext.chart.grid.CircularGrid": [
    "grid.circular"
  ],
  "Ext.mixin.Templatable": [],
  "Ext.event.recognizer.Pinch": [],
  "Ext.util.Format": [],
  "Ext.direct.JsonProvider": [
    "direct.jsonprovider"
  ],
  "Ext.data.identifier.Simple": [
    "data.identifier.simple"
  ],
  "Ext.dataview.DataView": [
    "widget.dataview"
  ],
  "Ext.field.Hidden": [
    "widget.hiddenfield"
  ],
  "Ext.device.SQLite.SQLTransaction": [],
  "Ext.field.Number": [
    "widget.numberfield"
  ],
  "Ext.chart.series.CandleStick": [
    "series.candlestick"
  ],
  "Ext.device.Connection": [],
  "Ext.data.Model": [],
  "Ext.data.reader.Reader": [],
  "Ext.Sheet": [
    "widget.sheet"
  ],
  "Ext.tab.Tab": [
    "widget.tab"
  ],
  "Ext.chart.series.sprite.StackedCartesian": [],
  "Ext.util.Grouper": [],
  "Ext.util.translatable.CssPosition": [],
  "Ext.util.paintmonitor.Abstract": [],
  "Ext.direct.RemotingProvider": [
    "direct.remotingprovider"
  ],
  "Ext.data.NodeInterface": [],
  "Ext.chart.interactions.PanZoom": [
    "interaction.panzoom"
  ],
  "Ext.util.PositionMap": [],
  "Ext.chart.series.ItemPublisher": [],
  "Ext.util.Sortable": [],
  "Ext.chart.series.sprite.AbstractRadial": [],
  "Ext.fx.runner.Css": [],
  "Ext.fx.runner.CssTransition": [],
  "Ext.draw.Group": [],
  "Ext.XTemplateCompiler": [],
  "Ext.util.Wrapper": [],
  "Ext.app.Router": [],
  "Ext.direct.Transaction": [
    "direct.transaction"
  ],
  "Ext.util.Offset": [],
  "Ext.device.device.Abstract": [],
  "Ext.mixin.Mixin": [],
  "Ext.fx.animation.FadeOut": [
    "animation.fadeOut"
  ],
  "Ext.util.Geolocation": [],
  "Ext.ComponentManager": [],
  "Ext.util.sizemonitor.OverflowChange": [],
  "Ext.event.publisher.ElementSize": [],
  "Ext.tab.Bar": [
    "widget.tabbar"
  ],
  "Ext.event.Dom": [],
  "Ext.app.Application": [],
  "Ext.dataview.List": [
    "widget.list"
  ],
  "Ext.util.translatable.Dom": [],
  "Ext.fx.layout.card.Scroll": [
    "fx.layout.card.scroll"
  ],
  "Ext.draw.LimitedCache": [],
  "Ext.device.geolocation.Sencha": [],
  "Ext.dataview.component.SimpleListItem": [
    "widget.simplelistitem"
  ],
  "Ext.dataview.ListItemHeader": [
    "widget.listitemheader"
  ],
  "Ext.event.publisher.TouchGesture": [],
  "Ext.AnimationQueue": [],
  "Ext.data.SortTypes": [],
  "Ext.device.contacts.Abstract": [],
  "Ext.device.push.Sencha": [],
  "Ext.fx.animation.WipeOut": [],
  "Ext.slider.Slider": [
    "widget.slider"
  ],
  "Ext.Component": [
    "widget.component"
  ],
  "Ext.device.communicator.Default": [],
  "Ext.fx.runner.CssAnimation": [],
  "Ext.chart.axis.Axis": [
    "widget.axis"
  ],
  "Ext.fx.animation.Cube": [
    "animation.cube"
  ],
  "Ext.chart.Markers": [],
  "Ext.chart.series.sprite.Radar": [
    "sprite.radar"
  ],
  "Ext.device.device.Simulator": [],
  "Ext.Ajax": [],
  "Ext.dataview.component.ListItem": [
    "widget.listitem"
  ],
  "Ext.util.Filter": [],
  "Ext.layout.wrapper.Inner": [],
  "Ext.draw.Animator": [],
  "Ext.device.geolocation.Simulator": [],
  "Ext.data.association.BelongsTo": [
    "association.belongsto"
  ],
  "Ext.draw.Surface": [
    "widget.surface"
  ],
  "Ext.scroll.indicator.ScrollPosition": [],
  "Ext.field.Email": [
    "widget.emailfield"
  ],
  "Ext.fx.layout.card.Abstract": [],
  "Ext.event.Controller": [],
  "Ext.dataview.component.Container": [],
  "Ext.log.writer.Remote": [],
  "Ext.fx.layout.card.Style": [],
  "Ext.device.purchases.Sencha": [],
  "Ext.chart.axis.segmenter.Segmenter": [],
  "Ext.viewport.Android": [],
  "Ext.log.formatter.Identity": [],
  "Ext.chart.interactions.ItemHighlight": [
    "interaction.itemhighlight"
  ],
  "Ext.picker.Picker": [
    "widget.picker"
  ],
  "Ext.data.Batch": [],
  "Ext.draw.modifier.Animation": [
    "modifier.animation"
  ],
  "Ext.chart.AbstractChart": [],
  "Ext.field.File": [
    "widget.file"
  ],
  "Ext.tab.Panel": [
    "widget.tabpanel"
  ],
  "Ext.draw.Path": [],
  "Ext.util.sizemonitor.Default": [],
  "Ext.fx.animation.SlideOut": [
    "animation.slideOut"
  ],
  "Ext.device.connection.Sencha": [],
  "Ext.fx.layout.card.Pop": [
    "fx.layout.card.pop"
  ],
  "Ext.chart.axis.layout.Discrete": [
    "axisLayout.discrete"
  ],
  "Ext.data.Field": [
    "data.field"
  ],
  "Ext.chart.series.Gauge": [
    "series.gauge"
  ],
  "Ext.data.StoreManager": [],
  "Ext.fx.animation.PopOut": [
    "animation.popOut"
  ],
  "Ext.chart.label.Callout": [],
  "Ext.device.push.Abstract": [],
  "Ext.util.DelayedTask": [],
  "Ext.fx.easing.Momentum": [],
  "Ext.device.sqlite.Sencha": [],
  "Ext.fx.easing.Abstract": [],
  "Ext.Title": [
    "widget.title"
  ],
  "Ext.event.recognizer.Drag": [],
  "Ext.field.TextArea": [
    "widget.textareafield"
  ],
  "Ext.fx.Easing": [],
  "Ext.chart.series.sprite.Scatter": [
    "sprite.scatterSeries"
  ],
  "Ext.picker.Date": [
    "widget.datepicker"
  ],
  "Ext.data.reader.Array": [
    "reader.array"
  ],
  "Ext.data.proxy.JsonP": [
    "proxy.jsonp",
    "proxy.scripttag"
  ],
  "Ext.device.communicator.Android": [],
  "Ext.chart.series.Area": [
    "series.area"
  ],
  "Ext.device.device.PhoneGap": [],
  "Ext.field.Checkbox": [
    "widget.checkboxfield"
  ],
  "Ext.chart.Legend": [
    "widget.legend"
  ],
  "Ext.Media": [
    "widget.media"
  ],
  "Ext.TitleBar": [
    "widget.titlebar"
  ],
  "Ext.chart.interactions.RotatePie3D": [
    "interaction.rotatePie3d"
  ],
  "Ext.draw.gradient.Linear": [],
  "Ext.util.TapRepeater": [],
  "Ext.event.Touch": [],
  "Ext.mixin.Bindable": [],
  "Ext.data.proxy.Server": [
    "proxy.server"
  ],
  "Ext.chart.series.Cartesian": [],
  "Ext.util.sizemonitor.Scroll": [],
  "Ext.data.ResultSet": [],
  "Ext.data.association.HasMany": [
    "association.hasmany"
  ],
  "Ext.draw.TimingFunctions": [],
  "Ext.draw.engine.Canvas": [],
  "Ext.data.proxy.Ajax": [
    "proxy.ajax"
  ],
  "Ext.fx.animation.Fade": [
    "animation.fade",
    "animation.fadeIn"
  ],
  "Ext.layout.Default": [
    "layout.auto",
    "layout.default"
  ],
  "Ext.util.paintmonitor.CssAnimation": [],
  "Ext.data.writer.Writer": [
    "writer.base"
  ],
  "Ext.event.recognizer.Recognizer": [],
  "Ext.form.FieldSet": [
    "widget.fieldset"
  ],
  "Ext.scroll.Indicator": [],
  "Ext.XTemplateParser": [],
  "Ext.behavior.Scrollable": [],
  "Ext.chart.series.sprite.CandleStick": [
    "sprite.candlestickSeries"
  ],
  "Ext.data.JsonP": [],
  "Ext.device.connection.PhoneGap": [],
  "Ext.event.publisher.Dom": [],
  "Ext.fx.layout.card.Fade": [
    "fx.layout.card.fade"
  ],
  "Ext.app.Controller": [],
  "Ext.fx.State": [],
  "Ext.layout.wrapper.BoxDock": [],
  "Ext.chart.series.sprite.Pie3DPart": [
    "sprite.pie3dPart"
  ],
  "Ext.viewport.Default": [
    "widget.viewport"
  ],
  "Ext.layout.HBox": [
    "layout.hbox"
  ],
  "Ext.data.ModelManager": [],
  "Ext.data.Validations": [],
  "Ext.util.translatable.Abstract": [],
  "Ext.scroll.indicator.Abstract": [],
  "Ext.Button": [
    "widget.button"
  ],
  "Ext.field.Radio": [
    "widget.radiofield"
  ],
  "Ext.util.HashMap": [],
  "Ext.field.Input": [
    "widget.input"
  ],
  "Ext.device.Camera": [],
  "Ext.mixin.Filterable": [],
  "Ext.draw.TextMeasurer": [],
  "Ext.device.SQLite.SQLResultSet": [],
  "Ext.dataview.element.Container": [],
  "Ext.chart.series.sprite.PieSlice": [
    "sprite.pieslice"
  ],
  "Ext.data.Connection": [],
  "Ext.direct.ExceptionEvent": [
    "direct.exception"
  ],
  "Ext.Panel": [
    "widget.panel"
  ],
  "Ext.data.association.HasOne": [
    "association.hasone"
  ],
  "Ext.device.geolocation.Abstract": [],
  "Ext.viewport.WindowsPhone": [],
  "Ext.ActionSheet": [
    "widget.actionsheet"
  ],
  "Ext.layout.Box": [
    "layout.tablebox"
  ],
  "Ext.Video": [
    "widget.video"
  ],
  "Ext.chart.series.Line": [
    "series.line"
  ],
  "Ext.fx.layout.card.Cube": [
    "fx.layout.card.cube"
  ],
  "Ext.event.recognizer.HorizontalSwipe": [],
  "Ext.data.writer.Json": [
    "writer.json"
  ],
  "Ext.layout.Fit": [
    "layout.fit"
  ],
  "Ext.fx.animation.Slide": [
    "animation.slide",
    "animation.slideIn"
  ],
  "Ext.device.Purchases.Purchase": [],
  "Ext.table.Row": [
    "widget.tablerow"
  ],
  "Ext.log.formatter.Formatter": [],
  "Ext.Container": [
    "widget.container"
  ],
  "Ext.fx.animation.Pop": [
    "animation.pop",
    "animation.popIn"
  ],
  "Ext.draw.sprite.Circle": [
    "sprite.circle"
  ],
  "Ext.fx.layout.card.Reveal": [
    "fx.layout.card.reveal"
  ],
  "Ext.fx.layout.card.Cover": [
    "fx.layout.card.cover"
  ],
  "Ext.log.Base": [],
  "Ext.data.reader.Xml": [
    "reader.xml"
  ],
  "Ext.event.publisher.ElementPaint": [],
  "Ext.chart.axis.Category": [
    "axis.category"
  ],
  "Ext.data.reader.Json": [
    "reader.json"
  ],
  "Ext.Decorator": [],
  "Ext.data.TreeStore": [
    "store.tree"
  ],
  "Ext.device.Purchases": [],
  "Ext.device.orientation.HTML5": [],
  "Ext.draw.gradient.Gradient": [],
  "Ext.event.recognizer.DoubleTap": [],
  "Ext.log.Logger": [],
  "Ext.picker.Slot": [
    "widget.pickerslot"
  ],
  "Ext.device.notification.Simulator": [],
  "Ext.field.Field": [
    "widget.field"
  ],
  "Ext.log.filter.Priority": [],
  "Ext.util.sizemonitor.Abstract": [],
  "Ext.device.SQLite.Database": [],
  "Ext.chart.series.sprite.Polar": [],
  "Ext.util.paintmonitor.OverflowChange": [],
  "Ext.util.LineSegment": [],
  "Ext.SegmentedButton": [
    "widget.segmentedbutton"
  ],
  "Ext.Sortable": [],
  "Ext.fx.easing.Linear": [
    "easing.linear"
  ],
  "Ext.chart.series.sprite.Aggregative": [],
  "Ext.dom.CompositeElement": [],
  "Ext.data.identifier.Uuid": [
    "data.identifier.uuid"
  ],
  "Ext.data.proxy.Client": [],
  "Ext.util.InputBlocker": [],
  "Ext.fx.easing.Bounce": [],
  "Ext.data.Types": [],
  "Ext.chart.series.sprite.Cartesian": [],
  "Ext.app.Action": [],
  "Ext.util.Translatable": [],
  "Ext.device.camera.PhoneGap": [],
  "Ext.draw.sprite.Path": [
    "sprite.path"
  ],
  "Ext.LoadMask": [
    "widget.loadmask"
  ],
  "Ext.data.association.Association": [],
  "Ext.chart.axis.sprite.Axis": [],
  "Ext.behavior.Draggable": [],
  "Ext.chart.grid.RadialGrid": [
    "grid.radial"
  ],
  "Ext.util.TranslatableGroup": [],
  "Ext.fx.Animation": [],
  "Ext.draw.sprite.Ellipse": [
    "sprite.ellipse"
  ],
  "Ext.util.Inflector": [],
  "Ext.Map": [
    "widget.map"
  ],
  "Ext.XTemplate": [],
  "Ext.data.NodeStore": [
    "store.node"
  ],
  "Ext.draw.sprite.AttributeParser": [],
  "Ext.form.Panel": [
    "widget.formpanel"
  ],
  "Ext.chart.series.Series": [],
  "Ext.data.Request": [],
  "Ext.draw.sprite.Text": [
    "sprite.text"
  ],
  "Ext.layout.Float": [
    "layout.float"
  ],
  "Ext.dataview.component.DataItem": [
    "widget.dataitem"
  ],
  "Ext.chart.CartesianChart": [
    "Ext.chart.Chart",
    "widget.chart"
  ],
  "Ext.data.proxy.WebStorage": [],
  "Ext.log.writer.Writer": [],
  "Ext.device.Communicator": [],
  "Ext.fx.animation.Flip": [
    "animation.flip"
  ],
  "Ext.util.Point": [],
  "Ext.chart.series.StackedCartesian": [],
  "Ext.fx.layout.card.Slide": [
    "fx.layout.card.slide"
  ],
  "Ext.Anim": [],
  "Ext.field.DatePickerNative": [
    "widget.datepickernativefield"
  ],
  "Ext.data.DirectStore": [
    "store.direct"
  ],
  "Ext.dataview.NestedList": [
    "widget.nestedlist"
  ],
  "Ext.app.Route": [],
  "Ext.device.connection.Simulator": [],
  "Ext.chart.PolarChart": [
    "widget.polar"
  ],
  "Ext.event.publisher.ComponentSize": [],
  "Ext.slider.Toggle": [],
  "Ext.data.identifier.Sequential": [
    "data.identifier.sequential"
  ],
  "Ext.AbstractComponent": [],
  "Ext.Template": [],
  "Ext.device.Push": [],
  "Ext.fx.easing.BoundMomentum": [],
  "Ext.viewport.Viewport": [],
  "Ext.event.recognizer.VerticalSwipe": [],
  "Ext.BingMap": [
    "widget.bingmap"
  ],
  "Ext.chart.series.Polar": [],
  "Ext.event.Event": [],
  "Ext.behavior.Behavior": [],
  "Ext.chart.grid.VerticalGrid": [
    "grid.vertical"
  ],
  "Ext.chart.label.Label": [],
  "Ext.draw.sprite.EllipticalArc": [
    "sprite.ellipticalArc"
  ],
  "Ext.fx.easing.EaseOut": [
    "easing.ease-out"
  ],
  "Ext.Toolbar": [
    "widget.toolbar"
  ],
  "Ext.event.recognizer.LongPress": [],
  "Ext.device.notification.Sencha": [],
  "Ext.chart.series.sprite.Line": [
    "sprite.lineSeries"
  ],
  "Ext.data.ArrayStore": [
    "store.array"
  ],
  "Ext.event.recognizer.Rotate": [],
  "Ext.mixin.Sortable": [],
  "Ext.fx.layout.card.Flip": [
    "fx.layout.card.flip"
  ],
  "Ext.chart.interactions.CrossZoom": [
    "interaction.crosszoom"
  ],
  "Ext.event.publisher.ComponentPaint": [],
  "Ext.util.TranslatableList": [],
  "Ext.carousel.Item": [],
  "Ext.event.recognizer.Swipe": [],
  "Ext.util.translatable.ScrollPosition": [],
  "Ext.device.camera.Simulator": [],
  "Ext.chart.series.sprite.Area": [
    "sprite.areaSeries"
  ],
  "Ext.event.recognizer.Touch": [],
  "Ext.plugin.ListPaging": [
    "plugin.listpaging"
  ],
  "Ext.draw.sprite.Sector": [
    "sprite.sector"
  ],
  "Ext.chart.axis.segmenter.Names": [
    "segmenter.names"
  ],
  "Ext.mixin.Observable": [],
  "Ext.carousel.Infinite": [],
  "Ext.draw.Matrix": [],
  "Ext.Mask": [
    "widget.mask"
  ],
  "Ext.event.publisher.Publisher": [],
  "Ext.layout.wrapper.Dock": [],
  "Ext.app.History": [],
  "Ext.data.proxy.Direct": [
    "proxy.direct"
  ],
  "Ext.chart.axis.layout.Continuous": [
    "axisLayout.continuous"
  ],
  "Ext.data.proxy.Sql": [
    "proxy.sql"
  ],
  "Ext.table.Cell": [
    "widget.tablecell"
  ],
  "Ext.fx.layout.card.ScrollCover": [
    "fx.layout.card.scrollcover"
  ],
  "Ext.device.orientation.Sencha": [],
  "Ext.util.Droppable": [],
  "Ext.draw.sprite.Composite": [
    "sprite.composite"
  ],
  "Ext.chart.series.Pie": [
    "series.pie"
  ],
  "Ext.device.Purchases.Product": [],
  "Ext.device.Orientation": [],
  "Ext.direct.Provider": [
    "direct.provider"
  ],
  "Ext.draw.sprite.Arc": [
    "sprite.arc"
  ],
  "Ext.chart.axis.segmenter.Time": [
    "segmenter.time"
  ],
  "Ext.util.Draggable": [],
  "Ext.device.contacts.Sencha": [],
  "Ext.chart.grid.HorizontalGrid": [
    "grid.horizontal"
  ],
  "Ext.mixin.Traversable": [],
  "Ext.util.AbstractMixedCollection": [],
  "Ext.data.JsonStore": [
    "store.json"
  ],
  "Ext.draw.SegmentTree": [],
  "Ext.direct.RemotingEvent": [
    "direct.rpc"
  ],
  "Ext.device.SQLite": [],
  "Ext.plugin.PullRefresh": [
    "plugin.pullrefresh"
  ],
  "Ext.log.writer.Console": [],
  "Ext.field.Spinner": [
    "widget.spinnerfield"
  ],
  "Ext.chart.axis.segmenter.Numeric": [
    "segmenter.numeric"
  ],
  "Ext.data.proxy.LocalStorage": [
    "proxy.localstorage"
  ],
  "Ext.fx.animation.Wipe": [],
  "Ext.fx.layout.Card": [],
  "Ext.Label": [
    "widget.label"
  ],
  "Ext.TaskQueue": [],
  "Ext.util.translatable.CssTransform": [],
  "Ext.viewport.Ios": [],
  "Ext.Spacer": [
    "widget.spacer"
  ],
  "Ext.mixin.Selectable": [],
  "Ext.draw.sprite.Image": [
    "sprite.image"
  ],
  "Ext.data.proxy.Rest": [
    "proxy.rest"
  ],
  "Ext.Img": [
    "widget.image",
    "widget.img"
  ],
  "Ext.chart.series.sprite.Bar": [
    "sprite.barSeries"
  ],
  "Ext.log.writer.DocumentTitle": [],
  "Ext.data.Error": [],
  "Ext.util.Sorter": [],
  "Ext.draw.gradient.Radial": [],
  "Ext.layout.Abstract": [],
  "Ext.device.notification.Abstract": [],
  "Ext.log.filter.Filter": [],
  "Ext.device.camera.Sencha": [],
  "Ext.draw.sprite.Sprite": [
    "sprite.sprite"
  ],
  "Ext.draw.Color": [],
  "Ext.chart.series.Bar": [
    "series.bar"
  ],
  "Ext.field.Slider": [
    "widget.sliderfield"
  ],
  "Ext.field.Search": [
    "widget.searchfield"
  ],
  "Ext.chart.series.Scatter": [
    "series.scatter"
  ],
  "Ext.device.Device": [],
  "Ext.event.Dispatcher": [],
  "Ext.data.Store": [
    "store.store"
  ],
  "Ext.draw.modifier.Highlight": [
    "modifier.highlight"
  ],
  "Ext.behavior.Translatable": [],
  "Ext.direct.Manager": [],
  "Ext.data.proxy.Proxy": [
    "proxy.proxy"
  ],
  "Ext.draw.modifier.Modifier": [],
  "Ext.navigation.View": [
    "widget.navigationview"
  ],
  "Ext.draw.modifier.Target": [
    "modifier.target"
  ],
  "Ext.draw.sprite.AttributeDefinition": [],
  "Ext.device.SQLite.SQLResultSetRowList": [],
  "Ext.device.Notification": [],
  "Ext.draw.Component": [
    "widget.draw"
  ],
  "Ext.layout.VBox": [
    "layout.vbox"
  ],
  "Ext.slider.Thumb": [
    "widget.thumb"
  ],
  "Ext.MessageBox": [],
  "Ext.dataview.IndexBar": [],
  "Ext.dataview.element.List": [],
  "Ext.layout.FlexBox": [
    "layout.box"
  ],
  "Ext.field.Url": [
    "widget.urlfield"
  ],
  "Ext.draw.Solver": [],
  "Ext.data.proxy.Memory": [
    "proxy.memory"
  ],
  "Ext.chart.axis.Time": [
    "axis.time"
  ],
  "Ext.layout.Card": [
    "layout.card"
  ],
  "Ext.ComponentQuery": [],
  "Ext.chart.series.Pie3D": [
    "series.pie3d"
  ],
  "Ext.device.camera.Abstract": [],
  "Ext.device.device.Sencha": [],
  "Ext.scroll.View": [],
  "Ext.draw.sprite.Rect": [
    "sprite.rect"
  ],
  "Ext.util.Region": [],
  "Ext.field.Select": [
    "widget.selectfield"
  ],
  "Ext.draw.Draw": [],
  "Ext.ItemCollection": [],
  "Ext.log.formatter.Default": [],
  "Ext.navigation.Bar": [],
  "Ext.chart.axis.layout.CombineDuplicate": [
    "axisLayout.combineDuplicate"
  ],
  "Ext.device.Geolocation": [],
  "Ext.chart.SpaceFillingChart": [
    "widget.spacefilling"
  ],
  "Ext.data.proxy.SessionStorage": [
    "proxy.sessionstorage"
  ],
  "Ext.fx.easing.EaseIn": [
    "easing.ease-in"
  ],
  "Ext.draw.sprite.AnimationParser": [],
  "Ext.field.Password": [
    "widget.passwordfield"
  ],
  "Ext.device.connection.Abstract": [],
  "Ext.direct.Event": [
    "direct.event"
  ],
  "Ext.direct.RemotingMethod": [],
  "Ext.Evented": [],
  "Ext.carousel.Indicator": [
    "widget.carouselindicator"
  ],
  "Ext.util.Collection": [],
  "Ext.chart.interactions.ItemInfo": [
    "interaction.iteminfo"
  ],
  "Ext.chart.MarkerHolder": [],
  "Ext.carousel.Carousel": [
    "widget.carousel"
  ],
  "Ext.Audio": [
    "widget.audio"
  ],
  "Ext.device.Contacts": [],
  "Ext.table.Table": [
    "widget.table"
  ],
  "Ext.draw.engine.SvgContext.Gradient": [],
  "Ext.chart.axis.layout.Layout": [],
  "Ext.data.Errors": [],
  "Ext.field.Text": [
    "widget.textfield"
  ],
  "Ext.field.TextAreaInput": [
    "widget.textareainput"
  ],
  "Ext.field.DatePicker": [
    "widget.datepickerfield"
  ],
  "Ext.draw.engine.Svg": [],
  "Ext.event.recognizer.Tap": [],
  "Ext.device.orientation.Abstract": [],
  "Ext.AbstractManager": [],
  "Ext.chart.series.Radar": [
    "series.radar"
  ],
  "Ext.chart.interactions.Abstract": [
    "widget.interaction"
  ],
  "Ext.scroll.indicator.CssTransform": [],
  "Ext.util.PaintMonitor": [],
  "Ext.direct.PollingProvider": [
    "direct.pollingprovider"
  ],
  "Ext.device.notification.PhoneGap": [],
  "Ext.data.writer.Xml": [
    "writer.xml"
  ],
  "Ext.event.recognizer.SingleTouch": [],
  "Ext.draw.sprite.Instancing": [
    "sprite.instancing"
  ],
  "Ext.event.publisher.ComponentDelegation": [],
  "Ext.chart.axis.Numeric": [
    "axis.numeric"
  ],
  "Ext.field.Toggle": [
    "widget.togglefield"
  ],
  "Ext.fx.layout.card.ScrollReveal": [
    "fx.layout.card.scrollreveal"
  ],
  "Ext.data.Operation": [],
  "Ext.scroll.indicator.Rounded": [],
  "Ext.fx.animation.Abstract": [],
  "Ext.chart.interactions.Rotate": [
    "interaction.rotate"
  ],
  "Ext.draw.engine.SvgContext": [],
  "Ext.scroll.Scroller": [],
  "Ext.util.SizeMonitor": [],
  "Ext.event.ListenerStack": [],
  "Ext.util.MixedCollection": []
});
