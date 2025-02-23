import { ModelProps } from "./Types";

export const availableModels: ModelProps[] = [
  {
    name: "Gemini 2.0 Flash Lite",
    supportsReasoning: false,
    supportsWebSearch: true,
    supportsImageUpload: true,
    alias: "google/gemini-2.0-flash-lite-preview-02-05:free",
  },
  {
    name: "Deepseek R1",
    supportsReasoning: true,
    supportsWebSearch: true,
    supportsImageUpload: false,
    alias: "deepseek/deepseek-r1:free",
  },
  {
    name: "DeepSeek R1 Distill",
    supportsReasoning: true,
    supportsWebSearch: true,
    supportsImageUpload: false,
    alias: "deepseek/deepseek-r1-distill-llama-70b:free",
  },
  {
    name: "Mistral 24B",
    supportsReasoning: false,
    supportsWebSearch: true,
    supportsImageUpload: false,
    alias: "cognitivecomputations/dolphin3.0-mistral-24b:free",
  },
  {
    name: "Qwen 2.5",
    supportsReasoning: false,
    supportsWebSearch: false,
    supportsImageUpload: true,
    alias: "qwen/qwen2.5-vl-72b-instruct:free",
  },
];
