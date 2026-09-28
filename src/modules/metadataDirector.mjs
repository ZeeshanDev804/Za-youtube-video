function clean(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanTags(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return [
    ...new Set(
      tags
        .map(tag =>
          clean(tag)
        )
        .filter(Boolean)
    )
  ].slice(0, 10);
}

export function buildMetadata({
  title = '',
  topic = '',
  description = '',
  hashtags = [],
  category = '',
  audience = 'US'
} = {}) {
  const finalTitle =
    clean(title) ||
    clean(topic) ||
    'Original Short Video';

  const finalDescription =
    clean(description) ||
    `An original short story created for ${clean(
      audience
    ) || 'US'} viewers.`;

  return {
    title:
      finalTitle.slice(0, 100),

    description:
      finalDescription.slice(
        0,
        5000
      ),

    hashtags:
      cleanTags(
        hashtags
      ),

    category:
      clean(category) ||
      'Entertainment',

    audience:
      clean(audience) ||
      'US'
  };
}

export function validateMetadata(
  metadata
) {
  const reasons = [];

  if (!metadata?.title) {
    reasons.push(
      'Title is missing.'
    );
  }

  if (
    metadata?.title?.length >
    100
  ) {
    reasons.push(
      'Title exceeds 100 characters.'
    );
  }

  if (!metadata?.description) {
    reasons.push(
      'Description is missing.'
    );
  }

  return {
    valid:
      reasons.length === 0,
    reasons
  };
}

export default {
  buildMetadata,
  validateMetadata
};
