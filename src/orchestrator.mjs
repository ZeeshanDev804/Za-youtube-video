import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import config from "./config/index.mjs";

import { processScriptInput } from "./modules/scriptInput.mjs";
import { createCreativePlan } from "./modules/creativeDirector.mjs";
import { evaluateStoryQuality } from "./modules/storyQuality.mjs";
import { createScenes } from "./modules/sceneDirector.mjs";
import { createCharacterBible } from "./modules/characterBible.mjs";
import { checkSceneContinuity } from "./modules/sceneContinuity.mjs";
import { createPrompts } from "./modules/promptDirector.mjs";
import { planMedia } from "./modules/mediaPlanner.mjs";

import { generateVideo } from "./modules/videoProvider.mjs";
import { generateVoice } from "./modules/voiceEngine.mjs";

import { mixAudio } from "./modules/audioMixer.mjs";
import { renderCaptions } from "./modules/captionRenderer.mjs";
import { renderScenes } from "./modules/sceneRenderer.mjs";
import { renderFinalVideo } from "./modules/finalRenderer.mjs";

import { runProductionQA } from "./modules/productionQA.mjs";
import { checkOriginality } from "./modules/originalityGuard.mjs";
import { checkSafety } from "./modules/safetyGate.mjs";
import { requestApproval } from "./modules/approvalGate.mjs";

import { createPipelineReport } from "./modules/pipelineReport.mjs";
import { saveDuplicateHistory } from "./modules/duplicateHistory.mjs";
import { createPublishMetadata } from "./modules/publishMetadata.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR =
  process.env.OUTPUT_DIR ||
  path.join(__dirname, "..", "output_artifacts");

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function getArguments() {
  const args = process.argv.slice(2);

  const countArg = args.find((arg) => arg.startsWith("--count="));

  const count = countArg
    ? Math.max(1, Number.parseInt(countArg.split("=")[1], 10) || 1)
    : 1;

  const topic = args
    .filter((arg) => !arg.startsWith("--"))
    .join(" ")
    .trim();

  return {
    topic,
    count
  };
}

function getTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function runOneVideo({ topic, index }) {
  console.log("");
  console.log("======================================");
  console.log(`STARTING VIDEO ${index}`);
  console.log(`TOPIC: ${topic}`);
  console.log("======================================");

  const project = {
    id: `video-${Date.now()}-${index}`,
    topic,
    language: "en",
    audience: "UK-US-Europe",
    targetDuration: 40,
    format: "youtube-shorts",
    width: 1080,
    height: 1920
  };

  console.log("[1/20] Script input...");

  const scriptInput = await processScriptInput({
    topic,
    project
  });

  console.log("[2/20] Creative director...");

  const creativePlan = await createCreativePlan({
    project,
    scriptInput
  });

  console.log("[3/20] Story quality...");

  const storyQuality = await evaluateStoryQuality({
    project,
    creativePlan
  });

  if (storyQuality?.approved === false) {
    throw new Error(
      `Story quality rejected: ${
        storyQuality.reason || "quality requirements not met"
      }`
    );
  }

  console.log("[4/20] Scene director...");

  const scenes = await createScenes({
    project,
    creativePlan,
    storyQuality
  });

  console.log("[5/20] Character bible...");

  const characterBible = await createCharacterBible({
    project,
    scenes,
    creativePlan
  });

  console.log("[6/20] Scene continuity...");

  const continuity = await checkSceneContinuity({
    project,
    scenes,
    characterBible
  });

  if (continuity?.approved === false) {
    throw new Error(
      `Scene continuity rejected: ${
        continuity.reason || "continuity check failed"
      }`
    );
  }

  console.log("[7/20] Prompt director...");

  const prompts = await createPrompts({
    project,
    scenes,
    characterBible,
    continuity
  });

  console.log("[8/20] Media planner...");

  const mediaPlan = await planMedia({
    project,
    scenes,
    prompts,
    characterBible
  });

  console.log("[9/20] Video provider...");

  const videoAssets = await generateVideo({
    project,
    scenes,
    prompts,
    mediaPlan,
    characterBible
  });

  console.log("[10/20] Voice engine...");

  const voice = await generateVoice({
    project,
    scriptInput,
    outputDir: OUTPUT_DIR
  });

  console.log("[11/20] Scene renderer...");

  const sceneRender = await renderScenes({
    project,
    scenes,
    videoAssets,
    outputDir: OUTPUT_DIR
  });

  console.log("[12/20] Caption renderer...");

  const captions = await renderCaptions({
    project,
    scriptInput,
    scenes,
    outputDir: OUTPUT_DIR
  });

  console.log("[13/20] Audio mixer...");

  const mixedAudio = await mixAudio({
    project,
    voice,
    outputDir: OUTPUT_DIR
  });

  console.log("[14/20] Final renderer...");

  const finalPath = path.join(
    OUTPUT_DIR,
    `short-${index}-${getTimestamp()}.mp4`
  );

  const renderedVideo = await renderFinalVideo({
    project,
    scenes,
    sceneRender,
    mixedAudio,
    captions,
    outputPath: finalPath
  });

  console.log("[15/20] Production QA...");

  const qa = await runProductionQA({
    project,
    videoPath: renderedVideo || finalPath
  });

  if (qa?.approved === false) {
    throw new Error(
      `Production QA rejected: ${
        qa.reason || "video quality requirements not met"
      }`
    );
  }

  console.log("[16/20] Originality guard...");

  const originality = await checkOriginality({
    project,
    creativePlan,
    scenes,
    scriptInput
  });

  if (originality?.approved === false) {
    throw new Error(
      `Originality check rejected: ${
        originality.reason || "duplicate/originality risk detected"
      }`
    );
  }

  console.log("[17/20] Safety gate...");

  const safety = await checkSafety({
    project,
    scriptInput,
    scenes,
    creativePlan
  });

  if (safety?.approved === false) {
    throw new Error(
      `Safety gate rejected: ${
        safety.reason || "safety requirements not met"
      }`
    );
  }

  console.log("[18/20] Approval gate...");

  const approval = await requestApproval({
    project,
    videoPath: renderedVideo || finalPath,
    qa,
    originality,
    safety
  });

  console.log("[19/20] Duplicate history...");

  await saveDuplicateHistory({
    project,
    scriptInput,
    scenes,
    originality
  });

  console.log("[20/20] Publish metadata + report...");

  const publishMetadata = await createPublishMetadata({
    project,
    creativePlan,
    scriptInput,
    scenes
  });

  const report = await createPipelineReport({
    project,
    scriptInput,
    creativePlan,
    scenes,
    characterBible,
    continuity,
    qa,
    originality,
    safety,
    approval,
    publishMetadata,
    outputPath: renderedVideo || finalPath
  });

  console.log("");
  console.log("======================================");
  console.log("VIDEO PIPELINE COMPLETED");
  console.log("======================================");
  console.log(`Output: ${renderedVideo || finalPath}`);
  console.log(`Approval: ${approval?.approved ? "APPROVED" : "PENDING"}`);
  console.log("======================================");

  return {
    project,
    outputPath: renderedVideo || finalPath,
    qa,
    originality,
    safety,
    approval,
    publishMetadata,
    report
  };
}

async function main() {
  const { topic, count } = getArguments();

  if (!topic) {
    console.error("");
    console.error("Usage:");
    console.error('node src/orchestrator.mjs "Never Give Up" --count=1');
    console.error("");
    process.exitCode = 1;
    return;
  }

  console.log("");
  console.log("======================================");
  console.log("ZEESHAN AI VIDEO GENERATOR");
  console.log("======================================");
  console.log(`Topic: ${topic}`);
  console.log(`Video count: ${count}`);
  console.log(
    `Target: ${config?.videoConfig?.width || 1080}x${
      config?.videoConfig?.height || 1920
    }`
  );
  console.log("======================================");

  const results = [];

  for (let i = 1; i <= count; i += 1) {
    try {
      const result = await runOneVideo({
        topic,
        index: i
      });

      results.push({
        success: true,
        ...result
      });
    } catch (error) {
      console.error("");
      console.error(`VIDEO ${i} FAILED`);
      console.error(error?.stack || error?.message || error);

      results.push({
        success: false,
        index: i,
        error: error?.message || String(error)
      });
    }
  }

  const successful = results.filter((item) => item.success).length;

  console.log("");
  console.log("======================================");
  console.log("PIPELINE SUMMARY");
  console.log("======================================");
  console.log(`Requested: ${count}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${count - successful}`);
  console.log("======================================");

  if (successful === 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("");
  console.error("FATAL PIPELINE ERROR");
  console.error(error?.stack || error?.message || error);
  process.exitCode = 1;
});
