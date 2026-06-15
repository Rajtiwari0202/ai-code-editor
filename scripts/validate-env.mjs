import fs from "node:fs";
import path from "node:path";

const shellEnvKeys = new Set(Object.keys(process.env));

function parseEnvValue(value) {
  const trimmed = value.trim();
  const quote = trimmed[0];

  if ((quote === `"` || quote === "'") && trimmed.endsWith(quote)) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function loadEnvFile(fileName) {
  const filePath = path.join(process.cwd(), fileName);

  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = parseEnvValue(trimmed.slice(separatorIndex + 1));

    if (key && !shellEnvKeys.has(key)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const required = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "AUTH_GITHUB_ID",
  "AUTH_GITHUB_SECRET",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "NEXTAUTH_URL",
];

const validAIProviders = new Set(["ollama", "openai-compatible"]);

const strictMode =
  process.argv.includes("--strict") ||
  process.env.VALIDATE_ENV_STRICT === "true";

const errors = [];
const warnings = [];

function addError(message) {
  errors.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

function readEnv(name) {
  return process.env[name]?.trim() || "";
}

function validateUrl(name, allowedProtocols) {
  const value = readEnv(name);
  if (!value) return null;

  try {
    const parsed = new URL(value);
    if (!allowedProtocols.includes(parsed.protocol)) {
      addError(
        `${name} must use one of these protocols: ${allowedProtocols.join(", ")}`
      );
      return null;
    }

    return parsed;
  } catch {
    addError(`${name} must be a valid URL.`);
    return null;
  }
}

function isLocalHost(hostname) {
  return ["localhost", "127.0.0.1", "::1"].includes(hostname);
}

const missing = required.filter((name) => !readEnv(name));

if (missing.length > 0) {
  for (const name of missing) {
    addError(`Missing required environment variable: ${name}`);
  }
}

const nextAuthUrl = validateUrl("NEXTAUTH_URL", ["http:", "https:"]);
const nextPublicSiteUrl = validateUrl("NEXT_PUBLIC_SITE_URL", [
  "http:",
  "https:",
]);
validateUrl("DATABASE_URL", ["mongodb:", "mongodb+srv:"]);

const aiProvider = (readEnv("AI_PROVIDER") || "ollama").toLowerCase();

if (!validAIProviders.has(aiProvider)) {
  addError(
    `Invalid AI_PROVIDER "${process.env.AI_PROVIDER}". Expected one of: ${Array.from(
      validAIProviders
    ).join(", ")}`
  );
}

if (aiProvider === "openai-compatible") {
  validateUrl("OPENAI_BASE_URL", ["http:", "https:"]);

  const missingOpenAICompatible = ["OPENAI_API_KEY", "OPENAI_MODEL"].filter(
    (name) => !readEnv(name)
  );

  if (missingOpenAICompatible.length > 0) {
    for (const name of missingOpenAICompatible) {
      addError(
        `Missing OpenAI-compatible provider environment variable: ${name}`
      );
    }
  }
} else if (aiProvider === "ollama") {
  validateUrl("OLLAMA_BASE_URL", ["http:", "https:"]);
}

if (strictMode) {
  const authSecret = readEnv("AUTH_SECRET");

  if (authSecret.length < 32) {
    addError("AUTH_SECRET must be at least 32 characters in strict mode.");
  }

  if (nextAuthUrl) {
    if (nextAuthUrl.protocol !== "https:") {
      addError("NEXTAUTH_URL must use https in strict mode.");
    }

    if (isLocalHost(nextAuthUrl.hostname)) {
      addError("NEXTAUTH_URL must not point to localhost in strict mode.");
    }
  }

  if (nextPublicSiteUrl) {
    if (nextPublicSiteUrl.protocol !== "https:") {
      addError("NEXT_PUBLIC_SITE_URL must use https in strict mode.");
    }

    if (isLocalHost(nextPublicSiteUrl.hostname)) {
      addError("NEXT_PUBLIC_SITE_URL must not point to localhost in strict mode.");
    }
  }

  const weakValues = new Set([
    "dev-secret",
    "ci-auth-secret",
    "github-id",
    "github-secret",
    "google-id",
    "google-secret",
    "test-key",
    "ci-openai-key",
  ]);

  for (const name of required) {
    if (weakValues.has(readEnv(name))) {
      addError(`${name} still contains a development or CI placeholder value.`);
    }
  }

  if (
    aiProvider === "openai-compatible" &&
    weakValues.has(readEnv("OPENAI_API_KEY"))
  ) {
    addError(
      "OPENAI_API_KEY still contains a development or CI placeholder value."
    );
  }
}

const relevantOptional =
  aiProvider === "openai-compatible"
    ? ["OPENAI_BASE_URL"]
    : ["OLLAMA_BASE_URL", "OLLAMA_MODEL"];

const unsetOptional = relevantOptional.filter((name) => !readEnv(name));
if (unsetOptional.length > 0) {
  addWarning(
    `Optional AI variables not set, defaults will be used: ${unsetOptional.join(
      ", "
    )}`
  );
}

if (warnings.length > 0) {
  console.log("Environment validation warnings:");
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }
}

if (errors.length > 0) {
  console.error("Environment validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  strictMode
    ? "Required environment variables are present and strict checks passed."
    : "Required environment variables are present."
);
