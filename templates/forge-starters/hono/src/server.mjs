import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/api/health", (context) =>
  context.json({
    status: "ok",
    service: "forge-hono-starter",
    timestamp: new Date().toISOString(),
  })
);

app.get("/", (context) =>
  context.html(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Forge Hono Starter</title>
    <style>
      :root {
        color: #182235;
        background: #f7f7f2;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      body {
        margin: 0;
      }

      main {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 32px;
        box-sizing: border-box;
      }

      section {
        width: min(740px, 100%);
      }

      .eyebrow {
        color: #805400;
        font-weight: 800;
        text-transform: uppercase;
        font-size: 0.82rem;
      }

      h1 {
        margin: 0;
        color: #111827;
        font-size: clamp(2.2rem, 7vw, 5rem);
        line-height: 0.98;
        letter-spacing: 0;
      }

      p {
        color: #4b5d73;
        font-size: 1.08rem;
        line-height: 1.7;
      }

      code {
        border: 1px solid #d9d6c6;
        border-radius: 6px;
        background: #ffffff;
        padding: 3px 6px;
      }
    </style>
  </head>
  <body>
    <main>
      <section>
        <p class="eyebrow">Hono API</p>
        <h1>A tiny edge-style API starter.</h1>
        <p>Edit <code>src/server.mjs</code> and check <code>/api/health</code> while the WebContainer server is running.</p>
      </section>
    </main>
  </body>
</html>`)
);

const port = Number(process.env.PORT ?? 3000);

serve({
  fetch: app.fetch,
  port,
  hostname: "0.0.0.0",
});

console.log(`Hono starter ready on http://localhost:${port}`);
