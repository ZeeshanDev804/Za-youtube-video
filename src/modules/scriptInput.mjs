function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseScriptInput({
  topic = '',
  script = '',
  count = 1
} = {}) {
  const cleanTopic =
    cleanText(topic);

  const cleanScript =
    cleanText(script);

  const videoCount =
    Math.max(
      1,
      Math.min(
        20,
        Number(count) || 1
      )
    );

  if (!cleanTopic && !cleanScript) {
    throw new Error(
      '[ScriptInput] Topic or script is required.'
    );
  }

  return {
    mode:
      cleanScript
        ? 'SCRIPT'
        : 'TOPIC',

    topic:
      cleanTopic,

    script:
      cleanScript,

    count:
      videoCount,

    sourceText:
      cleanScript || cleanTopic
  };
}

export function createVideoRequests(input) {
  const parsed =
    parseScriptInput(input);

  const requests = [];

  for (
    let index = 0;
    index < parsed.count;
    index++
  ) {
    requests.push({
      videoNumber:
        index + 1,

      mode:
        parsed.mode,

      topic:
        parsed.topic,

      script:
        parsed.script,

      sourceText:
        parsed.sourceText
    });
  }

  return requests;
}

export default {
  parseScriptInput,
  createVideoRequests
};
