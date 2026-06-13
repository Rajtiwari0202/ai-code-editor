import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "forge-express-starter",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (_request, response) => {
  response.type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Forge Express Starter</title>
    <style>
      :root {
        color: #182235;
        background: #f4f8fb;
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
        width: min(720px, 100%);
      }

      p:first-child {
        color: #0b7a75;
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
        border: 1px solid #d7e2ee;
        border-radius: 6px;
        background: #ffffff;
        padding: 3px 6px;
      }
    </style>
  </head>
  <body>
    <main>
      <section>
        <p>Express API</p>
        <h1>Your server is running in Forge Editor.</h1>
        <p>Edit <code>src/server.mjs</code>, add routes, and use <code>/api/health</code> to verify the API path.</p>
      </section>
    </main>
  </body>
</html>`);
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Express starter ready on http://localhost:${port}`);
});
