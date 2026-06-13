import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const starters = {
  REACT: "templates/forge-starters/react-ts",
  NEXTJS: "templates/forge-starters/nextjs",
  EXPRESS: "templates/forge-starters/express",
  VUE: "templates/forge-starters/vue",
  HONO: "templates/forge-starters/hono",
  ANGULAR: "templates/forge-starters/angular",
};

const failures = [];

for (const [template, relativePath] of Object.entries(starters)) {
  const templateDir = path.resolve(process.cwd(), relativePath);
  const packagePath = path.join(templateDir, "package.json");

  if (!existsSync(templateDir)) {
    failures.push(`${template}: missing directory ${relativePath}`);
    continue;
  }

  if (!existsSync(packagePath)) {
    failures.push(`${template}: missing package.json`);
    continue;
  }

  try {
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));

    if (!packageJson.scripts?.start) {
      failures.push(`${template}: package.json is missing scripts.start`);
    }
  } catch (error) {
    failures.push(`${template}: invalid package.json (${error.message})`);
  }
}

if (failures.length > 0) {
  console.error("Starter template validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("All starter templates are present and expose npm run start.");
