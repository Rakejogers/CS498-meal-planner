// @vitest-environment node
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const script = resolve("scripts/ci-database.mjs");
let directory: string;
let repository: string;
let base: string;

function git(...args: string[]) {
  return execFileSync("git", args, { cwd: repository, encoding: "utf8" }).trim();
}

function commit(file: string, contents = "changed\n") {
  const path = join(repository, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
  git("add", ".");
  git("commit", "--quiet", "-m", "fixture");
  return git("rev-parse", "HEAD");
}

function runRecord(id: number, sha: string, conclusion = "success") {
  return { id, head_sha: sha, event: "push", head_branch: "main", conclusion };
}

function history(
  runs = [runRecord(1, base)],
  jobs: Record<string, { name: string; conclusion: string }[]> = {
    "1": [{ name: "Deploy migrations to production", conclusion: "success" }],
  },
) {
  writeFileSync(join(directory, "history.json"), JSON.stringify({ runs, jobs }));
}

function needed(mode: "tests" | "deploy", env: Record<string, string> = {}) {
  const output = join(directory, "output");
  writeFileSync(output, "");
  execFileSync(process.execPath, [script, mode], {
    cwd: repository,
    env: {
      ...process.env,
      PATH: `${join(directory, "bin")}:${process.env.PATH}`,
      CI_HISTORY: join(directory, "history.json"),
      GITHUB_OUTPUT: output,
      GITHUB_EVENT_NAME: "push",
      GITHUB_REPOSITORY: "test/repo",
      GITHUB_RUN_ID: "999",
      PUSH_BEFORE: base,
      ...env,
    },
    stdio: "pipe",
  });
  return readFileSync(output, "utf8").trim();
}

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "plantry-ci-"));
  repository = join(directory, "repo");
  mkdirSync(repository);
  git("init", "--quiet", "-b", "main");
  git("config", "user.name", "CI test");
  git("config", "user.email", "ci@example.com");
  git("config", "commit.gpgsign", "false");
  git("config", "core.hooksPath", "/dev/null");
  base = commit("README.md", "base\n");
  mkdirSync(join(directory, "bin"));
  // Fake only the external GitHub response; exercise actual Git history,
  // subprocess invocation, changed-path parsing, and Actions output writing.
  writeFileSync(
    join(directory, "bin", "gh"),
    `#!${process.execPath}
const fs = require("node:fs");
const data = JSON.parse(fs.readFileSync(process.env.CI_HISTORY, "utf8"));
const endpoint = process.argv[3];
const match = endpoint.match(new RegExp("/runs/([0-9]+)/jobs"));
process.stdout.write(JSON.stringify(match ? {jobs: data.jobs[match[1]] || []} : {workflow_runs: data.runs}));
`,
    { mode: 0o755 },
  );
  history();
});

afterEach(() => rmSync(directory, { recursive: true, force: true }));

describe("database test selection", () => {
  it("skips database-only checks for app and documentation changes", () => {
    commit("app/page.tsx");
    commit("docs/design.md");
    expect(needed("tests")).toBe("needed=false");
  });

  it.each([
    "supabase/migrations/20261111000000_change.sql",
    "supabase/tests/rls.test.sql",
    "supabase/config.toml",
    "supabase/seed.sql",
    "lib/supabase/database.types.ts",
    "package.json",
    "package-lock.json",
    ".nvmrc",
    ".github/workflows/ci.yml",
    "scripts/ci-database.mjs",
  ])("runs database checks when %s changes", (file) => {
    commit(file);
    expect(needed("tests")).toBe("needed=true");
  });

  it("checks the whole push, including a migration before the last commit", () => {
    commit("supabase/migrations/20261111000000_change.sql");
    commit("app/page.tsx");
    expect(needed("tests")).toBe("needed=true");
  });

  it("compares PR merge commits to their first parent", () => {
    commit("supabase/migrations/20261111000000_existing.sql");
    git("switch", "--quiet", "-c", "topic");
    commit("app/page.tsx");
    git("switch", "--quiet", "main");
    commit("docs/design.md");
    git("merge", "--quiet", "--no-ff", "-m", "PR merge", "topic");
    expect(needed("tests", { GITHUB_EVENT_NAME: "pull_request" })).toBe("needed=false");
  });

  it("detects migrations renamed out of the migration directory", () => {
    base = commit("supabase/migrations/20261111000000_existing.sql");
    git("mv", "supabase/migrations/20261111000000_existing.sql", "archived.sql");
    git("commit", "--quiet", "-m", "move migration");
    expect(needed("tests")).toBe("needed=true");
  });

  it.each(["", "0000000000000000000000000000000000000000", "missing-sha"])(
    "runs checks when the push baseline is unavailable (%s)",
    (PUSH_BEFORE) => {
      expect(needed("tests", { PUSH_BEFORE })).toBe("needed=true");
    },
  );
});

describe("production migration selection", () => {
  it("skips the push when a successful deployment already has the same inputs", () => {
    commit("app/page.tsx");
    commit("supabase/tests/rls.test.sql");
    commit("lib/supabase/database.types.ts");
    expect(needed("deploy")).toBe("needed=false");
  });

  it("does not bypass a failed migration deployment on the next app-only push", () => {
    const failed = commit("supabase/migrations/20261111000000_change.sql");
    commit("app/page.tsx");
    history([runRecord(2, failed, "failure"), runRecord(1, base)]);
    expect(needed("deploy", { PUSH_BEFORE: failed })).toBe("needed=true");
  });

  it.each(["supabase/config.toml", ".github/workflows/ci.yml", "package-lock.json"])(
    "runs a push when deployment tooling changes (%s)",
    (file) => {
      commit(file);
      expect(needed("deploy")).toBe("needed=true");
    },
  );

  it.each(["skipped", "failure", "cancelled"])(
    "rejects a successful workflow with a %s database job",
    (conclusion) => {
      history(undefined, {
        "1": [{ name: "Deploy migrations to production", conclusion }],
      });
      expect(needed("deploy")).toBe("needed=true");
    },
  );

  it("rejects a successful workflow without the database job", () => {
    history(undefined, {});
    expect(needed("deploy")).toBe("needed=true");
  });

  it("does not trust a successful deployment on a newer or unrelated commit", () => {
    const newer = commit("app/page.tsx");
    git("checkout", "--quiet", base);
    history([runRecord(1, newer)]);
    expect(needed("deploy")).toBe("needed=true");
  });

  it("does not use the current run as its own baseline on a rerun", () => {
    expect(needed("deploy", { GITHUB_RUN_ID: "1" })).toBe("needed=true");
  });

  it("runs a push when deployment history has expired or is empty", () => {
    history([]);
    expect(needed("deploy")).toBe("needed=true");
  });

  it("runs a push when the GitHub API fails", () => {
    rmSync(join(directory, "history.json"));
    expect(needed("deploy")).toBe("needed=true");
  });
});
