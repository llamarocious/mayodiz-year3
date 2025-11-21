import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const scene = new THREE.Scene();
const canvas = document.querySelector("canvas.threejs");

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Add a directionalLight
const directionalLight = new THREE.DirectionalLight(0xFCD200, 1);
directionalLight.position.set(0.5, 0, -2); // Position the light
scene.add(directionalLight);
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 3); // Size of the helper
scene.add(directionalLightHelper);
directionalLight.target.position.set(0, 0, 0); // Point at the center of the scene
scene.add(directionalLight.target);

// Add a directionalLight2
const directionalLight2 = new THREE.DirectionalLight(0x53E0D4, 0.8);
directionalLight2.position.set(-1, 0, 0.1); // Position the light
scene.add(directionalLight2);
const directionalLightHelper2 = new THREE.DirectionalLightHelper(directionalLight2, 1); // Size of the helper
scene.add(directionalLightHelper2);
directionalLight2.target.position.set(1, 1, 1); // Point at the center of the scene
scene.add(directionalLight2.target);


// Add ambient light for general illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
ambientLight.position.set(0, 5, 0);
scene.add(ambientLight);



const loader = new GLTFLoader();
const modelPath = '/models/room/cozy_workplace_corner.glb';

loader.load(
	modelPath,
	function(glb) {
		console.log(glb);
		const room = glb.scene;

		room.position.set(0, 0, 0);
		room.scale.set(1, 1, 1);

		scene.add(room);

		console.log('Room model loaded successfully');
	},
	// onProgress function = to show loading status for large files
	function ( xhr ) {
		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},
	// onError function = to handle errors during loading
	function ( error ) {
	console.error( 'An error happened while loading the GLB model:', error );
	}
)

const camera = new THREE.PerspectiveCamera(
	50, // fov
	window.innerWidth / window.innerHeight, // aspect ratio
	0.1, // near
	1000 // far
);
camera.position.set(0, 1.6, 3); // Position the camera at eye level
camera.lookAt(0, 0, 0); // Ensure the camera is looking at the center of the scene

const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// instantiate the controls
const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;
// controls.autoRotate = true;

// resizes the renderer size when the window size is changed
window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

const renderloop = () => {
	controls.update();
	renderer.render(scene, camera);
	window.requestAnimationFrame(renderloop);
};
renderloop();





