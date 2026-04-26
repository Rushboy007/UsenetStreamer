const { toBoolean } = require('../utils/config');

const NEWZNAB_LOG_PREFIX = '[NEWZNAB]';

function isNewznabDebugEnabled() {
  return toBoolean(process.env.DEBUG_NEWZNAB_SEARCH, false)
    || toBoolean(process.env.DEBUG_NEWZNAB_TEST, false)
    || toBoolean(process.env.DEBUG_NEWZNAB_ENDPOINTS, false);
}

function isNewznabEndpointLoggingEnabled() {
  return toBoolean(process.env.DEBUG_NEWZNAB_ENDPOINTS, false);
}

function logNewznabDebug(message, context = null) {
  if (!isNewznabDebugEnabled()) return;
  if (context && Object.keys(context).length > 0) {
    console.log(`${NEWZNAB_LOG_PREFIX}[DEBUG] ${message}`, context);
  } else {
    console.log(`${NEWZNAB_LOG_PREFIX}[DEBUG] ${message}`);
  }
}

module.exports = { isNewznabDebugEnabled, isNewznabEndpointLoggingEnabled, logNewznabDebug };
