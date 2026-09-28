function cleanText(value) {
  return String(value || '').trim();
}

function normalizeDuration(value) {
  const duration =
    Number(value);

  if (
    !Number.isFinite(duration) ||
    duration <= 0
  ) {
    return 5;
  }

  return Math.max(
    2,
    Math.min(12, duration)
  );
}

export function buildMediaPlan(
  scenes = []
) {
  if (!Array.isArray(scenes)) {
    throw new Error(
      '[MediaPlanner] Scenes must be an array.'
    );
  }

  return scenes.map(
    (scene, index) => ({
      sceneNumber:
        scene.sceneNumber ||
        index + 1,

      duration:
        normalizeDuration(
          scene.duration
        ),

      visualPrompt:
        cleanText(
          scene.visualPrompt
        ),

      narration:
        cleanText(
          scene.narration
        ),

      mediaType:
        cleanText(
          scene.mediaType
        ) ||
        'ai-video',

      aspectRatio:
        '9:16',

      resolution:
        '1080x1920',

      motion:
        cleanText(
          scene.motion
        ) ||
        'cinematic natural movement',

      continuity:
        cleanText(
          scene.continuity
        ) ||
        'maintain character and environment continuity',

      negativePrompt:
        'blurry, distorted, extra limbs, duplicate objects, broken anatomy, unreadable text, watermark, logo'
    })
  );
}

export function validateMediaPlan(
  mediaPlan
) {
  if (!Array.isArray(mediaPlan)) {
    return {
      valid: false,
      reasons: [
        'Media plan must be an array.'
      ]
    };
  }

  const reasons = [];

  if (mediaPlan.length < 3) {
    reasons.push(
      'At least 3 scenes are recommended.'
    );
  }

  for (const scene of mediaPlan) {
    if (!scene.visualPrompt) {
      reasons.push(
        `Scene ${scene.sceneNumber} has no visual prompt.`
      );
    }

    if (
      scene.duration < 2 ||
      scene.duration > 12
    ) {
      reasons.push(
        `Scene ${scene.sceneNumber} duration is outside the allowed range.`
      );
    }
  }

  return {
    valid:
      reasons.length === 0,
    reasons
  };
}

export default {
  buildMediaPlan,
  validateMediaPlan
};
