import * as THREE from '../build/three.module.js';
import { TrackballControls } from '../build/jsm/controls/TrackballControls.js';
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from '../build/jsm/exporters/GLTFExporter.js'
import {
    initRenderer,
    InfoBox,
    SecondaryBox,
    initCamera,
    onWindowResize,
} from "../libs/util/util.js";

const scene = new THREE.Scene();    // Create main scene
const renderer = initRenderer();    // View function in util/utils
renderer.setClearColor(0x87ceeb)
renderer.shadowMap.enabled = true;

const infoBox = new SecondaryBox("");

let inspectionMode = false;
let cockpitMode = false;

let start = false;
var torusCount = 0;
var sec = 0;

var clock = new THREE.Clock();
clock.autoStart = false;

const time = clock.elapsedTime;
const delta = clock.getDelta();

const points = [
    new THREE.Vector3(-130, 95, -200),
    new THREE.Vector3(-190, 115, 106),
    new THREE.Vector3(-239, 134, 665),
    new THREE.Vector3(-383, 137, 860),
    new THREE.Vector3(-703, 145, 633),
    new THREE.Vector3(-648, 138, 309),
    new THREE.Vector3(-370, 154, -154),
    new THREE.Vector3(-428, 142, -388),
    new THREE.Vector3(-714, 142, -374),
    new THREE.Vector3(-785, 154, -97),
    new THREE.Vector3(-41, 142, 355),
    new THREE.Vector3(338, 142, 314),
    new THREE.Vector3(376, 154, 103),
    new THREE.Vector3(-26, 85, -201)
]

const pipeSpline = new THREE.CatmullRomCurve3(points);
let mesh, tubeGeometry;

const materialPath = new THREE.MeshLambertMaterial({ color: 0xff00ff });

const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.3, wireframe: true, transparent: true });

function addTube() {

    const extrudePath = pipeSpline;

    tubeGeometry = new THREE.TubeGeometry(extrudePath, 100, 2, 2, false);

    addGeometry(tubeGeometry);

}
function addGeometry(geometry) {

    // 3D shape

    mesh = new THREE.Mesh(geometry, materialPath);
    const wireframe = new THREE.Mesh(geometry, wireframeMaterial);
    mesh.add(wireframe);
    parent.add(mesh);

}
parent = new THREE.Object3D();
scene.add(parent);

addTube();


infoBox.changeMessage("Checkpoints: " + torusCount + "/14");

function detectContact() {

    if (movementGroup.position.x <= ring.position.x + 20 && movementGroup.position.x >= ring.position.x - 20
        && movementGroup.position.y <= ring.position.y + 15 && movementGroup.position.y >= ring.position.y - 15
        && movementGroup.position.z <= ring.position.z + 7 && movementGroup.position.z >= ring.position.z - 7) {

        switch (torusCount) {
            case 0: {
                start = true;
                torusCount = 1;
                clock.autoStart = true;
                ring.position.copy(points[torusCount])
                //posicionando o próximo torus
                nextTorus.position.copy(points[torusCount + 1])
                //posicionando o torus passado
                checkedTorus.position.copy(points[torusCount - 1])
                checkedTorus.visible = true;
                break;
            }
            case 1: {
                torusCount = 2;

                ring.position.copy(points[torusCount])

                nextTorus.position.copy(points[torusCount + 1])
                nextTorus.rotation.set(0, deg90, 0);

                checkedTorus.position.copy(points[torusCount - 1])
                break;
            }
            case 2: {
                torusCount = 3;

                ring.position.copy(points[torusCount])
                ring.rotation.set(0, deg90, 0);

                nextTorus.position.copy(points[torusCount + 1])
                nextTorus.rotation.set(0, deg90 / 3, 0);

                checkedTorus.position.copy(points[torusCount - 1])

                break;
            }
            case 3: {
                torusCount = 4;

                ring.position.copy(points[torusCount])
                ring.rotation.set(0, deg90 / 3, 0);

                nextTorus.position.copy(points[torusCount + 1])
                nextTorus.rotation.set(0, deg90 * 4 / 3, 0);

                checkedTorus.position.copy(points[torusCount - 1])
                checkedTorus.rotation.set(0, deg90, 0);

                break;
            }
            case 4: {
                torusCount = 5;

                ring.position.copy(points[torusCount])
                ring.rotation.set(0, -deg90, 0);
                ring.rotation.set(0, -deg90 / 3, 0);

                nextTorus.position.copy(points[torusCount + 1])
                nextTorus.rotation.set(0, deg90 * 4 / 3, 0);

                checkedTorus.position.copy(points[torusCount - 1])
                checkedTorus.rotation.set(0, deg90 / 3, 0);

                break;
            }
            case 5: {
                torusCount = 6;

                ring.position.copy(points[torusCount])
                ring.rotation.set(0, -deg90 / 3, 0);

                nextTorus.position.copy(points[torusCount + 1])
                nextTorus.rotation.set(0, deg90 / 3, 0);

                checkedTorus.position.copy(points[torusCount - 1])
                checkedTorus.rotation.set(0, -deg90, 0);
                checkedTorus.rotation.set(0, -deg90 / 3, 0);

                break;
            }
            case 6: {
                torusCount = 7;

                ring.position.copy(points[torusCount])
                ring.rotation.set(0, deg90 / 3, 0);

                nextTorus.position.copy(points[torusCount + 1])
                nextTorus.rotation.set(0, -deg90 * 2 / 3, 0);

                checkedTorus.position.copy(points[torusCount - 1])
                checkedTorus.rotation.set(0, -deg90 / 3, 0);

                break;
            }
            case 7: {
                torusCount = 8;

                ring.position.copy(points[torusCount])
                ring.rotation.set(0, -deg90 * 2 / 3, 0);

                nextTorus.position.copy(points[torusCount + 1])
                nextTorus.rotation.set(0, deg90 * 2 / 3, 0);

                checkedTorus.position.copy(points[torusCount - 1])
                checkedTorus.rotation.set(0, deg90 / 3, 0);

                break;
            }
            case 8: {
                torusCount = 9;

                ring.position.copy(points[torusCount])
                ring.rotation.set(0, deg90 * 2 / 3, 0);

                nextTorus.position.copy(points[torusCount + 1])
                nextTorus.rotation.set(0, deg90, 0);

                checkedTorus.position.copy(points[torusCount - 1])
                checkedTorus.rotation.set(0, -deg90 * 2 / 3, 0);

                break;
            }
            case 9: {
                torusCount = 10;
                ring.position.copy(points[torusCount])
                ring.rotation.set(0, deg90, 0);

                nextTorus.position.copy(points[torusCount + 1])
                nextTorus.rotation.set(0, -deg90 / 3, 0);

                checkedTorus.position.copy(points[torusCount - 1])
                checkedTorus.rotation.set(0, deg90 * 2 / 3, 0);

                break;
            }
            case 10: {
                torusCount = 11;

                ring.position.copy(points[torusCount])
                ring.rotation.set(0, -deg90 / 3, 0);

                nextTorus.position.copy(points[torusCount + 1])
                nextTorus.rotation.set(0, deg90 / 3, 0);

                checkedTorus.position.copy(points[torusCount - 1])
                checkedTorus.rotation.set(0, deg90, 0);

                break;
            }
            case 11: {
                torusCount = 12;

                ring.position.copy(points[torusCount])
                ring.rotation.set(0, deg90 / 3, 0);

                nextTorus.position.copy(points[torusCount + 1])
                nextTorus.rotation.set(0, deg90, 0);

                checkedTorus.position.copy(points[torusCount - 1])
                checkedTorus.rotation.set(0, -deg90 / 3, 0);

                break;
            }
            case 12: {
                torusCount = 13;
                ring.position.copy(points[torusCount])
                ring.rotation.set(0, deg90, 0);

                nextTorus.visible = false;

                checkedTorus.position.copy(points[torusCount - 1])
                checkedTorus.rotation.set(0, deg90 / 3, 0);

                break;
            }
            case 13: {
                torusCount = 14;
                ring.visible = false;

                clock.stop();
                checkedTorus.position.copy(points[torusCount - 1])
                checkedTorus.rotation.set(0, deg90, 0);
                break;
            }
        }

    }
}

const movementGroup = new THREE.Group(); // Grupo para manipular aviao e camera ao mesmo tempo
const movementGroupPosition = new THREE.Vector3(-130, 2.5, -550); // Salva posicao do grupo para voltar do modo inspecao
movementGroup.position.copy(movementGroupPosition);
scene.add(movementGroup);

const rotationGroup = new THREE.Group();
movementGroup.add(rotationGroup);

const cameraHolder = new THREE.Group(); // a função do cameraholder é fazer a camera acompanhar a rotação do avião no modo cockpit sem girar a camera diretamente
const holderPosition = new THREE.Vector3(0, 10, 0);
cameraHolder.position.copy(holderPosition);
rotationGroup.add(cameraHolder);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const cameraPosition = new THREE.Vector3(0, 0, -50);
camera.position.copy(cameraPosition);
camera.lookAt(movementGroupPosition);
cameraHolder.add(camera);


const trackballControls = new TrackballControls(camera, renderer.domElement);
trackballControls.enabled = false;

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(400, 300, -600);
scene.add(light);

const movingLight = new THREE.DirectionalLight(0xffffff, 1);
movingLight.castShadow = true;
movingLight.position.set(400, 300, -600);

movingLight.shadow.mapSize.width = 1024; // default
movingLight.shadow.mapSize.height = 1024; // default
movingLight.shadow.camera.far = 1500;
movingLight.shadow.camera.right = 100
movingLight.shadow.camera.left = -100;
movingLight.shadow.camera.top = 100;
movingLight.shadow.camera.bottom = -100;

const target = new THREE.Object3D();
movementGroup.add(target);

movingLight.target = target;

movementGroup.add(movingLight);

const cameraHelper = new THREE.CameraHelper(movingLight.shadow.camera);
scene.add(cameraHelper);

const helper = new THREE.DirectionalLightHelper(movingLight, 5);
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

            child.castShadow = true;

            if (/cockpit/.test(child.name)) {
                child.material = new THREE.MeshPhongMaterial({ color, transparent, opacity, side: THREE.DoubleSide })
            }
            else
                child.material = new THREE.MeshPhongMaterial({ color, transparent, opacity })
        }
    });

    rotationGroup.add(airplane);
}

//-----Create ground plane -----

let lm = new THREE.TextureLoader().load('assets/textures/ground-shadow2.png')
lm.flipY = false;

const groundGeo = new THREE.PlaneGeometry(4000, 4000);

let uv1 = groundGeo.getAttribute('uv').array;
groundGeo.setAttribute('uv2', new THREE.BufferAttribute(uv1, 2));

const groundMat = new THREE.MeshLambertMaterial({ color: 0x001D0B, lightMap: lm });

const plane = new THREE.Mesh(groundGeo, groundMat);
plane.rotation.x = Math.PI * -0.5;
plane.receiveShadow = true;
plane.position.y = 2.5;
scene.add(plane);

//----- Load terrain source -----

let mountains;

loader.load('assets/terrain3.glb', mountainsOnLoad, onProgress, onError)

function mountainsOnLoad(gltf) {
    let color;
    mountains = gltf.scene;

    // Converte o MeshStandardMaterial para MeshLambertMaterial (material de Gouraud)
    mountains.traverse((child) => {
        if (child.isMesh) {
            color = child.material.color;

            child.material = new THREE.MeshLambertMaterial({ color });
            // child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(mountains);

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
    const far = 300;
    const origin = new THREE.Vector3(0, 20, -200);
    const direction = new THREE.Vector3(0, -1, 0);
    const newPosition = new THREE.Vector3();
    const raycaster = new THREE.Raycaster(origin, direction, near, far);

    let treeClone, treeCount = 0, t = 0;
    let intersection;
    let offset = 25;

    intersection = raycaster.intersectObject(plane, true)

    while (treeCount < 120) {
        newPosition.set(
            Math.sin(t) * 600 - 320,
            far,
            -500 + 1.2 * t + offset,
        );
        offset *= -1;

        raycaster.set(newPosition, direction);

        intersection = raycaster.intersectObjects([plane, mountains], true)[0];

        if (intersection && intersection.distance > 280) {
            // newPosition.y = intersection.distance * -1;

            treeClone = tree.clone();
            treeClone.position.copy(intersection.point);
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

        plane.visible = false;
        mountains.visible = false;
        movementGroupPosition.copy(movementGroup.position);
        movementGroup.position.set(0, 1, 0)
        airPlaneRotation.copy(airplane.rotation);
        airplane.rotation.set(0, 0, 0);

        trackballControls.enabled = true;
    }
    else {
        trackballControls.enabled = false;

        plane.visible = true;
        mountains.visible = true;
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
        cameraHolder.position.x = -0.3;
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
let speed = 0; // velocidade escalar
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
        case 'Enter': {
            parent.visible = !parent.visible;
            break;
        }
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

        rotationGroup.rotation.y += speed * -Math.sin(airplane.rotation.z) * 0.015;

        linearVel.x = speed * Math.cos(airplane.rotation.x) * Math.sin(rotationGroup.rotation.y);
        linearVel.y = speed * -Math.sin(airplane.rotation.x);
        linearVel.z = speed * Math.cos(airplane.rotation.x) * Math.cos(rotationGroup.rotation.y);

        movementGroup.position.add(linearVel);
    }
}

//criação dos torus

function createTorus() {
    const geometry = new THREE.RingGeometry(12, 15, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide, opacity: 5 });
    const torus = new THREE.Mesh(geometry, material);
    return torus;
}

function createTorusChecekd() {
    const geometry = new THREE.RingGeometry(12, 15, 32);
    const material = new THREE.MeshBasicMaterial({ color: '#00FF00', side: THREE.DoubleSide, opacity: 0.0005 });
    const torus = new THREE.Mesh(geometry, material);
    return torus;
}

function createTorusNext() {
    const geometry = new THREE.RingGeometry(12, 15, 32);
    const material = new THREE.MeshBasicMaterial({ color: '#FF0000', side: THREE.DoubleSide });
    const torus = new THREE.Mesh(geometry, material);
    return torus;
}

const deg90 = Math.PI / 2;

const ring = createTorus();
scene.add(ring);
console.log(ring.material.opacity)
ring.position.copy(points[torusCount])

const nextTorus = createTorusNext();
scene.add(nextTorus);
nextTorus.position.copy(points[torusCount + 1])

const checkedTorus = createTorusChecekd();
scene.add(checkedTorus);
checkedTorus.visible = false;

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
    detectContact();

    if (start) {
        sec = clock.getElapsedTime().toFixed(2);
        infoBox.changeMessage("Checkpoints: " + torusCount + "/14 Time: " + sec + "s");
    }
}