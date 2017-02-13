(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = {
	Footer: require('./views/templates/Footer'),
	Header: require('./views/templates/Header'),
	Home: require('./views/templates/Home'),
	ItemList: require('./views/templates/ItemList'),
	LocalBusiness: require('./views/templates/LocalBusiness'),
	MediaObject: require('./views/templates/MediaObject'),
	SiteNavigationElement: require('./views/templates/SiteNavigationElement')
};

},{"./views/templates/Footer":20,"./views/templates/Header":21,"./views/templates/Home":22,"./views/templates/ItemList":23,"./views/templates/LocalBusiness":24,"./views/templates/MediaObject":25,"./views/templates/SiteNavigationElement":26}],2:[function(require,module,exports){
'use strict';

module.exports = {
	Footer: require('./views/Footer'),
	Header: require('./views/Header'),
	Home: require('./views/Home'),
	ItemList: require('./views/ItemList'),
	LocalBusiness: require('./views/LocalBusiness'),
	MediaObject: require('./views/MediaObject'),
	SiteNavigationElement: require('./views/SiteNavigationElement'),
	WebPageElement: require('./views/WebPageElement')
};

},{"./views/Footer":10,"./views/Header":11,"./views/Home":12,"./views/ItemList":13,"./views/LocalBusiness":14,"./views/MediaObject":15,"./views/SiteNavigationElement":16,"./views/WebPageElement":17}],3:[function(require,module,exports){
window.cookieName = 'hazy'

},{}],4:[function(require,module,exports){
'use strict';

module.exports = Object.create(Object.assign({}, require('../../lib/MyObject'), {

    Request: {
        constructor: function constructor(data) {
            var _this = this;

            var req = new XMLHttpRequest();

            return new Promise(function (resolve, reject) {

                req.onload = function () {
                    [500, 404, 401].includes(this.status) ? reject(this.response) : resolve(JSON.parse(this.response));
                };

                if (data.method === "get") {
                    var qs = data.qs ? '?' + data.qs : '';
                    req.open(data.method, '/' + data.resource + qs);
                    _this.setHeaders(req, data.headers);
                    req.send(null);
                } else {
                    req.open(data.method, '/' + data.resource, true);
                    _this.setHeaders(req, data.headers);
                    req.send(data.data);
                }
            });
        },
        plainEscape: function plainEscape(sText) {
            /* how should I treat a text/plain form encoding? what characters are not allowed? this is what I suppose...: */
            /* "4\3\7 - Einstein said E=mc2" ----> "4\\3\\7\ -\ Einstein\ said\ E\=mc2" */
            return sText.replace(/[\s\=\\]/g, "\\$&");
        },
        setHeaders: function setHeaders(req) {
            var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            req.setRequestHeader("Accept", headers.accept || 'application/json');
            req.setRequestHeader("Content-Type", 'text/plain');
        }
    },

    _factory: function _factory(data) {
        return Object.create(this.Request, {}).constructor(data);
    },
    constructor: function constructor() {

        if (!XMLHttpRequest.prototype.sendAsBinary) {
            XMLHttpRequest.prototype.sendAsBinary = function (sData) {
                var nBytes = sData.length,
                    ui8Data = new Uint8Array(nBytes);
                for (var nIdx = 0; nIdx < nBytes; nIdx++) {
                    ui8Data[nIdx] = sData.charCodeAt(nIdx) & 0xff;
                }
                this.send(ui8Data);
            };
        }

        return this._factory.bind(this);
    }
}), {}).constructor();

},{"../../lib/MyObject":28}],5:[function(require,module,exports){
'use strict';

module.exports = Object.create({
    create: function create(name, opts) {
        name = name.charAt(0).toUpperCase() + name.slice(1);
        return Object.create(this.Views[name], Object.assign({
            name: { value: name },
            factory: { value: this },
            template: { value: this.Templates[name] },
            user: { value: this.User }
        }, opts)).constructor().on('navigate', function (route) {
            return require('../router').navigate(route);
        });
    }
}, {
    Templates: { value: require('../.TemplateMap') },
    User: { value: require('../models/User') },
    Views: { value: require('../.ViewMap') }
});

},{"../.TemplateMap":1,"../.ViewMap":2,"../models/User":7,"../router":9}],6:[function(require,module,exports){
'use strict';

window.onload = function () {
    require('./.env');
    require('./router').initialize();
};

},{"./.env":3,"./router":9}],7:[function(require,module,exports){
'use strict';

module.exports = Object.create(require('./__proto__.js'), { resource: { value: 'me' } });

},{"./__proto__.js":8}],8:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('../../../lib/MyObject'), require('events').EventEmitter.prototype, {

    Xhr: require('../Xhr'),

    get: function get() {
        var _this = this;

        var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        return this.Xhr({ method: 'get', resource: this.resource, headers: this.headers || {}, qs: opts.query ? JSON.stringify(opts.query) : undefined }).then(function (response) {
            return Promise.resolve(_this.data = response);
        });
    }
});

},{"../../../lib/MyObject":28,"../Xhr":4,"events":29}],9:[function(require,module,exports){
'use strict';

module.exports = Object.create({

    Error: require('../../lib/MyError'),

    User: require('./models/User'),

    ViewFactory: require('./factory/View'),

    initialize: function initialize() {
        var _this = this;

        this.contentContainer = document.querySelector('#content');

        window.onpopstate = this.handle.bind(this);

        this.header = this.ViewFactory.create('header', { insertion: { value: { el: this.contentContainer, method: 'insertBefore' } } });
        this.footer = this.ViewFactory.create('footer', { insertion: { value: { el: this.contentContainer.parentNode } } });

        this.User.get().then(function () {

            _this.header.onUser().on('signout', function () {
                return Promise.all(Object.keys(_this.views).map(function (name) {
                    return _this.views[name].delete();
                })).then(function () {
                    return _this.navigate('home');
                });
            });

            _this.handle();
        }).catch(this.Error);

        return this;
    },
    handle: function handle() {
        this.handler(window.location.pathname.split('/').slice(1));
    },
    handler: function handler(path) {
        var view = /verify/.test(path) ? 'verify' : 'home';

        if (this.views[view]) return this.views[view].navigate(path);

        return Promise.resolve(this.views[view] = this.ViewFactory.create(view, {
            insertion: { value: { el: this.contentContainer } },
            path: { value: path, writable: true }
        }));
    },
    navigate: function navigate(location) {
        history.pushState({}, '', location);
        this.handle();
    }
}, { views: { value: {} } });

},{"../../lib/MyError":27,"./factory/View":5,"./models/User":7}],10:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./WebPageElement'), {});

},{"./WebPageElement":17}],11:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./WebPageElement'), {

    events: {
        signoutBtn: 'click'
    },

    onUser: function onUser() {
        return this;
    },


    requiresLogin: false,

    signout: function signout() {

        document.cookie = window.cookieName + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

        this.user.data = {};

        this.emit('signout');
    }
});

},{"./WebPageElement":17}],12:[function(require,module,exports){
"use strict";

module.exports = Object.assign({}, require('./__proto__'), {
    fetchAndDisplay: function fetchAndDisplay() {
        var _this = this;

        return this.getData().then(function () {
            return _this.views[_this.model.data["@type"]] = _this.factory.create(_this.model.data["@type"], { insertion: { value: { el: _this.els.subView } }, model: { value: _this.model } });
        });
    },
    getData: function getData() {
        if (!this.model) this.model = Object.create(this.Model);

        this.model.resource = this.path.length ? this.path.join('/') : '';
        return this.model.get();
    },
    navigate: function navigate(path) {
        var _this2 = this;

        this.path = path;

        (this.model ? this.views[this.model.data["@type"]].delete() : Promise.resolve()).then(function () {
            return _this2.fetchAndDisplay();
        }).catch(this.Error);
    },
    postRender: function postRender() {
        //this.fetchAndDisplay().catch( this.Error )
        return this;
    }
});

},{"./__proto__":18}],13:[function(require,module,exports){
"use strict";

module.exports = Object.assign({}, require('./__proto__'), {
    postRender: function postRender() {
        var _this = this;

        var children = this.els.container.children;
        this.model.data.itemListElement.forEach(function (item, i) {
            return _this.factory.create(item["@type"], { insertion: { value: { el: children[i] } }, model: { value: { data: item } } });
        });

        return this;
    }
});

},{"./__proto__":18}],14:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {});

},{"./__proto__":18}],15:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {});

},{"./__proto__":18}],16:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {});

},{"./__proto__":18}],17:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {
    fetchAndDisplay: function fetchAndDisplay() {
        var _this = this;

        return this.getData().then(function () {

            _this.factory.create(_this.model.data.mainEntity["@type"], { insertion: { value: { el: _this.els.container } }, model: { value: { data: _this.model.data.mainEntity } } });

            if (_this.model.data.image) _this.handleImage(_this.model.data.image);
        });
    },
    getData: function getData() {
        if (!this.model) this.model = Object.create(this.Model, { resource: { value: this.type }, headers: { value: { accept: 'application/ld+json' } } });

        return this.model.get({ query: { name: this.name } });
    },
    handleImage: function handleImage(url) {
        this.els.container.style.backgroundImage = 'url(' + url + ')';
    },
    postRender: function postRender() {
        this.fetchAndDisplay().catch(this.Error);
        return this;
    },


    type: 'WebPageElement'
});

},{"./__proto__":18}],18:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = Object.assign({}, require('../../../lib/MyObject'), require('events').EventEmitter.prototype, {

    Model: require('../models/__proto__.js'),

    OptimizedResize: require('./lib/OptimizedResize'),

    Xhr: require('../Xhr'),

    bindEvent: function bindEvent(key, event) {
        var _this = this;

        var els = Array.isArray(this.els[key]) ? this.els[key] : [this.els[key]];
        els.forEach(function (el) {
            return el.addEventListener(event || 'click', function (e) {
                return _this['on' + _this.capitalizeFirstLetter(key) + _this.capitalizeFirstLetter(event)](e);
            });
        });
    },


    capitalizeFirstLetter: function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    constructor: function constructor() {

        if (this.size) this.OptimizedResize.add(this.size);

        if (this.requiresLogin && (!this.user.data || !this.user.data.id)) return this.handleLogin();

        if (this.user.data && this.user.data.id && this.requiresRole && !this.hasPrivileges()) return this.showNoAccess();

        return Object.assign(this, { els: {}, slurp: { attr: 'data-js', view: 'data-view' }, views: {} }).render();
    },
    delegateEvents: function delegateEvents(key, el) {
        var _this2 = this;

        var type = _typeof(this.events[key]);

        if (type === "string") {
            this.bindEvent(key, this.events[key]);
        } else if (Array.isArray(this.events[key])) {
            this.events[key].forEach(function (eventObj) {
                return _this2.bindEvent(key, eventObj.event);
            });
        } else {
            this.bindEvent(key, this.events[key].event);
        }
    },
    delete: function _delete(duration) {
        var _this3 = this;

        return new Promise(function (resolve) {
            _this3.els.container.classList.add('hide');
            _this3.els.container.addEventListener('transitionend', function (e) {
                _this3.els.container.parentNode.removeChild(_this3.els.container);
                resolve(_this3.emit('removed'));
            }, true);
        });
    },


    events: {},

    getTemplateOptions: function getTemplateOptions() {
        return this.model ? this.model.data : {};
    },
    handleLogin: function handleLogin() {
        var _this4 = this;

        this.factory.create('login', { insertion: { value: { el: document.querySelector('#content') } } }).once("loggedIn", function () {
            return _this4.onLogin();
        });

        return this;
    },
    hasPrivilege: function hasPrivilege() {
        var _this5 = this;

        this.requiresRole && this.user.get('roles').find(function (role) {
            return role === _this5.requiresRole;
        }) === "undefined" ? false : true;
    },
    htmlToFragment: function htmlToFragment(str) {
        var range = document.createRange();
        // make the parent of the first div in the document becomes the context node
        range.selectNode(document.getElementsByTagName("div").item(0));
        return range.createContextualFragment(str);
    },
    isHidden: function isHidden() {
        return this.els.container.css('display') === 'none';
    },
    onLogin: function onLogin() {
        this.router.header.onUser(this.user);

        this[this.hasPrivileges() ? 'render' : 'showNoAccess']();
    },
    showNoAccess: function showNoAccess() {
        alert("No privileges, son");
        return this;
    },
    postRender: function postRender() {
        return this;
    },
    render: function render() {
        this.slurpTemplate({ template: this.template(this.getTemplateOptions()), insertion: this.insertion });

        if (this.size) this.size();

        return this.renderSubviews().postRender();
    },
    renderSubviews: function renderSubviews() {
        var _this6 = this;

        Object.keys(this.Views || []).forEach(function (key) {
            if (_this6.Views[key].el) {
                var opts = _this6.Views[key].opts;

                opts = opts ? (typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) === "object" ? opts : opts() : {};

                _this6.views[key] = _this6.factory.create(key, Object.assign({ insertion: { value: { el: _this6.Views[key].el, method: 'insertBefore' } } }, opts));
                _this6.Views[key].el.remove();
                _this6.Views[key].el = undefined;
            }
        });

        return this;
    },
    show: function show(duration) {
        var _this7 = this;

        return new Promise(function (resolve, reject) {
            return _this7.els.container.show(duration || 10, function () {
                if (_this7.size) {
                    _this7.size();
                }resolve();
            });
        });
    },
    slurpEl: function slurpEl(el) {
        var key = el.getAttribute(this.slurp.attr) || 'container';

        if (key === 'container') {
            el.classList.add(this.name);
            if (this.model && this.model.data && this.model.data.name && !/\s/.test(this.model.data.name)) el.classList.add(this.model.data.name);
        }

        this.els[key] = Array.isArray(this.els[key]) ? this.els[key].push(el) : this.els[key] !== undefined ? [this.els[key], el] : el;

        el.removeAttribute(this.slurp.attr);

        if (this.events[key]) this.delegateEvents(key, el);
    },
    slurpTemplate: function slurpTemplate(options) {
        var _this8 = this;

        var fragment = this.htmlToFragment(options.template),
            selector = '[' + this.slurp.attr + ']',
            viewSelector = '[' + this.slurp.view + ']';

        this.slurpEl(fragment.querySelector('*'));
        fragment.querySelectorAll(selector + ', ' + viewSelector).forEach(function (el) {
            return el.hasAttribute(_this8.slurp.attr) ? _this8.slurpEl(el) : _this8.Views[el.getAttribute(_this8.slurp.view)].el = el;
        });

        options.insertion.method === 'insertBefore' ? options.insertion.el.parentNode.insertBefore(fragment, options.insertion.el) : options.insertion.el[options.insertion.method || 'appendChild'](fragment);

        return this;
    },
    isMouseOnEl: function isMouseOnEl(event, el) {

        var elOffset = el.offset(),
            elHeight = el.outerHeight(true),
            elWidth = el.outerWidth(true);

        if (event.pageX < elOffset.left || event.pageX > elOffset.left + elWidth || event.pageY < elOffset.top || event.pageY > elOffset.top + elHeight) {

            return false;
        }

        return true;
    },


    requiresLogin: false

});

},{"../../../lib/MyObject":28,"../Xhr":4,"../models/__proto__.js":8,"./lib/OptimizedResize":19,"events":29}],19:[function(require,module,exports){
'use strict';

module.exports = Object.create({
    add: function add(callback) {
        if (!this.callbacks.length) window.addEventListener('resize', this.onResize);
        this.callbacks.push(callback);
    },
    onResize: function onResize() {
        if (this.running) return;

        this.running = true;

        window.requestAnimationFrame ? window.requestAnimationFrame(this.runCallbacks) : setTimeout(this.runCallbacks, 66);
    },
    runCallbacks: function runCallbacks() {
        this.callbacks = this.callbacks.filter(function (callback) {
            return callback();
        });
        this.running = false;
    }
}, { callbacks: { value: [] }, running: { value: false } }).add;

},{}],20:[function(require,module,exports){
"use strict";

module.exports = function (p) {
  return "<footer></footer>";
};

},{}],21:[function(require,module,exports){
"use strict";

module.exports = function (p) {
  return "<header></header>";
};

},{}],22:[function(require,module,exports){
"use strict";

module.exports = function (p) {
    return "<div>\n    <div data-js=\"subView\"></div>\n</div>";
};

},{}],23:[function(require,module,exports){
'use strict';

module.exports = function (p) {
  return '<ul>' + Array.from(Array(p.itemListElement.length).keys()).map(function (n) {
    return '<li></li>';
  }).join('') + '</ul>';
};

},{}],24:[function(require,module,exports){
"use strict";

module.exports = function (p) {
    return "<div>\n    <div>" + p.name + "</div>\n    <div>" + p.address.streetAddress + "</div>\n    <div>\n        <span>" + p.address.addressLocality + "</span>\n        <span>" + p.address.addressRegion + "</span>\n        <span>" + p.address.postalCode + "</span>\n    </div>\n    <div>" + p.telephone + "</div>\n    <div>" + p.openingHours + "</div>\n    <div data-js=\"social\"></div>\n</div>";
};

},{}],25:[function(require,module,exports){
"use strict";

module.exports = function (p) {
  return "<img src=\"" + p.contentUrl + "\" />";
};

},{}],26:[function(require,module,exports){
"use strict";

module.exports = function (p) {
  return "<div>" + p.name + "</div>";
};

},{}],27:[function(require,module,exports){
"use strict";

module.exports = function (err) {
  console.log(err.stack || err);
};

},{}],28:[function(require,module,exports){
'use strict';

module.exports = {

    Error: require('./MyError'),

    P: function P(fun) {
        var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var thisArg = arguments[2];
        return new Promise(function (resolve, reject) {
            return Reflect.apply(fun, thisArg || undefined, args.concat(function (e) {
                for (var _len = arguments.length, callback = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    callback[_key - 1] = arguments[_key];
                }

                return e ? reject(e) : resolve(callback);
            }));
        });
    },

    constructor: function constructor() {
        return this;
    }
};

},{"./MyError":27}],29:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvanMvLlRlbXBsYXRlTWFwLmpzIiwiY2xpZW50L2pzLy5WaWV3TWFwLmpzIiwiY2xpZW50L2pzLy5lbnYiLCJjbGllbnQvanMvWGhyLmpzIiwiY2xpZW50L2pzL2ZhY3RvcnkvVmlldy5qcyIsImNsaWVudC9qcy9tYWluLmpzIiwiY2xpZW50L2pzL21vZGVscy9Vc2VyLmpzIiwiY2xpZW50L2pzL21vZGVscy9fX3Byb3RvX18uanMiLCJjbGllbnQvanMvcm91dGVyLmpzIiwiY2xpZW50L2pzL3ZpZXdzL0Zvb3Rlci5qcyIsImNsaWVudC9qcy92aWV3cy9IZWFkZXIuanMiLCJjbGllbnQvanMvdmlld3MvSG9tZS5qcyIsImNsaWVudC9qcy92aWV3cy9JdGVtTGlzdC5qcyIsImNsaWVudC9qcy92aWV3cy9Mb2NhbEJ1c2luZXNzLmpzIiwiY2xpZW50L2pzL3ZpZXdzL01lZGlhT2JqZWN0LmpzIiwiY2xpZW50L2pzL3ZpZXdzL1NpdGVOYXZpZ2F0aW9uRWxlbWVudC5qcyIsImNsaWVudC9qcy92aWV3cy9XZWJQYWdlRWxlbWVudC5qcyIsImNsaWVudC9qcy92aWV3cy9fX3Byb3RvX18uanMiLCJjbGllbnQvanMvdmlld3MvbGliL09wdGltaXplZFJlc2l6ZS5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvRm9vdGVyLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9IZWFkZXIuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL0hvbWUuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL0l0ZW1MaXN0LmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9Mb2NhbEJ1c2luZXNzLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9NZWRpYU9iamVjdC5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvU2l0ZU5hdmlnYXRpb25FbGVtZW50LmpzIiwibGliL015RXJyb3IuanMiLCJsaWIvTXlPYmplY3QuanMiLCJub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsT0FBTyxPQUFQLEdBQWU7QUFDZCxTQUFRLFFBQVEsMEJBQVIsQ0FETTtBQUVkLFNBQVEsUUFBUSwwQkFBUixDQUZNO0FBR2QsT0FBTSxRQUFRLHdCQUFSLENBSFE7QUFJZCxXQUFVLFFBQVEsNEJBQVIsQ0FKSTtBQUtkLGdCQUFlLFFBQVEsaUNBQVIsQ0FMRDtBQU1kLGNBQWEsUUFBUSwrQkFBUixDQU5DO0FBT2Qsd0JBQXVCLFFBQVEseUNBQVI7QUFQVCxDQUFmOzs7OztBQ0FBLE9BQU8sT0FBUCxHQUFlO0FBQ2QsU0FBUSxRQUFRLGdCQUFSLENBRE07QUFFZCxTQUFRLFFBQVEsZ0JBQVIsQ0FGTTtBQUdkLE9BQU0sUUFBUSxjQUFSLENBSFE7QUFJZCxXQUFVLFFBQVEsa0JBQVIsQ0FKSTtBQUtkLGdCQUFlLFFBQVEsdUJBQVIsQ0FMRDtBQU1kLGNBQWEsUUFBUSxxQkFBUixDQU5DO0FBT2Qsd0JBQXVCLFFBQVEsK0JBQVIsQ0FQVDtBQVFkLGlCQUFnQixRQUFRLHdCQUFSO0FBUkYsQ0FBZjs7O0FDQUE7QUFDQTs7OztBQ0RBLE9BQU8sT0FBUCxHQUFpQixPQUFPLE1BQVAsQ0FBZSxPQUFPLE1BQVAsQ0FBZSxFQUFmLEVBQW1CLFFBQVEsb0JBQVIsQ0FBbkIsRUFBa0Q7O0FBRTlFLGFBQVM7QUFFTCxtQkFGSyx1QkFFUSxJQUZSLEVBRWU7QUFBQTs7QUFDaEIsZ0JBQUksTUFBTSxJQUFJLGNBQUosRUFBVjs7QUFFQSxtQkFBTyxJQUFJLE9BQUosQ0FBYSxVQUFFLE9BQUYsRUFBVyxNQUFYLEVBQXVCOztBQUV2QyxvQkFBSSxNQUFKLEdBQWEsWUFBVztBQUNwQixxQkFBRSxHQUFGLEVBQU8sR0FBUCxFQUFZLEdBQVosRUFBa0IsUUFBbEIsQ0FBNEIsS0FBSyxNQUFqQyxJQUNNLE9BQVEsS0FBSyxRQUFiLENB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHM9e1xuXHRGb290ZXI6IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL0Zvb3RlcicpLFxuXHRIZWFkZXI6IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL0hlYWRlcicpLFxuXHRIb21lOiByZXF1aXJlKCcuL3ZpZXdzL3RlbXBsYXRlcy9Ib21lJyksXG5cdEl0ZW1MaXN0OiByZXF1aXJlKCcuL3ZpZXdzL3RlbXBsYXRlcy9JdGVtTGlzdCcpLFxuXHRMb2NhbEJ1c2luZXNzOiByZXF1aXJlKCcuL3ZpZXdzL3RlbXBsYXRlcy9Mb2NhbEJ1c2luZXNzJyksXG5cdE1lZGlhT2JqZWN0OiByZXF1aXJlKCcuL3ZpZXdzL3RlbXBsYXRlcy9NZWRpYU9iamVjdCcpLFxuXHRTaXRlTmF2aWdhdGlvbkVsZW1lbnQ6IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL1NpdGVOYXZpZ2F0aW9uRWxlbWVudCcpXG59IiwibW9kdWxlLmV4cG9ydHM9e1xuXHRGb290ZXI6IHJlcXVpcmUoJy4vdmlld3MvRm9vdGVyJyksXG5cdEhlYWRlcjogcmVxdWlyZSgnLi92aWV3cy9IZWFkZXInKSxcblx0SG9tZTogcmVxdWlyZSgnLi92aWV3cy9Ib21lJyksXG5cdEl0ZW1MaXN0OiByZXF1aXJlKCcuL3ZpZXdzL0l0ZW1MaXN0JyksXG5cdExvY2FsQnVzaW5lc3M6IHJlcXVpcmUoJy4vdmlld3MvTG9jYWxCdXNpbmVzcycpLFxuXHRNZWRpYU9iamVjdDogcmVxdWlyZSgnLi92aWV3cy9NZWRpYU9iamVjdCcpLFxuXHRTaXRlTmF2aWdhdGlvbkVsZW1lbnQ6IHJlcXVpcmUoJy4vdmlld3MvU2l0ZU5hdmlnYXRpb25FbGVtZW50JyksXG5cdFdlYlBhZ2VFbGVtZW50OiByZXF1aXJlKCcuL3ZpZXdzL1dlYlBhZ2VFbGVtZW50Jylcbn0iLCJ3aW5kb3cuY29va2llTmFtZSA9ICdoYXp5J1xuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi4vLi4vbGliL015T2JqZWN0JyksIHtcblxuICAgIFJlcXVlc3Q6IHtcblxuICAgICAgICBjb25zdHJ1Y3RvciggZGF0YSApIHtcbiAgICAgICAgICAgIGxldCByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuXG4gICAgICAgICAgICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBbIDUwMCwgNDA0LCA0MDEgXS5pbmNsdWRlcyggdGhpcy5zdGF0dXMgKVxuICAgICAgICAgICAgICAgICAgICAgICAgPyByZWplY3QoIHRoaXMucmVzcG9uc2UgKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiByZXNvbHZlKCBKU09OLnBhcnNlKHRoaXMucmVzcG9uc2UpIClcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiggZGF0YS5tZXRob2QgPT09IFwiZ2V0XCIgKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBxcyA9IGRhdGEucXMgPyBgPyR7ZGF0YS5xc31gIDogJycgXG4gICAgICAgICAgICAgICAgICAgIHJlcS5vcGVuKCBkYXRhLm1ldGhvZCwgYC8ke2RhdGEucmVzb3VyY2V9JHtxc31gIClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRIZWFkZXJzKCByZXEsIGRhdGEuaGVhZGVycyApXG4gICAgICAgICAgICAgICAgICAgIHJlcS5zZW5kKG51bGwpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVxLm9wZW4oIGRhdGEubWV0aG9kLCBgLyR7ZGF0YS5yZXNvdXJjZX1gLCB0cnVlKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEhlYWRlcnMoIHJlcSwgZGF0YS5oZWFkZXJzIClcbiAgICAgICAgICAgICAgICAgICAgcmVxLnNlbmQoIGRhdGEuZGF0YSApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApXG4gICAgICAgIH0sXG5cbiAgICAgICAgcGxhaW5Fc2NhcGUoIHNUZXh0ICkge1xuICAgICAgICAgICAgLyogaG93IHNob3VsZCBJIHRyZWF0IGEgdGV4dC9wbGFpbiBmb3JtIGVuY29kaW5nPyB3aGF0IGNoYXJhY3RlcnMgYXJlIG5vdCBhbGxvd2VkPyB0aGlzIGlzIHdoYXQgSSBzdXBwb3NlLi4uOiAqL1xuICAgICAgICAgICAgLyogXCI0XFwzXFw3IC0gRWluc3RlaW4gc2FpZCBFPW1jMlwiIC0tLS0+IFwiNFxcXFwzXFxcXDdcXCAtXFwgRWluc3RlaW5cXCBzYWlkXFwgRVxcPW1jMlwiICovXG4gICAgICAgICAgICByZXR1cm4gc1RleHQucmVwbGFjZSgvW1xcc1xcPVxcXFxdL2csIFwiXFxcXCQmXCIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldEhlYWRlcnMoIHJlcSwgaGVhZGVycz17fSApIHtcbiAgICAgICAgICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKCBcIkFjY2VwdFwiLCBoZWFkZXJzLmFjY2VwdCB8fCAnYXBwbGljYXRpb24vanNvbicgKVxuICAgICAgICAgICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgJ3RleHQvcGxhaW4nIClcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfZmFjdG9yeSggZGF0YSApIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5jcmVhdGUoIHRoaXMuUmVxdWVzdCwgeyB9ICkuY29uc3RydWN0b3IoIGRhdGEgKVxuICAgIH0sXG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICBpZiggIVhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5zZW5kQXNCaW5hcnkgKSB7XG4gICAgICAgICAgWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlLnNlbmRBc0JpbmFyeSA9IGZ1bmN0aW9uKHNEYXRhKSB7XG4gICAgICAgICAgICB2YXIgbkJ5dGVzID0gc0RhdGEubGVuZ3RoLCB1aThEYXRhID0gbmV3IFVpbnQ4QXJyYXkobkJ5dGVzKTtcbiAgICAgICAgICAgIGZvciAodmFyIG5JZHggPSAwOyBuSWR4IDwgbkJ5dGVzOyBuSWR4KyspIHtcbiAgICAgICAgICAgICAgdWk4RGF0YVtuSWR4XSA9IHNEYXRhLmNoYXJDb2RlQXQobklkeCkgJiAweGZmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZW5kKHVpOERhdGEpO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fZmFjdG9yeS5iaW5kKHRoaXMpXG4gICAgfVxuXG59ICksIHsgfSApLmNvbnN0cnVjdG9yKClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSgge1xuXG4gICAgY3JlYXRlKCBuYW1lLCBvcHRzICkge1xuICAgICAgICBuYW1lID0gbmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG5hbWUuc2xpY2UoMSlcbiAgICAgICAgcmV0dXJuIE9iamVjdC5jcmVhdGUoXG4gICAgICAgICAgICB0aGlzLlZpZXdzWyBuYW1lIF0sXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKCB7XG4gICAgICAgICAgICAgICAgbmFtZTogeyB2YWx1ZTogbmFtZSB9LFxuICAgICAgICAgICAgICAgIGZhY3Rvcnk6IHsgdmFsdWU6IHRoaXMgfSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogeyB2YWx1ZTogdGhpcy5UZW1wbGF0ZXNbIG5hbWUgXSB9LFxuICAgICAgICAgICAgICAgIHVzZXI6IHsgdmFsdWU6IHRoaXMuVXNlciB9XG4gICAgICAgICAgICAgICAgfSwgb3B0cyApXG4gICAgICAgICkuY29uc3RydWN0b3IoKVxuICAgICAgICAub24oICduYXZpZ2F0ZScsIHJvdXRlID0+IHJlcXVpcmUoJy4uL3JvdXRlcicpLm5hdmlnYXRlKCByb3V0ZSApIClcbiAgICB9LFxuXG59LCB7XG4gICAgVGVtcGxhdGVzOiB7IHZhbHVlOiByZXF1aXJlKCcuLi8uVGVtcGxhdGVNYXAnKSB9LFxuICAgIFVzZXI6IHsgdmFsdWU6IHJlcXVpcmUoJy4uL21vZGVscy9Vc2VyJyApIH0sXG4gICAgVmlld3M6IHsgdmFsdWU6IHJlcXVpcmUoJy4uLy5WaWV3TWFwJykgfVxufSApXG4iLCJ3aW5kb3cub25sb2FkID0gKCkgPT4ge1xuICAgIHJlcXVpcmUoJy4vLmVudicpXG4gICAgcmVxdWlyZSgnLi9yb3V0ZXInKS5pbml0aWFsaXplKClcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSggcmVxdWlyZSgnLi9fX3Byb3RvX18uanMnKSwgeyByZXNvdXJjZTogeyB2YWx1ZTogJ21lJyB9IH0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7IH0sIHJlcXVpcmUoJy4uLy4uLy4uL2xpYi9NeU9iamVjdCcpLCByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXIucHJvdG90eXBlLCB7XG5cbiAgICBYaHI6IHJlcXVpcmUoJy4uL1hocicpLFxuXG4gICAgZ2V0KCBvcHRzPXt9ICkge1xuICAgICAgICByZXR1cm4gdGhpcy5YaHIoIHsgbWV0aG9kOiAnZ2V0JywgcmVzb3VyY2U6IHRoaXMucmVzb3VyY2UsIGhlYWRlcnM6IHRoaXMuaGVhZGVycyB8fCB7fSwgcXM6IG9wdHMucXVlcnkgPyBKU09OLnN0cmluZ2lmeSggb3B0cy5xdWVyeSApIDogdW5kZWZpbmVkIH0gKVxuICAgICAgICAudGhlbiggcmVzcG9uc2UgPT4gUHJvbWlzZS5yZXNvbHZlKCB0aGlzLmRhdGEgPSByZXNwb25zZSApIClcbiAgICB9XG5cbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCB7XG5cbiAgICBFcnJvcjogcmVxdWlyZSgnLi4vLi4vbGliL015RXJyb3InKSxcbiAgICBcbiAgICBVc2VyOiByZXF1aXJlKCcuL21vZGVscy9Vc2VyJyksXG5cbiAgICBWaWV3RmFjdG9yeTogcmVxdWlyZSgnLi9mYWN0b3J5L1ZpZXcnKSxcblxuICAgIGluaXRpYWxpemUoKSB7XG4gICAgICAgIHRoaXMuY29udGVudENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjb250ZW50JylcblxuICAgICAgICB3aW5kb3cub25wb3BzdGF0ZSA9IHRoaXMuaGFuZGxlLmJpbmQodGhpcylcblxuICAgICAgICB0aGlzLmhlYWRlciA9IHRoaXMuVmlld0ZhY3RvcnkuY3JlYXRlKCAnaGVhZGVyJywgeyBpbnNlcnRpb246IHsgdmFsdWU6IHsgZWw6IHRoaXMuY29udGVudENvbnRhaW5lciwgbWV0aG9kOiAnaW5zZXJ0QmVmb3JlJyB9IH0gfSApXG4gICAgICAgIHRoaXMuZm9vdGVyID0gdGhpcy5WaWV3RmFjdG9yeS5jcmVhdGUoICdmb290ZXInLCB7IGluc2VydGlvbjogeyB2YWx1ZTogeyBlbDogdGhpcy5jb250ZW50Q29udGFpbmVyLnBhcmVudE5vZGUgfSB9IH0gKVxuXG4gICAgICAgIHRoaXMuVXNlci5nZXQoKS50aGVuKCAoKSA9PiB7XG4gICAgICAgIFxuICAgICAgICAgICAgdGhpcy5oZWFkZXIub25Vc2VyKClcbiAgICAgICAgICAgIC5vbiggJ3NpZ25vdXQnLCAoKSA9PiBcbiAgICAgICAgICAgICAgICBQcm9taXNlLmFsbCggT2JqZWN0LmtleXMoIHRoaXMudmlld3MgKS5tYXAoIG5hbWUgPT4gdGhpcy52aWV3c1sgbmFtZSBdLmRlbGV0ZSgpICkgKVxuICAgICAgICAgICAgICAgIC50aGVuKCAoKSA9PiB0aGlzLm5hdmlnYXRlKCAnaG9tZScgKSApXG4gICAgICAgICAgICApXG5cbiAgICAgICAgICAgIHRoaXMuaGFuZGxlKClcblxuICAgICAgICB9ICkuY2F0Y2goIHRoaXMuRXJyb3IgKVxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIGhhbmRsZSgpIHtcbiAgICAgICAgdGhpcy5oYW5kbGVyKCB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKS5zbGljZSgxKSApXG4gICAgfSxcblxuICAgIGhhbmRsZXIoIHBhdGggKSB7XG4gICAgICAgIGNvbnN0IHZpZXcgPSAvdmVyaWZ5Ly50ZXN0KCBwYXRoICkgPyAndmVyaWZ5JyA6ICdob21lJ1xuXG4gICAgICAgIGlmKCB0aGlzLnZpZXdzWyB2aWV3IF0gKSByZXR1cm4gdGhpcy52aWV3c1sgdmlldyBdLm5hdmlnYXRlKCBwYXRoIClcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoXG4gICAgICAgICAgICB0aGlzLnZpZXdzWyB2aWV3IF0gPVxuICAgICAgICAgICAgICAgIHRoaXMuVmlld0ZhY3RvcnkuY3JlYXRlKCB2aWV3LCB7XG4gICAgICAgICAgICAgICAgICAgIGluc2VydGlvbjogeyB2YWx1ZTogeyBlbDogdGhpcy5jb250ZW50Q29udGFpbmVyIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogeyB2YWx1ZTogcGF0aCwgd3JpdGFibGU6IHRydWUgfVxuICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICApXG4gICAgfSxcblxuICAgIG5hdmlnYXRlKCBsb2NhdGlvbiApIHtcbiAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoIHt9LCAnJywgbG9jYXRpb24gKVxuICAgICAgICB0aGlzLmhhbmRsZSgpXG4gICAgfVxuXG59LCB7IHZpZXdzOiB7IHZhbHVlOiB7IH0gfSB9IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbigge30sIHJlcXVpcmUoJy4vV2ViUGFnZUVsZW1lbnQnKSwge1xuXG59IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbigge30sIHJlcXVpcmUoJy4vV2ViUGFnZUVsZW1lbnQnKSwge1xuXG4gICAgZXZlbnRzOiB7XG4gICAgICAgIHNpZ25vdXRCdG46ICdjbGljaydcbiAgICB9LFxuXG4gICAgb25Vc2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICByZXF1aXJlc0xvZ2luOiBmYWxzZSxcbiAgICBcbiAgICBzaWdub3V0KCkge1xuXG4gICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGAke3dpbmRvdy5jb29raWVOYW1lfT07IGV4cGlyZXM9VGh1LCAwMSBKYW4gMTk3MCAwMDowMDowMSBHTVQ7YDtcblxuICAgICAgICB0aGlzLnVzZXIuZGF0YSA9IHsgfVxuXG4gICAgICAgIHRoaXMuZW1pdCgnc2lnbm91dCcpXG5cbiAgICB9XG5cbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi9fX3Byb3RvX18nKSwge1xuXG4gICAgZmV0Y2hBbmREaXNwbGF5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXREYXRhKClcbiAgICAgICAgLnRoZW4oICgpID0+IFxuICAgICAgICAgICAgdGhpcy52aWV3c1sgdGhpcy5tb2RlbC5kYXRhW1wiQHR5cGVcIl0gXSA9XG4gICAgICAgICAgICAgICAgdGhpcy5mYWN0b3J5LmNyZWF0ZSggdGhpcy5tb2RlbC5kYXRhW1wiQHR5cGVcIl0sIHsgaW5zZXJ0aW9uOiB7IHZhbHVlOiB7IGVsOiB0aGlzLmVscy5zdWJWaWV3IH0gfSwgbW9kZWw6IHsgdmFsdWU6IHRoaXMubW9kZWwgfSB9IClcbiAgICAgICAgKVxuICAgIH0sXG5cbiAgICBnZXREYXRhKCkge1xuICAgICAgICBpZiggIXRoaXMubW9kZWwgKSB0aGlzLm1vZGVsID0gT2JqZWN0LmNyZWF0ZSggdGhpcy5Nb2RlbCApXG5cbiAgICAgICAgdGhpcy5tb2RlbC5yZXNvdXJjZSA9IHRoaXMucGF0aC5sZW5ndGggPyB0aGlzLnBhdGguam9pbignLycpIDogJydcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZWwuZ2V0KClcbiAgICB9LFxuXG4gICAgbmF2aWdhdGUoIHBhdGggKSB7XG4gICAgICAgIHRoaXMucGF0aCA9IHBhdGg7XG5cbiAgICAgICAgKCB0aGlzLm1vZGVsID8gdGhpcy52aWV3c1sgdGhpcy5tb2RlbC5kYXRhW1wiQHR5cGVcIl0gXS5kZWxldGUoKSA6IFByb21pc2UucmVzb2x2ZSgpIClcbiAgICAgICAgLnRoZW4oICgpID0+IHRoaXMuZmV0Y2hBbmREaXNwbGF5KCkgKVxuICAgICAgICAuY2F0Y2goIHRoaXMuRXJyb3IgKVxuICAgIH0sXG5cbiAgICBwb3N0UmVuZGVyKCkge1xuICAgICAgICAvL3RoaXMuZmV0Y2hBbmREaXNwbGF5KCkuY2F0Y2goIHRoaXMuRXJyb3IgKVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxufSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG5cbiAgICBwb3N0UmVuZGVyKCkge1xuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuZWxzLmNvbnRhaW5lci5jaGlsZHJlblxuICAgICAgICB0aGlzLm1vZGVsLmRhdGEuaXRlbUxpc3RFbGVtZW50LmZvckVhY2goICggaXRlbSwgaSApID0+XG4gICAgICAgICAgICB0aGlzLmZhY3RvcnkuY3JlYXRlKFxuICAgICAgICAgICAgICAgIGl0ZW1bIFwiQHR5cGVcIiBdLFxuICAgICAgICAgICAgICAgIHsgaW5zZXJ0aW9uOiB7IHZhbHVlOiB7IGVsOiBjaGlsZHJlbltpXSB9IH0sIG1vZGVsOiB7IHZhbHVlOiB7IGRhdGE6IGl0ZW0gfSB9IH1cbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG59IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbigge30sIHJlcXVpcmUoJy4vX19wcm90b19fJyksIHtcblxuXG59IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbigge30sIHJlcXVpcmUoJy4vX19wcm90b19fJyksIHtcbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi9fX3Byb3RvX18nKSwge1xufSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG5cbiAgICBmZXRjaEFuZERpc3BsYXkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldERhdGEoKVxuICAgICAgICAudGhlbiggKCkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLmZhY3RvcnkuY3JlYXRlKFxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuZGF0YS5tYWluRW50aXR5W1wiQHR5cGVcIl0sXG4gICAgICAgICAgICAgICAgeyBpbnNlcnRpb246IHsgdmFsdWU6IHsgZWw6IHRoaXMuZWxzLmNvbnRhaW5lciB9IH0sIG1vZGVsOiB7IHZhbHVlOiB7IGRhdGE6IHRoaXMubW9kZWwuZGF0YS5tYWluRW50aXR5IH0gfSB9XG4gICAgICAgICAgICApXG5cbiAgICAgICAgICAgIGlmKCB0aGlzLm1vZGVsLmRhdGEuaW1hZ2UgKSB0aGlzLmhhbmRsZUltYWdlKCB0aGlzLm1vZGVsLmRhdGEuaW1hZ2UgKVxuICAgICAgICB9IClcbiAgICB9LFxuXG4gICAgZ2V0RGF0YSgpIHtcbiAgICAgICAgaWYoICF0aGlzLm1vZGVsICkgdGhpcy5tb2RlbCA9IE9iamVjdC5jcmVhdGUoIHRoaXMuTW9kZWwsIHsgcmVzb3VyY2U6IHsgdmFsdWU6IHRoaXMudHlwZSB9LCBoZWFkZXJzOiB7IHZhbHVlOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2xkK2pzb24nIH0gfSB9IClcblxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlbC5nZXQoIHsgcXVlcnk6IHsgbmFtZTogdGhpcy5uYW1lIH0gfSApXG4gICAgfSxcblxuICAgIGhhbmRsZUltYWdlKCB1cmwgKSB7XG4gICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBgdXJsKCR7IHVybCB9KWBcbiAgICB9LCBcblxuICAgIHBvc3RSZW5kZXIoKSB7XG4gICAgICAgIHRoaXMuZmV0Y2hBbmREaXNwbGF5KCkuY2F0Y2goIHRoaXMuRXJyb3IgKVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICB0eXBlOiAnV2ViUGFnZUVsZW1lbnQnXG59IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbiggeyB9LCByZXF1aXJlKCcuLi8uLi8uLi9saWIvTXlPYmplY3QnKSwgcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyLnByb3RvdHlwZSwge1xuXG4gICAgTW9kZWw6IHJlcXVpcmUoJy4uL21vZGVscy9fX3Byb3RvX18uanMnKSxcblxuICAgIE9wdGltaXplZFJlc2l6ZTogcmVxdWlyZSgnLi9saWIvT3B0aW1pemVkUmVzaXplJyksXG4gICAgXG4gICAgWGhyOiByZXF1aXJlKCcuLi9YaHInKSxcblxuICAgIGJpbmRFdmVudCgga2V5LCBldmVudCApIHtcbiAgICAgICAgdmFyIGVscyA9IEFycmF5LmlzQXJyYXkoIHRoaXMuZWxzWyBrZXkgXSApID8gdGhpcy5lbHNbIGtleSBdIDogWyB0aGlzLmVsc1sga2V5IF0gXVxuICAgICAgICBlbHMuZm9yRWFjaCggZWwgPT4gZWwuYWRkRXZlbnRMaXN0ZW5lciggZXZlbnQgfHwgJ2NsaWNrJywgZSA9PiB0aGlzWyBgb24ke3RoaXMuY2FwaXRhbGl6ZUZpcnN0TGV0dGVyKGtleSl9JHt0aGlzLmNhcGl0YWxpemVGaXJzdExldHRlcihldmVudCl9YCBdKCBlICkgKSApXG4gICAgfSxcblxuICAgIGNhcGl0YWxpemVGaXJzdExldHRlcjogc3RyaW5nID0+IHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSgxKSxcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIGlmKCB0aGlzLnNpemUgKSB0aGlzLk9wdGltaXplZFJlc2l6ZS5hZGQoIHRoaXMuc2l6ZSApO1xuXG4gICAgICAgIGlmKCB0aGlzLnJlcXVpcmVzTG9naW4gJiYgKCF0aGlzLnVzZXIuZGF0YSB8fCAhdGhpcy51c2VyLmRhdGEuaWQgKSApIHJldHVybiB0aGlzLmhhbmRsZUxvZ2luKClcblxuICAgICAgICBpZiggdGhpcy51c2VyLmRhdGEgJiYgdGhpcy51c2VyLmRhdGEuaWQgJiYgdGhpcy5yZXF1aXJlc1JvbGUgJiYgIXRoaXMuaGFzUHJpdmlsZWdlcygpICkgcmV0dXJuIHRoaXMuc2hvd05vQWNjZXNzKClcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKCB0aGlzLCB7IGVsczogeyB9LCBzbHVycDogeyBhdHRyOiAnZGF0YS1qcycsIHZpZXc6ICdkYXRhLXZpZXcnIH0sIHZpZXdzOiB7IH0gfSApLnJlbmRlcigpXG4gICAgfSxcblxuICAgIGRlbGVnYXRlRXZlbnRzKCBrZXksIGVsICkge1xuICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiB0aGlzLmV2ZW50c1trZXldXG5cbiAgICAgICAgaWYoIHR5cGUgPT09IFwic3RyaW5nXCIgKSB7IHRoaXMuYmluZEV2ZW50KCBrZXksIHRoaXMuZXZlbnRzW2tleV0gKSB9XG4gICAgICAgIGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIHRoaXMuZXZlbnRzW2tleV0gKSApIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzWyBrZXkgXS5mb3JFYWNoKCBldmVudE9iaiA9PiB0aGlzLmJpbmRFdmVudCgga2V5LCBldmVudE9iai5ldmVudCApIClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYmluZEV2ZW50KCBrZXksIHRoaXMuZXZlbnRzW2tleV0uZXZlbnQgKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGRlbGV0ZSggZHVyYXRpb24gKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZScpXG4gICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lciggJ3RyYW5zaXRpb25lbmQnLCBlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCggdGhpcy5lbHMuY29udGFpbmVyICk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSggdGhpcy5lbWl0KCdyZW1vdmVkJykgKVxuICAgICAgICAgICAgfSwgdHJ1ZSApXG4gICAgICAgIH0gKVxuICAgIH0sXG5cbiAgICBldmVudHM6IHt9LFxuXG4gICAgZ2V0VGVtcGxhdGVPcHRpb25zKCkgeyByZXR1cm4gKHRoaXMubW9kZWwpID8gdGhpcy5tb2RlbC5kYXRhIDoge30gfSxcblxuICAgIGhhbmRsZUxvZ2luKCkge1xuICAgICAgICB0aGlzLmZhY3RvcnkuY3JlYXRlKCAnbG9naW4nLCB7IGluc2VydGlvbjogeyB2YWx1ZTogeyBlbDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbnRlbnQnKSB9IH0gfSApXG4gICAgICAgICAgICAub25jZSggXCJsb2dnZWRJblwiLCAoKSA9PiB0aGlzLm9uTG9naW4oKSApXG5cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgaGFzUHJpdmlsZWdlKCkge1xuICAgICAgICAoIHRoaXMucmVxdWlyZXNSb2xlICYmICggdGhpcy51c2VyLmdldCgncm9sZXMnKS5maW5kKCByb2xlID0+IHJvbGUgPT09IHRoaXMucmVxdWlyZXNSb2xlICkgPT09IFwidW5kZWZpbmVkXCIgKSApID8gZmFsc2UgOiB0cnVlXG4gICAgfSxcblxuICAgIGh0bWxUb0ZyYWdtZW50KCBzdHIgKSB7XG4gICAgICAgIGxldCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgIC8vIG1ha2UgdGhlIHBhcmVudCBvZiB0aGUgZmlyc3QgZGl2IGluIHRoZSBkb2N1bWVudCBiZWNvbWVzIHRoZSBjb250ZXh0IG5vZGVcbiAgICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZShkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImRpdlwiKS5pdGVtKDApKVxuICAgICAgICByZXR1cm4gcmFuZ2UuY3JlYXRlQ29udGV4dHVhbEZyYWdtZW50KCBzdHIgKVxuICAgIH0sXG4gICAgXG4gICAgaXNIaWRkZW4oKSB7IHJldHVybiB0aGlzLmVscy5jb250YWluZXIuY3NzKCdkaXNwbGF5JykgPT09ICdub25lJyB9LFxuXG4gICAgb25Mb2dpbigpIHtcbiAgICAgICAgdGhpcy5yb3V0ZXIuaGVhZGVyLm9uVXNlciggdGhpcy51c2VyIClcblxuICAgICAgICB0aGlzWyAoIHRoaXMuaGFzUHJpdmlsZWdlcygpICkgPyAncmVuZGVyJyA6ICdzaG93Tm9BY2Nlc3MnIF0oKVxuICAgIH0sXG5cbiAgICBzaG93Tm9BY2Nlc3MoKSB7XG4gICAgICAgIGFsZXJ0KFwiTm8gcHJpdmlsZWdlcywgc29uXCIpXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIHBvc3RSZW5kZXIoKSB7IHJldHVybiB0aGlzIH0sXG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHRoaXMuc2x1cnBUZW1wbGF0ZSggeyB0ZW1wbGF0ZTogdGhpcy50ZW1wbGF0ZSggdGhpcy5nZXRUZW1wbGF0ZU9wdGlvbnMoKSApLCBpbnNlcnRpb246IHRoaXMuaW5zZXJ0aW9uIH0gKVxuXG4gICAgICAgIGlmKCB0aGlzLnNpemUgKSB0aGlzLnNpemUoKVxuXG4gICAgICAgIHJldHVybiB0aGlzLnJlbmRlclN1YnZpZXdzKClcbiAgICAgICAgICAgICAgICAgICAucG9zdFJlbmRlcigpXG4gICAgfSxcblxuICAgIHJlbmRlclN1YnZpZXdzKCkge1xuICAgICAgICBPYmplY3Qua2V5cyggdGhpcy5WaWV3cyB8fCBbIF0gKS5mb3JFYWNoKCBrZXkgPT4ge1xuICAgICAgICAgICAgaWYoIHRoaXMuVmlld3NbIGtleSBdLmVsICkge1xuICAgICAgICAgICAgICAgIGxldCBvcHRzID0gdGhpcy5WaWV3c1sga2V5IF0ub3B0c1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG9wdHMgPSAoIG9wdHMgKVxuICAgICAgICAgICAgICAgICAgICA/IHR5cGVvZiBvcHRzID09PSBcIm9iamVjdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA/IG9wdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIDogb3B0cygpXG4gICAgICAgICAgICAgICAgICAgIDoge31cblxuICAgICAgICAgICAgICAgIHRoaXMudmlld3NbIGtleSBdID0gdGhpcy5mYWN0b3J5LmNyZWF0ZSgga2V5LCBPYmplY3QuYXNzaWduKCB7IGluc2VydGlvbjogeyB2YWx1ZTogeyBlbDogdGhpcy5WaWV3c1sga2V5IF0uZWwsIG1ldGhvZDogJ2luc2VydEJlZm9yZScgfSB9IH0sIG9wdHMgKSApXG4gICAgICAgICAgICAgICAgdGhpcy5WaWV3c1sga2V5IF0uZWwucmVtb3ZlKClcbiAgICAgICAgICAgICAgICB0aGlzLlZpZXdzWyBrZXkgXS5lbCA9IHVuZGVmaW5lZFxuICAgICAgICAgICAgfVxuICAgICAgICB9IClcblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICBzaG93KCBkdXJhdGlvbiApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUsIHJlamVjdCApID0+XG4gICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIuc2hvdyhcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiB8fCAxMCxcbiAgICAgICAgICAgICAgICAoKSA9PiB7IGlmKCB0aGlzLnNpemUgKSB7IHRoaXMuc2l6ZSgpOyB9IHJlc29sdmUoKSB9XG4gICAgICAgICAgICApXG4gICAgICAgIClcbiAgICB9LFxuXG4gICAgc2x1cnBFbCggZWwgKSB7XG4gICAgICAgIHZhciBrZXkgPSBlbC5nZXRBdHRyaWJ1dGUoIHRoaXMuc2x1cnAuYXR0ciApIHx8ICdjb250YWluZXInXG5cbiAgICAgICAgaWYoIGtleSA9PT0gJ2NvbnRhaW5lcicgKSB7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCB0aGlzLm5hbWUgKVxuICAgICAgICAgICAgaWYoIHRoaXMubW9kZWwgJiYgdGhpcy5tb2RlbC5kYXRhICYmIHRoaXMubW9kZWwuZGF0YS5uYW1lICYmICghL1xccy8udGVzdCh0aGlzLm1vZGVsLmRhdGEubmFtZSkpICkgZWwuY2xhc3NMaXN0LmFkZCggdGhpcy5tb2RlbC5kYXRhLm5hbWUgKVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbHNbIGtleSBdID0gQXJyYXkuaXNBcnJheSggdGhpcy5lbHNbIGtleSBdIClcbiAgICAgICAgICAgID8gdGhpcy5lbHNbIGtleSBdLnB1c2goIGVsIClcbiAgICAgICAgICAgIDogKCB0aGlzLmVsc1sga2V5IF0gIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICAgICAgPyBbIHRoaXMuZWxzWyBrZXkgXSwgZWwgXVxuICAgICAgICAgICAgICAgIDogZWxcblxuICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5zbHVycC5hdHRyKVxuXG4gICAgICAgIGlmKCB0aGlzLmV2ZW50c1sga2V5IF0gKSB0aGlzLmRlbGVnYXRlRXZlbnRzKCBrZXksIGVsIClcbiAgICB9LFxuXG4gICAgc2x1cnBUZW1wbGF0ZSggb3B0aW9ucyApIHtcbiAgICAgICAgdmFyIGZyYWdtZW50ID0gdGhpcy5odG1sVG9GcmFnbWVudCggb3B0aW9ucy50ZW1wbGF0ZSApLFxuICAgICAgICAgICAgc2VsZWN0b3IgPSBgWyR7dGhpcy5zbHVycC5hdHRyfV1gLFxuICAgICAgICAgICAgdmlld1NlbGVjdG9yID0gYFske3RoaXMuc2x1cnAudmlld31dYFxuXG4gICAgICAgIHRoaXMuc2x1cnBFbCggZnJhZ21lbnQucXVlcnlTZWxlY3RvcignKicpIClcbiAgICAgICAgZnJhZ21lbnQucXVlcnlTZWxlY3RvckFsbCggYCR7c2VsZWN0b3J9LCAke3ZpZXdTZWxlY3Rvcn1gICkuZm9yRWFjaCggZWwgPT5cbiAgICAgICAgICAgICggZWwuaGFzQXR0cmlidXRlKCB0aGlzLnNsdXJwLmF0dHIgKSApIFxuICAgICAgICAgICAgICAgID8gdGhpcy5zbHVycEVsKCBlbCApXG4gICAgICAgICAgICAgICAgOiB0aGlzLlZpZXdzWyBlbC5nZXRBdHRyaWJ1dGUodGhpcy5zbHVycC52aWV3KSBdLmVsID0gZWxcbiAgICAgICAgKVxuICAgICAgICAgIFxuICAgICAgICBvcHRpb25zLmluc2VydGlvbi5tZXRob2QgPT09ICdpbnNlcnRCZWZvcmUnXG4gICAgICAgICAgICA/IG9wdGlvbnMuaW5zZXJ0aW9uLmVsLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKCBmcmFnbWVudCwgb3B0aW9ucy5pbnNlcnRpb24uZWwgKVxuICAgICAgICAgICAgOiBvcHRpb25zLmluc2VydGlvbi5lbFsgb3B0aW9ucy5pbnNlcnRpb24ubWV0aG9kIHx8ICdhcHBlbmRDaGlsZCcgXSggZnJhZ21lbnQgKVxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIGlzTW91c2VPbkVsKCBldmVudCwgZWwgKSB7XG5cbiAgICAgICAgdmFyIGVsT2Zmc2V0ID0gZWwub2Zmc2V0KCksXG4gICAgICAgICAgICBlbEhlaWdodCA9IGVsLm91dGVySGVpZ2h0KCB0cnVlICksXG4gICAgICAgICAgICBlbFdpZHRoID0gZWwub3V0ZXJXaWR0aCggdHJ1ZSApXG5cbiAgICAgICAgaWYoICggZXZlbnQucGFnZVggPCBlbE9mZnNldC5sZWZ0ICkgfHxcbiAgICAgICAgICAgICggZXZlbnQucGFnZVggPiAoIGVsT2Zmc2V0LmxlZnQgKyBlbFdpZHRoICkgKSB8fFxuICAgICAgICAgICAgKCBldmVudC5wYWdlWSA8IGVsT2Zmc2V0LnRvcCApIHx8XG4gICAgICAgICAgICAoIGV2ZW50LnBhZ2VZID4gKCBlbE9mZnNldC50b3AgKyBlbEhlaWdodCApICkgKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgfSxcblxuICAgIHJlcXVpcmVzTG9naW46IGZhbHNlLFxuXG4gICAgLy9fX3RvRG86IGh0bWwucmVwbGFjZSgvPlxccys8L2csJz48Jylcbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCB7XG5cbiAgICBhZGQoY2FsbGJhY2spIHtcbiAgICAgICAgaWYoICF0aGlzLmNhbGxiYWNrcy5sZW5ndGggKSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5vblJlc2l6ZSlcbiAgICAgICAgdGhpcy5jYWxsYmFja3MucHVzaChjYWxsYmFjaylcbiAgICB9LFxuXG4gICAgb25SZXNpemUoKSB7XG4gICAgICAgaWYoIHRoaXMucnVubmluZyApIHJldHVyblxuXG4gICAgICAgIHRoaXMucnVubmluZyA9IHRydWVcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICAgID8gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggdGhpcy5ydW5DYWxsYmFja3MgKVxuICAgICAgICAgICAgOiBzZXRUaW1lb3V0KCB0aGlzLnJ1bkNhbGxiYWNrcywgNjYpXG4gICAgfSxcblxuICAgIHJ1bkNhbGxiYWNrcygpIHtcbiAgICAgICAgdGhpcy5jYWxsYmFja3MgPSB0aGlzLmNhbGxiYWNrcy5maWx0ZXIoIGNhbGxiYWNrID0+IGNhbGxiYWNrKCkgKVxuICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZSBcbiAgICB9XG5cbn0sIHsgY2FsbGJhY2tzOiB7IHZhbHVlOiBbXSB9LCBydW5uaW5nOiB7IHZhbHVlOiBmYWxzZSB9IH0gKS5hZGRcbiIsIm1vZHVsZS5leHBvcnRzID0gcCA9PiBgPGZvb3Rlcj48L2Zvb3Rlcj5gXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHAgPT4gYDxoZWFkZXI+PC9oZWFkZXI+YFxuIiwibW9kdWxlLmV4cG9ydHMgPSAoIHAgKSA9PiBgPGRpdj5cbiAgICA8ZGl2IGRhdGEtanM9XCJzdWJWaWV3XCI+PC9kaXY+XG48L2Rpdj5gXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHAgPT4gYDx1bD4ke0FycmF5LmZyb20oIEFycmF5KCBwLml0ZW1MaXN0RWxlbWVudC5sZW5ndGggKS5rZXlzKCkgKS5tYXAoIG4gPT4gYDxsaT48L2xpPmAgKS5qb2luKCcnKX08L3VsPmBcbiIsIm1vZHVsZS5leHBvcnRzID0gcCA9PlxuYDxkaXY+XG4gICAgPGRpdj4ke3AubmFtZX08L2Rpdj5cbiAgICA8ZGl2PiR7cC5hZGRyZXNzLnN0cmVldEFkZHJlc3N9PC9kaXY+XG4gICAgPGRpdj5cbiAgICAgICAgPHNwYW4+JHtwLmFkZHJlc3MuYWRkcmVzc0xvY2FsaXR5fTwvc3Bhbj5cbiAgICAgICAgPHNwYW4+JHtwLmFkZHJlc3MuYWRkcmVzc1JlZ2lvbn08L3NwYW4+XG4gICAgICAgIDxzcGFuPiR7cC5hZGRyZXNzLnBvc3RhbENvZGV9PC9zcGFuPlxuICAgIDwvZGl2PlxuICAgIDxkaXY+JHtwLnRlbGVwaG9uZX08L2Rpdj5cbiAgICA8ZGl2PiR7cC5vcGVuaW5nSG91cnN9PC9kaXY+XG4gICAgPGRpdiBkYXRhLWpzPVwic29jaWFsXCI+PC9kaXY+XG48L2Rpdj5gXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHAgPT4gYDxpbWcgc3JjPVwiJHtwLmNvbnRlbnRVcmx9XCIgLz5gXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHAgPT4gYDxkaXY+JHtwLm5hbWV9PC9kaXY+YFxuIiwibW9kdWxlLmV4cG9ydHMgPSBlcnIgPT4geyBjb25zb2xlLmxvZyggZXJyLnN0YWNrIHx8IGVyciApIH1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgRXJyb3I6IHJlcXVpcmUoJy4vTXlFcnJvcicpLFxuXG4gICAgUDogKCBmdW4sIGFyZ3M9WyBdLCB0aGlzQXJnICkgPT5cbiAgICAgICAgbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4gUmVmbGVjdC5hcHBseSggZnVuLCB0aGlzQXJnIHx8IHRoaXMsIGFyZ3MuY29uY2F0KCAoIGUsIC4uLmNhbGxiYWNrICkgPT4gZSA/IHJlamVjdChlKSA6IHJlc29sdmUoY2FsbGJhY2spICkgKSApLFxuICAgIFxuICAgIGNvbnN0cnVjdG9yKCkgeyByZXR1cm4gdGhpcyB9XG59XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LiAoJyArIGVyICsgJyknKTtcbiAgICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2UgaWYgKGxpc3RlbmVycykge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oZXZsaXN0ZW5lcikpXG4gICAgICByZXR1cm4gMTtcbiAgICBlbHNlIGlmIChldmxpc3RlbmVyKVxuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICB9XG4gIHJldHVybiAwO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iXX0=
