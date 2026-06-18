import { existsSync, readFileSync } from "node:fs";

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function dependencyVersionsArePinned(dependencies) {
  return Object.entries(dependencies ?? {}).filter(([, version]) =>
    /^[*^~><=]/.test(version),
  );
}

const packageJson = readJson("package.json");
const looseDependencies = [
  ...dependencyVersionsArePinned(packageJson.dependencies),
  ...dependencyVersionsArePinned(packageJson.devDependencies),
];

assert(existsSync("bun.lock"), "Expected bun.lock so Eazo installs the same dependency graph.");
assert(!existsSync("package-lock.json"), "Expected no package-lock.json in this Bun-first app.");
assert(
  typeof packageJson.packageManager === "string" && packageJson.packageManager.startsWith("bun@"),
  "Expected packageManager to pin the Bun version.",
);
assert(
  looseDependencies.length === 0,
  `Expected exact dependency versions, found loose ranges: ${looseDependencies
    .map(([name, version]) => `${name}@${version}`)
    .join(", ")}`,
);

const appShell = readFileSync("src/components/watermelon/index.tsx", "utf8");
assert(appShell.includes("min-h-dvh"), "Expected the app shell to use min-h-dvh.");
assert(
  appShell.includes("safe-area-inset-top") && appShell.includes("safe-area-inset-bottom"),
  "Expected the app shell to include Eazo WebView safe-area padding.",
);
assert(!appShell.includes("min-h-svh"), "Expected no min-h-svh in the app shell.");

const melonStage = readFileSync("src/components/watermelon/melon-stage.tsx", "utf8");
assert(melonStage.includes("clamp("), "Expected melon stage dimensions to be responsive.");
assert(!melonStage.includes("h-[280px]"), "Expected no fixed 280px melon stage height.");

const agentGuide = readFileSync("AGENTS.md", "utf8");
assert(!agentGuide.includes("useAuthStore"), "Expected AGENTS.md to match useEazo auth state.");
assert(!agentGuide.includes("src/components/todo-list"), "Expected AGENTS.md to be product-specific.");
assert(agentGuide.includes("390x640"), "Expected AGENTS.md to document the short Eazo preview check.");

for (const file of [
  "src/components/watermelon/decorations.tsx",
  "src/components/watermelon/result-panel.tsx",
]) {
  const source = readFileSync(file, "utf8");
  const exportedComponents = source.match(/export function [A-Z][A-Za-z0-9]*/g) ?? [];
  const localComponents = source.match(/^function [A-Z][A-Za-z0-9]*/gm) ?? [];
  assert(
    exportedComponents.length === 1 && localComponents.length === 0,
    `Expected ${file} to export exactly one product component and define no local component helpers.`,
  );
}

if (failures.length > 0) {
  console.error("Eazo readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Eazo readiness check passed.");
