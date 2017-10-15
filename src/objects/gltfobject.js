import BaseGroup from '../../node_modules/macgyvr/src/basegroup.js';

export default class GLTFObject extends BaseGroup {
    /**
     * on create scene
     * @param scene
     * @param sceneinfo
     */
    onCreate(scene, sceneinfo) {
        this._duration = 0;
        this._currentTime = 0;
        BABYLON.SceneLoader.ShowLoadingScreen = false;
        this.filesInput = new BABYLON.FilesInput(this.engine, this.scene, this.canvas, (scenefile, scene) => this.onSceneLoaded(scenefile, scene));
    }

    load(value) {
        if (typeof value === 'string') {
            let uri = value;
            let filename = uri.split('/')[uri.split(uri).length];
            let basepath = uri.substr(0, uri.indexOf(filename));
            let loader = new BABYLON.AssetsManager(this.scene);
            loader.useDefaultLoadingScreen = false;
            let task = loader.addMeshTask('task', '', basepath, filename);
            task.onSuccess = asset => this.onMeshesLoaded(asset);
            loader.load();
        } else {
            let event = value;
            this.filesInput.loadFiles(event);
        }
    }

    onMeshesLoaded(asset) {
        this.add(asset.loadedMeshes);
        this.group.rotation.x = Math.PI/2;
        this.prepareScene(this.scene);
    }

    onSceneLoaded(scenefile, scene) {
        this.application.replaceAllScenes(scene);
        this.prepareScene(scene);
    }

    prepareScene(scene) {
        // remove camera from scene to add our own
        if (scene.activeCamera) {
            scene.activeCamera.dispose();
            scene.activeCamera = null;
        }

        scene.createDefaultCameraOrLight(true);
        scene.activeCamera.attachControl(this.canvas);

        if (scene.lights.length === 0) {
            this.application.addLights();
        }

        // pause all to start - if synchronous, the scene doesn't seem to show up
        setTimeout( function() {
            for (let c = 0; c < scene.Animatables.length; c++) {
                scene.Animatables[c].goToFrame(0);
                scene.Animatables[c].pause();
            }
        }, 50);

        let worldExtends = scene.getWorldExtends();
        let sceneMidPoint = new BABYLON.Vector3((worldExtends.max.x + worldExtends.min.x)/2, worldExtends.max.y, (worldExtends.max.z + worldExtends.min.z)/2);
        scene.activeCamera.setTarget( sceneMidPoint );
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

    onRender(deltatime) {}
}
