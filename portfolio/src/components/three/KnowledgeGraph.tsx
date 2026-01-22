/**
 * Knowledge Graph - Semantic Network Visualization
 * Shows tech stack nodes connected by similarity scores
 * Optimized as subtle background layer
 */

import React, { useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line, Text } from '@react-three/drei';
import * as THREE from 'three';

// Detect mobile for performance
const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth < 768;
};

// Tech stack nodes with semantic positions
const techNodes = [
    { id: 'python', name: 'Python', position: [0, 2, 0] as [number, number, number], color: '#3776ab', size: 0.3 },
    { id: 'fastapi', name: 'FastAPI', position: [-2, 1, 0] as [number, number, number], color: '#009688', size: 0.25 },
    { id: 'react', name: 'React', position: [2, 1, 0] as [number, number, number], color: '#61dafb', size: 0.25 },
    { id: 'rag', name: 'RAG', position: [0, 0, 1.5] as [number, number, number], color: '#2d8a5e', size: 0.28 },
    { id: 'llms', name: 'LLMs', position: [-1.5, -0.5, 0] as [number, number, number], color: '#00a67e', size: 0.26 },
    { id: 'azure', name: 'Azure', position: [1.5, -0.5, 0] as [number, number, number], color: '#0078d4', size: 0.24 },
    { id: 'multiagent', name: 'Multi-Agent', position: [0, -1.5, 0] as [number, number, number], color: '#ff6b6b', size: 0.27 },
    { id: 'embeddings', name: 'Embeddings', position: [0, 0, -1.5] as [number, number, number], color: '#D2FF00', size: 0.23 },
];

// Semantic connections with similarity scores
const connections = [
    { from: 'python', to: 'fastapi', score: 0.94 },
    { from: 'python', to: 'llms', score: 0.89 },
    { from: 'fastapi', to: 'rag', score: 0.82 },
    { from: 'react', to: 'fastapi', score: 0.76 },
    { from: 'rag', to: 'llms', score: 0.91 },
    { from: 'rag', to: 'embeddings', score: 0.88 },
    { from: 'llms', to: 'azure', score: 0.85 },
    { from: 'llms', to: 'multiagent', score: 0.87 },
    { from: 'multiagent', to: 'rag', score: 0.83 },
    { from: 'embeddings', to: 'llms', score: 0.86 },
];

// Tech Node Component
function TechNode({
    node,
    onHover
}: {
    node: typeof techNodes[0];
    onHover: (hovered: boolean, name: string) => void;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (meshRef.current && hovered) {
            meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
        } else if (meshRef.current) {
            meshRef.current.scale.setScalar(1);
        }
    });

    return (
        <group position={node.position}>
            <Sphere
                ref={meshRef}
                args={[node.size, 16, 16]}
                onPointerOver={() => {
                    setHovered(true);
                    onHover(true, node.name);
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                    setHovered(false);
                    onHover(false, '');
                    document.body.style.cursor = 'auto';
                }}
            >
                <meshStandardMaterial
                    color={node.color}
                    emissive={node.color}
                    emissiveIntensity={hovered ? 0.8 : 0.3}
                    transparent
                    opacity={0.8}
                />
            </Sphere>

            {/* Glow ring on hover */}
            {hovered && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[node.size + 0.05, node.size + 0.15, 32]} />
                    <meshBasicMaterial color={node.color} transparent opacity={0.4} />
                </mesh>
            )}
        </group>
    );
}

// Connection Line with Score
function ConnectionLine({ from, to, score }: { from: [number, number, number]; to: [number, number, number]; score: number }) {
    const points = useMemo(() => [
        new THREE.Vector3(...from),
        new THREE.Vector3(...to)
    ], [from, to]);

    const midPoint = useMemo(() => {
        return new THREE.Vector3(
            (from[0] + to[0]) / 2,
            (from[1] + to[1]) / 2,
            (from[2] + to[2]) / 2
        );
    }, [from, to]);

    // Calculate opacity based on score (higher score = more visible)
    const opacity = 0.15 + (score - 0.75) * 0.4;

    return (
        <group>
            <Line
                points={points}
                color="#2d8a5e"
                lineWidth={1}
                transparent
                opacity={opacity}
            />

            {/* Score label (subtle) */}
            <Text
                position={[midPoint.x, midPoint.y, midPoint.z]}
                fontSize={0.12}
                color="#D2FF00"
                anchorX="center"
                anchorY="middle"
                transparent
                opacity={0.4}
            >
                {score.toFixed(2)}
            </Text>
        </group>
    );
}

// Main Graph Scene
function GraphScene({ onNodeHover }: { onNodeHover: (hovered: boolean, name: string) => void }) {
    const groupRef = useRef<THREE.Group>(null);
    const isMobile = useMemo(() => isMobileDevice(), []);

    // Slow auto-rotation
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.3;
            groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.15) * 0.1;
        }
    });

    // Filter nodes on mobile
    const visibleNodes = isMobile ? techNodes.slice(0, 5) : techNodes;
    const visibleConnections = isMobile ? connections.slice(0, 6) : connections;

    return (
        <group ref={groupRef}>
            {/* Connections */}
            {visibleConnections.map((conn, i) => {
                const fromNode = techNodes.find(n => n.id === conn.from);
                const toNode = techNodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return null;

                return (
                    <ConnectionLine
                        key={i}
                        from={fromNode.position}
                        to={toNode.position}
                        score={conn.score}
                    />
                );
            })}

            {/* Nodes */}
            {visibleNodes.map((node) => (
                <TechNode key={node.id} node={node} onHover={onNodeHover} />
            ))}

            {/* Ambient particles */}
            <Particles count={isMobile ? 30 : 80} />
        </group>
    );
}

// Background particles
function Particles({ count }: { count: number }) {
    const particlesRef = useRef<THREE.Points>(null);

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i += 3) {
            pos[i] = (Math.random() - 0.5) * 12;
            pos[i + 1] = (Math.random() - 0.5) * 12;
            pos[i + 2] = (Math.random() - 0.5) * 12;
        }
        return pos;
    }, [count]);

    useFrame((state) => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.02} color="#2d8a5e" transparent opacity={0.3} sizeAttenuation />
        </points>
    );
}

// Tooltip component
function Tooltip({ visible, name }: { visible: boolean; name: string }) {
    if (!visible) return null;

    return (
        <div
            style={{
                position: 'absolute',
                bottom: '100px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(10, 20, 15, 0.9)',
                border: '1px solid #2d8a5e',
                borderRadius: '8px',
                padding: '8px 16px',
                color: '#D2FF00',
                fontSize: '14px',
                fontWeight: 600,
                pointerEvents: 'none',
                zIndex: 100,
                backdropFilter: 'blur(10px)',
                animation: 'fadeIn 0.2s ease-out'
            }}
        >
            {name}
        </div>
    );
}

export const KnowledgeGraph: React.FC = () => {
    const [hoveredNode, setHoveredNode] = useState({ visible: false, name: '' });
    const isMobile = useMemo(() => isMobileDevice(), []);

    const handleNodeHover = useCallback((hovered: boolean, name: string) => {
        setHoveredNode({ visible: hovered, name });
    }, []);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Canvas
                camera={{ position: [0, 0, 8], fov: 45 }}
                style={{ background: 'transparent' }}
                gl={{
                    antialias: !isMobile,
                    alpha: true,
                    powerPreference: 'high-performance'
                }}
                dpr={isMobile ? [1, 1.5] : [1, 2]}
            >
                <ambientLight intensity={0.4} />
                <pointLight position={[5, 5, 5]} intensity={0.3} color="#2d8a5e" />
                <pointLight position={[-5, -5, 5]} intensity={0.2} color="#D2FF00" />

                <GraphScene onNodeHover={handleNodeHover} />
            </Canvas>

            <Tooltip {...hoveredNode} />
        </div>
    );
};
