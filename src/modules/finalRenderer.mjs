import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;

function ensureDirectory(dir) {
  fs.mkdirSync(dir, {
    recursive: true
  });
}

function runFFmpeg(args) {
  return new Promise((resolve, reject) => {
    const process = spawn('ffmpeg', args, {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stderr = '';

    process.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });

    process.on('error', reject);

    process.on('close', code => {
      if (code !== 0) {
        reject(
          new Error(
            `[FinalRenderer] FFmpeg failed: ${stderr.slice(-4000)}`
          )
        );
        return;
      }

      resolve();
    });
  });
}

function validateInputFiles(sceneVideos) {
  if (!Array.isArray(sceneVideos) || sceneVideos.length === 0) {
    throw new Error(
      '[FinalRenderer] Scene videos are required.'
    );
  }

  for (const video of sceneVideos) {
    if (!video?.path) {
      throw new Error(
        '[FinalRenderer] Scene video path is missing.'
      );
    }

    if (!fs.existsSync(video.path)) {
      throw new Error(
        `[FinalRenderer] Scene video not found: ${video.path}`
      );
    }
  }
}

export async function renderFinalVideo(
  sceneVideos,
  options = {}
) {
  validateInputFiles(sceneVideos);

  const outputDir = path.resolve(
    options.outputDir || 'output_artifacts'
  );

  ensureDirectory(outputDir);

  const outputPath =
    path.resolve(
      options.outputPath ||
      path.join(
        outputDir,
        'final-short.mp4'
      )
    );

  const concatFile =
    path.join(
      outputDir,
      'scene-concat.txt'
    );

  const concatContent =
    sceneVideos
      .map(video => {
        const safePath =
          path.resolve(video.path)
            .replace(/'/g, "'\\''");

        return `file '${safePath}'`;
      })
      .join('\n');

  fs.writeFileSync(
    concatFile,
    concatContent + '\n',
    'utf8'
  );

  await runFFmpeg([
    '-y',

    '-f',
    'concat',

    '-safe',
    '0',

    '-i',
    concatFile,

    '-vf',
    `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT},fps=${FPS}`,

    '-c:v',
    'libx264',

    '-preset',
    'medium',

    '-pix_fmt',
    'yuv420p',

    '-movflags',
    '+faststart',

    '-an',

    outputPath
  ]);

  if (!fs.existsSync(outputPath)) {
    throw new Error(
      '[FinalRenderer] Final video was not created.'
    );
  }

  console.log(
    `[FinalRenderer] Final video created: ${outputPath}`
  );

  return {
    path: outputPath,
    width: WIDTH,
    height: HEIGHT,
    fps: FPS
  };
}

export default {
  renderFinalVideo
};
