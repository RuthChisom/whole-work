// src/lib/aleph/index.ts
// Public API for the Aleph integration layer.

export { ALEPH_CONFIG } from './config';
export { getReadClient, getAuthClient, getOrCreateDemoAccount, getAccountFromKey } from './client';
export {
  saveCareerEvent,
  updateCareerEvent,
  getCareerEvents,
  getCareerEventsByOwner,
  savePassportMetadata,
  getPassportMetadata,
} from './storage';
