class AnimationPlaybackControls extends HTMLElement {
    static get observedAttributes() { return []}

    constructor() {
        super();
        this._playing = false;
        this.template = '   <div class="button-container">\
                                <div class="fast-backward btn"></div>\
                                <div class="step-backward btn"></div>\
                                <div class="playpause btn"></div>\
                                <div class="step-forward btn"></div>\
                                <div class="fast-forward btn"></div>\
                            </div>\
                            <div class="time-display">- / -</div>\
                            <div class="animation-selector">\
                                <select></select>\
                            </div>';
        this.dom = {};
        this._duration = 0;
    }

    set numOfAnimations(val) {
        this.dom.animationSelector.innerHTML = '';
        for (let c = 0; c < val; c++) {
            let opt = document.createElement('option');
            opt.innerText = 'Animation ' + c + 1;
            opt.value = c;
            this.dom.animationSelector.appendChild(opt);
        }
    }

    set time(value) {
        if (this._duration === 0) {
            return;
        }
        value = value % this._duration;
        this.dom.timeDisplay.innerText = value.toFixed(3) + ' / ' + this._duration.toFixed(3);
    }

    set duration(value) {
        this._duration = value;
    }

    connectedCallback() {
        this.innerHTML = this.template;
        this.dom.buttons = {};
        this.dom.buttons.fastForwardBtn = this.querySelector('.fast-forward');
        this.dom.buttons.fastBackwardBtn = this.querySelector('.fast-backward');
        this.dom.buttons.stepForwardBtn = this.querySelector('.step-forward');
        this.dom.buttons.stepBackwardBtn = this.querySelector('.step-backward');
        this.dom.buttons.playpauseBtn = this.querySelector('.playpause');
        this.dom.buttonContainer = this.querySelector('.button-container');
        this.dom.animationSelector = this.querySelector('.animation-selector select');
        this.dom.timeDisplay = this.querySelector('.time-display');
        this.dom.buttonContainer.addEventListener('click', e => this.onButtonClick(e));
        this.dom.animationSelector.addEventListener('change', e => this.onAnimationSelected(e));
        this.togglePlay(false);
    }

    onAnimationSelected(event) {
        let e = new CustomEvent(AnimationPlaybackControls.ANIMATION_SELECTED, { 'detail': { animationIndex: event.currentTarget.value } });
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
AnimationPlaybackControls.ANIMATION_SELECTED = 'onAnimationSelected';
AnimationPlaybackControls.PLAY = 'play';
AnimationPlaybackControls.PAUSE = 'pause';
AnimationPlaybackControls.FAST_FORWARD = 'fastforward';
AnimationPlaybackControls.FAST_BACKWARD = 'fastbackward';
AnimationPlaybackControls.STEP_FORWARD = 'stepforward';
AnimationPlaybackControls.STEP_BACKWARD = 'stepbackward';
customElements.define('aviz-playback-controls', AnimationPlaybackControls);

