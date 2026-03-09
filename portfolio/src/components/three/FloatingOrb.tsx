/**
 * FloatingOrb — Interactive 3D sphere with distortion
 * Uses R3F + Drei for a reactive orb that follows mouse movement
 */

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

const Orb: React.FC = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const { viewport } = useThree();

    // Track mouse for subtle reactivity
    useFrame(({ pointer }) => {
        if (!meshRef.current) return;

        // Smooth follow mouse
        mouseRef.current.x += (pointer.x * 0.3 - mouseRef.current.x) * 0.05;
        mouseRef.current.y += (pointer.y * 0.3 - mouseRef.current.y) * 0.05;

        meshRef.current.rotation.x += 0.003;
        meshRef.current.rotation.y += 0.005;
        meshRef.current.position.x = mouseRef.current.x * viewport.width * 0.1;
        meshRef.current.position.y = mouseRef.current.y * viewport.height * 0.1;
    });

    const orbSize = Math.min(viewport.width, viewport.height) * 0.35;

    return (
        <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
            <mesh ref={meshRef} scale={orbSize}>
                <icosahedronGeometry args={[1, 8]} />
                <MeshDistortMaterial
                    color="#D2FF00"
                    emissive="#2d8a5e"
                    emissiveIntensity={0.3}
                    roughness={0.2}
                    metalness={0.8}
                    distort={0.35}
                    speed={2}
                    transparent
                    opacity={0.85}
                />
            </mesh>
        </Float>
    );
};

const Lights: React.FC = () => {
    return (
        <>
            <ambientLight intensity={0.15} />
            <pointLight position={[5, 5, 5]} intensity={1.2} color="#D2FF00" />
            <pointLight position={[-5, -3, 3]} intensity={0.5} color="#2d8a5e" />
            <pointLight position={[0, -5, -5]} intensity={0.3} color="#ffffff" />
        </>
    );
};

// Glow ring around the orb
const GlowRing: React.FC = () => {
    const ringRef = useRef<THREE.Mesh>(null);

    const glowMaterial = useMemo(() => {
        return new THREE.MeshBasicMaterial({
            color: new THREE.Color('#D2FF00'),
            transparent: true,
            opacity: 0.08,
            side: THREE.DoubleSide,
        });
    }, []);

    useFrame(() => {
        if (ringRef.current) {
            ringRef.current.rotation.z += 0.002;
        }
    });

    return (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.8, 0.02, 16, 100]} />
            <primitive object={glowMaterial} attach="material" />
        </mesh>
    );
};

export const FloatingOrb: React.FC = () => {
    return (
        <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 1.5]}
        >
            <Lights />
            <Orb />
            <GlowRing />
        </Canvas>
    );
};
