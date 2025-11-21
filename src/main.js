import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/* TODO: 
- Add special items manually and calibrate positions and scale 
	* Item #1: Treasure Map on the desk 
	? Item #2: 
*/

const scene = new THREE.Scene();
const canvas = document.querySelector("canvas.threejs");

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Directional Lights
{
	// Add a directionalLight
const directionalLight = new THREE.DirectionalLight(0xFCD200, 1);
directionalLight.position.set(0.5, 0, -2); // Position the light
scene.add(directionalLight);
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 3); // Size of the helper
scene.add(directionalLightHelper);
directionalLight.target.position.set(0, 0, 0); // Point at the center of the scene
scene.add(directionalLight.target);

// Add a directionalLight2
const directionalLight2 = new THREE.DirectionalLight(0x53E0D4, 0.5);
directionalLight2.position.set(-1, 0, 0.1); // Position the light
scene.add(directionalLight2);
const directionalLightHelper2 = new THREE.DirectionalLightHelper(directionalLight2, 1); // Size of the helper
scene.add(directionalLightHelper2);
directionalLight2.target.position.set(1, 1, 1); // Point at the center of the scene
scene.add(directionalLight2.target);
}


// Add ambient light for general illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
ambientLight.position.set(0, 5, 0);
scene.add(ambientLight);


const loader = new GLTFLoader();

// Load the room model
loader.load(
	// URL
	'/models/room/cozy_workplace_corner_edited.glb',
	// onLoad
	function(glb) {
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
);

// Load the map model (Item #1)
loader.load(
	'/models/treasure_map.glb',
	function(glb) {
		const map = glb.scene;

		map.position.set(-1, 2.35, -1.13);
		map.scale.set(0.003, 0.002, 0.0025);
		scene.add(map);

		console.log('Map model loaded successfully');
	},
	// onProgress function = to show loading status for large files
	function ( xhr ) {
		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},
	// onError function = to handle errors during loading
	function ( error ) {
	console.error( 'An error happened while loading the GLB model:', error );
	}
);

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
controls.enableDamping = true;
controls.dampingFactor = 0.4;
// controls.autoRotate = true;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.minDistance = 1;
controls.maxDistance = 9;
controls.maxPolarAngle = Math.PI / 2; // Prevent going below the ground
controls.mouseButtons = {
		LEFT: THREE.MOUSE.PAN, // Use left mouse button for panning
		MIDDLE: THREE.MOUSE.DOLLY, // Use middle mouse button for zooming
		RIGHT: THREE.MOUSE.ROTATE, // Use right mouse button for rotation
};
// controls.rotateSpeed = -1.0; // Set a negative value to invert rotation

// resizes the renderer size when the window size is changed
window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

// Save the camera state before the page reloads
window.addEventListener("beforeunload", () => {
		const cameraState = {
				position: camera.position.toArray(), // Save position as an array [x, y, z]
				target: controls.target.toArray(),	// Save the OrbitControls target
		};
		localStorage.setItem("cameraState", JSON.stringify(cameraState));
});

// Restore the camera state on page load
const savedCameraState = localStorage.getItem("cameraState");
if (savedCameraState) {
		const { position, target } = JSON.parse(savedCameraState);
		camera.position.set(position[0], position[1], position[2]); // Restore position
		controls.target.set(target[0], target[1], target[2]);			 // Restore target
		controls.update(); // Update controls to apply the restored target
}

// WASD navigation for screen space panning
const panSpeed = 0.1;


// FIXME: WASD works but it is relative to the axes, not the camera direction
window.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "w": // Move up
            camera.position.y += panSpeed;
            controls.target.y += panSpeed;
            break;
        case "s": // Move down
            camera.position.y -= panSpeed;
            controls.target.y -= panSpeed;
            break;
        case "a": // Move left
            camera.position.x -= panSpeed;
            controls.target.x -= panSpeed;
            break;
        case "d": // Move right
            camera.position.x += panSpeed;
            controls.target.x += panSpeed;
            break;
    }
    controls.update();
});

const renderloop = () => {
	controls.update();
	renderer.render(scene, camera);
	window.requestAnimationFrame(renderloop);
};
renderloop();





