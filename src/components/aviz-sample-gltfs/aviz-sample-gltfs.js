class AnimationSampleGLTFs extends HTMLElement {
    static get observedAttributes() { return []}

    constructor() {
        super();
        this.template = '<h3>Sample glTF files</h3>\
                         <div class="container"></div>\
                         <p>Alternately, drag & drop or load your glTF files. Sorry, .glb files are not supported at this time</p>\
                         <p>When loading, please drag/drop/multiselect all files simultaneously (gltf, bin, images)</p>';
        this.dom = {};
    }

    connectedCallback() {
        this.innerHTML = this.template;
        this.dom.list = this.querySelector('.container');
        this.dom.list.addEventListener('click', e => this.onFileClicked(e));

        let loader = new XMLHttpRequest();
        loader.open('GET', this.getAttribute('manifest'), true);
        loader.onload = e => this.onFileManifestLoaded(e);
        loader.send();
    }

    onFileManifestLoaded(loader) {
        let files = JSON.parse(loader.target.response);
        for (let c = 0; c < files.length; c++) {
            let item = document.createElement('p');
            item.dataset.uri = files[c].uri;
            item.innerHTML = `<a href="#">${files[c].name}</a>`;
            this.dom.list.appendChild(item);
        }
    }

    onFileClicked(event) {
        if (!event.target.parentNode.dataset.uri) {
            return;
        }
        let e = new CustomEvent(AnimationSampleGLTFs.SELECT_REMOTE_FILE, { 'detail': { uri: event.target.parentNode.dataset.uri } });
        this.dispatchEvent(e);
    }

    disconnectedCallback() {}
    attributeChangedCallback(attributeName, oldValue, newValue, namespace) {}
    adoptedCallback(oldDocument, newDocument) {}
}

AnimationSampleGLTFs.SELECT_REMOTE_FILE = 'onRemoteFileSelected';
customElements.define('aviz-sample-gltfs', AnimationSampleGLTFs);

