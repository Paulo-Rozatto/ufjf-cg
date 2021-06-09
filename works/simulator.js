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
    // Envergadura 	15 m
    // Altura 	     5 m
    const aviao = new THREE.Object3D();


    // Criando fuselagem do aviao
    const fuselagem = new THREE.Object3D();
    const fuselagemMat = new THREE.MeshPhongMaterial({ color: 0xffde00 });

    fuselagem.rotation.x = Math.PI * 0.5;
    fuselagem.scale.set(1.5, 1);
    aviao.add(fuselagem);

    const bico = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 1, 2.6, 16),
        fuselagemMat
    );
    bico.position.y = 1.3 + 0.8 + 4;
    fuselagem.add(bico);

    const bico2 = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1.2, 0.8, 16),
        fuselagemMat
    )
    bico2.position.y = 0.4 + 4;
    fuselagem.add(bico2)

    const corpo1 = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.52, 4, 16),
        fuselagemMat,
    );
    corpo1.position.y = 2;
    fuselagem.add(corpo1);

    const corpo2 = new THREE.Mesh(
        new THREE.CylinderGeometry(1.52, 1.3, 1, 16),
        fuselagemMat,
    );
    corpo2.position.y = -0.5;
    fuselagem.add(corpo2);

    const corpo3 = new THREE.Mesh(
        new THREE.CylinderGeometry(1.3, 1.2, 8, 16),
        fuselagemMat
    );
    corpo3.position.y = -5;
    fuselagem.add(corpo3);

    const saida = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 0.8, 1, 16),
        fuselagemMat
    );
    saida.position.y = -9.5;
    fuselagem.add(saida);

    const cambine = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 16),
        new THREE.MeshPhongMaterial({ color: 0x9999ff }),
    );
    cambine.scale.set(1.5, 1, 2)
    cambine.position.z = corpo1.position.y;
    cambine.position.y = 1;
    aviao.add(cambine);

    // Criando as asas
    const asas = new THREE.Object3D();
    asas.rotation.x = Math.PI * 0.5;
    aviao.add(asas);

    const extrudeSettings = {
        steps: 2,
        depth: 0.25,
        bevelEnabled: false,
    };

    const shapeAsa = new THREE.Shape();
    shapeAsa.lineTo(1, 0);
    shapeAsa.lineTo(1, 0.4)
    shapeAsa.lineTo(4, 0.4);
    shapeAsa.lineTo(4, 0);
    shapeAsa.lineTo(7, 0);
    shapeAsa.lineTo(0, 4);
    shapeAsa.lineTo(0, 0);

    const asaGeo = new THREE.ExtrudeGeometry(shapeAsa, extrudeSettings);
    const asaMat = new THREE.MeshPhongMaterial({ color: 0xff0056, side: THREE.DoubleSide })
    const esquerda = new THREE.Mesh(
        asaGeo,
        asaMat
    )
    esquerda.position.set(1.75, -5, -0.2);
    asas.add(esquerda);

    const direita = new THREE.Mesh(
        asaGeo,
        asaMat
    )
    direita.position.set(-1.75, -5, -0.2);
    direita.rotation.y = Math.PI;
    asas.add(direita);

    // Criando leme
    const leme = new THREE.Object3D();
    leme.position.z = -9;
    aviao.add(leme);

    const asaVertical = new THREE.Mesh(
        asaGeo,
        asaMat
    );
    asaVertical.rotation.set(Math.PI / 2, Math.PI / 2, 0);
    asaVertical.scale.set(0.5, 0.7, 1);
    asaVertical.position.set(0, 1.25, 0);
    leme.add(asaVertical);

    const miniEsquerda = new THREE.Mesh(
        asaGeo,
        asaMat
    );
    miniEsquerda.scale.set(0.5, 0.5, 0.5);
    miniEsquerda.rotation.x = Math.PI / 2;
    miniEsquerda.position.x = 1.8;
    leme.add(miniEsquerda);

    const miniDireita = new THREE.Mesh(
        asaGeo,
        asaMat
    );
    miniDireita.scale.set(0.5, 0.5, 0.5);
    miniDireita.rotation.x = Math.PI / 2;
    miniDireita.rotation.y = Math.PI;
    miniDireita.position.x = -1.8;
    leme.add(miniDireita);

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