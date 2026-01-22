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
                        aria-label="Toggle menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </header>

            {/* Fullscreen Mobile Menu */}
            <div className={`mobile-menu ${isMenuOpen ? 'mobile-menu--open' : ''}`}>
                <nav className="mobile-menu__nav">
                    {navItems.map((item, index) => (
                        <a
                            key={item.id}
                            href={item.href}
                            className="mobile-menu__link"
                            onClick={(e) => handleNavClick(e, item.href)}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                <div className="mobile-menu__social">
                    {socialLinks.map((link) => (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mobile-menu__social-link"
                        >
                            {link.name}
                        </a>
                    ))}
                </div>
            </div>
        </>
    );
};
