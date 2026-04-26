const TITLE_SIMILARITY_THRESHOLD = 0.85;

function sanitizeStrictSearchPhrase(text) {
  if (!text) return '';
  return text
    .replace(/&/g, ' and ')
    .replace(/[\.\-_:\s]+/g, ' ')
    .replace(/[^\w\sÀ-ÿ]/g, '')
    .toLowerCase()
    .trim();
}

function matchesStrictSearch(title, strictPhrase) {
  if (!strictPhrase) return true;
  const candidate = sanitizeStrictSearchPhrase(title);
  if (!candidate) return false;
  if (candidate === strictPhrase) return true;
  const candidateTokens = candidate.split(' ').filter(Boolean);
  const phraseTokens = strictPhrase.split(' ').filter(Boolean);
  if (phraseTokens.length === 0) return true;

  // Nothing before first query token, nothing after last query token, gaps allowed in between
  if (candidateTokens[0] !== phraseTokens[0]) return false;
  if (candidateTokens[candidateTokens.length - 1] !== phraseTokens[phraseTokens.length - 1]) return false;
  // Remaining tokens must appear in order, gaps allowed
  let candidateIdx = 1;
  for (let i = 1; i < phraseTokens.length; i += 1) {
    const token = phraseTokens[i];
    let found = false;
    while (candidateIdx < candidateTokens.length) {
      if (candidateTokens[candidateIdx] === token) {
        found = true;
        candidateIdx += 1;
        break;
      }
      candidateIdx += 1;
    }
    if (!found) return false;
  }
  return true;
}

function normaliseTitle(text) {
  if (!text) return '';
  return text
    .replace(/&/g, 'and')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // strip diacritics
    .replace(/[^\p{L}\p{N}]/gu, '')   // strip ALL non-alphanumeric
    .toLowerCase();
}

function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function levenshteinRatio(a, b) {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
}

function titleSimilarityCheck(candidateParsedTitle, queryParsedTitle) {
  if (!candidateParsedTitle || !queryParsedTitle) return true;
  const normCandidate = normaliseTitle(candidateParsedTitle);
  const normQuery = normaliseTitle(queryParsedTitle);
  if (!normCandidate || !normQuery) return true;
  if (normCandidate === normQuery) return true;
  return levenshteinRatio(normCandidate, normQuery) >= TITLE_SIMILARITY_THRESHOLD;
}

module.exports = {
  TITLE_SIMILARITY_THRESHOLD,
  sanitizeStrictSearchPhrase,
  matchesStrictSearch,
  normaliseTitle,
  levenshteinDistance,
  levenshteinRatio,
  titleSimilarityCheck,
};
