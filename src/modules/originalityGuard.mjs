import crypto from 'crypto';

function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function normalizeForFingerprint(text) {
  return cleanText(text)
    .replace(/[^\p{L}\p{N}\s]/gu, '');
}

function createHash(text) {
  return crypto
    .createHash('sha256')
    .update(text)
    .digest('hex');
}

export function createContentFingerprint(content) {
  const normalized =
    normalizeForFingerprint(content);

  if (!normalized) {
    throw new Error(
      '[OriginalityGuard] Content is required.'
    );
  }

  return createHash(normalized);
}

export function compareContent(
  contentA,
  contentB
) {
  const a =
    normalizeForFingerprint(contentA);

  const b =
    normalizeForFingerprint(contentB);

  if (!a || !b) {
    return {
      similar: false,
      similarity: 0
    };
  }

  if (a === b) {
    return {
      similar: true,
      similarity: 1
    };
  }

  const wordsA = new Set(a.split(/\s+/));
  const wordsB = new Set(b.split(/\s+/));

  const intersection =
    [...wordsA].filter(
      word => wordsB.has(word)
    ).length;

  const union =
    new Set([
      ...wordsA,
      ...wordsB
    ]).size;

  const similarity =
    union === 0
      ? 0
      : intersection / union;

  return {
    similar: similarity >= 0.85,
    similarity
  };
}

export function checkDuplicateContent(
  content,
  previousContents = []
) {
  const currentFingerprint =
    createContentFingerprint(content);

  for (
    const previous of previousContents
  ) {
    const previousContent =
      typeof previous === 'string'
        ? previous
        : previous?.content;

    if (!previousContent) {
      continue;
    }

    const comparison =
      compareContent(
        content,
        previousContent
      );

    if (comparison.similar) {
      return {
        duplicate: true,
        fingerprint:
          currentFingerprint,
        similarity:
          comparison.similarity,
        reason:
          'Content is too similar to existing content.'
      };
    }
  }

  return {
    duplicate: false,
    fingerprint:
      currentFingerprint,
    similarity: 0,
    reason:
      'No strong duplicate match found.'
  };
}

export default {
  createContentFingerprint,
  compareContent,
  checkDuplicateContent
};
