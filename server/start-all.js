import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define colors for console output
const colors = {
  reset: "\x1b[0m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
};

/**
 * Executes a shell command and streams its output.
 * @param {string} command The command to execute.
 * @param {string[]} args The arguments for the command.
 * @param {string} cwd The working directory for the command.
 * @param {string} name A friendly name for the process.
 * @param {string} color The color for the process's log output.
 * @returns {Promise<void>} A promise that resolves or rejects when the process exits.
 */
function runScript(command, args, cwd, name, color) {
  return new Promise((resolve, reject) => {
    console.log(`${color}🚀 Starting ${name}...${colors.reset}`);
    const process = spawn(command, args, { cwd, shell: true });

    process.stdout.on("data", (data) => {
      console.log(`${color}[${name}]${colors.reset} ${data.toString().trim()}`);
    });

    process.stderr.on("data", (data) => {
      console.error(`${color}[${name} ERROR]${colors.reset} ${data.toString().trim()}`);
    });

    process.on("close", (code) => {
      if (code === 0) {
        console.log(`${color}✅ ${name} finished successfully.${colors.reset}`);
        resolve();
      } else {
        reject(new Error(`${color}❌ ${name} failed with exit code ${code}.${colors.reset}`));
      }
    });

    process.on("error", (err) => {
      console.error(`${color}Failed to start ${name}: ${err.message}${colors.reset}`);
      reject(err);
    });
  });
}

async function startAll() {
  try {
    // --- Step 1: Run Backend Database Migration ---
    // This runs first and must complete successfully.
    await runScript("node", ["add-razorpay-payment-id.js"], __dirname, "Database Migration", colors.yellow);

    console.log("\n--- Starting development servers ---\n");

    // --- Step 2: Run Backend and Frontend Concurrently ---
    const clientDir = path.resolve(__dirname, "../client");

    // These promises will run in parallel.
    const backendPromise = runScript("nodemon", ["server.js"], __dirname, "Backend", colors.blue);
    const frontendPromise = runScript("npm", ["run", "dev"], clientDir, "Frontend", colors.green);

    // Wait for both servers to start (or for one to fail).
    await Promise.all([backendPromise, frontendPromise]);

  } catch (error) {
    console.error("\n🔥 A critical step failed. Halting startup.");
    process.exit(1);
  }
}

startAll();