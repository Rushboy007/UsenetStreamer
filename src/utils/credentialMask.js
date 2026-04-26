// Zero-width space sentinel — visually invisible, never a real env value.
const CREDENTIAL_MASK_SENTINEL = '​__MASKED_CREDENTIAL__​';

const SENSITIVE_KEYS = new Set([
  'INDEXER_MANAGER_API_KEY',
  'NZBDAV_API_KEY',
  'NZBDAV_WEBDAV_PASS',
  'NZB_TRIAGE_NNTP_PASS',
  'EASYNEWS_PASSWORD',
  'TMDB_API_KEY',
  'TVDB_API_KEY',
  'SPECIAL_PROVIDER_SECRET',
]);

const SENSITIVE_KEY_PATTERNS = [/^NEWZNAB_API_KEY_\d+$/];

function isSensitiveKey(key) {
  if (SENSITIVE_KEYS.has(key)) return true;
  return SENSITIVE_KEY_PATTERNS.some((rx) => rx.test(key));
}

function maskSensitiveValues(values) {
  const masked = { ...values };
  Object.keys(masked).forEach((key) => {
    if (isSensitiveKey(key) && masked[key]) {
      masked[key] = CREDENTIAL_MASK_SENTINEL;
    }
  });
  return masked;
}

function unsentinelValues(values) {
  if (!values || typeof values !== 'object') return values;
  const resolved = { ...values };
  Object.keys(resolved).forEach((key) => {
    if (resolved[key] === CREDENTIAL_MASK_SENTINEL) {
      resolved[key] = process.env[key] || '';
    }
  });
  return resolved;
}

module.exports = {
  CREDENTIAL_MASK_SENTINEL,
  SENSITIVE_KEYS,
  SENSITIVE_KEY_PATTERNS,
  isSensitiveKey,
  maskSensitiveValues,
  unsentinelValues,
};
