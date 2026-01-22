/**
 * Navbar Component - Responsive navigation
 */

import React, { useState, useEffect } from 'react';
import { navItems, socialLinks } from '../../data/portfolio';
import './Navbar.css';

export const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        setIsMenuOpen(false);

        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            <header className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}>
                <div className="navbar__container">
                    <nav className="navbar__nav navbar__nav--left">
                        {navItems.slice(0, 3).map((item) => (
                            <a
                                key={item.id}
                                href={item.href}
                                className="navbar__link link-strike"
                                onClick={(e) => handleNavClick(e, item.href)}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    <nav className="navbar__nav navbar__nav--right">
                        {navItems.slice(3).map((item) => (
                            <a
                                key={item.id}
                                href={item.href}
                                className="navbar__link link-strike"
                                onClick={(e) => handleNavClick(e, item.href)}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    <button
                        className={`navbar__hamburger ${isMenuOpen ? 'navbar__hamburger--open' : ''}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isMenuOpen}
                        aria-controls="fullscreen-menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </header>

            {/* Fullscreen Menu (Mobile + Desktop on Click) */}
            <div
                id="fullscreen-menu"
                className={`mobile-menu ${isMenuOpen ? 'mobile-menu--open' : ''}`}
                aria-hidden={!isMenuOpen}
                aria-label="Navigation menu overlay"
            >
                {/* Menu Content */}
                <nav className="mobile-menu__nav">
                    {navItems.map((item, index) => (
                        <a
                            key={item.id}
                            href={item.href}
                            className="mobile-menu__link link-strike"
                            onClick={(e) => handleNavClick(e, item.href)}
                            style={{
                                transitionDelay: isMenuOpen ? `${index * 0.1 + 0.2}s` : '0s'
                            }}
                        >
                            <span className="mobile-menu__link-number">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="mobile-menu__link-text">{item.label}</span>
                        </a>
                    ))}
                </nav>

                {/* Social Links */}
                <div className="mobile-menu__social">
                    {socialLinks.map((link, index) => (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mobile-menu__social-link"
                            style={{
                                transitionDelay: isMenuOpen ? `${navItems.length * 0.1 + index * 0.05 + 0.2}s` : '0s'
                            }}
                        >
                            {link.name}
                        </a>
                    ))}
                </div>

                {/* Footer Text */}
                <div
                    className="mobile-menu__footer"
                    style={{
                        transitionDelay: isMenuOpen ? `${navItems.length * 0.1 + socialLinks.length * 0.05 + 0.3}s` : '0s'
                    }}
                >
                    <p>AI Architect & Tech Lead</p>
                </div>
            </div>
        </>
    );
};
