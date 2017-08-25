class AnimationSamplers extends HTMLElement {
    static get observedAttributes() { return []}

    constructor() {
        super();
        this.template = '  <ul class="sampler-list">\
                           </ul>';
        this.dom = {};
    }

    connectedCallback() {
        this.innerHTML = this.template;
        this.dom.list = this.querySelector('ul');
    }

    samplerVec3Template(input, output, delta, interpolation, path, nodename) {
        return `<div class="interpolation">${interpolation} ${path} ${nodename}</div>
                <div class="transform">
                    <div class="input"><div class="input-label">i</div>
                        <div class="value">${input.x}</div> 
                        <div class="value">${input.y}</div>
                        <div class="value">${input.z}</div>
                    </div>
                    <div class="delta"><div class="delta-label">\u25B2</div>
                        <div class="value">${delta.x}</div> 
                        <div class="value">${delta.y}</div>
                        <div class="value">${delta.z}</div>
                    </div>
                    <div class="output"><div class="output-label">o</div>
                        <div class="value">${output.x}</div> 
                        <div class="value">${output.y}</div>
                        <div class="value">${output.z}</div>
                    </div>
                </div>`;
    }

    samplerScalarTemplate(input, output, delta, interpolation, path, nodename) {
        return `<div class="interpolation">${interpolation} ${path} ${nodename} </div>
                <div class="transform">
                    <div class="input">
                        <div class="input-label">i</div>
                        <div class="value">${input}</div> 
                    </div>
                    <div class="delta">
                        <div class="delta-label">\u25B2</div>
                        <div class="value">${delta}</div> 
                    </div>
                    <div class="output">
                        <div class="output-label">o</div>
                        <div class="value">${output}</div>
                    </div>
                </div>`;
    }

    set data(data) {
        for (let c = 0; c < data.samplers.length; c++) {
            // probably a faulty assumption, but use just min for now (min/max acts like a bounding box
            let inputAccessor = data.accessors[data.samplers[c].input].min;
            let outputAccessor = data.accessors[data.samplers[c].output].min;
            let channel;
            let node;
            for (let d = 0; d < data.channels.length; d++) {
                if (data.channels[d].sampler === c) {
                    channel = data.channels[c];
                    node = data.nodes[channel.target.node];
                }
            }

            let input, output, delta;
            let el = document.createElement('li');
            if (data.accessors[data.samplers[c].input].type === 'VEC3') {
                input = {
                    x: data.accessors[data.samplers[c].input][0],
                    y: data.accessors[data.samplers[c].input][1],
                    z: data.accessors[data.samplers[c].input][2]
                };
                output = {
                    x: data.accessors[data.samplers[c].input][0],
                    y: data.accessors[data.samplers[c].input][1],
                    z: data.accessors[data.samplers[c].input][2]
                };

                delta = {x: output.x - input.x, y: output.y - input.y, z: output.z - input.z};
                el.innerHTML = this.samplerVec3Template(input, output, delta, data.samplers[c].interpolation, channel.target.path, node.name);
            } else if (data.accessors[data.samplers[c].input].type === 'SCALAR') {
                input = data.accessors[data.samplers[c].input].min[0];
                output = data.accessors[data.samplers[c].output].min[0];
                delta = output - input;
                el.innerHTML = this.samplerScalarTemplate(input, output, delta, data.samplers[c].interpolation, channel.target.path, node.name);
            } else {
               console.log(data.accessors[data.samplers[c].input].type);
            }

            this.dom.list.appendChild(el);
        }
    }

    disconnectedCallback() {}
    attributeChangedCallback(attributeName, oldValue, newValue, namespace) {}
    adoptedCallback(oldDocument, newDocument) {}
}

customElements.define('aviz-samplers-list', AnimationSamplers);

