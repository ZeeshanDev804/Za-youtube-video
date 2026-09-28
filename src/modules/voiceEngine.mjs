import gTTS from 'gtts';
import fs from 'fs';
import path from 'path';
import config from '../config/index.mjs';

const MIN_DURATION = 20;
const MAX_DURATION = 59;
const TARGET_WORDS_MIN = 80;
const TARGET_WORDS_MAX = 125;

function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(text) {
  return cleanText(text)
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

function estimateDuration(text) {
  const words = countWords(text);

  return Math.round(
    (words / 145) * 60
  );
}

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true
    });
  }
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

  const duration =
    estimateDuration(narration);

  console.log(
    `[VoiceEngine] Estimated voice duration: ${duration}s`
  );

  if (duration < MIN_DURATION) {
    console.warn(
      `[VoiceEngine] Estimated duration is below ${MIN_DURATION}s.`
    );
  }

  if (duration > MAX_DURATION) {
    console.warn(
      `[VoiceEngine] Estimated duration is above ${MAX_DURATION}s.`
    );
  }

  return narration;
}

export async function generateVoiceover(
  narration,
  options = {}
) {
  const text =
    validateNarration(narration);

  const outputDir =
    path.resolve(
      options.outputDir ||
      config.outputDir ||
      'output_artifacts'
    );

  ensureDirectory(outputDir);

  const fileName =
    cleanText(options.fileName) ||
    `voice-${Date.now()}.mp3`;

  const outputPath =
    path.join(
      outputDir,
      fileName.endsWith('.mp3')
        ? fileName
        : `${fileName}.mp3`
    );

  const language =
    cleanText(options.language) ||
    'en';

  console.log(
    `[VoiceEngine] Generating voiceover: ${outputPath}`
  );

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
                  `[VoiceEngine] Voice generation failed: ${error.message}`
                )
              );
              return;
            }

            if (!fs.existsSync(outputPath)) {
              reject(
                new Error(
                  '[VoiceEngine] Voice file was not created.'
                )
              );
              return;
            }

            const stats =
              fs.statSync(outputPath);

            if (stats.size === 0) {
              reject(
                new Error(
                  '[VoiceEngine] Generated voice file is empty.'
                )
              );
              return;
            }

            console.log(
              `[VoiceEngine] Voiceover created successfully: ${outputPath}`
            );

            resolve({
              path: outputPath,
              filePath: outputPath,
              durationEstimate:
                estimateDuration(text),
              wordCount:
                countWords(text),
              language
            });
          }
        );
      } catch (error) {
        reject(
          new Error(
            `[VoiceEngine] ${error.message}`
          )
        );
      }
    }
  );
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
