/**
 * Floating Orb - 3D animated sphere for Hero section
 * Uses React Three Fiber for Three.js integration
 */

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedOrb() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
        }
    });

    return (
        <Sphere ref={meshRef} args={[1, 100, 100]} scale={2.5}>
            <MeshDistortMaterial
                color="#2d8a5e"
                attach="material"
                distort={0.4}
                speed={2}
                roughness={0.2}
                metalness={0.8}
            />
        </Sphere>
    );
}

function ParticleField() {
    const particlesRef = useRef<THREE.Points>(null);
    const particlesCount = 500;

    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 10;
        positions[i + 1] = (Math.random() - 0.5) * 10;
        positions[i + 2] = (Math.random() - 0.5) * 10;
    }

    useFrame((state) => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particlesCount}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.02}
                color="#3da873"
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

export const FloatingOrb: React.FC = () => {
    return (
        <Canvas
            camera={{ position: [0, 0, 5], fov: 75 }}
            style={{ background: 'transparent' }}
        >
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <pointLight position={[-10, -10, -5]} intensity={0.5} color="#2d8a5e" />
            <AnimatedOrb />
            <ParticleField />
        </Canvas>
    );
};
