# Deployment Guide - Portfolio with FerBot

Este proyecto está configurado para desplegarse completamente en Vercel (frontend + backend API).

## Estructura del Proyecto

```
portfolio/
├── api/                    # Backend API (Vercel Serverless Functions)
│   ├── chat.py            # Endpoint de chat de FerBot
│   ├── health.py          # Health check
│   ├── _shared.py         # Servicios compartidos (RAG, embeddings)
│   ├── data/              
│   │   └── CV_LinkedIn.pdf # CV de Fernando
│   └── requirements.txt   # Dependencias de Python
├── src/                   # Frontend React
└── vercel.json           # Configuración de Vercel

```

## Variables de Entorno en Vercel

Antes de desplegar, configura estas variables de entorno en Vercel:

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Añade:

```
OPENAI_API_KEY=tu_api_key_de_openai
```

## Despliegue

### Opción 1: Desde GitHub (Recomendado)

1. Push a GitHub:
```bash
git add .
git commit -m "Add FerBot API to Vercel"
git push
```

2. Vercel detectará los cambios y desplegará automáticamente

### Opción 2: Desde CLI de Vercel

```bash
cd portfolio
vercel --prod
```

## Verificación del Deployment

1. **Frontend**: https://tu-dominio.vercel.app
2. **API Health**: https://tu-dominio.vercel.app/api/health
3. **FerBot Chat**: 
   - Click en el botón "Hablemos" o en el botón flotante verde
   - Prueba con preguntas como "¿Cuál es tu experiencia con IA?"

## Rutas de la API

- `/api/ferbot/chat` → Chat endpoint (POST)
- `/api/ferbot/health` → Health check (GET)

**Nota**: En producción, `/api/ferbot/*` se reescribe a `/api/*` (configurado en vercel.json)

## Desarrollo Local

### Frontend
```bash
cd portfolio
npm run dev
```

### Backend (opcional, para testing local)
```bash
cd FerBot/backend
uvicorn app.main:app --reload
```

El proxy de Vite redirige `/api/ferbot/*` a `localhost:8000` en desarrollo.

## Troubleshooting

### API no responde
- Verifica que `OPENAI_API_KEY` esté configurada en Vercel
- Revisa los logs en Vercel Dashboard → Deployments → [tu deploy] → Function Logs

### CORS errors
- El vercel.json incluye headers CORS
- Las serverless functions tienen CORS middleware

### Cold starts lentos
- Primera llamada después de inactividad puede tardar 5-10s
- Vercel cachea las funciones warm por ~5 minutos
- Los embeddings se cargan en memoria en el primer request

## Optimizaciones

Para reducir cold starts:
1. Los embeddings se cachean en memoria global
2. El CV se parsea solo una vez por función warm
3. Las dependencias se instalan automáticamente por Vercel

## Monitoreo

- **Analytics**: Vercel Analytics está activado
- **Function Logs**: Disponibles en Vercel Dashboard
- **Errors**: Se muestran en el chat al usuario
