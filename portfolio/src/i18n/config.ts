import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { en } from './locales/en';
import { es } from './locales/es';

i18n
  .use(LanguageDetector) // Detecta el idioma del navegador
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es }
    },
    fallbackLng: 'es', // Español por defecto
    lng: localStorage.getItem('language') || 'es',
    interpolation: {
      escapeValue: false // React ya escapa por defecto
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
