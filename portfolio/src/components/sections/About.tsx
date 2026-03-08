/**
 * About Section - Personal introduction with photo
 * Collage-style photo with clip-path, animated stats counters
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { SectionTitle } from '../ui';
import { useScrollAnimation } from '../../hooks';
import { personalInfo, certifications } from '../../data/portfolio';
import profileImage from '../../assets/profile.jpg';
import ai102Badge from '../../assets/ai102-badge.png';
import './About.css';

interface StatConfig {
    value: number;
    suffix: string;
    labelKey: string;
}

const STATS: StatConfig[] = [
    { value: 8, suffix: '+', labelKey: 'about.statYears' },
    { value: 10, suffix: '+', labelKey: 'about.statProjects' },
    { value: 5, suffix: '+', labelKey: 'about.statCerts' },
];

export const About: React.FC = () => {
    const { t } = useTranslation();
    const imageRef = useScrollAnimation<HTMLDivElement>();
    const textRef = useScrollAnimation<HTMLDivElement>();
    const statsRef = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);

    const animateStats = useCallback(() => {
        if (hasAnimated.current || !statsRef.current) return;
        hasAnimated.current = true;

        const numberEls = statsRef.current.querySelectorAll<HTMLElement>('.about__stat-number');
        numberEls.forEach((el, i) => {
            const stat = STATS[i];
            const obj = { val: 0 };
            gsap.to(obj, {
                val: stat.value,
                duration: 1.5,
                ease: 'power2.out',
                onUpdate: () => {
                    el.textContent = `${Math.round(obj.val)}${stat.suffix}`;
                },
            });
        });
    }, []);

    useEffect(() => {
        const el = statsRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    animateStats();
                    observer.disconnect();
                }
            },
            { threshold: 0.3 }
        );
        observer.observe(el);

        return () => observer.disconnect();
    }, [animateStats]);

    const featuredCert = certifications.find(c => c.id === 'ai-102');

    return (
        <section className="about section" id="about">
            <div className="container">
                <SectionTitle
                    number={t('about.number')}
                    title={t('about.title')}
                    subtitle={t('about.subtitle')}
                />

                <div className="about__grid">
                    <div ref={imageRef} className="about__image-wrapper">
                        <div className="about__image-container">
                            <img
                                src={profileImage}
                                alt={personalInfo.name}
                                className="about__image"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                    </div>

                    <div ref={textRef} className="about__text">
                        <p className="about__paragraph about__paragraph--lead">
                            {t('about.bio1')}
                        </p>
                        <p className="about__paragraph">{t('about.bio2')}</p>
                        <p className="about__paragraph">{t('about.bio3')}</p>

                        <div ref={statsRef} className="about__stats">
                            {STATS.map((stat, i) => (
                                <div key={i} className="about__stat">
                                    <span className="about__stat-number">0{stat.suffix}</span>
                                    <span className="about__stat-label">{t(stat.labelKey)}</span>
                                </div>
                            ))}
                        </div>

                        {/* AI-102 Certification Badge */}
                        {featuredCert && (
                            <a
                                href={featuredCert.credentialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="about__certification"
                            >
                                <img src={ai102Badge} alt="Azure AI Engineer Associate" className="about__certification-badge" loading="lazy" decoding="async" />
                                <div className="about__certification-info">
                                    <span className="about__certification-title">{featuredCert.name}</span>
                                    <span className="about__certification-issuer">{featuredCert.issuer} &bull; {featuredCert.date}</span>
                                </div>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
