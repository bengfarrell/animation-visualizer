import Template from './template.js';

export default class AnimationTimeline extends HTMLElement {
    static get observedAttributes() { return []}

    set data(timeline) {
        this.destroy();

        this.timelineWidth = 0;
        this.createPlaybackLine();
        this.timeline = timeline;
        this._populateDeltas(this.timeline);
        this._drawTimelineLabel();
        for (let c = 0; c < this.timeline.animations.length; c++) {
            this._createAnimationHeader(c);
            for (let track in this.timeline.animations[c].animation.tracks) {
                this._createTrack(c, track, this.timeline.animations[c].animation.tracks[track]);
            }
        }
  
        this.dom.playbackLine.style.height = this.dom.container.scrollHeight + 'px';
        this.currentTime = 0;
        this._onTimelineScroll();
    }

    destroy() {
        this.dom.container.innerHTML = '';
    }

    createPlaybackLine() {
        this.dom.playbackLine = document.createElement('div');
        this.dom.playbackLine.classList.add('playback-line');
        this.dom.container.appendChild(this.dom.playbackLine);
    }

    set currentTime(seconds) {
        if (this.timeline && !this._draggingPlayhead) {
            this.relativeTime = seconds % this.timeline.duration;
            this.dom.playbackLine.style.left = this.relativeTime * this.pixelsPerSecond + 'px';
            this.dom.playbackHead.style.left = this.relativeTime * this.pixelsPerSecond - 7 + 'px';
        }
    }

    constructor() {
        super();
        this.dom = {};

        this._draggingPlayhead = false;
        this.selectedTrack;
        this.ticks = .1; // of a second
        this.pixelsPerSecond = 200;
        this.keyframeSize = {
            width: 5,
            height: 5
        };
        this.deltaRanges = {};
    }

    connectedCallback() {
        this.innerHTML = Template.get();
        this.dom.container = this.querySelector('.timeline-view');
        this.dom.axislabel = this.querySelector('.timeline-timelabels .tick-container');
        this.dom.zoomSlider = this.querySelector('.zoom');
        this.dom.timelineZoomLabel = this.querySelector('.timeline-timelabels canvas');
        this.dom.playbackLine = this.querySelector('.timeline-view .playback-line');
        this.dom.playbackHead = this.querySelector('.timeline-timelabels .tick-container .playback-head');

        this.dom.info = {
            time: this.querySelector('.keyframe-info .time .val'),
            frame: this.querySelector('.keyframe-info .frame .val'),
            position: {
                x: this.querySelector('.keyframe-info .position .x-val'),
                y: this.querySelector('.keyframe-info .position .y-val'),
                z: this.querySelector('.keyframe-info .position .z-val'),
                d: this.querySelector('.keyframe-info .position .d-val')
            },
            rotation: {
                x: this.querySelector('.keyframe-info .rotation .x-val'),
                y: this.querySelector('.keyframe-info .rotation .y-val'),
                z: this.querySelector('.keyframe-info .rotation .z-val'),
                d: this.querySelector('.keyframe-info .rotation .d-val')
            },
            scale: {
                x: this.querySelector('.keyframe-info .scale .x-val'),
                y: this.querySelector('.keyframe-info .scale .y-val'),
                z: this.querySelector('.keyframe-info .scale .z-val'),
                d: this.querySelector('.keyframe-info .scale .d-val')
            }
        };

        this.dom.container.addEventListener('scroll', e => this._onTimelineScroll(e));
        this.dom.zoomSlider.addEventListener('input', e => this._onZoom(e));
        this.dom.axislabel.addEventListener('mousedown', e => this._onLabelTrackMouseDown(e));
        this.addEventListener('mouseup', e => this._onLabelTrackMouseUp(e));
        this.addEventListener('mousemove', e => this._onLabelTrackMouseMove(e));
    }

    _createAnimationHeader(animationIndex) {
        let header = document.createElement('DIV');
        header.classList.add('animation-header');
        header.innerHTML = '<span>Animation ' + animationIndex + '</span>';
        this.dom.container.appendChild(header);
    }

    _createTrack(animationIndex, name, data) {
        let trackcontainer = document.createElement('DIV');
        trackcontainer.dataset.name = name;
        trackcontainer.dataset.animation = animationIndex;
        trackcontainer.addEventListener('click', e => this._onTrackClick(e));
        trackcontainer.addEventListener('mousemove', e => this._onTrackHover(e));
        trackcontainer.className = 'timeline-track';
        let canvas = document.createElement('CANVAS');
        let tracklabel = document.createElement('DIV');
        tracklabel.classList.add('track-label');

        /*let trackVisibilityToggle = document.createElement('div');
        trackVisibilityToggle.classList.add('icon-eye');
        trackVisibilityToggle.classList.add('on');
        trackVisibilityToggle.addEventListener('click', e => this._onTrackVisibilityClick(e));
        tracklabel.appendChild(trackVisibilityToggle);*/

        let trackName = document.createElement('span');
        trackName.innerText = name;
        tracklabel.appendChild(trackName);
        this.dom['animation-' + animationIndex + '-track-' + name] = canvas;
        this._drawTrack(animationIndex, name, data);
        trackcontainer.appendChild(tracklabel);
        trackcontainer.appendChild(canvas);
        this.dom.container.appendChild(trackcontainer);
    }

    _drawTrack(animationIndex, name, data) {
        let canvas = this.dom['animation-' + animationIndex + '-track-' + name];
        this.timelineWidth = this.timeline.duration * this.pixelsPerSecond + this.keyframeSize.width;
        canvas.width = this.timelineWidth;
        canvas.height = 16;
        let ctx = canvas.getContext('2d');
        for (let c = 0; c < data.length; c++) {
            if (data[c].transform.translation) {
                let alpha = (data[c].transform.deltas.position - this.deltaRanges[name].position.min) / (this.deltaRanges[name].position.max - this.deltaRanges[name].position.min);
                ctx.fillStyle = `rgba(0, 255, 0, ${alpha ? alpha : 0})`;
                ctx.fillRect(data[c].time * this.pixelsPerSecond, 0, this.keyframeSize.width, this.keyframeSize.height);
                ctx.strokeStyle = 'rgba(0, 255, 0, 1)';
                ctx.lineWidth = .25;
                ctx.strokeRect(data[c].time * this.pixelsPerSecond, 0, this.keyframeSize.width, this.keyframeSize.height);
            }
            if (data[c].transform.rotation) {
                let alpha = (data[c].transform.deltas.rotation - this.deltaRanges[name].rotation.min) / (this.deltaRanges[name].rotation.max - this.deltaRanges[name].rotation.min);
                ctx.fillStyle = `rgba(255, 165, 0, ${alpha ? alpha : 0})`;
                ctx.fillRect(data[c].time * this.pixelsPerSecond, this.keyframeSize.width+1, this.keyframeSize.width, this.keyframeSize.height);
                ctx.strokeStyle = 'rgba(255, 165, 0, 1)';
                ctx.lineWidth = .25;
                ctx.strokeRect(data[c].time * this.pixelsPerSecond, this.keyframeSize.width+1, this.keyframeSize.width, this.keyframeSize.height);
            }
            if (data[c].transform.scale) {
                let alpha = (data[c].transform.deltas.scaling - this.deltaRanges[name].scaling.min) / (this.deltaRanges[name].scaling.max - this.deltaRanges[name].scaling.min);
                ctx.fillStyle = `rgba(255, 255, 0, ${alpha ? alpha : 0})`;
                ctx.fillRect(data[c].time * this.pixelsPerSecond, this.keyframeSize.width*2+1, this.keyframeSize.width, this.keyframeSize.height);
                ctx.strokeStyle = 'rgba(255, 255, 0, 1)';
                ctx.lineWidth = .25;
                ctx.strokeRect(data[c].time * this.pixelsPerSecond, this.keyframeSize.width*2+1, this.keyframeSize.width, this.keyframeSize.height);
            }
        }
    }

    _drawTimelineLabel() {
        let canvas = this.dom.timelineZoomLabel;
        canvas.width = this.timeline.duration * this.pixelsPerSecond + this.keyframeSize.width;
        canvas.height = 15;
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';

        for (let c = this.ticks; c < this.timeline.duration; c += this.ticks) {
            let tHeight = 8;
            let tWidth = 1;
            if (Math.abs(Number(Math.round(c +'e2')+'e-2') === Math.round(c))) { // just trying to test if an integer, stupid precision loss
                tHeight = 15;
                tWidth = 3;
            }
            ctx.fillRect(c * this.pixelsPerSecond, 0, tWidth, tHeight);
        }
    }

    _populateDeltas(timeline) {
        for (let d = 0; d < timeline.animations.length; d++) {
            for (let track in timeline.animations[d].animation.tracks) {
                if (!this.deltaRanges[track]) {
                    this.deltaRanges[track] = {};
                }

                for (let c = 1; c < timeline.animations[d].animation.tracks[track].length; c++) {
                    let t1 = timeline.animations[d].animation.tracks[track][c].transform;
                    let t0 = timeline.animations[d].animation.tracks[track][c-1].transform;

                    let dPos = 0;
                    if (t1.translation && t0.translation) {
                        dPos = Math.sqrt(Math.pow(t1.translation.x - t0.translation.x, 2) + Math.pow(t1.translation.y - t0.translation.y, 2) + Math.pow(t1.translation.z - t0.translation.z, 2));
                    }

                    let dRot = 0;
                    if (t1.rotation && t0.rotation) {
                        dRot = Math.sqrt(Math.pow(t1.rotation.x - t0.rotation.x, 2) + Math.pow(t1.rotation.y - t0.rotation.y, 2) + Math.pow(t1.rotation.z - t0.rotation.z, 2));
                    }

                    let dScale = 0;
                    if (t1.scale && t0.scale) {
                        dScale = Math.sqrt(Math.pow(t1.scale.x - t0.scale.x, 2) + Math.pow(t1.scale.y - t0.scale.y, 2) + Math.pow(t1.scale.z - t0.scale.z, 2));
                    }

                    timeline.animations[d].animation.tracks[track][c].transform.deltas = { position: dPos, rotation: dRot, scaling: dScale };

                    if (!this.deltaRanges[track].rotation) {
                        this.deltaRanges[track].rotation = {};
                        this.deltaRanges[track].rotation.min = 0;
                        this.deltaRanges[track].rotation.max = dRot;
                    } else {
                        if (this.deltaRanges[track].rotation.min > dRot) { this.deltaRanges[track].rotation.min = dRot; }
                        if (this.deltaRanges[track].rotation.max < dRot) { this.deltaRanges[track].rotation.max = dRot; }
                    }

                    if (!this.deltaRanges[track].position) {
                        this.deltaRanges[track].position = {};
                        this.deltaRanges[track].position.min = 0;
                        this.deltaRanges[track].position.max = dPos;
                    } else {
                        if (this.deltaRanges[track].position.min > dPos) { this.deltaRanges[track].position.min = dPos; }
                        if (this.deltaRanges[track].position.max < dPos) { this.deltaRanges[track].position.max = dPos; }
                    }

                    if (!this.deltaRanges[track].scaling) {
                        this.deltaRanges[track].scaling = {};
                        this.deltaRanges[track].scaling.min = 0;
                        this.deltaRanges[track].scaling.max = dScale;
                    } else {
                        if (this.deltaRanges[track].scaling.min > dScale) { this.deltaRanges[track].scaling.min = dScale; }
                        if (this.deltaRanges[track].scaling.max < dScale) { this.deltaRanges[track].scaling.max = dScale; }
                    }
                }
                // first track has no delta, so give it maximum delta
                timeline.animations[d].animation.tracks[track][0].transform.deltas = {
                    position: this.deltaRanges[track].position.max,
                    rotation: this.deltaRanges[track].rotation.max,
                    scaling: this.deltaRanges[track].scaling.max
                };
            }
        }
    }

    _onTimelineScroll(event) {
        this.dom.axislabel.scrollLeft = this.dom.container.scrollLeft;

        let labels = this.querySelectorAll('.track-label');
        for (let c = 0; c < labels.length; c++) {
            labels[c].style.paddingLeft = this.dom.container.scrollLeft + this.keyframeSize.width + 15 + 'px';
        }

        let animheaders = this.querySelectorAll('.animation-header span');
        for (let c = 0; c < animheaders.length; c++) {
            animheaders[c].style.paddingLeft = this.dom.container.scrollLeft + 5 + 'px';
            animheaders[c].parentNode.style.width = this.timeline.duration * this.pixelsPerSecond + this.keyframeSize.width - 15 + 'px';
        }

        let tracks = this.querySelectorAll('.timeline-track');
        for (let c = 0; c < tracks.length; c++) {
            tracks[c].style.width = this.timeline.duration * this.pixelsPerSecond + this.keyframeSize.width + 5 + 'px';
        }
    }

    _onZoom(event) {
        this.pixelsPerSecond = event.target.value;
        this._drawTimelineLabel();

        for (let c = 0; c < this.timeline.animations.length; c++) {
            for (let track in this.timeline.animations[c].animation.tracks) {
                this._drawTrack(c, track, this.timeline.animations[c].animation.tracks[track]);
            }
        }
        this._onTimelineScroll(); // need track resizing
    }

    _onTrackClick(event) {
        if (this.selectedTrack) {
            this.selectedTrack.classList.remove('selected');
        }

        if (this.selectedTrack === event.currentTarget) {
            this.selectedTrack = null;
            return;
        }
        this.selectedTrack = event.currentTarget;
        this.selectedTrack.classList.add('selected');

        let e = new CustomEvent(AnimationTimeline.TRACK_SELECTED, { 'detail': { name: event.currentTarget.dataset.name } });
        this.dispatchEvent(e);
    }

    _onTrackVisibilityClick(event) {
        event.stopPropagation();
        let visible;
        if (event.target.classList.contains('on')) {
            event.target.classList.remove('on');
            event.target.classList.add('off');
            visible = false;
        } else {
            event.target.classList.remove('off');
            event.target.classList.add('on');
            visible = true;
        }

        let e = new CustomEvent(AnimationTimeline.TRACK_PLAYBACK_CHANGED, {
            'detail': {
                name: event.target.parentNode.parentNode.dataset.name,
                visible: visible,
                playbacktime: this.relativeTime / this.timeline.duration
            }});
        this.dispatchEvent(e);
    }

    _onTrackHover(event) {
        let time = (event.offsetX - this.keyframeSize.width) / this.pixelsPerSecond;
        let track = this.timeline.animations[parseInt(event.currentTarget.dataset.animation)].animation.tracks[event.currentTarget.dataset.name];
        let timeIndex;
        for (let c = 0; c < track.length; c++) {
            if (track[c].time >= time) {
                this.dom.info.time.innerText = track[c].time.toFixed(3);
                this.dom.info.frame.innerText = (c+1) + ' / ' + track.length;

                if (track[c].transform.translation) {
                    this.dom.info.position.x.innerText = track[c].transform.translation.x.toFixed(3);
                    this.dom.info.position.y.innerText = track[c].transform.translation.y.toFixed(3);
                    this.dom.info.position.z.innerText = track[c].transform.translation.z.toFixed(3);
                    this.dom.info.position.d.innerText = track[c].transform.deltas.position.toFixed(3);
                } else {
                    this._clearInfoValues('position');
                }

                if (track[c].transform.rotation) {
                    this.dom.info.rotation.x.innerText = track[c].transform.rotation.x.toFixed(3);
                    this.dom.info.rotation.y.innerText = track[c].transform.rotation.y.toFixed(3);
                    this.dom.info.rotation.z.innerText = track[c].transform.rotation.z.toFixed(3);
                    this.dom.info.rotation.d.innerText = track[c].transform.deltas.rotation.toFixed(3);
                } else {
                    this._clearInfoValues('rotation');
                }

                if (track[c].transform.scale) {
                    this.dom.info.scale.x.innerText = track[c].transform.scale.x.toFixed(3);
                    this.dom.info.scale.y.innerText = track[c].transform.scale.y.toFixed(3);
                    this.dom.info.scale.z.innerText = track[c].transform.scale.z.toFixed(3);
                    this.dom.info.scale.d.innerText = track[c].transform.deltas.scaling.toFixed(3);
                } else {
                    this._clearInfoValues('scale');
                }
                return;
            }
        }
    }

    _onLabelTrackMouseDown(event) {
       this._draggingPlayhead = true;
    }

    _onLabelTrackMouseUp(event) {
        if (this._draggingPlayhead) {
            this._draggingPlayhead = false;
            let bounds = event.currentTarget.getBoundingClientRect();
            this._scrubTimeline(event.clientX - bounds.left, true);
        }
    }

    _onLabelTrackMouseMove(event) {
        if (this._draggingPlayhead) {
            let bounds = event.currentTarget.getBoundingClientRect();
            this._scrubTimeline(event.clientX - bounds.left, false);
        }
    }

    _scrubTimeline(posX, endscrub) {
        let bounds = event.currentTarget.getBoundingClientRect();
        if (posX > this.timelineWidth) {
            posX = this.timelineWidth;
        }
        this.dom.playbackLine.style.left = posX + 'px';
        this.dom.playbackHead.style.left = posX - 7 + 'px';

        let time = (posX-1) / this.pixelsPerSecond;
        if (time < 0) {
            time = 0;
        }
        if (time > this.timeline.duration) {
            time = this.timeline.duration;
        }

        let e = new CustomEvent(AnimationTimeline.SCRUB_TIMELINE, {
            'detail': {
                resumeplayback: endscrub,
                playbacktime: time,
                playbackratio: time / this.timeline.duration
            }});
        this.dispatchEvent(e);
    }

    _clearInfoValues(transformTypes) {
        if (typeof transformTypes === 'string') {
            transformTypes = [transformTypes];
        }

        for (let c = 0; c < transformTypes.length; c++) {
            this.dom.info[transformTypes].x.innerText = '-';
            this.dom.info[transformTypes].y.innerText = '-';
            this.dom.info[transformTypes].z.innerText = '-';
            this.dom.info[transformTypes].d.innerText = '-';
        }
    }

    disconnectedCallback() {}
    attributeChangedCallback(attributeName, oldValue, newValue, namespace) {}
    adoptedCallback(oldDocument, newDocument) {}
}
AnimationTimeline.TRACK_SELECTED = 'onTrackSelected';
AnimationTimeline.SCRUB_TIMELINE = 'onScrubTimeline';
AnimationTimeline.TRACK_PLAYBACK_CHANGED = 'onTrackPlaybackChanged';

if (!customElements.get('aviz-timeline')) {
    customElements.define('aviz-timeline', AnimationTimeline);
}

