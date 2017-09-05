import GLTFAnimationParser from './gltfanimationparser.js';

export default class Application {
    constructor(config) {
        this.config = config;
        let parser = new GLTFAnimationParser();
        parser.addListener(GLTFAnimationParser.LOADED, (eventtype, event) => this.onGLTFData(event));
        parser.load('./examples/golfer.gltf');
    }

    onGLTFData(event) {
       // this.config.components.samplers.data = data;
       // this.config.components.channels.data = data;
        this.config.components.timeline.data = event;
        this.config.components.nodes.data = event.nodes;
    }


}
