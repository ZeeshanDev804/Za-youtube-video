import fs from 'fs';
import path from 'path';

function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeASS(text) {
  return cleanText(text)
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}');
}

function formatTime(seconds) {
  const total =
    Math.max(
      0,
      Number(seconds) || 0
    );

  const hours =
    Math.floor(total / 3600);

  const minutes =
    Math.floor(
      (total % 3600) / 60
    );

  const secs =
    Math.floor(total % 60);

  const centiseconds =
    Math.floor(
      (total % 1) * 100
    );

  return [
    String(hours),
    String(minutes).padStart(2, '0'),
    String(secs).padStart(2, '0')
  ].join(':') +
    `.${String(
      centiseconds
    ).padStart(2, '0')}`;
}

function splitCaptionText(
  text,
  maxWords = 7
) {
  const words =
    cleanText(text)
      .split(/\s+/)
      .filter(Boolean);

  const chunks = [];

  for (
    let i = 0;
    i < words.length;
    i += maxWords
  ) {
    chunks.push(
      words
        .slice(
          i,
          i + maxWords
        )
        .join(' ')
    );
  }

  return chunks;
}

export function buildCaptionCues(
  scenes
) {
  if (!Array.isArray(scenes)) {
    throw new Error(
      '[CaptionRenderer] Scenes must be an array.'
    );
  }

  const cues = [];
  let timeline = 0;

  for (const scene of scenes) {
    const duration =
      Number(scene.duration) || 5;

    const parts =
      splitCaptionText(
        scene.narration
      );

    if (parts.length === 0) {
      timeline += duration;
      continue;
    }

    const partDuration =
      duration / parts.length;

    parts.forEach(
      (text, index) => {
        const start =
          timeline +
          index * partDuration;

        const end =
          Math.min(
            timeline + duration,
            start + partDuration
          );

        cues.push({
          index:
            cues.length + 1,
          text,
          start,
          end,
          sceneNumber:
            scene.sceneNumber
        });
      }
    );

    timeline += duration;
  }

  return cues;
}

export function createASS(
  cues,
  outputPath
) {
  if (!Array.isArray(cues)) {
    throw new Error(
      '[CaptionRenderer] Caption cues are required.'
    );
  }

  const directory =
    path.dirname(outputPath);

  fs.mkdirSync(
    directory,
    { recursive: true }
  );

  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,58,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,4,2,2,80,80,220,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events =
    cues.map(
      cue =>
        `Dialogue: 0,${formatTime(
          cue.start
        )},${formatTime(
          cue.end
        )},Default,,0,0,0,,${escapeASS(
          cue.text
        )}`
    )
    .join('\n');

  fs.writeFileSync(
    outputPath,
    header +
      events +
      '\n',
    'utf8'
  );

  return outputPath;
}

export function renderCaptions(
  scenes,
  outputPath
) {
  const cues =
    buildCaptionCues(
      scenes
    );

  const assPath =
    createASS(
      cues,
      outputPath
    );

  return {
    assPath,
    cueCount:
      cues.length,
    cues
  };
}

export default {
  buildCaptionCues,
  createASS,
  renderCaptions
};
