function cleanText(value) {
  return String(value || '').trim();
}

const BLOCKED_PATTERNS = [
  /\bsexual\b/i,
  /\bexplicit sexual\b/i,
  /\bgraphic gore\b/i,
  /\bchild sexual\b/i,
  /\bextreme violence\b/i
];

const WARNING_PATTERNS = [
  /\bweapon\b/i,
  /\bdrug\b/i,
  /\bself[- ]harm\b/i,
  /\bsuicide\b/i,
  /\bgraphic\b/i
];

function containsPattern(
  text,
  patterns
) {
  return patterns.some(
    pattern => pattern.test(text)
  );
}

export function evaluateSafety(
  content
) {
  const text =
    cleanText(content);

  if (!text) {
    return {
      status: 'REJECT',
      safe: false,
      risk: 'HIGH',
      reasons: [
        'Content is empty.'
      ]
    };
  }

  if (
    containsPattern(
      text,
      BLOCKED_PATTERNS
    )
  ) {
    return {
      status: 'REJECT',
      safe: false,
      risk: 'HIGH',
      reasons: [
        'Blocked safety pattern detected.'
      ]
    };
  }

  if (
    containsPattern(
      text,
      WARNING_PATTERNS
    )
  ) {
    return {
      status: 'REVIEW',
      safe: false,
      risk: 'MEDIUM',
      reasons: [
        'Potentially sensitive content requires review.'
      ]
    };
  }

  return {
    status: 'PASS',
    safe: true,
    risk: 'LOW',
    reasons: []
  };
}

export function evaluateVideoSafety({
  story,
  narration,
  scenes = []
} = {}) {
  const combinedText = [
    story?.title,
    story?.mission,
    story?.narration,
    narration,
    ...scenes.map(
      scene => scene?.narration
    ),
    ...scenes.map(
      scene => scene?.visualPrompt
    )
  ]
    .filter(Boolean)
    .join(' ');

  return evaluateSafety(
    combinedText
  );
}

export function assertSafety(
  content
) {
  const result =
    evaluateSafety(content);

  if (
    result.status === 'REJECT'
  ) {
    throw new Error(
      `[SafetyGate] Content rejected: ${result.reasons.join(' ')}`
    );
  }

  return result;
}

export default {
  evaluateSafety,
  evaluateVideoSafety,
  assertSafety
};
