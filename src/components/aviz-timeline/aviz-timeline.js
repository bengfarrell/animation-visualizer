class AnimationTimeline extends HTMLElement {
    static get observedAttributes() { return []}

    constructor() {
        super();
        this.template = '<div class="timeline-view"></div> \
                        <div class="timeline-timelabels"></div>';
        this.dom = {};

        this.ticks = 1/10; // of a second
        this.zoomLevel = 200;
        this.startTime = 0;
        this.endTime = 0;
    }

    connectedCallback() {
        this.innerHTML = this.template;
        this.dom.container = document.querySelector('.timeline-view');
        this.dom.axislabel = document.querySelector('.timeline-timelabels');
    }

    createTrack(name, data) {
        let trackcontainer = document.createElement('DIV');
        trackcontainer.className = 'timeline-track';
        let canvas = document.createElement('CANVAS');
        let tracklabel = document.createElement('SPAN');
        tracklabel.innerText = name;
        canvas.width = (this.endTime - this.startTime) * 200;
        canvas.height = 10;
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = 'yellow';
        for (let c = 0; c < data.length; c++) {
            ctx.fillRect(data[c].time * this.zoomLevel, 0, 3, 5);
        }
        trackcontainer.appendChild(tracklabel);
        trackcontainer.appendChild(canvas);
        this.dom.container.appendChild(trackcontainer);
    }

    createTimelineLabel(duration) {
        let canvas = document.createElement('CANVAS');
        canvas.width = (this.endTime - this.startTime) * this.zoomLevel;
        canvas.height = 15;
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        for (let c = 0; c < duration * this.ticks; c++) {
            ctx.fillRect(c * this.zoomLevel, 0, 2, 15);
        }
        this.dom.axislabel.appendChild(canvas);
    }

    set data(gltf) {
        if (!gltf) {
            throw new Error();
        }
        let anim = this.createTimelineDataModel(gltf.animations[0]);
        this.startTime = anim.start;
        this.endTime = anim.end;
        this.createTimelineLabel(anim.duration);
        for (let track in anim.tracks) {
            this.createTrack(track, anim.tracks[track]);
        }
    }

    createTimelineDataModel(animation) {
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
    disconnectedCallback() {}
    attributeChangedCallback(attributeName, oldValue, newValue, namespace) {}
    adoptedCallback(oldDocument, newDocument) {}
}

customElements.define('aviz-timeline', AnimationTimeline);

