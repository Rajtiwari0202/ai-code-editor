const required = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "AUTH_GITHUB_ID",
  "AUTH_GITHUB_SECRET",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "NEXTAUTH_URL",
];

const optional = ["OLLAMA_BASE_URL", "OLLAMA_MODEL"];

const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error("Missing required environment variables:");
  for (const name of missing) {
    console.error(`- ${name}`);
  }
  process.exit(1);
}

console.log("Required environment variables are present.");

const unsetOptional = optional.filter((name) => !process.env[name]);
if (unsetOptional.length > 0) {
  console.log(
    `Optional AI variables not set, defaults will be used: ${unsetOptional.join(", ")}`
  );
}
