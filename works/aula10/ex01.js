import * as THREE from '../../libs/other/three.module.r82.js';
import { RaytracingRenderer } from '../../libs/other/raytracingRenderer.js';
import { degreesToRadians } from "../../libs/util/util.js";

var scene, renderer;

var container = document.createElement('div');
document.body.appendChild(container);

var scene = new THREE.Scene();

// The canvas is in the XY plane.
// Hint: put the camera in the positive side of the Z axis and the
// objects in the negative side
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.z = 3;
camera.position.y = 1;

// light
var intensity = 0.5;
var light = new THREE.PointLight(0xffffff, intensity);
light.position.set(0, 1, 0);
scene.add(light);

var light = new THREE.PointLight(0x55aaff, intensity);
light.position.set(-1.00, 0.66, 2.00);
scene.add(light);

var light = new THREE.PointLight(0xffffff, intensity);
light.position.set(1.00, 0.66, 2.00);
scene.add(light);

renderer = new RaytracingRenderer(window.innerWidth, window.innerHeight, 32, camera);
// renderer = new THREE.WebGLRenderer()
// renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// materials
var baseMaterial = new THREE.MeshLambertMaterial({ color: 0x86c6d9 })

var phongMaterialBox = new THREE.MeshLambertMaterial({
	color: "rgb(255,255,255)",
});

var phongMaterialBoxBottom = new THREE.MeshLambertMaterial({
	color: "rgb(180,180,180)",
});

var phongMaterialBoxLeft = new THREE.MeshLambertMaterial({
	color: "rgb(120,0,230)",
});

var phongMaterialBoxRight = new THREE.MeshLambertMaterial({
	color: "rgb(0,200,0)",
});

var knotMaterial = new THREE.MeshPhongMaterial({
	color: 0xFFD73B,
	specular: 0xffffff,
	shininess: 1000,
});

var cylinderMaterial = new THREE.MeshPhongMaterial({
	color: 0xFF3B3B,
	specular: 0xffffff,
	shininess: 20,
});

var mirrorMaterial = new THREE.MeshPhongMaterial({
	color: "rgb(0,0,0)",
	specular: "rgb(255,255,255)",
	shininess: 1000,
});
mirrorMaterial.mirror = true;
mirrorMaterial.reflectivity = 1;

var mirrorMaterialDark = new THREE.MeshPhongMaterial({
	color: "rgb(0,0,0)",
	specular: "rgb(170,170,170)",
	shininess: 10000,
});
mirrorMaterialDark.mirror = true;
mirrorMaterialDark.reflectivity = 1;

var mirrorMaterialSmooth = new THREE.MeshPhongMaterial({
	color: "rgb(255,170,0)",
	specular: "rgb(34,34,34)",
	shininess: 10000,
});
mirrorMaterialSmooth.mirror = true;
mirrorMaterialSmooth.reflectivity = 0.1;

var glassMaterialSmooth = new THREE.MeshPhongMaterial({
	color: "rgb(0,0,0)",
	specular: "rgb(255,255,255)",
	shininess: 10000,
});
glassMaterialSmooth.glass = true;
glassMaterialSmooth.reflectivity = 0.25;
glassMaterialSmooth.refractionRatio = 1.5;

// geometries
var planeGeometry = new THREE.BoxGeometry(6.00, 0.05, 3.00);
var baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 80);
var torusKnotGeometry = new THREE.TorusKnotGeometry(1, 0.4, 32, 16)
var sphereGeometry = new THREE.SphereGeometry(1, 24, 24);
var cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.25, 0.8, 32)

// base cylinders
var base1 = new THREE.Mesh(baseGeometry, baseMaterial);
base1.position.set(-2.25, 0, -1);
scene.add(base1);

var base2 = new THREE.Mesh(baseGeometry, baseMaterial);
base2.position.set(0, 0, -2);
scene.add(base2);

var base3 = new THREE.Mesh(baseGeometry, baseMaterial);
base3.position.set(2.25, 0, -1);
scene.add(base3);


// torus knot
var knot = new THREE.Mesh(torusKnotGeometry, knotMaterial)
knot.scale.multiplyScalar(0.2);
knot.position.copy(base1.position);
knot.translateY(0.85);
scene.add(knot);

// sphere
var sphere = new THREE.Mesh(sphereGeometry, mirrorMaterialDark);
sphere.scale.multiplyScalar(0.5);
sphere.position.copy(base2.position);
sphere.translateY(1);
scene.add(sphere);

// cylinder
var cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
cylinder.position.copy(base3.position);
cylinder.translateY(0.9);
scene.add(cylinder);

// bottom
var plane = new THREE.Mesh(planeGeometry, phongMaterialBoxBottom);
plane.position.set(0, -.5, -1.5);
scene.add(plane);

// top
var plane = new THREE.Mesh(planeGeometry, phongMaterialBox);
plane.position.set(0, 2.5, -1.5);
scene.add(plane);

// back
var plane = new THREE.Mesh(planeGeometry, phongMaterialBox);
plane.rotation.x = 1.57;
// plane.scale.set(1, 1, 0.5);
plane.position.set(0, 1, -3.00);
scene.add(plane);

// left
var plane = new THREE.Mesh(planeGeometry, phongMaterialBoxLeft);
plane.rotation.set(1.57, 1.57, 0, 'ZYX')
plane.position.set(-3.00, 1, -3.00)
scene.add(plane);

// right
var plane = new THREE.Mesh(planeGeometry, phongMaterialBoxLeft);
plane.rotation.set(1.57, 1.57, 0, 'ZYX')
// plane.scale.set(0.5, 1, 1);
plane.position.set(3.00, 1, -3.00)
scene.add(plane);

render();

function render() {
	renderer.render(scene, camera);
}
