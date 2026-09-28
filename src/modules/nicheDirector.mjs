const NICHES = {
  motivation: {
    name: 'Motivation',
    tone: 'inspiring, emotional, powerful',
    visualStyle: 'cinematic, realistic, uplifting',
    ending: 'meaningful emotional payoff'
  },

  funny: {
    name: 'Funny',
    tone: 'funny, playful, surprising',
    visualStyle: 'expressive, energetic, cinematic comedy',
    ending: 'clear comedic payoff'
  },

  emotional: {
    name: 'Emotional',
    tone: 'warm, emotional, human',
    visualStyle: 'cinematic, intimate, expressive',
    ending: 'strong emotional payoff'
  },

  animal: {
    name: 'Animal Story',
    tone: 'heartwarming, adventurous, emotional',
    visualStyle: 'cinematic animal storytelling',
    ending: 'clear story resolution'
  },

  baby: {
    name: 'Baby / Family',
    tone: 'cute, warm, playful',
    visualStyle: 'high-quality family-friendly cinematic',
    ending: 'cute or emotional payoff'
  },

  fantasy: {
    name: 'Fantasy',
    tone: 'magical, mysterious, adventurous',
    visualStyle: 'cinematic fantasy world',
    ending: 'surprising story payoff'
  },

  mystery: {
    name: 'Mystery',
    tone: 'suspenseful, curious, intriguing',
    visualStyle: 'dark cinematic mystery',
    ending: 'revealing payoff'
  },

  business: {
    name: 'Business',
    tone: 'informative, practical, engaging',
    visualStyle: 'modern cinematic business',
    ending: 'useful takeaway'
  },

  trading: {
    name: 'Trading / Finance',
    tone: 'educational, careful, engaging',
    visualStyle: 'modern financial storytelling',
    ending: 'clear educational takeaway'
  },

  trending: {
    name: 'Trending Topic',
    tone: 'current, engaging, fast-paced',
    visualStyle: 'modern cinematic social storytelling',
    ending: 'strong relevant payoff'
  }
};

function clean(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

export function getNiche(name) {
  const key =
    clean(name);

  return (
    NICHES[key] ||
    null
  );
}

export function listNiches() {
  return Object.keys(
    NICHES
  );
}

export function detectNiche({
  topic = '',
  requestedNiche = ''
} = {}) {
  const requested =
    clean(requestedNiche);

  if (
    requested &&
    NICHES[requested]
  ) {
    return {
      niche: requested,
      ...NICHES[requested],
      reason:
        'Niche explicitly selected by user.'
    };
  }

  const text =
    clean(topic);

  const keywordMap = {
    trading: [
      'trading',
      'forex',
      'stock',
      'stocks',
      'crypto',
      'bitcoin',
      'market',
      'investing'
    ],

    funny: [
      'funny',
      'comedy',
      'joke',
      'hilarious'
    ],

    motivation: [
      'motivation',
      'success',
      'discipline',
      'mindset',
      'never give up'
    ],

    animal: [
      'dog',
      'cat',
      'animal',
      'puppy',
      'kitten',
      'lion',
      'wolf'
    ],

    baby: [
      'baby',
      'toddler',
      'family'
    ],

    fantasy: [
      'dragon',
      'magic',
      'wizard',
      'fantasy',
      'kingdom'
    ],

    mystery: [
      'mystery',
      'secret',
      'missing',
      'strange',
      'unknown'
    ],

    business: [
      'business',
      'startup',
      'entrepreneur',
      'company',
      'money'
    ]
  };

  for (
    const [
      niche,
      keywords
    ] of Object.entries(
      keywordMap
    )
  ) {
    if (
      keywords.some(
        keyword =>
          text.includes(keyword)
      )
    ) {
      return {
        niche,
        ...NICHES[niche],
        reason:
          `Topic matched the ${niche} category.`
      };
    }
  }

  return {
    niche: 'trending',
    ...NICHES.trending,
    reason:
      'No specific niche detected; trending/general format selected.'
  };
}

export function buildNicheBrief({
  topic = '',
  niche = ''
} = {}) {
  const selected =
    detectNiche({
      topic,
      requestedNiche:
        niche
    });

  return {
    topic:
      String(topic || '').trim(),

    niche:
      selected.niche,

    name:
      selected.name,

    tone:
      selected.tone,

    visualStyle:
      selected.visualStyle,

    ending:
      selected.ending,

    rules: [
      'Create an original story.',
      'Do not copy another creator.',
      'Do not copy another video script.',
      'Match visuals to the selected story type.',
      'Keep the opening hook strong.',
      'Keep the story understandable.',
      'Create a clear ending/payoff.'
    ]
  };
}

export default {
  getNiche,
  listNiches,
  detectNiche,
  buildNicheBrief
};
