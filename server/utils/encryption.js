/**
 * encryption.js
 * Field-level encryption utilities for sensitive data
 * Uses AES-256-GCM for authenticated encryption
 *
 * CRITICAL: Set DATA_ENCRYPTION_KEY environment variable (32 bytes, base64 encoded)
 * Generate key: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32; // 256 bits for key derivation

/**
 * Get encryption key from environment
 * Falls back to a default key for development (NOT FOR PRODUCTION)
 */
function getEncryptionKey() {
  const key = process.env.DATA_ENCRYPTION_KEY;

  if (!key) {
    console.warn(
      '⚠️  WARNING: DATA_ENCRYPTION_KEY not set. Using development key. DO NOT USE IN PRODUCTION!'
    );
    // Development-only fallback (32 bytes)
    return Buffer.from('dev-key-not-for-production!!', 'utf8');
  }

  try {
    // Decode base64 key
    const decoded = Buffer.from(key, 'base64');
    if (decoded.length !== 32) {
      throw new Error(`Invalid key length: ${decoded.length} bytes (expected 32)`);
    }
    return decoded;
  } catch (error) {
    throw new Error(`Invalid DATA_ENCRYPTION_KEY: ${error.message}`);
  }
}

/**
 * Encrypt data with AES-256-GCM
 * @param {string} plaintext - Data to encrypt
 * @returns {string} - Encrypted data in format: iv:authTag:salt:ciphertext (all base64)
 */
function encrypt(plaintext) {
  if (!plaintext || typeof plaintext !== 'string') {
    throw new Error('Plaintext must be a non-empty string');
  }

  try {
    // Generate random IV and salt
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Derive key with salt (adds additional security layer)
    const masterKey = getEncryptionKey();
    const key = crypto.pbkdf2Sync(masterKey, salt, 100000, 32, 'sha256');

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    // Return format: iv:authTag:salt:ciphertext
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${salt.toString('base64')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt data encrypted with encrypt()
 * @param {string} encryptedData - Encrypted data in format: iv:authTag:salt:ciphertext
 * @returns {string} - Decrypted plaintext
 */
function decrypt(encryptedData) {
  if (!encryptedData || typeof encryptedData !== 'string') {
    throw new Error('Encrypted data must be a non-empty string');
  }

  try {
    // Parse encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivB64, authTagB64, saltB64, ciphertext] = parts;

    // Decode components
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');
    const salt = Buffer.from(saltB64, 'base64');

    // Validate lengths
    if (iv.length !== IV_LENGTH) {
      throw new Error('Invalid IV length');
    }
    if (authTag.length !== AUTH_TAG_LENGTH) {
      throw new Error('Invalid auth tag length');
    }
    if (salt.length !== SALT_LENGTH) {
      throw new Error('Invalid salt length');
    }

    // Derive key with salt
    const masterKey = getEncryptionKey();
    const key = crypto.pbkdf2Sync(masterKey, salt, 100000, 32, 'sha256');

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    throw new Error('Decryption failed - data may be corrupted or tampered with');
  }
}

/**
 * Check if data appears to be encrypted
 * @param {string} data - Data to check
 * @returns {boolean} - True if data looks encrypted
 */
function isEncrypted(data) {
  if (!data || typeof data !== 'string') {
    return false;
  }

  // Check format: should have 4 base64 parts separated by colons
  const parts = data.split(':');
  if (parts.length !== 4) {
    return false;
  }

  // Check if parts look like base64
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  return parts.every((part) => base64Regex.test(part));
}

/**
 * Encrypt sensitive fields in an object
 * @param {object} obj - Object with data to encrypt
 * @param {string[]} fields - Field names to encrypt
 * @returns {object} - Object with encrypted fields
 */
function encryptFields(obj, fields) {
  const result = { ...obj };

  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = encrypt(result[field]);
    }
  }

  return result;
}

/**
 * Decrypt sensitive fields in an object
 * @param {object} obj - Object with encrypted data
 * @param {string[]} fields - Field names to decrypt
 * @returns {object} - Object with decrypted fields
 */
function decryptFields(obj, fields) {
  const result = { ...obj };

  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string' && isEncrypted(result[field])) {
      try {
        result[field] = decrypt(result[field]);
      } catch (error) {
        console.error(`Failed to decrypt field ${field}:`, error.message);
        // Leave encrypted if decryption fails
      }
    }
  }

  return result;
}

/**
 * Hash sensitive data (one-way, for verification only)
 * @param {string} data - Data to hash
 * @returns {string} - SHA-256 hash (hex)
 */
function hash(data) {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

/**
 * Generate encryption key (for initial setup)
 * @returns {string} - Base64-encoded 32-byte key
 */
function generateKey() {
  return crypto.randomBytes(32).toString('base64');
}

module.exports = {
  encrypt,
  decrypt,
  isEncrypted,
  encryptFields,
  decryptFields,
  hash,
  generateKey,
};

// Test encryption on module load (development only)
if (process.env.NODE_ENV !== 'production') {
  try {
    const testData = 'Test encryption data';
    const encrypted = encrypt(testData);
    const decrypted = decrypt(encrypted);

    if (decrypted !== testData) {
      console.error('❌ Encryption self-test FAILED');
    } else {
      console.log('✅ Encryption module loaded and verified');
    }
  } catch (error) {
    console.error('❌ Encryption self-test error:', error.message);
  }
}
