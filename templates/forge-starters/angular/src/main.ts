import { Component } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <main class="shell">
      <section>
        <p class="eyebrow">Angular standalone</p>
        <h1>Structure-first Angular in Forge Editor.</h1>
        <p class="lede">
          This starter uses Angular standalone components and the CLI dev server
          so the browser preview can boot from a familiar setup.
        </p>
      </section>

      <section class="panel" aria-label="Starter files">
        <article>src/main.ts</article>
        <article>src/styles.css</article>
        <article>angular.json</article>
      </section>
    </main>
  `,
})
class AppComponent {}

bootstrapApplication(AppComponent).catch((error) => console.error(error));
