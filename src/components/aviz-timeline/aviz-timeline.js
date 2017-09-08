class AnimationTimeline extends HTMLElement {
    static get observedAttributes() { return []}

    constructor() {
        super();
        this.template = '<div class="timeline">\
                            <div class="timeline-view"></div> \
                            <div class="timeline-timelabels">\
                                <div class="tick-container">\
                                    <canvas></canvas>\
                                </div>\
                                <input class="zoom" min="20" max="1000" value="200" type="range"></div>\
                            </div>\
                        </div>\
                        <div class="keyframe-info">\
                            <div class="item time">\
                                <h4>Time: <span class="val">-</span></h4>\
                            </div>\
                            <div class="item position">\
                                <h4>Position</h4>\
                                <div class="axis"><span class="label">x</span><span class="x-val">-</span></div>\
                                <div class="axis"><span class="label">y</span><span class="y-val">-</span></div>\
                                <div class="axis"><span class="label">z</span><span class="z-val">-</span></div>\
                                <div class="axis"><span class="label">\u25B2</span><span class="d-val">-</span></div>\
                            </div>\
                            <div class="item rotation">\
                                <h4>Rotation</h4>\
                                <div class="axis"><span class="label">x</span><span class="x-val">-</span></div>\
                                <div class="axis"><span class="label">y</span><span class="y-val">-</span></div>\
                                <div class="axis"><span class="label">z</span><span class="z-val">-</span></div>\
                                <div class="axis"><span class="label">\u25B2</span><span class="d-val">-</span></div>\
                            </div>\
                            <div class="item scale">\
                                <h4>Scale</h4>\
                                <div class="axis"><span class="label">x</span><span class="x-val">-</span></div>\
                                <div class="axis"><span class="label">y</span><span class="y-val">-</span></div>\
                                <div class="axis"><span class="label">z</span><span class="z-val">-</span></div>\
                                <div class="axis"><span class="label">\u25B2</span><span class="d-val">-</span></div>\
                            </div>\
                        </div>';
        this.dom = {};

        this.ticks = .1; // of a second
        this.pixelsPerSecond = 200;
        this.startTime = 0;
        this.endTime = 0;
        this.duration = 0;

        this.deltaRanges = {};
    }

    connectedCallback() {
        this.innerHTML = this.template;
        this.dom.container = this.querySelector('.timeline-view');
        this.dom.axislabel = this.querySelector('.timeline-timelabels .tick-container');
        this.dom.zoomSlider = this.querySelector('.zoom');
        this.dom.timelineZoomLabel = this.querySelector('.timeline-timelabels canvas');

        this.dom.info = {
            time: this.querySelector('.keyframe-info .time .val'),
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

        this.dom.container.addEventListener('scroll', e => this.onTimelineScroll(e));
        this.dom.zoomSlider.addEventListener('input', e => this.onZoom(e));

    }

    createTrack(name, data) {
        let trackcontainer = document.createElement('DIV');
        trackcontainer.className = 'timeline-track';
        let canvas = document.createElement('CANVAS');
        canvas.dataset.name = name;
        canvas.addEventListener('mousemove', e => this.onTrackHover(e));
        let tracklabel = document.createElement('DIV');
        tracklabel.classList.add('track-label');
        tracklabel.innerText = name;
        this.dom['track-' + name] = canvas;
        this.drawTrack(name, data);
        trackcontainer.appendChild(tracklabel);
        trackcontainer.appendChild(canvas);
        this.dom.container.appendChild(trackcontainer);
    }

    drawTrack(name, data) {
        let canvas = this.dom['track-' + name];
        canvas.width = this.duration * this.pixelsPerSecond;
        canvas.height = 16;
        let ctx = canvas.getContext('2d');
        for (let c = 0; c < data.length; c++) {
            if (data[c].transform.rotation) {
                let alpha = (data[c].transform.deltas.rotation - this.deltaRanges[name].rotation.min) / (this.deltaRanges[name].rotation.max - this.deltaRanges[name].rotation.min);
                ctx.fillStyle = `rgba(0, 255, 0, ${alpha ? alpha : 0})`;
                ctx.fillRect(data[c].time * this.pixelsPerSecond, 0, 5, 5);
                ctx.strokeStyle = 'rgba(0, 255, 0, 1)';
                ctx.lineWidth = .25;
                ctx.strokeRect(data[c].time * this.pixelsPerSecond, 0, 5, 5);
            }
            if (data[c].transform.translation) {
                let alpha = (data[c].transform.deltas.position - this.deltaRanges[name].position.min) / (this.deltaRanges[name].position.max - this.deltaRanges[name].position.min);
                ctx.fillStyle = `rgba(255, 165, 0, ${alpha ? alpha : 0})`;
                ctx.fillRect(data[c].time * this.pixelsPerSecond, 6, 5, 5);
                ctx.strokeStyle = 'rgba(255, 165, 0, 1)';
                ctx.lineWidth = .25;
                ctx.strokeRect(data[c].time * this.pixelsPerSecond, 6, 5, 5);
            }
            if (data[c].transform.scale) {
                let alpha = (data[c].transform.deltas.scaling - this.deltaRanges[name].scaling.min) / (this.deltaRanges[name].scaling.max - this.deltaRanges[name].scaling.min);
                ctx.fillStyle = `rgba(255, 255, 0, ${alpha ? alpha : 0})`;
                ctx.fillRect(data[c].time * this.pixelsPerSecond, 11, 5, 5);
                ctx.strokeStyle = 'rgba(255, 255, 0, 1)';
                ctx.lineWidth = .25;
                ctx.strokeRect(data[c].time * this.pixelsPerSecond, 11, 5, 5);
            }
        }
    }

    drawTimelineLabel() {
        let canvas = this.dom.timelineZoomLabel;
        canvas.width = this.duration * this.pixelsPerSecond;
        canvas.height = 15;
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';

        for (let c = this.ticks; c < this.duration; c += this.ticks) {
            let tHeight = 8;
            let tWidth = 1;
            if (Math.abs(Math.floor(c) - c) < .1) { // just trying to test if an integer, stupid precision loss
                tHeight = 15;
                tWidth = 3;
            }
            ctx.fillRect(c * this.pixelsPerSecond, 0, tWidth, tHeight);
        }
    }

    set data(gltf) {
        if (!gltf) {
            throw new Error();
        }
        this.anim = this.createTimelineDataModel(gltf.animations[0]);
        this.startTime = this.anim.start;
        this.endTime = this.anim.end;
        this.duration = this.anim.duration;
        this.populateDeltas(this.anim);
        this.drawTimelineLabel();
        for (let track in this.anim.tracks) {
            this.createTrack(track, this.anim.tracks[track]);
        }
    }

    populateDeltas(anim) {
        for (let track in this.anim.tracks) {
            if (!this.deltaRanges[track]) {
                this.deltaRanges[track] = {};
            }

            for (let c = 1; c < this.anim.tracks[track].length; c++) {
                let t1 = this.anim.tracks[track][c].transform;
                let t0 = this.anim.tracks[track][c-1].transform;
                let dPos = Math.sqrt(Math.pow(t1.translation.x - t0.translation.x, 2) + Math.pow(t1.translation.y - t0.translation.y, 2) + Math.pow(t1.translation.z - t0.translation.z, 2));
                let dRot = Math.sqrt(Math.pow(t1.rotation.x - t0.rotation.x, 2) + Math.pow(t1.rotation.y - t0.rotation.y, 2) + Math.pow(t1.rotation.z - t0.rotation.z, 2));
                let dScale = Math.sqrt(Math.pow(t1.scale.x - t0.scale.x, 2) + Math.pow(t1.scale.y - t0.scale.y, 2) + Math.pow(t1.scale.z - t0.scale.z, 2));
                this.anim.tracks[track][c].transform.deltas = { position: dPos, rotation: dRot, scaling: dScale };

                if (!this.deltaRanges[track].rotation) {
                    this.deltaRanges[track].rotation = {};
                    this.deltaRanges[track].rotation.min = dRot;
                    this.deltaRanges[track].rotation.max = dRot;
                } else {
                    if (this.deltaRanges[track].rotation.min > dRot) { this.deltaRanges[track].rotation.min = dRot; }
                    if (this.deltaRanges[track].rotation.max < dRot) { this.deltaRanges[track].rotation.max = dRot; }
                }

                if (!this.deltaRanges[track].position) {
                    this.deltaRanges[track].position = {};
                    this.deltaRanges[track].position.min = dPos;
                    this.deltaRanges[track].position.max = dPos;
                } else {
                    if (this.deltaRanges[track].position.min > dPos) { this.deltaRanges[track].position.min = dPos; }
                    if (this.deltaRanges[track].position.max < dPos) { this.deltaRanges[track].position.max = dPos; }
                }

                if (!this.deltaRanges[track].scaling) {
                    this.deltaRanges[track].scaling = {};
                    this.deltaRanges[track].scaling.min = dScale;
                    this.deltaRanges[track].scaling.max = dScale;
                } else {
                    if (this.deltaRanges[track].scaling.min > dScale) { this.deltaRanges[track].scaling.min = dScale; }
                    if (this.deltaRanges[track].scaling.max < dScale) { this.deltaRanges[track].scaling.max = dScale; }
                }
            }
            // first track has no delta, so give it maximum delta
            this.anim.tracks[track][0].transform.deltas = {
                position: this.deltaRanges[track].position.max,
                rotation: this.deltaRanges[track].rotation.max,
                scaling: this.deltaRanges[track].scaling.max
            };
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

    onTimelineScroll(event) {
        this.dom.axislabel.scrollLeft = this.dom.container.scrollLeft;

        let labels = this.querySelectorAll('.track-label');
        for (let c = 0; c < labels.length; c++) {
            labels[c].style.paddingLeft = this.dom.container.scrollLeft + 5 + 'px';
        }

        let tracks = this.querySelectorAll('.timeline-track');
        for (let c = 0; c < tracks.length; c++) {
            tracks[c].style.width = this.duration * this.pixelsPerSecond + 'px';
        }
    }

    onZoom(event) {
        this.pixelsPerSecond = event.target.value;
        this.drawTimelineLabel();
        for (let track in this.anim.tracks) {
            this.drawTrack(track, this.anim.tracks[track]);
        }
    }

    onTrackHover(event) {
        let time = event.offsetX / this.pixelsPerSecond;

        let track = this.anim.tracks[event.target.dataset.name];
        for (let c = 0; c < track.length; c++) {
            if (track[c].time >= time) {
                this.dom.info.time.innerText = track[c].time.toFixed(3);

                if (track[c].transform.translation) {
                    this.dom.info.position.x.innerText = track[c].transform.translation.x.toFixed(3);
                    this.dom.info.position.y.innerText = track[c].transform.translation.y.toFixed(3);
                    this.dom.info.position.z.innerText = track[c].transform.translation.z.toFixed(3);
                    this.dom.info.position.d.innerText = track[c].transform.deltas.position.toFixed(3);
                } else {
                    this.clearInfoValues('position');
                }

                if (track[c].transform.rotation) {
                    this.dom.info.rotation.x.innerText = track[c].transform.rotation.x.toFixed(3);
                    this.dom.info.rotation.y.innerText = track[c].transform.rotation.y.toFixed(3);
                    this.dom.info.rotation.z.innerText = track[c].transform.rotation.z.toFixed(3);
                    this.dom.info.rotation.d.innerText = track[c].transform.deltas.rotation.toFixed(3);
                } else {
                    this.clearInfoValues('rotation');
                }

                if (track[c].transform.scale) {
                    this.dom.info.scale.x.innerText = track[c].transform.scale.x.toFixed(3);
                    this.dom.info.scale.y.innerText = track[c].transform.scale.y.toFixed(3);
                    this.dom.info.scale.z.innerText = track[c].transform.scale.z.toFixed(3);
                    this.dom.info.scale.d.innerText = track[c].transform.deltas.scaling.toFixed(3);
                } else {
                    this.clearInfoValues('scale');
                }
                return;
            }
        }
    }

    clearInfoValues(transformTypes) {
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

customElements.define('aviz-timeline', AnimationTimeline);

