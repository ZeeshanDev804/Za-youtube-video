function clean(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function createContinuityState(
  story = {},
  characterBible = {}
) {
  return {
    storyTitle:
      clean(story.title),

    world:
      clean(
        story.environment ||
        characterBible.environment
      ),

    character:
      characterBible || null,

    activeObjects:
      Array.isArray(
        characterBible.importantObjects
      )
        ? [
            ...characterBible.importantObjects
          ]
        : [],

    previousScene:
      null
  };
}

export function applySceneContinuity(
  scene,
  state
) {
  const scenePrompt =
    clean(
      scene?.visualPrompt
    );

  const previous =
    state?.previousScene;

  const continuityParts = [];

  if (
    state?.character
  ) {
    if (
      state.character.face
    ) {
      continuityParts.push(
        `Maintain the exact same facial identity: ${state.character.face}.`
      );
    }

    if (
      state.character.hair
    ) {
      continuityParts.push(
        `Maintain the same hairstyle: ${state.character.hair}.`
      );
    }

    if (
      state.character.clothing
    ) {
      continuityParts.push(
        `Maintain clothing continuity: ${state.character.clothing}.`
      );
    }
  }

  if (state?.world) {
    continuityParts.push(
      `Maintain world/environment continuity: ${state.world}.`
    );
  }

  if (previous?.visualPrompt) {
    continuityParts.push(
      'Continue naturally from the previous scene without randomly changing character identity, location, lighting or important objects.'
    );
  }

  return [
    scenePrompt,
    ...continuityParts
  ]
    .filter(Boolean)
    .join('\n');
}

export function advanceContinuity(
  state,
  scene
) {
  return {
    ...state,

    previousScene: {
      sceneNumber:
        scene?.sceneNumber,

      visualPrompt:
        clean(
          scene?.visualPrompt
        ),

      narration:
        clean(
          scene?.narration
        )
    }
  };
}

export function buildContinuousScenes(
  scenes,
  state
) {
  if (!Array.isArray(scenes)) {
    return [];
  }

  let currentState = {
    ...state
  };

  return scenes.map(
    scene => {
      const enhanced = {
        ...scene,

        visualPrompt:
          applySceneContinuity(
            scene,
            currentState
          )
      };

      currentState =
        advanceContinuity(
          currentState,
          enhanced
        );

      return enhanced;
    }
  );
}

export default {
  createContinuityState,
  applySceneContinuity,
  advanceContinuity,
  buildContinuousScenes
};
