/**
 * Main App Component - Root of the application
 * Following Single Responsibility: Only handles layout composition
 */

import React from 'react';
import { Navbar, MouseGlow } from './components/layout';
import { Hero, About, Journey, Projects, Skills, Contact } from './components/sections';
import { ScrollProgress } from './components/ui';

// Styles
import './styles/variables.css';
import './styles/base.css';
import './styles/animations.css';

const App: React.FC = () => {
  return (
    <>
      <ScrollProgress />
      <MouseGlow />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Journey />
        <Projects />
        <Skills />
        <Contact />
      </main>
    </>
  );
};

export default App;
