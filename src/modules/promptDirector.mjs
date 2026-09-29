function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSceneNumber(scene, fallback = 1) {
  const value = Number(
    scene?.sceneNumber ??
    scene?.scene_number ??
    fallback
  );

  return Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

function getSceneRole(scene) {
  return (
    cleanText(scene?.role) ||
    'story progression'
  );
}

function getSceneNarration(scene) {
  return (
    cleanText(scene?.narration) ||
    cleanText(scene?.voiceover) ||
    cleanText(scene?.text) ||
    cleanText(scene?.description) ||
    ''
  );
}

function getSceneAction(scene) {
  return (
    cleanText(scene?.action) ||
    cleanText(scene?.sceneAction) ||
    cleanText(scene?.scene_action) ||
    getSceneNarration(scene)
  );
}

function getSceneEmotion(scene) {
  return (
    cleanText(scene?.emotion) ||
    'natural emotional expression'
  );
}

function getCameraPrompt(scene) {
  return (
    cleanText(scene?.cameraPrompt) ||
    cleanText(scene?.camera_prompt) ||
    'cinematic camera movement with clear subject framing'
  );
}

function getExistingVisualPrompt(scene) {
  return (
    cleanText(scene?.visualPrompt) ||
    cleanText(scene?.visual_prompt) ||
    cleanText(scene?.image_prompt) ||
    cleanText(scene?.imagePrompt) ||
    cleanText(scene?.visual) ||
    ''
  );
}

function buildCharacterBible(story) {
  return {
    characterId:
      cleanText(
        story?.characterBible?.characterId
      ) ||
      'main-character-01',

    description:
      cleanText(
        story?.characterBible?.description
      ) ||
      'One consistent main character whose appearance, clothing, age and physical identity remain unchanged throughout the entire video.',

    continuityRule:
      cleanText(
        story?.characterBible?.continuityRule
      ) ||
      'Do not change the character identity, clothing or physical appearance between scenes.'
  };
}

function buildFallbackVisualDescription(
  scene,
  story
) {
  const sceneNumber =
    getSceneNumber(scene);

  const title =
    cleanText(story?.title) ||
    'Original YouTube Shorts story';

  const mission =
    cleanText(story?.mission) ||
    'Show the story mission clearly through visual action.';

  const role =
    getSceneRole(scene);

  const narration =
    getSceneNarration(scene);

  const action =
    getSceneAction(scene);

  const emotion =
    getSceneEmotion(scene);

  return `
Scene ${sceneNumber} from the story "${title}".

Story mission:
${mission}

Scene role:
${role}

Narration meaning:
${narration}

Visible action:
${action}

Emotional state:
${emotion}

Create a scene-specific visual that clearly shows the character performing the action described by the narration. The visual must advance the story and must not be a generic unrelated shot.
  `.trim();
}

export function buildVisualPrompt(
  scene,
  story,
  options = {}
) {
  if (!scene) {
    throw new Error(
      '[PromptDirector] Scene is required.'
    );
  }

  const style =
    cleanText(options.style) ||
    cleanText(story?.style) ||
    'cinematic photorealistic';

  const sceneNumber =
    getSceneNumber(scene);

  const role =
    getSceneRole(scene);

  const narration =
    getSceneNarration(scene);

  const action =
    getSceneAction(scene);

  const emotion =
    getSceneEmotion(scene);

  const camera =
    getCameraPrompt(scene);

  const existingVisual =
    getExistingVisualPrompt(scene);

  const visualDescription =
    existingVisual ||
    buildFallbackVisualDescription(
      scene,
      story
    );

  const character =
    buildCharacterBible(story);

  const title =
    cleanText(story?.title) ||
    'Original YouTube Shorts story';

  const mission =
    cleanText(story?.mission) ||
    'Tell a clear original story through connected visual scenes.';

  return `
Create one professional vertical YouTube Shorts video scene.

STORY:
${title}

MAIN MISSION:
${mission}

SCENE NUMBER:
${sceneNumber}

SCENE ROLE:
${role}

NARRATION:
${narration}

VISIBLE ACTION:
${action}

VISUAL STORY DESCRIPTION:
${visualDescription}

CAMERA:
${camera}

EMOTION:
${emotion}

CHARACTER CONTINUITY:
Character ID: ${character.characterId}
${character.description}
${character.continuityRule}

STYLE:
${style}

PRODUCTION REQUIREMENTS:
- vertical 9:16 composition
- cinematic professional framing
- clear main subject
- scene-specific visual storytelling
- visible action must match the narration
- natural realistic movement
- physically believable motion
- consistent character identity
- consistent clothing
- consistent age and appearance
- consistent environment
- natural lighting
- smooth camera movement
- meaningful scene progression
- no random unrelated objects
- no unexplained location changes
- no unexplained character changes
- strong emotional clarity
- professional YouTube Shorts visual quality

NEGATIVE CONSTRAINTS:
- no deformed anatomy
- no extra fingers
- no duplicated people
- no distorted faces
- no unnatural body movement
- no flickering
- no frozen character
- no random text
- no watermark
- no logo
- no copyrighted characters
- no unrelated action
- no gore
- no horror
`.trim();
}

export function buildScenePromptPack(
  scenes,
  story,
  options = {}
) {
  if (!Array.isArray(scenes)) {
    throw new Error(
      '[PromptDirector] Scenes must be an array.'
    );
  }

  return scenes.map(
    (scene, index) => {
      const sceneNumber =
        getSceneNumber(
          scene,
          index + 1
        );

      const visualPrompt =
        buildVisualPrompt(
          scene,
          story,
          options
        );

      return {
        sceneNumber,

        role:
          getSceneRole(scene),

        duration:
          scene.duration,

        narration:
          getSceneNarration(scene),

        visualPrompt,

        visual_prompt:
          visualPrompt,

        image_prompt:
          visualPrompt,

        prompt:
          visualPrompt
      };
    }
  );
}

export default {
  buildVisualPrompt,
  buildScenePromptPack
};