import * as THREE from '../../build/three.module.js';
import Stats from '../../build/jsm/libs/stats.module.js';
import { GUI } from '../../build/jsm/libs/dat.gui.module.js';
import { TrackballControls } from '../../build/jsm/controls/TrackballControls.js';
import {
  initRenderer,
  onWindowResize,
} from "../../libs/util/util.js";


const scene = new THREE.Scene();    // Create main scene
const stats = new Stats();          // To show FPS information

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 800);  //initCamera(new THREE.Vector3(0, 2, 0)); // Init camera in this position;
camera.position.set(30, 120, 200);
camera.lookAt(0, 60, 0);

const renderer = initRenderer();    // View function in util/utils
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const trackballControls = new TrackballControls(camera, renderer.domElement);

const light = new THREE.SpotLight(0xefefef);
light.position.set(100, 200, 220);
light.castShadow = true;
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x3e3e3e);
scene.add(ambientLight);

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(250, 250),
  new THREE.MeshLambertMaterial({ color: 0x55AB24, side: THREE.DoubleSide })
);
plane.rotation.x = -Math.PI * 0.5;
plane.receiveShadow = true;
scene.add(plane);

const reciprocalPoints = [];
for (let i = 0.5; i < 2; i += 0.1) {
  reciprocalPoints.push(new THREE.Vector2(7.5 * i, 7.5 / i));
}
const baseGeo = new THREE.LatheGeometry(reciprocalPoints, 16);
const baseMat = new THREE.MeshPhongMaterial({ color: 0x0F1338, side: THREE.BackSide });
const base = new THREE.Mesh(baseGeo, baseMat);
base.position.set(0, -4, 0);
base.castShadow = true;
scene.add(base);

const towerGeo = new THREE.CylinderGeometry(2, 4, 50, 16);
const towerMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
const tower = new THREE.Mesh(towerGeo, towerMat);
tower.position.set(0, 31, 0);
tower.castShadow = true;
scene.add(tower);

const gearBoxGeo = new THREE.CylinderGeometry(4.25, 6, 15, 4);
const gearBoxMat = new THREE.MeshPhongMaterial({ color: 0x1F2878 });
const gearBox = new THREE.Mesh(gearBoxGeo, gearBoxMat);
gearBox.rotation.set(Math.PI / 2, Math.PI / 4, 0);
gearBox.position.set(0, 60, 0);
gearBox.castShadow = true;
scene.add(gearBox)

const rotor = createRotor();
rotor.position.set(0, 60, 16);
rotor.traverse((e) => {
  e.castShadow = true;
})
scene.add(rotor);

function createRotor() {
  const rotor = new THREE.Object3D();

  const blade1 = createBlade();
  blade1.position.set(4, 1.5, -4);
  blade1.rotation.set(0, 0, Math.PI / 6);
  rotor.add(blade1);

  const blade2 = createBlade();
  blade2.position.set(-4, 1.5, -4);
  blade2.rotation.set(0.2, 0, 5 * Math.PI / 6); // pi - pi / 6 = 5
  rotor.add(blade2);

  const blade3 = createBlade();
  blade3.position.set(0, -4, -4);
  blade3.rotation.set(0, Math.PI, 3 * Math.PI / 2); // pi - pi / 6 = 5
  rotor.add(blade3);

  const parabolicPoints = [];
  for (let i = 0; i < 10; i++) {
    parabolicPoints.push(new THREE.Vector2(1.2 * i, i * i * 0.4));
  }
  const noseGeo = new THREE.LatheGeometry(parabolicPoints);
  const noseMat = new THREE.MeshPhongMaterial({ color: 0xAB880A });
  const nose = new THREE.Mesh(noseGeo, noseMat);
  nose.scale.set(0.27, 0.27, 0.27);
  nose.rotation.set(-Math.PI / 2, 0, 0);
  nose.position.set(0, 0, 0)
  rotor.add(nose);

  return rotor;
}

function createBlade() {
  const obj = new THREE.Object3D();

  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(0, 0);
  bladeShape.bezierCurveTo(0, 10, 8, 7, 17, 17);
  bladeShape.bezierCurveTo(7, 0, 7, 2, 0, 0);

  const extrudeSettings = {
    steps: 1,
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.3,
    bevelSize: 1,
    bevelOffset: 0,
    bevelSegments: 2
  };

  const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
  const bladeMat = new THREE.MeshPhongMaterial({ color: 0xAB880A });
  const blade = new THREE.Mesh(bladeGeo, bladeMat);
  blade.rotation.z = -Math.PI / 4;
  blade.rotation.y = Math.PI / 18;
  obj.add(blade);

  const cylinderGeo = new THREE.CylinderGeometry(1, 1, 3, 16);
  const cylinderMaterial = new THREE.MeshPhongMaterial();
  const arm = new THREE.Mesh(cylinderGeo, cylinderMaterial);
  arm.position.set(-1.5, 0, 0.15);
  arm.rotation.z = Math.PI / 2;
  obj.add(arm);

  return obj;
}

let isAnimationOn = true;
const controls = new function () {
  this.velocity = 1.5;

  this.toggleAnimation = function () {
    isAnimationOn = !isAnimationOn;
  }
};


const clock = new THREE.Clock();

function rotate() {
  rotor.rotation.z += Math.PI * controls.velocity * clock.getDelta();
}

// GUI interface
const gui = new GUI();
gui.add(controls, 'toggleAnimation', true)
  .name("Toggle Animation");
gui.add(controls, 'velocity', 0.25, 3, 0.25)
  .name("Velocity");

window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

render();

function render() {
  stats.update(); // Update FPS
  trackballControls.update();
  if (isAnimationOn) {
    rotate();
  }
  requestAnimationFrame(render); // Show events
  renderer.render(scene, camera) // Render scene
}
