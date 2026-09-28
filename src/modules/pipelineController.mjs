import { generateStory } from './storyDirector.mjs';
import { buildScenes } from './sceneDirector.mjs';
import { buildPromptPack } from './promptDirector.mjs';
import { evaluateStory } from './storyQuality.mjs';
import { evaluateVideoSafety } from './safetyGate.mjs';
import { checkDuplicateContent } from './originalityGuard.mjs';
import { evaluateApproval } from './approvalGate.mjs';

export async function createProductionPlan({
  topic = '',
  userScript = '',
  previousContents = []
} = {}) {
  const source =
    String(userScript || topic || '').trim();

  if (!source) {
    throw new Error(
      '[PipelineController] Topic or script is required.'
    );
  }

  const story =
    await generateStory(
      topic || source,
      {
        userScript
      }
    );

  const storyQuality =
    evaluateStory(story);

  const scenes =
    buildScenes(story);

  const safety =
    evaluateVideoSafety({
      story,
      scenes
    });

  const originality =
    checkDuplicateContent(
      [
        story.title,
        story.mission,
        story.narration,
        ...scenes.map(
          scene => scene.narration
        )
      ]
        .filter(Boolean)
        .join(' '),
      previousContents
    );

  const prompts =
    buildPromptPack(
      scenes,
      story
    );

  const approval =
    evaluateApproval({
      safety,
      originality,
      quality: storyQuality,
      publishRequested: false
    });

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
