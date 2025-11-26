import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { items } from '/src/utils/itemData';

// Add this to top of your main.js to debug
// TODO: Remove later
console.log('Dialogue overlay:', document.getElementById('dialogue-overlay'));
console.log('Dialogue text:', document.getElementById('dialogue-text'));
console.log('Dialogue btn:', document.getElementById('dialogue-btn'));

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

// Load the corkboard
loader.load(
	'/models/decor/cork_board_base.glb',
	// onLoad
	function(glb) {
		const corkboard = glb.scene;

		corkboard.position.set(-0.5, 1.1, -1.3);
		corkboard.scale.set(0.2, 0.25, 0.25);
		corkboard.rotation.y = 1.55;
		

		scene.add(corkboard);

		console.log('Manual pager model loaded successfully');
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

// ========== LOAD ALL ITEMS FUNCTION ==========
const itemObjects = {}; // Store loaded item references by ID
const totalItems = items.length; // Track total items (should be 5 or 6)

function loadAllItems() {
	console.log('Items loaded:', items); // Debug

	if (!items) {
		console.error('Items is undefined! Check import.');
		return;
	}
	items.forEach(item => {
		loader.load(
			item.modelPath,
			function(glb) {
				const model = glb.scene;
				
				const box = new THREE.BoxHelper(model, 0xff0000); // Red outline
				scene.add(box);
				
				// Set position
				if (item.position) {
					model.position.set(item.position.x, item.position.y, item.position.z);
				}
				
				// Set scale
				if (item.scale) {
					if (typeof item.scale === 'number') {
						model.scale.setScalar(item.scale);
					} else {
						model.scale.set(item.scale.x, item.scale.y, item.scale.z);
					}
				}
				
				// Set name for raycasting
				model.name = item.id.toString();
				
				// Add shadows
				model.castShadow = true;
				model.receiveShadow = true;
				
				// Store reference
				itemObjects[item.id] = model;
				
				scene.add(model);

				console.log(`✅ Loaded: ${item.name}`);
			},
			function ( xhr ) {
				console.log( `Loading ${item.name}: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%` );
			},
			function ( error ) {
				console.error( `❌ Failed to load ${item.name}:`, error );
			}
		);
	});
}

loadAllItems();

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
// // TODO: remove before push to main
// // Save the camera state before the page reloads
// window.addEventListener("beforeunload", () => {
// 		const cameraState = {
// 				position: camera.position.toArray(), // Save position as an array [x, y, z]
// 				target: controls.target.toArray(),	// Save the OrbitControls target
// 		};
// 		localStorage.setItem("cameraState", JSON.stringify(cameraState));
// });
// // TODO: remove before push to main
// // Restore the camera state on page load
// const savedCameraState = localStorage.getItem("cameraState");
// if (savedCameraState) {
// 		const { position, target } = JSON.parse(savedCameraState);
// 		camera.position.set(position[0], position[1], position[2]); // Restore position
// 		controls.target.set(target[0], target[1], target[2]);			 // Restore target
// 		controls.update(); // Update controls to apply the restored target
// }

// WASD navigation for screen space panning
const panSpeed = 0.1;


// FIXME: WASD works but it is relative to the axes, not the camera direction
// window.addEventListener("keydown", (event) => {
// 	switch (event.key) {
// 		case "w": // Move up
// 			camera.position.y += panSpeed;
// 			controls.target.y += panSpeed;
// 			break;
// 		case "s": // Move down
// 			camera.position.y -= panSpeed;
// 			controls.target.y -= panSpeed;
// 			break;
// 		case "a": // Move left
// 			camera.position.x -= panSpeed;
// 			controls.target.x -= panSpeed;
// 			break;
// 		case "d": // Move right
// 			camera.position.x += panSpeed;
// 			controls.target.x += panSpeed;
// 			break;
// 	}
// 	controls.update();
// });

// ========== RAYCASTING SETUP ==========
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let foundItems = new Set();
let mapObject = null; // Store the entire map scene

// ========== MOUSE TRACKING ==========
document.addEventListener('mousemove', (event) => {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// ========== CLICK DETECTION (Updated for all items) ==========
document.addEventListener('click', () => {
	if (!controls.enabled) return;
	
	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(scene.children, true);
	
	if (intersects.length > 0) {
		let clickedItemId = null;
		
		// Find which item was clicked
		for (let i = 0; i < intersects.length; i++) {
			const obj = intersects[i].object;
			
			// Traverse up to find parent
			let parent = obj;
			while (parent.parent) {
				// Check if this parent is one of our items
				for (const [id, itemObj] of Object.entries(itemObjects)) {
					if (parent === itemObj) {
						clickedItemId = parseInt(id);
						break;
					}
				}
				if (clickedItemId) break;
				parent = parent.parent;
			}
			if (clickedItemId) break;
		}
		
		// If item clicked and not already found
		if (clickedItemId && !foundItems.has(clickedItemId)) {
			const itemData = items.find(item => item.id === clickedItemId);
			console.log(`✅ Clicked: ${itemData.name}`);
			foundItems.add(clickedItemId);
			selectItem(itemData, intersects[0].object);
		}
	}
});

// ========== ITEM SELECTION & ANIMATION ==========
function selectItem(itemData, clickedMesh) {
	controls.enabled = false;
	
	// Get the root object (the model itself)
	let rootObject = clickedMesh;
	while (rootObject.parent && rootObject.parent !== scene) {
		rootObject = rootObject.parent;
	}
	
	const originalPos = rootObject.position.clone();
	const originalScale = rootObject.scale.clone();
	const duration = 1.5;
	const startTime = Date.now();
	
	const animateItem = () => {
		const elapsed = (Date.now() - startTime) / 1000;
		const progress = Math.min(elapsed / duration, 1);
		
		// Scale up
		rootObject.scale.copy(originalScale).multiplyScalar(1 + progress * 0.5);
		
		// Move to center
		const targetPos = new THREE.Vector3(0, 1.5, -2);
		rootObject.position.lerp(targetPos, progress * 0.6);
		
		// Glow effect
		rootObject.traverse(child => {
			if (child.isMesh && child.material) {
				child.material.emissive.setHex(0xffaa00);
				child.material.emissiveIntensity = progress * 0.8;
			}
		});
		
		if (progress < 1) {
			requestAnimationFrame(animateItem);
		} else {
			showDialogue(itemData, rootObject, originalPos, originalScale);
		}
	};
	
	animateItem();
}

// ========== DIALOGUE OVERLAY ==========
function showDialogue(itemData, rootObject, originalPos, originalScale) {
	const overlay = document.getElementById('dialogue-overlay');
	const text = document.getElementById('dialogue-text');
	const btn = document.getElementById('dialogue-btn');
	
	console.log('Showing dialogue:', itemData.dialogue); // Debug
	
	if (!overlay || !text || !btn) {
		console.error('Dialogue elements not found!');
		controls.enabled = true;
		return;
	}
	
	text.textContent = itemData.dialogue;
	overlay.classList.remove('hidden');
	
	btn.onclick = () => {
		console.log('Continue clicked'); // Debug
		overlay.classList.add('hidden');
		
		// Reset item
		rootObject.position.copy(originalPos);
		rootObject.scale.copy(originalScale);
		rootObject.traverse(child => {
			if (child.isMesh && child.material) {
				child.material.emissive.setHex(0x000000);
				child.material.emissiveIntensity = 0;
			}
		});
		
		// Re-enable controls
		controls.enabled = true;
		console.log('Controls re-enabled'); // Debug
		
		// Update counter
		updateCounter();
	};
}

// ========== UPDATE COUNTER ==========
function updateCounter() {
	const count = document.getElementById('found-count');
	const progressFill = document.getElementById('progress-fill');
	if (count) {
		count.textContent = foundItems.size;
		const percentage = (foundItems.size / totalItems) * 100;
		if (progressFill) {
			progressFill.style.width = percentage + '%';
		}
	}
	console.log(`Counter: ${foundItems.size}/${totalItems}`);
}

document.getElementById('total-items').textContent = totalItems;

const renderloop = () => {
	controls.update();
	renderer.render(scene, camera);
	window.requestAnimationFrame(renderloop);
};
renderloop();