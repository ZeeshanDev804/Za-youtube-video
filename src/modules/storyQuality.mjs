function cleanText(value) {
  return String(value || '').trim();
}

function hasText(value) {
  return cleanText(value).length > 0;
}

function countWords(text) {
  return cleanText(text)
    .split(/\s+/)
    .filter(Boolean).length;
}

export function evaluateStory(story) {
  const checks = {
    title: hasText(story?.title),
    mission: hasText(story?.mission),
    hook: hasText(story?.hook),
    setup: hasText(story?.setup),
    conflict: hasText(story?.conflict),
    turningPoint:
      hasText(story?.turningPoint),
    resolution:
      hasText(story?.resolution),
    lesson: hasText(story?.lesson),
    ending: hasText(story?.ending),
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

  const duration =
    Number(story?.estimatedDuration) || 0;

  const durationValid =
    duration >= 30 &&
    duration <= 59;

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
    estimatedDuration: duration,
    durationValid,
    narrationValid,
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

export default {
  evaluateStory,
  assertStoryQuality
};
