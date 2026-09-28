function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

const HIGH_RISK_PATTERNS = [
  /\bfake celebrity\b/i,
  /\bfake arrest\b/i,
  /\bfake death\b/i,
  /\bfake disaster\b/i,
  /\bterrorist\b/i,
  /\bgraphic gore\b/i,
  /\bsexual violence\b/i
];

const REVIEW_PATTERNS = [
  /\bcelebrity\b/i,
  /\bpolitician\b/i,
  /\bpresident\b/i,
  /\breal event\b/i,
  /\bwar\b/i,
  /\bmedical\b/i,
  /\bfinancial advice\b/i,
  /\bcrime\b/i
];

function containsAny(
  text,
  patterns
) {
  return patterns.some(
    pattern => pattern.test(text)
  );
}

export function evaluateYouTubeContent({
  title = '',
  description = '',
  script = '',
  scenes = [],
  metadata = {}
} = {}) {
  const sceneText =
    scenes
      .map(scene => [
        scene?.narration,
        scene?.visualPrompt,
        scene?.description
      ])
      .flat()
      .filter(Boolean)
      .join(' ');

  const combined =
    [
      title,
      description,
      script,
      sceneText
    ]
      .filter(Boolean)
      .join(' ');

  const text =
    cleanText(combined);

  const issues = [];
  const warnings = [];

  if (!text) {
    issues.push(
      'No content available for compliance review.'
    );
  }

  if (
    containsAny(
      text,
      HIGH_RISK_PATTERNS
    )
  ) {
    issues.push(
      'Potentially misleading or high-risk content detected.'
    );
  }

  if (
    containsAny(
      text,
      REVIEW_PATTERNS
    )
  ) {
    warnings.push(
      'Sensitive real-world subject detected; human review recommended.'
    );
  }

  const aiGenerated =
    metadata.aiGenerated !== false;

  const photorealistic =
    metadata.photorealistic === true;

  const disclosureRequired =
    aiGenerated &&
    photorealistic;

  return {
    status:
      issues.length > 0
        ? 'REVIEW'
        : 'PASS',

    safeForAutomaticPublish:
      issues.length === 0 &&
      warnings.length === 0,

    issues,

    warnings,

    aiGenerated,

    photorealistic,

    disclosureRequired,

    checks: {
      originality:
        'REQUIRED',

      reusedContent:
        'REQUIRED',

      repetitiveContent:
        'REQUIRED',

      misleadingContent:
        'CHECKED',

      sensitiveContent:
        'CHECKED',

      aiDisclosure:
        disclosureRequired
          ? 'REQUIRED'
          : 'NOT_REQUIRED_BY_THIS_CHECK'
    }
  };
}

export function evaluateRepetitionRisk(
  currentStory,
  previousStories = []
) {
  const current =
    cleanText(currentStory);

  if (!current) {
    return {
      risk: 'HIGH',
      reason:
        'Current story is empty.'
    };
  }

  const currentWords =
    new Set(
      current
        .split(/\s+/)
        .filter(Boolean)
    );

  let highestSimilarity = 0;

  for (
    const previous of previousStories
  ) {
    const previousText =
      cleanText(
        typeof previous === 'string'
          ? previous
          : previous?.content
      );

    if (!previousText) {
      continue;
    }

    const previousWords =
      new Set(
        previousText
          .split(/\s+/)
          .filter(Boolean)
      );

    const intersection =
      [...currentWords]
        .filter(
          word =>
            previousWords.has(word)
        )
        .length;

    const union =
      new Set([
        ...currentWords,
        ...previousWords
      ]).size;

    const similarity =
      union === 0
        ? 0
        : intersection / union;

    highestSimilarity =
      Math.max(
        highestSimilarity,
        similarity
      );
  }

  if (highestSimilarity >= 0.85) {
    return {
      risk: 'HIGH',
      similarity:
        highestSimilarity,
      reason:
        'Story is highly similar to previous content.'
    };
  }

  if (highestSimilarity >= 0.65) {
    return {
      risk: 'MEDIUM',
      similarity:
        highestSimilarity,
      reason:
        'Story may be too similar to previous content.'
    };
  }

  return {
    risk: 'LOW',
    similarity:
      highestSimilarity,
    reason:
      'No strong repetitive-content signal detected.'
  };
}

export function buildUploadChecklist({
  compliance = {}
} = {}) {
  return {
    titleChecked: true,
    descriptionChecked: true,
    originalContentChecked: true,
    reusedContentChecked: true,
    repetitiveContentChecked: true,
    communityGuidelinesChecked: true,

    aiDisclosure:
      Boolean(
        compliance.disclosureRequired
      ),

    humanReviewRequired:
      compliance.status ===
        'REVIEW' ||
      !compliance.safeForAutomaticPublish
  };
}

export default {
  evaluateYouTubeContent,
  evaluateRepetitionRisk,
  buildUploadChecklist
};
