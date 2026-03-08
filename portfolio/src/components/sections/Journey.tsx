/**
 * Journey Section - Horizontal scroll career timeline
 * Uses GSAP ScrollTrigger for pinned horizontal scrolling
 */

import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionTitle } from '../ui';
import { experiences } from '../../data/portfolio';
import './Journey.css';

gsap.registerPlugin(ScrollTrigger);

export const Journey: React.FC = () => {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const scroller = scrollerRef.current;
        const progressBar = progressRef.current;
        if (!container || !scroller) return;

        // Delay initialization to let lazy-loaded layout settle and prevent auto-scroll
        const timer = setTimeout(() => {
            const ctx = gsap.context(() => {
                ScrollTrigger.refresh();
                const totalWidth = scroller.scrollWidth - container.offsetWidth;

                gsap.to(scroller, {
                    x: -totalWidth,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: container,
                        pin: true,
                        scrub: 1,
                        end: () => `+=${totalWidth}`,
                        onUpdate: (self) => {
                            if (progressBar) {
                                progressBar.style.width = `${self.progress * 100}%`;
                            }
                        },
                    },
                });
            }, container);

            // Store ctx for cleanup
            (container as HTMLDivElement & { _gsapCtx?: gsap.Context })._gsapCtx = ctx;
        }, 100);

        return () => {
            clearTimeout(timer);
            const ctx = (container as HTMLDivElement & { _gsapCtx?: gsap.Context })._gsapCtx;
            if (ctx) ctx.revert();
        };
    }, []);

    return (
        <section className="journey section" id="journey">
            <div className="container">
                <SectionTitle
                    number={t('journey.number')}
                    title={t('journey.title')}
                    subtitle={t('journey.subtitle')}
                />
            </div>

            <div ref={containerRef} className="journey__container">
                <div ref={scrollerRef} className="journey__scroller">
                    {experiences.map((exp) => {
                        const year = exp.period.split(' ').pop() ?? '';
                        return (
                            <div key={exp.id} className="journey__card">
                                <span className="journey__year">{year}</span>

                                <span className="journey__period">{exp.period}</span>
                                <h3 className="journey__role">{exp.role}</h3>
                                <h4 className="journey__company">{exp.company}</h4>

                                <p className="journey__description">{exp.description}</p>

                                {exp.technologies && (
                                    <div className="journey__tech-tags">
                                        {exp.technologies.map((tech) => (
                                            <span key={tech} className="journey__tech-tag">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="journey__progress">
                    <div ref={progressRef} className="journey__progress-bar" />
                </div>
            </div>
        </section>
    );
};
