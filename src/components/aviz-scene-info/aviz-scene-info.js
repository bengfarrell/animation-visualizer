import Template from './template.js';

export default class AnimationSceneInfo extends HTMLElement {
    static get observedAttributes() { return ['filename'] }

    constructor() {
        super();
        this._playing = false;
        this.dom = {};
        this.rightHandedCoordinates = false;
    }

    onSwitchCoordinateSystem(event) {
        this.rightHandedCoordinates = !this.rightHandedCoordinates;
        if (this.rightHandedCoordinates) {
            this.dom.coordinatesystem.innerText = 'use left-handed system on load';
        } else {
            this.dom.coordinatesystem.innerText = 'use right-handed system on load';
        }

        let e = new CustomEvent(AnimationSceneInfo.SWITCH_COORDINATE_SYSTEM, { 'detail': { rightHanded: this.rightHandedCoordinates } });
        this.dispatchEvent(e);
    }

    connectedCallback() {
        this.innerHTML = Template.get();
        this.dom.filename = this.querySelector('.filename');
        this.dom.coordinatesystem = this.querySelector('.coordinate-system');
        this.dom.coordinatesystem.addEventListener('click', e => this.onSwitchCoordinateSystem(e));
    }

    disconnectedCallback() {}
    attributeChangedCallback(attributeName, oldValue, newValue, namespace) {
        switch (attributeName) {
            case 'filename':
                this.dom.filename.innerText = newValue;
                break;
        }
    }
    adoptedCallback(oldDocument, newDocument) {}
}

AnimationSceneInfo.SWITCH_COORDINATE_SYSTEM = 'onSwitchCoordinateSystem';

if (!customElements.get('aviz-scene-info')) {
    customElements.define('aviz-scene-info', AnimationSceneInfo);
}

