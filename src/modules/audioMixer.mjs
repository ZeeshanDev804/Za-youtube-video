import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

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
                `FFmpeg audio operation failed: ${stderr.slice(-3000)}`
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

export async function mixAudio(
  voicePath,
  outputPath,
  options = {}
) {
  if (!voicePath) {
    throw new Error(
      '[AudioMixer] Voice file is required.'
    );
  }

  if (!fs.existsSync(voicePath)) {
    throw new Error(
      `[AudioMixer] Voice file not found: ${voicePath}`
    );
  }

  ensureDirectory(
    path.dirname(outputPath)
  );

  const musicPath =
    options.musicPath || null;

  if (
    musicPath &&
    fs.existsSync(musicPath)
  ) {
    await runFFmpeg([
      '-y',

      '-i',
      voicePath,

      '-stream_loop',
      '-1',

      '-i',
      musicPath,

      '-filter_complex',
      '[1:a]volume=0.10[music];[0:a][music]amix=inputs=2:duration=first:dropout_transition=2[aout]',

      '-map',
      '[aout]',

      '-c:a',
      'aac',

      '-b:a',
      '192k',

      outputPath
    ]);
  } else {
    await runFFmpeg([
      '-y',

      '-i',
      voicePath,

      '-c:a',
      'aac',

      '-b:a',
      '192k',

      outputPath
    ]);
  }

  if (!fs.existsSync(outputPath)) {
    throw new Error(
      '[AudioMixer] Audio output was not created.'
    );
  }

  return {
    path: outputPath,
    musicUsed:
      Boolean(
        musicPath &&
        fs.existsSync(musicPath)
      )
  };
}

export default {
  mixAudio
};
