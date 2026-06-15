import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const docsDir = path.join(rootDir, "docs");

const markdownFiles = [
  "README.md",
  "SECURITY.md",
  ...fs
    .readdirSync(docsDir)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => path.join("docs", fileName)),
];

function isEscaped(content, index) {
  let slashCount = 0;
  for (let i = index - 1; i >= 0 && content[i] === "\\"; i -= 1) {
    slashCount += 1;
  }
  return slashCount % 2 === 1;
}

function findClosingBracket(content, startIndex) {
  for (let i = startIndex; i < content.length; i += 1) {
    if (content[i] === "]" && !isEscaped(content, i)) {
      return i;
    }
  }
  return -1;
}

function findClosingParen(content, startIndex) {
  let depth = 1;

  for (let i = startIndex; i < content.length; i += 1) {
    const char = content[i];
    if (isEscaped(content, i)) continue;

    if (char === "(") {
      depth += 1;
    } else if (char === ")") {
      depth -= 1;
      if (depth === 0) {
        return i;
      }
    }
  }

  return -1;
}

function extractMarkdownLinks(content) {
  const links = [];

  for (let i = 0; i < content.length; i += 1) {
    if (content[i] !== "[" || isEscaped(content, i)) continue;

    const labelEnd = findClosingBracket(content, i + 1);
    if (labelEnd === -1 || content[labelEnd + 1] !== "(") continue;

    const destinationStart = labelEnd + 2;
    const destinationEnd = findClosingParen(content, destinationStart);
    if (destinationEnd === -1) continue;

    const rawDestination = content
      .slice(destinationStart, destinationEnd)
      .trim();

    links.push({
      destination: rawDestination,
      offset: i,
    });

    i = destinationEnd;
  }

  return links;
}

function normalizeDestination(rawDestination) {
  if (!rawDestination) return "";

  if (rawDestination.startsWith("<")) {
    const endIndex = rawDestination.indexOf(">");
    return endIndex === -1
      ? rawDestination.slice(1)
      : rawDestination.slice(1, endIndex);
  }

  const whitespaceIndex = rawDestination.search(/\s/);
  return whitespaceIndex === -1
    ? rawDestination
    : rawDestination.slice(0, whitespaceIndex);
}

function shouldSkipDestination(destination) {
  return (
    !destination ||
    destination.startsWith("#") ||
    /^[a-z][a-z\d+.-]*:/i.test(destination)
  );
}

function lineNumberForOffset(content, offset) {
  return content.slice(0, offset).split(/\r?\n/).length;
}

const failures = [];

for (const relativeFilePath of markdownFiles) {
  const absoluteFilePath = path.join(rootDir, relativeFilePath);
  const content = fs.readFileSync(absoluteFilePath, "utf8");
  const fileDirectory = path.dirname(absoluteFilePath);

  for (const link of extractMarkdownLinks(content)) {
    const destination = normalizeDestination(link.destination);
    if (shouldSkipDestination(destination)) continue;

    const pathWithoutHash = destination.split("#")[0].split("?")[0];
    const targetPath = path.resolve(
      destination.startsWith("/")
        ? rootDir
        : fileDirectory,
      destination.startsWith("/") ? pathWithoutHash.slice(1) : pathWithoutHash
    );

    if (!fs.existsSync(targetPath)) {
      failures.push(
        `${relativeFilePath}:${lineNumberForOffset(content, link.offset)} -> ${destination}`
      );
    }
  }
}

if (failures.length > 0) {
  console.error("Documentation link validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Documentation links resolve to existing local files.");
