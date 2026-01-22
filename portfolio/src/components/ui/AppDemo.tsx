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
    apiUrl: string;
    exampleQuestions: string[];
    welcomeMessage: string;
}

const apps: App[] = [
    {
        id: 'impuestify',
        name: 'Impuestify',
        tagline: 'Asistente Fiscal Inteligente',
        url: 'https://impuestify.com',
        color: '#2d8a5e',
        icon: '🧾',
        apiUrl: 'https://proud-celebration-production-2fbb.up.railway.app/api/demo/chat',
        exampleQuestions: [
            '¿Cuándo se presenta el IVA trimestral?',
            '¿Qué es el modelo 303?',
            '¿Cómo funciona la deducción del IVA?',
        ],
        welcomeMessage: '👋 ¡Hola! Soy el asistente fiscal de **Impuestify**.\n\nPregúntame sobre IVA, IRPF, impuestos de sociedades, plazos fiscales, o cualquier duda tributaria.\n\n💡 Esta es una versión demo limitada.'
    },
    {
        id: 'opoguardia',
        name: 'OpoGuardia',
        tagline: 'Preparación con IA',
        url: 'https://opoguardia.com',
        color: '#0078d4',
        icon: '🦅',
        apiUrl: 'https://proyectopicolo-production.up.railway.app/api/v1/demo/chat',
        exampleQuestions: [
            '¿Cuáles son las funciones de la Guardia Civil?',
            '¿Qué es el temario socio-cultural?',
            '¿Cómo se estructura la organización territorial?',
        ],
        welcomeMessage: '👋 ¡Hola! Soy el tutor IA de **OpoGuardia**.\n\nPregúntame sobre el temario de Guardia Civil, funciones, organización, legislación, o cualquier duda sobre las oposiciones.\n\n💡 Esta es una versión demo limitada.'
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
                <ChatDemo
                    appId={activeApp.id}
                    appName={activeApp.name}
                    appIcon={activeApp.icon}
                    appTagline={activeApp.tagline}
                    appUrl={activeApp.url}
                    apiUrl={activeApp.apiUrl}
                    exampleQuestions={activeApp.exampleQuestions}
                    welcomeMessage={activeApp.welcomeMessage}
                />
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
