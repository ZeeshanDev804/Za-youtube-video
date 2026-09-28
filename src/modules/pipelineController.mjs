import { generateStory } from './storyDirector.mjs';

import {
  buildScenes
} from './sceneDirector.mjs';

import {
  buildScenePromptPack
} from './promptDirector.mjs';

import {
  evaluateStory
} from './storyQuality.mjs';

import {
  evaluateVideoSafety
} from './safetyGate.mjs';

import {
  checkDuplicateContent
} from './originalityGuard.mjs';

import {
  evaluateApproval
} from './approvalGate.mjs';

export async function createProductionPlan({
  topic = '',
  userScript = '',
  previousContents = []
} = {}) {
  const source =
    String(
      userScript ||
      topic ||
      ''
    ).trim();

  if (!source) {
    throw new Error(
      '[PipelineController] Topic or script is required.'
    );
  }

  // -----------------------------------------
  // 1. STORY
  // -----------------------------------------

  const story =
    await generateStory(
      topic || source,
      {
        userScript
      }
    );

  if (!story) {
    throw new Error(
      '[PipelineController] Story generation failed.'
    );
  }

  // -----------------------------------------
  // 2. STORY QUALITY
  // -----------------------------------------

  const storyQuality =
    evaluateStory(story);

  // -----------------------------------------
  // 3. SCENES
  // -----------------------------------------

  const scenes =
    await buildScenes(story);

  if (
    !Array.isArray(scenes) ||
    scenes.length === 0
  ) {
    throw new Error(
      '[PipelineController] No scenes were generated.'
    );
  }

  // -----------------------------------------
  // 4. SAFETY
  // -----------------------------------------

  const safety =
    evaluateVideoSafety({
      story,
      narration:
        story?.narration || '',
      scenes
    });

  // -----------------------------------------
  // 5. ORIGINALITY
  // -----------------------------------------

  const contentText = [
    story?.title,
    story?.mission,
    story?.narration,

    ...scenes.map(
      scene =>
        scene?.narration || ''
    ),

    ...scenes.map(
      scene =>
        scene?.visualPrompt || ''
    )
  ]
    .filter(Boolean)
    .join(' ');

  const originality =
    checkDuplicateContent(
      contentText,
      previousContents
    );

  // -----------------------------------------
  // 6. VISUAL PROMPTS
  // -----------------------------------------

  const prompts =
    buildScenePromptPack(
      scenes,
      story?.characterBible
    );

  // -----------------------------------------
  // 7. APPROVAL
  // -----------------------------------------

  const approval =
    evaluateApproval({
      safety,
      originality,
      quality: storyQuality,
      publishRequested: false
    });

  // -----------------------------------------
  // 8. FINAL PRODUCTION PLAN
  // -----------------------------------------

  return {
    story,

    scenes,

    prompts,

    storyQuality,

    safety,

    originality,

    approval
  };
}

export default {
  createProductionPlan
};