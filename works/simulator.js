import * as THREE from '../build/three.module.js';
import { TrackballControls } from '../build/jsm/controls/TrackballControls.js';
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';
import {
    initRenderer,
    initCamera,
    onWindowResize,
    initDefaultLighting,
} from "../libs/util/util.js";
const scene = new THREE.Scene();    // Create main scene
const renderer = initRenderer();    // View function in util/utils
renderer.setClearColor(0x87ceeb)
renderer.shadowMap.enabled = true;

let inspectionMode = false;

const movementGroup = new THREE.Group(); // Grupo para manipular aviao e camera ao mesmo tempo
const movementGroupPosition = new THREE.Vector3(0, 10, -350); // Salva posicao do grupo para voltar do modo inspecao
movementGroup.position.copy(movementGroupPosition);
scene.add(movementGroup);

const cameraPosition = new THREE.Vector3(1, 20, -65);
const camera = initCamera(cameraPosition); // Init camera in this position
camera.lookAt(movementGroup);
movementGroup.add(camera);

const trackballControls = new TrackballControls(camera, renderer.domElement);
trackballControls.enabled = false;

const airplane = buildAirplane();
const airPlaneRotation = new THREE.Euler(); // Salva rotacao do aviao por causa do modo inspecao
airplane.scale.set(0.7, 0.7, 0.7);
movementGroup.add(airplane);

const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(400, 300, -600);
light.castShadow = true;
scene.add(light);

light.shadow.camera.near = 600;
light.shadow.camera.far = 1200;
light.shadow.camera.left = -100;
light.shadow.camera.right = 100
light.shadow.camera.top = 200;

light.target.updateMatrixWorld();
light.shadow.camera.updateProjectionMatrix();

const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
scene.add(cameraHelper);

const helper = new THREE.DirectionalLightHelper(light, 5);
scene.add(helper);

const hemisphereLight = new THREE.HemisphereLight(0xa7ceeb, 0x234423, 1.5);
scene.add(hemisphereLight);

const loader = new GLTFLoader();

function onProgress(xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}

function onError() {
    console.error('An error happened', error);
}

//----- Load terrain source -----

let terrain;

loader.load('assets/terrain2.glb', terrainOnLoad, onProgress, onError)

function terrainOnLoad(gltf) {
    let color;
    terrain = gltf.scene;


    terrain.traverse((child) => {
        if (child.isMesh) {
            color = child.material.color;
            child.material = new THREE.MeshLambertMaterial({ color });

            if (/Plane*/.test(child.name)) {
                child.receiveShadow = true;
            }
            child.castShadow = true;
        }
    });

    scene.add(terrain);


    window.setTimeout(
        () => { loader.load('assets/tree1.glb', treeOnLoad, onProgress, onError); },
        500
    )
}

let tree1;
function treeOnLoad(gltf) {
    tree1 = gltf.scene;

    let color;
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            color = child.material.color;
            child.material = new THREE.MeshLambertMaterial({ color });
            child.castShadow = true;
        }
    });

    scene.add(tree1);
    spreadTrees(tree1);
}

function spreadTrees(tree) {
    const near = 0;
    const far = 50;
    const origin = new THREE.Vector3(0, 20, -200);
    const direction = new THREE.Vector3(0, -1, 0);
    const newPosition = new THREE.Vector3();
    const raycaster = new THREE.Raycaster(origin, direction, near, far);

    let treeClone, treeCount = 0, t = 0;
    let intersection;

    let offset = 25;


    intersection = raycaster.intersectObject(terrain, true)


    while (treeCount < 120) {
        newPosition.set(
            Math.sin(t) * 625,
            0,
            -470 + t + offset,
        );
        offset *= -1;

        raycaster.set(newPosition, direction);

        intersection = raycaster.intersectObject(terrain, true)[0];
        console.log(intersection);

        if (intersection) {
            newPosition.y = intersection.distance * -1;

            treeClone = tree.clone();
            treeClone.position.copy(newPosition);
            treeCount += 1;

            scene.add(treeClone);
        }
        t += 7;

    }
}

function toggleInspectionMode() {
    inspectionMode = !inspectionMode;

    if (inspectionMode) {
        terrain.visible = false;
        movementGroupPosition.copy(movementGroup.position);
        movementGroup.position.set(0, 0, 0)
        airPlaneRotation.copy(airplane.rotation);
        airplane.rotation.set(0, 0, 0);
        trackballControls.enabled = true;
    }
    else {
        trackballControls.enabled = false;
        terrain.visible = true;
        movementGroup.position.copy(movementGroupPosition);
        airplane.rotation.copy(airPlaneRotation);
        camera.position.copy(new THREE.Vector3(1, 20, -65))
        camera.up.set(0, 1, 0);
        camera.lookAt(movementGroupPosition);
    }
}

const MAX_SPEED = 2; // velocidade escalar maxima
const SCALAR_ACCELERATION = 0.025; //  aceleração escalar
let speed = 0.5; // velocidade escalar
let linearVel = new THREE.Vector3(0, 0, 0); // vetor velocidade linear
let angularVel = new THREE.Vector3(); // vetor velocidade angular


function onKeyDown(event) {
    switch (event.key) {
        case ' ': {
            toggleInspectionMode();
            break;
        };
        case 'q': {
            if (speed <= MAX_SPEED - SCALAR_ACCELERATION) {
                speed += SCALAR_ACCELERATION;
            }
            break;
        };
        case 'a': {
            if (speed >= SCALAR_ACCELERATION) {
                speed -= SCALAR_ACCELERATION;
            }
            break;
        };
        case 'ArrowLeft': {
            angularVel.z = -SCALAR_ACCELERATION;
            break;
        };
        case 'ArrowRight': {
            angularVel.z = SCALAR_ACCELERATION;
            break;
        };
        case 'ArrowUp': {
            angularVel.x = SCALAR_ACCELERATION;
            break;
        };
        case 'ArrowDown': {
            angularVel.x = -SCALAR_ACCELERATION;
            break;
        };
    }
}

function onKeyUp(event) {
    switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowRight': {
            angularVel.z = 0;
            break;
        };
        case 'ArrowUp':
        case 'ArrowDown': {
            angularVel.x = 0;
            break;
        };
    }
}

function updatePosition() {
    // rotacao += velocidade angular - contrapeso
    // o contrapeso multiplicado pelo seno faz o comportamento de limitar a rotacao e volta-la ao inicial
    airplane.rotation.z += angularVel.z - 0.025 * Math.sin(airplane.rotation.z);
    airplane.rotation.x += angularVel.x - 0.025 * Math.sin(airplane.rotation.x);

    movementGroup.rotation.y += speed * -Math.sin(airplane.rotation.z) * 0.015;

    linearVel.x = speed * Math.cos(airplane.rotation.x) * Math.sin(movementGroup.rotation.y);
    linearVel.y = speed * -Math.sin(airplane.rotation.x);
    linearVel.z = speed * Math.cos(airplane.rotation.x) * Math.cos(movementGroup.rotation.y);

    movementGroup.position.add(linearVel);
}

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);
window.addEventListener('keydown', onKeyDown, false);
window.addEventListener('keyup', onKeyUp, false);

render();
function render() {
    if (inspectionMode) {
        trackballControls.update(); // Enable mouse movements
    } else {
        updatePosition();
    }
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
}

function buildAirplane() {
    const airplane = new THREE.Object3D();

    const deg90 = Math.PI / 2;

    const material = new THREE.MeshPhongMaterial({ color: 0xAB9833 })
    const windowMaterial = new THREE.MeshPhongMaterial({ color: 0x23232F })

    const nose = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 1, 32),
        material
    );
    nose.rotation.set(deg90, 0, 0);
    nose.scale.set(1, 1, 1.3);
    nose.position.set(0, 0, 6.5);
    airplane.add(nose);

    const frontFuselage = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 1.5, 4, 32),
        material
    );
    frontFuselage.rotation.set(deg90, 0, 0);
    frontFuselage.scale.set(1, 1, 1.3);
    frontFuselage.position.set(0, 0, 4);
    airplane.add(frontFuselage);

    const cockpitWindow = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 1.5, 3, 32, 1, true, deg90 / 2, 3 * deg90),
        windowMaterial
    );
    cockpitWindow.rotation.set(deg90, 0, 0);
    cockpitWindow.scale.set(1, 1.2, 1.5);
    cockpitWindow.position.set(0, 0.25, 3.8);
    airplane.add(cockpitWindow);

    const cockpit = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.5, 3, 32),
        material
    );
    cockpit.rotation.set(deg90, 0, 0);
    cockpit.scale.set(1, 1, 1.5);
    cockpit.position.set(0, 0.3, 0.5);
    airplane.add(cockpit);

    const backFuselage = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 0.75, 8, 32),
        material
    );
    backFuselage.rotation.set(deg90, 0, 0);
    backFuselage.scale.set(1, 1, 1.5);
    backFuselage.position.set(0, 0.3, -5);
    airplane.add(backFuselage);

    const tail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.55, 1, 32),
        material
    );
    tail.rotation.set(deg90, 0, 0);
    tail.scale.set(1, 1, 1.5);
    tail.position.set(0, 0.30, -9.5);
    airplane.add(tail);

    const wingLeft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.125, 8, 4),
        material
    );
    wingLeft.rotation.set(0, 0, deg90);
    wingLeft.scale.set(1, 1, 8);
    wingLeft.position.set(5.45, 0, 0);
    airplane.add(wingLeft);

    const wingRight = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.125, 8, 4),
        material
    );
    wingRight.rotation.set(0, 0, -deg90);
    wingRight.scale.set(1, 1, 8);
    wingRight.position.set(-5.45, 0, 0);
    airplane.add(wingRight);

    const stabilizerRight = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.125, 4, 4),
        material
    );
    stabilizerRight.rotation.set(0, 0, -deg90);
    stabilizerRight.scale.set(1, 1, 4);
    stabilizerRight.position.set(-2.5, 0, -8);
    airplane.add(stabilizerRight);

    const stabilizerLeft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.125, 4, 4),
        material
    );
    stabilizerLeft.rotation.set(0, 0, deg90);
    stabilizerLeft.scale.set(1, 1, 4);
    stabilizerLeft.position.set(2.5, 0, -8);
    airplane.add(stabilizerLeft);

    const stabilizerVertical = new THREE.Mesh(
        new THREE.CylinderGeometry(0.125, 0.25, 4, 4),
        material
    );
    stabilizerVertical.rotation.set(-deg90 / 10, 0, 0);
    stabilizerVertical.scale.set(1, 1, 4);
    stabilizerVertical.position.set(0, 3, -8.5);
    airplane.add(stabilizerVertical);

    scene.add(airplane);
    return airplane;
}