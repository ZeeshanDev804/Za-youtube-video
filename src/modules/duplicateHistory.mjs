import fs from 'fs';
import path from 'path';
import {
  createContentFingerprint,
  compareContent
} from './originalityGuard.mjs';

function ensureDirectory(dir) {
  fs.mkdirSync(
    dir,
    {
      recursive: true
    }
  );
}

function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function loadDuplicateHistory(
  filePath =
    'data/duplicate-history.json'
) {
  const resolved =
    path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    return [];
  }

  try {
    const data =
      JSON.parse(
        fs.readFileSync(
          resolved,
          'utf8'
        )
      );

    return Array.isArray(data)
      ? data
      : [];
  } catch {
    return [];
  }
}

export function saveDuplicateHistory(
  history,
  filePath =
    'data/duplicate-history.json'
) {
  const resolved =
    path.resolve(filePath);

  ensureDirectory(
    path.dirname(resolved)
  );

  fs.writeFileSync(
    resolved,
    JSON.stringify(
      history,
      null,
      2
    ),
    'utf8'
  );

  return resolved;
}

export function checkHistory(
  content,
  history = []
) {
  const text =
    cleanText(content);

  if (!text) {
    throw new Error(
      '[DuplicateHistory] Content is required.'
    );
  }

  const fingerprint =
    createContentFingerprint(
      text
    );

  for (const item of history) {
    if (
      item?.fingerprint ===
      fingerprint
    ) {
      return {
        duplicate: true,
        fingerprint,
        similarity: 1
      };
    }

    if (item?.content) {
      const comparison =
        compareContent(
          text,
          item.content
        );

      if (comparison.similar) {
        return {
          duplicate: true,
          fingerprint,
          similarity:
            comparison.similarity
        };
      }
    }
  }

  return {
    duplicate: false,
    fingerprint,
    similarity: 0
  };
}

export function addToHistory(
  content,
  metadata = {},
  history = []
) {
  const text =
    cleanText(content);

  const fingerprint =
    createContentFingerprint(
      text
    );

  const entry = {
    fingerprint,

    content: text,

    title:
      cleanText(
        metadata.title
      ),

    topic:
      cleanText(
        metadata.topic
      ),

    createdAt:
      new Date().toISOString()
  };

  return [
    ...history,
    entry
  ];
}

export default {
  loadDuplicateHistory,
  saveDuplicateHistory,
  checkHistory,
  addToHistory
};
