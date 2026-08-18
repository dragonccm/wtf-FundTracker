import { spawn } from "node:child_process";
import fs from "node:fs";
import { mkdir } from "node:fs/promises";
import net from "node:net";
import path from "node:path";

// 1. Tự động đọc file .env.local và .env
function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const filePath = path.resolve(file);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

// 2. Kiểm tra xem cổng port có đang lắng nghe không
function checkPortInUse(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host });
    socket.setTimeout(1000);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true); // Đã có tiến trình khác đang chạy
    });
    socket.on("error", () => resolve(false));
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wtf-FundTracker";
  const isLocalMongo = uri.includes("127.0.0.1") || uri.includes("localhost");
  let mongoServer = null;

  if (isLocalMongo) {
    const portMatch = uri.match(/:(\d+)/);
    const port = portMatch ? parseInt(portMatch[1], 10) : 27017;
    const isRunning = await checkPortInUse(port);

    if (!isRunning) {
      console.log(`\n🚀 [Auto-DB] Đang tự động khởi động MongoDB Local tại port ${port}...`);
      try {
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        const dataDir = path.resolve(".data", "mongodb");
        await mkdir(dataDir, { recursive: true });

        mongoServer = await MongoMemoryServer.create({
          instance: {
            dbName: "wtf-FundTracker",
            dbPath: dataDir,
            ip: "127.0.0.1",
            port,
            storageEngine: "wiredTiger",
          },
        });

        console.log(`✅ [Auto-DB] MongoDB Local đã sẵn sàng! (Dữ liệu lưu tại: ${dataDir})\n`);
      } catch (err) {
        console.warn(`⚠️ [Auto-DB] Không thể tự động khởi tạo MongoDB Memory Server: ${err.message}`);
        console.warn(`💡 Vui lòng đảm bảo MongoDB đang chạy hoặc cấu hình MONGODB_URI trong .env.local\n`);
      }
    } else {
      console.log(`✅ [Auto-DB] Đã phát hiện MongoDB đang chạy sẵn trên cổng ${port}.\n`);
    }
  } else {
    console.log(`☁️ [Database] Kết nối MongoDB từ xa / Cloud Atlas: ${uri.replace(/:([^:@]+)@/, ":****@")}\n`);
  }

  // 3. Khởi chạy Next.js dev server
  const isWindows = process.platform === "win32";
  const cmd = isWindows ? "npm.cmd run next:dev" : "npm run next:dev";
  const nextDev = spawn(cmd, {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      MONGODB_URI: uri,
    },
  });

  const cleanup = async () => {
    if (nextDev) {
      nextDev.kill();
    }
    if (mongoServer) {
      console.log("\n🛑 [Auto-DB] Đang dừng MongoDB Local...");
      await mongoServer.stop({ doCleanup: false, force: false });
    }
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  nextDev.on("close", (code) => {
    cleanup();
  });
}

main().catch((err) => {
  console.error("Lỗi khởi động dự án:", err);
  process.exit(1);
});
