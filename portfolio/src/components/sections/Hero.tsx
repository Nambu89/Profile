/**
 * Hero Section - Main landing area with 3D brain visualization
 */

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { NeuralBrain } from '../three';
import { personalInfo, socialLinks } from '../../data/portfolio';
import './Hero.css';

// SVG Icons
const ArrowDown = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
);

const LinkedInIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const GitHubIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);

const EmailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const getIcon = (iconName: string) => {
    switch (iconName) {
        case 'linkedin': return <LinkedInIcon />;
        case 'github': return <GitHubIcon />;
        case 'mail': return <EmailIcon />;
        default: return null;
    }
};

export const Hero: React.FC = () => {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Ensure elements are visible first
        gsap.set([titleRef.current, subtitleRef.current, ctaRef.current], {
            opacity: 1,
            visibility: 'visible'
        });

        // Animate only position, not opacity
        tl.from(titleRef.current, {
            y: 30,
            duration: 0.8,
            delay: 0.3
        })
            .from(subtitleRef.current, {
                y: 20,
                duration: 0.6
            }, '-=0.4')
            .from(ctaRef.current, {
                y: 15,
                duration: 0.5
            }, '-=0.3');
    }, []);

    const handleScrollDown = () => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="hero" id="hero">
            <div className="hero__background">
                <NeuralBrain />
            </div>

            <div className="hero__content">
                <div className="hero__text">
                    <h1 ref={titleRef} className="hero__title">
                        <span className="hero__name">{personalInfo.name}</span>
                        <span className="hero__role">{personalInfo.title}</span>
                    </h1>

                    <p ref={subtitleRef} className="hero__subtitle">
                        {personalInfo.subtitle}
                    </p>

                    <div ref={ctaRef} className="hero__cta">
                        <div className="hero__social">
                            {socialLinks.map((link) => (
                                <a
                                    key={link.id}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hero__social-link"
                                    aria-label={link.name}
                                >
                                    {getIcon(link.icon)}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <button className="hero__scroll" onClick={handleScrollDown} aria-label="Scroll down">
                <span className="hero__scroll-text">Scroll</span>
                <span className="hero__scroll-icon">
                    <ArrowDown />
                </span>
            </button>
        </section>
    );
};
