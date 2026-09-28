import {
  createCharacterBible
} from "./characterBible.mjs";

function clean(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => clean(item))
    .filter(Boolean);
}

function getWords(text) {
  return clean(text)
    .split(/\s+/)
    .filter(Boolean);
}

function estimateDuration(text) {
  const words = getWords(text).length;

  if (!words) {
    return 0;
  }

  return Math.round(
    (words / 145) * 60
  );
}

function detectGenre(topic, creativeBrief = {}) {
  const text = [
    topic,
    creativeBrief?.genre,
    creativeBrief?.format,
    creativeBrief?.style
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    /funny|comedy|funny story|joke/.test(text)
  ) {
    return "comedy";
  }

  if (
    /baby|child|kid|toddler/.test(text)
  ) {
    return "baby-story";
  }

  if (
    /animal|dog|cat|puppy|kitten|wildlife/.test(text)
  ) {
    return "animal";
  }

  if (
    /business|money|finance|trading|entrepreneur|success/.test(text)
  ) {
    return "business";
  }

  if (
    /fantasy|magic|dragon|adventure|mystery/.test(text)
  ) {
    return "fantasy";
  }

  if (
    /emotional|sad|love|heart|family/.test(text)
  ) {
    return "emotional";
  }

  return "motivation";
}

function createDefaultCharacter({
  topic,
  genre
}) {
  if (genre === "baby-story") {
    return createCharacterBible({
      name: "Leo",
      age: "1 year old",
      gender: "male",
      face: "cute round baby face, soft cheeks, bright expressive eyes",
      hair: "short soft dark brown hair",
      clothing: "beige dotted toddler onesie",
      body: "small natural toddler proportions",
      personality: "curious, innocent, playful and expressive",
      environment: "modern warm minimalist family home",
      importantObjects: [
        "small toddler toy",
        "soft blanket"
      ],
      visualStyle:
        "photorealistic cinematic family-friendly short film"
    });
  }

  if (genre === "animal") {
    return createCharacterBible({
      name: "Buddy",
      age: "young adult dog",
      gender: "male",
      face: "friendly expressive face with warm intelligent eyes",
      hair: "short golden-brown fur",
      clothing: "natural fur, simple red collar",
      body: "healthy medium-sized dog",
      personality: "loyal, brave, emotional and curious",
      environment: "cinematic natural outdoor environment",
      importantObjects: [
        "red collar"
      ],
      visualStyle:
        "cinematic photorealistic emotional animal story"
    });
  }

  return createCharacterBible({
    name: "Alex",
    age: "young adult",
    gender: "unspecified",
    face: "natural expressive face, confident eyes",
    hair: "short neat dark hair",
    clothing: "simple modern casual clothing",
    body: "natural realistic human proportions",
    personality:
      "determined, thoughtful, resilient and relatable",
    environment:
      "modern cinematic real-world environment",
    importantObjects: [],
    visualStyle:
      "cinematic photorealistic motivational short film"
  });
}

function buildMission(topic, genre) {
  const subject =
    clean(topic) ||
    "never give up";

  const missions = {
    comedy:
      `Create a funny and memorable story around ${subject} with a clear comedic payoff.`,

    "baby-story":
      `Create a wholesome, visually clear story around ${subject} with a cute emotional payoff.`,

    animal:
      `Create an emotional and visually clear story around ${subject} showing loyalty, courage or kindness.`,

    business:
      `Create a practical story around ${subject} showing a clear business, money or decision-making lesson.`,

    fantasy:
      `Create an imaginative story around ${subject} with a clear challenge, journey and satisfying ending.`,

    emotional:
      `Create an emotionally meaningful story around ${subject} with a strong human message.`,

    motivation:
      `Create a powerful motivational story around ${subject} that ends with a clear actionable lesson.`
  };

  return (
    missions[genre] ||
    missions.motivation
  );
}

function buildNarration({
  topic,
  genre,
  userScript
}) {
  const supplied =
    clean(userScript);

  if (supplied) {
    return supplied;
  }

  const subject =
    clean(topic) ||
    "never give up";

  const scripts = {
    motivation:
      `Everyone sees the result, but almost nobody sees the struggle behind it. When ${subject} becomes difficult, most people stop. But progress does not require perfection. It requires one more step, one more attempt, and one more decision to keep moving. The moment you refuse to quit is often the moment your story begins to change. Keep going, even when the result is not visible yet.`,

    "baby-story":
      `Sometimes the smallest moments become the biggest memories. A curious little baby discovers something unexpected at home. First comes curiosity, then a tiny adventure, and finally a peaceful little reward. The journey may look simple, but every step brings a new surprise. And sometimes happiness is nothing more than discovering something new and smiling about it.`,

    animal:
      `Sometimes courage appears in the most unexpected place. When someone needs help, a loyal friend does not stop to think about how difficult the journey will be. One small decision can change everything. In the end, the real hero is not the strongest one. It is the one who chooses to care.`,

    comedy:
      `It started like a completely normal day. Then one tiny mistake changed everything. What looked like a simple plan quickly became a ridiculous chain of events. Everyone tried to fix it, but every solution somehow made the situation even funnier. And just when everything seemed completely lost, the simplest answer was right in front of them.`,

    business:
      `Most people think success begins with a big opportunity. In reality, it often begins with one small decision. When ${subject} creates a difficult choice, the smart move is not always the fastest one. Look at the numbers, understand the risk, and make the decision that still makes sense tomorrow. Small smart decisions can become big results over time.`,

    fantasy:
      `The journey began with one impossible discovery. A mysterious path appeared where nobody expected it, leading toward something that could change everything. The journey was dangerous, but turning back was no longer an option. Each step revealed another clue until the final discovery made the entire journey worth it.`,

    emotional:
      `Some moments are difficult because they matter. When everything feels uncertain, one small act of kindness can become a reason to keep going. People may forget the words we say, but they remember how we made them feel. Sometimes the smallest gesture leaves the biggest mark.`
  };

  return (
    scripts[genre] ||
    scripts.motivation
  );
}

function buildTitle(topic, genre) {
  const subject =
    clean(topic) ||
    "Never Give Up";

  const titles = {
    motivation:
      `${subject} — One More Step`,

    "baby-story":
      `${subject} — A Little Adventure`,

    animal:
      `${subject} — The Unexpected Hero`,

    comedy:
      `${subject} — Everything Went Wrong`,

    business:
      `${subject} — One Smart Decision`,

    fantasy:
      `${subject} — The Hidden Path`,

    emotional:
      `${subject} — A Moment That Changed Everything`
  };

  return (
    titles[genre] ||
    titles.motivation
  );
}

function buildScenes({
  narration,
  genre,
  title
}) {
  const sceneCount = 6;

  const narrationWords =
    getWords(narration);

  const totalWords =
    narrationWords.length;

  const wordsPerScene =
    Math.max(
      1,
      Math.ceil(
        totalWords / sceneCount
      )
    );

  const sceneTypes = [
    "HOOK",
    "SETUP",
    "PROBLEM",
    "ESCALATION",
    "TURNING_POINT",
    "ENDING"
  ];

  const scenes = [];

  for (
    let index = 0;
    index < sceneCount;
    index += 1
  ) {
    const start =
      index * wordsPerScene;

    const sceneWords =
      narrationWords.slice(
        start,
        start + wordsPerScene
      );

    const sceneNarration =
      sceneWords.join(" ") ||
      narration;

    const duration =
      index === sceneCount - 1
        ? 7
        : 6;

    scenes.push({
      id: `scene-${index + 1}`,

      sceneNumber:
        index + 1,

      type:
        sceneTypes[index],

      duration,

      narration:
        sceneNarration,

      purpose:
        getScenePurpose(
          sceneTypes[index],
          genre
        ),

      visualPrompt:
        buildSceneVisualPrompt({
          genre,
          title,
          sceneType:
            sceneTypes[index]
        }),

      transition:
        index === 0
          ? "OPEN"
          : "CONTINUE",

      continuityRequired:
        index > 0
    });
  }

  return scenes;
}

function getScenePurpose(
  type,
  genre
) {
  const purposes = {
    HOOK:
      "Immediately establish the subject and create curiosity.",

    SETUP:
      "Introduce the character, world and situation.",

    PROBLEM:
      "Introduce the main challenge or conflict.",

    ESCALATION:
      "Increase tension, emotion or curiosity.",

    TURNING_POINT:
      "Show the key decision, discovery or change.",

    ENDING:
      "Deliver the payoff and clear message."
  };

  if (
    genre === "comedy" &&
    type === "ENDING"
  ) {
    return "Deliver the comedic payoff.";
  }

  return purposes[type];
}

function buildSceneVisualPrompt({
  genre,
  title,
  sceneType
}) {
  const style =
    genre === "baby-story"
      ? "photorealistic cinematic family-friendly"
      : genre === "fantasy"
        ? "cinematic photorealistic fantasy"
        : "cinematic photorealistic";

  return [
    style,
    "vertical 9:16 composition",
    "professional short-film cinematography",
    "natural realistic lighting",
    "clear subject focus",
    "smooth camera movement",
    "consistent character identity",
    `story title: ${title}`,
    `scene purpose: ${sceneType}`,
    "no random character changes",
    "no deformed anatomy",
    "no extra fingers",
    "no duplicate people",
    "no text artifacts",
    "no watermark"
  ].join(", ");
}

function buildDescription({
  topic,
  genre
}) {
  return clean(
    `Original ${genre} YouTube Short about ${topic}.`
  );
}

function buildHashtags({
  topic,
  genre
}) {
  const words =
    clean(topic)
      .toLowerCase()
      .replace(
        /[^a-z0-9\s]/g,
        ""
      )
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3);

  return [
    "#shorts",
    `#${genre.replace(
      /[^a-z0-9]/g,
      ""
    )}`,
    ...words.map(
      word => `#${word}`
    )
  ];
}

export async function generateStory(
  topic = "",
  options = {}
) {
  const cleanTopic =
    clean(
      topic ||
      options?.topic
    );

  const userScript =
    clean(
      options?.userScript
    );

  if (
    !cleanTopic &&
    !userScript
  ) {
    throw new Error(
      "[StoryDirector] Topic or user script is required."
    );
  }

  const creativeBrief =
    options?.creativeBrief ||
    {};

  const genre =
    detectGenre(
      cleanTopic,
      creativeBrief
    );

  const title =
    buildTitle(
      cleanTopic ||
        "Original Story",
      genre
    );

  const mission =
    buildMission(
      cleanTopic ||
        "the main idea",
      genre
    );

  const narration =
    buildNarration({
      topic:
        cleanTopic ||
        "the main idea",
      genre,
      userScript
    });

  const characterBible =
    createDefaultCharacter({
      topic:
        cleanTopic,
      genre
    });

  const scenes =
    buildScenes({
      narration,
      genre,
      title
    });

  const durationEstimate =
    estimateDuration(
      narration
    );

  return {
    title,

    topic:
      cleanTopic,

    genre,

    format:
      "youtube-shorts",

    language:
      "en",

    audience:
      "US-UK-Europe",

    targetDuration:
      40,

    durationEstimate,

    mission,

    hook:
      scenes?.[0]?.narration ||
      narration.slice(0, 120),

    narration,

    description:
      buildDescription({
        topic:
          cleanTopic,
        genre
      }),

    hashtags:
      buildHashtags({
        topic:
          cleanTopic,
        genre
      }),

    characterBible,

    scenes,

    storyRules: [
      "Original story structure.",
      "Clear beginning, middle and ending.",
      "Every scene must have a visual purpose.",
      "Maintain character continuity.",
      "Maintain environment continuity.",
      "Avoid random visual changes.",
      "Keep the main message clear.",
      "Use natural English narration.",
      "Designed for vertical YouTube Shorts."
    ]
  };
}

export default {
  generateStory
};
