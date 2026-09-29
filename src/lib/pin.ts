/**
 * src/lib/pin.ts
 * PIN yönetimi: expo-secure-store ve expo-crypto kullanır.
 * 4–6 haneli PIN'ler. Hash(salt+pin) ve salt saklanır.
 * 5 ardışık yanlışta 30 saniye ceza.
 */

import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const PIN_STORE_KEY = 'app_pin_data';
const LOCKOUT_STORE_KEY = 'app_pin_lockout';

interface PinData {
  hash: string;
  salt: string;
}

interface LockoutData {
  attempts: number;
  lockedUntil: number | null; // epoch ms
}

async function getLockoutData(): Promise<LockoutData> {
  try {
    const data = await SecureStore.getItemAsync(LOCKOUT_STORE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    //
  }
  return { attempts: 0, lockedUntil: null };
}

async function setLockoutData(data: LockoutData): Promise<void> {
  await SecureStore.setItemAsync(LOCKOUT_STORE_KEY, JSON.stringify(data));
}

export async function getLockoutStatus(): Promise<{ locked: boolean; remainingSeconds: number }> {
  const data = await getLockoutData();
  if (!data.lockedUntil) return { locked: false, remainingSeconds: 0 };

  const now = Date.now();
  if (now < data.lockedUntil) {
    return { locked: true, remainingSeconds: Math.ceil((data.lockedUntil - now) / 1000) };
  }
  
  // Lockout süresi dolmuş, sıfırla
  await setLockoutData({ attempts: 0, lockedUntil: null });
  return { locked: false, remainingSeconds: 0 };
}

export async function hasPin(): Promise<boolean> {
  const data = await SecureStore.getItemAsync(PIN_STORE_KEY);
  return !!data;
}

export async function setPin(pin: string): Promise<void> {
  if (pin.length < 4 || pin.length > 6) {
    throw new Error('PIN 4 ile 6 hane arasında olmalıdır.');
  }

  const salt = Crypto.randomUUID();
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    salt + pin
  );

  const data: PinData = { hash, salt };
  await SecureStore.setItemAsync(PIN_STORE_KEY, JSON.stringify(data));
  await setLockoutData({ attempts: 0, lockedUntil: null });
}

export async function verifyPin(pin: string): Promise<boolean> {
  const status = await getLockoutStatus();
  if (status.locked) {
    throw new Error(`Çok fazla hatalı deneme. Lütfen ${status.remainingSeconds} saniye bekleyin.`);
  }

  const storedStr = await SecureStore.getItemAsync(PIN_STORE_KEY);
  if (!storedStr) return false; // PIN ayarlanmamış
  
  const stored: PinData = JSON.parse(storedStr);
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    stored.salt + pin
  );

  if (hash === stored.hash) {
    // Başarılı, lockout'u sıfırla
    await setLockoutData({ attempts: 0, lockedUntil: null });
    return true;
  } else {
    // Hatalı
    const lockout = await getLockoutData();
    lockout.attempts += 1;
    if (lockout.attempts >= 5) {
      lockout.lockedUntil = Date.now() + 30 * 1000; // 30 saniye ceza
    }
    await setLockoutData(lockout);
    return false;
  }
}

export async function clearPinData(): Promise<void> {
  await SecureStore.deleteItemAsync(PIN_STORE_KEY);
  await SecureStore.deleteItemAsync(LOCKOUT_STORE_KEY);
}
