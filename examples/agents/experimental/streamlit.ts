import "dotenv/config.js";
import { FrameworkError } from "Smith-agent-framework/errors";
import { TokenMemory } from "Smith-agent-framework/memory/tokenMemory";
import { createConsoleReader } from "examples/helpers/io.js";
import { BAMChatLLM } from "Smith-agent-framework/adapters/bam/chat";
import { StreamlitAgent } from "Smith-agent-framework/agents/experimental/streamlit/agent";

const llm = BAMChatLLM.fromPreset("meta-llama/llama-3-1-70b-instruct");

const agent = new StreamlitAgent({
  llm,
  memory: new TokenMemory({ llm }),
});

const reader = createConsoleReader();

try {
  for await (const { prompt } of reader) {
    const response = await agent.run({ prompt }).observe((emitter) => {
      emitter.on("newToken", (data) => {
        reader.write(`Agent (token received) 🤖 : `, data.delta);
      });
    });

    for (const block of response.result.blocks) {
      reader.write(`Agent (${block.name}) 🤖 : `, block.content);
    }
  }
} catch (error) {
  reader.write("Agent (error)  🤖", error(FrameworkError.ensure(error).dump()));
}
