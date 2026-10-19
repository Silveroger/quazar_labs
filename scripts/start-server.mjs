import { spawn } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { projectRoot } from "./sites-env.mjs";

const port = process.env.PORT || "8787";
const host = process.env.HOST || (process.env.PORT ? "0.0.0.0" : "127.0.0.1");

const wranglerBin = path.join(
  projectRoot,
  "node_modules",
  "wrangler",
  "bin",
  "wrangler.js",
);
const sitesEnvUrl = pathToFileURL(path.join(projectRoot, "scripts", "sites-env.mjs")).href;

console.log(`[start-server] Starting server on ${host}:${port}...`);

const child = spawn(
  process.execPath,
  [
    "--import",
    sitesEnvUrl,
    wranglerBin,
    "dev",
    "--config",
    "dist/server/wrangler.json",
    "--local",
    "--persist-to",
    ".wrangler/state",
    "--ip",
    host,
    "--port",
    String(port),
    "--inspector-port",
    "0",
  ],
  {
    cwd: projectRoot,
    stdio: "inherit",
    env: process.env,
  },
);

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
