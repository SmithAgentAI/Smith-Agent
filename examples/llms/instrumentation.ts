//////////////////////////////////////////////////////////////////////////////////////////////////
/////// RUN THIS EXAMPLE VIA `yarn start:telemetry ./examples/llms/instrumentation.ts` ///////////
//////////////////////////////////////////////////////////////////////////////////////////////////
import { BaseMessage, Role } from "Smith-agent-framework/llms/primitives/message";
import { OllamaChatLLM } from "Smith-agent-framework/adapters/ollama/chat";
import { Logger } from "Smith-agent-framework/logger/logger";

Logger.root.level = "silent"; // disable internal logs
const logger = new Logger({ name: "app", level: "trace" });

const llm = new OllamaChatLLM({
  modelId: "llama3.1", // llama3.1:70b for better performance
});

const response = await llm.generate([
  BaseMessage.of({
    role: Role.USER,
    text: "hello",
  }),
]);

logger.info(`LLM 🤖 (txt) : ${response.getTextContent()}`);

// Wait briefly to ensure all telemetry data has Smithn processed
setTimeout(() => {
  logger.info("Process exiting after OpenTelemetry flush.");
}, 5_000); // Adjust the delay as needed
