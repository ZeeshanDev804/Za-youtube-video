import fs from 'fs';
import { spawn } from 'child_process';

const MIN_DURATION = 20;
const MAX_DURATION = 59;
const TARGET_WIDTH = 1080;
const TARGET_HEIGHT = 1920;

function runFFprobe(args) {
  return new Promise(
    (resolve, reject) => {
      const process =
        spawn('ffprobe', args, {
          stdio: [
            'ignore',
            'pipe',
            'pipe'
          ]
        });

      let stdout = '';
      let stderr = '';

      process.stdout.on(
        'data',
        chunk => {
          stdout += chunk.toString();
        }
      );

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
                `FFprobe failed: ${stderr}`
              )
            );
            return;
          }

          resolve(
            stdout.trim()
          );
        }
      );
    }
  );
}

export async function inspectVideo(
  videoPath
) {
  if (!videoPath) {
    throw new Error(
      '[VideoQuality] Video path is required.'
    );
  }

  if (!fs.existsSync(videoPath)) {
    throw new Error(
      `[VideoQuality] Video not found: ${videoPath}`
    );
  }

  const raw =
    await runFFprobe([
      '-v',
      'error',

      '-show_entries',
      'format=duration',

      '-show_entries',
      'stream=codec_type,codec_name,width,height,r_frame_rate',

      '-of',
      'json',

      videoPath
    ]);

  const data =
    JSON.parse(raw || '{}');

  const duration =
    Number(
      data?.format?.duration
    ) || 0;

  const streams =
    Array.isArray(data?.streams)
      ? data.streams
      : [];

  const videoStream =
    streams.find(
      stream =>
        stream.codec_type ===
        'video'
    );

  const audioStream =
    streams.find(
      stream =>
        stream.codec_type ===
        'audio'
    );

  return {
    path: videoPath,
    duration,
    width:
      Number(
        videoStream?.width
      ) || 0,
    height:
      Number(
        videoStream?.height
      ) || 0,
    videoCodec:
      videoStream?.codec_name ||
      null,
    audioCodec:
      audioStream?.codec_name ||
      null,
    frameRate:
      videoStream?.r_frame_rate ||
      null,
    hasVideo:
      Boolean(videoStream),
    hasAudio:
      Boolean(audioStream)
  };
}

export function evaluateVideo(
  info
) {
  const reasons = [];

  if (!info.hasVideo) {
    reasons.push(
      'Video stream is missing.'
    );
  }

  if (!info.hasAudio) {
    reasons.push(
      'Audio stream is missing.'
    );
  }

  if (
    info.width !==
      TARGET_WIDTH ||
    info.height !==
      TARGET_HEIGHT
  ) {
    reasons.push(
      `Resolution must be ${TARGET_WIDTH}x${TARGET_HEIGHT}.`
    );
  }

  if (
    info.duration <
      MIN_DURATION ||
    info.duration >
      MAX_DURATION
  ) {
    reasons.push(
      `Duration must be between ${MIN_DURATION} and ${MAX_DURATION} seconds.`
    );
  }

  if (
    info.videoCodec &&
    info.videoCodec !== 'h264'
  ) {
    reasons.push(
      'Video codec should be H.264.'
    );
  }

  if (
    info.audioCodec &&
    info.audioCodec !== 'aac'
  ) {
    reasons.push(
      'Audio codec should be AAC.'
    );
  }

  return {
    valid:
      reasons.length === 0,
    reasons
  };
}

export async function validateVideo(
  videoPath
) {
  const info =
    await inspectVideo(
      videoPath
    );

  const quality =
    evaluateVideo(info);

  if (!quality.valid) {
    console.error(
      '[VideoQuality] Video rejected:',
      quality.reasons.join(' ')
    );
  } else {
    console.log(
      '[VideoQuality] Video passed technical QA.'
    );
  }

  return {
    ...quality,
    info
  };
}

export default {
  inspectVideo,
  evaluateVideo,
  validateVideo
};
