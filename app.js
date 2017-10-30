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

var _avizTimeline = require('./components/aviz-timeline/aviz-timeline.js');

var _avizTimeline2 = _interopRequireDefault(_avizTimeline);

var _avizPlaybackControls = require('./components/aviz-playback-controls/aviz-playback-controls.js');

var _avizPlaybackControls2 = _interopRequireDefault(_avizPlaybackControls);

var _avizSampleGltfs = require('./components/aviz-sample-gltfs/aviz-sample-gltfs.js');

var _avizSampleGltfs2 = _interopRequireDefault(_avizSampleGltfs);

var _avizSceneInfo = require('./components/aviz-scene-info/aviz-scene-info.js');

var _avizSceneInfo2 = _interopRequireDefault(_avizSceneInfo);

var _avizNodesList = require('./components/aviz-nodes-list/aviz-nodes-list.js');

var _avizNodesList2 = _interopRequireDefault(_avizNodesList);

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

            this.config.components.timeline.addEventListener(_avizTimeline2.default.TRACK_SELECTED, function (e) {
                return _this2.onTrackSelection(e);
            });
            this.config.components.timeline.addEventListener(_avizTimeline2.default.SCRUB_TIMELINE, function (e) {
                return _this2.onScrubTimeline(e);
            });
            this.config.components.timeline.addEventListener(_avizTimeline2.default.TRACK_VISIBILITY_CHANGED, function (e) {
                return _this2.onTrackVisibilityChanged(e);
            });
            this.config.components.controls.addEventListener(_avizPlaybackControls2.default.CONTROL_CLICKED, function (e) {
                return _this2.onPlaybackControlClicked(e);
            });
            this.config.components.controls.addEventListener(_avizPlaybackControls2.default.LOAD_GLTF, function (e) {
                return _this2.loadFile(e);
            });
            this.config.components.samples.addEventListener(_avizSampleGltfs2.default.SELECT_REMOTE_FILE, function (e) {
                return _this2.loadFile(e);
            });
            this.config.components.info.addEventListener(_avizSceneInfo2.default.SWITCH_COORDINATE_SYSTEM, function (e) {
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
                case _avizPlaybackControls2.default.STEP_FORWARD:
                    this.time += .01;
                    break;

                case _avizPlaybackControls2.default.STEP_BACKWARD:
                    this.time -= .01;
                    break;

                case _avizPlaybackControls2.default.FAST_FORWARD:
                    this.time += .1;
                    break;

                case _avizPlaybackControls2.default.FAST_BACKWARD:
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

},{"../node_modules/macgyvr/src/baseapplication.js":1,"./components/aviz-nodes-list/aviz-nodes-list.js":6,"./components/aviz-playback-controls/aviz-playback-controls.js":8,"./components/aviz-sample-gltfs/aviz-sample-gltfs.js":10,"./components/aviz-scene-info/aviz-scene-info.js":12,"./components/aviz-timeline/aviz-timeline.js":14,"./io/gltfexploder.js":16,"./io/gltffileloader.js":17,"./objects/gltfobject.js":18}],6:[function(require,module,exports){
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

var _template = require('./template.js');

var _template2 = _interopRequireDefault(_template);

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

var AnimationNodes = function (_HTMLElement) {
    _inherits(AnimationNodes, _HTMLElement);

    _createClass(AnimationNodes, null, [{
        key: 'observedAttributes',
        get: function get() {
            return [];
        }
    }]);

    function AnimationNodes() {
        _classCallCheck(this, AnimationNodes);

        // two ways to represent the node list (same nodes)
        var _this = _possibleConstructorReturn(this, (AnimationNodes.__proto__ || Object.getPrototypeOf(AnimationNodes)).call(this));

        _this._tree = { name: "Scene Root", index: -1, children: [] };
        _this._list = [];
        _this._breadcrumbTrail = [];
        _this.dom = {};
        return _this;
    }

    _createClass(AnimationNodes, [{
        key: 'connectedCallback',
        value: function connectedCallback() {
            this.innerHTML = _template2.default.get();
            this.dom.list = this.querySelector('ul');
            this.dom.header = this.querySelector('.node-header');
            this.dom.breadcrumbs = this.querySelector('.breadcrumbs');

            this.addBreadcrumb(this._tree);
        }
    }, {
        key: 'selectNodeByName',
        value: function selectNodeByName(name) {
            for (var c = 0; c < this._list.length; c++) {
                if (this._list[c].name == name) {
                    var node = this._list[c];
                    this._breadcrumbTrail = [];
                    while (node.parent) {
                        this._breadcrumbTrail.push(node);
                        node = node.parent;
                    }

                    this._breadcrumbTrail.reverse();
                    this.renderBreadcrumbs();
                    this.renderNode(this._list[c]);
                }
            }
        }
    }, {
        key: 'renderNode',
        value: function renderNode(node) {
            var _this2 = this;

            this.dom.list.innerHTML = '';
            this.dom.header.innerHTML = node.name;
            for (var c = 0; c < node.children.length; c++) {
                var el = document.createElement('li');
                el.innerHTML = this.nodeTemplate(node.children[c].index, node.children[c].name, node.children[c].transform, node.children[c].children.length);

                var expand = el.querySelector('.expand');
                if (expand) {
                    expand.addEventListener('click', function (e) {
                        return _this2.onExpandClick(e);
                    });
                }

                this.dom.list.appendChild(el);
            }
        }
    }, {
        key: 'renderBreadcrumbs',
        value: function renderBreadcrumbs() {
            var _this3 = this;

            this.dom.breadcrumbs.innerHTML = '';
            for (var c = 0; c < this._breadcrumbTrail.length - 1; c++) {
                var el = document.createElement('span');
                el.classList.add('circle');
                el.dataset.index = this._breadcrumbTrail[c].index;
                el.addEventListener('click', function (e) {
                    return _this3.onBreadcrumbClicked(e);
                });
                this.dom.breadcrumbs.appendChild(el);
            }
        }
    }, {
        key: 'addBreadcrumb',
        value: function addBreadcrumb(node) {
            this._breadcrumbTrail.push(node);
            this.renderBreadcrumbs();
        }
    }, {
        key: 'nodeTemplate',
        value: function nodeTemplate(index, name, transform, numChildren) {
            var tPos = void 0,
                tRot = void 0,
                tScale = void 0;
            if (!transform.position) {
                tPos = ['-', '-', '-'];
            } else {
                tPos = [transform.position[0].toFixed(2), transform.position[1].toFixed(2), transform.position[2].toFixed(2)];
            }

            if (!transform.rotation) {
                tRot = ['-', '-', '-', '-'];
            } else {
                tRot = [transform.rotation[0].toFixed(2), transform.rotation[1].toFixed(2), transform.rotation[2].toFixed(2), transform.rotation[3].toFixed(2)];
            }

            if (!transform.scale) {
                tScale = ['-', '-', '-'];
            } else {
                tScale = [transform.scale[0].toFixed(2), transform.scale[1].toFixed(2), transform.scale[2].toFixed(2)];
            }

            var expand = '';
            if (numChildren === 1) {
                expand = '<a data-index="' + index + '"> + (' + numChildren + ' child)</a>';
            } else if (numChildren > 1) {
                expand = '<a data-index="' + index + '"> + (' + numChildren + ' children)</a>';
            }

            return '<div><p class="name">' + name + '</p><p class="expand">' + expand + '</p></div>\n                <div class="transform">\n                    <div class="position"><div class="transform-label">T</div>\n                        <div class="value">' + tPos[0] + '</div> \n                        <div class="value">' + tPos[1] + '</div>\n                        <div class="value">' + tPos[2] + '</div>\n                    </div>\n                    <div class="rotation"><div class="transform-label">R</div>\n                        <div class="value">' + tRot[0] + '</div>\n                        <div class="value">' + tRot[1] + '</div>\n                        <div class="value">' + tRot[2] + '</div>\n                        <div class="value">' + tRot[3] + '</div>\n                    </div>\n                    <div class="scale"><div class="transform-label">S</div> \n                        <div class="value">' + tScale[0] + '</div>\n                        <div class="value">' + tScale[1] + '</div> \n                        <div class="value">' + tScale[2] + '</div>\n                    </div>\n                </div>';
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this._tree = { name: "Scene Root", index: -1, children: [] };
            this.dom.list.innerHTML = '';
            this.dom.breadcrumbs.innerHTML = '';
        }
    }, {
        key: 'onBreadcrumbClicked',
        value: function onBreadcrumbClicked(e) {
            var nodeIndex = parseInt(e.target.dataset.index);
            for (var d = 0; d < this._breadcrumbTrail.length; d++) {
                if (nodeIndex === this._breadcrumbTrail[d].index) {
                    this._breadcrumbTrail = this._breadcrumbTrail.splice(0, d + 1);
                    this.renderBreadcrumbs();
                }
            }

            if (nodeIndex === -1) {
                this.renderNode(this._tree);
                return;
            }

            for (var c = 0; c < this._list.length; c++) {
                if (this._list[c].index === nodeIndex) {
                    this.renderNode(this._list[c]);
                    return;
                }
            }
        }
    }, {
        key: 'onExpandClick',
        value: function onExpandClick(e) {
            var nodeIndex = e.target.dataset.index;
            for (var c = 0; c < this._list.length; c++) {
                if (this._list[c].index == nodeIndex) {
                    this.renderNode(this._list[c]);
                    this.addBreadcrumb(this._list[c]);
                }
            }
        }
    }, {
        key: 'disconnectedCallback',
        value: function disconnectedCallback() {}
    }, {
        key: 'attributeChangedCallback',
        value: function attributeChangedCallback(attributeName, oldValue, newValue, namespace) {}
    }, {
        key: 'adoptedCallback',
        value: function adoptedCallback(oldDocument, newDocument) {}
    }, {
        key: 'data',
        set: function set(nodes) {
            this.destroy();
            this._list = [];
            for (var c = 0; c < nodes.length; c++) {

                var transform = {};
                if (nodes[c].translation) {
                    transform.translation = nodes[c].translation;
                }
                if (nodes[c].rotation) {
                    transform.rotation = nodes[c].rotation;
                }
                if (nodes[c].scale) {
                    transform.scale = nodes[c].scale;
                }

                var node = {
                    name: nodes[c].name,
                    index: c,
                    transform: transform,
                    children: nodes[c].children ? nodes[c].children : []
                };

                this._list.push(node);
            }

            for (var d = 0; d < this._list.length; d++) {
                if (this._list[d].children.length > 0) {
                    for (var e = 0; e < this._list[d].children.length; e++) {
                        // replace indices with nodes
                        this._list[d].children[e] = this._list[this._list[d].children[e]];
                        this._list[d].children[e].parent = this._list[d];
                    }
                }
            }

            for (var f = 0; f < this._list.length; f++) {
                if (!this._list[f].parent) {
                    this._list[f].parent = this._tree;
                    this._tree.children.push(this._list[f]);
                }
            }

            this.renderNode(this._tree);
        }
    }]);

    return AnimationNodes;
}(HTMLElement);

exports.default = AnimationNodes;

if (!customElements.get('aviz-nodes-list')) {
    customElements.define('aviz-nodes-list', AnimationNodes);
}

},{"./template.js":7}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    get: function get() {
        return "<div class=\"node-header\"></div>\n            <div class=\"breadcrumbs\"></div>\n            <ul class=\"nodes-list\">\n            </ul>";
    }
};

},{}],8:[function(require,module,exports){
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

var _template = require('./template.js');

var _template2 = _interopRequireDefault(_template);

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

var AnimationPlaybackControls = function (_HTMLElement) {
    _inherits(AnimationPlaybackControls, _HTMLElement);

    _createClass(AnimationPlaybackControls, null, [{
        key: 'observedAttributes',
        get: function get() {
            return [];
        }
    }]);

    function AnimationPlaybackControls() {
        _classCallCheck(this, AnimationPlaybackControls);

        var _this = _possibleConstructorReturn(this, (AnimationPlaybackControls.__proto__ || Object.getPrototypeOf(AnimationPlaybackControls)).call(this));

        _this._playing = false;
        _this.dom = {};
        _this._duration = 0;

        document.body.addEventListener('drop', function (e) {
            return _this.onFileDropped(e);
        }, false);
        document.body.addEventListener("dragover", function (e) {
            return _this.onFileHover(e);
        }, false);
        //document.body.addEventListener("dragleave", e => this.onFileHover(e), false);
        return _this;
    }

    _createClass(AnimationPlaybackControls, [{
        key: 'connectedCallback',
        value: function connectedCallback() {
            var _this2 = this;

            this.innerHTML = _template2.default.get();
            this.dom.buttons = {};
            this.dom.buttons.fastForwardBtn = this.querySelector('.fast-forward');
            this.dom.buttons.fastBackwardBtn = this.querySelector('.fast-backward');
            this.dom.buttons.stepForwardBtn = this.querySelector('.step-forward');
            this.dom.buttons.stepBackwardBtn = this.querySelector('.step-backward');
            this.dom.buttons.playpauseBtn = this.querySelector('.playpause');
            this.dom.buttonContainer = this.querySelector('.button-container');
            this.dom.loadGLTFButton = this.querySelector('.load-button');
            this.dom.timeDisplay = this.querySelector('.time-display');
            this.dom.fileInput = this.querySelector('.file-input');
            this.dom.buttonContainer.addEventListener('click', function (e) {
                return _this2.onButtonClick(e);
            });
            this.dom.fileInput.addEventListener('change', function (e) {
                return _this2.onFileInputChange(e);
            });
            this.togglePlay(false);
        }
    }, {
        key: 'onFileDropped',
        value: function onFileDropped(event) {
            event.stopPropagation();
            event.preventDefault();
            if (!event.dataTransfer.files[0]) {
                return;
            }
            var e = new CustomEvent(AnimationPlaybackControls.LOAD_GLTF, { 'detail': { files: event.dataTransfer.files, inputevent: event } });
            this.dispatchEvent(e);
        }
    }, {
        key: 'onFileHover',
        value: function onFileHover(event) {
            event.stopPropagation();
            event.preventDefault();
        }
    }, {
        key: 'onFileInputChange',
        value: function onFileInputChange(event) {
            if (!event.target.files[0]) {
                return;
            }
            var e = new CustomEvent(AnimationPlaybackControls.LOAD_GLTF, { 'detail': { files: event.target.files, inputevent: event } });
            this.dispatchEvent(e);
        }
    }, {
        key: 'onButtonClick',
        value: function onButtonClick(event) {
            var action = '';
            switch (event.target) {
                case this.dom.buttons.fastBackwardBtn:
                    action = AnimationPlaybackControls.FAST_BACKWARD;
                    break;

                case this.dom.buttons.fastForwardBtn:
                    action = AnimationPlaybackControls.FAST_FORWARD;
                    break;

                case this.dom.buttons.stepBackwardBtn:
                    action = AnimationPlaybackControls.STEP_BACKWARD;
                    break;

                case this.dom.buttons.stepForwardBtn:
                    action = AnimationPlaybackControls.STEP_FORWARD;
                    break;

                case this.dom.buttons.playpauseBtn:
                    this._playing = !this._playing;
                    this.togglePlay(this._playing);

                    if (this._playing) {
                        action = AnimationPlaybackControls.PLAY;
                    } else {
                        action = AnimationPlaybackControls.PAUSE;
                    }
                    break;
            }

            // lastly, turn off playback if we're stepping through
            if (event.target !== this.dom.buttons.playpauseBtn) {
                this.togglePlay(false);
                this._playing = false;
            }

            var e = new CustomEvent(AnimationPlaybackControls.CONTROL_CLICKED, {
                'detail': { action: action, isPlaying: this._playing } });
            this.dispatchEvent(e);
        }
    }, {
        key: 'togglePlay',
        value: function togglePlay(playing) {
            if (playing) {
                this.dom.buttons.playpauseBtn.classList.remove('play');
                this.dom.buttons.playpauseBtn.classList.add('pause');
            } else {
                this.dom.buttons.playpauseBtn.classList.remove('pause');
                this.dom.buttons.playpauseBtn.classList.add('play');
            }
        }
    }, {
        key: 'disconnectedCallback',
        value: function disconnectedCallback() {}
    }, {
        key: 'attributeChangedCallback',
        value: function attributeChangedCallback(attributeName, oldValue, newValue, namespace) {}
    }, {
        key: 'adoptedCallback',
        value: function adoptedCallback(oldDocument, newDocument) {}
    }, {
        key: 'time',
        set: function set(value) {
            if (this._duration === 0) {
                return;
            }

            if (value > this._duration) {
                value = value % this._duration;
            }
            this.dom.timeDisplay.innerText = value.toFixed(3) + ' / ' + this._duration.toFixed(3);
        }
    }, {
        key: 'duration',
        set: function set(value) {
            this._duration = value;
        }
    }]);

    return AnimationPlaybackControls;
}(HTMLElement);

exports.default = AnimationPlaybackControls;

AnimationPlaybackControls.CONTROL_CLICKED = 'onControlClicked';
AnimationPlaybackControls.LOAD_GLTF = 'onLoadGLTF';
AnimationPlaybackControls.ANIMATION_SELECTED = 'onAnimationSelected';
AnimationPlaybackControls.PLAY = 'play';
AnimationPlaybackControls.PAUSE = 'pause';
AnimationPlaybackControls.FAST_FORWARD = 'fastforward';
AnimationPlaybackControls.FAST_BACKWARD = 'fastbackward';
AnimationPlaybackControls.STEP_FORWARD = 'stepforward';
AnimationPlaybackControls.STEP_BACKWARD = 'stepbackward';

if (!customElements.get('aviz-playback-controls')) {
    customElements.define('aviz-playback-controls', AnimationPlaybackControls);
}

},{"./template.js":9}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    get: function get() {
        return "<div class=\"button-container\">\n                    <div class=\"fast-backward btn\"></div>\n                    <div class=\"step-backward btn\"></div>\n                    <div class=\"playpause btn\"></div>\n                    <div class=\"step-forward btn\"></div>\n                    <div class=\"fast-forward btn\"></div>\n                </div>\n                <div class=\"time-display\">- / -</div>\n                <div class=\"load-button\">\n                    <div>Load glTF...</div>\n                    <input type=\"file\" class=\"file-input\" id=\"files\" name=\"files[]\" accept=\".gltf, .bin, .png, .jpg, .jpeg, .gif\" multiple />\n                </div>";
    }
};

},{}],10:[function(require,module,exports){
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

var _template = require('./template.js');

var _template2 = _interopRequireDefault(_template);

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

var AnimationSampleGLTFs = function (_HTMLElement) {
    _inherits(AnimationSampleGLTFs, _HTMLElement);

    _createClass(AnimationSampleGLTFs, null, [{
        key: 'observedAttributes',
        get: function get() {
            return [];
        }
    }]);

    function AnimationSampleGLTFs() {
        _classCallCheck(this, AnimationSampleGLTFs);

        var _this = _possibleConstructorReturn(this, (AnimationSampleGLTFs.__proto__ || Object.getPrototypeOf(AnimationSampleGLTFs)).call(this));

        _this.dom = {};
        return _this;
    }

    _createClass(AnimationSampleGLTFs, [{
        key: 'connectedCallback',
        value: function connectedCallback() {
            var _this2 = this;

            this.innerHTML = _template2.default.get();
            this.dom.list = this.querySelector('.container');
            this.dom.list.addEventListener('click', function (e) {
                return _this2.onFileClicked(e);
            });

            var loader = new XMLHttpRequest();
            loader.open('GET', this.getAttribute('manifest'), true);
            loader.onload = function (e) {
                return _this2.onFileManifestLoaded(e);
            };
            loader.send();
        }
    }, {
        key: 'onFileManifestLoaded',
        value: function onFileManifestLoaded(loader) {
            var files = JSON.parse(loader.target.response);
            for (var c = 0; c < files.length; c++) {
                var item = document.createElement('p');
                item.dataset.uri = files[c].uri;
                item.innerHTML = '<a href="#">' + files[c].name + '</a>';
                this.dom.list.appendChild(item);
            }
        }
    }, {
        key: 'onFileClicked',
        value: function onFileClicked(event) {
            if (!event.target.parentNode.dataset.uri) {
                return;
            }
            var e = new CustomEvent(AnimationSampleGLTFs.SELECT_REMOTE_FILE, { 'detail': { uri: event.target.parentNode.dataset.uri } });
            this.dispatchEvent(e);
        }
    }, {
        key: 'disconnectedCallback',
        value: function disconnectedCallback() {}
    }, {
        key: 'attributeChangedCallback',
        value: function attributeChangedCallback(attributeName, oldValue, newValue, namespace) {}
    }, {
        key: 'adoptedCallback',
        value: function adoptedCallback(oldDocument, newDocument) {}
    }]);

    return AnimationSampleGLTFs;
}(HTMLElement);

exports.default = AnimationSampleGLTFs;

AnimationSampleGLTFs.SELECT_REMOTE_FILE = 'onRemoteFileSelected';

if (!customElements.get('aviz-sample-gltfs')) {
    customElements.define('aviz-sample-gltfs', AnimationSampleGLTFs);
}

},{"./template.js":11}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    get: function get() {
        return "<h3>Sample glTF files</h3>\n                <div class=\"container\"></div>\n                <p>Alternately, drag & drop or load your glTF 2.0 files. Sorry, .glb files are not supported at this time</p>\n                <p>When loading, please drag/drop/multiselect all files simultaneously (gltf, bin, images)</p>";
    }
};

},{}],12:[function(require,module,exports){
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

var _template = require('./template.js');

var _template2 = _interopRequireDefault(_template);

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

var AnimationSceneInfo = function (_HTMLElement) {
    _inherits(AnimationSceneInfo, _HTMLElement);

    _createClass(AnimationSceneInfo, null, [{
        key: 'observedAttributes',
        get: function get() {
            return ['filename'];
        }
    }]);

    function AnimationSceneInfo() {
        _classCallCheck(this, AnimationSceneInfo);

        var _this = _possibleConstructorReturn(this, (AnimationSceneInfo.__proto__ || Object.getPrototypeOf(AnimationSceneInfo)).call(this));

        _this._playing = false;
        _this.dom = {};
        _this.rightHandedCoordinates = false;
        return _this;
    }

    _createClass(AnimationSceneInfo, [{
        key: 'onSwitchCoordinateSystem',
        value: function onSwitchCoordinateSystem(event) {
            this.rightHandedCoordinates = !this.rightHandedCoordinates;
            if (this.rightHandedCoordinates) {
                this.dom.coordinatesystem.innerText = 'use left-handed system on load';
            } else {
                this.dom.coordinatesystem.innerText = 'use right-handed system on load';
            }

            var e = new CustomEvent(AnimationSceneInfo.SWITCH_COORDINATE_SYSTEM, { 'detail': { rightHanded: this.rightHandedCoordinates } });
            this.dispatchEvent(e);
        }
    }, {
        key: 'connectedCallback',
        value: function connectedCallback() {
            var _this2 = this;

            this.innerHTML = _template2.default.get();
            this.dom.filename = this.querySelector('.filename');
            this.dom.coordinatesystem = this.querySelector('.coordinate-system');
            this.dom.coordinatesystem.addEventListener('click', function (e) {
                return _this2.onSwitchCoordinateSystem(e);
            });
        }
    }, {
        key: 'disconnectedCallback',
        value: function disconnectedCallback() {}
    }, {
        key: 'attributeChangedCallback',
        value: function attributeChangedCallback(attributeName, oldValue, newValue, namespace) {
            switch (attributeName) {
                case 'filename':
                    this.dom.filename.innerText = newValue;
                    break;
            }
        }
    }, {
        key: 'adoptedCallback',
        value: function adoptedCallback(oldDocument, newDocument) {}
    }]);

    return AnimationSceneInfo;
}(HTMLElement);

exports.default = AnimationSceneInfo;

AnimationSceneInfo.SWITCH_COORDINATE_SYSTEM = 'onSwitchCoordinateSystem';

if (!customElements.get('aviz-scene-info')) {
    customElements.define('aviz-scene-info', AnimationSceneInfo);
}

},{"./template.js":13}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    get: function get() {
        return "<span class=\"filename\"></span>\n                <a class=\"coordinate-system\" href=\"#\">use right-handed system on load</a>";
    }
};

},{}],14:[function(require,module,exports){
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

var _template = require('./template.js');

var _template2 = _interopRequireDefault(_template);

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

var AnimationTimeline = function (_HTMLElement) {
    _inherits(AnimationTimeline, _HTMLElement);

    _createClass(AnimationTimeline, [{
        key: 'destroy',
        value: function destroy() {
            this.dom.container.innerHTML = '';
        }
    }, {
        key: 'createPlaybackLine',
        value: function createPlaybackLine() {
            this.dom.playbackLine = document.createElement('div');
            this.dom.playbackLine.classList.add('playback-line');
            this.dom.container.appendChild(this.dom.playbackLine);
        }
    }, {
        key: 'data',
        set: function set(timeline) {
            this.destroy();

            this.timelineWidth = 0;
            this.createPlaybackLine();
            this.timeline = timeline;
            this._populateDeltas(this.timeline);
            this._drawTimelineLabel();
            for (var c = 0; c < this.timeline.animations.length; c++) {
                this._createAnimationHeader(c);
                for (var track in this.timeline.animations[c].animation.tracks) {
                    this._createTrack(c, track, this.timeline.animations[c].animation.tracks[track]);
                }
            }

            this.dom.playbackLine.style.height = this.dom.container.scrollHeight + 'px';
            this.currentTime = 0;
            this._onTimelineScroll();
        }
    }, {
        key: 'currentTime',
        set: function set(seconds) {
            if (this.timeline && !this._draggingPlayhead) {
                this.relativeTime = seconds % this.timeline.duration;
                this.dom.playbackLine.style.left = this.relativeTime * this.pixelsPerSecond + 'px';
                this.dom.playbackHead.style.left = this.relativeTime * this.pixelsPerSecond - 7 + 'px';
            }
        }
    }], [{
        key: 'observedAttributes',
        get: function get() {
            return [];
        }
    }]);

    function AnimationTimeline() {
        _classCallCheck(this, AnimationTimeline);

        var _this = _possibleConstructorReturn(this, (AnimationTimeline.__proto__ || Object.getPrototypeOf(AnimationTimeline)).call(this));

        _this.dom = {};

        _this._draggingPlayhead = false;
        _this.selectedTrack;
        _this.ticks = .1; // of a second
        _this.pixelsPerSecond = 200;
        _this.keyframeSize = {
            width: 5,
            height: 5
        };
        _this.deltaRanges = {};
        return _this;
    }

    _createClass(AnimationTimeline, [{
        key: 'connectedCallback',
        value: function connectedCallback() {
            var _this2 = this;

            this.innerHTML = _template2.default.get();
            this.dom.container = this.querySelector('.timeline-view');
            this.dom.axislabel = this.querySelector('.timeline-timelabels .tick-container');
            this.dom.zoomSlider = this.querySelector('.zoom');
            this.dom.timelineZoomLabel = this.querySelector('.timeline-timelabels canvas');
            this.dom.playbackLine = this.querySelector('.timeline-view .playback-line');
            this.dom.playbackHead = this.querySelector('.timeline-timelabels .tick-container .playback-head');

            this.dom.info = {
                time: this.querySelector('.keyframe-info .time .val'),
                frame: this.querySelector('.keyframe-info .frame .val'),
                position: {
                    x: this.querySelector('.keyframe-info .position .x-val'),
                    y: this.querySelector('.keyframe-info .position .y-val'),
                    z: this.querySelector('.keyframe-info .position .z-val'),
                    d: this.querySelector('.keyframe-info .position .d-val')
                },
                rotation: {
                    x: this.querySelector('.keyframe-info .rotation .x-val'),
                    y: this.querySelector('.keyframe-info .rotation .y-val'),
                    z: this.querySelector('.keyframe-info .rotation .z-val'),
                    d: this.querySelector('.keyframe-info .rotation .d-val')
                },
                scale: {
                    x: this.querySelector('.keyframe-info .scale .x-val'),
                    y: this.querySelector('.keyframe-info .scale .y-val'),
                    z: this.querySelector('.keyframe-info .scale .z-val'),
                    d: this.querySelector('.keyframe-info .scale .d-val')
                }
            };

            this.dom.container.addEventListener('scroll', function (e) {
                return _this2._onTimelineScroll(e);
            });
            this.dom.zoomSlider.addEventListener('input', function (e) {
                return _this2._onZoom(e);
            });
            this.dom.axislabel.addEventListener('mousedown', function (e) {
                return _this2._onLabelTrackMouseDown(e);
            });
            this.addEventListener('mouseup', function (e) {
                return _this2._onLabelTrackMouseUp(e);
            });
            this.addEventListener('mousemove', function (e) {
                return _this2._onLabelTrackMouseMove(e);
            });
        }
    }, {
        key: '_createAnimationHeader',
        value: function _createAnimationHeader(animationIndex) {
            var header = document.createElement('DIV');
            header.classList.add('animation-header');
            header.innerHTML = '<span>Animation ' + animationIndex + '</span>';
            this.dom.container.appendChild(header);
        }
    }, {
        key: '_createTrack',
        value: function _createTrack(animationIndex, name, data) {
            var _this3 = this;

            var trackcontainer = document.createElement('DIV');
            trackcontainer.dataset.name = name;
            trackcontainer.dataset.animation = animationIndex;
            trackcontainer.addEventListener('click', function (e) {
                return _this3._onTrackClick(e);
            });
            trackcontainer.addEventListener('mousemove', function (e) {
                return _this3._onTrackHover(e);
            });
            trackcontainer.className = 'timeline-track';
            var canvas = document.createElement('CANVAS');
            var tracklabel = document.createElement('DIV');
            tracklabel.classList.add('track-label');

            /*let trackVisibilityToggle = document.createElement('div');
            trackVisibilityToggle.classList.add('icon-eye');
            trackVisibilityToggle.classList.add('on');
            trackVisibilityToggle.addEventListener('click', e => this._onTrackVisibilityClick(e));
            tracklabel.appendChild(trackVisibilityToggle);*/

            var trackName = document.createElement('span');
            trackName.innerText = name;
            tracklabel.appendChild(trackName);
            this.dom['animation-' + animationIndex + '-track-' + name] = canvas;
            this._drawTrack(animationIndex, name, data);
            trackcontainer.appendChild(tracklabel);
            trackcontainer.appendChild(canvas);
            this.dom.container.appendChild(trackcontainer);
        }
    }, {
        key: '_drawTrack',
        value: function _drawTrack(animationIndex, name, data) {
            var canvas = this.dom['animation-' + animationIndex + '-track-' + name];
            this.timelineWidth = this.timeline.duration * this.pixelsPerSecond + this.keyframeSize.width;
            canvas.width = this.timelineWidth;
            canvas.height = 16;
            var ctx = canvas.getContext('2d');
            for (var c = 0; c < data.length; c++) {
                if (data[c].transform.translation) {
                    var alpha = (data[c].transform.deltas.position - this.deltaRanges[name].position.min) / (this.deltaRanges[name].position.max - this.deltaRanges[name].position.min);
                    ctx.fillStyle = 'rgba(0, 255, 0, ' + (alpha ? alpha : 0) + ')';
                    ctx.fillRect(data[c].time * this.pixelsPerSecond, 0, this.keyframeSize.width, this.keyframeSize.height);
                    ctx.strokeStyle = 'rgba(0, 255, 0, 1)';
                    ctx.lineWidth = .25;
                    ctx.strokeRect(data[c].time * this.pixelsPerSecond, 0, this.keyframeSize.width, this.keyframeSize.height);
                }
                if (data[c].transform.rotation) {
                    var _alpha = (data[c].transform.deltas.rotation - this.deltaRanges[name].rotation.min) / (this.deltaRanges[name].rotation.max - this.deltaRanges[name].rotation.min);
                    ctx.fillStyle = 'rgba(255, 165, 0, ' + (_alpha ? _alpha : 0) + ')';
                    ctx.fillRect(data[c].time * this.pixelsPerSecond, this.keyframeSize.width + 1, this.keyframeSize.width, this.keyframeSize.height);
                    ctx.strokeStyle = 'rgba(255, 165, 0, 1)';
                    ctx.lineWidth = .25;
                    ctx.strokeRect(data[c].time * this.pixelsPerSecond, this.keyframeSize.width + 1, this.keyframeSize.width, this.keyframeSize.height);
                }
                if (data[c].transform.scale) {
                    var _alpha2 = (data[c].transform.deltas.scaling - this.deltaRanges[name].scaling.min) / (this.deltaRanges[name].scaling.max - this.deltaRanges[name].scaling.min);
                    ctx.fillStyle = 'rgba(255, 255, 0, ' + (_alpha2 ? _alpha2 : 0) + ')';
                    ctx.fillRect(data[c].time * this.pixelsPerSecond, this.keyframeSize.width * 2 + 1, this.keyframeSize.width, this.keyframeSize.height);
                    ctx.strokeStyle = 'rgba(255, 255, 0, 1)';
                    ctx.lineWidth = .25;
                    ctx.strokeRect(data[c].time * this.pixelsPerSecond, this.keyframeSize.width * 2 + 1, this.keyframeSize.width, this.keyframeSize.height);
                }
            }
        }
    }, {
        key: '_drawTimelineLabel',
        value: function _drawTimelineLabel() {
            var canvas = this.dom.timelineZoomLabel;
            canvas.width = this.timeline.duration * this.pixelsPerSecond + this.keyframeSize.width;
            canvas.height = 15;
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';

            for (var c = this.ticks; c < this.timeline.duration; c += this.ticks) {
                var tHeight = 8;
                var tWidth = 1;
                if (Math.abs(Number(Math.round(c + 'e2') + 'e-2') === Math.round(c))) {
                    // just trying to test if an integer, stupid precision loss
                    tHeight = 15;
                    tWidth = 3;
                }
                ctx.fillRect(c * this.pixelsPerSecond, 0, tWidth, tHeight);
            }
        }
    }, {
        key: '_populateDeltas',
        value: function _populateDeltas(timeline) {
            for (var d = 0; d < timeline.animations.length; d++) {
                for (var track in timeline.animations[d].animation.tracks) {
                    if (!this.deltaRanges[track]) {
                        this.deltaRanges[track] = {};
                    }

                    for (var c = 1; c < timeline.animations[d].animation.tracks[track].length; c++) {
                        var t1 = timeline.animations[d].animation.tracks[track][c].transform;
                        var t0 = timeline.animations[d].animation.tracks[track][c - 1].transform;

                        var dPos = 0;
                        if (t1.translation && t0.translation) {
                            dPos = Math.sqrt(Math.pow(t1.translation.x - t0.translation.x, 2) + Math.pow(t1.translation.y - t0.translation.y, 2) + Math.pow(t1.translation.z - t0.translation.z, 2));
                        }

                        var dRot = 0;
                        if (t1.rotation && t0.rotation) {
                            dRot = Math.sqrt(Math.pow(t1.rotation.x - t0.rotation.x, 2) + Math.pow(t1.rotation.y - t0.rotation.y, 2) + Math.pow(t1.rotation.z - t0.rotation.z, 2));
                        }

                        var dScale = 0;
                        if (t1.scale && t0.scale) {
                            dScale = Math.sqrt(Math.pow(t1.scale.x - t0.scale.x, 2) + Math.pow(t1.scale.y - t0.scale.y, 2) + Math.pow(t1.scale.z - t0.scale.z, 2));
                        }

                        timeline.animations[d].animation.tracks[track][c].transform.deltas = { position: dPos, rotation: dRot, scaling: dScale };

                        if (!this.deltaRanges[track].rotation) {
                            this.deltaRanges[track].rotation = {};
                            this.deltaRanges[track].rotation.min = 0;
                            this.deltaRanges[track].rotation.max = dRot;
                        } else {
                            if (this.deltaRanges[track].rotation.min > dRot) {
                                this.deltaRanges[track].rotation.min = dRot;
                            }
                            if (this.deltaRanges[track].rotation.max < dRot) {
                                this.deltaRanges[track].rotation.max = dRot;
                            }
                        }

                        if (!this.deltaRanges[track].position) {
                            this.deltaRanges[track].position = {};
                            this.deltaRanges[track].position.min = 0;
                            this.deltaRanges[track].position.max = dPos;
                        } else {
                            if (this.deltaRanges[track].position.min > dPos) {
                                this.deltaRanges[track].position.min = dPos;
                            }
                            if (this.deltaRanges[track].position.max < dPos) {
                                this.deltaRanges[track].position.max = dPos;
                            }
                        }

                        if (!this.deltaRanges[track].scaling) {
                            this.deltaRanges[track].scaling = {};
                            this.deltaRanges[track].scaling.min = 0;
                            this.deltaRanges[track].scaling.max = dScale;
                        } else {
                            if (this.deltaRanges[track].scaling.min > dScale) {
                                this.deltaRanges[track].scaling.min = dScale;
                            }
                            if (this.deltaRanges[track].scaling.max < dScale) {
                                this.deltaRanges[track].scaling.max = dScale;
                            }
                        }
                    }
                    // first track has no delta, so give it maximum delta
                    timeline.animations[d].animation.tracks[track][0].transform.deltas = {
                        position: this.deltaRanges[track].position.max,
                        rotation: this.deltaRanges[track].rotation.max,
                        scaling: this.deltaRanges[track].scaling.max
                    };
                }
            }
        }
    }, {
        key: '_onTimelineScroll',
        value: function _onTimelineScroll(event) {
            this.dom.axislabel.scrollLeft = this.dom.container.scrollLeft;

            var labels = this.querySelectorAll('.track-label');
            for (var c = 0; c < labels.length; c++) {
                labels[c].style.paddingLeft = this.dom.container.scrollLeft + this.keyframeSize.width + 15 + 'px';
            }

            var animheaders = this.querySelectorAll('.animation-header span');
            for (var _c = 0; _c < animheaders.length; _c++) {
                animheaders[_c].style.paddingLeft = this.dom.container.scrollLeft + 5 + 'px';
                animheaders[_c].parentNode.style.width = this.timeline.duration * this.pixelsPerSecond + this.keyframeSize.width - 15 + 'px';
            }

            var tracks = this.querySelectorAll('.timeline-track');
            for (var _c2 = 0; _c2 < tracks.length; _c2++) {
                tracks[_c2].style.width = this.timeline.duration * this.pixelsPerSecond + this.keyframeSize.width + 5 + 'px';
            }
        }
    }, {
        key: '_onZoom',
        value: function _onZoom(event) {
            this.pixelsPerSecond = event.target.value;
            this._drawTimelineLabel();

            for (var c = 0; c < this.timeline.animations.length; c++) {
                for (var track in this.timeline.animations[c].animation.tracks) {
                    this._drawTrack(c, track, this.timeline.animations[c].animation.tracks[track]);
                }
            }
            this._onTimelineScroll(); // need track resizing
        }
    }, {
        key: '_onTrackClick',
        value: function _onTrackClick(event) {
            if (this.selectedTrack) {
                this.selectedTrack.classList.remove('selected');
            }

            if (this.selectedTrack === event.currentTarget) {
                this.selectedTrack = null;
                return;
            }
            this.selectedTrack = event.currentTarget;
            this.selectedTrack.classList.add('selected');

            var e = new CustomEvent(AnimationTimeline.TRACK_SELECTED, { 'detail': { name: event.currentTarget.dataset.name } });
            this.dispatchEvent(e);
        }
    }, {
        key: '_onTrackVisibilityClick',
        value: function _onTrackVisibilityClick(event) {
            event.stopPropagation();
            var visible = void 0;
            if (event.target.classList.contains('on')) {
                event.target.classList.remove('on');
                event.target.classList.add('off');
                visible = false;
            } else {
                event.target.classList.remove('off');
                event.target.classList.add('on');
                visible = true;
            }

            var e = new CustomEvent(AnimationTimeline.TRACK_PLAYBACK_CHANGED, {
                'detail': {
                    name: event.target.parentNode.parentNode.dataset.name,
                    visible: visible,
                    playbacktime: this.relativeTime / this.timeline.duration
                } });
            this.dispatchEvent(e);
        }
    }, {
        key: '_onTrackHover',
        value: function _onTrackHover(event) {
            var time = (event.offsetX - this.keyframeSize.width) / this.pixelsPerSecond;
            var track = this.timeline.animations[parseInt(event.currentTarget.dataset.animation)].animation.tracks[event.currentTarget.dataset.name];
            var timeIndex = void 0;
            for (var c = 0; c < track.length; c++) {
                if (track[c].time >= time) {
                    this.dom.info.time.innerText = track[c].time.toFixed(3);
                    this.dom.info.frame.innerText = c + 1 + ' / ' + track.length;

                    if (track[c].transform.translation) {
                        this.dom.info.position.x.innerText = track[c].transform.translation.x.toFixed(3);
                        this.dom.info.position.y.innerText = track[c].transform.translation.y.toFixed(3);
                        this.dom.info.position.z.innerText = track[c].transform.translation.z.toFixed(3);
                        this.dom.info.position.d.innerText = track[c].transform.deltas.position.toFixed(3);
                    } else {
                        this._clearInfoValues('position');
                    }

                    if (track[c].transform.rotation) {
                        this.dom.info.rotation.x.innerText = track[c].transform.rotation.x.toFixed(3);
                        this.dom.info.rotation.y.innerText = track[c].transform.rotation.y.toFixed(3);
                        this.dom.info.rotation.z.innerText = track[c].transform.rotation.z.toFixed(3);
                        this.dom.info.rotation.d.innerText = track[c].transform.deltas.rotation.toFixed(3);
                    } else {
                        this._clearInfoValues('rotation');
                    }

                    if (track[c].transform.scale) {
                        this.dom.info.scale.x.innerText = track[c].transform.scale.x.toFixed(3);
                        this.dom.info.scale.y.innerText = track[c].transform.scale.y.toFixed(3);
                        this.dom.info.scale.z.innerText = track[c].transform.scale.z.toFixed(3);
                        this.dom.info.scale.d.innerText = track[c].transform.deltas.scaling.toFixed(3);
                    } else {
                        this._clearInfoValues('scale');
                    }
                    return;
                }
            }
        }
    }, {
        key: '_onLabelTrackMouseDown',
        value: function _onLabelTrackMouseDown(event) {
            this._draggingPlayhead = true;
        }
    }, {
        key: '_onLabelTrackMouseUp',
        value: function _onLabelTrackMouseUp(event) {
            if (this._draggingPlayhead) {
                this._draggingPlayhead = false;
                var bounds = event.currentTarget.getBoundingClientRect();
                this._scrubTimeline(event.clientX - bounds.left, true);
            }
        }
    }, {
        key: '_onLabelTrackMouseMove',
        value: function _onLabelTrackMouseMove(event) {
            if (this._draggingPlayhead) {
                var bounds = event.currentTarget.getBoundingClientRect();
                this._scrubTimeline(event.clientX - bounds.left, false);
            }
        }
    }, {
        key: '_scrubTimeline',
        value: function _scrubTimeline(posX, endscrub) {
            var bounds = event.currentTarget.getBoundingClientRect();
            if (posX > this.timelineWidth) {
                posX = this.timelineWidth;
            }
            this.dom.playbackLine.style.left = posX + 'px';
            this.dom.playbackHead.style.left = posX - 7 + 'px';

            var time = (posX - 1) / this.pixelsPerSecond;
            if (time < 0) {
                time = 0;
            }
            if (time > this.timeline.duration) {
                time = this.timeline.duration;
            }

            var e = new CustomEvent(AnimationTimeline.SCRUB_TIMELINE, {
                'detail': {
                    resumeplayback: endscrub,
                    playbacktime: time,
                    playbackratio: time / this.timeline.duration
                } });
            this.dispatchEvent(e);
        }
    }, {
        key: '_clearInfoValues',
        value: function _clearInfoValues(transformTypes) {
            if (typeof transformTypes === 'string') {
                transformTypes = [transformTypes];
            }

            for (var c = 0; c < transformTypes.length; c++) {
                this.dom.info[transformTypes].x.innerText = '-';
                this.dom.info[transformTypes].y.innerText = '-';
                this.dom.info[transformTypes].z.innerText = '-';
                this.dom.info[transformTypes].d.innerText = '-';
            }
        }
    }, {
        key: 'disconnectedCallback',
        value: function disconnectedCallback() {}
    }, {
        key: 'attributeChangedCallback',
        value: function attributeChangedCallback(attributeName, oldValue, newValue, namespace) {}
    }, {
        key: 'adoptedCallback',
        value: function adoptedCallback(oldDocument, newDocument) {}
    }]);

    return AnimationTimeline;
}(HTMLElement);

exports.default = AnimationTimeline;

AnimationTimeline.TRACK_SELECTED = 'onTrackSelected';
AnimationTimeline.SCRUB_TIMELINE = 'onScrubTimeline';
AnimationTimeline.TRACK_PLAYBACK_CHANGED = 'onTrackPlaybackChanged';

if (!customElements.get('aviz-timeline')) {
    customElements.define('aviz-timeline', AnimationTimeline);
}

},{"./template.js":15}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    get: function get() {
        return "<div class=\"timeline\">\n                            <div class=\"timeline-view\">\n                            </div> \n                            <div class=\"timeline-timelabels\">\n                                <div class=\"tick-container\">\n                                    <canvas></canvas>\n                                    <div class=\"playback-head\"></div>\n                                </div>\n                                <input class=\"zoom\" min=\"20\" max=\"1000\" value=\"200\" type=\"range\"></div>\n                            </div>\n                        </div>\n                        <div class=\"keyframe-info\">\n                            <div class=\"item\">\n                                <h4 class=\"time\">Time: <span class=\"val\">-</span></h4>\n                                <h4 class=\"frame\">Frame: <span class=\"val\">-/-</span></h4>\n                            </div>\n                            <div class=\"item position\">\n                                <h4>Position</h4>\n                                <div class=\"axis\"><span class=\"label\">x</span><span class=\"x-val\">-</span></div>\n                                <div class=\"axis\"><span class=\"label\">y</span><span class=\"y-val\">-</span></div>\n                                <div class=\"axis\"><span class=\"label\">z</span><span class=\"z-val\">-</span></div>\n                                <div class=\"axis\"><span class=\"label\">\u25B2</span><span class=\"d-val\">-</span></div>\n                            </div>\n                            <div class=\"item rotation\">\n                                <h4>Rotation</h4>\n                                <div class=\"axis\"><span class=\"label\">x</span><span class=\"x-val\">-</span></div>\n                                <div class=\"axis\"><span class=\"label\">y</span><span class=\"y-val\">-</span></div>\n                                <div class=\"axis\"><span class=\"label\">z</span><span class=\"z-val\">-</span></div>\n                                <div class=\"axis\"><span class=\"label\">\u25B2</span><span class=\"d-val\">-</span></div>\n                            </div>\n                            <div class=\"item scale\">\n                                <h4>Scale</h4>\n                                <div class=\"axis\"><span class=\"label\">x</span><span class=\"x-val\">-</span></div>\n                                <div class=\"axis\"><span class=\"label\">y</span><span class=\"y-val\">-</span></div>\n                                <div class=\"axis\"><span class=\"label\">z</span><span class=\"z-val\">-</span></div>\n                                <div class=\"axis\"><span class=\"label\">\u25B2</span><span class=\"d-val\">-</span></div>\n                            </div>\n                        </div>";
    }
};

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{"../../node_modules/macgyvr/src/utils/eventlistener.js":4,"./gltfexploder.js":16}],18:[function(require,module,exports){
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
                sceneMidPoint = new BABYLON.Vector3((worldExtends.max.x + worldExtends.min.x) / 2, (worldExtends.max.y + worldExtends.min.y) / 2, (worldExtends.max.z + worldExtends.min.z) / 2);
            } else {
                var _sceneMidPoint = new BABYLON.Vector3((worldExtends.max.x + worldExtends.min.x) / 2, (worldExtends.max.y + worldExtends.min.y) / 2, (worldExtends.max.z + worldExtends.min.z) / 2);
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
