function clean(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeTrend(trend = {}) {
  return {
    title: clean(trend.title),
    topic: clean(trend.topic || trend.title),
    category: clean(trend.category) || 'trending',
    region: clean(trend.region) || 'US',
    score: Number(trend.score) || 0,
    source: clean(trend.source)
  };
}

export function rankTrends(
  trends = []
) {
  if (!Array.isArray(trends)) {
    return [];
  }

  return trends
    .map(normalizeTrend)
    .filter(item => item.topic)
    .sort(
      (a, b) =>
        b.score - a.score
    );
}

export function selectTrend(
  trends = [],
  options = {}
) {
  const ranked =
    rankTrends(trends);

  const region =
    clean(options.region)
      .toUpperCase();

  const regional =
    region
      ? ranked.filter(
          trend =>
            trend.region
              .toUpperCase() ===
            region
        )
      : ranked;

  return (
    regional[0] ||
    ranked[0] ||
    null
  );
}

export function buildTrendBrief(
  trend,
  options = {}
) {
  const selected =
    normalizeTrend(trend);

  return {
    ...selected,

    audience:
      clean(options.audience) ||
      selected.region,

    instructions: [
      'Use the trend only as a topic or inspiration.',
      'Create an original story.',
      'Do not copy another creator.',
      'Do not copy another video script.',
      'Do not reproduce another creator’s scenes.',
      'Keep the story understandable for the selected audience.',
      'Use relevant metadata only.'
    ]
  };
}

export function buildTrendHashtags({
  topic = '',
  category = '',
  region = ''
} = {}) {
  const words =
    clean(topic)
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .filter(
        word =>
          word.length >= 3
      )
      .slice(0, 4);

  const tags = [
    ...words.map(
      word =>
        `#${word.replace(
          /[^a-z0-9]/g,
          ''
        )}`
    )
  ];

  if (category) {
    tags.push(
      `#${clean(category)
        .replace(/\s+/g, '')}`
    );
  }

  if (region) {
    const regionTag =
      clean(region)
        .replace(/\s+/g, '');

    if (regionTag) {
      tags.push(
        `#${regionTag}`
      );
    }
  }

  tags.push('#Shorts');

  return [
    ...new Set(tags)
  ].slice(0, 8);
}

export default {
  rankTrends,
  selectTrend,
  buildTrendBrief,
  buildTrendHashtags
};
