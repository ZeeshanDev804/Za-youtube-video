import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import config from "./config/index.mjs";

import {
  parseScriptInput,
  createVideoRequests
} from "./modules/scriptInput.mjs";

import {
  chooseStoryFormat,
  buildCreativeBrief,
  validateCreativeBrief
} from "./modules/creativeDirector.mjs";

import {
  assertStoryQuality
} from "./modules/storyQuality.mjs";

import {
  generateStory
} from "./modules/storyDirector.mjs";

import {
  buildScenes,
  normalizeScenePlan,
  validateSceneContinuity
} from "./modules/sceneDirector.mjs";

import {
  createCharacterBible,
  applyCharacterContinuity,
  validateCharacterBible
} from "./modules/characterBible.mjs";

import {
  createContinuityState,
  applySceneContinuity,
  advanceContinuity
} from "./modules/sceneContinuity.mjs";

import {
  buildVisualPrompt,
  buildScenePromptPack
} from "./modules/promptDirector.mjs";

import {
  buildMediaPlan,
  validateMediaPlan
} from "./modules/mediaPlanner.mjs";

import {
  getVideoProvider,
  validateVideoProvider,
  generateSceneVideo
} from "./modules/videoProvider.mjs";

import {
  generateVoiceover,
  validateVoiceDuration
} from "./modules/voiceEngine.mjs";

import {
  mixAudio
} from "./modules/audioMixer.mjs";

import {
  buildCaptionCues,
  createASS,
  renderCaptions
} from "./modules/captionRenderer.mjs";

import {
  renderSceneBatch
} from "./modules/sceneRenderer.mjs";

import {
  renderFinalVideo
} from "./modules/finalRenderer.mjs";

import {
  runProductionQA
} from "./modules/productionQA.mjs";

import {
  createContentFingerprint,
  checkDuplicateContent
} from "./modules/originalityGuard.mjs";

import {
  evaluateVideoSafety
} from "./modules/safetyGate.mjs";

import {
  evaluateApproval
} from "./modules/approvalGate.mjs";

import {
  createPipelineReport
} from "./modules/pipelineReport.mjs";

import {
  saveDuplicateHistory
} from "./modules/duplicateHistory.mjs";

import {
  buildPublishPackage,
  validatePublishPackage
} from "./modules/publishMetadata.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR =
  process.env.OUTPUT_DIR ||
  path.join(
    __dirname,
    "..",
    "output_artifacts"
  );

fs.mkdirSync(
  OUTPUT_DIR,
  {
    recursive: true
  }
);

function getArguments() {
  const args =
    process.argv.slice(2);

  const countArg =
    args.find(
      (arg) =>
        arg.startsWith("--count=")
    );

  const count =
    countArg
      ? Math.max(
          1,
          Number.parseInt(
            countArg.split("=")[1],
            10
          ) || 1
        )
      : 1;

  const topic =
    args
      .filter(
        (arg) =>
          !arg.startsWith("--")
      )
      .join(" ")
      .trim();

  return {
    topic,
    count
  };
}

function getTimestamp() {
  return new Date()
    .toISOString()
    .replace(
      /[:.]/g,
      "-"
    );
}

function getVideoPath(result) {
  if (
    typeof result === "string"
  ) {
    return result;
  }

  return (
    result?.outputPath ||
    result?.videoPath ||
    result?.path ||
    result?.filePath ||
    null
  );
}

async function runOneVideo({
  topic,
  index
}) {
  console.log("");
  console.log(
    "======================================"
  );
  console.log(
    `STARTING VIDEO ${index}`
  );
  console.log(
    `TOPIC: ${topic}`
  );
  console.log(
    "======================================"
  );

  const project = {
    id:
      `video-${Date.now()}-${index}`,

    topic,

    language:
      "en",

    audience:
      "UK-US-Europe",

    targetDuration:
      40,

    format:
      "youtube-shorts",

    width:
      config?.videoConfig?.width ||
      1080,

    height:
      config?.videoConfig?.height ||
      1920,

    minDuration:
      config?.videoConfig?.minDuration ||
      20,

    maxDuration:
      config?.videoConfig?.maxDuration ||
      59,

    fps:
      config?.videoConfig?.fps ||
      30
  };

  console.log(
    "[1/20] Script input..."
  );

  const parsedInput =
    await parseScriptInput({
      topic,
      project
    });

  const requests =
    createVideoRequests({
      topic,
      scriptInput:
        parsedInput,
      count: 1
    });

  const scriptInput =
    Array.isArray(requests) &&
    requests.length > 0
      ? requests[0]
      : parsedInput;

  console.log(
    "[2/20] Creative director..."
  );

  const storyFormat =
    chooseStoryFormat({
      topic,
      project,
      scriptInput
    });

  const creativeBrief =
    buildCreativeBrief({
      project,
      topic,
      scriptInput,
      storyFormat
    });

  const creativeValidation =
    validateCreativeBrief(
      creativeBrief
    );

  if (
    creativeValidation === false
  ) {
    throw new Error(
      "Creative brief validation failed."
    );
  }

  console.log(
    "[3/20] Story director..."
  );

  const story =
    await generateStory(
      topic,
      {
        userScript:
          scriptInput?.script ||
          scriptInput?.text ||
          "",

        project,

        creativeBrief
      }
    );

  console.log(
    "[4/20] Story quality..."
  );

  /*
   * IMPORTANT:
   * Pass the actual story object
   * directly to StoryQuality.
   *
   * Do NOT run:
   * evaluateStory(story)
   * and then pass that result
   * into assertStoryQuality().
   */

  const storyQuality =
    assertStoryQuality(
      story
    );

  console.log(
    `Story quality score: ${storyQuality.score}%`
  );

  console.log(
    `Story words: ${storyQuality.wordCount}`
  );

  console.log(
    `Story duration: ${storyQuality.estimatedDuration}s`
  );

  console.log(
    "[5/20] Scene director..."
  );

  const rawScenes =
    await buildScenes(
      story
    );

  const scenes =
    normalizeScenePlan(
      rawScenes
    );

  const sceneValidation =
    validateSceneContinuity(
      scenes
    );

  if (
    sceneValidation === false
  ) {
    throw new Error(
      "Scene continuity validation failed."
    );
  }

  console.log(
    "[6/20] Character bible..."
  );

  const characterBible =
    createCharacterBible({
      story,
      scenes,
      project
    });

  validateCharacterBible(
    characterBible
  );

  console.log(
    "[7/20] Scene continuity..."
  );

  let continuity =
    createContinuityState({
      project,
      characterBible
    });

  const continuousScenes =
    scenes.map(
      (scene) => {
        const result =
          applySceneContinuity(
            scene,
            continuity,
            characterBible
          );

        continuity =
          advanceContinuity(
            continuity,
            scene
          );

        return result;
      }
    );

  console.log(
    "[8/20] Prompt director..."
  );

  const prompts =
    buildScenePromptPack(
      continuousScenes,
      characterBible
    );

  console.log(
    "[9/20] Media planner..."
  );

  const mediaPlan =
    buildMediaPlan({
      project,
      scenes:
        continuousScenes,
      prompts,
      characterBible
    });

  validateMediaPlan(
    mediaPlan
  );

  console.log(
    "[10/20] Video provider..."
  );

  const provider =
    getVideoProvider(
      project?.videoProvider ||
        process.env.VIDEO_PROVIDER ||
        "stock"
    );

  validateVideoProvider(
    provider
  );

  const videoAssets = [];

  for (
    let i = 0;
    i < continuousScenes.length;
    i += 1
  ) {
    const scene =
      continuousScenes[i];

    const prompt =
      prompts?.[i] ||
      prompts?.scenes?.[i] ||
      buildVisualPrompt(
        scene,
        characterBible
      );

    const asset =
      await generateSceneVideo({
        provider,
        project,
        scene,
        prompt,
        mediaPlan
      });

    videoAssets.push(
      asset
    );
  }

  console.log(
    "[11/20] Voice engine..."
  );

  const voice =
    await generateVoiceover({
      text:
        story?.narration ||
        scriptInput?.script ||
        scriptInput?.text ||
        "",

      outputDir:
        OUTPUT_DIR,

      project
    });

  if (!voice) {
    throw new Error(
      "Voiceover generation returned no result."
    );
  }

  const voicePath =
    getVideoPath(
      voice
    ) ||
    voice?.audioPath ||
    voice?.path;

  if (!voicePath) {
    throw new Error(
      "Voiceover path was not returned."
    );
  }

  if (
    typeof validateVoiceDuration ===
      "function"
  ) {
    validateVoiceDuration(
      voice
    );
  }

  console.log(
    "[12/20] Scene renderer..."
  );

  const sceneRender =
    await renderSceneBatch({
      project,
      scenes:
        continuousScenes,
      videoAssets,
      outputDir:
        OUTPUT_DIR
    });

  console.log(
    "[13/20] Caption renderer..."
  );

  const captionCues =
    buildCaptionCues({
      script:
        story?.narration ||
        scriptInput?.script ||
        scriptInput?.text ||
        "",

      scenes:
        continuousScenes
    });

  const assPath =
    path.join(
      OUTPUT_DIR,
      `captions-${index}-${getTimestamp()}.ass`
    );

  createASS(
    captionCues,
    assPath
  );

  const captions =
    await renderCaptions({
      project,
      scenes:
        continuousScenes,
      captions:
        captionCues,
      assPath,
      outputDir:
        OUTPUT_DIR
    });

  console.log(
    "[14/20] Audio mixer..."
  );

  const mixedAudio =
    await mixAudio({
      project,
      voice,
      voicePath,
      outputDir:
        OUTPUT_DIR
    });

  console.log(
    "[15/20] Final renderer..."
  );

  const finalPath =
    path.join(
      OUTPUT_DIR,
      `short-${index}-${getTimestamp()}.mp4`
    );

  const rendered =
    await renderFinalVideo({
      project,
      scenes:
        continuousScenes,
      sceneRender,
      mixedAudio,
      captions,
      outputPath:
        finalPath
    });

  const outputPath =
    getVideoPath(
      rendered
    ) ||
    finalPath;

  if (
    !fs.existsSync(
      outputPath
    )
  ) {
    throw new Error(
      `Final MP4 was not created: ${outputPath}`
    );
  }

  console.log(
    "[16/20] Production QA..."
  );

  const qa =
    await runProductionQA(
      outputPath
    );

  if (
    qa?.valid === false
  ) {
    throw new Error(
      `Production QA failed: ${
        qa.reasons?.join(" ") ||
        "quality requirements not met"
      }`
    );
  }

  console.log(
    "[17/20] Originality guard..."
  );

  const contentText = [
    story?.title,
    story?.mission,
    story?.narration,

    ...continuousScenes.map(
      (scene) =>
        scene?.narration || ""
    )
  ]
    .filter(Boolean)
    .join(" ");

  const fingerprint =
    createContentFingerprint(
      contentText
    );

  const originality =
    checkDuplicateContent(
      contentText,
      []
    );

  console.log(
    `Content fingerprint: ${fingerprint}`
  );

  if (
    originality?.duplicate
  ) {
    throw new Error(
      "Duplicate content detected."
    );
  }

  console.log(
    "[18/20] Safety gate..."
  );

  const safety =
    evaluateVideoSafety({
      story,

      narration:
        story?.narration,

      scenes:
        continuousScenes
    });

  if (
    safety?.status === "REJECT"
  ) {
    throw new Error(
      `Safety gate rejected content: ${
        safety.reasons?.join(" ") ||
        "safety risk detected"
      }`
    );
  }

  console.log(
    "[19/20] Approval gate..."
  );

  const approval =
    evaluateApproval({
      safety,
      originality,
      quality:
        qa,
      publishRequested:
        false
    });

  console.log(
    `Approval status: ${approval.status}`
  );

  console.log(
    "[20/20] Publish package + report..."
  );

  const publishPackage =
    buildPublishPackage({
      videoPath:
        outputPath,

      title:
        story?.title ||
        topic,

      description:
        story?.description ||
        story?.narration ||
        "",

      hashtags:
        story?.hashtags ||
        [],

      compliance: {
        humanReviewRequired:
          !approval.approved
      },

      approval
    });

  const publishValidation =
    validatePublishPackage(
      publishPackage
    );

  const report =
    createPipelineReport({
      status:
        publishValidation.valid
          ? "READY"
          : "REVIEW",

      videoNumber:
        index,

      title:
        publishPackage.title,

      topic,

      story,

      scenes:
        continuousScenes,

      voice,

      video: {
        outputPath
      },

      quality:
        qa,

      safety,

      originality,

      approval,

      errors:
        publishValidation.reasons
    });

  await saveDuplicateHistory({
    project,
    scriptInput,

    scenes:
      continuousScenes,

    originality
  });

  console.log("");
  console.log(
    "======================================"
  );
  console.log(
    "VIDEO PIPELINE COMPLETED"
  );
  console.log(
    "======================================"
  );
  console.log(
    `Output: ${outputPath}`
  );
  console.log(
    `QA: ${
      qa?.valid
        ? "PASS"
        : "FAIL"
    }`
  );
  console.log(
    `Approval: ${
      approval?.approved
        ? "APPROVED"
        : "REVIEW"
    }`
  );
  console.log(
    "======================================"
  );

  return {
    project,
    outputPath,
    story,
    scenes:
      continuousScenes,
    voice,
    qa,
    originality,
    safety,
    approval,
    publishPackage,
    report
  };
}

async function main() {
  const {
    topic,
    count
  } = getArguments();

  if (!topic) {
    console.error("");
    console.error(
      "Usage:"
    );
    console.error(
      'node src/orchestrator.mjs "Never Give Up" --count=1'
    );
    console.error("");
    process.exitCode = 1;
    return;
  }

  console.log("");
  console.log(
    "======================================"
  );
  console.log(
    "ZEESHAN AI VIDEO GENERATOR"
  );
  console.log(
    "======================================"
  );
  console.log(
    `Topic: ${topic}`
  );
  console.log(
    `Video count: ${count}`
  );
  console.log(
    `Target: ${
      config?.videoConfig?.width ||
      1080
    }x${
      config?.videoConfig?.height ||
      1920
    }`
  );
  console.log(
    "======================================"
  );

  const results = [];

  for (
    let i = 1;
    i <= count;
    i += 1
  ) {
    try {
      const result =
        await runOneVideo({
          topic,
          index: i
        });

      results.push({
        success: true,
        ...result
      });
    } catch (error) {
      console.error("");
      console.error(
        `VIDEO ${i} FAILED`
      );
      console.error(
        error?.stack ||
          error?.message ||
          error
      );

      results.push({
        success: false,
        index: i,
        error:
          error?.message ||
          String(error)
      });
    }
  }

  const successful =
    results.filter(
      (item) =>
        item.success
    ).length;

  console.log("");
  console.log(
    "======================================"
  );
  console.log(
    "PIPELINE SUMMARY"
  );
  console.log(
    "======================================"
  );
  console.log(
    `Requested: ${count}`
  );
  console.log(
    `Successful: ${successful}`
  );
  console.log(
    `Failed: ${count - successful}`
  );
  console.log(
    "======================================"
  );

  if (
    successful === 0
  ) {
    process.exitCode = 1;
  }
}

main().catch(
  (error) => {
    console.error("");
    console.error(
      "FATAL PIPELINE ERROR"
    );
    console.error(
      error?.stack ||
        error?.message ||
        error
    );
    process.exitCode = 1;
  }
);