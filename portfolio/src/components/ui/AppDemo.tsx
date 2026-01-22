/**
 * AppDemo - Live Demo of Production Apps
 * Shows Impuestify chat and OpoGuardia with tab switcher
 */

import React, { useState } from 'react';
import { ChatDemo } from './ChatDemo';
import './AppDemo.css';

interface App {
    id: string;
    name: string;
    tagline: string;
    url: string;
    color: string;
    icon: string;
}

const apps: App[] = [
    {
        id: 'impuestify',
        name: 'Impuestify',
        tagline: 'Asistente Fiscal Inteligente',
        url: 'https://impuestify.com',
        color: '#2d8a5e',
        icon: '🧾'
    },
    {
        id: 'opoguardia',
        name: 'OpoGuardia',
        tagline: 'Preparación con IA',
        url: 'https://opoguardia.com',
        color: '#0078d4',
        icon: '🦅'
    }
];

export const AppDemo: React.FC = () => {
    const [activeApp, setActiveApp] = useState<App>(apps[0]);

    const openInNewTab = () => {
        window.open(activeApp.url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="app-demo">
            {/* Header with Tabs */}
            <div className="app-demo__header">
                <div className="app-demo__tabs">
                    {apps.map((app) => (
                        <button
                            key={app.id}
                            className={`app-demo__tab ${activeApp.id === app.id ? 'app-demo__tab--active' : ''}`}
                            onClick={() => setActiveApp(app)}
                            style={{
                                '--tab-color': app.color
                            } as React.CSSProperties}
                        >
                            <span className="app-demo__tab-icon">{app.icon}</span>
                            <div className="app-demo__tab-content">
                                <span className="app-demo__tab-name">{app.name}</span>
                                <span className="app-demo__tab-tagline">{app.tagline}</span>
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    className="app-demo__external-link"
                    onClick={openInNewTab}
                    aria-label="Abrir en nueva pestaña"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                    <span>Abrir app</span>
                </button>
            </div>

            {/* Demo Container */}
            <div className="app-demo__content">
                {activeApp.id === 'impuestify' ? (
                    <ChatDemo />
                ) : (
                    <div className="app-demo__coming-soon">
                        <div className="app-demo__coming-soon-icon">{activeApp.icon}</div>
                        <h3 className="app-demo__coming-soon-title">
                            Chat demo próximamente
                        </h3>
                        <p className="app-demo__coming-soon-text">
                            El chat interactivo de {activeApp.name} estará disponible pronto.
                        </p>
                        <button
                            className="app-demo__coming-soon-button"
                            onClick={openInNewTab}
                        >
                            Visitar {activeApp.name} →
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="app-demo__footer">
                <p className="app-demo__footer-text">
                    ✨ Demo en vivo - Sistema en producción
                </p>
            </div>
        </div>
    );
};
