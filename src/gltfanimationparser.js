import EventListener from '../node_modules/macgyvr/src/utils/eventlistener.js';

// lots of approach in binary processing here stolen from Babylon
// https://github.com/BabylonJS/Babylon.js/tree/master/loaders/src/glTF/2.0
export default class GLTFAnimationParser extends EventListener {
    constructor() {
        super();
        this.loader = new XMLHttpRequest();
    }

    load(path) {
        this._filename = path.split('/')[path.split(path).length];
        this._basepath = path.substr(0, path.indexOf(this._filename));
        this.loader.open('GET', path, true);
        this.loader.onload = data => this.onLoad(data);
        this.loader.send();
    }

    onLoad() {
        this.gltf = JSON.parse(this.loader.response);
        this.buffers = this.gltf.buffers;
        for (let c = 0; c < this.buffers.length; c++) {
            this.buffers[c].loaded = false;
            this.buffers[c].loader = new XMLHttpRequest();
            this.buffers[c].loader.responseType = 'arraybuffer';
            this.buffers[c].loader.open('GET', this._basepath + this.buffers[c].uri, true);
            this.buffers[c].loader.onload = data => this.onBinaryLoaded(data);
            this.buffers[c].loader.send();
        }
    }

    onBinaryLoaded(data) {
        let done = true;
        for (let c = 0; c < this.buffers.length; c++) {
            if (this.buffers[c].loader.responseURL === data.target.responseURL) {
                this.buffers[c].loaded = true;
                this.buffers[c].data = this.buffers[c].loader.response;
                delete this.buffers[c].loader;
            } else {
                done = done && this.buffers[c].loaded;
            }
        }

        this.parseAnimations();

        let timelines = [];
        for (let d = 0; d < this.gltf.animations.length; d++) {
            timelines.push(this.createTimeline(this.gltf.animations[d]));
        }

        this.triggerEvent(GLTFAnimationParser.LOADED, { detail: { gltf: this.gltf, animations: timelines }});
    }

    parseAnimations() {
        for (let c = 0; c < this.gltf.animations.length; c++) {

            // wire sampler references within channels for easy access
            for (let d = 0; d < this.gltf.animations[c].channels.length; d++) {
                this.gltf.animations[c].channels[d]._samplerRef = this.gltf.animations[c].samplers[this.gltf.animations[c].channels[d].sampler];
                this.gltf.animations[c].channels[d]._samplerRef._channelRef = this.gltf.animations[c].channels[d];
                this.gltf.animations[c].channels[d].target._nodeRef = this.gltf.nodes[this.gltf.animations[c].channels[d].target.node];
            }

            // get accessor references for samplers and resolve data from buffer
            for (let e = 0; e < this.gltf.animations[c].samplers.length; e++) {
               this.gltf.animations[c].samplers[e]._inputRef = this.gltf.accessors[this.gltf.animations[c].samplers[e].input];

               // for animation, input refers to keyframe times
               this.gltf.animations[c].samplers[e]._inputValues = this.resolveAnimationSamplerData('keyframes', this.gltf.animations[c].samplers[e]._inputRef);


               // output refers to scale, rotate, or translate
               this.gltf.animations[c].samplers[e]._outputRef = this.gltf.accessors[this.gltf.animations[c].samplers[e].output];
               this.gltf.animations[c].samplers[e]._outputRef._bufferViewRef = this.gltf.bufferViews[this.gltf.animations[c].samplers[e]._outputRef.bufferView];

               let transformType = this.gltf.animations[c].samplers[e]._channelRef.target.path;
               this.gltf.animations[c].samplers[e]._outputValues = this.resolveAnimationSamplerData(transformType, this.gltf.animations[c].samplers[e]._outputRef);
            }
        }
    }

    resolveAnimationSamplerData(type, samplerData) {
        let bufferView = this.gltf.bufferViews[samplerData.bufferView];
        let buffer = this.gltf.buffers[bufferView.buffer].data;

        // map bufferView to actual mem ref
        samplerData._bufferViewRef = bufferView;

        let byteLength = samplerData.count * this.getByteStrideFromType(samplerData);
        let inputValues = this.parseBufferData(buffer, bufferView.byteOffset, byteLength, samplerData.componentType);

        if (type === 'keyframes') {
            return inputValues;
        } else {
            let counter = 0;
            let transforms = [];
            let vec;

            for (let c = 0; c < inputValues.length; c++) {
                switch (counter) {
                    case 0:
                        transforms.push({});
                        vec = transforms[transforms.length-1];
                        vec.x = inputValues[c];
                        counter ++;
                        break;

                    case 1:
                        vec.y = inputValues[c];
                        counter ++;
                        break;

                    case 2:
                        vec.z = inputValues[c];

                        counter ++;
                        if (type !== 'rotation') {
                            counter = 0;
                        }
                        break;

                    case 3:
                        vec.w = inputValues[c];
                        counter = 0;
                        break;
                }
            }
            return transforms;
        }
    }


    getByteStrideFromType(accessor) {
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
    }

    parseBufferData(buffer, byteOffset, byteLength, componentType) {
        let bufferViewData;
        switch (componentType) {
            case GLTFAnimationParser.EComponentType.BYTE:
                bufferViewData = new Int8Array(buffer, byteOffset, byteLength);
                break;
            case GLTFAnimationParser.EComponentType.UNSIGNED_BYTE:
                bufferViewData = new Uint8Array(buffer, byteOffset, byteLength);
                break;
            case GLTFAnimationParser.EComponentType.SHORT:
                bufferViewData = new Int16Array(buffer, byteOffset, byteLength);
                break;
            case GLTFAnimationParser.EComponentType.UNSIGNED_SHORT:
                bufferViewData = new Uint16Array(buffer, byteOffset, byteLength);
                break;
            case GLTFAnimationParser.EComponentType.UNSIGNED_INT:
                bufferViewData = new Uint32Array(buffer, byteOffset, byteLength);
                break;
            case GLTFAnimationParser.EComponentType.FLOAT:
                bufferViewData = new Float32Array(buffer, byteOffset, byteLength);
                break;
            default:
                console.warn("Invalid component type (" + componentType + ")");
                return;
        }
        return bufferViewData;
    };

    createTimeline(animation) {
        let tracks = {};
        let startTime = -1;
        let endTime = -1;
        for (let c = 0; c < animation.channels.length; c++) {
            if (!tracks[animation.channels[c].target._nodeRef.name]) {
                tracks[animation.channels[c].target._nodeRef.name] = [];
            }

            let currentChannel = tracks[animation.channels[c].target._nodeRef.name];

            for (let d = 0; d < animation.channels[c]._samplerRef._inputValues.length; d++) {
                let time = animation.channels[c]._samplerRef._inputValues[d];
                if (startTime === -1 || time < startTime) {
                    startTime = time;
                }
                if (endTime === -1 || time > endTime) {
                    endTime = time;
                }

                let keyframe;
                for (let e = 0; e < currentChannel.length; e++) {
                    if (currentChannel[e].time === time) {
                        keyframe = currentChannel[e];
                    }
                }
                if (!keyframe) {
                    keyframe = { time: time, transform: {}, name: animation.channels[c].target._nodeRef.name };
                    currentChannel.push(keyframe);
                }

                let transformType = animation.channels[c].target.path;
                keyframe.transform[transformType] = animation.channels[c]._samplerRef._outputValues[d];

            }
        }

        for (let track in tracks) {
            tracks[track].sort(function(a, b) {
                return a.time - b.time;
            });
        }
        return { start: startTime, end: endTime, duration: endTime-startTime, tracks: tracks };
    }

}

GLTFAnimationParser.LOADED = 'loaded';
GLTFAnimationParser.EComponentType = {
    BYTE: 5120,
    UNSIGNED_BYTE: 5121,
    SHORT: 5122,
    UNSIGNED_SHORT: 5123,
    UNSIGNED_INT: 5125,
    FLOAT: 5126
};
