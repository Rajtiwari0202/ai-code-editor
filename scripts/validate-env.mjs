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

const optional = [
  "AI_PROVIDER",
  "OLLAMA_BASE_URL",
  "OLLAMA_MODEL",
  "OPENAI_API_KEY",
  "OPENAI_BASE_URL",
  "OPENAI_MODEL",
];

const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error("Missing required environment variables:");
  for (const name of missing) {
    console.error(`- ${name}`);
  }
  process.exit(1);
}

console.log("Required environment variables are present.");

const aiProvider = (process.env.AI_PROVIDER || "ollama").toLowerCase();

if (!validAIProviders.has(aiProvider)) {
  console.error(
    `Invalid AI_PROVIDER "${process.env.AI_PROVIDER}". Expected one of: ${Array.from(
      validAIProviders
    ).join(", ")}`
  );
  process.exit(1);
}

if (aiProvider === "openai-compatible") {
  const missingOpenAICompatible = ["OPENAI_API_KEY", "OPENAI_MODEL"].filter(
    (name) => !process.env[name]
  );

  if (missingOpenAICompatible.length > 0) {
    console.error("Missing OpenAI-compatible provider environment variables:");
    for (const name of missingOpenAICompatible) {
      console.error(`- ${name}`);
    }
    process.exit(1);
  }
}

const unsetOptional = optional.filter((name) => !process.env[name]);
if (unsetOptional.length > 0) {
  console.log(
    `Optional AI variables not set, defaults will be used: ${unsetOptional.join(", ")}`
  );
}
