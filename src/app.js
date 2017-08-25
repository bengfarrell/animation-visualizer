import GLTFAnimationParser from './gltfanimationparser.js';

export default class Application {
    constructor(config) {
        this.config = config;
        let parser = new GLTFAnimationParser();
        parser.load('./examples/golfer.gltf');
        parser.addListener(GLTFAnimationParser.LOADED, (eventtype, event) => this.onGLTFData(event));
    }

    onGLTFData(event) {
        let data = {
            nodes: event.nodes,
            samplers: event.animations[0].samplers,
            channels: event.animations[0].channels,
            accessors: event.accessors
        };

        this.config.components.samplers.data = data;
        this.config.components.channels.data = data;
        this.config.components.nodes.data = event.nodes;
    }


}
