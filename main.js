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
const particleCount = 2500; // Increased for better resolution
const particlesGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

const radius = 5;
let index = 0;

// Create latitude lines
for (let lat = -90; lat <= 90; lat += 5) {
    const phi = (90 - lat) * (Math.PI / 180);
    const latParticles = 50; // Number of particles per latitude line
    
    for (let i = 0; i < latParticles; i++) {
        const theta = (i / latParticles) * Math.PI * 2;
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        if (index < particleCount) {
            positions[index * 3] = x;
            positions[index * 3 + 1] = y;
            positions[index * 3 + 2] = z;
            index++;
        }
    }
}

// Create longitude lines
for (let lng = 0; lng < 360; lng += 15) {
    const theta = lng * (Math.PI / 180);
    const lngParticles = 50; // Number of particles per longitude line
    
    for (let i = 0; i < lngParticles; i++) {
        const phi = (i / lngParticles) * Math.PI;
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        if (index < particleCount) {
            positions[index * 3] = x;
            positions[index * 3 + 1] = y;
            positions[index * 3 + 2] = z;
            index++;
        }
    }
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particlesMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.05,
    transparent: true,
    opacity: 0.8
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
    1.0, // Reduced bloom strength
    0.5, // Slightly increased radius
    0.2  // Lower threshold for more visible lines
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