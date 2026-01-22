/**
 * Journey Section - Career timeline
 */

import React from 'react';
import { SectionTitle } from '../ui';
import { useStaggerAnimation } from '../../hooks';
import { experiences } from '../../data/portfolio';
import './Journey.css';

// Icons for experience types
const MilitaryIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7l3-7z" />
    </svg>
);

const CorporateIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" />
    </svg>
);

const TechIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9.663 17h4.673M12 3v1M6.343 7.343l.707.707M3 12h1M6.343 16.657l.707-.707M21 12h-1M17.657 7.343l-.707.707M17.657 16.657l-.707-.707" />
        <circle cx="12" cy="12" r="4" />
    </svg>
);

const getIcon = (type: string) => {
    switch (type) {
        case 'military': return <MilitaryIcon />;
        case 'corporate': return <CorporateIcon />;
        case 'tech': return <TechIcon />;
        default: return <TechIcon />;
    }
};

export const Journey: React.FC = () => {
    const timelineRef = useStaggerAnimation<HTMLDivElement>('.journey__item');

    return (
        <section className="journey section" id="journey">
            <div className="container">
                <SectionTitle
                    number="02"
                    title="Mi Trayectoria"
                    subtitle="Del ejército español a la arquitectura de sistemas de IA"
                />

                <div ref={timelineRef} className="journey__timeline">
                    {experiences.map((exp, index) => (
                        <div
                            key={exp.id}
                            className={`journey__item journey__item--${exp.type}`}
                        >
                            <div className="journey__marker">
                                <div className="journey__icon">
                                    {getIcon(exp.type)}
                                </div>
                                {index < experiences.length - 1 && (
                                    <div className="journey__line"></div>
                                )}
                            </div>

                            <div className="journey__content">
                                <div className="journey__header">
                                    <span className="journey__period">{exp.period}</span>
                                    <span className="journey__type-badge">{exp.type}</span>
                                </div>

                                <h3 className="journey__role">{exp.role}</h3>
                                <h4 className="journey__company">{exp.company}</h4>

                                <p className="journey__description">{exp.description}</p>

                                <ul className="journey__highlights">
                                    {exp.highlights.map((highlight, i) => (
                                        <li key={i} className="journey__highlight">
                                            {highlight}
                                        </li>
                                    ))}
                                </ul>

                                {exp.technologies && (
                                    <div className="journey__tech">
                                        {exp.technologies.map((tech) => (
                                            <span key={tech} className="journey__tech-tag">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
