import * as THREE from '../../build/three.module.js';
import Stats from '../../build/jsm/libs/stats.module.js';
import { GUI } from '../../build/jsm/libs/dat.gui.module.js';
import { TrackballControls } from '../../build/jsm/controls/TrackballControls.js';
import {
    initRenderer,
    initCamera,
    initDefaultLighting,
    lightFollowingCamera,
    onWindowResize
} from "../../libs/util/util.js";

const stats = new Stats();          // To show FPS information
const scene = new THREE.Scene();    // Create main scene
const renderer = initRenderer();    // View function in util/utils
const camera = initCamera(new THREE.Vector3(25, 10, 7)); // Init camera in this position
const light = initDefaultLighting(scene, new THREE.Vector3(0, 0, 15));
const trackballControls = new TrackballControls(camera, renderer.domElement);

let vx, vz, vy, elapsedTime = 0, totalTime;
let p = new THREE.Vector3();
let isToMove = false;

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(25, 25),
    new THREE.MeshLambertMaterial({ color: 0x8787F7, side: THREE.DoubleSide })
);
ground.rotation.x = Math.PI * -0.5;
scene.add(ground);

const groundWireFrame = new THREE.Mesh(
    new THREE.PlaneGeometry(25, 25, 10, 10),
    new THREE.MeshLambertMaterial({ color: 0xD7D7F7, side: THREE.DoubleSide, wireframe: true })
);
groundWireFrame.rotation.x = Math.PI * -0.5;
groundWireFrame.position.y = 0.01;
scene.add(groundWireFrame);

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 16, 16),
    new THREE.MeshPhongMaterial({ color: 0xff5555, wireframe: false })
)
sphere.position.y = 1;
scene.add(sphere);

const sphereWireframe = new THREE.Mesh(
    new THREE.SphereGeometry(1.01, 16, 16),
    new THREE.MeshLambertMaterial({ color: 0xbb1111, wireframe: true, })
)
sphere.add(sphereWireframe);

const circle = new THREE.Mesh(
    new THREE.CircleGeometry(1, 16),
    new THREE.MeshBasicMaterial({ color: 0x994444, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
);
circle.rotation.x = Math.PI * -0.5;
circle.position.y = 0.02
scene.add(circle);

const clock = new THREE.Clock();

function updateCircle() {
    circle.position.set(controls.x, controls.y + 0.02, controls.z);
}

function moveSphere(delta) {
    elapsedTime += delta;
    sphere.matrixAutoUpdate = false;

    if (elapsedTime < totalTime) {
        let mat4 = new THREE.Matrix4();
        sphere.matrix.identity();  // reset matrix

        sphere.matrix.multiply(mat4.makeTranslation(
            p.x + vx * elapsedTime,
            p.y + vy * elapsedTime - 5 * (elapsedTime * elapsedTime),
            p.z + vz * elapsedTime
        )); // T1
        sphere.matrix.multiply(mat4.makeRotationZ(-vx * elapsedTime));
        sphere.matrix.multiply(mat4.makeRotationX(vz * elapsedTime));

        // sphere.translateX(vx * delta);
        // sphere.translateZ(vz * delta);
        // sphere.position.y = py + vy * elapsedTime - 5 * (elapsedTime * elapsedTime);
    }
    else {
        isToMove = false;
    }
}

const controls = new function () {
    this.startAnimation = function () {
        if (!isToMove) {
            sphere.getWorldPosition(p);

            vy = (controls.y - p.y + 1 + 5 * (controls.time * controls.time)) / controls.time;
            vx = (controls.x - p.x) / controls.time;
            vz = (controls.z - p.z) / controls.time;

            elapsedTime = 0;
            totalTime = controls.time;
            isToMove = true;
        }
    }
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.time = 2;
};

// GUI interface
const gui = new GUI();
gui.add(controls, 'x', -11.5, 11.5);
gui.add(controls, 'y', 0, 5);
gui.add(controls, 'z', -11.5, 11.5);
gui.add(controls, 'time', 0.5, 5, 0.5).name('Animation duration');
gui.add(controls, 'startAnimation').name('Start animation')

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

let delta;
render();
function render() {
    delta = clock.getDelta()
    stats.update(); // Update FPS
    trackballControls.update();
    if (isToMove) {
        moveSphere(delta);
    }
    else {
        updateCircle();
    }
    lightFollowingCamera(light, camera);
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
}