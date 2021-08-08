import * as THREE from '../../build/three.module.js';
import Stats from '../../build/jsm/libs/stats.module.js';
import { TrackballControls } from '../../build/jsm/controls/TrackballControls.js';
import {
  initRenderer,
  onWindowResize,
} from "../../libs/util/util.js";


const scene = new THREE.Scene();    // Create main scene
const stats = new Stats();          // To show FPS information

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 800);  //initCamera(new THREE.Vector3(0, 2, 0)); // Init camera in this position;
camera.position.set(-2, 0, 5);
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

const cube = new THREE.Object3D();
scene.add(cube);

const loader = new THREE.TextureLoader();

const textures = [
  null,
  loader.load('textures/t01.png'),
  loader.load('textures/t02.png'),
  loader.load('textures/t01.png'),
  loader.load('textures/t04.png'),
  loader.load('textures/t05.png'),
];

const deg90 = Math.PI / 2;

let face1 = createFace(new THREE.Vector3(0, 0, 0.95), new THREE.Vector3());
face1.material.transparent = true;
face1.material.opacity = 0.5;
cube.add(face1);

for (let i = 1; i < 6; i++) {
  let pos = new THREE.Vector3();
  let rot = new THREE.Vector3();

  if (i < 4) {
    pos.set(0, Math.sin(deg90 * i), Math.cos(deg90 * i))

    if (i % 2 !== 0) {
      rot.set(deg90, 0, 0);
    }
  }
  else {
    pos.set(Math.cos(2 * deg90 * i), 0, 0);
    rot.set(0, deg90, 0);
  }

  let face = createFace(pos, rot, textures[i]);

  cube.add(face);
}


function createFace(pos, rot, map) {
  const faceGeo = new THREE.PlaneBufferGeometry(2, 2);
  const faceMat = new THREE.MeshPhongMaterial({ map, side: THREE.DoubleSide })
  const face = new THREE.Mesh(faceGeo, faceMat);

  face.position.copy(pos);
  face.rotation.setFromVector3(rot);

  return face;
}


window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

render();

function render() {
  stats.update(); // Update FPS
  trackballControls.update();
  requestAnimationFrame(render); // Show events
  renderer.render(scene, camera) // Render scene
}
