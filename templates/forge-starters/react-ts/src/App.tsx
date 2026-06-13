import "./styles.css";

const files = ["src/App.tsx", "src/main.tsx", "src/styles.css"];

export default function App() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">React + TypeScript</p>
        <h1>Build inside Forge Editor.</h1>
        <p className="lede">
          This starter is intentionally small: edit a component, watch preview
          refresh, and grow the project from a clean base.
        </p>
        <div className="actions">
          <a href="https://react.dev" target="_blank">
            React docs
          </a>
          <span>Ready for WebContainers</span>
        </div>
      </section>

      <section className="panel" aria-label="Project files">
        {files.map((file) => (
          <div key={file} className="file-row">
            <span>{file}</span>
            <strong>tracked</strong>
          </div>
        ))}
      </section>
    </main>
  );
}
