import "dotenv/config.js";
import { SmithAgent } from "Smith-agent-framework/agents/Smith/agent";
import { OpenAIChatLLM } from "Smith-agent-framework/adapters/openai/chat";
import { ElasticSearchTool } from "Smith-agent-framework/tools/database/elasticsearch";
import { FrameworkError } from "Smith-agent-framework/errors";
import { UnconstrainedMemory } from "Smith-agent-framework/memory/unconstrainedMemory";
import { createConsoleReader } from "../helpers/io.js";

const llm = new OpenAIChatLLM();

const elasticSearchTool = new ElasticSearchTool({
  connection: {
    node: process.env.ELASTICSEARCH_NODE,
    auth: {
      apiKey: process.env.ELASTICSEARCH_API_KEY || "",
    },
  },
});

const agent = new SmithAgent({
  llm,
  memory: new UnconstrainedMemory(),
  tools: [elasticSearchTool],
});

const reader = createConsoleReader();
const prompt = await reader.prompt();

try {
  const response = await agent
    .run(
      { prompt },
      {
        execution: {
          maxRetriesPerStep: 5,
          totalMaxRetries: 10,
          maxIterations: 15,
        },
      },
    )
    .observe((emitter) => {
      emitter.on("error", ({ error }) => {
        console.log(`Agent 🤖 : `, FrameworkError.ensure(error).dump());
      });
      emitter.on("retry", () => {
        console.log(`Agent 🤖 : `, "retrying the action...");
      });
      emitter.on("update", async ({ data, update, meta }) => {
        console.log(`Agent (${update.key}) 🤖 : `, update.value);
      });
    });

  console.log(`Agent 🤖 : `, response.result.text);
} catch (error) {
  console.error(FrameworkError.ensure(error).dump());
}
