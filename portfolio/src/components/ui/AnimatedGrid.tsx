/**
 * AnimatedGrid - Modern animated grid background
 */

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './AnimatedGrid.css';

export const AnimatedGrid: React.FC = () => {
    const gridRef = useRef<HTMLDivElement>(null);
    const orbs = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        if (!gridRef.current) return;

        // Animate gradient orbs
        orbs.current.forEach((orb, index) => {
            if (!orb) return;

            gsap.to(orb, {
                x: `random(-50, 50)`,
                y: `random(-50, 50)`,
                scale: `random(0.8, 1.2)`,
                duration: `random(8, 12)`,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: index * 0.5,
            });
        });

        // Grid pulse animation
        gsap.to('.grid-line', {
            opacity: `random(0.1, 0.3)`,
            duration: 2,
            repeat: -1,
            yoyo: true,
            stagger: {
                each: 0.1,
                from: 'random',
            },
            ease: 'sine.inOut',
        });
    }, []);

    return (
        <div ref={gridRef} className="animated-grid">
            {/* Grid Lines */}
            <div className="grid-container">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={`h-${i}`} className="grid-line grid-line--horizontal" style={{ top: `${i * 5}%` }} />
                ))}
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={`v-${i}`} className="grid-line grid-line--vertical" style={{ left: `${i * 5}%` }} />
                ))}
            </div>

            {/* Gradient Orbs */}
            <div className="orb orb--1" ref={el => { if (el) orbs.current[0] = el; }} />
            <div className="orb orb--2" ref={el => { if (el) orbs.current[1] = el; }} />
            <div className="orb orb--3" ref={el => { if (el) orbs.current[2] = el; }} />

            {/* Vignette overlay */}
            <div className="grid-vignette" />
        </div>
    );
};
