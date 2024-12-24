import "dotenv/config.js";
import { OllamaLLM } from "Smith-agent-framework/adapters/ollama/llm";
import { cosineSimilarity } from "Smith-agent-framework/internals/helpers/math";
import { EmbeddingOutput } from "Smith-agent-framework/llms/base";

const llm = new OllamaLLM({
  modelId: "nomic-embed-text",
});

const embed: EmbeddingOutput = await llm.embed(["King", "Queen"]);
console.log(cosineSimilarity(embed.embeddings[0], embed.embeddings[1]));

const sentences = ["Hard cold rock", "Warm Soft pillow"];

const embed1: EmbeddingOutput = await llm.embed(sentences);
console.log(cosineSimilarity(embed1.embeddings[0], embed1.embeddings[1]));
