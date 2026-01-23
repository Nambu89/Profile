# 🚀 Deploy a Vercel

## Opción 1: Deploy mediante GitHub (Recomendado)

### Paso 1: Conectar Repository
1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "Add New Project"
3. Importa el repositorio de GitHub: `Nambu89/Profile`
4. Selecciona la carpeta `portfolio` como raíz del proyecto

### Paso 2: Configuración del Proyecto
Vercel detectará automáticamente que es un proyecto Vite, pero verifica:

**Build Settings:**
- Framework Preset: `Vite`
- Root Directory: `portfolio`
- Build Command: `npm run build`
- Output Directory: `dist`

**Environment Variables:**
No hay variables de entorno necesarias para este proyecto.

### Paso 3: Deploy
1. Haz clic en "Deploy"
2. Espera a que termine el build (~2-3 minutos)
3. Tu sitio estará disponible en: `https://[tu-proyecto].vercel.app`

### Paso 4: Configurar Dominio Personalizado (Opcional)
1. En el dashboard del proyecto, ve a "Settings" → "Domains"
2. Añade tu dominio: `fernandoprada.com`
3. Sigue las instrucciones para configurar DNS

---

## Opción 2: Deploy mediante CLI

### Instalación de Vercel CLI
```bash
npm install -g vercel
```

### Login
```bash
vercel login
```

### Deploy
```bash
# Desde la carpeta portfolio
cd portfolio

# Deploy a producción
vercel --prod
```

---

## 🔄 Deploy Automático

Una vez configurado, cada push a la rama `main` desplegará automáticamente:
- **Production**: commits a `main` → deploy a producción
- **Preview**: commits a otras ramas → deploy de preview

Para desplegar manualmente desde otra rama:
```bash
git checkout claude/improve-professional-website-CWdh0
vercel --prod
```

---

## 📊 Configuración Incluida

El archivo `vercel.json` ya incluye:
- ✅ Rewrites para SPA (Single Page Application)
- ✅ Headers de seguridad (X-Frame-Options, CSP, etc.)
- ✅ Cache optimizado para assets estáticos
- ✅ Configuración framework Vite

---

## 🎯 URLs del Proyecto

**Production**: https://fernandoprada.vercel.app
**Preview**: Se genera automáticamente para cada PR

---

## 🔍 Troubleshooting

### Build falla
```bash
# Verificar que funcione localmente
npm run build

# Limpiar caché
rm -rf node_modules dist
npm install
npm run build
```

### Favicon no aparece
- Verifica que `/favicon.svg` esté en la carpeta `public`
- Limpia caché del navegador (Ctrl+Shift+R)
- Verifica en Vercel Dashboard que el archivo se haya subido

### Chat demos no funcionan
- Verifica que los endpoints estén accesibles:
  - Impuestify: https://proud-celebration-production-2fbb.up.railway.app/api/demo/chat
  - OpoGuardia: https://proyectopicolo-production.up.railway.app/api/v1/demo/chat
- Verifica CORS en los backends

---

## 📝 Notas

- El proyecto usa React + Vite + TypeScript
- Los assets se cachean por 1 año automáticamente
- El HTML se sirve con headers de seguridad
- PWA manifest incluido en `/manifest.json`
- Favicon SVG responsive incluido

---

**Última actualización**: Enero 2026
**Autor**: Fernando Prada
