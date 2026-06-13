import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forge Next.js Starter",
  description: "A lean Next.js starter for Forge Editor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
