/**
 * Type definitions for the portfolio
 * Following Interface Segregation Principle - specific interfaces for each domain
 */

// =========================================
// Personal Data Types
// =========================================

export interface PersonalInfo {
  name: string;
  title: string;
  subtitle: string;
  location: string;
  email: string;
  bio: string[];
}

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
}

// =========================================
// Experience Types
// =========================================

export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
  highlights: string[];
  technologies?: string[];
  type: 'military' | 'corporate' | 'tech';
  logo?: string;
}

// =========================================
// Project Types
// =========================================

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  features: string[];
  liveUrl?: string;
  githubUrl?: string;
  image?: string;
  status: 'production' | 'development' | 'archived';
  highlighted: boolean;
  category: 'ai' | 'web' | 'automation' | 'other';

  // Case Study Fields (for highlighted projects)
  problem?: string;
  approach?: string;
  impact?: string[];
  role?: string;
  constraints?: string[];
}

// =========================================
// Skills Types
// =========================================

export type SkillCategory = 'ai' | 'backend' | 'frontend' | 'cloud' | 'tools';

export interface Skill {
  id: string;
  name: string;
  icon?: string;
  category: SkillCategory;
  level: 'expert' | 'advanced' | 'intermediate';
}

export interface SkillGroup {
  category: SkillCategory;
  title: string;
  skills: Skill[];
}

// =========================================
// Navigation Types
// =========================================

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

// =========================================
// Animation Types
// =========================================

export interface AnimationConfig {
  duration: number;
  delay: number;
  ease: string;
}

// =========================================
// Certification Types
// =========================================

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
  badgeUrl?: string;
  featured: boolean;
}
