import "dotenv/config.js";
import { SmithAgent } from "Smith-agent-framework/agents/Smith/agent";
import { createConsoleReader } from "../helpers/io.js";
import { FrameworkError } from "Smith-agent-framework/errors";
import { TokenMemory } from "Smith-agent-framework/memory/tokenMemory";
import { Logger } from "Smith-agent-framework/logger/logger";
import { PythonTool } from "Smith-agent-framework/tools/python/python";
import { LocalPythonStorage } from "Smith-agent-framework/tools/python/storage";
import { DuckDuckGoSearchTool } from "Smith-agent-framework/tools/search/duckDuckGoSearch";
import { WikipediaTool } from "Smith-agent-framework/tools/search/wikipedia";
import { OpenMeteoTool } from "Smith-agent-framework/tools/weather/openMeteo";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { OllamaChatLLM } from "Smith-agent-framework/adapters/ollama/chat";

Logger.root.level = "silent"; // disable internal logs
const logger = new Logger({ name: "app", level: "trace" });

const llm = new OllamaChatLLM({
  modelId: "llama3.1", // llama3.1:70b for better performance
});

const codeInterpreterUrl = process.env.CODE_INTERPRETER_URL;
const __dirname = dirname(fileURLToPath(import.meta.url));

const codeInterpreterTmpdir =
  process.env.CODE_INTEPRETER_TMPDIR ?? "./examples/tmp/code_interpreter";
const localTmpdir = process.env.LOCAL_TMPDIR ?? "./examples/tmp/local";

const agent = new SmithAgent({
  llm,
  memory: new TokenMemory({ llm }),
  tools: [
    new DuckDuckGoSearchTool(),
    // new WebCrawlerTool(), // HTML web page crawler
    new WikipediaTool(),
    new OpenMeteoTool(), // weather tool
    // new ArXivTool(), // research papers
    // new DynamicTool() // custom python tool
    ...(codeInterpreterUrl
      ? [
          new PythonTool({
            codeInterpreter: { url: codeInterpreterUrl },
            storage: new LocalPythonStorage({
              interpreterWorkingDir: `${__dirname}/../../${codeInterpreterTmpdir}`,
              localWorkingDir: `${__dirname}/../../${localTmpdir}`,
            }),
          }),
        ]
      : []),
  ],
});

const reader = createConsoleReader();
if (codeInterpreterUrl) {
  reader.write(
    "🛠️ System",
    `The code interpreter tool is enabled. Please ensure that it is running on ${codeInterpreterUrl}`,
  );
}

try {
  for await (const { prompt } of reader) {
    const response = await agent
      .run(
        { prompt },
        {
          execution: {
            maxRetriesPerStep: 3,
            totalMaxRetries: 10,
            maxIterations: 20,
          },
        },
      )
      .observe((emitter) => {
        // emitter.on("start", () => {
        //   reader.write(`Agent 🤖 : `, "starting new iteration");
        // });
        emitter.on("error", ({ error }) => {
          reader.write(`Agent 🤖 : `, FrameworkError.ensure(error).dump());
        });
        emitter.on("retry", () => {
          reader.write(`Agent 🤖 : `, "retrying the action...");
        });
        emitter.on("update", async ({ data, update, meta }) => {
          // log 'data' to see the whole state
          // to log only valid runs (no errors), check if meta.success === true
          reader.write(`Agent (${update.key}) 🤖 : `, update.value);
        });
        emitter.on("partialUpdate", ({ data, update, meta }) => {
          // ideal for streaming (line by line)
          // log 'data' to see the whole state
          // to log only valid runs (no errors), check if meta.success === true
          // reader.write(`Agent (partial ${update.key}) 🤖 : `, update.value);
        });

        // To observe all events (uncomment following block)
        // emitter.match("*.*", async (data: unknown, event) => {
        //   logger.trace(event, `Received event "${event.path}"`);
        // });

        // To get raw LLM input (uncomment following block)
        // emitter.match(
        //   (event) => event.creator === llm && event.name === "start",
        //   async (data: InferCallbackValue<GenerateEvents["start"]>, event) => {
        //     logger.trace(
        //       event,
        //       [
        //         `Received LLM event "${event.path}"`,
        //         JSON.stringify(data.input), // array of messages
        //       ].join("\n"),
        //     );
        //   },
        // );
      });

    reader.write(`Agent 🤖 : `, response.result.text);
  }
} catch (error) {
  logger.error(FrameworkError.ensure(error).dump());
} finally {
  reader.close();
}
