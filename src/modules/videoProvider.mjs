import fs from 'fs';
import path from 'path';

function cleanText(value) {
  return String(value || '').trim();
}

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function getVideoProvider() {
  const provider =
    cleanText(process.env.VIDEO_PROVIDER) ||
    'stock';

  return provider.toLowerCase();
}

export function validateVideoProvider() {
  const provider =
    getVideoProvider();

  const supported = [
    'stock',
    'veo',
    'runway',
    'luma'
  ];

  if (!supported.includes(provider)) {
    throw new Error(
      `[VideoProvider] Unsupported provider: ${provider}`
    );
  }

  return {
    valid: true,
    provider
  };
}

export async function generateSceneVideo(
  scene,
  options = {}
) {
  if (!scene) {
    throw new Error(
      '[VideoProvider] Scene is required.'
    );
  }

  const provider =
    getVideoProvider();

  const outputDir =
    path.resolve(
      options.outputDir ||
      'output_artifacts/scenes'
    );

  ensureDirectory(outputDir);

  console.log(
    `[VideoProvider] Provider: ${provider}`
  );

  /*
   * This layer intentionally does not fake
   * AI video generation.
   *
   * Real provider APIs will be connected here
   * after credentials/provider configuration.
   */

  if (provider !== 'stock') {
    throw new Error(
      `[VideoProvider] ${provider} provider is selected but its API adapter is not configured yet.`
    );
  }

  return {
    provider,
    status: 'pending',
    sceneNumber:
      scene.sceneNumber,
    visualPrompt:
      cleanText(scene.visualPrompt),
    duration:
      Number(scene.duration) || 5,
    outputPath: null
  };
}

export default {
  getVideoProvider,
  validateVideoProvider,
  generateSceneVideo
};
