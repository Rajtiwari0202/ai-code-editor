const sections = [
  {
    title: "Use of the product",
    body: "Forge Editor is provided as a coding workspace for creating, editing, running, and reviewing software projects. You are responsible for the code, commands, files, and credentials you bring into the workspace.",
  },
  {
    title: "AI assistance",
    body: "AI chat, completion, planning, and patch proposal features are assistive tools. Review generated suggestions before relying on them, and verify code behavior with your own tests and judgment.",
  },
  {
    title: "Accounts and access",
    body: "Authentication is used to associate playgrounds and saved project files with the signed-in user. Do not attempt to access projects that do not belong to your account.",
  },
  {
    title: "Availability",
    body: "The project may change as it evolves. Deployment hosts, model providers, databases, and browser runtimes can affect feature availability.",
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-[calc(100vh-8rem)] max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-[#E93F3F]">Legal</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-normal">
        Terms of Service
      </h1>
      <p className="mt-4 text-muted-foreground">
        These terms are a practical operating baseline for Forge Editor while
        the product is being prepared for public deployment.
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
