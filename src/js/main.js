import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { createNebulaCloud, updateParticleSystems } from './particle/system.js';
import { AudioHandler } from './audio/handler.js';
import { WhisperTranscriber } from './audio/whisper.js';
import { OllamaInterface } from './llm/ollama.js';

let scene, camera, renderer;
let particleSystems = [];
let time = 0;
let audioHandler;
let whisper;
let ollama;
let isListening = false;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create multiple particle systems for layered effect
    particleSystems.push(createNebulaCloud(3000, 1.0, '#00ff80', 4.0));  // Green particles
    particleSystems.push(createNebulaCloud(2000, 1.8, '#00ffff', 5.0));  // Cyan particles
    particleSystems.push(createNebulaCloud(2500, 1.6, '#ffffff', 4.0));   // Core particles

    // Add each particle system to the scene
    particleSystems.forEach(system => {
        scene.add(system.mesh);
    });

    camera.position.z = 1.5;

    // Initialize Whisper and Ollama
    whisper = new WhisperTranscriber();
    ollama = new OllamaInterface();
    whisper.init();

    // Initialize audio handler with transcription callback
    audioHandler = new AudioHandler(handleAudioRecording);

    // Add spacebar listeners
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !isListening) {
            startListening();
            // Visual feedback when listening
            particleSystems.forEach(system => {
                system.mesh.material.uniforms.audioFreq.value = 0.2;
            });
            document.getElementById('info').textContent = 'Listening...';
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === 'Space' && isListening) {
            stopListening();
            document.getElementById('info').textContent = 'Processing...';
        }
    });
}

async function handleAudioRecording(audioBlob) {
    const transcript = await whisper.transcribe(audioBlob);
    if (transcript) {
        // Show user's speech
        document.getElementById('user-text').textContent = 'You: ' + transcript;
        console.log('You said:', transcript);
        
        // Calm orb while processing
        particleSystems.forEach(system => {
            system.mesh.material.uniforms.audioFreq.value = 0.1;
        });

        const response = await ollama.chat(transcript);
        if (response) {
            // Show spirit's response
            document.getElementById('spirit-text').textContent = 'Spirit: ' + response;
            console.log('Spirit says:', response);
            speakResponse(response);
        }
    }
}

function startListening() {
    isListening = true;
    audioHandler.startRecording();
    document.getElementById('info').textContent = 'Listening...';
}

function stopListening() {
    isListening = false;
    audioHandler.stopRecording();
    document.getElementById('info').textContent = 'Processing...';
}

function speakResponse(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;  // Speech speed
    utterance.pitch = 1.0; // Voice pitch

    // Start speaking animation
    let speakingInterval;
    utterance.onstart = () => {
        speakingInterval = setInterval(() => {
            // Create pulsing effect while speaking
            const pulseValue = (Math.sin(Date.now() * 0.005) + 1) * 0.5;
            particleSystems.forEach(system => {
                system.mesh.material.uniforms.audioFreq.value = 0.3 + pulseValue * 0.2;
            });
        }, 16);
    };

    utterance.onend = () => {
        clearInterval(speakingInterval);
        // Return to idle state
        particleSystems.forEach(system => {
            system.mesh.material.uniforms.audioFreq.value = 0.1;
        });
        document.getElementById('info').textContent = 'Speak to interact with the spirit...';
    };

    speechSynthesis.speak(utterance);
}

function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    
    const currentTime = Date.now() * 0.003;
    const audioFreq = audioHandler.isActive ? audioHandler.update() : Math.sin(time * 0.5) * 0.1 + 0.1;

    particleSystems.forEach(system => {
        updateParticleSystems(system, currentTime, audioFreq);
    });

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

document.addEventListener('click', () => {
    if (!audioHandler.isActive) {
        audioHandler.setup();
    }
});

init();
animate();