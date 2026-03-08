/**
 * Skills Section - Flowing text layout with level-based sizing
 */

import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionTitle } from '../ui';
import { skillGroups } from '../../data/portfolio';
import './Skills.css';

gsap.registerPlugin(ScrollTrigger);

export const Skills: React.FC = () => {
    const { t } = useTranslation();
    const skillsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!skillsRef.current) return;

        const words = skillsRef.current.querySelectorAll('.skills__word');

        gsap.set(words, { opacity: 0, y: 20 });

        gsap.to(words, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.03,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: skillsRef.current,
                start: 'top 80%',
                once: true,
            },
        });

        return () => {
            ScrollTrigger.getAll().forEach((trigger) => {
                if (trigger.trigger === skillsRef.current) {
                    trigger.kill();
                }
            });
        };
    }, []);

    return (
        <section className="skills section" id="skills">
            <div className="container">
                <SectionTitle
                    number={t('skills.number')}
                    title={t('skills.title')}
                    subtitle={t('skills.subtitle')}
                />

                <div ref={skillsRef} className="skills__flow">
                    {skillGroups.map((group) => (
                        <div key={group.category} className="skills__category">
                            <h3 className="skills__category-title">
                                {t(`skills.${group.category}`)}
                            </h3>
                            <div className="skills__words">
                                {group.skills.map((skill) => (
                                    <span
                                        key={skill.id}
                                        className={`skills__word skills__word--${skill.level}`}
                                    >
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
