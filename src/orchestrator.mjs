console.log(
  "[9/20] Media planner..."
);

const mediaScenes =
  continuousScenes.map(
    (scene, index) => {
      const generatedVisualPrompt =
        scene?.visualPrompt ||
        scene?.visual_prompt ||
        scene?.image_prompt ||
        scene?.imagePrompt ||
        scene?.prompt ||
        prompts?.[index] ||
        prompts?.scenes?.[index] ||
        buildVisualPrompt(
          scene,
          story
        );

      if (!generatedVisualPrompt) {
        throw new Error(
          `[MediaPlanner] Scene ${index + 1} could not generate a visual prompt.`
        );
      }

      return {
        ...scene,

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