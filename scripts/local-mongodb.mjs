import { mkdir } from "node:fs/promises";
import path from "node:path";
import { MongoMemoryServer } from "mongodb-memory-server";

const dataDir = path.resolve(".data", "mongodb");
await mkdir(dataDir, { recursive: true });

const server = await MongoMemoryServer.create({
  instance: {
    dbName: "wtf-FundTracker",
    dbPath: dataDir,
    ip: "127.0.0.1",
    port: 27017,
    storageEngine: "wiredTiger",
  },
});

console.log(`Local MongoDB is ready at ${server.getUri("wtf-FundTracker")}`);
console.log(`Data directory: ${dataDir}`);
console.log("Press Ctrl+C to stop MongoDB.");

async function shutdown() {
  await server.stop({ doCleanup: false, force: false });
  process.exit(0);
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

await new Promise(() => {});
