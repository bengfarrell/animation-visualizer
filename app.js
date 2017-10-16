(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.App = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _baseconfig = require('./baseconfig.js');

var _baseconfig2 = _interopRequireDefault(_baseconfig);

var _basegroup = require('./basegroup.js');

var _basegroup2 = _interopRequireDefault(_basegroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BaseApplication = function () {
    function BaseApplication(el, cfg) {
        var _this = this;

        _classCallCheck(this, BaseApplication);

        this.appConfig = _baseconfig2.default.apply(cfg);
        this.element = el;
        this.engine = new BABYLON.Engine(this.element, this.appConfig.engine.antialias, this.appConfig.engine.options);
        this.engine.enableOfflineSupport = false;
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.useRightHandedSystem = this.appConfig.scene.useRightHandedSystem;

        this.isApplication = true;
        this.engine.runRenderLoop(function () {
            return _this.tick();
        });

        this.cameras = [];
        this.lights = [];

        if (this.appConfig.camera) {
            this.addCamera(this.appConfig.camera.type, this.appConfig.camera.position);
        }

        if (this.appConfig.lights) {
            this.addLights(this.appConfig.lights);
        }

        if (this.appConfig.inspector) {
            document.addEventListener('keydown', function (e) {
                return _this.onKeyDown(e);
            });
        }
        this.root = new _basegroup2.default();
        this.root.parent = this;
        this.root.initializeGroup(this.scene, 'application-root');
        this.root.onParented(this.scene, this, this.element);
        this.onCreate(this.scene);

        window.addEventListener('resize', function () {
            return _this.onResize();
        });

        this.initialized = true;
    }

    _createClass(BaseApplication, [{
        key: 'addCamera',


        /**
         * convenience method to add a typical camera
         */
        value: function addCamera(type, options) {
            if (!type) {
                type = 'freecamera';
            }

            if (!options.position) {
                options.position = new BABYLON.Vector3(0, 0, 0);
            }

            var camera = void 0;
            switch (type) {
                case 'default':
                case 'freecamera':
                    camera = new BABYLON.FreeCamera('camera', options.position, this.scene);
                    camera.setTarget(BABYLON.Vector3.Zero());
                    camera.attachControl(this.element, true);
                    break;

                case 'arcrotate':
                    camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 0, 0, 0, BABYLON.Vector3.Zero(), this.scene);
                    camera.attachControl(this.element, true);
                    camera.setPosition(options.position);
                    break;

                default:
                    console.error('Camera not added, ', type, ' is not found');
            }
            this.cameras.push(camera);
        }

        /**
         * convenience method to add a typical light
         */

    }, {
        key: 'addLights',
        value: function addLights() {
            var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.scene);
            light.intensity = 0.7;
        }
    }, {
        key: 'tick',


        /**
         * render engine tick
         */
        value: function tick() {
            if (this.initialized && this.cameras.length > 0) {
                this.scene.render();
                this.onRender(this.engine.getDeltaTime());
            }
        }

        /**
         * replace all scenes starting with application and spidering through children, restarting all render loops
         * @param scene
         * @param children
         */

    }, {
        key: 'replaceAllScenes',
        value: function replaceAllScenes(scene, children) {
            var _this2 = this;

            if (!children) {
                this.engine.stopRenderLoop();
                this.engine.runRenderLoop(function () {
                    return _this2.tick();
                });

                this.scene = scene;
                this.root.scene = scene;
                children = this.root.children;
            }
            for (var c = 0; c < children.length; c++) {
                if (children[c].isGroup) {
                    children[c].scene = scene;
                }

                if (children[c].children && children[c].children.length > 0) {
                    this.replaceAllScenes(scene, children[c].children);
                }
            }
        }
    }, {
        key: 'add',
        value: function add(objects) {
            return this.root.add(objects);
        }
    }, {
        key: 'remove',
        value: function remove(objects) {
            return this.root.remove(objects);
        }
    }, {
        key: 'removeAll',
        value: function removeAll(objects) {
            this.root.removeAll(objects);
        }
    }, {
        key: 'find',
        value: function find(name) {
            return this.root.find(name);
        }
    }, {
        key: 'onKeyDown',
        value: function onKeyDown(e) {
            if (this.config.inspector) {
                if (e.keyCode === this.config.inspector || String.fromCharCode(e.keyCode).toLowerCase() === this.config.inspector) {
                    if (this.scene.debugLayer.isVisible()) {
                        this.scene.debugLayer.hide();
                    } else {
                        this.scene.debugLayer.show();
                    }
                }
            }
        }
    }, {
        key: 'onResize',
        value: function onResize() {
            this.engine.resize();
        }
    }, {
        key: 'onCreate',
        value: function onCreate(sceneEl) {}
    }, {
        key: 'onRender',
        value: function onRender(time) {}
    }, {
        key: 'canvas',
        get: function get() {
            return this.element;
        }
    }, {
        key: 'name',
        get: function get() {
            return 'root';
        }
    }, {
        key: 'config',
        get: function get() {
            return this.appConfig;
        }
    }]);

    return BaseApplication;
}();

exports.default = BaseApplication;

},{"./baseconfig.js":2,"./basegroup.js":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = {
    default: {
        scene: {
            useRightHandedSystem: false
        },
        engine: {
            antialias: true,
            options: {}
        },
        camera: {
            type: 'freecamera',
            position: {
                x: 0,
                y: 0,
                z: 0
            }
        },
        inspector: 'i'
    },

    apply: function apply(cfg, node) {
        if (!node) {
            node = this.default;
        }
        for (var c in node) {
            if (!cfg[c]) {
                cfg[c] = node[c];
            } else {
                if (_typeof(cfg[c]) === 'object') {
                    cfg[c] = this.apply(cfg[c], node[c]);
                }
            }
        }

        return cfg;
    }
};

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventlistener = require('./utils/eventlistener.js');

var _eventlistener2 = _interopRequireDefault(_eventlistener);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseGroup = function (_EventListener) {
    _inherits(BaseGroup, _EventListener);

    function BaseGroup(params) {
        _classCallCheck(this, BaseGroup);

        var _this = _possibleConstructorReturn(this, (BaseGroup.__proto__ || Object.getPrototypeOf(BaseGroup)).call(this));

        _this._config = params;
        _this._children = [];
        _this.isGroup = true;
        return _this;
    }

    _createClass(BaseGroup, [{
        key: 'init',
        value: function init() {
            this.onCreate(this.config);
        }

        /**
         * get name of group
         */

    }, {
        key: 'initializeGroup',
        value: function initializeGroup(scene, name) {
            if (!name) {
                name = this.constructor.name + '-group';
            }
            this._group = new BABYLON.Mesh(name, scene);
        }
    }, {
        key: 'onParented',
        value: function onParented(scene, parent, canvas) {
            this.scene = scene;
            this._canvas = canvas;
            this.onCreate(scene);
        }

        /**
         * overridable methods
         * leave empty to be a simple abstraction we don't have to call super on
         * @param scene
         */

    }, {
        key: 'onRender',
        value: function onRender(scene, time) {}
    }, {
        key: 'onCreate',
        value: function onCreate(params) {}
    }, {
        key: 'add',


        /**
         * add object to parent
         * @param object
         */
        value: function add(objects) {
            var asArray = true;
            if (objects.length === undefined) {
                objects = [objects];
                asArray = false;
            }
            for (var c = 0; c < objects.length; c++) {
                if (objects[c].isGroup) {
                    if (!objects[c].group) {
                        objects[c].initializeGroup(this.scene);
                    }
                    objects[c].parent = this;
                    objects[c].group.parent = this._group;
                } else {
                    objects[c].parent = this._group;
                }
                this._children.push(objects[c]);
                if (objects[c].onParented) {
                    objects[c].onParented(this._scene, this._group, this._canvas);
                }
            }

            if (asArray) {
                return objects;
            } else {
                return objects[0];
            }
        }
    }, {
        key: 'remove',
        value: function remove(objects) {
            var asArray = true;
            if (objects.length === undefined) {
                objects = [objects];
                asArray = false;
            }

            this._children = this.children.filter(function (val) {
                return !objects.includes(val);
            });
            for (var c = 0; c < objects.length; c++) {
                this.scene.removeMesh(objects[c]);
            }

            if (asArray) {
                return objects;
            } else {
                return objects[0];
            }
        }
    }, {
        key: 'removeAll',
        value: function removeAll() {
            for (var c = 0; c < this._children.length; c++) {
                this._children[c].dispose();
            }
            this._children = [];
        }
    }, {
        key: 'find',
        value: function find(name) {
            for (var c = 0; c < this._children.length; c++) {
                if (this._children[c].name === name) {
                    return this._children[c];
                }
            }
            return null;
        }
    }, {
        key: 'tick',


        /**
         * render loop
         */
        value: function tick() {
            //console.log('tick', this.name)
            this.onRender(this.scene._engine.getDeltaTime());
        }
    }, {
        key: 'name',
        get: function get() {
            return this.constructor.name;
        }

        /**
         * get app config
         * @returns {*}
         */

    }, {
        key: 'appConfig',
        get: function get() {
            return this.application.appConfig;
        }

        /**
         * get config
         * @returns {*}
         */

    }, {
        key: 'config',
        get: function get() {
            return this._config;
        }
    }, {
        key: 'application',
        get: function get() {
            var parent = this.parent;
            while (parent) {
                if (parent.isApplication) {
                    return parent;
                }
                parent = parent.parent;
            }
        }

        /**
         * get parent group object
         * @returns {THREE.Object3D}
         */

    }, {
        key: 'group',
        get: function get() {
            return this._group;
        }
    }, {
        key: 'canvas',
        get: function get() {
            return this._canvas;
        }

        /**
         * get engine
         */

    }, {
        key: 'engine',
        get: function get() {
            return this._scene._engine;
        }

        /**
         * get babylon scene
         */

    }, {
        key: 'scene',
        get: function get() {
            return this._scene;
        }

        /**
         * set scene and rewire render loop for scene
         * @param val
         */
        ,
        set: function set(val) {
            var _this2 = this;

            if (this.scene) {
                //console.log(this.engine, this.name);
            }
            if (this._scene && this._scene._engine) {
                this._scene._engine.stopRenderLoop();
            }
            this._scene = val;
            this._scene._engine.runRenderLoop(function () {
                return _this2.tick();
            });
        }

        /**
         * get children of this group
         * @returns {Array}
         */

    }, {
        key: 'children',
        get: function get() {
            return this._children;
        }
    }]);

    return BaseGroup;
}(_eventlistener2.default);

exports.default = BaseGroup;

},{"./utils/eventlistener.js":4}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventListener = function () {
    function EventListener() {
        _classCallCheck(this, EventListener);

        /**
         * event listeners
         * @type {Array}
         * @private
         */
        this._listeners = [];
    }

    /**
     * add event listener
     * @param type
     * @param cb
     * @returns {{type: *, callback: *}}
     */


    _createClass(EventListener, [{
        key: "addListener",
        value: function addListener(type, cb) {
            var listener = { type: type, callback: cb };
            this._listeners.push(listener);
            return listener;
        }

        /**
         * remove event listener
         * @param listener
         */

    }, {
        key: "removeListener",
        value: function removeListener(listener) {
            for (var c = 0; c < this._listeners.length; c++) {
                if (listener === this._listeners[c]) {
                    this._listeners.splice(c, 0);
                    return;
                }
            }
        }

        /**
         * trigger event
         * @param type
         * @param params
         */

    }, {
        key: "triggerEvent",
        value: function triggerEvent(type, params) {
            this._listeners.forEach(function (l) {
                if (type == l.type) {
                    l.callback.apply(this, [type, params]);
                }
            });
        }
    }]);

    return EventListener;
}();

exports.default = EventListener;

},{}],5:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

var _gltffileloader = require('./io/gltffileloader.js');

var _gltffileloader2 = _interopRequireDefault(_gltffileloader);

var _gltfexploder = require('./io/gltfexploder.js');

var _gltfexploder2 = _interopRequireDefault(_gltfexploder);

var _baseapplication = require('../node_modules/macgyvr/src/baseapplication.js');

var _baseapplication2 = _interopRequireDefault(_baseapplication);

var _gltfobject = require('./objects/gltfobject.js');

var _gltfobject2 = _interopRequireDefault(_gltfobject);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Application = function (_BaseApplication) {
    _inherits(Application, _BaseApplication);

    function Application() {
        _classCallCheck(this, Application);

        return _possibleConstructorReturn(this, (Application.__proto__ || Object.getPrototypeOf(Application)).apply(this, arguments));
    }

    _createClass(Application, [{
        key: 'onCreate',
        value: function onCreate(scene) {
            var _this2 = this;

            this.config.components.timeline.addEventListener(AnimationTimeline.TRACK_SELECTED, function (e) {
                return _this2.onTrackSelection(e);
            });
            this.config.components.timeline.addEventListener(AnimationTimeline.SCRUB_TIMELINE, function (e) {
                return _this2.onScrubTimeline(e);
            });
            this.config.components.timeline.addEventListener(AnimationTimeline.TRACK_VISIBILITY_CHANGED, function (e) {
                return _this2.onTrackVisibilityChanged(e);
            });
            this.config.components.controls.addEventListener(AnimationPlaybackControls.CONTROL_CLICKED, function (e) {
                return _this2.onPlaybackControlClicked(e);
            });
            this.config.components.controls.addEventListener(AnimationPlaybackControls.LOAD_GLTF, function (e) {
                return _this2.loadFile(e);
            });
            this.config.components.samples.addEventListener(AnimationSampleGLTFs.SELECT_REMOTE_FILE, function (e) {
                return _this2.loadFile(e);
            });
            this.config.components.info.addEventListener(AnimationSceneInfo.SWITCH_COORDINATE_SYSTEM, function (e) {
                return _this2.switchCoordinateSystem(e);
            });
            this.time = 0;
            this.playing = false;
            this.gltf = this.add(new _gltfobject2.default());
        }
    }, {
        key: 'loadFile',
        value: function loadFile(event) {
            var _this3 = this;

            this.config.components.samples.style.display = 'none';

            var loader = new _gltffileloader2.default();
            loader.addListener(_gltffileloader2.default.LOADED, function (eventtype, event) {
                return _this3.onGLTFData(event);
            });
            if (typeof event === 'string') {
                var uri = event;
                this.config.components.info.setAttribute('filename', uri);
                loader.loadRemote(uri);
                this.gltf.load(uri);
            } else if (event.detail.uri) {
                this.config.components.info.setAttribute('filename', event.detail.uri);
                loader.loadRemote(event.detail.uri);
                this.gltf.load(event.detail.uri);
            } else {
                this.config.components.info.setAttribute('filename', event.detail.files[0].name);
                loader.loadLocal(event.detail.files);
                this.gltf.load(event.detail.inputevent);
            }

            this.gltf.time = this.time;
        }
    }, {
        key: 'onGLTFData',
        value: function onGLTFData(event) {
            var timeline = _gltfexploder2.default.generateTimeline(event.gltf.animations);
            this.config.components.timeline.data = timeline;
            this.gltf.duration = timeline.duration;
            this.config.components.controls.duration = timeline.duration;
            this.config.components.nodes.data = event.gltf.nodes;
        }
    }, {
        key: 'switchCoordinateSystem',
        value: function switchCoordinateSystem(event) {
            this.gltf.useRightHandedSystem = event.detail.rightHanded;
        }
    }, {
        key: 'onScrubTimeline',
        value: function onScrubTimeline(event) {
            if (!event.detail.resumeplayback) {
                this.playing = false;
            }

            this.time = event.detail.playbacktime;
        }
    }, {
        key: 'onTrackSelection',
        value: function onTrackSelection(event) {
            this.config.components.nodes.selectNodeByName(event.detail.name);
        }
    }, {
        key: 'onTrackVisibilityChanged',
        value: function onTrackVisibilityChanged(event) {
            this.gltf.toggleVisibility(event.detail.visible, event.detail.name, event.detail.playbacktime);
        }
    }, {
        key: 'onPlaybackControlClicked',
        value: function onPlaybackControlClicked(event) {
            this.playing = event.detail.isPlaying;

            switch (event.detail.action) {
                case AnimationPlaybackControls.STEP_FORWARD:
                    this.time += .01;
                    break;

                case AnimationPlaybackControls.STEP_BACKWARD:
                    this.time -= .01;
                    break;

                case AnimationPlaybackControls.FAST_FORWARD:
                    this.time += .1;
                    break;

                case AnimationPlaybackControls.FAST_BACKWARD:
                    this.time -= .1;
                    break;
            }
        }
    }, {
        key: 'onRender',
        value: function onRender(deltatime) {
            if (this.playing) {
                this.time += deltatime / 1000;
            }
        }
    }, {
        key: 'time',
        set: function set(t) {
            this._currentTime = t;

            if (this.gltf) {
                this.gltf.time = t;
            }

            if (this.config.components.timeline) {
                this.config.components.timeline.currentTime = t;
            }

            if (this.config.components.controls) {
                this.config.components.controls.time = t;
            }
        },
        get: function get() {
            return this._currentTime;
        }
    }]);

    return Application;
}(_baseapplication2.default);

exports.default = Application;

},{"../node_modules/macgyvr/src/baseapplication.js":1,"./io/gltfexploder.js":6,"./io/gltffileloader.js":7,"./objects/gltfobject.js":8}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
// lots of approach in binary processing here stolen from Babylon
// https://github.com/BabylonJS/Babylon.js/tree/master/loaders/src/glTF/2.0

// Only supports mashing the animation buffer pieces into the GLTF object for now
exports.default = {
    explode: function explode(gltf) {
        for (var f = 0; f < gltf.nodes.length; f++) {
            if (!gltf.nodes[f].name) {
                gltf.nodes[f].name = 'Node ' + Number(f + 1) + ' (unnamed)';
            }
        }
        for (var c = 0; c < gltf.animations.length; c++) {
            // wire sampler references within channels for easy access
            for (var d = 0; d < gltf.animations[c].channels.length; d++) {
                gltf.animations[c].channels[d]._samplerRef = gltf.animations[c].samplers[gltf.animations[c].channels[d].sampler];
                gltf.animations[c].channels[d]._samplerRef._channelRef = gltf.animations[c].channels[d];
                gltf.animations[c].channels[d].target._nodeRef = gltf.nodes[gltf.animations[c].channels[d].target.node];
            }

            // get accessor references for samplers and resolve data from buffer
            for (var e = 0; e < gltf.animations[c].samplers.length; e++) {
                gltf.animations[c].samplers[e]._inputRef = gltf.accessors[gltf.animations[c].samplers[e].input];

                // for animation, input refers to keyframe times
                gltf.animations[c].samplers[e]._inputValues = this._resolveAnimationSamplerData('keyframes', gltf, gltf.animations[c].samplers[e]._inputRef);

                // output refers to scale, rotate, or translate
                gltf.animations[c].samplers[e]._outputRef = gltf.accessors[gltf.animations[c].samplers[e].output];
                gltf.animations[c].samplers[e]._outputRef._bufferViewRef = gltf.bufferViews[gltf.animations[c].samplers[e]._outputRef.bufferView];

                var transformType = gltf.animations[c].samplers[e]._channelRef.target.path;
                gltf.animations[c].samplers[e]._outputValues = this._resolveAnimationSamplerData(transformType, gltf, gltf.animations[c].samplers[e]._outputRef);
            }
        }
        return gltf;
    },
    _resolveAnimationSamplerData: function _resolveAnimationSamplerData(type, gltf, samplerData) {
        var bufferView = gltf.bufferViews[samplerData.bufferView];
        var buffer = gltf.buffers[bufferView.buffer].data;

        // map bufferView to actual mem ref
        samplerData._bufferViewRef = bufferView;

        var byteOffset = bufferView.byteOffset;
        if (samplerData.byteOffset) {
            byteOffset += samplerData.byteOffset;
        }
        var byteLength = samplerData.count * this._getByteStrideFromType(samplerData);
        var values = this._parseBufferData(buffer, byteOffset, byteLength, samplerData.componentType);

        if (type === 'keyframes') {
            return values;
        } else {
            var counter = 0;
            var transforms = [];
            var vec = void 0;

            for (var c = 0; c < values.length; c++) {
                switch (counter) {
                    case 0:
                        transforms.push({});
                        vec = transforms[transforms.length - 1];
                        vec.x = values[c];
                        counter++;
                        break;

                    case 1:
                        vec.y = values[c];
                        counter++;
                        break;

                    case 2:
                        vec.z = values[c];

                        counter++;
                        if (type !== 'rotation') {
                            counter = 0;
                        }
                        break;

                    case 3:
                        vec.w = values[c];
                        counter = 0;
                        break;
                }
            }
            return transforms;
        }
    },
    _getByteStrideFromType: function _getByteStrideFromType(accessor) {
        switch (accessor.type) {
            case "SCALAR":
                return 1;
            case "VEC2":
                return 2;
            case "VEC3":
                return 3;
            case "VEC4":
                return 4;
            case "MAT2":
                return 4;
            case "MAT3":
                return 9;
            case "MAT4":
                return 16;
            default:
                console.warn("Invalid accessor type (" + accessor.type + ")");
                return 0;
        }
    },
    _parseBufferData: function _parseBufferData(buffer, byteOffset, byteLength, componentType) {
        var bufferViewData = void 0;
        switch (componentType) {
            case this.EComponentType.BYTE:
                bufferViewData = new Int8Array(buffer, byteOffset, byteLength);
                break;
            case this.EComponentType.UNSIGNED_BYTE:
                bufferViewData = new Uint8Array(buffer, byteOffset, byteLength);
                break;
            case this.EComponentType.SHORT:
                bufferViewData = new Int16Array(buffer, byteOffset, byteLength);
                break;
            case this.EComponentType.UNSIGNED_SHORT:
                bufferViewData = new Uint16Array(buffer, byteOffset, byteLength);
                break;
            case this.EComponentType.UNSIGNED_INT:
                bufferViewData = new Uint32Array(buffer, byteOffset, byteLength);
                break;
            case this.EComponentType.FLOAT:
                bufferViewData = new Float32Array(buffer, byteOffset, byteLength);
                break;
            default:
                console.warn("Invalid component type (" + componentType + ")");
                return;
        }
        return bufferViewData;
    },
    generateTimeline: function generateTimeline(gltfAnims) {
        var start = void 0;
        var end = void 0;
        var timeline = { animations: [] };
        for (var c = 0; c < gltfAnims.length; c++) {
            var tracks = this._generateTracksForAnimation(gltfAnims[c]);
            if (!start || start > tracks.start) {
                start = tracks.start;
            }
            if (!end || end < tracks.end) {
                end = tracks.end;
            }
            timeline.animations.push({ animation: tracks });
        }

        timeline.start = start;
        timeline.end = end;
        timeline.duration = end - start;
        return timeline;
    },
    _generateTracksForAnimation: function _generateTracksForAnimation(animation) {
        var tracks = {};
        var startTime = -1;
        var endTime = -1;
        for (var c = 0; c < animation.channels.length; c++) {
            if (!tracks[animation.channels[c].target._nodeRef.name]) {
                tracks[animation.channels[c].target._nodeRef.name] = [];
            }

            var currentChannel = tracks[animation.channels[c].target._nodeRef.name];

            for (var d = 0; d < animation.channels[c]._samplerRef._inputValues.length; d++) {
                var time = animation.channels[c]._samplerRef._inputValues[d];
                if (startTime === -1 || time < startTime) {
                    startTime = time;
                }
                if (endTime === -1 || time > endTime) {
                    endTime = time;
                }

                var keyframe = void 0;
                for (var e = 0; e < currentChannel.length; e++) {
                    if (currentChannel[e].time === time) {
                        keyframe = currentChannel[e];
                    }
                }
                if (!keyframe) {
                    keyframe = { time: time, transform: {}, name: animation.channels[c].target._nodeRef.name };
                    currentChannel.push(keyframe);
                }

                var transformType = animation.channels[c].target.path;
                keyframe.transform[transformType] = animation.channels[c]._samplerRef._outputValues[d];
            }
        }

        return { start: startTime, end: endTime, duration: endTime - startTime, tracks: tracks };
    },

    EComponentType: {
        BYTE: 5120,
        UNSIGNED_BYTE: 5121,
        SHORT: 5122,
        UNSIGNED_SHORT: 5123,
        UNSIGNED_INT: 5125,
        FLOAT: 5126
    }
};

},{}],7:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

var _gltfexploder = require('./gltfexploder.js');

var _gltfexploder2 = _interopRequireDefault(_gltfexploder);

var _eventlistener = require('../../node_modules/macgyvr/src/utils/eventlistener.js');

var _eventlistener2 = _interopRequireDefault(_eventlistener);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var GLTFFileLoader = function (_EventListener) {
    _inherits(GLTFFileLoader, _EventListener);

    function GLTFFileLoader() {
        _classCallCheck(this, GLTFFileLoader);

        var _this = _possibleConstructorReturn(this, (GLTFFileLoader.__proto__ || Object.getPrototypeOf(GLTFFileLoader)).call(this));

        _this.bufferDictionary = {};
        _this.bufferCount = 0;
        return _this;
    }

    _createClass(GLTFFileLoader, [{
        key: 'loadLocal',
        value: function loadLocal(filerefs) {
            var _this2 = this;

            var _loop = function _loop(c) {
                var filename = filerefs[c].name;
                if (filename.split('.')[filename.split('.').length - 1].toLowerCase() === 'bin') {
                    var reader = new FileReader();
                    _this2.bufferCount++;
                    reader.onload = function (e) {
                        _this2.onBinLoaded(filename, e);
                    };
                    reader.readAsArrayBuffer(filerefs[c]);
                } else if (filename.split('.')[filename.split('.').length - 1].toLowerCase() === 'gltf') {
                    var _reader = new FileReader();
                    _reader.onload = function (e) {
                        _this2.onGLTFLoaded(filename, e);
                    };
                    _reader.readAsText(filerefs[c]);
                }
            };

            for (var c = 0; c < filerefs.length; c++) {
                _loop(c);
            }
        }
    }, {
        key: 'loadRemote',
        value: function loadRemote(path) {
            var _this3 = this;

            this._filename = path.split('/')[path.split('/').length - 1];
            this._basepath = path.substr(0, path.indexOf(this._filename));
            var loader = new XMLHttpRequest();
            loader.open('GET', path, true);
            loader.onload = function (data) {
                _this3.gltf = JSON.parse(loader.response);
                _this3.buffers = _this3.gltf.buffers;

                var _loop2 = function _loop2(c) {
                    _this3.bufferCount++;
                    var loader = new XMLHttpRequest();
                    loader.responseType = 'arraybuffer';
                    loader.open('GET', _this3._basepath + _this3.buffers[c].uri, true);
                    loader.onload = function (e) {
                        _this3.onBinLoaded(_this3.buffers[c].uri, e);
                    };
                    loader.send();
                };

                for (var c = 0; c < _this3.buffers.length; c++) {
                    _loop2(c);
                }
            };
            loader.send();
        }
    }, {
        key: 'onGLTFLoaded',
        value: function onGLTFLoaded(filename, e) {
            this.gltf = JSON.parse(e.target.result);
            var loaded = this.checkLoadedFiles();
            if (loaded) {
                this.onLoadComplete();
            }
        }
    }, {
        key: 'onBinLoaded',
        value: function onBinLoaded(filename, e) {
            if (e.target.result) {
                this.bufferDictionary[filename] = e.target.result;
            } else if (e.target.response) {
                this.bufferDictionary[filename] = e.target.response;
            } else {
                throw new Error(filename + ' cannot be loaded', e.target);
            }
            var loaded = this.checkLoadedFiles();
            if (loaded) {
                this.onLoadComplete();
            }
        }
    }, {
        key: 'onLoadComplete',
        value: function onLoadComplete() {
            for (var c = 0; c < this.gltf.buffers.length; c++) {
                this.gltf.buffers[c].data = this.bufferDictionary[this.gltf.buffers[c].uri];
            }

            this.gltf = _gltfexploder2.default.explode(this.gltf);
            this.triggerEvent(GLTFFileLoader.LOADED, { gltf: this.gltf });
        }
    }, {
        key: 'checkLoadedFiles',
        value: function checkLoadedFiles() {
            if (this.gltf && this.bufferCount === Object.keys(this.bufferDictionary).length) {
                return true;
            } else {
                return false;
            }
        }
    }]);

    return GLTFFileLoader;
}(_eventlistener2.default);

exports.default = GLTFFileLoader;

GLTFFileLoader.LOADED = 'onGLTFLoaded';

},{"../../node_modules/macgyvr/src/utils/eventlistener.js":4,"./gltfexploder.js":6}],8:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

var _basegroup = require('../../node_modules/macgyvr/src/basegroup.js');

var _basegroup2 = _interopRequireDefault(_basegroup);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var GLTFObject = function (_BaseGroup) {
    _inherits(GLTFObject, _BaseGroup);

    function GLTFObject() {
        _classCallCheck(this, GLTFObject);

        return _possibleConstructorReturn(this, (GLTFObject.__proto__ || Object.getPrototypeOf(GLTFObject)).apply(this, arguments));
    }

    _createClass(GLTFObject, [{
        key: 'onCreate',

        /**
         * on create scene
         * @param scene
         * @param sceneinfo
         */
        value: function onCreate(scene, sceneinfo) {
            var _this2 = this;

            this._duration = 0;
            this._currentTime = 0;
            BABYLON.SceneLoader.ShowLoadingScreen = false;
            this._useRightHandedCoordinates = false;
            this.filesInput = new BABYLON.FilesInput(this.engine, this.scene, this.canvas, function (scenefile, scene) {
                return _this2.onSceneLoaded(scenefile, scene);
            });
        }
    }, {
        key: 'load',
        value: function load(value) {
            var _this3 = this;

            if (typeof value === 'string') {
                var uri = value;
                var filename = uri.split('/')[uri.split('/').length - 1];
                var basepath = uri.substr(0, uri.indexOf(filename));
                var loader = new BABYLON.AssetsManager(this.scene);
                loader.useDefaultLoadingScreen = false;
                var task = loader.addMeshTask('task', '', basepath, filename);
                task.onSuccess = function (asset) {
                    return _this3.onMeshesLoaded(asset);
                };
                loader.load();
            } else {
                var event = value;
                this.filesInput.loadFiles(event);
            }
        }
    }, {
        key: 'onMeshesLoaded',
        value: function onMeshesLoaded(asset) {
            this.add(asset.loadedMeshes);
            if (this._useRightHandedCoordinates) {
                this.group.rotation.x = Math.PI / 2;
            } else {
                this.group.rotation.x = -Math.PI / 2;
            }
            this.prepareScene(this.scene);
        }
    }, {
        key: 'onSceneLoaded',
        value: function onSceneLoaded(scenefile, scene) {
            this.application.replaceAllScenes(scene);
            this.prepareScene(scene);
        }
    }, {
        key: 'prepareScene',
        value: function prepareScene(scene) {
            // remove camera from scene to add our own
            if (scene.activeCamera) {
                scene.activeCamera.dispose();
                scene.activeCamera = null;
            }

            scene.createDefaultCameraOrLight(true);
            scene.activeCamera.attachControl(this.canvas);

            if (scene.lights.length === 0) {
                this.application.addLights();
            }

            // pause all to start - if synchronous, the scene doesn't seem to show up
            setTimeout(function () {
                for (var c = 0; c < scene.Animatables.length; c++) {
                    scene.Animatables[c].goToFrame(0);
                    scene.Animatables[c].pause();
                }
            }, 50);

            var worldExtends = scene.getWorldExtends();
            var sceneMidPoint = void 0;
            if (this._useRightHandedCoordinates) {
                sceneMidPoint = new BABYLON.Vector3((worldExtends.max.x + worldExtends.min.x) / 2, worldExtends.max.y, (worldExtends.max.z + worldExtends.min.z) / 2);
            } else {
                sceneMidPoint = new BABYLON.Vector3((worldExtends.max.x + worldExtends.min.x) / 2, (worldExtends.max.y + worldExtends.min.y) / 2, (worldExtends.max.z + worldExtends.min.z) / 2);
            }
            scene.activeCamera.setTarget(sceneMidPoint);
        }
    }, {
        key: 'toggleVisibility',
        value: function toggleVisibility(visible, name) {
            var milliseconds = this.scene._animationTime;
            for (var c = 0; c < this.scene.Animatables.length; c++) {
                //let frameRate = this.scene.Animatables[c]._animations[0].framePerSecond;
                if (this.scene.Animatables[c].target.name === name) {
                    if (visible) {
                        this.scene.Animatables[c].restart();
                        this.scene.Animatables[c].goToFrame(10);
                    } else {
                        this.scene.Animatables[c].pause();
                    }
                }
            }
        }
    }, {
        key: 'onRender',
        value: function onRender(deltatime) {}
    }, {
        key: 'useRightHandedSystem',
        set: function set(val) {
            this._useRightHandedCoordinates = val;
            this.scene.useRightHandedSystem = val;
        }
    }, {
        key: 'duration',
        set: function set(dur) {
            this._duration = dur;
        },
        get: function get() {
            return this._duration;
        }
    }, {
        key: 'time',
        set: function set(t) {
            t = t % this.duration;
            this._currentTime = t;
            for (var c = 0; c < this.scene.Animatables.length; c++) {
                this.scene.Animatables[c].goToFrame(t);
            }
        }
    }]);

    return GLTFObject;
}(_basegroup2.default);

exports.default = GLTFObject;

},{"../../node_modules/macgyvr/src/basegroup.js":3}]},{},[5])(5)
});

//# sourceMappingURL=app.js.map
