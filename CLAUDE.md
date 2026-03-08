# Profile — Portfolio Personal de Fernando Prada

## Arquitectura

```
Profile/
├── portfolio/           # Frontend React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/      # Navbar, MouseGlow
│   │   │   ├── sections/    # Hero, About, Journey, Projects, Skills, Contact
│   │   │   ├── ui/          # FerBot, BlurText, ChatDemo, MagneticButton...
│   │   │   └── three/       # NeuralBrain, FloatingOrb (React Three Fiber)
│   │   ├── data/            # Portfolio data (projects, skills)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── i18n/            # Internationalization ES/EN
│   │   ├── styles/          # Global CSS
│   │   └── types/           # TypeScript types
│   ├── api/                 # CV data + preprocessing
│   ├── public/              # Static assets
│   └── dist/                # Build output
├── FerBot/                  # AI chat backend (Vercel serverless)
│   └── backend/             # FastAPI + RAG + OpenAI
└── CV/                      # CV resources
```

## Stack

- **Frontend**: React 18, TypeScript 5.9, Vite 7, Three.js 0.182, R3F, Drei
- **Animaciones**: GSAP 3.14, CSS transitions
- **i18n**: react-i18next (ES default, EN)
- **Deploy frontend**: Vercel (vercel.json con rewrites)
- **FerBot backend**: FastAPI + RAG + OpenAI (directo, sin N8N)
- **Scheduling**: Google Calendar API (para agendar llamadas desde FerBot)
- **Design tooling**: Google Stitch (MCP) para prototipos UI
- **Analytics**: Vercel Analytics

## Convenciones

- TypeScript strict, no `any` explícito
- Componentes funcionales con hooks, no clases
- CSS modules o archivos `.css` por componente en `ui/`
- Imports: React → libs externas → componentes → utils → types → styles
- Commits semánticos: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
- i18n: todas las strings visibles via `t('key')`, nunca hardcoded

## Paleta de colores

- Background: `#0a0a0b` (near-black)
- Surfaces: `#111113` → `#1a1a1f` → `#252530` (elevación)
- Accent primary: `#D2FF00` (electric lime)
- Accent secondary: `#2d8a5e` (forest green)
- Text: `#e2e8f0` primary, `#94a3b8` secondary, `#64748b` muted
- Border: `rgba(255,255,255,0.1)`

## Reglas críticas

- **NO** modificar `vercel.json` sin confirmar con el usuario
- **NO** instalar dependencias sin justificación
- **NO** hacer push sin confirmación explícita
- **NO** escribir secrets en archivos (todo via env vars en Vercel)
- Entorno Windows: usar `venv/Scripts/python.exe` para Python
- Siempre ejecutar `npm run build` post-cambios para verificar TypeScript

## Agentes disponibles

| Comando | Agente | Rol |
|---------|--------|-----|
| `/frontend` | frontend-dev | React, TypeScript, CSS, UX/UI |
| `/3d` | 3d-specialist | Three.js, R3F, Drei, shaders |
| `/pm` | pm-coordinator | Gestión, delegación, research |
| `/qa` | qa-tester | E2E testing con Playwright |
| `/verify` | verifier | Verificación post-implementación |
| `/check-plan` | plan-checker | Revisión pre-ejecución |
| `/docs` | doc-auditor | Auditoría de documentación |

## Workflow obligatorio (RPI)

1. **Research** → investigar antes de actuar
2. **Plan** → escribir pasos concretos
3. `/check-plan` → PASS obligatorio antes de implementar
4. **Implement** → delegar a agentes especializados
5. `/verify` → VERIFIED obligatorio antes de declarar "hecho"
