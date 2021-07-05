import * as THREE from '../../build/three.module.js';
import Stats from '../../build/jsm/libs/stats.module.js';
import { GUI } from '../../build/jsm/libs/dat.gui.module.js';
import { TrackballControls } from '../../build/jsm/controls/TrackballControls.js';
import KeyboardState from '../../libs/util/KeyboardState.js';
import { TeapotGeometry } from '../../build/jsm/geometries/TeapotGeometry.js';
import { CustomCurve } from './CustomCurve.js';
import {
  initRenderer,
  InfoBox,
  SecondaryBox,
  createGroundPlane,
  onWindowResize,
  degreesToRadians,
  createLightSphere
} from "../../libs/util/util.js";

const scene = new THREE.Scene();    // Create main scene
const stats = new Stats();          // To show FPS information

const renderer = initRenderer();    // View function in util/utils
renderer.setClearColor("rgb(30, 30, 42)");
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.lookAt(0, 0, 0);
camera.position.set(2.18, 1.62, 3.31);
camera.up.set(0, 1, 0);
const objShininess = 200;

// To use the keyboard
const keyboard = new KeyboardState();

// Enable mouse rotation, pan, zoom etc.
const trackballControls = new TrackballControls(camera, renderer.domElement);

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

const groundPlane = createGroundPlane(5.0, 2.5, 50, 50); // width and height
groundPlane.rotateX(degreesToRadians(-90));
scene.add(groundPlane);

// Show axes (parameter is size of each axis)
const axesHelper = new THREE.AxesHelper(1.5);
axesHelper.visible = false;
scene.add(axesHelper);

// Show text information onscreen
showInformation();

const infoBox = new SecondaryBox("");

// Teapot
const geometry = new TeapotGeometry(0.5);
const material = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: "200" });
material.side = THREE.DoubleSide;
const obj = new THREE.Mesh(geometry, material);
obj.castShadow = true;
obj.position.set(0.0, 0.5, 0.0);
scene.add(obj);

//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
// Control available light and set the active light
let lightIntensity = 1.0;
let animate = false;

const redPath = new CustomCurve(8);
redPath.getPoints(50);

const greenPath = new CustomCurve(8);
greenPath.getPoints(50);

const bluePath = new CustomCurve(8);
bluePath.getPoints(50);

//---------------------------------------------------------
// Create and set all lights
let tRed = 0.7;
const redPosition = new THREE.Vector3();
redPosition.copy(redPath.getPoint(tRed));
const redLight = createSpotLight(redPosition, 0xff0000, 'Red Light');
const redSphere = createLightSphere(scene, 0.05, 10, 10, redPosition);
redSphere.material.color.setRGB(255, 0, 0);

let tGreen = 0.7
const greenPosition = new THREE.Vector3();
greenPosition.copy(greenPath.getPoint(tGreen));
const greenLight = createSpotLight(greenPosition, 0x00ff00, 'Green Light');
const greenSphere = createLightSphere(scene, 0.05, 10, 10, greenPosition);
greenSphere.material.color.setRGB(0, 255, 0);

let tBlue = 0.7;
const bluePosition = bluePath.getPoint(tBlue)
const blueLight = createSpotLight(bluePosition, 0x0000ff, 'Blue Light');
const blueSphere = createLightSphere(scene, 0.05, 10, 10, bluePosition);
blueSphere.material.color.setRGB(0, 0, 255);


// More info here: https://threejs.org/docs/#api/en/lights/AmbientLight
const ambientLight = new THREE.AmbientLight(0x323232);
scene.add(ambientLight);

buildInterface();
render();

// Set Spotlight
// More info here: https://threejs.org/docs/#api/en/lights/SpotLight
function createSpotLight(position, color, name) {
  const spotLight = new THREE.SpotLight(color);

  spotLight.position.copy(position);
  spotLight.shadow.mapSize.width = 512;
  spotLight.shadow.mapSize.height = 512;
  spotLight.angle = degreesToRadians(40);
  spotLight.castShadow = true;
  spotLight.decay = 2;
  spotLight.penumbra = 0.5;
  spotLight.name = name;

  scene.add(spotLight);
  return spotLight;
}

const points = new CustomCurve(8).getPoints(50);
const mat = new THREE.LineBasicMaterial({ color: 0xf0f0ff, linewidth: 5 });
const geo = new THREE.BufferGeometry().setFromPoints(points);
const line = new THREE.Line(geo, mat);
scene.add(line);

// Update light position of the current light
function updateLightPosition(light, sphere, position) {
  light.position.copy(position);
  sphere.position.copy(position);
  infoBox.changeMessage(light.name + " Position: " + position.x.toFixed(2) + ", " +
    position.y.toFixed(2) + ", " + position.z.toFixed(2));
}

// Update light intensity of the current light
function updateLightIntensity(light) {
  light.intensity = lightIntensity;
}

function buildInterface() {
  //------------------------------------------------------------
  // Interface
  const controls = new function () {
    this.viewAxes = false;
    this.shininess = objShininess;
    this.ambientLight = true;

    this.lightIntensity = lightIntensity;

    this.redVisible = true;
    this.greenVisible = true;
    this.blueVisible = true;

    this.onViewAxes = function () {
      axesHelper.visible = this.viewAxes;
    };
    this.onEnableAmbientLight = function () {
      ambientLight.visible = this.ambientLight;
    };
    this.onUpdateShininess = function () {
      material.shininess = this.shininess;
    };
    this.onUpdateLightIntensity = function (light) {
      lightIntensity = this.lightIntensity;
      updateLightIntensity(light);
    };

    this.animate = function () {
      animate = !animate;
    }
  };

  const gui = new GUI();
  gui.add(controls, 'viewAxes', false)
    .name("View Axes")
    .onChange(function (e) { controls.onViewAxes() });
  gui.add(controls, 'ambientLight', true)
    .name("Ambient Light")
    .onChange(function (e) { controls.onEnableAmbientLight() });

  const objectFolder = gui.addFolder('Object');
  objectFolder.open();
  objectFolder.add(controls, 'shininess', 0, 1000)
    .name("Obj Shininess")
    .onChange(function (e) { controls.onUpdateShininess() });
  objectFolder.add(controls, 'animate')
    .name("On/Off rotation")

  const redFolder = gui.addFolder('Red Light');
  redFolder.open();
  redFolder.add(controls, 'redVisible', true)
    .name("Visible")
    .onChange(function (e) { redLight.visible = redSphere.visible = controls.redVisible });
  redFolder.add(controls, 'lightIntensity', 0, 5)
    .name("Light Intensity")
    .onChange(function (e) { controls.onUpdateLightIntensity(redLight) });

  const greenFolder = gui.addFolder('Green Light');
  greenFolder.open();
  greenFolder.add(controls, 'greenVisible', true)
    .name("Visible")
    .onChange(function (e) { greenLight.visible = greenSphere.visible = controls.greenVisible });
  greenFolder.add(controls, 'lightIntensity', 0, 5)
    .name("Light Intensity")
    .onChange(function (e) { controls.onUpdateLightIntensity(greenLight) });

  const blueFolder = gui.addFolder('Blue Light');
  blueFolder.open();
  blueFolder.add(controls, 'blueVisible', true)
    .name("Visible")
    .onChange(function (e) { blueLight.visible = blueSphere.visible = controls.blueVisible });
  blueFolder.add(controls, 'lightIntensity', 0, 5)
    .name("Light Intensity")
    .onChange(function (e) { controls.onUpdateLightIntensity(blueLight) });
}

function keyboardUpdate() {
  keyboard.update();
  if (keyboard.pressed("Q")) {
    if (tRed >= 0.01) {
      tRed -= 0.01;
      redPosition.copy(redPath.getPoint(tRed));
      updateLightPosition(redLight, redSphere, redPosition);
    }
  }
  else if (keyboard.pressed("W")) {
    if (tRed <= 0.99) {
      tRed += 0.01
      redPosition.copy(redPath.getPoint(tRed));
      updateLightPosition(redLight, redSphere, redPosition);
    }
  }

  if (keyboard.pressed("A") && tGreen > 0) {
    if (tGreen >= 0.01) {
      tGreen -= 0.01;
      greenPosition.copy(greenPath.getPoint(tGreen));
      updateLightPosition(greenLight, greenSphere, greenPosition);
    }
  }
  else if (keyboard.pressed("S")) {
    if (tGreen <= 0.99) {
      tGreen += 0.01
      greenPosition.copy(greenPath.getPoint(tGreen));
      updateLightPosition(greenLight, greenSphere, greenPosition);
    }
  }

  if (keyboard.pressed("Z") && tBlue > 0) {
    if (tBlue >= 0.01) {
      tBlue -= 0.01;
      bluePosition.copy(bluePath.getPoint(tBlue));
      updateLightPosition(blueLight, blueSphere, bluePosition);
    }
  }
  else if (keyboard.pressed("X")) {
    if (tBlue <= 0.99) {
      tBlue += 0.01
      bluePosition.copy(bluePath.getPoint(tBlue));
      updateLightPosition(blueLight, blueSphere, bluePosition);
    }
  }
}

function showInformation() {
  // Use this to show information onscreen
  const controls = new InfoBox();
  controls.add("Moving the lights: ");
  controls.addParagraph();
  controls.add("Red Light: Q - W");
  controls.addParagraph();
  controls.add("Green Light: A - S");
  controls.addParagraph();
  controls.add("Blue Light: Z - X");
  controls.show();
}

function render() {
  stats.update();
  trackballControls.update();
  keyboardUpdate();
  requestAnimationFrame(render);
  if (animate) {
    obj.rotation.y -= 0.01;
  }
  renderer.render(scene, camera)
}
