/**
 * ScrollProgress - Animated scroll progress indicator
 * Shows progress bar at top of page using GSAP
 */

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollProgress.css';

gsap.registerPlugin(ScrollTrigger);

export const ScrollProgress: React.FC = () => {
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const progress = progressRef.current;
        if (!progress) return;

        // Create scroll-triggered animation
        gsap.to(progress, {
            width: '100%',
            ease: 'none',
            scrollTrigger: {
                trigger: document.body,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.3,
            }
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <div className="scroll-progress">
            <div ref={progressRef} className="scroll-progress__bar" />
        </div>
    );
};
