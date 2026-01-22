# 🦅 OpoGuardia - Plataforma de Preparación con IA

Plataforma avanzada de preparación para oposiciones de Guardia Civil, potenciada por Inteligencia Artificial. Exámenes adaptativos, tutor IA con RAG, análisis de progreso y gestión de instituciones.

🌐 **En producción**: [https://opoguardia.com](https://opoguardia.com)

---

## 🌟 Características Principales

### 🎓 Para Opositores
- **Tutor IA RAG**: Respuestas basadas estrictamente en el temario oficial
- **Exámenes Adaptativos**: Dificultad ajustada por tema según rendimiento
- **Análisis Inteligente**: Predicción de nota, áreas de mejora y recomendaciones
- **Estadísticas Detalladas**: Gráficos de progreso, tendencias y comparativas
- **PDF Premium**: Descarga informes completos de progreso

### 🏫 Para Instituciones
- **Workspaces Multi-tenant**: Gestión completa de academias
- **Roles Granulares**: Owner, Admin, Teacher, Student
- **Invitaciones**: Sistema de invitación por email con roles
- **Métricas Agregadas**: Dashboard con estadísticas de toda la institución

### 💳 Monetización
- **Stripe Integration**: Suscripciones mensuales/anuales
- **3 Planes**: Free, Premium, Institution
- **Webhooks**: Actualización automática de suscripciones
- **Portal de Cliente**: Gestión de suscripciones desde la app

### 🔐 Autenticación
- **Login Tradicional**: Email + Contraseña (bcrypt hash)
- **Google OAuth 2.0**: ✅ Login con Google (Enero 2026)
- **Password Reset**: Sistema seguro con tokens de un solo uso
- **JWT Tokens**: Autenticación stateless con expiración configurable

---

## ✨ Nuevas Funcionalidades (Enero 2026)

### 🎯 Exámenes por Tema (v3.2) - NUEVO
| Feature | Descripción |
|---------|-------------|
| ✅ **Selector de Temas** | Escoge temas específicos del temario para tu examen |
| ✅ **Multi-select** | Selecciona múltiples temas a la vez |
| ✅ **Fusión Inteligente** | Unifica temas duplicados automáticamente |
| ✅ **Sin selección = Aleatorio** | Examen de todos los temas si no seleccionas |

**Endpoints añadidos**:
- `GET /api/v1/exam/topics` - Lista temas disponibles con preguntas

---

### 📊 Dashboard Mejorado (v3.2) - NUEVO
| Feature | Descripción |
|---------|-------------|
| ✅ **Recomendaciones IA** | Sugerencias personalizadas del tutor IA |
| ✅ **Marcar como completado** | Gestión de recomendaciones |
| ✅ **Cache optimizado** | Carga rápida sin llamadas IA repetidas |
| ✅ **Progreso por tema** | Visualización detallada por área |

---

### 🏫 Analytics Institucional (v3.2) - NUEVO
| Feature | Descripción |
|---------|-------------|
| ✅ **Teacher Dashboard** | Panel de control para profesores |
| ✅ **Student Profiles** | Perfil detallado por alumno |
| ✅ **Notas del Profesor** | Sistema de notas por alumno |
| ✅ **Objetivos de Estudio** | Metas personalizadas por estudiante |
| ✅ **Métricas Avanzadas** | Gráficos de progreso y rendimiento |
| ✅ **Export CSV** | Descarga de datos analíticos |

**Endpoints añadidos**:
- `GET /api/v1/analytics/workspace/{id}/students` - Lista alumnos con métricas
- `GET /api/v1/analytics/workspace/{id}/stats` - Estadísticas agregadas
- `POST /api/v1/teacher-notes` - Crear nota de profesor
- `POST /api/v1/student-goals` - Crear objetivo para estudiante

---

### 🔐 Google OAuth 2.0 (v3.1)
| Feature | Descripción |
|---------|-------------|
| ✅ **Login con Google** | Autenticación OAuth 2.0 completa |
| ✅ **Avatar de Google** | Foto de perfil sincronizada |
| ✅ **Registro Automático** | Crea cuenta si no existe |
| ✅ **Email Verificado** | Flag automático para cuentas OAuth |
| ✅ **Full Name Support** | Campo `full_name` en usuarios |
| ✅ **SEO Compliant** | robots.txt + sitemap.xml |

**Endpoints añadidos**:
- `GET /api/v1/auth/oauth/google/login` - Inicia flujo OAuth
- `GET /api/v1/auth/oauth/google/callback` - Callback de Google
- `GET /api/v1/users/me` - Datos del usuario autenticado

---

## 🛡️ Seguridad y Compliance

### Estado de Compliance
| Normativa | Estado | Notas |
|-----------|--------|-------|
| **RGPD (UE 2016/679)** | 🟢 95% | Falta endpoint eliminación cuenta |
| **AI Act (UE 2024/1689)** | 🟢 80% | Falta EIPD antes ago 2026 |
| **LOPDGDD (España)** | 🟢 90% | Compliance sólido |
| **OAuth 2.0** | ✅ 100% | Implementación completa |

### Arquitectura de Seguridad (20+ medidas)

#### Autenticación ✅
- Bcrypt password hashing (salt automática)
- JWT tokens (HS256, 24h expiración)
- Google OAuth 2.0 PKCE flow
- Password reset seguro (tokens UUID)
- Email verification

#### Protección de Datos ✅
- **PII Sanitization**: Redacción automática de datos personales
- **HTTPS Obligatorio**: HSTS header + TLS 1.3
- **Security Headers**: X-Frame-Options, CSP, X-XSS-Protection
- **Audit Logging**: Registro inmutable en Turso

#### Moderación IA ✅
- **Llama Guard 4**: 14 categorías de riesgo (Groq API)
- **Prompt Injection Protection**: 4 capas de filtros
- **Topic Classifier**: Validación semántica de queries
- **Content Moderation**: Bloqueo de contenido dañino

#### Rate Limiting ✅
- **Distribuido con Redis**: Upstash
- **Por tipo de endpoint**: Auth (10/min), AI (30/min), General (100/min)
- **Graceful degradation**: Fallback a memoria

---

## 🤖 Sistema de Agentes IA

Arquitectura multi-agente con **Microsoft Agent Framework**:

### 📚 TutorAgent
- **Función**: Tutor inteligente con RAG
- **Features**:
  - Búsqueda semántica en temario oficial
  - Complexity Router (ajuste dinámico reasoning)
  - Semantic Cache (30% reducción llamadas OpenAI)
  - PII Sanitization
- **Tools**: `search_temario`, `get_user_exam_history`, `get_user_weak_topics`

### 📝 ExamAgent
- **Función**: Generador de exámenes adaptativos
- **Features**:
  - Dificultad adaptativa por tema
  - Rendimiento histórico por tema
  - Estrategia personalizada (40% débiles, 30% progresión, 20% fuertes, 10% random)
- **Tools**: `fetch_questions_data`, `get_user_weak_topics`

### ✅ ValidatorAgent
- **Función**: Validador de calidad de exámenes
- **Features**:
  - Detección de errores de formato
  - Corrección ortográfica automática
  - Rechazo de preguntas ambiguas
  - Threshold de calidad (30%)

### 🎲 QuestionGeneratorAgent
- **Función**: Generador automático de preguntas difíciles
- **Features**:
  - 4 capas anti-invención (RAG obligatorio)
  - Verificación RAG post-generación (40% threshold)
  - Distractores inteligentes
  - Auto-validación

---

## 💻 Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.13)
- **Database**: Turso (SQLite on the Edge)
- **IA**: OpenAI GPT-5-mini (2025) + Embeddings 3-large
- **Cache**: Redis (Upstash) + Semantic Cache (Upstash Vector)
- **Moderation**: Llama Guard 4 (Groq API)
- **Auth**: JWT + Google OAuth 2.0
- **Payments**: Stripe API
- **Email**: Resend API
- **PDF**: fpdf2

### Frontend
- **Framework**: React 18 + Vite (TypeScript)
- **Routing**: React Router v6
- **Charts**: Recharts
- **Styles**: CSS Modules
- **State**: React Context + Hooks
- **Icons**: Lucide React

### Infrastructure
- **Hosting**: Railway (Backend + Frontend)
- **Domain**: opoguardia.com (Cloudflare DNS)
- **CDN**: Cloudflare
- **SSL**: Automatic (Let's Encrypt)
- **Monitoring**: Railway Logs

---

## 🚀 Despliegue

### Producción (Railway)
```bash
# Backend
FRONTEND_URL="https://opoguardia.com"
CORS_ORIGINS="https://opoguardia.com,http://localhost:3000"
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"

# Frontend  
VITE_API_URL="https://proyectopicolo-production.up.railway.app"
```

### Local
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 🔧 Variables de Entorno Críticas

### Backend (.env)
```env
# Base de Datos
TURSO_DATABASE_URL=libsql://xxx.turso.io
TURSO_AUTH_TOKEN=eyJxxx

# IA
OPENAI_API_KEY=sk-proj-xxx
OPENAI_CHAT_MODEL_ID=gpt-5-mini
GROQ_API_KEY=gsk_xxx  # Content Moderation

# Cache & Vector
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
UPSTASH_VECTOR_REST_URL=https://xxx.upstash.io
UPSTASH_VECTOR_REST_TOKEN=xxx
ENABLE_SEMANTIC_CACHE=true

# Auth
SECRET_KEY=xxx  # NUNCA cambiar en producción
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# Stripe
STRIPE_API_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# URLs
FRONTEND_URL=https://opoguardia.com
CORS_ORIGINS=https://opoguardia.com,http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=https://proyectopicolo-production.up.railway.app
```

---

## 📊 Arquitectura IA Avanzada

### Dificultad Adaptativa por Tema
```python
# Mapeo automático: Rendimiento → Dificultad
accuracy >= 80%  → difficulty = 3 (Difícil)   # Desafiar
60% ≤ accuracy < 80% → difficulty = 2 (Medio)  # Consolidar  
accuracy < 60%  → difficulty = 1 (Fácil)      # Reforzar
```

**Beneficios**:
- ✅ Personalización real por tema
- ✅ Progresión natural
- ✅ Mayor motivación

### LLM Complexity Router
```python
# Clasificación automática
SIMPLE (low)    → "¿cuál es?", "define"
MODERATE (medium) → "explica", "compara"
COMPLEX (high)   → "analiza", "evalúa"
```

**Ventajas**:
- ⚡ Respuestas rápidas para simples
- 🧠 Razonamiento profundo para complejas
- 💰 40% reducción tokens

### Semantic Cache
```python
# Cache por similaridad semántica
threshold = 0.93  # Muy alta precisión
TTL = configurable
```

**Impacto**:
- ✅ 30-50% menos llamadas OpenAI
- ✅ Respuestas instantáneas
- ✅ $200-300/mes ahorrados

---

## 📈 Changelog Reciente

### v3.2.1 (15 Enero 2026) - Teacher Exam Management Fixes
- ✅ **Teacher Navigation Fix**
  - Header ahora muestra "Gestión Exámenes" para profesores
  - Navegación correcta a `/teacher/exams` vs `/exam` (generador estudiante)
- ✅ **Exam Details Storage**
  - Backend guarda resultados detallados en `exam_results` y `exam_answers`
  - Almacenamiento de preguntas, respuestas y correcciones por pregunta
  - Soporte para visualización detallada de exámenes completados
- ✅ **Exam Result Viewer**
  - Nueva página `ExamResultDetail.tsx` para ver detalles completos
  - Muestra preguntas, respuestas correctas/incorrectas y explicaciones
  - Endpoint `/api/v1/workspaces/{id}/exam-results/{result_id}` con detalles
- ✅ **Institution Exam Results**
  - "Ver Detalles" en "Exámenes de Alumnos" ahora funcional
  - Navegación corregida desde tabla institucional
  - Vista completa de rendimiento por alumno

### v3.1.0 (Enero 2026) - OAuth & SEO
- ✅ **Google OAuth 2.0**
  - Login con Google completo
  - Avatar y email verificado automáticos
  - Endpoint `/api/v1/users/me`
  - Frontend URL configuration fix
- ✅ **SEO Optimization**
  - `robots.txt` creado
  - `sitemap.xml` con 6 páginas
  - Meta tags mejorados
  - Canonical URLs
- ✅ **UI/UX Improvements**
  - Colores corporativos (verde Guardia Civil)
  - Dark mode fixes
  - CSS conflicts resolved

### v2.7.0 (Diciembre 2025)
- ✅ Llama Guard 4 Content Moderation
- ✅ Semantic Cache (Upstash Vector)
- ✅ Email de análisis completado
- ✅ Animación robot IA

### v2.6.0 (Diciembre 2025)
- ✅ QuestionGeneratorAgent
- ✅ Sistema anti-invención (4 capas)
- ✅ Verificación RAG post-generación

### v2.5.0 (Diciembre 2025)
- ✅ Dificultad adaptativa por tema
- ✅ DifficultyAdapter por tema individual
- ✅ Progresión inteligente

---

## 📚 Documentación

- **[Deployment Railway](./docs/deployment_railway.md)**: Cómo desplegar en Railway
- **[Deployment Production](./docs/deployment_production.md)**: Configuración producción
- **[Workspaces](./docs/features_workspaces.md)**: Arquitectura multi-tenant
- **[Super Admin](./docs/features_super_admin.md)**: Poderes de admin global
- **[Stripe Testing](./docs/stripe_testing.md)**: Guía testing pagos
- **[Security](./docs/security/)**: Documentación completa seguridad
- **[Compliance](./docs/compliance/)**: Análisis RGPD/AI Act

---

## 🎯 Roadmap

### Q1 2026
- [ ] Endpoint DELETE /users/me (RGPD compliance 100%)
- [ ] Mobile app (React Native)
- [ ] Simulacros de examen oficial
- [ ] Sistema de badges y gamificación

### Q2 2026
- [ ] EIPD (Evaluación Impacto Protección Datos)
- [ ] Publicación Google OAuth (actualmente en Testing)
- [ ] Integración con academias oficiales
- [ ] API pública para terceros

---

## 👨‍💻 Autor

**Fernando Prada**  
AI Engineer | Senior Consultant  
[GitHub](https://github.com/Nambu89) | [LinkedIn](https://linkedin.com/in/fernando-prada)

---

## 📄 Licencia

Proyecto privado. Todos los derechos reservados.

---

**Desarrollado con ❤️ para los futuros Guardias Civiles** 🇪🇸