import { FileCache } from "Smith-agent-framework/cache/fileCache";
import * as os from "node:os";

const cache = new FileCache({
  fullPath: `${os.tmpdir()}/Smith_file_cache_${Date.now()}.json`,
});
console.log(`Saving cache to "${cache.source}"`);
await cache.set("abc", { firstName: "John", lastName: "Doe" });
