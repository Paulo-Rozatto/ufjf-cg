import * as THREE from '../build/three.module.js';
import { TrackballControls } from '../build/jsm/controls/TrackballControls.js';
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';
import {
    initRenderer,
    onWindowResize,
} from "../libs/util/util.js";
const scene = new THREE.Scene();    // Create main scene
const renderer = initRenderer();    // View function in util/utils
renderer.setClearColor(0x87ceeb)
renderer.shadowMap.enabled = true;

// Variaveis de modos de camera
let inspectionMode = false, cockpitMode = false;

const movementGroupPosition = new THREE.Vector3(0, 10, -350); // Salva posicao do grupo para voltar do modo inspecao
const movementGroup = new THREE.Group(); // Grupo para manipular aviao e camera ao mesmo tempo
movementGroup.position.copy(movementGroupPosition);
scene.add(movementGroup);

const cameraHolder = new THREE.Group(); // a função do cameraholder é fazer a camera acompanhar a rotação do avião no modo cockpit sem girar a camera diretamente
const holderPosition = new THREE.Vector3(0, 10, 0);
cameraHolder.position.copy(holderPosition);
movementGroup.add(cameraHolder);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const cameraPosition = new THREE.Vector3(0, 0, -50);
camera.position.copy(cameraPosition);
camera.lookAt(movementGroupPosition);
cameraHolder.add(camera);


const trackballControls = new TrackballControls(camera, renderer.domElement);
trackballControls.enabled = false;

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

const hemisphereLight = new THREE.HemisphereLight(0xa7ceeb, 0x234423, 1.6);
scene.add(hemisphereLight);

//----- Loader and shared loading helper functions -----

const loader = new GLTFLoader();

function onProgress(xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}

function onError(error) {
    console.error('An error happened', error);
}

//----- Load airplane ------

let airplane
let airPlaneRotation = new THREE.Euler(); // Salva rotacao do aviao por causa do modo inspecao

loader.load('assets/airplane.glb', airplaneOnLoad, onProgress, onError);

function airplaneOnLoad(gltf) {
    airplane = gltf.scene;

    // Converte o MeshStandardMaterial para MeshPhongMaterial
    let color, transparent, opacity;
    airplane.traverse((child) => {
        if (child.isMesh) {

            color = child.material.color;
            transparent = child.material.transparent;
            opacity = child.material.opacity;

            if (/cockpit/.test(child.name)) {
                child.material = new THREE.MeshPhongMaterial({ color, transparent, opacity, side: THREE.DoubleSide })
            }
            else
                child.material = new THREE.MeshPhongMaterial({ color, transparent, opacity })
        }
    });

    movementGroup.add(airplane);
}

//----- Load terrain source -----

let terrain;

loader.load('assets/terrain2.glb', terrainOnLoad, onProgress, onError)

function terrainOnLoad(gltf) {
    let color;
    terrain = gltf.scene;

    // Converte o MeshStandardMaterial para MeshLambertMaterial (material de Gouraud)
    terrain.traverse((child) => {
        if (child.isMesh) {
            color = child.material.color;

            child.material = new THREE.MeshLambertMaterial({ color });
            child.castShadow = true;

            if (/Plane*/.test(child.name)) {
                child.receiveShadow = true;
            }
        }
    });
    scene.add(terrain);

    // O carregamento das arvores esta sendo chamado nesse callback porque o terrno precisa estar carregado e adcionado na cena para posicionar
    // as arvores corretamente
    // apesar de scene.add() ser uma função síncrona, o modelo demora um pouco a ser realmente adcionado na cena, entao precisa do timeout para compensar o delay
    window.setTimeout(
        () => { loader.load('assets/tree1.glb', treeOnLoad, onProgress, onError); },
        500
    );
}

let tree1;

function treeOnLoad(gltf) {
    tree1 = gltf.scene;

    // Converte o MeshStandardMaterial para MeshLambertMaterial (material de Gouraud)
    let color;
    tree1.traverse((child) => {
        if (child.isMesh) {
            color = child.material.color;
            child.material = new THREE.MeshLambertMaterial({ color });
            child.castShadow = true;
        }
    });

    spreadTrees(tree1); // cria clones e espalha as arvores
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
        if (cockpitMode) {
            toggleCockpitMode();
        }

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

        camera.up.set(0, 1, 0);
        camera.position.copy(cameraPosition)
        camera.lookAt(movementGroupPosition);
    }
}

function toggleCockpitMode() {
    cockpitMode = !cockpitMode;

    if (cockpitMode) {
        if (inspectionMode) {
            toggleInspectionMode();
        }

        airplane.add(cameraHolder);
        cameraHolder.position.x = -0.25;
        cameraHolder.position.y = 2.5;
        cameraHolder.position.z = -1 * cameraPosition.z + 0.8;
    }
    else {
        movementGroup.add(cameraHolder);

        cameraHolder.position.copy(holderPosition);
        camera.up.set(0, 1, 0);
        camera.position.copy(cameraPosition)
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
        case 'c': {
            toggleCockpitMode();
            break;
        }
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
    // testa se o modelo ja esta carreagado
    if (airplane) {
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