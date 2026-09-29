/**
 * src/lib/id.ts
 * expo-crypto ile UUID v4 üretimi.
 */

import * as Crypto from 'expo-crypto';

/** RFC 4122 UUID v4 üretir. */
export function newId(): string {
  return Crypto.randomUUID();
}
