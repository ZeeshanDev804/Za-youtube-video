function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasText(value) {
  return cleanText(value).length > 0;
}

function countWords(text) {
  const cleaned = cleanText(text);

  if (!cleaned) {
    return 0;
  }

  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

function estimateDurationFromWords(wordCount) {
  if (!wordCount) {
    return 0;
  }

  return Math.round(
    (wordCount / 145) * 60
  );
}

export function evaluateStory(story) {
  const checks = {
    title: hasText(story?.title),
    mission: hasText(story?.mission),
    narration: hasText(story?.narration)
  };

  const passed =
    Object.values(checks)
      .filter(Boolean)
      .length;

  const total =
    Object.keys(checks).length;

  const wordCount =
    countWords(story?.narration);

  const suppliedDuration =
    Number(story?.estimatedDuration) || 0;

  const calculatedDuration =
    estimateDurationFromWords(
      wordCount
    );

  const estimatedDuration =
    suppliedDuration > 0
      ? suppliedDuration
      : calculatedDuration;

  const durationValid =
    estimatedDuration >= 30 &&
    estimatedDuration <= 59;

  const narrationValid =
    wordCount >= 70 &&
    wordCount <= 140;

  const structureValid =
    passed === total;

  const valid =
    structureValid &&
    durationValid &&
    narrationValid;

  return {
    valid,

    score: Math.round(
      (passed / total) * 100
    ),

    checks,

    wordCount,

    estimatedDuration,

    durationValid,

    narrationValid,

    structureValid,

    reasons: [
      ...(!structureValid
        ? ['Story structure is incomplete.']
        : []),

      ...(!durationValid
        ? ['Story duration is outside the target range.']
        : []),

      ...(!narrationValid
        ? ['Narration length is outside the target range.']
        : [])
    ]
  };
}

export function assertStoryQuality(story) {
  const result =
    evaluateStory(story);

  if (!result.valid) {
    throw new Error(
      `[StoryQuality] Story rejected: ${result.reasons.join(
        ' '
      )}`
    );
  }

  return result;
}

export const checkStoryQuality =
  assertStoryQuality;

export default {
  evaluateStory,
  assertStoryQuality,
  checkStoryQuality
};