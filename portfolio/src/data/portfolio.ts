/**
 * Portfolio Data - Single Source of Truth
 * Following Open/Closed Principle - Easy to extend with new data
 */

import type { PersonalInfo, SocialLink, Experience, Project, SkillGroup, NavItem } from '../types';

// =========================================
// Personal Information
// =========================================

export const personalInfo: PersonalInfo = {
    name: 'Fernando Prada',
    title: 'AI Architect & Tech Lead',
    subtitle: 'Building intelligent solutions that matter',
    location: 'Zaragoza, España',
    email: 'fernando.prada@example.com', // TODO: Update with real email
    bio: [
        'Soy Fernando Prada, Arquitecto de IA y Líder Técnico en Devoteam. Mi trayectoria es única: del ejército español a la arquitectura de sistemas de inteligencia artificial.',
        'Diseño y desarrollo sistemas multi-agente, soluciones RAG y aplicaciones de IA en producción. Mi experiencia militar me enseñó disciplina, liderazgo y trabajo bajo presión, cualidades que aplico cada día en el desarrollo de tecnología.',
        'Actualmente lidero proyectos de IA enterprise mientras desarrollo mis propios productos: Impuestify (asistente fiscal inteligente) y OpoGuardia (plataforma de preparación con IA).'
    ]
};

// =========================================
// Social Links
// =========================================

export const socialLinks: SocialLink[] = [
    {
        id: 'linkedin',
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/in/fernandopradagorge/',
        icon: 'linkedin'
    },
    {
        id: 'github',
        name: 'GitHub',
        url: 'https://github.com/Nambu89',
        icon: 'github'
    },
    {
        id: 'email',
        name: 'Email',
        url: 'mailto:fernando.prada@example.com', // TODO: Update with real email
        icon: 'mail'
    }
];

// =========================================
// Experience Timeline
// =========================================

export const experiences: Experience[] = [
    {
        id: 'devoteam',
        company: 'Devoteam Drago SAU',
        role: 'Tech Lead & AI Architect',
        period: 'Mayo 2025 - Actualidad',
        startDate: new Date('2025-05-01'),
        endDate: null,
        description: 'Liderando proyectos de inteligencia artificial y arquitectura de soluciones enterprise.',
        highlights: [
            'Diseño de arquitecturas de sistemas multi-agente',
            'Implementación de soluciones RAG con OpenAI y Azure',
            'Liderazgo técnico de equipos de desarrollo',
            'Consultoría en adopción de IA para empresas'
        ],
        technologies: ['OpenAI', 'Azure', 'FastAPI', 'React', 'LangChain', 'Multi-Agent Systems'],
        type: 'tech'
    },
    {
        id: 'svan',
        company: 'Grupo SVAN',
        role: 'Responsable Departamento Informática',
        period: 'Julio 2024 - Mayo 2025',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2025-05-01'),
        description: 'Lideré la transformación digital del departamento IT, desarrollando soluciones de IA personalizadas.',
        highlights: [
            'Desarrollo de AmazonIA: Bot de sincronización con Shopping Feed',
            'Creación del Asistente IA para el SAT (Servicio de Asistencia Técnica)',
            'Automatización de procesos internos',
            'Gestión del equipo de IT'
        ],
        technologies: ['Python', 'OpenAI', 'APIs', 'Automatización', 'SQL'],
        type: 'tech'
    },
    {
        id: 'gna',
        company: 'Grupo Nieto Adame (GNA)',
        role: 'Administrativo',
        period: 'Enero 2024 - Julio 2024',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-07-01'),
        description: 'Transición del sector militar al mundo corporativo, adquiriendo experiencia en gestión administrativa.',
        highlights: [
            'Gestión administrativa y documental',
            'Primeros pasos en el sector privado',
            'Desarrollo de habilidades organizativas'
        ],
        type: 'corporate'
    },
    {
        id: 'ejercito',
        company: 'Ejército Español',
        role: 'Militar Profesional',
        period: 'Octubre 2016 - Febrero 2024',
        startDate: new Date('2016-10-01'),
        endDate: new Date('2024-02-01'),
        description: 'Más de 7 años de servicio en las Fuerzas Armadas Españolas, desarrollando disciplina, liderazgo y capacidad de trabajo bajo presión.',
        highlights: [
            'Liderazgo de equipos en situaciones de alta presión',
            'Planificación estratégica y táctica',
            'Gestión de recursos y logística',
            'Trabajo en equipo y camaradería',
            'Disciplina y compromiso con la excelencia'
        ],
        type: 'military'
    }
];

// =========================================
// Projects
// =========================================

export const projects: Project[] = [
    {
        id: 'impuestify',
        name: 'Impuestify',
        tagline: 'Asistente Fiscal Inteligente',
        description: 'Plataforma de asistencia fiscal con IA que utiliza RAG y sistemas multi-agente para responder consultas sobre normativa española. Cumple con AI Act y RGPD.',
        longDescription: 'Impuestify es un asistente fiscal completo que combina el poder de GPT-5-mini con sistemas de recuperación de información (RAG) y una arquitectura multi-agente. Diseñado con seguridad enterprise desde el inicio: defensa en profundidad contra ataques LLM, cumplimiento normativo europeo y protección de datos sensibles.',
        technologies: ['FastAPI', 'React', 'OpenAI GPT-5-mini', 'Turso', 'Redis', 'Llama Guard', 'Multi-Agent Framework'],
        features: [
            'Cumplimiento AI Act y RGPD',
            'Protección contra Prompt Injection directo e indirecto',
            'Defensa contra SQL Injection y Jailbreak',
            'Moderación de contenido con Llama Guard 4',
            'Detección y protección de PII (datos personales)',
            'Sistema multi-agente con CoordinatorAgent, TaxAgent, PayslipAgent',
            'RAG con embeddings semánticos sobre normativa fiscal',
            'Cache semántico para optimización de costes'
        ],
        liveUrl: 'https://impuestify.com',
        status: 'production',
        highlighted: true,
        category: 'ai',

        // Case Study Fields
        problem: 'Las consultas fiscales requieren conocimiento técnico especializado, actualizaciones normativas constantes y alta precisión. Los sistemas tradicionales no escalan, y las soluciones de IA genérica carecen de seguridad enterprise y cumplimiento normativo europeo.',
        approach: 'Diseñé una arquitectura multi-agente con RAG semántico sobre normativa fiscal española. Implementé defensa en profundidad (Llama Guard, prompt injection protection, PII detection) y cumplimiento completo de AI Act y RGPD desde el diseño inicial.',
        impact: [
            '95%+ accuracy en consultas fiscales verificadas',
            '100% cumplimiento AI Act y RGPD',
            'Reducción 70% tiempo de respuesta vs consultoría tradicional',
            'Protección multicapa contra ataques LLM en producción'
        ],
        role: 'AI Architect & Tech Lead - Diseño completo de arquitectura, implementación backend/frontend, seguridad y despliegue',
        constraints: ['Cumplimiento normativo estricto (AI Act, RGPD)', 'Protección de datos sensibles (PII)', 'Alta precisión requerida (fiscal compliance)']
    },
    {
        id: 'opoguardia',
        name: 'OpoGuardia',
        tagline: 'Plataforma de Preparación con IA',
        description: 'Sistema de preparación para oposiciones de Guardia Civil potenciado por IA. Diseñado con seguridad enterprise y cumplimiento RGPD.',
        longDescription: 'OpoGuardia revoluciona la preparación de oposiciones con IA. Arquitectura segura con protección multicapa contra ataques LLM, cumplimiento normativo europeo (AI Act, RGPD), y sistema robusto de gestión de datos de estudiantes.',
        technologies: ['FastAPI', 'React', 'OpenAI', 'Turso', 'Stripe', 'Google OAuth', 'Resend'],
        features: [
            'Cumplimiento AI Act y RGPD',
            'Defensa en profundidad contra ataques LLM',
            'Protección contra Prompt/SQL Injection',
            'Content Moderation y filtrado de Jailbreak',
            'Tutor IA con RAG sobre temario oficial',
            'Exámenes adaptativos por tema y dificultad',
            'Sistema multi-tenant para academias',
            'Dashboard de analytics para profesores'
        ],
        liveUrl: 'https://opoguardia.com',
        status: 'production',
        highlighted: true,
        category: 'ai',

        // Case Study Fields
        problem: 'La preparación de oposiciones es costosa, ineficiente y poco personalizada. Estudiantes necesitan feedback inmediato, exámenes adaptativos y tutorización 24/7. Las academias requieren escalabilidad multi-tenant con protección de datos de menores.',
        approach: 'Construí un tutor IA con RAG sobre temario oficial de Guardia Civil, exámenes adaptativos por dificultad, y arquitectura multi-tenant segura. Integración con Stripe para pagos, Google OAuth para autenticación, y sistema completo de analytics para profesores.',
        impact: [
            'Reducción 60% tiempo de preparación reportado',
            'Multi-tenant en producción (academias + estudiantes)',
            'Cumplimiento RGPD con datos de menores',
            '100% uptime desde lanzamiento'
        ],
        role: 'Full-Stack AI Developer - Arquitectura completa, backend (FastAPI), frontend (React), integración pagos y analytics',
        constraints: ['Protección de datos de menores (RGPD)', 'Sistema multi-tenant seguro', 'Exámenes adaptativos con bajo coste LLM']
    },
    {
        id: 'amazonia',
        name: 'AmazonIA',
        tagline: 'Bot de Sincronización E-commerce',
        description: 'Bot impulsado por IA para cargar productos en Shopping Feed mediante API y sincronización nocturna con CSV.',
        technologies: ['Python', 'OpenAI', 'APIs', 'Automatización'],
        features: [
            'Sincronización automática de catálogos',
            'Procesamiento de productos con IA',
            'Integración API y CSV',
            'Programación de tareas nocturnas'
        ],
        githubUrl: 'https://github.com/Nambu89/AmazonIA',
        status: 'production',
        highlighted: false,
        category: 'automation'
    },
    {
        id: 'asistente-sat',
        name: 'Asistente IA SAT',
        tagline: 'Asistente para Servicio Técnico',
        description: 'Asistente de IA para ayudar a los técnicos de servicio postventa en la resolución de incidencias de electrodomésticos.',
        technologies: ['Python', 'OpenAI', 'FastAPI'],
        features: [
            'Diagnóstico asistido por IA',
            'Base de conocimiento técnico',
            'Historial de incidencias',
            'Respuestas contextualizadas'
        ],
        githubUrl: 'https://github.com/Nambu89/Asistente-IA-SAT',
        status: 'production',
        highlighted: false,
        category: 'ai'
    },
    {
        id: 'agent-framework',
        name: 'Agent Framework Multi-system',
        tagline: 'Framework para Sistemas Multi-Agente',
        description: 'Framework propio para orquestación de sistemas multi-agente con soporte para múltiples proveedores de LLM.',
        technologies: ['Python', 'LangChain', 'OpenAI', 'Arquitectura de Agentes'],
        features: [
            'Orquestación de múltiples agentes',
            'Soporte para múltiples LLMs',
            'Gestión de contexto compartido',
            'Herramientas personalizables'
        ],
        githubUrl: 'https://github.com/Nambu89/Agent_Framwrok_Agent_Multisystem',
        status: 'development',
        highlighted: false,
        category: 'ai'
    }
];

// =========================================
// Skills
// =========================================

export const skillGroups: SkillGroup[] = [
    {
        category: 'ai',
        title: 'AI & Generative AI',
        skills: [
            { id: 'openai', name: 'OpenAI / Anthropic / Gemini / Meta / Open Source LLMs', category: 'ai', level: 'expert' },
            { id: 'azure-openai', name: 'Azure OpenAI Service', category: 'ai', level: 'expert' },
            { id: 'rag', name: 'RAG Systems', category: 'ai', level: 'expert' },
            { id: 'multiagent', name: 'Multi-Agent Systems', category: 'ai', level: 'expert' },
            { id: 'langchain', name: 'LangChain', category: 'ai', level: 'advanced' },
            { id: 'embeddings', name: 'Embeddings & Vector DB', category: 'ai', level: 'expert' },
            { id: 'prompt', name: 'Prompt Engineering', category: 'ai', level: 'expert' },
            { id: 'llama', name: 'Llama Guard / Content Mod', category: 'ai', level: 'advanced' }
        ]
    },
    {
        category: 'backend',
        title: 'Backend & APIs',
        skills: [
            { id: 'python', name: 'Python', category: 'backend', level: 'expert' },
            { id: 'fastapi', name: 'FastAPI', category: 'backend', level: 'expert' },
            { id: 'flask', name: 'Flask', category: 'backend', level: 'advanced' },
            { id: 'turso', name: 'Turso / SQLite', category: 'backend', level: 'advanced' },
            { id: 'postgresql', name: 'PostgreSQL', category: 'backend', level: 'advanced' },
            { id: 'redis', name: 'Redis / Upstash', category: 'backend', level: 'advanced' },
            { id: 'stripe', name: 'Stripe API', category: 'backend', level: 'advanced' }
        ]
    },
    {
        category: 'frontend',
        title: 'Frontend',
        skills: [
            { id: 'react', name: 'React', category: 'frontend', level: 'advanced' },
            { id: 'typescript', name: 'TypeScript', category: 'frontend', level: 'advanced' },
            { id: 'vite', name: 'Vite', category: 'frontend', level: 'advanced' },
            { id: 'css', name: 'CSS / Tailwind', category: 'frontend', level: 'advanced' },
            { id: 'threejs', name: 'Three.js / R3F', category: 'frontend', level: 'intermediate' }
        ]
    },
    {
        category: 'cloud',
        title: 'Cloud & Azure',
        skills: [
            { id: 'azure', name: 'Microsoft Azure', category: 'cloud', level: 'advanced' },
            { id: 'azure-ai', name: 'Azure AI Foundry', category: 'cloud', level: 'advanced' },
            { id: 'railway', name: 'Railway', category: 'cloud', level: 'advanced' },
            { id: 'cloudflare', name: 'Cloudflare', category: 'cloud', level: 'advanced' },
            { id: 'docker', name: 'Docker', category: 'cloud', level: 'intermediate' }
        ]
    },
    {
        category: 'tools',
        title: 'Tools & Leadership',
        skills: [
            { id: 'git', name: 'Git / GitHub', category: 'tools', level: 'expert' },
            { id: 'testing', name: 'Testing (Pytest)', category: 'tools', level: 'advanced' },
            { id: 'leadership', name: 'Tech Leadership', category: 'tools', level: 'expert' },
            { id: 'architecture', name: 'Solution Architecture', category: 'tools', level: 'expert' }
        ]
    }
];

// =========================================
// Navigation
// =========================================

export const navItems: NavItem[] = [
    { id: 'about', label: 'Sobre mí', href: '#about' },
    { id: 'journey', label: 'Trayectoria', href: '#journey' },
    { id: 'projects', label: 'Proyectos', href: '#projects' },
    { id: 'skills', label: 'Skills', href: '#skills' },
    { id: 'contact', label: 'Contacto', href: '#contact' }
];

// =========================================
// Certifications
// =========================================

import type { Certification } from '../types';

export const certifications: Certification[] = [
    {
        id: 'ai-102',
        name: 'Azure AI Engineer Associate',
        issuer: 'Microsoft',
        date: 'Diciembre 2025',
        credentialUrl: 'https://learn.microsoft.com/api/credentials/share/es-es/FernandoPrada-9858/B2807D412F82FE43?sharingId',
        featured: true
    },
    {
        id: 'genai-semantic',
        name: 'Generative AI with Azure OpenAI & Semantic Kernel',
        issuer: 'Microsoft Applied Skills',
        date: 'Enero 2026',
        credentialUrl: 'https://learn.microsoft.com/api/credentials/share/es-es/FernandoPrada-9858/17C0975530FC28BB?sharingId',
        featured: true
    },
    {
        id: 'nlp-azure',
        name: 'NLP with Azure AI Language',
        issuer: 'Microsoft Applied Skills',
        date: 'Enero 2026',
        credentialUrl: 'https://learn.microsoft.com/api/credentials/share/es-es/FernandoPrada-9858/86A8D579E658AA8F?sharingId',
        featured: false
    },
    {
        id: 'ai-900',
        name: 'Azure AI Fundamentals',
        issuer: 'Microsoft',
        date: 'Julio 2025',
        featured: false
    },
    {
        id: 'devoteam-ai3',
        name: 'AI Engineer Level 3',
        issuer: 'Devoteam',
        date: 'Diciembre 2025',
        featured: false
    }
];

