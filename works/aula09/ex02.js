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
scene.add(camera);

const renderer = initRenderer();    // View function in util/utils
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const trackballControls = new TrackballControls(camera, renderer.domElement);

const light = new THREE.SpotLight(0xefefef);
light.position.set(100, 200, 220);
light.castShadow = true;
camera.add(light);

const ambientLight = new THREE.AmbientLight(0x3e3e3e);
scene.add(ambientLight);

const cube = new THREE.Object3D();
scene.add(cube);

const loader = new THREE.TextureLoader();

const woodTexture = loader.load('../../assets/textures/wood.png');
const woodTopTexture = loader.load('../../assets/textures/woodtop.png')

const cepoGeo = new THREE.CylinderBufferGeometry(1, 1, 3, 16, 1, true);
const cepoMat = new THREE.MeshPhongMaterial({ map: woodTexture });
const cepoDeMadeira = new THREE.Mesh(cepoGeo, cepoMat);
scene.add(cepoDeMadeira);

const tampa1 = pegarTampa();
tampa1.rotation.x = -Math.PI * 0.5;
tampa1.position.y = 1.5;
scene.add(tampa1);

const tampa2 = pegarTampa();
tampa2.rotation.x = Math.PI * 0.5;
tampa2.position.y = -1.5;
scene.add(tampa2);


function pegarTampa() {
  const tampaGeo = new THREE.CircleBufferGeometry(1, 16);
  const tampaMat = new THREE.MeshPhongMaterial({ map: woodTopTexture });

  return new THREE.Mesh(tampaGeo, tampaMat);
}

window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

render();

function render() {
  stats.update(); // Update FPS
  trackballControls.update();
  requestAnimationFrame(render); // Show events
  renderer.render(scene, camera) // Render scene
}
