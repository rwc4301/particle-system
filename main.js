import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

// Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Particle System
const particleCount = 1000;
const particlesGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

const moveScale = 1/2;

// Create positions for a sphere
const radius = 5;
for (let i = 0; i < particleCount; i++) {
    const phi = Math.acos(2 * Math.random() - 1); // Angle from the positive z-axis
    const theta = Math.random() * Math.PI * 2;   // Angle in the xy-plane

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particlesMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.02,
});

const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particleSystem);

// Mouse Movement and Sphere Position
const mouse = new THREE.Vector2();
document.addEventListener('mousemove', (event) => {
    // Normalize mouse coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Invert the movement: move the sphere opposite to the mouse
    const invertX = -mouse.x * moveScale;
    const invertY = -mouse.y * moveScale;

    particleSystem.position.x = invertX;
    particleSystem.position.y = invertY;
});

// Postprocessing for Bloom Effect
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, // Bloom strength
    0.4, // Radius
    0.85 // Threshold
);
composer.addPass(bloomPass);

// Animation Loop
const animate = () => {
    requestAnimationFrame(animate);

    // Rotate the particle sphere for some dynamic visual effect
    particleSystem.rotation.y += 0.001;

    composer.render(scene, camera);
};

animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});