function clean(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

const STORY_FORMATS = [
  'motivation',
  'funny',
  'emotional',
  'animal',
  'baby',
  'fantasy',
  'mystery',
  'business',
  'trading',
  'trending'
];

export function chooseStoryFormat({
  topic = '',
  niche = '',
  trend = null
} = {}) {
  const requested =
    clean(niche)
      .toLowerCase();

  if (
    STORY_FORMATS.includes(
      requested
    )
  ) {
    return requested;
  }

  const text =
    clean(
      trend?.topic ||
      topic
    ).toLowerCase();

  if (
    /funny|joke|comedy|hilarious/.test(
      text
    )
  ) {
    return 'funny';
  }

  if (
    /dog|cat|animal|puppy|kitten|lion|wolf/.test(
      text
    )
  ) {
    return 'animal';
  }

  if (
    /baby|toddler|family/.test(
      text
    )
  ) {
    return 'baby';
  }

  if (
    /trading|forex|stock|crypto|bitcoin|market|invest/.test(
      text
    )
  ) {
    return 'trading';
  }

  if (
    /business|startup|entrepreneur/.test(
      text
    )
  ) {
    return 'business';
  }

  if (
    /dragon|magic|wizard|kingdom/.test(
      text
    )
  ) {
    return 'fantasy';
  }

  if (
    /mystery|secret|missing|unknown/.test(
      text
    )
  ) {
    return 'mystery';
  }

  if (
    /sad|emotional|heart|love|loss/.test(
      text
    )
  ) {
    return 'emotional';
  }

  if (
    /success|discipline|mindset|never give up|motivation/.test(
      text
    )
  ) {
    return 'motivation';
  }

  return 'trending';
}

export function buildCreativeBrief({
  topic = '',
  niche = '',
  trend = null,
  audience = 'US'
} = {}) {
  const format =
    chooseStoryFormat({
      topic,
      niche,
      trend
    });

  return {
    topic:
      clean(
        trend?.topic ||
        topic
      ),

    format,

    audience:
      clean(audience) ||
      'US',

    creativeRules: [
      'Create a unique story concept.',
      'Start with a strong hook.',
      'Avoid generic AI storytelling.',
      'Give the protagonist a clear goal.',
      'Introduce a meaningful problem or conflict.',
      'Show progression through multiple scenes.',
      'Create a satisfying payoff.',
      'Match visual style to the story format.',
      'Keep character identity consistent.',
      'Do not copy existing videos.'
    ]
  };
}

export function validateCreativeBrief(
  brief
) {
  const reasons = [];

  if (!brief?.topic) {
    reasons.push(
      'Topic is missing.'
    );
  }

  if (
    !STORY_FORMATS.includes(
      brief?.format
    )
  ) {
    reasons.push(
      'Story format is invalid.'
    );
  }

  if (!brief?.audience) {
    reasons.push(
      'Audience is missing.'
    );
  }

  return {
    valid:
      reasons.length === 0,
    reasons
  };
}

export default {
  chooseStoryFormat,
  buildCreativeBrief,
  validateCreativeBrief
};
