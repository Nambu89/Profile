import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

export const LanguageSelector: React.FC = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'es' ? 'en' : 'es';
        i18n.changeLanguage(newLang);
        localStorage.setItem('language', newLang);
    };

    return (
        <button
            className="language-selector"
            onClick={toggleLanguage}
            aria-label="Toggle language"
        >
            <span className="language-selector__current">
                {i18n.language === 'es' ? 'ES' : 'EN'}
            </span>
            <svg
                className="language-selector__icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
        </button>
    );
};
