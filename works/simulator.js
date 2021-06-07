import * as THREE from '../build/three.module.js';
import { TrackballControls } from '../build/jsm/controls/TrackballControls.js';
import {
    initRenderer,
    initCamera,
    onWindowResize,
    initDefaultLighting,
} from "../libs/util/util.js";

const scene = new THREE.Scene();    // Create main scene
const renderer = initRenderer();    // View function in util/utils
const light = initDefaultLighting(scene, new THREE.Vector3(0, 30, 15));
scene.add(light);

const camera = initCamera(new THREE.Vector3(25, 10, 7)); // Init camera in this position
scene.add(camera);

const trackballControls = new TrackballControls(camera, renderer.domElement);

const airplane = buildAirplane();
scene.add(airplane);

function buildAirplane() {
    // Tamanho aproximado de um aviao de pequeno porte real (F-16)
    // Comprimento 	 15 m
    // Envergadura 	12 m
    // Altura 	     5 m
    const aviao = new THREE.Object3D();


    // Criando fuselagem do aviao
    const fuselagem = new THREE.Object3D();
    const fuselagemMat = new THREE.MeshPhongMaterial({ color: 0xffde00, side: THREE.DoubleSide });
    fuselagem.rotation.x = Math.PI * 0.5;
    aviao.add(fuselagem);

    const corpo = new THREE.Mesh(
        new THREE.CylinderGeometry(1.4, 1, 10, 16),
        fuselagemMat
    );
    fuselagem.add(corpo);

    const bico = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 1.4, 5, 32),
        fuselagemMat
    );
    fuselagem.scale.z = 0.9
    bico.position.y = 7.5;
    fuselagem.add(bico);

    const cambine = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 16),
        new THREE.MeshPhongMaterial({ color: 0x9999ff })
    );
    cambine.rotation.x = Math.PI / 24;
    cambine.scale.set(1, 1, 2);
    cambine.position.z = 5;
    cambine.position.y = 0.6;
    aviao.add(cambine);

    // Criando as asas
    const asas = new THREE.Object3D();

    const shape = new THREE.Shape();
    shape.lineTo(6, 0);
    shape.lineTo(0, Math.sqrt(3) * 3); // sin(45) * 6
    shape.lineTo(0, 0);

    asas.rotation.x = Math.PI * 0.5;
    aviao.add(asas);

    // const asaGeo = new THREE.CircleGeometry(7, 1);
    const asaGeo = new THREE.ShapeGeometry(shape);
    const asaMat = new THREE.MeshPhongMaterial({ color: 0xff0056, side: THREE.DoubleSide })
    const esquerda = new THREE.Mesh(
        asaGeo,
        asaMat
    )
    esquerda.position.x = 1;
    esquerda.position.y = -2.5;
    asas.add(esquerda);

    const direita = new THREE.Mesh(
        asaGeo,
        asaMat
    )
    direita.position.x = -1;
    direita.position.y = -2.5;
    direita.rotation.y = Math.PI;
    asas.add(direita);

    return aviao;
}

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

render();
function render() {
    trackballControls.update(); // Enable mouse movements
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
}