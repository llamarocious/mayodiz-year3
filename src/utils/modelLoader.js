import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

export function loadModel(path) {
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        console.log(`✅ Loaded: ${path}`);
        resolve(gltf);
      },
      (progress) => {
        console.log(`Loading ${path}: ${(progress.loaded / progress.total * 100).toFixed(0)}%`);
      },
      (error) => {
        console.error(`❌ Failed to load ${path}:`, error);
        reject(error);
      }
    );
  });
}