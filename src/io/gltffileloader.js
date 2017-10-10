import GLTFExploder from './gltfexploder.js';
import EventListener from '../../node_modules/macgyvr/src/utils/eventlistener.js';

export default class GLTFFileLoader extends EventListener {
    constructor() {
        super();
        this.bufferDictionary = {};
        this.bufferCount = 0;
    }

    loadLocal(filerefs) {
        for (let c = 0; c < filerefs.length; c++) {
            let filename = filerefs[c].name;
            if (filename.split('.')[filename.split('.').length-1].toLowerCase() === 'bin') {
                let reader = new FileReader();
                this.bufferCount ++;
                reader.onload = e => {
                    this.onBinLoaded(filename, e);
                };
                reader.readAsArrayBuffer(filerefs[c]);
            } else if (filename.split('.')[filename.split('.').length-1].toLowerCase() === 'gltf') {
                let reader = new FileReader();
                reader.onload = e => {
                    this.onGLTFLoaded(filename, e)
                };
                reader.readAsText(filerefs[c]);
            }
        }
    }

    loadRemote(path) {
        this._filename = path.split('/')[path.split(path).length];
        this._basepath = path.substr(0, path.indexOf(this._filename));
        let loader = new XMLHttpRequest();
        loader.open('GET', path, true);
        loader.onload = data => {
            this.gltf = JSON.parse(loader.response);
            this.buffers = this.gltf.buffers;
            for (let c = 0; c < this.buffers.length; c++) {
                this.bufferCount ++;
                let loader = new XMLHttpRequest();
                loader.responseType = 'arraybuffer';
                loader.open('GET', this._basepath + this.buffers[c].uri, true);
                loader.onload = e => {
                    this.onBinLoaded(this.buffers[c].uri, e);
                };
                loader.send();
            }
        };
        loader.send();
    }

    onGLTFLoaded(filename, e) {
        this.gltf = JSON.parse(e.target.result);
        let loaded = this.checkLoadedFiles();
        if (loaded) {
            this.onLoadComplete();
        }
    }

    onBinLoaded(filename, e) {
        if (e.target.result) {
            this.bufferDictionary[filename] = e.target.result;
        } else if (e.target.response) {
            this.bufferDictionary[filename] = e.target.response;
        } else {
            throw new Error(filename + ' cannot be loaded', e.target);
        }
        let loaded = this.checkLoadedFiles();
        if (loaded) {
            this.onLoadComplete();
        }
    }

    onLoadComplete() {
        for (let c = 0; c < this.gltf.buffers.length; c++) {
            this.gltf.buffers[c].data = this.bufferDictionary[this.gltf.buffers[c].uri];
        }

        this.gltf = GLTFExploder.explode(this.gltf);
        this.triggerEvent(GLTFFileLoader.LOADED, { gltf: this.gltf });
    }

    checkLoadedFiles() {
        if (this.gltf && this.bufferCount === Object.keys(this.bufferDictionary).length) {
            return true;
        } else {
            return false;
        }
    }
}

GLTFFileLoader.LOADED = 'onGLTFLoaded';
