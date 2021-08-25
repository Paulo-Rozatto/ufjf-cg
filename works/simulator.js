import * as THREE from '../build/three.module.js';
import { TrackballControls } from '../build/jsm/controls/TrackballControls.js';
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';
import {
    initRenderer,
    SecondaryBox,
    onWindowResize,
} from "../libs/util/util.js";

const scene = new THREE.Scene();    // Create main scene
const renderer = initRenderer({ logarithmicDepthBuffer: true });    // View function in util/utils
renderer.setClearColor(0x87ceeb)
renderer.shadowMap.enabled = true;

// ---------------------------------------- //
// ---------- Variaveis Globais ---------- //
// ---------------------------------------- //
let start = false;
let inspectionMode = false;
let cockpitMode = false;

// -------------------------------------- //
// ----------- Contador de tempo -------- //
// -------------------------------------- //
const clock = new THREE.Clock();
clock.autoStart = false;

// --------------------------------------------------------- //
// --- Contador de torus e variável para receber o tempo --- //
// --------------------------------------------------------- //
let torusCount = 0;
let sec = 0;

// ---------------------------------------- //
// ---------- Carregadores ---------------- //
// ---------------------------------------- //
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

// Callbacks em comum do carregamento de objetos
function onProgress(xhr) { console.log((xhr.loaded / xhr.total * 100) + '% loaded'); }
function onError(error) { console.error('An error happened', error); }

// ----------------------------------------------------- //
// ---------- Declareção dos objetos da cena ---------- //
// --------------------------------------------------- //
const infoBox = new SecondaryBox("Checkpoints: " + torusCount + "/14");

const speedBox = new SecondaryBox("0 m/s");
speedBox.box.style.left = "auto";
speedBox.box.style.right = "0";

// -- Criação de grupos que auxiliam a movimentação e rotação --
const movementGroup = new THREE.Group(); // Grupo para manipular aviao e camera ao mesmo tempo
const movementGroupPosition = new THREE.Vector3(7.5, 15, -30); // Salva posicao do grupo para voltar do modo inspecao
movementGroup.position.copy(movementGroupPosition);
scene.add(movementGroup);

const rotationGroup = new THREE.Group();
movementGroup.add(rotationGroup);

const cameraHolder = new THREE.Group(); // a função do cameraholder é fazer a camera acompanhar a rotação do avião no modo cockpit sem girar a camera diretamente
const holderPosition = new THREE.Vector3(0, 10, 0);
cameraHolder.position.copy(holderPosition);
rotationGroup.add(cameraHolder);

// -- Criação da camera --
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 4500);
const cameraPosition = new THREE.Vector3(0, 0, -50);
cameraHolder.add(camera);
camera.position.copy(cameraPosition);
camera.lookAt(movementGroupPosition);

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
// const movingLight = new THREE.DirectionalLight(0xffffff, 1);
// movingLight.castShadow = true;
// movingLight.position.set(400, 300, -600);

// movingLight.shadow.mapSize.width = 1024; // default
// movingLight.shadow.mapSize.height = 1024; // default
// movingLight.shadow.camera.far = 1500;
// movingLight.shadow.camera.right = 100
// movingLight.shadow.camera.left = -100;
// movingLight.shadow.camera.top = 100;
// movingLight.shadow.camera.bottom = -100;

// const target = new THREE.Object3D();
// movementGroup.add(target);

// movingLight.target = target;

// movementGroup.add(movingLight);

// const cameraHelper = new THREE.CameraHelper(movingLight.shadow.camera);
// scene.add(cameraHelper);

// const helper = new THREE.DirectionalLightHelper(movingLight, 5);
// scene.add(helper);


// -- Lightmap das sombras das árvores --
// let lm = textureLoader.load('assets/textures/ground-shadow.png')
// lm.flipY = false;

// --- Skybox --- //
const cubeTextureLoader = new THREE.CubeTextureLoader();
const texture = cubeTextureLoader.load([
    'assets/textures/skybox/right.bmp',
    'assets/textures/skybox/left.bmp',
    'assets/textures/skybox/top.bmp',
    'assets/textures/skybox/bottom.bmp',
    'assets/textures/skybox/front.bmp',
    'assets/textures/skybox/back.bmp',
]);
scene.background = texture;


// ------------------------------------------------------- //
// ---------- Criação da Cidade ------------------------- //
// ----------------------------------------------------- //

// -- Criação do chão --
const sideWalkTexture = textureLoader.load('assets/textures/sidewalk.jpg');
sideWalkTexture.wrapS = THREE.RepeatWrapping;
sideWalkTexture.wrapT = THREE.RepeatWrapping;
sideWalkTexture.repeat.set(600, 600);

const cityGroundGeo = new THREE.PlaneGeometry(1000, 1000);
const cityGroundMat = new THREE.MeshBasicMaterial({ map: sideWalkTexture });

// Cria um segundo array de UVs para funcionar o lightmap
// let uv1 = groundGeo.getAttribute('uv').array;
// groundGeo.setAttribute('uv2', new THREE.BufferAttribute(uv1, 2));

const cityGround = new THREE.Mesh(cityGroundGeo, cityGroundMat);
cityGround.rotation.x = Math.PI * -0.5;
cityGround.receiveShadow = true;
cityGround.position.y = 0;
scene.add(cityGround);

// --- Criação das ruas e prédios ----
const streetTexture = textureLoader.load('assets/textures/asfalto.jpg');
streetTexture.wrapT = THREE.RepeatWrapping;
streetTexture.repeat.set(1, 85 / 15);
const streetGeo = new THREE.PlaneGeometry(15, 185);
const streetMat = new THREE.MeshLambertMaterial({ map: streetTexture });

const streetTexture2 = textureLoader.load('assets/textures/asfalto.jpg');
streetTexture2.wrapS = THREE.RepeatWrapping;
streetTexture2.repeat.set(1, 1);
const streetGeo2 = new THREE.PlaneGeometry(15, 85);
const streetMat2 = new THREE.MeshLambertMaterial({ map: streetTexture2 });

const streetGeo3 = new THREE.PlaneGeometry(15, 15);
const streetMat3 = new THREE.MeshLambertMaterial({ color: 0x000000 });

createStreets();
function createStreets() {
    for (let i = 0; i <= 10; i++) {
        for (let j = -1; j < 5; j++) {
            if (j > -1) {
                const street1 = new THREE.Mesh(streetGeo, streetMat);

                street1.rotation.x = -0.5 * Math.PI;

                street1.position.x = -500 + 7.5 + 100 * i;
                street1.position.y = 0.1;
                street1.position.z = -500 + 92.5 + 200 * j;
                scene.add(street1);
            }

            if (i < 10) {
                const street2 = new THREE.Mesh(streetGeo2, streetMat2);

                street2.rotation.x = -0.5 * Math.PI;
                street2.rotation.z = -0.5 * Math.PI;

                street2.position.x = -500 + 42.5 + 100 * i + 15;
                street2.position.y = 0.1;
                street2.position.z = -500 - 7.5 + 200 * (j + 1);
                scene.add(street2)

            }

            const street3 = new THREE.Mesh(streetGeo3, streetMat3);

            street3.rotation.x = -0.5 * Math.PI;

            street3.position.x = -500 + 42.5 + 100 * i - 35;
            street3.position.y = 0.1;
            street3.position.z = -500 - 7.5 + 200 * (j + 1);
            scene.add(street3);
        }
    }
}

// --- Criação das torres ---

let tower1, tower2;

gltfLoader.load('assets/tower.glb', towerOnLoad, onProgress, onError)

function towerOnLoad(gltf) {
    tower1 = gltf.scene;
    tower1.scale.set(5, 5, 5);
    tower1.rotation.y = Math.PI;
    tower1.position.set(-40, 0, 0);
    scene.add(tower1);

    tower2 = tower1.clone();
    tower2.position.set(55, 0, 0);
    scene.add(tower2);
}

createBuildings();
function createBuildings() {
    for (let i = 0; i < 10; i++) {

        for (let j = 0; j < 10; j++) {
            if ((i == 4 || i == 5) && (j == 4 || j == 5)) continue; // deixa o local das torres vazio

            const building = chooseBuilding(i + j);

            // building.rotation.x = -0.5 * Math.PI;

            building.position.x = -500 + 60 + 100 * i;
            building.position.y = 0.1;
            building.position.z = -500 + 50 + 200 * j / 2;
            scene.add(building);
        }
    }

    function chooseBuilding(t) {
        let i = Math.floor(3 * Math.sin(t)) + 1;

        switch (i) {
            case 1: return building1();
            case 2: return building2();
            case 3: return building3();
            default: return building4();
            // default: return building3();
        }
    }
}

// ------------------------------------------------------- //
// ---------- Criação da Periferia ----------------------- //
// ------------------------------------------------------- //

// ---- Chao da periferia --- //
const grassTexture = textureLoader.load('assets/textures/grass.jpg');
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(1500, 1500);

const outskirtsGround = new THREE.Mesh(
    new THREE.PlaneGeometry(7500, 7500),
    new THREE.MeshBasicMaterial({ map: grassTexture })
);
outskirtsGround.rotation.x = - Math.PI / 2;
outskirtsGround.position.y = -0.1;
scene.add(outskirtsGround);

const outerGround = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(20000, 20000),
    new THREE.MeshBasicMaterial({ color: 0x445623 }),
);
outerGround.rotation.x = - Math.PI / 2;
outerGround.position.y = -0.5;
scene.add(outerGround);

// --- Carregamento das montanhas --- //
let mountains;

gltfLoader.load('assets/mountains.glb', mountainsOnLoad, onProgress, onError)

function mountainsOnLoad(gltf) {
    let color;
    mountains = gltf.scene;

    // mountains.position.z = 1200;
    mountains.position.z = 1080;

    // Converte o MeshStandardMaterial para MeshLambertMaterial (material de Gouraud)
    mountains.traverse((child) => {
        if (child.isMesh) {
            color = child.material.color;
            child.material = new THREE.MeshLambertMaterial({ color });
            child.receiveShadow = true;
        }
    });
    scene.add(mountains);
    setTimeout(() => {
        gltfLoader.load('assets/tree1.glb', treeOnLoad, onProgress, onError);
    }, 500);
}

// Carregamento do modelo da árvore
const treeGroup = new THREE.Group();
scene.add(treeGroup);

// gltfLoader.load('assets/tree1.glb', treeOnLoad, onProgress, onError);

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
    let clone;
    let radius = 740;
    let offset = 20;
    let growthRate = 50;
    let theta = 0;

    const raycaster = new THREE.Raycaster();
    const origin = new THREE.Vector3(0, 30, 0);
    const direction = new THREE.Vector3(0, -1, 0);
    let intersection = [];

    for (let i = 1; i <= 10; i++) {
        for (let j = 0; j <= 40; j++) {
            clone = tree.clone();

            clone.position.x = Math.cos(theta) * radius + offset * i * (Math.sin(j) - Math.cos(j)) //+ offset;
            clone.position.z = Math.sin(theta) * radius + offset * i * (Math.sin(j) - Math.cos(j))

            origin.x = clone.position.x;
            origin.z = clone.position.z;
            raycaster.set(origin, direction);

            intersection.length = 0;
            raycaster.intersectObject(mountains, true, intersection);

            if (intersection.length > 0) {
                clone.position.y = intersection[0].point.y;
                console.log(intersection);
            }

            treeGroup.add(clone);


            theta += Math.PI / 20;
            offset *= -1;
        }
        radius += growthRate;
    }
}

// ------------------------------------------------------- //
// ---------- Criação do Caminho ------------------------ //
// ----------------------------------------------------- //

// Criação do caminho usando tube geometry
parent = new THREE.Object3D();
scene.add(parent);

// Vetor de pontos para a curva CatmullRoll e para a posicao dos torus
const points = [
    new THREE.Vector3(-130, 95, -200),
    new THREE.Vector3(-190, 150, 106),
    new THREE.Vector3(-200, 108, 665),
    new THREE.Vector3(-383, 137, 860),
    new THREE.Vector3(-603, 145, 900),
    new THREE.Vector3(-850, 138, 309),
    new THREE.Vector3(-370, 54, -154),
    new THREE.Vector3(-428, 142, -388),
    new THREE.Vector3(-801, 86, -399),
    new THREE.Vector3(-869, 54, -117),
    new THREE.Vector3(-41, 42, 355),
    new THREE.Vector3(338, 142, 314),
    new THREE.Vector3(376, 154, 103),
    new THREE.Vector3(-26, 64, -201)
];

// -------- Criação do tubo que representa o caminho ----  ///

const pipeSpline = new THREE.CatmullRomCurve3(points);
const tubeGeometry = new THREE.TubeGeometry(pipeSpline, 100, 0.25, 20, false);
const tubeMaterial = new THREE.MeshLambertMaterial({ color: '#000080' });
const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
// parent.add(tube);

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
// Torus que precisa passar
const ring = createTorus();
// scene.add(ring);
ring.position.copy(points[torusCount])
// Próximo torus
const nextTorus = createTorusNext();
// scene.add(nextTorus);
nextTorus.position.copy(points[torusCount + 1])
// Torus pelo qual acabou de passar
const checkedTorus = createTorusChecekd();
// scene.add(checkedTorus);
checkedTorus.visible = false;


// ------------------------------------------------------- //
// ---------- Carregamento do modelo do avião ---------- //
// ----------------------------------------------------- //

// Carregamento do modelo do avião
let airplane
let airPlaneRotation = new THREE.Euler(); // Salva rotacao do aviao por causa do modo inspecao

gltfLoader.load('assets/airplane-camuflado.glb', airplaneOnLoad, onProgress, onError);

function airplaneOnLoad(gltf) {
    airplane = gltf.scene;

    // Converte o MeshStandardMaterial para MeshPhongMaterial
    let color, transparent, opacity;
    airplane.traverse((child) => {
        if (child.isMesh && false) {

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
    // camera.lookAt(movementGroupPosition);
    rotationGroup.add(airplane);
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

        cityGround.visible = false;
        // treeGroup.visible = false;
        // mountains.visible = false;
        // movementGroupPosition.copy(movementGroup.position);
        // movementGroup.position.set(0, 1, 0)
        // airPlaneRotation.copy(airplane.rotation);
        // airplane.rotation.set(0, 0, 0);

        trackballControls.enabled = true;
    }
    else {
        trackballControls.enabled = false;

        cityGround.visible = true;
        // treeGroup.visible = true;
        // mountains.visible = true;
        movementGroup.position.copy(movementGroupPosition);
        airplane.rotation.copy(airPlaneRotation);

        camera.up.set(0, 1, 0);
        camera.position.copy(cameraPosition)
        // camera.lookAt(movementGroupPosition);
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
// Detecta se passou pelo torus
function detectContact() {
    // Condição para adicionar uma certa margem de erro para passar pelo torus
    if (movementGroup.position.x <= ring.position.x + 20 && movementGroup.position.x >= ring.position.x - 20
        && movementGroup.position.y <= ring.position.y + 15 && movementGroup.position.y >= ring.position.y - 15
        && movementGroup.position.z <= ring.position.z + 7 && movementGroup.position.z >= ring.position.z - 7) {
        //Verificação para reposicionamento dos torus
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
    requestAnimationFrame(render);

    if (inspectionMode) {
        trackballControls.update(); // Enable mouse movements
    } else {
        updatePosition(moveClock.getDelta());
    }
    renderer.render(scene, camera) // Render scene
    // detectContact();

    if (start) { //Contador de tempo colocado no render para ter atualização em tempo real
        sec = clock.getElapsedTime().toFixed(2);
        infoBox.changeMessage("Checkpoints: " + torusCount + "/14 Time: " + sec + "s");
    }
}

// ------------------------------------------------------- //
// ---------- Criação de prédios ------------------------ //
// ----------------------------------------------------- //

function building1() {
    const building = new THREE.Object3D();

    let texture = textureLoader.load('assets/textures/window1.jpg')

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 2);

    const top = customBox(40, 80, 30, texture, 0x999395);
    top.position.y = 40;
    building.add(top);

    return building;
}

function building2() {
    const building = new THREE.Object3D();

    let bottomTexture = textureLoader.load('assets/textures/granite1.jpg')
    bottomTexture.wrapS = THREE.RepeatWrapping;
    bottomTexture.wrapT = THREE.RepeatWrapping;
    bottomTexture.repeat.set(2, 1);

    const bottom = customBox(40, 10, 40, bottomTexture);
    bottom.position.y = 5;
    building.add(bottom);

    let topTexture = textureLoader.load('assets/textures/window2.jpg')
    topTexture.wrapS = THREE.RepeatWrapping;
    topTexture.wrapT = THREE.RepeatWrapping;
    topTexture.repeat.set(2, 2);

    const top = customBox(30, 40, 30, topTexture, 0x566576);
    top.position.y = 30;
    building.add(top);

    return building;
}

function building3() {
    const building = new THREE.Object3D();

    let bottomTexture = textureLoader.load('assets/textures/marble1.jpg')
    bottomTexture.wrapT = THREE.RepeatWrapping;
    bottomTexture.repeat.set(1, 3);

    const groundGeo = new THREE.PlaneGeometry(4.5, 40);
    const groundMat = new THREE.MeshBasicMaterial({ map: bottomTexture });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = 0.2;
    ground.rotation.x = - Math.PI / 2;
    building.add(ground);

    let towerTexture = textureLoader.load('assets/textures/window3.jpg')
    towerTexture.wrapS = THREE.RepeatWrapping;
    towerTexture.wrapT = THREE.RepeatWrapping;
    towerTexture.repeat.set(0.5, 1);

    const tower1 = customBox(15, 70, 40, towerTexture);
    tower1.position.set(9, 35, 0);
    building.add(tower1)

    const tower2 = customBox(15, 70, 40, towerTexture);
    tower2.position.set(-9, 35, 0);
    building.add(tower2);

    return building;
}

function building4() {
    const building = new THREE.Object3D();

    let bottomTexture = textureLoader.load('assets/textures/window4.2.jpg')
    bottomTexture.wrapS = THREE.RepeatWrapping;
    bottomTexture.wrapT = THREE.RepeatWrapping;
    bottomTexture.repeat.set(4, 1);

    const bottomGeo = new THREE.CylinderGeometry(15, 15, 10);
    const bottomMat = new THREE.MeshBasicMaterial({ map: bottomTexture });
    const bottom = new THREE.Mesh(bottomGeo, bottomMat);
    bottom.position.y = 5;
    building.add(bottom);

    let topTexture = textureLoader.load('assets/textures/window4.jpg')
    topTexture.wrapS = THREE.RepeatWrapping;
    topTexture.wrapT = THREE.RepeatWrapping;
    topTexture.repeat.set(4, 4);

    const topGeo = new THREE.CylinderGeometry(20, 20, 50, 16);
    const topMat = new THREE.MeshBasicMaterial({ map: topTexture });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = 35;
    building.add(top);

    return building;
}

function customBox(width, height, depth, texture, topColor) {
    const box = new THREE.Object3D();

    const geo1 = new THREE.PlaneGeometry(width, height);
    const mat1 = new THREE.MeshBasicMaterial({ map: texture });
    const face1 = new THREE.Mesh(geo1, mat1);

    face1.position.set(0, 0, -depth / 2);
    face1.rotation.set(0, Math.PI, 0);
    box.add(face1);

    const geo2 = new THREE.PlaneGeometry(depth, height);
    const mat2 = new THREE.MeshBasicMaterial({ map: texture });
    const face2 = new THREE.Mesh(geo2, mat2);

    face2.position.set(width / 2, 0, 0);
    face2.rotation.set(0, Math.PI / 2, 0);
    box.add(face2);

    const geo3 = new THREE.PlaneGeometry(width, depth);
    const mat3 = new THREE.MeshBasicMaterial({ color: topColor || null, map: topColor ? null : texture });
    const face3 = new THREE.Mesh(geo3, mat3);

    face3.position.set(0, height / 2, 0);
    face3.rotation.set(-Math.PI / 2, 0, 0);
    box.add(face3);

    const face4 = face1.clone();
    face4.position.multiplyScalar(-1);
    face4.rotation.y = -Math.PI;
    face4.material.map = texture;
    face4.material.needsUpdate = true;
    box.add(face4);

    const face5 = face2.clone();
    face5.position.multiplyScalar(-1);
    face5.rotation.y = - Math.PI / 2;
    face5.material.map = texture;
    face5.material.needsUpdate = true;
    box.add(face5);

    return box;

}