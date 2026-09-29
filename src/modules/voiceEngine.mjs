import gTTS from 'gtts';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'node:child_process';
import config from '../config/index.mjs';

const MIN_DURATION = 20;
const MAX_DURATION = 59;

const TARGET_WORDS_MIN = 80;
const TARGET_WORDS_MAX = 125;

const DEFAULT_LANGUAGE = 'en';
const DEFAULT_PROVIDER = 'gtts';
const DEFAULT_WORDS_PER_MINUTE = 145;

function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(text) {
  const cleaned = cleanText(text);

  if (!cleaned) {
    return 0;
  }

  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

function estimateDuration(text) {
  const words = countWords(text);

  if (!words) {
    return 0;
  }

  return Math.round(
    (words / DEFAULT_WORDS_PER_MINUTE) * 60
  );
}

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true
    });
  }
}

function sanitizeFileName(value) {
  const cleaned = cleanText(value);

  if (!cleaned) {
    return `voice-${Date.now()}.mp3`;
  }

  const safeName = cleaned
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^\.+/, '')
    .trim();

  if (!safeName) {
    return `voice-${Date.now()}.mp3`;
  }

  return safeName.endsWith('.mp3')
    ? safeName
    : `${safeName}.mp3`;
}

function validateNarration(text) {
  const narration = cleanText(text);

  if (!narration) {
    throw new Error(
      '[VoiceEngine] Narration is required.'
    );
  }

  const words = countWords(narration);

  if (words < TARGET_WORDS_MIN) {
    console.warn(
      `[VoiceEngine] Narration is short: ${words} words.`
    );
  }

  if (words > TARGET_WORDS_MAX) {
    console.warn(
      `[VoiceEngine] Narration is long: ${words} words.`
    );
  }

  const estimatedDuration =
    estimateDuration(narration);

  console.log(
    `[VoiceEngine] Estimated voice duration: ${estimatedDuration}s`
  );

  if (estimatedDuration < MIN_DURATION) {
    console.warn(
      `[VoiceEngine] Estimated duration is below ${MIN_DURATION}s.`
    );
  }

  if (estimatedDuration > MAX_DURATION) {
    console.warn(
      `[VoiceEngine] Estimated duration is above ${MAX_DURATION}s.`
    );
  }

  return narration;
}

function getAudioDuration(filePath) {
  try {
    const output = execFileSync(
      'ffprobe',
      [
        '-v',
        'error',
        '-show_entries',
        'format=duration',
        '-of',
        'default=noprint_wrappers=1:nokey=1',
        filePath
      ],
      {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe']
      }
    );

    const duration =
      Number.parseFloat(
        String(output).trim()
      );

    if (
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      return null;
    }

    return Number(
      duration.toFixed(3)
    );
  } catch (error) {
    console.warn(
      `[VoiceEngine] Could not read actual audio duration: ${error.message}`
    );

    return null;
  }
}

function validateGeneratedAudio(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      '[VoiceEngine] Voice file was not created.'
    );
  }

  const stats =
    fs.statSync(filePath);

  if (stats.size === 0) {
    throw new Error(
      '[VoiceEngine] Generated voice file is empty.'
    );
  }

  return {
    sizeBytes: stats.size
  };
}

function normalizeProvider(value) {
  return (
    cleanText(value) ||
    DEFAULT_PROVIDER
  ).toLowerCase();
}

function normalizeLanguage(value) {
  return (
    cleanText(value) ||
    DEFAULT_LANGUAGE
  ).toLowerCase();
}

async function generateWithGtts(
  text,
  language,
  outputPath
) {
  return new Promise(
    (resolve, reject) => {
      try {
        const speech =
          new gTTS(
            text,
            language
          );

        speech.save(
          outputPath,
          error => {
            if (error) {
              reject(
                new Error(
                  `[VoiceEngine] gTTS generation failed: ${error.message}`
                )
              );

              return;
            }

            resolve(
              outputPath
            );
          }
        );
      } catch (error) {
        reject(
          new Error(
            `[VoiceEngine] gTTS error: ${error.message}`
          )
        );
      }
    }
  );
}

export async function generateVoiceover(
  narration,
  options = {}
) {
  const text =
    validateNarration(
      narration
    );

  const outputDir =
    path.resolve(
      options.outputDir ||
      config.outputDir ||
      'output_artifacts'
    );

  ensureDirectory(
    outputDir
  );

  const fileName =
    sanitizeFileName(
      options.fileName
    );

  const outputPath =
    path.join(
      outputDir,
      fileName
    );

  const language =
    normalizeLanguage(
      options.language ||
      config.audioConfig?.language
    );

  const provider =
    normalizeProvider(
      options.provider ||
      config.audioConfig?.provider
    );

  if (provider !== 'gtts') {
    throw new Error(
      `[VoiceEngine] Provider "${provider}" is not configured yet. Current active provider: gtts.`
    );
  }

  console.log(
    `[VoiceEngine] Provider: ${provider}`
  );

  console.log(
    `[VoiceEngine] Language: ${language}`
  );

  console.log(
    `[VoiceEngine] Generating voiceover: ${outputPath}`
  );

  await generateWithGtts(
    text,
    language,
    outputPath
  );

  const audioInfo =
    validateGeneratedAudio(
      outputPath
    );

  const actualDuration =
    getAudioDuration(
      outputPath
    );

  const estimatedDuration =
    estimateDuration(
      text
    );

  const durationForValidation =
    actualDuration ??
    estimatedDuration;

  const durationValidation =
    validateVoiceDuration(
      durationForValidation
    );

  if (!durationValidation.valid) {
    console.warn(
      `[VoiceEngine] ${durationValidation.reason}`
    );
  }

  console.log(
    `[VoiceEngine] Voiceover created successfully: ${outputPath}`
  );

  if (actualDuration !== null) {
    console.log(
      `[VoiceEngine] Actual audio duration: ${actualDuration}s`
    );
  }

  return {
    path: outputPath,
    filePath: outputPath,

    provider,

    language,

    wordCount:
      countWords(text),

    durationEstimate:
      estimatedDuration,

    duration:
      actualDuration,

    durationValidation,

    sizeBytes:
      audioInfo.sizeBytes,

    narration:
      text
  };
}

export function getVoiceDurationEstimate(
  narration
) {
  return estimateDuration(
    cleanText(narration)
  );
}

export function validateVoiceDuration(
  duration
) {
  const seconds =
    Number(duration);

  if (!Number.isFinite(seconds)) {
    return {
      valid: false,
      reason:
        'Voice duration is not a valid number.'
    };
  }

  if (
    seconds < MIN_DURATION ||
    seconds > MAX_DURATION
  ) {
    return {
      valid: false,
      reason:
        `Voice duration must be between ${MIN_DURATION} and ${MAX_DURATION} seconds.`,
      duration: seconds
    };
  }

  return {
    valid: true,
    duration: seconds,
    reason:
      'Voice duration is within Shorts range.'
  };
}

export default {
  generateVoiceover,
  getVoiceDurationEstimate,
  validateVoiceDuration
};