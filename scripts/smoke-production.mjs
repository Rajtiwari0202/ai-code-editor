import { spawn } from "node:child_process";

const port = Number(process.env.SMOKE_PORT || 3210);
const host = "127.0.0.1";
const baseUrl = `http://${host}:${port}`;
const timeoutMs = 45000;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer() {
  const startedAt = Date.now();
  let lastError = "";

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/api/health`, {
        cache: "no-store",
      });

      if (response.ok) {
        return;
      }

      lastError = `health returned ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    await wait(750);
  }

  throw new Error(`Production server did not become ready: ${lastError}`);
}

async function assertRoute(path, predicate, label) {
  const response = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`${label} returned ${response.status}`);
  }

  const body = await response.text();

  if (!predicate(body)) {
    throw new Error(`${label} response did not match the expected contract`);
  }
}

async function assertJsonRequest(method, path, payload, predicate, label) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });

  const body = await response.text();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      `${label} returned ${response.status} with ${contentType || "no content type"} instead of JSON`
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch (error) {
    throw new Error(
      `${label} returned invalid JSON: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  if (!predicate(response, parsed)) {
    throw new Error(`${label} response did not match the expected contract`);
  }
}

async function assertProtectedJson401(method, path, payload, label) {
  await assertJsonRequest(
    method,
    path,
    payload,
    (response, body) =>
      response.status === 401 && body.error === "Unauthorized",
    label
  );
}

async function assertIsolationHeaders(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
  });

  const coop = response.headers.get("cross-origin-opener-policy");
  const coep = response.headers.get("cross-origin-embedder-policy");

  if (coop !== "same-origin") {
    throw new Error(
      `Expected ${path} to send Cross-Origin-Opener-Policy: same-origin, received ${coop || "none"}`
    );
  }

  if (coep !== "require-corp") {
    throw new Error(
      `Expected ${path} to send Cross-Origin-Embedder-Policy: require-corp, received ${coep || "none"}`
    );
  }
}

const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-p", String(port), "-H", host],
  {
    env: {
      ...process.env,
      AUTH_TRUST_HOST: "true",
      AUTH_URL: baseUrl,
      NEXTAUTH_URL: baseUrl,
      PORT: String(port),
    },
    stdio: ["ignore", "pipe", "pipe"],
  }
);

let output = "";

child.stdout.on("data", (chunk) => {
  output += chunk.toString();
});

child.stderr.on("data", (chunk) => {
  output += chunk.toString();
});

try {
  await waitForServer();
  await assertRoute(
    "/api/health",
    (body) => {
      const parsed = JSON.parse(body);
      return parsed.service === "forge-editor" && parsed.status === "ok";
    },
    "Health route"
  );
  await assertRoute(
    "/",
    (body) => body.includes("Forge Editor") && !/vibe|Prepwise|chai/i.test(body),
    "Home route"
  );
  await assertIsolationHeaders("/");
  await assertRoute(
    "/terms",
    (body) => body.includes("Terms of Service"),
    "Terms route"
  );
  await assertRoute(
    "/privacy",
    (body) => body.includes("Privacy Policy"),
    "Privacy route"
  );
  await assertRoute(
    "/robots.txt",
    (body) =>
      body.includes("Sitemap:") &&
      body.includes("/sitemap.xml") &&
      body.includes("Disallow: /dashboard"),
    "Robots route"
  );
  await assertRoute(
    "/sitemap.xml",
    (body) =>
      body.includes(`${baseUrl}/`) &&
      body.includes(`${baseUrl}/terms`) &&
      body.includes(`${baseUrl}/privacy`),
    "Sitemap route"
  );
  await assertProtectedJson401(
    "POST",
    "/api/chat",
    {
      message: "Explain this file structure.",
      history: [],
    },
    "Protected chat API"
  );
  await assertProtectedJson401(
    "POST",
    "/api/code-completion",
    {
      fileContent: "const value = ",
      cursorLine: 0,
      cursorColumn: 14,
      suggestionType: "complete-line",
      fileName: "src/App.tsx",
    },
    "Protected code completion API"
  );
  await assertProtectedJson401(
    "GET",
    "/api/template/smoke-playground",
    undefined,
    "Protected template API"
  );
  await assertProtectedJson401(
    "POST",
    "/api/plan",
    {
      intent: "rename a variable",
      activeFile: "src/App.tsx",
      dirtyFiles: [],
    },
    "Protected plan API"
  );
  await assertProtectedJson401(
    "POST",
    "/api/patch",
    {
      intent: "rename a variable",
      activeFile: "src/App.tsx",
      dirtyFiles: [],
      selectedStepIds: ["draft-small-patch"],
    },
    "Protected patch API"
  );
  await assertProtectedJson401(
    "POST",
    "/api/verify",
    {
      commands: ["npm run lint", "rm -rf ."],
    },
    "Protected verify API"
  );

  console.log(`Production smoke passed at ${baseUrl}`);
} catch (error) {
  console.error(output.trim());
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  child.kill();
}
