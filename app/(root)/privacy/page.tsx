const sections = [
  {
    title: "Account data",
    body: "Forge Editor stores account profile data provided by OAuth providers, such as name, email address, avatar URL, provider account identifiers, and session metadata needed for sign-in.",
  },
  {
    title: "Project data",
    body: "Playground titles, descriptions, template choices, favorites, and saved template file content are stored so authenticated users can return to their work.",
  },
  {
    title: "AI requests",
    body: "AI routes send prompts and selected coding context to the configured server-side model provider. Do not include secrets or sensitive data in prompts or project files used as AI context.",
  },
  {
    title: "Operational data",
    body: "Deployment hosts may collect logs, request metadata, and error traces. Keep OAuth secrets, database URLs, and provider credentials in server-side environment variables only.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-[calc(100vh-8rem)] max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-[#E93F3F]">Legal</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-normal">
        Privacy Policy
      </h1>
      <p className="mt-4 text-muted-foreground">
        This page documents what the current Forge Editor implementation is
        designed to store and process.
      </p>

      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
