console.log(
  "[9/20] Media planner..."
);

const mediaSourceScenes =
  typeof continuousScenes !== 'undefined' &&
  Array.isArray(continuousScenes)
    ? continuousScenes
    : typeof scenes !== 'undefined' &&
      Array.isArray(scenes)
      ? scenes
      : [];

if (
  mediaSourceScenes.length === 0
) {
  throw new Error(
    '[MediaPlanner] No scenes are available for media planning.'
  );
}

const mediaScenes =
  mediaSourceScenes.map(
    (scene, index) => {
      const existingVisualPrompt =
        scene?.visualPrompt ||
        scene?.visual_prompt ||
        scene?.image_prompt ||
        scene?.imagePrompt ||
        scene?.prompt ||
        (
          typeof prompts !== 'undefined' &&
          Array.isArray(prompts)
            ? prompts[index]
            : ''
        ) ||
        (
          typeof prompts !== 'undefined' &&
          Array.isArray(prompts?.scenes)
            ? prompts.scenes[index]
            : ''
        );

      let generatedVisualPrompt =
        existingVisualPrompt;

      if (
        !generatedVisualPrompt &&
        typeof buildVisualPrompt === 'function'
      ) {
        generatedVisualPrompt =
          buildVisualPrompt(
            scene,
            typeof story !== 'undefined'
              ? story
              : {}
          );
      }

      if (
        !generatedVisualPrompt
      ) {
        throw new Error(
          `[MediaPlanner] Scene ${index + 1} could not generate a visual prompt.`
        );
      }

      return {
        ...scene,

        sceneNumber:
          scene?.sceneNumber ??
          index + 1,

        visualPrompt:
          generatedVisualPrompt,

        visual_prompt:
          generatedVisualPrompt,

        image_prompt:
          generatedVisualPrompt,

        prompt:
          generatedVisualPrompt
      };
    }
  );

const mediaPlan =
  buildMediaPlan(
    mediaScenes
  );

const mediaValidation =
  validateMediaPlan(
    mediaPlan
  );

if (
  mediaValidation.valid === false
) {
  throw new Error(
    `[MediaPlanner] ${
      mediaValidation.reasons.join(
        " "
      )
    }`
  );
}

console.log(
  `Media plan scenes: ${mediaPlan.length}`
);