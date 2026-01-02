#!/usr/bin/env node

/**
 * Helper script to run Groq models test
 * Reads GROQ_API_KEY from .env file or accepts it as argument
 * Works on all platforms (Windows, Mac, Linux)
 *
 * Usage:
 *   node test-groq-models.js           # Read from .env
 *   node test-groq-models.js <API_KEY> # Use provided API key
 */

import { spawn } from "child_process";
import { platform } from "os";
import { readFileSync } from "fs";
import { resolve } from "path";

const args = process.argv.slice(2);

// Try to load from .env file
let apiKey = null;

// If API key provided as argument, use that
if (args.length > 0) {
  apiKey = args[0];
  console.log("✅ Using API key from argument\n");
} else {
  // Try to read from .env file
  try {
    const envPath = resolve(".env");
    const envContent = readFileSync(envPath, "utf-8");

    // Parse .env file
    const lines = envContent.split("\n");
    for (const line of lines) {
      if (line.startsWith("GROQ_API_KEY=")) {
        apiKey = line.replace("GROQ_API_KEY=", "").trim();
        console.log("✅ Loaded GROQ_API_KEY from .env file\n");
        break;
      }
    }
  } catch (error) {
    // .env file doesn't exist or couldn't be read
  }
}

// If still no API key, show error
if (!apiKey) {
  console.error("❌ Error: GROQ_API_KEY not found\n");
  console.error("Create a .env file with:");
  console.error("  GROQ_API_KEY=gsk_your_key_here\n");
  console.error("Or pass it as argument:");
  console.error("  node test-groq-models.js gsk_your_key_here\n");
  console.error("Get your API key from: https://console.groq.com/\n");
  process.exit(1);
}

// Set environment variable
process.env.GROQ_API_KEY = apiKey;

// Determine the command based on OS
const isWindows = platform() === "win32";
const cmd = isWindows ? "npm.cmd" : "npm";
const runArgs = ["run", "test:models"];

console.log("🧪 Running Groq models test...\n");

// Spawn the npm process
const child = spawn(cmd, runArgs, {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, GROQ_API_KEY: apiKey },
});

child.on("error", (error) => {
  console.error("Error running test:", error);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code || 0);
});

