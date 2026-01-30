/**
 * BlurText Component - Animates text from blurred to focused
 * Uses GSAP for smooth animation
 */

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './BlurText.css';

interface BlurTextProps {
    text: string;
    delay?: number;
    duration?: number;
    className?: string;
    animateBy?: 'words' | 'characters';
}

export const BlurText: React.FC<BlurTextProps> = ({
    text,
    delay = 0,
    duration = 1,
    className = '',
    animateBy = 'words'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const elements = containerRef.current.querySelectorAll('.blur-text__item');

        // Set initial state
        gsap.set(elements, {
            opacity: 0,
            filter: 'blur(10px)',
            y: 20
        });

        // Animate in with stagger
        gsap.to(elements, {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            duration: duration,
            delay: delay,
            stagger: animateBy === 'words' ? 0.08 : 0.03,
            ease: 'power3.out'
        });
    }, [text, delay, duration, animateBy]);

    // Split text into words or characters
    const splitText = () => {
        if (animateBy === 'words') {
            return text.split(' ').map((word, index) => (
                <span key={index} className="blur-text__word">
                    <span className="blur-text__item">{word}</span>
                    {index < text.split(' ').length - 1 && ' '}
                </span>
            ));
        } else {
            return text.split('').map((char, index) => (
                <span key={index} className="blur-text__item">
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ));
        }
    };

    return (
        <div ref={containerRef} className={`blur-text ${className}`}>
            {splitText()}
        </div>
    );
};
