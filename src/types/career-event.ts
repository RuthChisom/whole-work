// src/types/career-event.ts
// The atomic unit of a WholeWork career passport.

export const EVENT_TYPES = [
  'job',
  'caregiving',
  'learning',
  'volunteer',
  'project',
  'gap',
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const SKILL_CATEGORIES = [
  'technical',
  'leadership',
  'communication',
  'operational',
  'creative',
  'other',
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export type Visibility = 'public' | 'private';

export interface Skill {
  name: string;
  category: SkillCategory;
}

export interface CareerEvent {
  id: string;
  type: EventType;
  title: string;
  organization?: string | null;
  description: string;
  startDate: string;       // YYYY-MM
  endDate: string | null;  // YYYY-MM or null = ongoing
  skills: Skill[];
  visibility: Visibility;
  aiGenerated: boolean;
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
}

// What we store as the Aleph Post content
export interface CareerEventPostContent extends CareerEvent {
  passportSlug: string;    // links this event to a passport
}

// Passport metadata stored as an Aleph Aggregate
export interface PassportMetadata {
  slug: string;
  displayName: string;
  summary: string;         // AI-generated professional summary
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}
