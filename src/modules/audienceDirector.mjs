const AUDIENCES = {
  US: {
    language: 'en-US',
    spelling: 'US English',
    region: 'United States',
    tone: 'natural, direct, conversational',
    pacing: 'fast but clear',
    hookStyle: 'strong first-second curiosity hook'
  },

  UK: {
    language: 'en-GB',
    spelling: 'UK English',
    region: 'United Kingdom',
    tone: 'natural, conversational, understated',
    pacing: 'fast but clear',
    hookStyle: 'curiosity and emotional hook'
  },

  EUROPE: {
    language: 'en-GB',
    spelling: 'international English',
    region: 'Europe',
    tone: 'clear, natural and internationally understandable',
    pacing: 'fast but easy to follow',
    hookStyle: 'clear curiosity hook'
  }
};

function clean(value) {
  return String(value || '')
    .trim();
}

export function getAudience(
  region = 'US'
) {
  const key =
    clean(region)
      .toUpperCase();

  return (
    AUDIENCES[key] ||
    AUDIENCES.US
  );
}

export function buildAudienceBrief({
  region = 'US',
  niche = 'general',
  topic = ''
} = {}) {
  const audience =
    getAudience(region);

  return {
    ...audience,

    region:
      audience.region,

    niche:
      clean(niche) ||
      'general',

    topic:
      clean(topic),

    outputLanguage:
      audience.language,

    requirements: [
      'Use natural English.',
      'Avoid unnatural AI-style wording.',
      'Avoid unnecessary slang.',
      'Keep the story understandable without local knowledge.',
      'Create a strong opening hook.',
      'Keep the narrative coherent.',
      'Use varied sentence structure.',
      'End with a meaningful payoff.'
    ]
  };
}

export function buildEnglishStoryRules(
  region = 'US'
) {
  const audience =
    getAudience(region);

  return [
    `Write in ${audience.spelling}.`,
    `Target viewers in ${audience.region}.`,
    `Use ${audience.tone}.`,
    `Keep pacing ${audience.pacing}.`,
    `Use ${audience.hookStyle}.`,
    'Do not translate word-for-word from another language.',
    'Do not use awkward or robotic phrases.',
    'Keep the story original and naturally written.'
  ];
}

export default {
  getAudience,
  buildAudienceBrief,
  buildEnglishStoryRules
};
