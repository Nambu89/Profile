/**
 * Skills Section - Technical skills grid
 */

import React from 'react';
import { SectionTitle, SkillBadge } from '../ui';
import { useStaggerAnimation } from '../../hooks';
import { skillGroups } from '../../data/portfolio';
import './Skills.css';

export const Skills: React.FC = () => {
    const skillsRef = useStaggerAnimation<HTMLDivElement>('.skill-group');

    return (
        <section className="skills section" id="skills">
            <div className="container">
                <SectionTitle
                    number="04"
                    title="Skills"
                    subtitle="Tecnologías y herramientas que domino"
                />

                <div ref={skillsRef} className="skills__grid">
                    {skillGroups.map((group) => (
                        <div key={group.category} className="skill-group">
                            <h3 className="skill-group__title">{group.title}</h3>
                            <div className="skill-group__items">
                                {group.skills.map((skill, index) => (
                                    <SkillBadge
                                        key={skill.id}
                                        name={skill.name}
                                        level={skill.level}
                                        delay={index * 0.05}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
