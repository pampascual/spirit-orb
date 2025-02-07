import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { vertexShader, fragmentShader } from './shader.js';

export function createNebulaCloud(count, radius, color, size) {
    const particles = new Float32Array(count * 5);
    const velocities = new Float32Array(count * 5);
    const originalPositions = new Float32Array(count * 5);

    // Create clusters of particles
    for (let i = 0; i < count; i++) {
        const clusterCenter = new THREE.Vector3(
            (Math.random() - 0.5) * radius * .25,
            (Math.random() - 0.5) * radius * 0.5,
            (Math.random() - 0.5) * radius * 0.25
        );

        const offset = new THREE.Vector3(
            (Math.random() - 0.5) * radius * .5,
            (Math.random() - 0.5) * radius * .5,
            (Math.random() - 0.5) * radius * .5
        );

        const position = clusterCenter.add(offset);

        const i3 = i * 3;
        particles[i3] = position.x;
        particles[i3 + 1] = position.y;
        particles[i3 + 2] = position.z;

        originalPositions[i3] = position.x;
        originalPositions[i3 + 1] = position.y;
        originalPositions[i3 + 2] = position.z;

        velocities[i3] = (Math.random() - 0.5) * 0.002;
        velocities[i3 + 3] = (Math.random() - 0.5) * 0.002;
        velocities[i3 + 6] = (Math.random() - 0.5) * 0.002;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(particles, 3));

    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            audioFreq: { value: 0 },
            color: { value: new THREE.Color(color) },
            pointSize: { value: size }
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const system = {
        mesh: new THREE.Points(geometry, material),
        velocities: velocities,
        originalPositions: originalPositions
    };

    return system;
}

export function updateParticleSystems(system, time, audioFreq) {
    const positions = system.mesh.geometry.attributes.position.array;
    const velocities = system.velocities;
    const originalPositions = system.originalPositions;

    for (let i = 0; i < positions.length; i += 3) {
        // Enhanced turbulent motion with more dynamic movement
        positions[i] += (velocities[i] + Math.sin(time + positions[i]) * 0.002) * (1 + audioFreq * 0.05);
        positions[i + 1] += (velocities[i + 1] + Math.cos(time + positions[i + 1]) * 0.002) * (1 + audioFreq * 0.05);
        positions[i + 2] += (velocities[i + 2] + Math.sin(time * 2 + positions[i + 2]) * 0.002) * (1 + audioFreq * 0.5);

        // Slightly update velocities for more organic movement
        velocities[i] += (Math.random() - 0.5) * 0.0001;
        velocities[i + 1] += (Math.random() - 0.5) * 0.0001;
        velocities[i + 2] += (Math.random() - 0.5) * 0.0001;

        // Return to original position
        const dx = originalPositions[i] - positions[i];
        const dy = originalPositions[i + 1] - positions[i + 1];
        const dz = originalPositions[i + 2] - positions[i + 2];

        positions[i] += dx * 0.03;
        positions[i + 1] += dy * 0.03;
        positions[i + 2] += dz * 0.03;

        // Add slight damping to velocities
        velocities[i] *= 0.98;
        velocities[i + 1] *= 0.98;
        velocities[i + 2] *= 0.98;
    }

    system.mesh.geometry.attributes.position.needsUpdate = true;
    system.mesh.material.uniforms.time.value = time;
    system.mesh.material.uniforms.audioFreq.value = audioFreq;
}