export default {
    get() {
        return `<div class="button-container">
                    <div class="fast-backward btn"></div>
                    <div class="step-backward btn"></div>
                    <div class="playpause btn"></div>
                    <div class="step-forward btn"></div>
                    <div class="fast-forward btn"></div>
                </div>
                <div class="time-display">- / -</div>
                <div class="load-button">
                    <div>Load glTF...</div>
                    <input type="file" class="file-input" id="files" name="files[]" accept=".gltf, .bin, .png, .jpg, .jpeg, .gif" multiple />
                </div>`;
    }
}
