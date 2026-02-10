// src/lib/aleph/client.ts
// Aleph Cloud client initialization for WholeWork.
//
// Two clients:
// - AlephHttpClient:              read-only, no wallet needed (public passport pages)
// - AuthenticatedAlephHttpClient: read+write, requires a wallet (logged-in users)

import { AlephHttpClient, AuthenticatedAlephHttpClient } from '@aleph-sdk/client';
import { ETHAccount, importAccountFromPrivateKey, newAccount } from '@aleph-sdk/ethereum';
import { ALEPH_CONFIG } from './config';

// ---------------------------------------------------------------------------
// Read-only client (singleton) — used for public passport pages
// ---------------------------------------------------------------------------

let _readClient: AlephHttpClient | null = null;

export function getReadClient(): AlephHttpClient {
  if (!_readClient) {
    _readClient = new AlephHttpClient(ALEPH_CONFIG.apiServer);
  }
  return _readClient;
}

// ---------------------------------------------------------------------------
// Authenticated client — requires an ETHAccount
// ---------------------------------------------------------------------------

export function getAuthClient(account: ETHAccount): AuthenticatedAlephHttpClient {
  return new AuthenticatedAlephHttpClient(account, ALEPH_CONFIG.apiServer);
}

// ---------------------------------------------------------------------------
// Account helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'wholework_wallet_key';

/**
 * For the hackathon demo: generate a throwaway Ethereum keypair
 * and persist it in localStorage so the user keeps their identity
 * across page reloads.
 *
 * NOT for production — in production, use MetaMask / WalletConnect.
 */
export function getOrCreateDemoAccount(): { account: ETHAccount; mnemonic: string | null } {
  if (typeof window === 'undefined') {
    // Server-side: use env var or generate ephemeral
    const key = process.env.ALEPH_PRIVATE_KEY;
    if (key) {
      return { account: importAccountFromPrivateKey(key), mnemonic: null };
    }
    const fresh = newAccount();
    return { account: fresh.account, mnemonic: fresh.mnemonic };
  }

  // Client-side: check localStorage first
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return { account: importAccountFromPrivateKey(stored), mnemonic: null };
  }

  // First visit: generate new account, persist private key
  const { account, mnemonic } = newAccount();
  const privateKey = (account.wallet as { privateKey: string }).privateKey;
  localStorage.setItem(STORAGE_KEY, privateKey);
  return { account, mnemonic };
}

/**
 * Import an account from a private key (for server-side API routes).
 */
export function getAccountFromKey(privateKey: string): ETHAccount {
  return importAccountFromPrivateKey(privateKey);
}
