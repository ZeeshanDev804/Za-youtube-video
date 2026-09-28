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

  return `
Create one professional vertical YouTube Shorts video scene.

STORY:
${cleanText(story?.title)}

MAIN MISSION:
${cleanText(story?.mission)}

SCENE:
${scene.sceneNumber}

SCENE ROLE:
${cleanText(scene.role)}

SCENE ACTION:
${cleanText(scene.narration)}

VISUAL REQUIREMENT:
${cleanText(scene.visualPrompt)}

CAMERA:
${cleanText(scene.cameraPrompt)}

EMOTION:
${cleanText(scene.emotion)}

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

  return scenes.map(scene => ({
    sceneNumber: scene.sceneNumber,
    role: scene.role,
    duration: scene.duration,
    narration: scene.narration,
    prompt: buildVisualPrompt(
      scene,
      story,
      options
    )
  }));
}

export default {
  buildVisualPrompt,
  buildScenePromptPack
};
