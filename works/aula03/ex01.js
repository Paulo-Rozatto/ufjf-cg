import * as THREE from '../../build/three.module.js';
import Stats from '../../build/jsm/libs/stats.module.js';
import {
  initRenderer,
  onWindowResize,
} from "../../libs/util/util.js";


const scene = new THREE.Scene();    // Create main scene
const stats = new Stats();          // To show FPS information

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);  //initCamera(new THREE.Vector3(0, 2, 0)); // Init camera in this position;
camera.position.set(0, 2, 0);
camera.lookAt(0, 2, 1);

const renderer = initRenderer();    // View function in util/utils

scene.add(new THREE.HemisphereLight());

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 80),
  new THREE.MeshBasicMaterial({ color: 0xcc00dd, wireframe: false })
);
plane.position.y = -0.1;
plane.rotation.x = -Math.PI * 0.5;
scene.add(plane);

const wirePlane = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 80, 20, 20),
  new THREE.MeshBasicMaterial({ wireframe: true })
);
wirePlane.position.y = -0.09;
wirePlane.rotation.x = -Math.PI * 0.5;
scene.add(wirePlane);

const axesHelper = new THREE.AxesHelper(40);
scene.add(axesHelper);

const cameraHolder = new THREE.Group();
cameraHolder.add(camera);
scene.add(cameraHolder);

const velocity = 0.4;
const rotVelocity = 0.025;
let rx = 0, ry = 0, rz = 0; // rotation vars
let tz = 0; // translation vars

function keyDownHandler(event) {
  console.log(event.key);
  switch (event.key) {
    case 'ArrowLeft':
      ry = 1;
      break;
    case 'ArrowRight':
      ry = -1;
      break;
    case 'ArrowUp':
      rx = 1;
      break;
    case 'ArrowDown':
      rx = -1;
      break;
    case '.':
      rz = 1;
      break;
    case ',':
      rz = -1;
      break;
    case ' ':
      tz = 1;
  }
}

function keyUpHandler(event) {
  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowRight':
      console.log('p')
      ry = 0;
      break;
    case 'ArrowUp':
    case 'ArrowDown':
      rx = 0;
      break;
    case ',':
    case '.':
      rz = 0;
      break;
    case ' ':
      tz = 0;
  }
}

function updateCamera() {
  cameraHolder.rotateY(ry * rotVelocity);
  cameraHolder.rotateX(rx * rotVelocity);
  cameraHolder.rotateZ(rz * rotVelocity);
  cameraHolder.translateZ(tz * velocity);
}

window.addEventListener('keydown', keyDownHandler);
window.addEventListener('keyup', keyUpHandler);
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

render();

function render() {
  stats.update(); // Update FPS
  updateCamera();
  // plane.rotation.x += 0.5;
  requestAnimationFrame(render); // Show events
  renderer.render(scene, camera) // Render scene
}
