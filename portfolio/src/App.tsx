/**
 * Main App Component - Root of the application
 * Following Single Responsibility: Only handles layout composition
 */

import React, { Suspense, lazy, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Navbar, MouseGlow } from './components/layout';
import { Hero } from './components/sections/Hero';
import { ScrollProgress, FerBot } from './components/ui';

// Lazy load below-the-fold sections for better LCP
const About = lazy(() => import('./components/sections/About').then(m => ({ default: m.About })));
const Journey = lazy(() => import('./components/sections/Journey').then(m => ({ default: m.Journey })));
const Projects = lazy(() => import('./components/sections/Projects').then(m => ({ default: m.Projects })));
const Skills = lazy(() => import('./components/sections/Skills').then(m => ({ default: m.Skills })));
const Contact = lazy(() => import('./components/sections/Contact').then(m => ({ default: m.Contact })));

// Styles
import './styles/variables.css';
import './styles/base.css';
import './styles/animations.css';

const App: React.FC = () => {
  // Ensure page starts at top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Analytics />
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <ScrollProgress />
      <MouseGlow />
      <Navbar />
      <FerBot />
      <main id="main-content">
        <Hero />
        <Suspense fallback={null}>
          <About />
          <Journey />
          <Projects />
          <Skills />
          <Contact />
        </Suspense>
      </main>
    </>
  );
};

export default App;
