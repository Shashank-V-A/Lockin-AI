#!/usr/bin/env node
/**
 * Installs Python, JavaScript, Java, and C++ runtimes into the local Piston container.
 * Prerequisites: Docker running + `docker compose up piston -d`
 */
import { execSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const PISTON_URL = process.env.PISTON_API_URL?.replace(/\/piston\/?$/, "") ?? "http://localhost:2000/api/v2";
const RUNTIMES_URL = `${PISTON_URL.replace(/\/$/, "")}/runtimes`;
const REPO_DIR = join(process.cwd(), ".piston-cli");
const CLI = join(REPO_DIR, "cli", "index.js");

const PACKAGE_FOR_RUNTIME = {
  python: "python",
  javascript: "node",
  java: "java",
  "c++": "gcc",
};

async function fetchRuntimes() {
  const res = await fetch(RUNTIMES_URL, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Piston not reachable at ${RUNTIMES_URL} (${res.status})`);
  return res.json();
}

function ensureCli() {
  if (!existsSync(CLI)) {
    console.log("Cloning Piston CLI (one-time)...");
    execSync(`git clone --depth 1 https://github.com/engineer-man/piston.git "${REPO_DIR}"`, {
      stdio: "inherit",
    });
  }
  if (!existsSync(join(REPO_DIR, "cli", "node_modules"))) {
    console.log("Installing CLI dependencies...");
    execSync("npm install", { cwd: join(REPO_DIR, "cli"), stdio: "inherit" });
  }
}

function installLanguage(lang) {
  const pkg = PACKAGE_FOR_RUNTIME[lang] ?? lang;
  console.log(`Installing ${lang} runtime via ${pkg} (may take a few minutes)...`);
  const apiRoot = PISTON_URL.replace(/\/api\/v2\/?$/, "");
  const result = spawnSync(
    process.execPath,
    [CLI, "-u", apiRoot, "ppman", "install", pkg],
    { stdio: "inherit", cwd: REPO_DIR },
  );
  if (result.status !== 0) {
    throw new Error(`Failed to install ${lang}`);
  }
}

async function main() {
  console.log(`Checking Piston at ${RUNTIMES_URL}...`);
  let runtimes = await fetchRuntimes();
  const installed = new Set(runtimes.map((r) => r.language));

  const missing = ["python", "javascript", "java", "c++"].filter((lang) => {
    if (lang === "javascript") return !installed.has("javascript");
    if (lang === "c++") return !installed.has("c++");
    return !installed.has(lang);
  });

  if (missing.length === 0) {
    console.log("All required runtimes already installed: python, javascript, java, c++");
    return;
  }

  console.log("Missing runtimes:", missing.join(", "));
  ensureCli();

  for (const lang of missing) {
    installLanguage(lang);
  }

  runtimes = await fetchRuntimes();
  console.log(
    "Installed runtimes:",
    runtimes.map((r) => `${r.language}@${r.version}`).join(", "),
  );
}

main().catch((err) => {
  console.error(err.message ?? err);
  console.error("\nEnsure Docker is running and start Piston first:");
  console.error("  docker compose up piston -d");
  process.exit(1);
});
