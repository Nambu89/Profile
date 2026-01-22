/**
 * About Section - Personal introduction with photo
 */

import React from 'react';
import { SectionTitle } from '../ui';
import { useScrollAnimation } from '../../hooks';
import { personalInfo, certifications } from '../../data/portfolio';
import profileImage from '../../assets/profile.jpg';
import ai102Badge from '../../assets/ai102-badge.png';
import './About.css';

export const About: React.FC = () => {
    const imageRef = useScrollAnimation<HTMLDivElement>();
    const textRef = useScrollAnimation<HTMLDivElement>();

    const featuredCert = certifications.find(c => c.id === 'ai-102');

    return (
        <section className="about section" id="about">
            <div className="container">
                <SectionTitle
                    number="01"
                    title="Sobre mí"
                    subtitle="De las fuerzas armadas a la arquitectura de IA"
                />

                <div className="about__content">
                    <div ref={imageRef} className="about__image-wrapper">
                        <div className="about__image-container">
                            <img
                                src={profileImage}
                                alt={personalInfo.name}
                                className="about__image"
                            />
                            <div className="about__image-border"></div>
                        </div>
                    </div>

                    <div ref={textRef} className="about__text">
                        {personalInfo.bio.map((paragraph, index) => (
                            <p key={index} className="about__paragraph">
                                {paragraph}
                            </p>
                        ))}

                        <div className="about__highlights">
                            <div className="about__highlight">
                                <span className="about__highlight-number">8+</span>
                                <span className="about__highlight-label">Años de Experiencia</span>
                            </div>
                            <div className="about__highlight">
                                <span className="about__highlight-number">10+</span>
                                <span className="about__highlight-label">Proyectos en Producción</span>
                            </div>
                            <div className="about__highlight">
                                <span className="about__highlight-number">∞</span>
                                <span className="about__highlight-label">Pasión por la IA</span>
                            </div>
                        </div>

                        {/* AI-102 Certification Badge */}
                        {featuredCert && (
                            <a
                                href={featuredCert.credentialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="about__certification"
                            >
                                <img src={ai102Badge} alt="Azure AI Engineer Associate" className="about__certification-badge" />
                                <div className="about__certification-info">
                                    <span className="about__certification-title">{featuredCert.name}</span>
                                    <span className="about__certification-issuer">{featuredCert.issuer} • {featuredCert.date}</span>
                                </div>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

