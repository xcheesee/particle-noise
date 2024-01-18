import { createPCamera } from "./components/camera";
import { createScene } from "./components/scene";
import { Resizer } from "./systems/Resizer";
import { createRenderer } from "./systems/renderer";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer'
import  fragmentSimulation from '../assets/shaders/fragmentSimulation.glsl'
import  fragment from '../assets/shaders/fragment.glsl'
import  vertexParticles from '../assets/shaders/vertexParticles.glsl'
import * as THREE from 'three'
let camera;
let scene;
let renderer;
let GPUCompute;
let material;
let geometry;
let plane;
let time = 0;
let positionVariable;
const WIDTH = 128;

class World {
    constructor(container) {
        camera = createPCamera()
        scene = createScene()
        renderer = createRenderer()

        const loader = new GLTFLoader()
        const controls = new OrbitControls(camera, container)
        controls.update()
        const resizer = new Resizer(camera, renderer, container)
        container.append(renderer.domElement)
        //const m = new THREE.MeshBasicMaterial({ color: 'black' })
        //const g = new THREE.BoxGeometry()
        //const mesh = new THREE.Mesh(g, m)
        //scene.add(mesh)
        loader.load('/assets/models/spMeshFilledSmall.glb', (gltf) => {
            this.model = gltf.scene.children[0]
            gltf.scene.children[0].geometry.scale(0.2, 0.2, 0.2)
            this.modelPos = gltf.scene.children[0].geometry.attributes.position.array
            this.modelNumber = this.modelPos.length/3
            this.initGPGPU()
            this.addObjects()
            this.render()
         })
    }

    initGPGPU() {
        GPUCompute = new GPUComputationRenderer(WIDTH, WIDTH, renderer)

        const dtPosition = GPUCompute.createTexture()
        this.fillPositions(dtPosition)
        positionVariable = GPUCompute.addVariable('texturePosition', fragmentSimulation, dtPosition)

        positionVariable.material.uniforms['time'] = { value: 0 }

        positionVariable.wrapS = THREE.RepeatWrapping;
        positionVariable.wrapT = THREE.RepeatWrapping;

        GPUCompute.init()
    }

    fillPositions(texture) {
        let arr = texture.image.data;
        for(let i = 0; i < arr.length; i+=4) {
            let rand = Math.floor(Math.random()*this.modelNumber)
            let x = this.modelPos[3*rand]
            let y = this.modelPos[3*rand+1];
            let z = this.modelPos[3*rand+2];

            arr[i+0] = x
            arr[i+1] = y
            arr[i+2] = z
            arr[i+3] = 1
        }
    }

    addObjects() {
        //let that = this;
        material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: { value: 0 },
                positionTexture: { value: null },
                resolution: { value: new THREE.Vector4() }
            },
            vertexShader: vertexParticles,
            fragmentShader: fragment,
        })
        //material = new THREE.MeshBasicMaterial({ color: 0x000000})
        geometry = new THREE.BufferGeometry();
        let positions = new Float32Array(WIDTH*WIDTH*3)
        let references = new Float32Array(WIDTH*WIDTH*2)
        for( let i = 0; i < WIDTH*WIDTH; i++){
            let x = Math.random()
            let y = Math.random()
            let z = Math.random()

            let xx = (i%WIDTH)/WIDTH
            let yy = ~~(i/WIDTH)/WIDTH

            positions.set([x, y, z], i*3)
            references.set([xx, yy], i*2)
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geometry.setAttribute('reference', new THREE.BufferAttribute(references, 2))
        geometry = this.model.geometry
        plane = new THREE.Points(geometry, material)
        scene.add(plane)

        //const pgeom = new THREE.PlaneGeometry(2, 2)
        //const pmat = new THREE.MeshBasicMaterial({ color: 'blue' })
        //const pl = new THREE.Mesh(pgeom, pmat)
        //scene.add(pl)
    }

    render() {
        time += 0.05;
        material.uniforms.time.value = time;

        GPUCompute.compute()

        positionVariable.material.uniforms['time'].value = time;
        material.uniforms.positionTexture.value = GPUCompute.getCurrentRenderTarget(positionVariable).texture;
        requestAnimationFrame(this.render.bind(this));
        const vec = camera.position
        console.log(vec)
        renderer.render(scene, camera);
    }
}

export { World }