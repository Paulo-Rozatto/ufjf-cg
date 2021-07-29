import * as THREE from '../build/three.module.js';
import { TrackballControls } from '../build/jsm/controls/TrackballControls.js';
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';
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

// ---------------------------------------- //
// ---------- Variaveis Globais ---------- //
// ---------------------------------------- //

let start = false;
let inspectionMode = false;
let cockpitMode = false;

const clock = new THREE.Clock();
clock.autoStart = false;

let torusCount = 0;
let sec = 0;

// ----------------------------------------------------- //
// ---------- Declareção dos objetos da cena ---------- //
// --------------------------------------------------- //

const infoBox = new SecondaryBox("Checkpoints: " + torusCount + "/14");

const speedBox = new SecondaryBox("0 m/s");
speedBox.box.style.left = "auto";
speedBox.box.style.right = "0";

// -- Criação de grupos que auxiliam a movimentação e rotação --
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

// -- Criação da camera --
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
const cameraPosition = new THREE.Vector3(0, 0, -50);
camera.position.copy(cameraPosition);
camera.lookAt(movementGroupPosition);
cameraHolder.add(camera);

// -- Trackball controls para o modo inspeção --
const trackballControls = new TrackballControls(camera, renderer.domElement);
trackballControls.enabled = false;

// -- Criação das luzes --
const hemisphereLight = new THREE.HemisphereLight(0xa7ceeb, 0x234423, 1.6);
scene.add(hemisphereLight);

const light = new THREE.DirectionalLight(0xffffff, 1); // Luz padrão
light.position.set(400, 300, -600);
scene.add(light);

// Luz que acompanha o avião para projetar sua sombra e das árvores próximas
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
// scene.add(cameraHelper);

const helper = new THREE.DirectionalLightHelper(movingLight, 5);
// scene.add(helper);


// -- Lightmap das sombras das árvores --
let lm = new THREE.TextureLoader().load('assets/textures/ground-shadow.png')
lm.flipY = false;

// -- Criação do chão --
const groundGeo = new THREE.PlaneGeometry(4000, 4000);
const groundMat = new THREE.MeshLambertMaterial({ color: 0x001D0B, lightMap: lm });

// Cria um segundo array de UVs para funcionar o lightmap
let uv1 = groundGeo.getAttribute('uv').array;
groundGeo.setAttribute('uv2', new THREE.BufferAttribute(uv1, 2));

const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = Math.PI * -0.5;
ground.receiveShadow = true;
ground.position.y = 2.5;
scene.add(ground);

// Criação do caminho usando tube geometry
parent = new THREE.Object3D();
scene.add(parent);

// Vetor de pontos para a curva CatmullRoll e para a posicao dos torus
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
];

const pipeSpline = new THREE.CatmullRomCurve3(points);
const tubeGeometry = new THREE.TubeGeometry(pipeSpline, 100, 2, 2, false);
const tubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff00ff });
const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
parent.add(tube);

const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.3, wireframe: true, transparent: true });
const wireframe = new THREE.Mesh(tubeGeometry, wireframeMaterial);
tube.add(wireframe);

// Criação dos torus
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
ring.position.copy(points[torusCount])

const nextTorus = createTorusNext();
scene.add(nextTorus);
nextTorus.position.copy(points[torusCount + 1])

const checkedTorus = createTorusChecekd();
scene.add(checkedTorus);
checkedTorus.visible = false;


// ------------------------------------------------------- //
// ---------- Carregamento de objetos externos ---------- //
// ----------------------------------------------------- //
const loader = new GLTFLoader();

// Callbacks em comum do carregamento de objetos
function onProgress(xhr) { console.log((xhr.loaded / xhr.total * 100) + '% loaded'); }
function onError(error) { console.error('An error happened', error); }

// Carregamento do modelo do avião
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
            else if (/wh*/.test(child.name)) {
                child.material = new THREE.MeshLambertMaterial({ color })
            }
            else
                child.material = new THREE.MeshPhongMaterial({ color, shininess: 40, specular: 0x11F11 })
        }
    });

    rotationGroup.add(airplane);
}

// Carregamento das montanhas
let mountains;

loader.load('assets/mountains.glb', mountainsOnLoad, onProgress, onError)

function mountainsOnLoad(gltf) {
    let color;
    mountains = gltf.scene;

    // Converte o MeshStandardMaterial para MeshLambertMaterial (material de Gouraud)
    mountains.traverse((child) => {
        if (child.isMesh) {
            color = child.material.color;
            child.material = new THREE.MeshLambertMaterial({ color });
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

// Carregamento do modelo da árvore
const treeGroup = new THREE.Group();
scene.add(treeGroup);

function treeOnLoad(gltf) {
    let tree = gltf.scene;

    // Converte o MeshStandardMaterial para MeshLambertMaterial (material de Gouraud)
    let color;
    tree.traverse((child) => {
        if (child.isMesh) {
            color = child.material.color;
            child.material = new THREE.MeshLambertMaterial({ color });
            child.castShadow = true;
        }
    });

    spreadTrees(tree); // cria clones e espalha as arvores
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

    intersection = raycaster.intersectObject(ground, true)

    while (treeCount < 120) {
        newPosition.set(
            Math.sin(t) * 600 - 320,
            far,
            -500 + 1.2 * t + offset,
        );
        offset *= -1;

        raycaster.set(newPosition, direction);

        intersection = raycaster.intersectObjects([ground, mountains], true)[0];

        if (intersection && intersection.distance > 280) {
            // newPosition.y = intersection.distance * -1;

            treeClone = tree.clone();
            treeClone.position.copy(intersection.point);
            treeCount += 1;

            treeGroup.add(treeClone);
        }
        t += 7;

    }
}

/// ----------------------------------------------- //
// ---------- Funções de modo de câmera ---------- //
// ---------------------------------------------- //

function toggleInspectionMode() {
    inspectionMode = !inspectionMode;

    if (inspectionMode) {
        if (cockpitMode) {
            toggleCockpitMode();
        }

        ground.visible = false;
        treeGroup.visible = false;
        mountains.visible = false;
        movementGroupPosition.copy(movementGroup.position);
        movementGroup.position.set(0, 1, 0)
        airPlaneRotation.copy(airplane.rotation);
        airplane.rotation.set(0, 0, 0);

        trackballControls.enabled = true;
    }
    else {
        trackballControls.enabled = false;

        ground.visible = true;
        treeGroup.visible = true;
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
        rotationGroup.add(cameraHolder);

        cameraHolder.position.copy(holderPosition);
        camera.up.set(0, 1, 0);
        camera.position.copy(cameraPosition)
    }
}

/// ---------------------------------- //
// ---------- Movimentação ---------- //
// --------------------------------- //

const MAX_SPEED = 150; // velocidade escalar maxima em m/s
const SCALAR_ACCELERATION = 2; //  aceleração escalar em m/s^2
const FLY_SPEED = 30 // velocidade minima para decoloar
const GRAVITY = 10
let speed = 0; // velocidade escalar em m/s
let gravitySpeed = 0; // acumula a aceleração da gravidade
let linearVel = new THREE.Vector3(0, 0, 0); // vetor velocidade linear
let angularVel = new THREE.Vector3(); // vetor velocidade angular
let moveClock = new THREE.Clock();
let accOietantion = 0; // sentido da aceleracao para o update speed: acelerando 1, desacelerando -1, ou nulo 0)

function updatePosition(delta) {
    // testa se o modelo ja esta carreagado
    if (airplane) {
        updateSpeed(delta);

        // rotacao += velocidade angular - contrapeso
        // o contrapeso multiplicado pelo seno faz o comportamento de limitar a rotacao e volta-la ao inicial
        airplane.rotation.z += delta * (angularVel.z - 2 * Math.sin(airplane.rotation.z));
        airplane.rotation.x += delta * (angularVel.x - 1.5 * Math.sin(airplane.rotation.x));

        rotationGroup.rotation.y += speed * delta * -Math.sin(airplane.rotation.z * delta);

        if (speed < FLY_SPEED && movementGroup.position.y > 2.5) {
            gravitySpeed += GRAVITY * delta;
        }
        else {
            gravitySpeed = 0;
        }

        linearVel.x = speed * Math.cos(airplane.rotation.x) * Math.sin(rotationGroup.rotation.y);
        linearVel.z = speed * Math.cos(airplane.rotation.x) * Math.cos(rotationGroup.rotation.y)
        linearVel.y = speed * -Math.sin(airplane.rotation.x) - gravitySpeed;
        linearVel.multiplyScalar(delta);

        movementGroup.position.add(linearVel);
    }
}

function updateSpeed(delta) {
    if (accOietantion === 1) {
        if (speed <= MAX_SPEED) {
            speed += SCALAR_ACCELERATION * delta * 5;

            speedBox.changeMessage(speed.toFixed(0) + "m/s");
        }
    }
    else if (accOietantion === -1) {
        if (speed > 0) {
            speed -= SCALAR_ACCELERATION * delta * 5;

            speedBox.changeMessage(speed.toFixed(0) + "m/s");
        }
    }
}

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

// --------------------------------------------------------- //
// ---------- Listerners e mapeamento do teclado ---------- //
// ------------------------------------------------------- //
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);
window.addEventListener('keydown', onKeyDown, false);
window.addEventListener('keyup', onKeyUp, false);

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
            accOietantion = 1;
            break;
        };
        case 'a': {
            accOietantion = -1;
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
        case 'q':
        case 'a': {
            accOietantion = 0;
            break;
        };
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

// ---------------------------- //
// ---------- Render ---------- //
// ---------------------------- //
render();

function render() {
    // delta = moveClock.getDelta();

    if (inspectionMode) {
        trackballControls.update(); // Enable mouse movements
    } else {
        updatePosition(moveClock.getDelta());
    }
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
    detectContact();

    if (start) {
        sec = clock.getElapsedTime().toFixed(2);
        infoBox.changeMessage("Checkpoints: " + torusCount + "/14 Time: " + sec + "s");
    }
}