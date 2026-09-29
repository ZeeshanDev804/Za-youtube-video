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
  const cleaned = clean(text);

  if (!cleaned) {
    return [];
  }

  return cleaned
    .split(/\s+/)
    .filter(Boolean);
}

function estimateDuration(text) {
  const words = getWords(text).length;

  if (!words) {
    return 0;
  }

  const duration = Math.round(
    (words / 145) * 60
  );

  return Math.max(
    30,
    Math.min(59, duration)
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
    /funny|comedy|joke/.test(text)
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
  genre
}) {
  if (genre === "baby-story") {
    return createCharacterBible({
      name: "Leo",
      age: "1 year old",
      gender: "male",
      face:
        "cute round baby face, soft cheeks, bright expressive eyes",
      hair:
        "short soft dark brown hair",
      clothing:
        "beige dotted toddler onesie",
      body:
        "small natural toddler proportions",
      personality:
        "curious, innocent, playful and expressive",
      environment:
        "modern warm minimalist family home",
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
      face:
        "friendly expressive face with warm intelligent eyes",
      hair:
        "short golden-brown fur",
      clothing:
        "natural fur, simple red collar",
      body:
        "healthy medium-sized dog",
      personality:
        "loyal, brave, emotional and curious",
      environment:
        "cinematic natural outdoor environment",
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
    face:
      "natural expressive face, confident eyes",
    hair:
      "short neat dark hair",
    clothing:
      "simple modern casual clothing",
    body:
      "natural realistic human proportions",
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
    clean(topic) || "never give up";

  const missions = {
    comedy:
      `Create a funny and memorable story around ${subject} with a clear comedic payoff.`,

    "baby-story":
      `Create a wholesome and visually clear story around ${subject} with a cute emotional payoff.`,

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
  const supplied = clean(userScript);

  if (supplied) {
    return supplied;
  }

  const subject =
    clean(topic) ||
    "never give up";

  const scripts = {
    motivation:
      `Everyone sees the result, but almost nobody sees the struggle behind it. When ${subject} becomes difficult, most people stop because progress feels too slow. But success is rarely built in one perfect moment. It is built through one more step, one more attempt, and one more decision to keep moving. There will be days when nothing seems to change. Keep going anyway. The moment you refuse to quit can become the moment your story begins to change. Your next step may be small, but it can still move you forward.`,

    "baby-story":
      `Sometimes the smallest moments become the biggest memories. A curious little baby discovers something unexpected at home and decides to investigate. First comes curiosity, then a tiny adventure, and finally a peaceful little reward. Along the way, every small movement creates a new surprise. The journey may look simple to an adult, but to a baby, every corner feels like a new world. And sometimes happiness is nothing more than discovering something new, feeling safe, and sharing one beautiful little smile.`,

    animal:
      `Sometimes courage appears in the most unexpected place. When someone needs help, a loyal friend does not stop to think about how difficult the journey will be. One small decision can change everything. The path becomes harder, but the friend keeps moving forward because someone is depending on him. In the end, the real hero is not always the strongest one. It is the one who chooses to care, takes action when it matters, and refuses to leave someone behind.`,

    comedy:
      `It started like a completely normal day. Then one tiny mistake changed everything. What looked like a simple plan quickly became a ridiculous chain of events. Everyone tried to fix the problem, but every solution somehow made the situation even funnier. The more they tried to control the situation, the more unexpected things happened. Just when everything seemed completely lost, they finally discovered that the simplest answer had been right in front of them the entire time. Sometimes the best plan is simply to stop making it worse.`,

    business:
      `Most people think success begins with a big opportunity. In reality, it often begins with one small decision. When ${subject} creates a difficult choice, the smart move is not always the fastest one. First, understand the numbers. Then identify the real risk and decide what still makes sense tomorrow. A good opportunity can disappear, but a bad decision can stay with you for a long time. Small smart decisions, repeated consistently, can become bigger results over time. The goal is not to move fast blindly. The goal is to move forward intelligently.`,

    fantasy:
      `The journey began with one impossible discovery. A mysterious path appeared where nobody expected it, leading toward something that could change everything. The journey was dangerous, but turning back was no longer an option. Each step revealed another clue, and every clue brought a new challenge. Fear made the journey harder, but curiosity kept the hero moving forward. At the final destination, the discovery revealed why the path had appeared in the first place. The journey was not only about finding the answer. It was about becoming brave enough to face it.`,

    emotional:
      `Some moments are difficult because they matter. When everything feels uncertain, one small act of kindness can become a reason to keep going. A person may forget the exact words we say, but they often remember how we made them feel. Sometimes the smallest gesture arrives at exactly the right moment and gives someone enough hope to continue. Life does not always change through huge events. Sometimes it changes through a quiet decision to care, to listen, or simply to stay when someone needs you most.`
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
  const sceneTypes = [
    "HOOK",
    "SETUP",
    "PROBLEM",
    "ESCALATION",
    "TURNING_POINT",
    "ENDING"
  ];

  const narrationWords =
    getWords(narration);

  const totalWords =
    narrationWords.length;

  const sceneCount =
    sceneTypes.length;

  const wordsPerScene =
    Math.max(
      1,
      Math.ceil(
        totalWords / sceneCount
      )
    );

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

    const sceneType =
      sceneTypes[index];

    scenes.push({
      id:
        `scene-${index + 1}`,

      sceneNumber:
        index + 1,

      type:
        sceneType,

      duration,

      narration:
        sceneNarration,

      purpose:
        getScenePurpose(
          sceneType,
          genre
        ),

      visualPrompt:
        buildSceneVisualPrompt({
          genre,
          title,
          sceneType
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

  const narrationWords =
    getWords(narration);

  const wordCount =
    narrationWords.length;

  const durationEstimate =
    estimateDuration(narration);

  const characterBible =
    createDefaultCharacter({
      genre
    });

  const scenes =
    buildScenes({
      narration,
      genre,
      title
    });

  const hook =
    clean(
      scenes?.[0]?.narration
    ) ||
    narration.slice(0, 120);

  const setup =
    clean(
      scenes?.[1]?.narration
    ) ||
    narration;

  const conflict =
    clean(
      scenes?.[2]?.narration
    ) ||
    narration;

  const turningPoint =
    clean(
      scenes?.[4]?.narration
    ) ||
    narration;

  const resolution =
    clean(
      scenes?.[5]?.narration
    ) ||
    narration;

  const ending =
    clean(
      scenes?.[5]?.narration
    ) ||
    narration;

  const lesson =
    genre === "business"
      ? "Make smart decisions by understanding risk, numbers and long-term consequences."
      : genre === "comedy"
        ? "Sometimes the best solution is to stop making the problem worse."
        : genre === "baby-story"
          ? "Small discoveries can create the happiest memories."
          : genre === "animal"
            ? "Real courage means caring and acting when someone needs you."
            : genre === "fantasy"
              ? "Courage grows when we choose to face the unknown."
              : genre === "emotional"
                ? "Small acts of kindness can give someone the strength to continue."
                : "Keep taking the next step, even when progress is difficult to see.";

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

    estimatedDuration:
      durationEstimate,

    durationEstimate,

    wordCount,

    mission,

    hook,

    setup,

    conflict,

    turningPoint,

    resolution,

    lesson,

    ending,

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
      "Designed for vertical YouTube Shorts.",
      "Target duration is approximately 30 to 45 seconds."
    ]
  };
}

export default {
  generateStory
};