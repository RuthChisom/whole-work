// src/lib/aleph/example.ts
// End-to-end usage example — how WholeWork uses Aleph Cloud.
// Run with: npx tsx src/lib/aleph/example.ts

import {
  getOrCreateDemoAccount,
  getAuthClient,
  getReadClient,
  saveCareerEvent,
  updateCareerEvent,
  getCareerEvents,
  savePassportMetadata,
  getPassportMetadata,
} from './index';
import type { CareerEvent, PassportMetadata } from '../../types/career-event';

async function main() {
  // =========================================================================
  // STEP 1: Create a demo wallet (or load from env/localStorage)
  // =========================================================================
  console.log('--- Step 1: Create demo account ---');
  const { account, mnemonic } = getOrCreateDemoAccount();
  console.log(`Wallet address: ${account.address}`);
  if (mnemonic) {
    console.log(`Mnemonic (save this!): ${mnemonic}`);
  }

  // Create clients
  const authClient = getAuthClient(account);   // read + write
  const readClient = getReadClient();           // read only (no wallet)

  const passportSlug = 'sarah-jones';

  // =========================================================================
  // STEP 2: Save passport metadata (Aleph Aggregate)
  // =========================================================================
  console.log('\n--- Step 2: Save passport metadata ---');
  const metadata: PassportMetadata = {
    slug: passportSlug,
    displayName: 'Sarah Jones',
    summary:
      'Operations leader with 8+ years of experience spanning marketing, ' +
      'household management, and community technology leadership. Skilled ' +
      'in budget optimization, stakeholder coordination, and crisis response.',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await savePassportMetadata(authClient, metadata);
  console.log('Passport metadata saved to Aleph (aggregate)');

  // =========================================================================
  // STEP 3: Save career events (Aleph Posts)
  // =========================================================================
  console.log('\n--- Step 3: Save career events ---');

  const jobEvent: CareerEvent = {
    id: 'evt_001',
    type: 'job',
    title: 'Marketing Coordinator',
    organization: 'Bloom Agency',
    description:
      'Led social media strategy and client communications for a boutique agency.',
    startDate: '2016-06',
    endDate: '2019-02',
    skills: [
      { name: 'Social Media Strategy', category: 'creative' },
      { name: 'Client Communication', category: 'communication' },
    ],
    visibility: 'public',
    aiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const caregivingEvent: CareerEvent = {
    id: 'evt_002',
    type: 'caregiving',
    title: 'Primary Caregiver — Two Children',
    organization: null,
    description:
      'Managed household operations for a family of four, including budgeting, ' +
      'scheduling, vendor negotiations, and crisis response.',
    startDate: '2019-03',
    endDate: '2023-08',
    skills: [
      { name: 'Budget Management', category: 'operational' },
      { name: 'Crisis Response', category: 'leadership' },
      { name: 'Schedule Coordination', category: 'operational' },
    ],
    visibility: 'public',
    aiGenerated: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const jobHash = await saveCareerEvent(authClient, jobEvent, passportSlug);
  console.log(`Job event saved. Hash: ${jobHash}`);

  const caregivingHash = await saveCareerEvent(authClient, caregivingEvent, passportSlug);
  console.log(`Caregiving event saved. Hash: ${caregivingHash}`);

  // =========================================================================
  // STEP 4: Update an event (Aleph amend)
  // =========================================================================
  console.log('\n--- Step 4: Update an event ---');
  const updatedCaregiving: CareerEvent = {
    ...caregivingEvent,
    description:
      'Directed household operations for a family of four with a $4K/month budget. ' +
      'Led a 12-person parent volunteer committee. Coordinated medical, educational, ' +
      'and extracurricular schedules across multiple providers.',
    updatedAt: new Date().toISOString(),
  };

  const amendHash = await updateCareerEvent(
    authClient,
    caregivingHash,
    updatedCaregiving,
    passportSlug,
  );
  console.log(`Event amended. New hash: ${amendHash}`);

  // =========================================================================
  // STEP 5: Retrieve everything (public passport page view)
  // =========================================================================
  console.log('\n--- Step 5: Retrieve public passport ---');

  const passportMeta = await getPassportMetadata(readClient, account.address);
  console.log(`Passport: ${passportMeta?.displayName}`);
  console.log(`Summary: ${passportMeta?.summary}`);

  const events = await getCareerEvents(readClient, passportSlug, { publicOnly: true });
  console.log(`\nTimeline (${events.length} events):`);
  for (const event of events) {
    const end = event.endDate ?? 'present';
    console.log(`  ${event.startDate} – ${end}  |  ${event.title}`);
    console.log(`    Skills: ${event.skills.map((s) => s.name).join(', ')}`);
  }
}

main().catch(console.error);
