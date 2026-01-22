/**
 * Button Component - Reusable button with variants
 * Following Open/Closed Principle - extendable through variants
 */

import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    href?: string;
    external?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'right',
    fullWidth = false,
    href,
    external = false,
    className = '',
    ...props
}) => {
    const classes = [
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth && 'btn--full-width',
        icon && 'btn--with-icon',
        className
    ].filter(Boolean).join(' ');

    const content = (
        <>
            {icon && iconPosition === 'left' && <span className="btn__icon">{icon}</span>}
            {children && <span className="btn__text">{children}</span>}
            {icon && iconPosition === 'right' && <span className="btn__icon">{icon}</span>}
        </>
    );

    if (href) {
        return (
            <a
                href={href}
                className={classes}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
            >
                {content}
            </a>
        );
    }

    return (
        <button className={classes} {...props}>
            {content}
        </button>
    );
};
