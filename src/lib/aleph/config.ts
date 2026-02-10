// src/lib/aleph/config.ts
// Aleph Cloud configuration for WholeWork.

export const ALEPH_CONFIG = {
  // Channel name scopes all WholeWork data on the Aleph network
  channel: process.env.NEXT_PUBLIC_ALEPH_CHANNEL || 'wholework',

  // Aleph API endpoint
  apiServer: process.env.NEXT_PUBLIC_ALEPH_API || 'https://api3.aleph.im/',

  // Post types used by WholeWork
  postTypes: {
    careerEvent: 'career-event',
    questionnaire: 'questionnaire',
  },

  // Aggregate keys used by WholeWork
  aggregateKeys: {
    passport: 'passport',
    profile: 'profile',
  },
} as const;
