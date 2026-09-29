function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildCharacterBible(story) {
  return {
    characterId: 'main-character-01',

    description:
      'One consistent main character whose appearance, clothing, age and physical identity remain unchanged throughout the entire video.',

    continuityRule:
      'Do not change the character identity between scenes.',

    storyGoal:
      cleanText(story?.mission)
  };
}

function getSceneVisualDescription(scene) {
  return (
    cleanText(scene?.visualPrompt) ||
    cleanText(scene?.visual_prompt) ||
    cleanText(scene?.image_prompt) ||
    cleanText(scene?.imagePrompt) ||
    cleanText(scene?.visual) ||
    cleanText(scene?.description) ||
    cleanText(scene?.action) ||
    cleanText(scene?.narration) ||
    cleanText(scene?.role) ||
    'Show the main story action clearly and naturally.'
  );
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
    'cinematic photorealistic';

  const character =
    buildCharacterBible(story);

  const visualDescription =
    getSceneVisualDescription(scene);

  return `
Create one professional vertical YouTube Shorts video scene.

STORY:
${cleanText(story?.title)}

MAIN MISSION:
${cleanText(story?.mission)}

SCENE:
${cleanText(scene?.sceneNumber)}

SCENE ROLE:
${cleanText(scene?.role)}

SCENE ACTION:
${cleanText(scene?.narration)}

VISUAL DESCRIPTION:
${visualDescription}

CAMERA:
${
  cleanText(scene?.cameraPrompt) ||
  'Natural cinematic camera movement matching the scene action.'
}

EMOTION:
${
  cleanText(scene?.emotion) ||
  'Emotion must naturally match the story action.'
}

CHARACTER CONTINUITY:
Character ID: ${character.characterId}
${character.description}
${character.continuityRule}

STYLE:
${style}

PRODUCTION REQUIREMENTS:
- vertical 9:16 composition
- cinematic framing
- realistic natural movement
- physically believable motion
- consistent character appearance
- consistent clothing
- consistent environment
- scene action must clearly match the narration
- visual must clearly communicate the scene mission
- no random unrelated objects
- no sudden location changes
- no unexplained character changes
- smooth camera movement
- natural lighting
- clear subject
- strong visual storytelling
- professional cinematic composition

NEGATIVE CONSTRAINTS:
no deformed anatomy
no extra fingers
no duplicated people
no distorted faces
no unnatural body movement
no flickering
no frozen character
no random text
no watermark
no logo
no horror
no gore
no copyrighted characters
no unrelated action
`;
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
      const visualPrompt =
        buildVisualPrompt(
          scene,
          story,
          options
        );

      return {
        sceneNumber:
          scene?.sceneNumber ??
          index + 1,

        role:
          scene?.role || '',

        duration:
          scene?.duration || 5,

        narration:
          scene?.narration || '',

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