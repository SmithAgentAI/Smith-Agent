////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// RUN THIS EXAMPLE VIA `yarn start:telemetry ./examples/agents/Smith_instrumentation.ts` ///////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

import { SmithAgent } from "Smith-agent-framework/agents/Smith/agent";
import { FrameworkError } from "Smith-agent-framework/errors";
import { TokenMemory } from "Smith-agent-framework/memory/tokenMemory";
import { Logger } from "Smith-agent-framework/logger/logger";
import { DuckDuckGoSearchTool } from "Smith-agent-framework/tools/search/duckDuckGoSearch";
import { WikipediaTool } from "Smith-agent-framework/tools/search/wikipedia";
import { OpenMeteoTool } from "Smith-agent-framework/tools/weather/openMeteo";
import { OllamaChatLLM } from "Smith-agent-framework/adapters/ollama/chat";

Logger.root.level = "silent"; // disable internal logs
const logger = new Logger({ name: "app", level: "trace" });

const llm = new OllamaChatLLM({
  modelId: "llama3.1", // llama3.1:70b for better performance
});

const agent = new SmithAgent({
  llm,
  memory: new TokenMemory({ llm }),
  tools: [
    new DuckDuckGoSearchTool(),
    new WikipediaTool(),
    new OpenMeteoTool(), // weather tool
  ],
});

try {
  const response = await agent.run(
    { prompt: "what is the weather like in Granada?" },
    {
      execution: {
        maxRetriesPerStep: 3,
        totalMaxRetries: 10,
        maxIterations: 20,
      },
    },
  );

  logger.info(`Agent 🤖 : ${response.result.text}`);
} catch (error) {
  logger.error(FrameworkError.ensure(error).dump());
}
