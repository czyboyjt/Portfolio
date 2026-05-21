
// Fix: Import React to resolve 'Cannot find namespace React' error in TypeScript definitions
import React from 'react';

// Fix: Added ChatMessage interface to resolve 'Cannot find member ChatMessage' errors
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ProcessStep {
  title: string;
  subtitle: string;
  imageUrl: string;
  ideationText: string;
}

export interface ImpactStat {
  value: string;
  label: string;
  description: string;
}

export interface ProjectFeature {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  overviewImageUrl?: string; 
  year?: string;
  duration?: string;
  role?: string;
  org?: string;
  team?: string;
  collaborators?: string[];
  tools?: string[];
  challenge?: string;
  solution?: string;
  solutionImage?: string;
  features?: ProjectFeature[];
  quote?: string; 
  problemStatement?: string;
  researchOverview?: string; 
  researchInsights?: string;
  researchInsight2?: string;
  researchInsight3?: string;
  researchImage1?: string | string[]; 
  researchImage1Label?: string;
  researchImage2?: string; 
  researchImage2Label?: string;
  researchImage3?: string; 
  researchImage3Label?: string;
  researchImage4?: string; 
  researchImage4Label?: string;
  researchCarousel?: { url: string; label?: string }[];
  methods?: string; 
  painPoints?: string; 
  impactMetric?: string;
  impactLabel?: string;
  primaryImpactLabel?: string;
  primaryImpactDescription?: string;
  impactStats?: ImpactStat[];
  reflection?: string;
  nextSteps?: string;
  processDescription?: string;
  processSteps?: ProcessStep[];
  conclusion?: string;
  // Design section fields
  designRational?: string;
  designTypography?: string;
  designMainImage?: string;
  designMainVideo?: string;
  designDetailImage1?: string | string[];
  designDetailImage2?: string | string[];
  designDetailImage3?: string;
  designSystemTitle?: string;
  designSystemDescription?: string;
  // Palette fields
  designColorPrimary?: string;
  designColorAccent?: string;
  designColorNeutral?: string;
  previewVideoUrl?: string;
  // Overview fields
  designOverviewSubtext?: string;
  externalUrl?: string;
}

export type View = 'work' | 'case-studies' | 'info' | 'project-detail';

export enum Section {
  HERO = 'hero',
  WORK = 'work',
  PROJECTS = 'projects',
  CONTACT = 'contact'
}
