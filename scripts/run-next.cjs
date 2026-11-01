/**
 * Runs Next build/dev with fs.readlink patch in all worker processes.
 */
const { spawn } = require("child_process");
const path = require("path");

const patch = path.join(__dirname, "patch-fs.cjs");
const nextBin = path.join(__dirname, "..", "node_modules", "next", "dist", "bin", "next");
const command = process.argv[2] || "build";
const extra = process.argv.slice(3);

const nodeOptions = [process.env.NODE_OPTIONS, `--require=${patch}`]
  .filter(Boolean)
  .join(" ");

const child = spawn(process.execPath, [nextBin, command, ...extra], {
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_OPTIONS: nodeOptions,
  },
  shell: false,
});

child.on("exit", (code) => process.exit(code ?? 1));
