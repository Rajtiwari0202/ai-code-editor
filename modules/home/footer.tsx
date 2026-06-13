import { Github } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-20 border-t bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>
          Copyright {new Date().getFullYear()} Forge Editor. Built for
          reviewable AI coding.
        </p>
        <Link
          href="https://github.com/Rajtiwari0202/ai-code-editor"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
        >
          <Github className="h-4 w-4" />
          Source on GitHub
        </Link>
      </div>
    </footer>
  );
}
