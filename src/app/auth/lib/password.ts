import { K, N, p, r } from '@/config/auth';
import { BinaryLike, randomBytes, scrypt, ScryptOptions, timingSafeEqual } from 'node:crypto';

type NonSharedBuffer = Buffer<ArrayBuffer>

function scryptAsync(password: BinaryLike, salt: BinaryLike, keyLength: number, options: ScryptOptions) {
  return new Promise<NonSharedBuffer>((res, rej) => {
    scrypt(password, salt, keyLength, options, (err, dk) => {
      if (err) rej(err);
      else res(dk);
    })
  })
}

// DO NOT EDIT THIS FUNCTION UNDER ANY CIRCUMSTANCES.
// AUTHENTICATION WILL BREAK.
async function hash(password: string): Promise<string> {
    const salt = randomBytes(32);
    const derivedKey = await scryptAsync(password, salt, K, { N, r, p });
    return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

// YOU MAY NOT CHANGE THE CORE LOGIC OF THIS FUNCTION, BUT IT IS UP
// FOR PATCHES IF VULNERABLE.
async function verify(inputPassword: string, storedHash: string): Promise<boolean> {
  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) return false;

  const saltBuffer = Buffer.from(salt, 'hex');
  const originalHashBuffer =  Buffer.from(originalHash, 'hex');
  const inputHashBuffer = await scryptAsync(inputPassword, saltBuffer, K, { N, r, p });

  return timingSafeEqual(
    originalHashBuffer,
    inputHashBuffer
  );
}

export { hash, verify };