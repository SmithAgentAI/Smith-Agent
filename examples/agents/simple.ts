import "dotenv/config.js";
import { SmithAgent } from "Smith-agent-framework/agents/Smith/agent";
import { TokenMemory } from "Smith-agent-framework/memory/tokenMemory";
import { DuckDuckGoSearchTool } from "Smith-agent-framework/tools/search/duckDuckGoSearch";
import { OllamaChatLLM } from "Smith-agent-framework/adapters/ollama/chat";
import { OpenMeteoTool } from "Smith-agent-framework/tools/weather/openMeteo";

const llm = new OllamaChatLLM();
const agent = new SmithAgent({
  llm,
  memory: new TokenMemory({ llm }),
  tools: [new DuckDuckGoSearchTool(), new OpenMeteoTool()],
});

const response = await agent
  .run({ prompt: "What's the current weather in Las Vegas?" })
  .observe((emitter) => {
    emitter.on("update", async ({ data, update, meta }) => {
      console.log(`Agent (${update.key}) 🤖 : `, update.value);
    });
  });

console.log(`Agent 🤖 : `, response.result.text);
