import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

// Run without npm ci: both commands use only Node and the runner's Git/gh.
function command(program, args) {
  return execFileSync(program, args, {
    encoding: "utf8",
    timeout: 30_000,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function changedFiles(base) {
  // Disable rename detection so both the old and new paths are considered.
  return command("git", ["diff", "--name-only", "--no-renames", "-z", base, "HEAD", "--"])
    .split("\0")
    .filter(Boolean);
}

function toolingChanged(file) {
  return (
    ["package.json", "package-lock.json", ".nvmrc"].includes(file) ||
    file.startsWith(".github/workflows/") ||
    file.startsWith("scripts/ci-database.")
  );
}

function testsNeeded() {
  const base =
    process.env.GITHUB_EVENT_NAME === "pull_request" ? "HEAD^1" : process.env.PUSH_BEFORE;
  if (!base || /^0+$/.test(base)) return true;
  return changedFiles(base).some(
    (file) =>
      file.startsWith("supabase/") ||
      file === "lib/supabase/database.types.ts" ||
      toolingChanged(file),
  );
}

function api(endpoint) {
  return JSON.parse(command("gh", ["api", endpoint]));
}

function deployNeeded() {
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) return true;

  // Bound the lookup; if older history is needed, doing a normal db push is
  // safer than guessing. A successful workflow alone isn't proof: GitHub also
  // allows workflows with skipped jobs to succeed, so inspect the deploy job.
  const { workflow_runs: runs } = api(
    `repos/${repo}/actions/workflows/ci.yml/runs?branch=main&event=push&status=success&per_page=20`,
  );
  for (const run of runs) {
    if (
      String(run.id) === process.env.GITHUB_RUN_ID ||
      run.event !== "push" ||
      run.head_branch !== "main" ||
      run.conclusion !== "success"
    ) {
      continue;
    }
    try {
      command("git", ["merge-base", "--is-ancestor", run.head_sha, "HEAD"]);
    } catch {
      // A force-pushed branch or an older run being retried must not use a
      // successful deployment from an unrelated or newer commit as its base.
      continue;
    }
    const { jobs } = api(`repos/${repo}/actions/runs/${run.id}/jobs?filter=latest&per_page=100`);
    if (
      !jobs.some(
        (job) => job.name === "Deploy migrations to production" && job.conclusion === "success",
      )
    ) {
      continue;
    }

    console.log(`Comparing database deployment inputs with ${run.head_sha}.`);
    return changedFiles(run.head_sha).some(
      (file) =>
        file.startsWith("supabase/migrations/") ||
        file === "supabase/config.toml" ||
        toolingChanged(file),
    );
  }
  console.log("No successful ancestor database deployment found; running db push.");
  return true;
}

const mode = process.argv[2];
if (mode !== "tests" && mode !== "deploy") {
  throw new Error("Usage: node scripts/ci-database.mjs <tests|deploy>");
}

let needed = true;
try {
  needed = mode === "tests" ? testsNeeded() : deployNeeded();
} catch {
  // API outages, missing history, or an unreadable diff must never turn into a
  // successful no-op. Avoid logging command stderr, which may contain secrets.
  console.log("Could not establish a safe baseline; running database work.");
}
console.log(`Database ${mode} needed: ${needed}`);
appendFileSync(process.env.GITHUB_OUTPUT, `needed=${needed}\n`);
