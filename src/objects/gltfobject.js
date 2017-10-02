import BaseGroup from '../../node_modules/macgyvr/src/basegroup.js';

export default class GLTFObject extends BaseGroup {
    /**
     * on create scene
     * @param scene
     */
    onCreate(scene) {
        this._duration = 0;
        this._currentTime = 0;
        let loader = new BABYLON.AssetsManager(scene);
        loader.useDefaultLoadingScreen = false;
        let task = loader.addMeshTask('task', '', './examples/', 'golfer.gltf');
        task.onSuccess = asset => this.onLoaded(asset);
        loader.load();
    }

    onLoaded(asset) {
        this.add(asset.loadedMeshes);
        this.group.rotation.x = Math.PI/2;

        // pause all to start
        for (let c = 0; c < this.scene.Animatables.length; c++) {
            this.scene.Animatables[c].pause();
        }
    }

    set duration(dur) {
        this._duration = dur;
    }

    get duration() {
        return this._duration;
    }

    set time(t) {
        t = t % this.duration;
        this._currentTime = t;
        for (let c = 0; c < this.scene.Animatables.length; c++) {
            this.scene.Animatables[c].goToFrame(t);
        }
    }

    toggleVisibility(visible, name) {
        let milliseconds = this.scene._animationTime;
        for (let c = 0; c < this.scene.Animatables.length; c++) {
            //let frameRate = this.scene.Animatables[c]._animations[0].framePerSecond;
            if (this.scene.Animatables[c].target.name === name) {
                if (visible) {
                    this.scene.Animatables[c].restart();
                    this.scene.Animatables[c].goToFrame(10)
                } else {
                    this.scene.Animatables[c].pause();
                }
            }
        }
    }

    onRender(deltatime) {
    }
}
