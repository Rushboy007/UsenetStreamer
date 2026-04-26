const { QUALITY_FEATURE_PATTERNS } = require('../services/metadata/releaseParser');

function formatResolutionBadge(resolution) {
  if (!resolution) return null;
  const normalized = resolution.toLowerCase();

  if (normalized === '8k' || normalized === '4320p') return '8K';
  if (normalized === '4k' || normalized === '2160p' || normalized === 'uhd') return '4K';

  if (normalized.endsWith('p')) return normalized.toUpperCase();
  return resolution;
}

function extractQualityFeatureBadges(title) {
  if (!title) return [];
  const badges = [];
  QUALITY_FEATURE_PATTERNS.forEach(({ label, regex }) => {
    if (regex.test(title)) {
      badges.push(label);
    }
  });
  return badges;
}

function summarizeNewznabPlan(plan) {
  if (!plan || typeof plan !== 'object') {
    return null;
  }
  return {
    type: plan.type || null,
    query: plan.rawQuery || plan.query || null,
    tokens: Array.isArray(plan.tokens) ? plan.tokens.filter(Boolean) : [],
  };
}

module.exports = {
  formatResolutionBadge,
  extractQualityFeatureBadges,
  summarizeNewznabPlan,
};
