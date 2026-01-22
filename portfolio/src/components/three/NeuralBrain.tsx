/**
 * Neural Brain - AI Neural Network Visualization
 * Creates a brain-like structure with neurons (nodes) and synapses (connections)
 * Tech stack orbits around with hover tooltips
 */

import React, { useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Tech stack data with descriptions
const techStack = [
    {
        name: 'Python',
        position: [3.2, 1.5, 0.5] as [number, number, number],
        color: '#3776ab',
        description: 'Lenguaje principal para backend, IA y automatización'
    },
    {
        name: 'LLMs',
        position: [2.8, -1.2, 0.8] as [number, number, number],
        color: '#00a67e',
        description: 'OpenAI, Anthropic, Gemini, Meta, Hugging Face (Open Source)'
    },
    {
        name: 'Azure',
        position: [-3.2, 1.3, 0.5] as [number, number, number],
        color: '#0078d4',
        description: 'Azure OpenAI, AI Foundry, servicios cloud enterprise'
    },
    {
        name: 'FastAPI',
        position: [-2.8, -1.5, 0.8] as [number, number, number],
        color: '#009688',
        description: 'APIs RESTful de alto rendimiento con Python'
    },
    {
        name: 'React',
        position: [2.5, 0.3, -1.5] as [number, number, number],
        color: '#61dafb',
        description: 'Interfaces de usuario modernas y reactivas'
    },
    {
        name: 'RAG',
        position: [-2.5, 2.2, -0.5] as [number, number, number],
        color: '#2d8a5e',
        description: 'Retrieval Augmented Generation con embeddings'
    },
    {
        name: 'Data Science',
        position: [0, -2.8, 0.8] as [number, number, number],
        color: '#e97627',
        description: 'Machine Learning, Deep Learning, análisis de datos'
    },
    {
        name: 'Multi-Agent',
        position: [0, 2.8, 0.8] as [number, number, number],
        color: '#ff6b6b',
        description: 'Orquestación de sistemas multi-agentes'
    },
];

// Generate neural network nodes (neurons) in a brain shape
function generateNeurons(count: number, radius: number): THREE.Vector3[] {
    const neurons: THREE.Vector3[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = goldenAngle * i;

        // Add slight randomness for organic look
        const jitter = 0.15;
        const x = radiusAtY * Math.cos(theta) * radius + (Math.random() - 0.5) * jitter;
        const z = radiusAtY * Math.sin(theta) * radius + (Math.random() - 0.5) * jitter;
        const finalY = y * radius + (Math.random() - 0.5) * jitter;

        neurons.push(new THREE.Vector3(x, finalY, z));
    }

    return neurons;
}

// Generate synapses (connections) between nearby neurons
function generateSynapses(neurons: THREE.Vector3[], maxDistance: number): [number, number][] {
    const synapses: [number, number][] = [];

    for (let i = 0; i < neurons.length; i++) {
        for (let j = i + 1; j < neurons.length; j++) {
            const distance = neurons[i].distanceTo(neurons[j]);
            if (distance < maxDistance && Math.random() > 0.6) {
                synapses.push([i, j]);
            }
        }
    }

    return synapses;
}

// Neural network brain core
function NeuralCore() {
    const groupRef = useRef<THREE.Group>(null);
    const [neurons] = useState(() => generateNeurons(80, 1.2));
    const [synapses] = useState(() => generateSynapses(neurons, 0.7));

    // Create geometry for synapses
    const synapsesGeometry = useMemo(() => {
        const positions: number[] = [];
        synapses.forEach(([a, b]) => {
            positions.push(neurons[a].x, neurons[a].y, neurons[a].z);
            positions.push(neurons[b].x, neurons[b].y, neurons[b].z);
        });
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        return geometry;
    }, [neurons, synapses]);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Neurons (nodes) */}
            {neurons.map((pos, i) => (
                <Sphere key={i} args={[0.04, 12, 12]} position={pos.toArray()}>
                    <meshStandardMaterial
                        color="#2d8a5e"
                        emissive="#2d8a5e"
                        emissiveIntensity={0.4}
                    />
                </Sphere>
            ))}

            {/* Synapses (connections) */}
            <lineSegments geometry={synapsesGeometry}>
                <lineBasicMaterial color="#2d8a5e" transparent opacity={0.25} />
            </lineSegments>

            {/* Core glow */}
            <Sphere args={[0.5, 32, 32]}>
                <meshBasicMaterial color="#1a4a32" transparent opacity={0.3} />
            </Sphere>
        </group>
    );
}

// Pulsing signal traveling along connections
function NeuralSignal({
    start,
    end,
    color,
    delay
}: {
    start: THREE.Vector3;
    end: THREE.Vector3;
    color: string;
    delay: number;
}) {
    const signalRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (signalRef.current) {
            const t = ((state.clock.elapsedTime * 0.4 + delay) % 2) / 2;
            signalRef.current.position.lerpVectors(start, end, t);
            const scale = Math.sin(t * Math.PI) * 0.6 + 0.4;
            signalRef.current.scale.setScalar(scale * 0.08);
        }
    });

    return (
        <mesh ref={signalRef}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshBasicMaterial color={color} transparent opacity={0.9} />
        </mesh>
    );
}

// Tech node with hover tooltip
function TechNode({
    name,
    position,
    color,
    description,
    onHover
}: {
    name: string;
    position: [number, number, number];
    color: string;
    description: string;
    onHover: (hovered: boolean, name: string, description: string, color: string) => void;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);
    const initialY = position[1];

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y = initialY + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.08;
        }
    });

    const handlePointerEnter = useCallback(() => {
        setHovered(true);
        onHover(true, name, description, color);
        document.body.style.cursor = 'pointer';
    }, [name, description, color, onHover]);

    const handlePointerLeave = useCallback(() => {
        setHovered(false);
        onHover(false, '', '', '');
        document.body.style.cursor = 'default';
    }, [onHover]);

    return (
        <group
            ref={groupRef}
            position={position}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
        >
            {/* Main orb */}
            <Sphere args={[hovered ? 0.28 : 0.22, 32, 32]}>
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={hovered ? 0.8 : 0.5}
                    roughness={0.2}
                    metalness={0.8}
                />
            </Sphere>

            {/* Glow ring on hover */}
            {hovered && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.32, 0.38, 32]} />
                    <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
                </mesh>
            )}

            {/* Connection to brain */}
            <NeuralSignal
                start={new THREE.Vector3(0, 0, 0)}
                end={new THREE.Vector3(-position[0], -position[1], -position[2]).normalize().multiplyScalar(0.8)}
                color={color}
                delay={position[0]}
            />
        </group>
    );
}

// Connection line between brain and tech node
function Connection({
    end,
    color
}: {
    end: [number, number, number];
    color: string;
}) {
    const lineGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        geometry.setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(...end)
        ]);
        return geometry;
    }, [end]);

    const lineMaterial = useMemo(() => (
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.2 })
    ), [color]);

    return <primitive object={new THREE.Line(lineGeometry, lineMaterial)} />;
}

// Particle field
function Particles() {
    const particlesRef = useRef<THREE.Points>(null);
    const count = 150;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i += 3) {
            pos[i] = (Math.random() - 0.5) * 18;
            pos[i + 1] = (Math.random() - 0.5) * 18;
            pos[i + 2] = (Math.random() - 0.5) * 18;
        }
        return pos;
    }, []);

    useFrame((state) => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y = state.clock.elapsedTime * 0.01;
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.03} color="#2d8a5e" transparent opacity={0.4} sizeAttenuation />
        </points>
    );
}

// Tooltip overlay component
function Tooltip({
    visible,
    name,
    description,
    color
}: {
    visible: boolean;
    name: string;
    description: string;
    color: string;
}) {
    if (!visible) return null;

    return (
        <div
            style={{
                position: 'absolute',
                bottom: '80px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(10, 20, 15, 0.95)',
                border: `1px solid ${color}`,
                borderRadius: '12px',
                padding: '16px 24px',
                color: '#fff',
                textAlign: 'center',
                pointerEvents: 'none',
                zIndex: 100,
                animation: 'fadeIn 0.2s ease-out',
                maxWidth: '300px'
            }}
        >
            <div style={{
                fontWeight: 700,
                fontSize: '18px',
                color: color,
                marginBottom: '4px'
            }}>
                {name}
            </div>
            <div style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.4
            }}>
                {description}
            </div>
        </div>
    );
}

export const NeuralBrain: React.FC = () => {
    const [hoveredTech, setHoveredTech] = useState<{
        visible: boolean;
        name: string;
        description: string;
        color: string;
    }>({ visible: false, name: '', description: '', color: '' });

    const handleTechHover = useCallback((
        hovered: boolean,
        name: string,
        description: string,
        color: string
    ) => {
        setHoveredTech({ visible: hovered, name, description, color });
    }, []);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Canvas
                camera={{ position: [0, 0, 7], fov: 50 }}
                style={{ background: 'transparent' }}
                gl={{ antialias: true, alpha: true }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={0.7} />
                <pointLight position={[-5, -5, 5]} intensity={0.4} color="#2d8a5e" />
                <pointLight position={[0, 0, 4]} intensity={0.3} color="#3da873" />

                {/* Central neural network */}
                <NeuralCore />

                {/* Tech nodes with connections */}
                {techStack.map((tech) => (
                    <React.Fragment key={tech.name}>
                        <Connection end={tech.position} color={tech.color} />
                        <TechNode
                            name={tech.name}
                            position={tech.position}
                            color={tech.color}
                            description={tech.description}
                            onHover={handleTechHover}
                        />
                    </React.Fragment>
                ))}

                {/* Background particles */}
                <Particles />
            </Canvas>

            {/* Tooltip overlay */}
            <Tooltip {...hoveredTech} />
        </div>
    );
};
