import EventListener from '../node_modules/macgyvr/src/utils/eventlistener.js';

export default class GLTFAnimationParser extends EventListener {
    constructor() {
        super();
        this.loader = new XMLHttpRequest();
    }

    load(path) {
        this.loader.open('GET', path,true);
        this.loader.onload = data => this.onLoad(data);
        this.loader.send();
    }

    onLoad(data) {
        let gltf = JSON.parse(this.loader.response);
        this.triggerEvent(GLTFAnimationParser.LOADED, {
            accessors: gltf.accessors,
            animations: gltf.animations,
            nodes: gltf.nodes
        });
    }
}

GLTFAnimationParser.LOADED = 'loaded';
