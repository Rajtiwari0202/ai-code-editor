const steps = [
  "Edit app/page.tsx",
  "Add routes in the app directory",
  "Preview changes in WebContainers",
];

export default function Home() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Next.js App Router</p>
        <h1>A focused starter for full-stack ideas.</h1>
        <p>
          Forge Editor gives this project a browser runtime, a file tree, and a
          Monaco workspace so you can iterate without leaving the editor.
        </p>
      </section>

      <section className="steps" aria-label="Next steps">
        {steps.map((step, index) => (
          <article key={step}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{step}</h2>
          </article>
        ))}
      </section>
    </main>
  );
}
