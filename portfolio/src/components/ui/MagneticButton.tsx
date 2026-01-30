/**
 * MagneticButton - Button with magnetic hover effect
 * Follows the mouse when hovering nearby using GSAP
 */

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import './MagneticButton.css';

interface MagneticButtonProps {
    children: React.ReactNode;
    href?: string;
    onClick?: (e: React.MouseEvent) => void;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    className?: string;
    strength?: number; // Magnetic strength (0-1), default 0.5
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
    children,
    href,
    onClick,
    variant = 'primary',
    size = 'md',
    icon,
    className = '',
    strength = 0.5
}) => {
    const buttonRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const button = buttonRef.current;
        const text = textRef.current;
        if (!button || !text) return;

        let xTo: gsap.QuickToFunc;
        let yTo: gsap.QuickToFunc;
        let textXTo: gsap.QuickToFunc;
        let textYTo: gsap.QuickToFunc;

        const handleMouseMove = (e: Event) => {
            const mouseEvent = e as globalThis.MouseEvent;
            const rect = button.getBoundingClientRect();
            const x = mouseEvent.clientX - (rect.left + rect.width / 2);
            const y = mouseEvent.clientY - (rect.top + rect.height / 2);

            // Calculate distance from center
            const distance = Math.sqrt(x * x + y * y);
            const maxDistance = Math.max(rect.width, rect.height);

            if (distance < maxDistance) {
                const factor = Math.min(1, (maxDistance - distance) / maxDistance);
                const magnetX = x * strength * factor;
                const magnetY = y * strength * factor;

                // Initialize quickTo if not already done
                if (!xTo) {
                    xTo = gsap.quickTo(button, 'x', { duration: 0.6, ease: 'power3.out' });
                    yTo = gsap.quickTo(button, 'y', { duration: 0.6, ease: 'power3.out' });
                    textXTo = gsap.quickTo(text, 'x', { duration: 0.4, ease: 'power3.out' });
                    textYTo = gsap.quickTo(text, 'y', { duration: 0.4, ease: 'power3.out' });
                }

                xTo(magnetX);
                yTo(magnetY);
                textXTo(magnetX * 0.3);
                textYTo(magnetY * 0.3);
            }
        };

        const handleMouseEnter = () => {
            gsap.to(button, {
                scale: 1.05,
                duration: 0.4,
                ease: 'power2.out'
            });
        };

        const handleMouseLeave = () => {
            gsap.to(button, {
                x: 0,
                y: 0,
                scale: 1,
                duration: 0.7,
                ease: 'elastic.out(1, 0.5)'
            });

            if (text) {
                gsap.to(text, {
                    x: 0,
                    y: 0,
                    duration: 0.7,
                    ease: 'elastic.out(1, 0.5)'
                });
            }
        };

        button.addEventListener('mousemove', handleMouseMove);
        button.addEventListener('mouseenter', handleMouseEnter);
        button.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            button.removeEventListener('mousemove', handleMouseMove);
            button.removeEventListener('mouseenter', handleMouseEnter);
            button.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [strength]);

    const classes = `magnetic-button magnetic-button--${variant} magnetic-button--${size} ${className}`;

    const content = (
        <>
            <span ref={textRef} className="magnetic-button__content">
                {icon && <span className="magnetic-button__icon">{icon}</span>}
                <span className="magnetic-button__text">{children}</span>
            </span>
            <span className="magnetic-button__glow" />
        </>
    );

    if (href) {
        return (
            <a
                ref={buttonRef as React.RefObject<HTMLAnchorElement>}
                href={href}
                className={classes}
                target="_blank"
                rel="noopener noreferrer"
            >
                {content}
            </a>
        );
    }

    return (
        <button
            ref={buttonRef as React.RefObject<HTMLButtonElement>}
            onClick={onClick}
            className={classes}
        >
            {content}
        </button>
    );
};
