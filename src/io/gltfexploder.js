// lots of approach in binary processing here stolen from Babylon
// https://github.com/BabylonJS/Babylon.js/tree/master/loaders/src/glTF/2.0

// Only supports mashing the animation buffer pieces into the GLTF object for now
export default {
    explode(gltf) {
        for (let c = 0; c < gltf.animations.length; c++) {
            // wire sampler references within channels for easy access
            for (let d = 0; d < gltf.animations[c].channels.length; d++) {
                gltf.animations[c].channels[d]._samplerRef = gltf.animations[c].samplers[gltf.animations[c].channels[d].sampler];
                gltf.animations[c].channels[d]._samplerRef._channelRef = gltf.animations[c].channels[d];
                gltf.animations[c].channels[d].target._nodeRef = gltf.nodes[gltf.animations[c].channels[d].target.node];
            }

            // get accessor references for samplers and resolve data from buffer
            for (let e = 0; e < gltf.animations[c].samplers.length; e++) {
               gltf.animations[c].samplers[e]._inputRef = gltf.accessors[gltf.animations[c].samplers[e].input];

               // for animation, input refers to keyframe times
               gltf.animations[c].samplers[e]._inputValues = this._resolveAnimationSamplerData('keyframes', gltf, gltf.animations[c].samplers[e]._inputRef);


               // output refers to scale, rotate, or translate
               gltf.animations[c].samplers[e]._outputRef = gltf.accessors[gltf.animations[c].samplers[e].output];
               gltf.animations[c].samplers[e]._outputRef._bufferViewRef = gltf.bufferViews[gltf.animations[c].samplers[e]._outputRef.bufferView];

               let transformType = gltf.animations[c].samplers[e]._channelRef.target.path;
               gltf.animations[c].samplers[e]._outputValues = this._resolveAnimationSamplerData(transformType, gltf, gltf.animations[c].samplers[e]._outputRef);
            }
        }
        return gltf;
    },

    _resolveAnimationSamplerData(type, gltf, samplerData) {
        let bufferView = gltf.bufferViews[samplerData.bufferView];
        let buffer = gltf.buffers[bufferView.buffer].data;

        // map bufferView to actual mem ref
        samplerData._bufferViewRef = bufferView;

        let byteLength = samplerData.count * this._getByteStrideFromType(samplerData);
        let inputValues = this._parseBufferData(buffer, bufferView.byteOffset, byteLength, samplerData.componentType);

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
    },

    _getByteStrideFromType(accessor) {
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

    _parseBufferData(buffer, byteOffset, byteLength, componentType) {
        let bufferViewData;
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

    generateTimeline(animation) {
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
    },

    EComponentType: {
        BYTE: 5120,
        UNSIGNED_BYTE: 5121,
        SHORT: 5122,
        UNSIGNED_SHORT: 5123,
        UNSIGNED_INT: 5125,
        FLOAT: 5126
    }
}
