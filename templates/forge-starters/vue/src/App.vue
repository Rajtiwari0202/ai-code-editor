<script setup lang="ts">
const tasks = [
  "Edit src/App.vue",
  "Create components in src",
  "Use preview for feedback",
];
</script>

<template>
  <main class="shell">
    <section class="hero">
      <p class="eyebrow">Vue + TypeScript</p>
      <h1>A calm base for reactive interfaces.</h1>
      <p class="lede">
        This starter keeps the first screen clean so you can quickly shape it
        into a dashboard, tool, or prototype.
      </p>
    </section>

    <section class="panel" aria-label="Starter tasks">
      <article v-for="task in tasks" :key="task">
        <span>{{ task }}</span>
      </article>
    </section>
  </main>
</template>
