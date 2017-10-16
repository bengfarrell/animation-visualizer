class AnimationNodes extends HTMLElement {
    static get observedAttributes() { return []}

    constructor() {
        super();

        // two ways to represent the node list (same nodes)
        this._tree = { name: "Scene Root", index: -1, children: [] };
        this._list = [];
        this._breadcrumbTrail = [];
        this.template = '  <div class="node-header"></div>\
                           <div class="breadcrumbs"></div>\
                            <ul class="nodes-list">\
                           </ul>';
        this.dom = {};
    }

    connectedCallback() {
        this.innerHTML = this.template;
        this.dom.list = this.querySelector('ul');
        this.dom.header = this.querySelector('.node-header');
        this.dom.breadcrumbs = this.querySelector('.breadcrumbs');

        this.addBreadcrumb(this._tree);
    }

    selectNodeByName(name) {
        for (let c = 0; c < this._list.length; c++) {
            if (this._list[c].name == name) {
                let node = this._list[c];
                this._breadcrumbTrail = [];
                while (node.parent) {
                    this._breadcrumbTrail.push(node);
                    node = node.parent;
                }

                this._breadcrumbTrail.reverse();
                this.renderBreadcrumbs();
                this.renderNode(this._list[c]);
            }
        }
    }

    renderNode(node) {
        this.dom.list.innerHTML = '';
        this.dom.header.innerHTML = node.name;
        for (let c = 0; c < node.children.length; c++) {
            let el = document.createElement('li');
            el.innerHTML = this.nodeTemplate(node.children[c].index, node.children[c].name, node.children[c].transform, node.children[c].children.length);

            let expand = el.querySelector('.expand');
            if (expand) {
                expand.addEventListener('click', e => this.onExpandClick(e) );
            }

            this.dom.list.appendChild(el);
        }
    }

    renderBreadcrumbs() {
        this.dom.breadcrumbs.innerHTML = '';
        for (let c = 0; c < this._breadcrumbTrail.length-1; c++) {
            let el = document.createElement('span');
            el.classList.add('circle');
            el.dataset.index = this._breadcrumbTrail[c].index;
            el.addEventListener('click', e => this.onBreadcrumbClicked(e));
            this.dom.breadcrumbs.appendChild(el);
        }
    }

    addBreadcrumb(node) {
        this._breadcrumbTrail.push(node);
        this.renderBreadcrumbs();
    }

    nodeTemplate(index, name, transform, numChildren) {
        let tPos, tRot, tScale;
        if (!transform.position) {
            tPos = ['-', '-', '-'];
        } else {
            tPos = [transform.position[0].toFixed(2), transform.position[1].toFixed(2), transform.position[2].toFixed(2) ];
        }

        if (!transform.rotation) {
            tRot = ['-', '-', '-', '-'];
        } else {
            tRot = [transform.rotation[0].toFixed(2), transform.rotation[1].toFixed(2), transform.rotation[2].toFixed(2), transform.rotation[3].toFixed(2) ];
        }

        if (!transform.scale) {
            tScale = ['-', '-', '-'];
        } else {
            tScale = [transform.scale[0].toFixed(2), transform.scale[1].toFixed(2), transform.scale[2].toFixed(2) ];
        }

        let expand = '';
        if (numChildren === 1) {
            expand = `<a data-index="${index}"> + (${numChildren} child)</a>`;
        } else if (numChildren > 1) {
            expand = `<a data-index="${index}"> + (${numChildren} children)</a>`
        }

        return `<div><p class="name">${name}</p><p class="expand">${expand}</p></div>
                <div class="transform">
                    <div class="position"><div class="transform-label">T</div>
                        <div class="value">${tPos[0]}</div> 
                        <div class="value">${tPos[1]}</div>
                        <div class="value">${tPos[2]}</div>
                    </div>
                    <div class="rotation"><div class="transform-label">R</div>
                        <div class="value">${tRot[0]}</div>
                        <div class="value">${tRot[1]}</div>
                        <div class="value">${tRot[2]}</div>
                        <div class="value">${tRot[3]}</div>
                    </div>
                    <div class="scale"><div class="transform-label">S</div> 
                        <div class="value">${tScale[0]}</div>
                        <div class="value">${tScale[1]}</div> 
                        <div class="value">${tScale[2]}</div>
                    </div>
                </div>`;
    }

    set data(nodes) {
        this.destroy();
        this._list = [];
        for (let c = 0; c < nodes.length; c++) {

            let transform = {};
            if (nodes[c].translation) {
                transform.translation = nodes[c].translation;
            }
            if (nodes[c].rotation) {
                transform.rotation = nodes[c].rotation;
            }
            if (nodes[c].scale) {
                transform.scale = nodes[c].scale;
            }

            let node = {
                name: nodes[c].name,
                index: c,
                transform: transform,
                children: nodes[c].children ? nodes[c].children : [],
            };

            this._list.push(node);
        }

        for (let d = 0; d < this._list.length; d++) {
            if (this._list[d].children.length > 0) {
                for (let e = 0; e < this._list[d].children.length; e++) {
                    // replace indices with nodes
                    this._list[d].children[e] = this._list[this._list[d].children[e]];
                    this._list[d].children[e].parent = this._list[d];
                }
            }
        }

        for (let f = 0; f < this._list.length; f++) {
            if (!this._list[f].parent) {
                this._list[f].parent = this._tree;
                this._tree.children.push(this._list[f]);
            }
        }

        this.renderNode(this._tree);
    }


    destroy() {
        this._tree = { name: "Scene Root", index: -1, children: [] };
        this.dom.list.innerHTML = '';
        this.dom.breadcrumbs.innerHTML = '';
    }

    onBreadcrumbClicked(e) {
        let nodeIndex = parseInt(e.target.dataset.index);
        for (let d = 0; d < this._breadcrumbTrail.length; d++) {
            if (nodeIndex === this._breadcrumbTrail[d].index) {
                this._breadcrumbTrail = this._breadcrumbTrail.splice(0, d+1);
                this.renderBreadcrumbs();
            }
        }

        if (nodeIndex === -1) {
            this.renderNode(this._tree);
            return;
        }

        for (let c = 0; c < this._list.length; c++) {
            if (this._list[c].index === nodeIndex) {
                this.renderNode(this._list[c]);
                return;
            }
        }
    }

    onExpandClick(e) {
        let nodeIndex = e.target.dataset.index;
        for (let c = 0; c < this._list.length; c++) {
            if (this._list[c].index == nodeIndex) {
                this.renderNode(this._list[c]);
                this.addBreadcrumb(this._list[c]);
            }
        }
    }

    disconnectedCallback() {}
    attributeChangedCallback(attributeName, oldValue, newValue, namespace) {}
    adoptedCallback(oldDocument, newDocument) {}
}

customElements.define('aviz-nodes-list', AnimationNodes);

