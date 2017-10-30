export default {
    get() {
        return `<div class="timeline">
                            <div class="timeline-view">
                            </div> 
                            <div class="timeline-timelabels">
                                <div class="tick-container">
                                    <canvas></canvas>
                                    <div class="playback-head"></div>
                                </div>
                                <input class="zoom" min="20" max="1000" value="200" type="range"></div>
                            </div>
                        </div>
                        <div class="keyframe-info">
                            <div class="item">
                                <h4 class="time">Time: <span class="val">-</span></h4>
                                <h4 class="frame">Frame: <span class="val">-/-</span></h4>
                            </div>
                            <div class="item position">
                                <h4>Position</h4>
                                <div class="axis"><span class="label">x</span><span class="x-val">-</span></div>
                                <div class="axis"><span class="label">y</span><span class="y-val">-</span></div>
                                <div class="axis"><span class="label">z</span><span class="z-val">-</span></div>
                                <div class="axis"><span class="label">\u25B2</span><span class="d-val">-</span></div>
                            </div>
                            <div class="item rotation">
                                <h4>Rotation</h4>
                                <div class="axis"><span class="label">x</span><span class="x-val">-</span></div>
                                <div class="axis"><span class="label">y</span><span class="y-val">-</span></div>
                                <div class="axis"><span class="label">z</span><span class="z-val">-</span></div>
                                <div class="axis"><span class="label">\u25B2</span><span class="d-val">-</span></div>
                            </div>
                            <div class="item scale">
                                <h4>Scale</h4>
                                <div class="axis"><span class="label">x</span><span class="x-val">-</span></div>
                                <div class="axis"><span class="label">y</span><span class="y-val">-</span></div>
                                <div class="axis"><span class="label">z</span><span class="z-val">-</span></div>
                                <div class="axis"><span class="label">\u25B2</span><span class="d-val">-</span></div>
                            </div>
                        </div>`;
    }
}
