import GLTFAnimationParser from './gltfanimationparser.js';
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
    }

    get time() {
        return this._currentTime;
    }

    onCreate(scene) {
        let parser = new GLTFAnimationParser();
        parser.addListener(GLTFAnimationParser.LOADED, (eventtype, event) => this.onGLTFData(event));
        parser.load('./examples/golfer.gltf');
        this.config.components.timeline.addEventListener(AnimationTimeline.TRACK_SELECTED, e => this.onTrackSelection(e));
        this.config.components.timeline.addEventListener(AnimationTimeline.SCRUB_TIMELINE, e => this.onScrubTimeline(e));
        this.config.components.timeline.addEventListener(AnimationTimeline.TRACK_VISIBILITY_CHANGED, e => this.onTrackVisibilityChanged(e));
        this.config.components.controls.addEventListener(AnimationPlaybackControls.CONTROL_CLICKED, e => this.onPlaybackControlClicked(e));
        this.time = 0;
        this.playing = false;
        this.gltf = this.add( new GLTFObject() );
        this.gltf.time = this.time;
    }

    onGLTFData(event) {
        this.currentAnimation = event.detail.animations[0];
        this.config.components.timeline.data = this.currentAnimation;
        this.config.components.nodes.data = event.detail.gltf.nodes;
        this.gltf.duration = this.currentAnimation.duration;
    }

    onScrubTimeline(event) {
        if (!event.detail.resumeplayback) {
            this.playing = false;
        }

        this.time = event.detail.playbacktime;
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
        if (this.playing) { this.time += deltatime / 1000; }
    }

}
