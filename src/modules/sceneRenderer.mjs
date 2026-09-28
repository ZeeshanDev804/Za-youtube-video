import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true
    });
  }
}

function runFFmpeg(args) {
  return new Promise(
    (resolve, reject) => {
      const process =
        spawn('ffmpeg', args, {
          stdio: [
            'ignore',
            'pipe',
            'pipe'
          ]
        });

      let stderr = '';

      process.stderr.on(
        'data',
        chunk => {
          stderr += chunk.toString();
        }
      );

      process.on(
        'error',
        reject
      );

      process.on(
        'close',
        code => {
          if (code !== 0) {
            reject(
              new Error(
                `FFmpeg failed with code ${code}: ${stderr.slice(-3000)}`
              )
            );
            return;
          }

          resolve();
        }
      );
    }
  );
}

function normalizeDuration(value) {
  const duration =
    Number(value);

  if (
    !Number.isFinite(duration) ||
    duration <= 0
  ) {
    return 5;
  }

  return Math.max(
    1,
    Math.min(15, duration)
  );
}

export async function renderScene(
  inputPath,
  outputPath,
  duration
) {
  if (!inputPath) {
    throw new Error(
      '[SceneRenderer] Input video is required.'
    );
  }

  if (!fs.existsSync(inputPath)) {
    throw new Error(
      `[SceneRenderer] Input file not found: ${inputPath}`
    );
  }

  const finalDuration =
    normalizeDuration(duration);

  ensureDirectory(
    path.dirname(outputPath)
  );

  await runFFmpeg([
    '-y',
    '-stream_loop',
    '-1',
    '-i',
    inputPath,

    '-t',
    String(finalDuration),

    '-vf',
    `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT},fps=${FPS}`,

    '-an',

    '-c:v',
    'libx264',

    '-preset',
    'medium',

    '-pix_fmt',
    'yuv420p',

    '-movflags',
    '+faststart',

    outputPath
  ]);

  if (!fs.existsSync(outputPath)) {
    throw new Error(
      '[SceneRenderer] Output scene was not created.'
    );
  }

  return {
    path: outputPath,
    duration: finalDuration,
    width: WIDTH,
    height: HEIGHT,
    fps: FPS
  };
}

export async function renderSceneBatch(
  scenes,
  options = {}
) {
  if (!Array.isArray(scenes)) {
    throw new Error(
      '[SceneRenderer] Scenes must be an array.'
    );
  }

  const outputDir =
    path.resolve(
      options.outputDir ||
      'output_artifacts/scenes'
    );

  ensureDirectory(outputDir);

  const rendered = [];

  for (
    let index = 0;
    index < scenes.length;
    index++
  ) {
    const scene =
      scenes[index];

    if (!scene.inputPath) {
      rendered.push({
        sceneNumber:
          scene.sceneNumber ||
          index + 1,
        status: 'pending',
        duration:
          normalizeDuration(
            scene.duration
          )
      });

      continue;
    }

    const outputPath =
      path.join(
        outputDir,
        `scene-${String(
          index + 1
        ).padStart(2, '0')}.mp4`
      );

    const result =
      await renderScene(
        scene.inputPath,
        outputPath,
        scene.duration
      );

    rendered.push({
      sceneNumber:
        scene.sceneNumber ||
        index + 1,
      status: 'rendered',
      ...result
    });
  }

  return rendered;
}

export default {
  renderScene,
  renderSceneBatch
};
