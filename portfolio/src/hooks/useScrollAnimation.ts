/**
 * Custom hook for scroll-triggered animations with GSAP
 * Following Single Responsibility Principle
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface UseScrollAnimationOptions {
    trigger?: string;
    start?: string;
    end?: string;
    scrub?: boolean | number;
    markers?: boolean;
    once?: boolean;
}

export function useScrollAnimation<T extends HTMLElement>(
    options: UseScrollAnimationOptions = {}
) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const {
            start = 'top 80%',
            end = 'bottom 20%',
            scrub = false,
            markers = false,
            once = true
        } = options;

        const ctx = gsap.context(() => {
            gsap.from(element, {
                opacity: 0,
                y: 50,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: element,
                    start,
                    end,
                    scrub,
                    markers,
                    toggleActions: once ? 'play none none none' : 'play reverse play reverse'
                }
            });
        }, element);

        return () => ctx.revert();
    }, [options]);

    return ref;
}

export function useStaggerAnimation<T extends HTMLElement>(
    childSelector: string,
    options: UseScrollAnimationOptions = {}
) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const { start = 'top 80%', markers = false } = options;
        const children = element.querySelectorAll(childSelector);

        if (children.length === 0) return;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const ctx = gsap.context(() => {
            if (prefersReducedMotion) {
                // Simple fade-in for reduced motion
                gsap.from(children, {
                    opacity: 0,
                    duration: 0.3,
                    scrollTrigger: {
                        trigger: element,
                        start,
                        markers,
                        toggleActions: 'play none none none'
                    }
                });
            } else {
                // Full animation
                gsap.from(children, {
                    opacity: 0,
                    y: 30,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: element,
                        start,
                        markers,
                        toggleActions: 'play none none none'
                    }
                });
            }
        }, element);

        return () => ctx.revert();
    }, [childSelector, options]);

    return ref;
}

/**
 * Cinematic scroll storytelling hook
 * For more advanced scroll-linked animations (Lando-style)
 */
export function useCinematicScroll<T extends HTMLElement>(
    variant: 'fade-slide' | 'scale-fade' | 'split-text' = 'fade-slide'
) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const ctx = gsap.context(() => {
            if (prefersReducedMotion) {
                // Reduced motion: simple fade
                gsap.from(element, {
                    opacity: 0,
                    duration: 0.3,
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 75%',
                        toggleActions: 'play none none none'
                    }
                });
            } else {
                // Full cinematic animation based on variant
                switch (variant) {
                    case 'scale-fade':
                        gsap.from(element, {
                            opacity: 0,
                            scale: 0.95,
                            duration: 1.2,
                            ease: 'power4.out',
                            scrollTrigger: {
                                trigger: element,
                                start: 'top 70%',
                                toggleActions: 'play none none none'
                            }
                        });
                        break;

                    case 'split-text':
                        gsap.from(element, {
                            opacity: 0,
                            y: 40,
                            rotationX: -10,
                            duration: 1,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: element,
                                start: 'top 75%',
                                toggleActions: 'play none none none'
                            }
                        });
                        break;

                    case 'fade-slide':
                    default:
                        gsap.from(element, {
                            opacity: 0,
                            y: 60,
                            duration: 1,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: element,
                                start: 'top 75%',
                                toggleActions: 'play none none none'
                            }
                        });
                }
            }
        }, element);

        return () => ctx.revert();
    }, [variant]);

    return ref;
}
