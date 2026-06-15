import type { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">{children}</main>
  );
};

export default AuthLayout;
