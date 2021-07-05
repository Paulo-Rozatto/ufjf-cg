import * as THREE from '../../build/three.module.js';

export class CustomCurve extends THREE.Curve {

    constructor(scale = 1) {

        super();

        this.scale = scale;
        this.ty = 0;
        this.tx = 0;

    }

    getPoint(t, optionalTarget = new THREE.Vector3()) {

        let tx, ty;

        if (t <= 0.3) {
            tx = 0;
            ty = t;
            this.ty = t
        }
        else if (t <= 0.7) {
            tx = t - this.ty;
            ty = this.ty;
            this.tx = tx;
        }
        else if (t <= 1) {
            tx = this.tx;
            ty = 1 - t;
        }

        return optionalTarget.set(1.5 * tx - 0.3, 1 / this.scale, ty - 0.15).multiplyScalar(this.scale);
    }

}