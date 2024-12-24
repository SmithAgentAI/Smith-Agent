import "dotenv/config.js";
import { createConsoleReader } from "examples/helpers/io.js";
import { BaseMessage, Role } from "Smith-agent-framework/llms/primitives/message";
import { OllamaChatLLM } from "Smith-agent-framework/adapters/ollama/chat";

const llm = new OllamaChatLLM();

const reader = createConsoleReader();

for await (const { prompt } of reader) {
  for await (const chunk of llm.stream([
    BaseMessage.of({
      role: Role.USER,
      text: prompt,
    }),
  ])) {
    reader.write(`LLM 🤖 (txt) : `, chunk.getTextContent());
    reader.write(`LLM 🤖 (raw) : `, JSON.stringify(chunk.finalResult));
  }
}
