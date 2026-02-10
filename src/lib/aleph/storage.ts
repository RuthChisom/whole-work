// src/lib/aleph/storage.ts
// Store and retrieve Career Events + Passport metadata on Aleph Cloud.
//
// Data mapping:
//   Career Events  → Aleph Posts  (type: 'career-event')
//   Passport meta  → Aleph Aggregate (key: 'passport')
//
// Posts are queryable by type, tags, channel, and sender address.
// Aggregates are key-value pairs scoped to a wallet address.

import { AuthenticatedAlephHttpClient, AlephHttpClient } from '@aleph-sdk/client';
import { ALEPH_CONFIG } from './config';
import type {
  CareerEvent,
  CareerEventPostContent,
  PassportMetadata,
} from '../../types/career-event';

const { channel, postTypes, aggregateKeys } = ALEPH_CONFIG;

// ---------------------------------------------------------------------------
// CAREER EVENTS (Aleph Posts)
// ---------------------------------------------------------------------------

/**
 * Save a new Career Event to Aleph Cloud.
 *
 * Each event is stored as an individual Post, tagged with the passport slug
 * so we can query all events belonging to a passport.
 *
 * Returns the Aleph message item_hash (used as the event's on-chain ID).
 */
export async function saveCareerEvent(
  client: AuthenticatedAlephHttpClient,
  event: CareerEvent,
  passportSlug: string,
): Promise<string> {
  const content: CareerEventPostContent = {
    ...event,
    passportSlug,
  };

  const message = await client.createPost({
    postType: postTypes.careerEvent,
    content,
    channel,
    tags: [
      `passport:${passportSlug}`,
      `type:${event.type}`,
      `visibility:${event.visibility}`,
    ],
    sync: true,
  });

  return message.item_hash;
}

/**
 * Update an existing Career Event by amending the original Post.
 *
 * Aleph posts are immutable, but you can "amend" them by creating a new
 * post with postType 'amend' that references the original item_hash.
 * The API automatically resolves the latest version.
 */
export async function updateCareerEvent(
  client: AuthenticatedAlephHttpClient,
  originalHash: string,
  updated: CareerEvent,
  passportSlug: string,
): Promise<string> {
  const content: CareerEventPostContent = {
    ...updated,
    passportSlug,
  };

  const message = await client.createPost({
    postType: 'amend',
    ref: originalHash,
    content,
    channel,
    tags: [
      `passport:${passportSlug}`,
      `type:${updated.type}`,
      `visibility:${updated.visibility}`,
    ],
    sync: true,
  });

  return message.item_hash;
}

/**
 * Retrieve all Career Events for a passport (by slug).
 *
 * Used on the public passport page — no auth required.
 * Set `publicOnly: true` to filter out private events (default for public view).
 */
export async function getCareerEvents(
  client: AlephHttpClient,
  passportSlug: string,
  options: { publicOnly?: boolean } = { publicOnly: true },
): Promise<CareerEventPostContent[]> {
  const tags = [`passport:${passportSlug}`];
  if (options.publicOnly) {
    tags.push('visibility:public');
  }

  const response = await client.getPosts<CareerEventPostContent>({
    types: [postTypes.careerEvent],
    channels: [channel],
    tags,
    pagination: 100,
    page: 1,
  });

  // Sort by startDate ascending (chronological timeline)
  return response.posts
    .map((post) => post.content)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/**
 * Retrieve all Career Events owned by a specific wallet address.
 *
 * Used on the dashboard — shows all events (public + private) for the
 * logged-in user.
 */
export async function getCareerEventsByOwner(
  client: AlephHttpClient,
  ownerAddress: string,
): Promise<CareerEventPostContent[]> {
  const response = await client.getPosts<CareerEventPostContent>({
    types: [postTypes.careerEvent],
    channels: [channel],
    addresses: [ownerAddress],
    pagination: 100,
    page: 1,
  });

  return response.posts
    .map((post) => post.content)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

// ---------------------------------------------------------------------------
// PASSPORT METADATA (Aleph Aggregates)
// ---------------------------------------------------------------------------

/**
 * Save or update passport metadata (summary, slug, display name).
 *
 * Aggregates are key-value pairs scoped to a wallet address.
 * Calling this again for the same address merges/overwrites the value.
 */
export async function savePassportMetadata(
  client: AuthenticatedAlephHttpClient,
  metadata: PassportMetadata,
): Promise<void> {
  await client.createAggregate({
    key: aggregateKeys.passport,
    content: metadata,
    channel,
    sync: true,
  });
}

/**
 * Retrieve passport metadata for a wallet address.
 *
 * Returns null if no passport exists yet.
 */
export async function getPassportMetadata(
  client: AlephHttpClient,
  ownerAddress: string,
): Promise<PassportMetadata | null> {
  try {
    return await client.fetchAggregate<PassportMetadata>(
      ownerAddress,
      aggregateKeys.passport,
    );
  } catch {
    // Aggregate doesn't exist yet
    return null;
  }
}
