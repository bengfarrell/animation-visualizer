class AnimationChannels extends HTMLElement {
    static get observedAttributes() { return []}

    constructor() {
        super();
        this.template = '  <ul class="channels-list">\
                           </ul>';
        this.dom = {};
    }

    connectedCallback() {
        this.innerHTML = this.template;
        this.dom.list = this.querySelector('ul');
    }

    channelTemplate(sampler, node, path ) {
        return `<span class="sampler">${sampler}</span>
                <span class="node">${node}</span>
                <span class="path ${path}">${path}</span>`;
    }

    set data(data) {
        for (let c = 0; c < data.channels.length; c++) {
            let node = data.nodes[data.channels[c].target.node];
            let el = document.createElement('li');
            el.innerHTML = this.channelTemplate(data.channels[c].sampler, node.name, data.channels[c].target.path);
            this.dom.list.appendChild(el);
        }
    }

    disconnectedCallback() {}
    attributeChangedCallback(attributeName, oldValue, newValue, namespace) {}
    adoptedCallback(oldDocument, newDocument) {}
}

customElements.define('aviz-channels-list', AnimationChannels);

