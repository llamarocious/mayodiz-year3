import { items } from './utils/itemData.js';

// Load all items from the items array
items.forEach((item) => {
		loader.load(
				item.modelPath,
				function(glb) {
						const model = glb.scene;
						
						// Apply position and scale from the item data
						if (item.position) {
								model.position.set(item.position.x, item.position.y, item.position.z);
						}
						if (item.scale) {
								model.scale.set(item.scale, item.scale, item.scale);
						}
						
						// Store the item data on the model for later reference
						model.userData.itemId = item.id;
						model.userData.itemName = item.name;
						model.userData.dialogue = item.dialogue;
						
						scene.add(model);
						console.log(`${item.name} loaded successfully`);
				},
				function (xhr) {
						console.log((xhr.loaded / xhr.total * 100) + '% loaded');
				},
				function (error) {
						console.error(`An error happened while loading ${item.name}:`, error);
				}
		);
});

// Raycaster for hover detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredObject = null;

// Store all loaded items for raycasting
const loadedItems = [];

// Update the forEach loop to push items to the array:
items.forEach((item) => {
    loader.load(
        item.modelPath,
        function(glb) {
            const model = glb.scene;
            
            if (item.position) {
                model.position.set(item.position.x, item.position.y, item.position.z);
            }
            if (item.scale) {
                model.scale.set(item.scale, item.scale, item.scale);
            }
            
            model.userData.itemId = item.id;
            model.userData.itemName = item.name;
            model.userData.dialogue = item.dialogue;
            
            scene.add(model);
            loadedItems.push(model); // Add to array for raycasting
            console.log(`${item.name} loaded successfully`);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error(`An error happened while loading ${item.name}:`, error);
        }
    );
});

// Mouse move listener for hover detection
window.addEventListener("mousemove", (event) => {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(loadedItems, true);
    
    // Remove glow from previously hovered object
    if (hoveredObject) {
        hoveredObject.traverse((child) => {
            if (child.isMesh) {
                child.material.emissive.setHex(0x000000); // Remove glow
                child.material.emissiveIntensity = 0;
            }
        });
    }
    
    // Add glow to newly hovered object
    if (intersects.length > 0) {
        hoveredObject = intersects[0].object.parent || intersects[0].object;
        hoveredObject.traverse((child) => {
            if (child.isMesh) {
                child.material.emissive.setHex(0x00ff00); // Green glow
                child.material.emissiveIntensity = 0.5; // Adjust intensity
            }
        });
        console.log(`Hovering over: ${hoveredObject.userData.itemName}`);
    } else {
        hoveredObject = null;
    }
});

console.log('All items:', items);
console.log('First item name:', items[0].name);
console.log('First item dialogue:', items[0].dialogue);