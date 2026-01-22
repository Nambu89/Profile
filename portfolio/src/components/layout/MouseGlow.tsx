/**
 * Mouse Glow Component - Following cursor glow effect like Brittany Chiang
 */

import React from 'react';
import { useMousePosition } from '../../hooks';
import './MouseGlow.css';

export const MouseGlow: React.FC = () => {
    const { x, y } = useMousePosition();

    return (
        <div
            className="mouse-glow"
            style={{
                background: `radial-gradient(600px at ${x}px ${y}px, rgba(45, 138, 94, 0.15), transparent 80%)`
            }}
        />
    );
};
