const crypto = require('crypto');
const runtimeEnv = require('../../config/runtimeEnv');

const STREAM_PARAMS_ALGO = 'aes-256-gcm';
const STREAM_PARAMS_KEY_ENV = 'STREAM_PARAMS_ENCRYPTION_KEY';
let _streamParamsKey = null;

function getStreamParamsKey() {
  if (_streamParamsKey) return _streamParamsKey;
  const hexKey = (process.env[STREAM_PARAMS_KEY_ENV] || '').trim();
  if (hexKey && /^[0-9a-f]{64}$/i.test(hexKey)) {
    _streamParamsKey = Buffer.from(hexKey, 'hex');
    return _streamParamsKey;
  }
  // Generate a new random 256-bit key and persist it
  const newKey = crypto.randomBytes(32);
  runtimeEnv.updateRuntimeEnv({ [STREAM_PARAMS_KEY_ENV]: newKey.toString('hex') });
  runtimeEnv.applyRuntimeEnv();
  _streamParamsKey = newKey;
  console.log('[SECURITY] Generated new stream-params encryption key');
  return _streamParamsKey;
}

/**
 * Encrypt stream parameters so embedded download URLs / API keys are opaque.
 * Format: "e1.{iv_hex}.{ciphertext+authTag_base64url}"
 */
function encodeStreamParams(params) {
  const json = JSON.stringify(Object.fromEntries(params.entries()));
  const key = getStreamParamsKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(STREAM_PARAMS_ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const payload = Buffer.concat([encrypted, authTag]).toString('base64url');
  return `e1.${iv.toString('hex')}.${payload}`;
}

/**
 * Decrypt stream parameters. Rejects legacy unencrypted base64url for security.
 */
function decodeStreamParams(encoded) {
  try {
    if (encoded.startsWith('e1.')) {
      const parts = encoded.split('.');
      if (parts.length !== 3) return null;
      const iv = Buffer.from(parts[1], 'hex');
      const combined = Buffer.from(parts[2], 'base64url');
      if (combined.length < 16) return null;
      const authTag = combined.subarray(combined.length - 16);
      const ciphertext = combined.subarray(0, combined.length - 16);
      const key = getStreamParamsKey();
      const decipher = crypto.createDecipheriv(STREAM_PARAMS_ALGO, key, iv);
      decipher.setAuthTag(authTag);
      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return JSON.parse(decrypted.toString('utf8'));
    }
    // Legacy base64url fallback removed for security — only encrypted params accepted
    console.warn('[SECURITY] Rejected unencrypted (legacy) stream params. Re-search to get updated encrypted URLs.');
    return null;
  } catch (_) {
    return null;
  }
}

module.exports = {
  getStreamParamsKey,
  encodeStreamParams,
  decodeStreamParams,
};
