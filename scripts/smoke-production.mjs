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

async function assertJsonPost(path, payload, predicate, label) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.text();

  if (!predicate(response, body)) {
    throw new Error(`${label} response did not match the expected contract`);
  }
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
  await assertJsonPost(
    "/api/plan",
    {
      intent: "rename a variable",
      activeFile: "src/App.tsx",
      dirtyFiles: [],
    },
    (response, body) => {
      const parsed = JSON.parse(body);
      return response.status === 401 && parsed.error === "Unauthorized";
    },
    "Protected plan API"
  );
  await assertJsonPost(
    "/api/patch",
    {
      intent: "rename a variable",
      activeFile: "src/App.tsx",
      dirtyFiles: [],
      selectedStepIds: ["draft-small-patch"],
    },
    (response, body) => {
      const parsed = JSON.parse(body);
      return response.status === 401 && parsed.error === "Unauthorized";
    },
    "Protected patch API"
  );
  await assertJsonPost(
    "/api/verify",
    {
      commands: ["npm run lint", "rm -rf ."],
    },
    (response, body) => {
      const parsed = JSON.parse(body);
      return response.status === 401 && parsed.error === "Unauthorized";
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
