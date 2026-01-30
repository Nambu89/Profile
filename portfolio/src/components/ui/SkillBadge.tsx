/**
 * SkillBadge - Animated skill badge with micro-interactions
 * Uses GSAP for smooth hover animations
 */

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import './SkillBadge.css';

interface SkillBadgeProps {
    name: string;
    level: 'expert' | 'advanced' | 'intermediate';
    delay?: number;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
    name,
    level,
    delay = 0
}) => {
    const badgeRef = useRef<HTMLDivElement>(null);
    const nameRef = useRef<HTMLSpanElement>(null);
    const levelRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const badge = badgeRef.current;
        if (!badge) return;

        // Initial animation
        gsap.from(badge, {
            opacity: 0,
            x: -10,
            duration: 0.5,
            delay: delay,
            ease: 'power2.out'
        });

        const handleMouseEnter = () => {
            gsap.to(nameRef.current, {
                x: 5,
                duration: 0.3,
                ease: 'power2.out'
            });

            gsap.to(levelRef.current, {
                scale: 1.1,
                duration: 0.3,
                ease: 'back.out(1.7)'
            });

            // Shine effect
            gsap.to(badge, {
                boxShadow: '0 0 20px rgba(45, 138, 94, 0.3)',
                duration: 0.3,
                ease: 'power2.out'
            });
        };

        const handleMouseLeave = () => {
            gsap.to(nameRef.current, {
                x: 0,
                duration: 0.3,
                ease: 'power2.out'
            });

            gsap.to(levelRef.current, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });

            gsap.to(badge, {
                boxShadow: 'none',
                duration: 0.3,
                ease: 'power2.out'
            });
        };

        badge.addEventListener('mouseenter', handleMouseEnter);
        badge.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            badge.removeEventListener('mouseenter', handleMouseEnter);
            badge.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [delay]);

    return (
        <div
            ref={badgeRef}
            className={`skill-badge skill-badge--${level}`}
        >
            <span ref={nameRef} className="skill-badge__name">{name}</span>
            <span ref={levelRef} className="skill-badge__level">{level}</span>
        </div>
    );
};
