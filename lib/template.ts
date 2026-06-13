export const templatePaths = {
  REACT: "templates/forge-starters/react-ts",
  NEXTJS: "templates/forge-starters/nextjs",
  EXPRESS: "templates/forge-starters/express",
  VUE: "templates/forge-starters/vue",
  HONO: "templates/forge-starters/hono",
  ANGULAR: "templates/forge-starters/angular",
} as const;

export type TemplateKey = keyof typeof templatePaths;
