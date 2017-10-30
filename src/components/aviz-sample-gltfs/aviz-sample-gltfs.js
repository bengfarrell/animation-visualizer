import Template from './template.js';

export default class AnimationSampleGLTFs extends HTMLElement {
    static get observedAttributes() { return []}

    constructor() {
        super();
        this.dom = {};
    }

    connectedCallback() {
        this.innerHTML = Template.get();
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

if (!customElements.get('aviz-sample-gltfs')) {
    customElements.define('aviz-sample-gltfs', AnimationSampleGLTFs);
}

