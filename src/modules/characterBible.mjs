function clean(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
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

export function createCharacterBible({
  name = 'Main Character',
  age = '',
  gender = '',
  face = '',
  hair = '',
  clothing = '',
  body = '',
  personality = '',
  environment = '',
  importantObjects = [],
  visualStyle = ''
} = {}) {
  return {
    name:
      clean(name) ||
      'Main Character',

    age:
      clean(age),

    gender:
      clean(gender),

    face:
      clean(face),

    hair:
      clean(hair),

    clothing:
      clean(clothing),

    body:
      clean(body),

    personality:
      clean(personality),

    environment:
      clean(environment),

    importantObjects:
      cleanArray(
        importantObjects
      ),

    visualStyle:
      clean(visualStyle),

    continuityRules: [
      'Keep the same facial identity.',
      'Keep the same hairstyle.',
      'Keep the same clothing unless the story explicitly changes it.',
      'Keep age and body proportions consistent.',
      'Keep important objects consistent.',
      'Keep the environment visually consistent when scenes are connected.',
      'Do not randomly change character appearance.',
      'Do not add extra characters unless the scene requires them.'
    ]
  };
}

export function buildCharacterPrompt(
  bible
) {
  if (!bible) {
    throw new Error(
      '[CharacterBible] Character bible is required.'
    );
  }

  const identity = [
    bible.name,
    bible.age &&
      `age: ${bible.age}`,
    bible.gender &&
      `gender: ${bible.gender}`,
    bible.face &&
      `face: ${bible.face}`,
    bible.hair &&
      `hair: ${bible.hair}`,
    bible.clothing &&
      `clothing: ${bible.clothing}`,
    bible.body &&
      `body: ${bible.body}`,
    bible.personality &&
      `personality: ${bible.personality}`,
    bible.environment &&
      `environment: ${bible.environment}`,
    bible.visualStyle &&
      `visual style: ${bible.visualStyle}`
  ]
    .filter(Boolean)
    .join(', ');

  const objects =
    bible.importantObjects
      ?.length
      ? `Important objects: ${bible.importantObjects.join(', ')}.`
      : '';

  const continuity =
    Array.isArray(
      bible.continuityRules
    )
      ? bible.continuityRules.join(' ')
      : '';

  return [
    identity,
    objects,
    continuity
  ]
    .filter(Boolean)
    .join(' ');
}

export function applyCharacterContinuity(
  scenePrompt,
  bible
) {
  const base =
    clean(scenePrompt);

  const character =
    buildCharacterPrompt(
      bible
    );

  if (!base) {
    return character;
  }

  return [
    base,
    'CHARACTER CONTINUITY:',
    character
  ].join('\n');
}

export function validateCharacterBible(
  bible
) {
  const missing = [];

  if (!bible?.name) {
    missing.push('name');
  }

  if (!bible?.face) {
    missing.push('face');
  }

  if (!bible?.clothing) {
    missing.push('clothing');
  }

  if (!bible?.environment) {
    missing.push('environment');
  }

  return {
    valid:
      missing.length === 0,

    missing,

    warning:
      missing.length > 0
        ? 'Character bible is incomplete; visual consistency may be reduced.'
        : null
  };
}

export default {
  createCharacterBible,
  buildCharacterPrompt,
  applyCharacterContinuity,
  validateCharacterBible
};
