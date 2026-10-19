import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { projectRoot } from "./sites-env.mjs";

const port = process.env.PORT || "8787";
const host = process.env.HOST || (process.env.PORT ? "0.0.0.0" : "127.0.0.1");

// Ensure dist/server/.dev.vars receives runtime environment variables for Wrangler
const distServerDir = path.join(projectRoot, "dist", "server");
if (fs.existsSync(distServerDir)) {
  const devVarsPath = path.join(distServerDir, ".dev.vars");
  let content = "";
  const rootDevVars = path.join(projectRoot, ".dev.vars");
  if (fs.existsSync(rootDevVars)) {
    content = fs.readFileSync(rootDevVars, "utf8");
  }
  const runtimeVars = [];
  if (process.env.ADMIN_PASSWORD) {
    runtimeVars.push(`ADMIN_PASSWORD=${process.env.ADMIN_PASSWORD}`);
  }
  if (process.env.ADMIN_USER_IDS) {
    runtimeVars.push(`ADMIN_USER_IDS=${process.env.ADMIN_USER_IDS}`);
  } else if (!content.includes("ADMIN_USER_IDS")) {
    runtimeVars.push("ADMIN_USER_IDS=local_seedy");
  }
  if (process.env.ADMIN_EMAILS) {
    runtimeVars.push(`ADMIN_EMAILS=${process.env.ADMIN_EMAILS}`);
  }
  if (process.env.SITE_URL) {
    runtimeVars.push(`SITE_URL=${process.env.SITE_URL}`);
  }
  fs.writeFileSync(devVarsPath, `${content}\n${runtimeVars.join("\n")}\n`);
}

const wranglerBin = path.join(
  projectRoot,
  "node_modules",
  "wrangler",
  "bin",
  "wrangler.js",
);
const sitesEnvUrl = pathToFileURL(
  path.join(projectRoot, "scripts", "sites-env.mjs"),
).href;

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
