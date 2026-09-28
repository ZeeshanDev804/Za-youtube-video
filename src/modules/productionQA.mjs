import fs from 'fs';
import { spawn } from 'child_process';

function runFFprobe(args) {
  return new Promise(
    (resolve, reject) => {
      const process =
        spawn(
          'ffprobe',
          args,
          {
            stdio: [
              'ignore',
              'pipe',
              'pipe'
            ]
          }
        );

      let stdout = '';
      let stderr = '';

      process.stdout.on(
        'data',
        chunk => {
          stdout +=
            chunk.toString();
        }
      );

      process.stderr.on(
        'data',
        chunk => {
          stderr +=
            chunk.toString();
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
                `[ProductionQA] FFprobe failed: ${stderr.slice(-2000)}`
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

export async function inspectProductionVideo(
  videoPath
) {
  if (!videoPath) {
    throw new Error(
      '[ProductionQA] Video path is required.'
    );
  }

  if (!fs.existsSync(videoPath)) {
    throw new Error(
      `[ProductionQA] Video not found: ${videoPath}`
    );
  }

  const raw =
    await runFFprobe([
      '-v',
      'error',
      '-show_entries',
      'format=duration,size',
      '-show_entries',
      'stream=codec_type,codec_name,width,height,avg_frame_rate',
      '-of',
      'json',
      videoPath
    ]);

  const data =
    JSON.parse(
      raw || '{}'
    );

  const streams =
    Array.isArray(data.streams)
      ? data.streams
      : [];

  const video =
    streams.find(
      stream =>
        stream.codec_type ===
        'video'
    );

  const audio =
    streams.find(
      stream =>
        stream.codec_type ===
        'audio'
    );

  return {
    path: videoPath,

    duration:
      Number(
        data?.format?.duration
      ) || 0,

    size:
      Number(
        data?.format?.size
      ) || 0,

    width:
      Number(video?.width) || 0,

    height:
      Number(video?.height) || 0,

    videoCodec:
      video?.codec_name || null,

    audioCodec:
      audio?.codec_name || null,

    frameRate:
      video?.avg_frame_rate || null,

    hasVideo:
      Boolean(video),

    hasAudio:
      Boolean(audio)
  };
}

export function evaluateProduction(
  info
) {
  const reasons = [];

  if (!info.hasVideo) {
    reasons.push(
      'Video stream missing.'
    );
  }

  if (!info.hasAudio) {
    reasons.push(
      'Audio stream missing.'
    );
  }

  if (
    info.width !== 1080 ||
    info.height !== 1920
  ) {
    reasons.push(
      'Final video must be 1080x1920.'
    );
  }

  if (
    info.duration < 20 ||
    info.duration > 59
  ) {
    reasons.push(
      'Final video must be between 20 and 59 seconds.'
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

  if (info.size <= 0) {
    reasons.push(
      'Video file is empty.'
    );
  }

  return {
    valid:
      reasons.length === 0,

    reasons
  };
}

export async function runProductionQA(
  videoPath
) {
  const info =
    await inspectProductionVideo(
      videoPath
    );

  const result =
    evaluateProduction(
      info
    );

  return {
    ...result,
    info
  };
}

export default {
  inspectProductionVideo,
  evaluateProduction,
  runProductionQA
};
