/**
 * Projects Section - Featured projects showcase
 */

import React from 'react';
import { SectionTitle, Button } from '../ui';
import { useScrollAnimation } from '../../hooks';
import { projects } from '../../data/portfolio';
import './Projects.css';

const ExternalLinkIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
    </svg>
);

const GitHubIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);

export const Projects: React.FC = () => {
    const projectsRef = useScrollAnimation<HTMLDivElement>();
    const highlightedProjects = projects.filter(p => p.highlighted);
    const otherProjects = projects.filter(p => !p.highlighted);

    return (
        <section className="projects section" id="projects">
            <div className="container">
                <SectionTitle
                    number="03"
                    title="Proyectos"
                    subtitle="Soluciones de IA en producción real"
                />

                {/* Featured Projects - Case Studies */}
                <div ref={projectsRef} className="projects__featured">
                    {highlightedProjects.map((project, index) => (
                        <article key={project.id} className="project-card project-card--featured">
                            <div className="project-card__content">
                                {/* Header */}
                                <div className="project-card__header">
                                    <span className="project-card__number">{String(index + 1).padStart(2, '0')}</span>
                                    <div className="project-card__header-tags">
                                        <span className="project-card__status project-card__status--production">
                                            {project.status}
                                        </span>
                                        <span className="project-card__category">{project.category}</span>
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="project-card__title">{project.name}</h3>
                                <p className="project-card__tagline">{project.tagline}</p>

                                {/* Case Study Structure (if available) */}
                                {project.problem ? (
                                    <div className="project-card__case-study">
                                        {/* Problem */}
                                        <div className="case-study__section">
                                            <h4 className="case-study__label">Problema</h4>
                                            <p className="case-study__text">{project.problem}</p>
                                        </div>

                                        {/* Approach */}
                                        <div className="case-study__section">
                                            <h4 className="case-study__label">Solución</h4>
                                            <p className="case-study__text">{project.approach}</p>
                                        </div>

                                        {/* Impact */}
                                        {project.impact && project.impact.length > 0 && (
                                            <div className="case-study__section">
                                                <h4 className="case-study__label">Impacto</h4>
                                                <ul className="case-study__impact-list">
                                                    {project.impact.map((item, i) => (
                                                        <li key={i} className="case-study__impact-item">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Role (optional) */}
                                        {project.role && (
                                            <div className="case-study__section case-study__section--role">
                                                <h4 className="case-study__label">Mi rol</h4>
                                                <p className="case-study__text case-study__text--small">{project.role}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="project-card__description">
                                        {project.longDescription || project.description}
                                    </p>
                                )}

                                {/* Tech Stack */}
                                <div className="project-card__tech">
                                    <h4 className="project-card__tech-title">Stack</h4>
                                    <div className="project-card__tech-tags">
                                        {project.technologies.map((tech) => (
                                            <span key={tech} className="project-card__tech-tag">{tech}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="project-card__actions">
                                    {project.liveUrl && (
                                        <Button
                                            href={project.liveUrl}
                                            external
                                            variant="primary"
                                            size="sm"
                                            icon={<ExternalLinkIcon />}
                                        >
                                            Ver Demo
                                        </Button>
                                    )}
                                    {project.githubUrl && (
                                        <Button
                                            href={project.githubUrl}
                                            external
                                            variant="outline"
                                            size="sm"
                                            icon={<GitHubIcon />}
                                        >
                                            Código
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Other Projects */}
                {otherProjects.length > 0 && (
                    <>
                        <h3 className="projects__other-title">Otros Proyectos</h3>
                        <div className="projects__grid">
                            {otherProjects.map((project) => (
                                <article key={project.id} className="project-card project-card--small">
                                    <div className="project-card__header">
                                        <span className="project-card__category">{project.category}</span>
                                    </div>

                                    <h4 className="project-card__title">{project.name}</h4>
                                    <p className="project-card__tagline">{project.tagline}</p>
                                    <p className="project-card__description">{project.description}</p>

                                    <div className="project-card__tech">
                                        {project.technologies.slice(0, 3).map((tech) => (
                                            <span key={tech} className="project-card__tech-tag">{tech}</span>
                                        ))}
                                    </div>

                                    <div className="project-card__actions">
                                        {project.githubUrl && (
                                            <a
                                                href={project.githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="project-card__link"
                                            >
                                                <GitHubIcon /> Ver código
                                            </a>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};
