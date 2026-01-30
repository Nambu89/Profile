/**
 * HoverCard - Card with magnetic hover effect and smooth animations
 * Uses GSAP for advanced interactions
 */

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import './HoverCard.css';

interface HoverCardProps {
    children: React.ReactNode;
    className?: string;
    intensity?: number; // 0-1, default 0.3
}

export const HoverCard: React.FC<HoverCardProps> = ({
    children,
    className = '',
    intensity = 0.3
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const card = cardRef.current;
        const glow = glowRef.current;
        if (!card || !glow) return;

        let xTo: gsap.QuickToFunc;
        let yTo: gsap.QuickToFunc;
        let glowXTo: gsap.QuickToFunc;
        let glowYTo: gsap.QuickToFunc;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate rotation and translation
            const rotateX = ((y - centerY) / centerY) * -5 * intensity;
            const rotateY = ((x - centerX) / centerX) * 5 * intensity;
            const translateX = ((x - centerX) / centerX) * 10 * intensity;
            const translateY = ((y - centerY) / centerY) * 10 * intensity;

            // Initialize quickTo if not already done
            if (!xTo) {
                xTo = gsap.quickTo(card, 'x', { duration: 0.6, ease: 'power3.out' });
                yTo = gsap.quickTo(card, 'y', { duration: 0.6, ease: 'power3.out' });
            }

            xTo(translateX);
            yTo(translateY);

            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 0.6,
                ease: 'power3.out'
            });

            // Move glow to mouse position
            if (!glowXTo) {
                glowXTo = gsap.quickTo(glow, 'x', { duration: 0.4, ease: 'power3.out' });
                glowYTo = gsap.quickTo(glow, 'y', { duration: 0.4, ease: 'power3.out' });
            }
            glowXTo(x);
            glowYTo(y);
        };

        const handleMouseEnter = () => {
            gsap.to(card, {
                scale: 1.02,
                duration: 0.5,
                ease: 'power3.out'
            });

            gsap.to(glow, {
                opacity: 0.6,
                duration: 0.3,
                ease: 'power2.out'
            });
        };

        const handleMouseLeave = () => {
            gsap.to(card, {
                x: 0,
                y: 0,
                rotateX: 0,
                rotateY: 0,
                scale: 1,
                duration: 0.7,
                ease: 'power3.out'
            });

            gsap.to(glow, {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseenter', handleMouseEnter);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseenter', handleMouseEnter);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [intensity]);

    return (
        <div className={`hover-card-wrapper ${className}`}>
            <div ref={cardRef} className="hover-card">
                {children}
                <div ref={glowRef} className="hover-card__glow" />
            </div>
        </div>
    );
};
