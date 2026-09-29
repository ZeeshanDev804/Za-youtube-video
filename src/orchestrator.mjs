console.log(
  "[9/20] Media planner..."
);

const mediaScenes =
  continuousScenes.map(
    (scene, index) => ({
      ...scene,

      visualPrompt:
        scene?.visualPrompt ||
        scene?.visual_prompt ||
        scene?.image_prompt ||
        scene?.prompt ||
        prompts?.[index] ||
        prompts?.scenes?.[index] ||
        buildVisualPrompt(
          scene,
          characterBible
        )
    })
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