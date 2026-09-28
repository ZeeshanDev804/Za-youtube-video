import dotenv from "dotenv";

dotenv.config();

const config = {
  pexelsApiKey:
    process.env.PEXELS_API_KEY || "",

  geminiApiKey:
    process.env.GEMINI_API_KEY || "",

  outputDir:
    process.env.OUTPUT_DIR ||
    "output_artifacts",

  videoConfig: {
    width: 1080,
    height: 1920,
    minDuration: 20,
    maxDuration: 59,
    fps: 30
  },

  audioConfig: {
    language:
      process.env.VOICE_LANGUAGE || "en",
    provider:
      process.env.TTS_PROVIDER || "gtts"
  },

  aiConfig: {
    provider:
      process.env.AI_PROVIDER || "gemini"
  }
};

export default config;
