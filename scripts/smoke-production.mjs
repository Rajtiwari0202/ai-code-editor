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

  console.log(`Production smoke passed at ${baseUrl}`);
} catch (error) {
  console.error(output.trim());
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  child.kill();
}
