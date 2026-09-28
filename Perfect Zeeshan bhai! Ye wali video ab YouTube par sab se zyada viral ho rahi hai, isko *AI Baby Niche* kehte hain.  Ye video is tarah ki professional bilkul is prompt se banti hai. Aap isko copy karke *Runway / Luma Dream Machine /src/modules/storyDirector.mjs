import { GoogleGenAI } from '@google/genai';
import config from '../config/index.mjs';

const MIN_DURATION = 30;
const MAX_DURATION = 59;
const TARGET_DURATION = 40;

function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractJson(text) {
  if (!text) return null;

  const cleaned = String(text)
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');

    if (start === -1 || end === -1 || end <= start) {
      return null;
    }

    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function fallbackStory(topic) {
  const cleanTopic = cleanText(topic);

  return {
    title: `The Moment ${cleanTopic} Changed Everything`,
    genre: 'motivational story',
    theme: cleanTopic,
    mission: `The main character must overcome a difficult moment related to ${cleanTopic}.`,
    hook: `Everyone told him to stop, but he had one reason to keep going.`,
    setup: `He had failed before, and this time the consequences felt even bigger.`,
    conflict: `When his final attempt started going wrong, he had to decide whether to quit or change his approach.`,
    turningPoint: `Instead of giving up, he made one small decision and tried again differently.`,
    resolution: `That small decision created progress, proving that failure was not the end of the journey.`,
    lesson: `Real progress often begins when you keep moving after your first attempt fails.`,
    ending: `Sometimes the next step is the one that changes everything.`,
    narration: [
      `Everyone told him to stop, but he had one reason to keep going.`,
      `He had failed before, and this time the consequences felt even bigger.`,
      `When his final attempt started going wrong, he had to decide whether to quit or change his approach.`,
      `Instead of giving up, he made one small decision and tried again differently.`,
      `That small decision created progress, proving that failure was not the end of the journey.`,
      `Real progress often begins when you keep moving after your first attempt fails.`,
      `Sometimes the next step is the one that changes everything.`
    ].join(' '),
    estimatedDuration: TARGET_DURATION
  };
}

function normalizeStory(data, topic) {
  const fallback = fallbackStory(topic);

  const story = {
    title: cleanText(data?.title) || fallback.title,
    genre: cleanText(data?.genre) || fallback.genre,
    theme: cleanText(data?.theme) || fallback.theme,
    mission: cleanText(data?.mission) || fallback.mission,
    hook: cleanText(data?.hook) || fallback.hook,
    setup: cleanText(data?.setup) || fallback.setup,
    conflict: cleanText(data?.conflict) || fallback.conflict,
    turningPoint:
      cleanText(data?.turningPoint) || fallback.turningPoint,
    resolution:
      cleanText(data?.resolution) || fallback.resolution,
    lesson: cleanText(data?.lesson) || fallback.lesson,
    ending: cleanText(data?.ending) || fallback.ending,
    narration: cleanText(data?.narration) || fallback.narration
  };

  const words = story.narration
    .split(/\s+/)
    .filter(Boolean).length;

  const estimatedDuration = Math.min(
    MAX_DURATION,
    Math.max(
      MIN_DURATION,
      Math.round((words / 145) * 60)
    )
  );

  return {
    ...story,
    estimatedDuration
  };
}

function buildPrompt(topic, variation = 1, style = 'cinematic') {
  return `
You are the STORY DIRECTOR for a professional YouTube Shorts production system.

Create ONE completely ORIGINAL short story.

TOPIC:
${topic}

STORY VARIATION:
${variation}

VISUAL STYLE:
${style}

TARGET:
Approximately ${TARGET_DURATION} seconds.
Never intentionally create a story shorter than ${MIN_DURATION} seconds.

THIS IS NOT A RANDOM SCENE GENERATOR.

The viewer must understand:
1. WHO the main character is.
2. WHAT the character wants.
3. WHY the goal matters.
4. WHAT problem blocks the goal.
5. WHAT the character tries.
6. WHAT goes wrong.
7. WHAT changes at the turning point.
8. WHAT result happens.
9. WHAT the viewer should remember.

STORY STRUCTURE:

HOOK
- Immediately create curiosity.
- Do not start with generic exposition.

MISSION
- Give the main character a specific goal.

SETUP
- Establish character and situation quickly.

CONFLICT
- Introduce a real obstacle.

ATTEMPT
- Character actively tries to solve the problem.

SETBACK
- The first attempt does not simply succeed.

TURNING POINT
- Character makes a meaningful decision/change.

RESOLUTION
- Show the result of that decision.

LESSON
- Give ONE clear takeaway.

ENDING
- Short, emotional and memorable.
- Do not repeat the lesson mechanically.

IMPORTANT QUALITY RULES:

- Original story only.
- No copied movie scenes.
- No copied TikTok/Reels stories.
- No copyrighted characters.
- No fake statistics.
- No fake news.
- No meaningless AI filler.
- No random disconnected events.
- No sudden unexplained character changes.
- No ending that appears before the story is complete.
- The story must have a clear beginning, middle and ending.
- Keep one main character unless another character is necessary.
- Keep the central goal consistent.
- Every event must contribute to the main story.
- The viewer should have a reason to continue watching.
- Use natural simple English.
- Make the story emotionally engaging.
- Make it suitable for a vertical YouTube Short.

Return ONLY valid JSON.

Required structure:

{
  "title": "",
  "genre": "",
  "theme": "",
  "mission": "",
  "hook": "",
  "setup": "",
  "conflict": "",
  "turningPoint": "",
  "resolution": "",
  "lesson": "",
  "ending": "",
  "narration": ""
}
`;
}

export async function generateStory(
  topic,
  options = {}
) {
  const cleanTopic = cleanText(topic);

  if (!cleanTopic) {
    throw new Error('[StoryDirector] Topic is required.');
  }

  const variation =
    Number(options.variation) || 1;

  const style =
    cleanText(options.style) || 'cinematic';

  if (!config.geminiApiKey) {
    console.warn(
      '[StoryDirector] Gemini key missing. Using fallback story.'
    );

    return normalizeStory(
      fallbackStory(cleanTopic),
      cleanTopic
    );
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: config.geminiApiKey
    });

    const prompt = buildPrompt(
      cleanTopic,
      variation,
      style
    );

    const response =
      await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

    const text =
      response?.text ||
      response?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || '')
        .join('');

    const parsed = extractJson(text);

    if (!parsed) {
      throw new Error(
        'Gemini returned invalid story JSON.'
      );
    }

    const story = normalizeStory(
      parsed,
      cleanTopic
    );

    console.log(
      `[StoryDirector] Story created: ${story.title}`
    );

    console.log(
      `[StoryDirector] Estimated duration: ${story.estimatedDuration}s`
    );

    return story;
  } catch (error) {
    console.error(
      '[StoryDirector] Generation failed:',
      error.message
    );

    return normalizeStory(
      fallbackStory(cleanTopic),
      cleanTopic
    );
  }
}

export async function generateMultipleStories(
  topic,
  count = 1,
  options = {}
) {
  const safeCount = Math.min(
    Math.max(Number(count) || 1, 1),
    10
  );

  const stories = [];

  for (let i = 1; i <= safeCount; i++) {
    console.log(
      `[StoryDirector] Creating story ${i}/${safeCount}...`
    );

    const story = await generateStory(
      topic,
      {
        ...options,
        variation: i
      }
    );

    stories.push({
      videoNumber: i,
      ...story
    });
  }

  return stories;
}

export default {
  generateStory,
  generateMultipleStories
}; KO
