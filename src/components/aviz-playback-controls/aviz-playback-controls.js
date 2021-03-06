import Template from './template.js';

export default class AnimationPlaybackControls extends HTMLElement {
    static get observedAttributes() { return []}

    constructor() {
        super();
        this._playing = false;
        this.dom = {};
        this._duration = 0;

        document.body.addEventListener('drop', e => this.onFileDropped(e), false);
        document.body.addEventListener("dragover", e => this.onFileHover(e), false);
        //document.body.addEventListener("dragleave", e => this.onFileHover(e), false);
    }

    set time(value) {
        if (this._duration === 0) {
            return;
        }

        if (value > this._duration) {
            value = value % this._duration;
        }
        this.dom.timeDisplay.innerText = value.toFixed(3) + ' / ' + this._duration.toFixed(3);
    }

    set duration(value) {
        this._duration = value;
    }

    connectedCallback() {
        this.innerHTML = Template.get();
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
        this.dom.buttonContainer.addEventListener('click', e => this.onButtonClick(e));
        this.dom.fileInput.addEventListener('change', e => this.onFileInputChange(e));
        this.togglePlay(false);
    }

    onFileDropped(event) {
        event.stopPropagation();
        event.preventDefault();
        if (!event.dataTransfer.files[0]) {
            return;
        }
        let e = new CustomEvent(AnimationPlaybackControls.LOAD_GLTF, { 'detail': { files: event.dataTransfer.files, inputevent: event } });
        this.dispatchEvent(e);
    }

    onFileHover(event) {
        event.stopPropagation();
        event.preventDefault();
    }

    onFileInputChange(event) {
        if (!event.target.files[0]) {
            return;
        }
        let e = new CustomEvent(AnimationPlaybackControls.LOAD_GLTF, { 'detail': { files: event.target.files, inputevent: event } });
        this.dispatchEvent(e);
    }

    onButtonClick(event) {
        let action = '';
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

        let e = new CustomEvent(AnimationPlaybackControls.CONTROL_CLICKED, {
            'detail': { action: action, isPlaying: this._playing } });
        this.dispatchEvent(e);
    }

    togglePlay(playing) {
        if (playing) {
            this.dom.buttons.playpauseBtn.classList.remove('play');
            this.dom.buttons.playpauseBtn.classList.add('pause');
        } else {
            this.dom.buttons.playpauseBtn.classList.remove('pause');
            this.dom.buttons.playpauseBtn.classList.add('play');
        }
    }

    disconnectedCallback() {}
    attributeChangedCallback(attributeName, oldValue, newValue, namespace) {}
    adoptedCallback(oldDocument, newDocument) {}
}

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


