/**
 * Section Title Component - Consistent section headers
 */

import React from 'react';
import { useScrollAnimation } from '../../hooks';
import './SectionTitle.css';

interface SectionTitleProps {
    number?: string;
    title: string;
    subtitle?: string;
    align?: 'left' | 'center';
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
    number,
    title,
    subtitle,
    align = 'left'
}) => {
    const ref = useScrollAnimation<HTMLDivElement>();

    return (
        <div ref={ref} className={`section-title section-title--${align}`}>
            {number && <span className="section-title__number">{number}</span>}
            <h2 className="section-title__heading">{title}</h2>
            {subtitle && <p className="section-title__subtitle">{subtitle}</p>}
        </div>
    );
};
