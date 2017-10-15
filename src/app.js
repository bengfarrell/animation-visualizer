import GLTFFileLoader from './io/gltffileloader.js';
import GLTFExploder from './io/gltfexploder.js';
import BaseApplication from '../node_modules/macgyvr/src/baseapplication.js';
import GLTFObject from './objects/gltfobject.js';

export default class Application extends BaseApplication {

    set time(t) {
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
    }

    get time() {
        return this._currentTime;
    }

    onCreate(scene) {
        this.config.components.timeline.addEventListener(AnimationTimeline.TRACK_SELECTED, e => this.onTrackSelection(e));
        this.config.components.timeline.addEventListener(AnimationTimeline.SCRUB_TIMELINE, e => this.onScrubTimeline(e));
        this.config.components.timeline.addEventListener(AnimationTimeline.TRACK_VISIBILITY_CHANGED, e => this.onTrackVisibilityChanged(e));
        this.config.components.controls.addEventListener(AnimationPlaybackControls.CONTROL_CLICKED, e => this.onPlaybackControlClicked(e));
        this.config.components.controls.addEventListener(AnimationPlaybackControls.ANIMATION_SELECTED, e => this.onAnimationSelected(e));
        this.config.components.controls.addEventListener(AnimationPlaybackControls.LOAD_GLTF, e => this.loadFile(e));
        this.config.components.samples.addEventListener(AnimationSampleGLTFs.SELECT_REMOTE_FILE, e => this.loadFile(e));
        this.time = 0;
        this.playing = false;
        this.gltf = this.add( new GLTFObject() );
        this.animations;
        this.animationIndex = 0;
    }

    loadAnimation(index) {
        this.config.components.timeline.data = this.animations[index];
        this.gltf.duration = this.animations[index].duration;
        this.config.components.controls.duration = this.animations[index].duration;
    }

    loadFile(event) {
        this.config.components.samples.style.display = 'none';

        let loader = new GLTFFileLoader();
        loader.addListener(GLTFFileLoader.LOADED, (eventtype, event) => this.onGLTFData(event));
        if (typeof event === 'string') {
            let uri = event;
            loader.loadRemote(uri);
            this.gltf.load(uri);
        } else if (event.detail.uri) {
            loader.loadRemote(event.detail.uri);
            this.gltf.load(event.detail.uri);
        } else {
            loader.loadLocal(event.detail.files);
            this.gltf.load(event.detail.inputevent);
        }

        this.gltf.time = this.time;
    }

    onGLTFData(event) {
        this.animations = event.gltf.animations;
        for (let c = 0; c < this.animations.length; c++) {
            this.animations[c] = GLTFExploder.generateTimeline(this.animations[c]);
        }

        this.config.components.controls.numOfAnimations = this.animations.length;
        this.loadAnimation(this.animationIndex);
        this.config.components.nodes.data = event.gltf.nodes;
    }

    onScrubTimeline(event) {
        if (!event.detail.resumeplayback) {
            this.playing = false;
        }

        this.time = event.detail.playbacktime;
    }

    onAnimationSelected(event) {
        this.animationIndex = event.detail.animationIndex;
    }

    onTrackSelection(event) {
        this.config.components.nodes.selectNodeByName(event.detail.name);
    }

    onTrackVisibilityChanged(event) {
        this.gltf.toggleVisibility(event.detail.visible, event.detail.name, event.detail.playbacktime);
    }

    onPlaybackControlClicked(event) {
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

    onRender(deltatime) {
        if (this.playing) {
            this.time += deltatime / 1000;
        }
    }

}
