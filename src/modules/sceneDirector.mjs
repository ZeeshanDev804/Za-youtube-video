const MIN_SCENE_DURATION = 3;
const MAX_SCENE_DURATION = 7;
const TARGET_SCENE_COUNT = 8;

function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSceneDuration(totalScenes, index) {
  const base =
    Math.floor(40 / totalScenes);

  const remainder =
    40 - base * totalScenes;

  return base + (index < remainder ? 1 : 0);
}

function buildFallbackScenes(story) {
  const sceneDefinitions = [
    {
      role: 'HOOK',
      text: story.hook,
      visual:
        'Main character in a visually striking situation that immediately creates curiosity.'
    },
    {
      role: 'MISSION',
      text: story.mission,
      visual:
        'Main character clearly beginning the central mission in the established environment.'
    },
    {
      role: 'SETUP',
      text: story.setup,
      visual:
        'Show the character and environment clearly while establishing the problem.'
    },
    {
      role: 'CONFLICT',
      text: story.conflict,
      visual:
        'The main obstacle becomes visible and creates tension.'
    },
    {
      role: 'SETBACK',
      text: story.conflict,
      visual:
        'The character experiences the setback and reacts emotionally.'
    },
    {
      role: 'TURNING POINT',
      text: story.turningPoint,
      visual:
        'Close cinematic shot showing the character making the important decision.'
    },
    {
      role: 'RESOLUTION',
      text: story.resolution,
      visual:
        'Show the character taking successful action and achieving visible progress.'
    },
    {
      role: 'ENDING',
      text: `${story.lesson} ${story.ending}`,
      visual:
        'Emotional final shot showing the character after the journey, with a hopeful cinematic ending.'
    }
  ];

  return sceneDefinitions.map(
    (definition, index) => ({
      sceneNumber: index + 1,
      role: definition.role,
      narration: cleanText(definition.text),
      visualPrompt: cleanText(definition.visual),
      cameraPrompt:
        index === 0
          ? 'Slow cinematic push-in.'
          : 'Smooth cinematic camera movement.',
      emotion:
        index <= 2
          ? 'curious and determined'
          : index <= 4
            ? 'tense and emotional'
            : 'hopeful and determined',
      duration: buildSceneDuration(
        TARGET_SCENE_COUNT,
        index
      )
    })
  );
}

function normalizeScenes(scenes, story) {
  if (
    !Array.isArray(scenes) ||
    scenes.length < 6
  ) {
    return buildFallbackScenes(story);
  }

  const normalized = scenes
    .slice(0, 10)
    .map((scene, index) => ({
      sceneNumber: index + 1,
      role:
        cleanText(scene?.role) ||
        `SCENE_${index + 1}`,
      narration:
        cleanText(scene?.narration),
      visualPrompt:
        cleanText(scene?.visualPrompt),
      cameraPrompt:
        cleanText(scene?.cameraPrompt) ||
        'Smooth cinematic camera movement.',
      emotion:
        cleanText(scene?.emotion) ||
        'natural and emotionally engaging',
      duration: Math.min(
        MAX_SCENE_DURATION,
        Math.max(
          MIN_SCENE_DURATION,
          Number(scene?.duration) || 5
        )
      )
    }))
    .filter(
      scene =>
        scene.narration &&
        scene.visualPrompt
    );

  if (normalized.length < 6) {
    return buildFallbackScenes(story);
  }

  return normalized;
}

export function buildScenes(story) {
  if (!story) {
    throw new Error(
      '[SceneDirector] Story is required.'
    );
  }

  const scenes = buildFallbackScenes(story);

  const totalDuration = scenes.reduce(
    (sum, scene) =>
      sum + scene.duration,
    0
  );

  console.log(
    `[SceneDirector] Created ${scenes.length} connected scenes.`
  );

  console.log(
    `[SceneDirector] Planned scene duration: ${totalDuration}s`
  );

  return scenes;
}

export function normalizeScenePlan(
  scenes,
  story
) {
  return normalizeScenes(
    scenes,
    story
  );
}

export function validateSceneContinuity(
  scenes
) {
  if (
    !Array.isArray(scenes) ||
    scenes.length < 6
  ) {
    return {
      valid: false,
      reason:
        'At least 6 connected scenes are required.'
    };
  }

  const missingNarration =
    scenes.some(
      scene =>
        !cleanText(scene?.narration)
    );

  const missingVisual =
    scenes.some(
      scene =>
        !cleanText(scene?.visualPrompt)
    );

  if (missingNarration) {
    return {
      valid: false,
      reason:
        'One or more scenes have no narration.'
    };
  }

  if (missingVisual) {
    return {
      valid: false,
      reason:
        'One or more scenes have no visual prompt.'
    };
  }

  return {
    valid: true,
    reason: 'Scene plan is structurally valid.'
  };
}

export default {
  buildScenes,
  normalizeScenePlan,
  validateSceneContinuity
};
