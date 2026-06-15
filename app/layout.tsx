import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/providers/theme-providers";
import { Toaster } from "@/components/ui/sonner";
import { getSiteUrl } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: "Forge Editor",
  title: {
    default: "Forge Editor",
    template: "%s | Forge Editor",
  },
  description:
    "A browser-based AI code editor with Monaco, WebContainers, project templates, authentication, and server-side AI assistance.",
  keywords: [
    "AI code editor",
    "browser IDE",
    "Monaco Editor",
    "WebContainers",
    "Next.js",
    "developer tools",
  ],
  authors: [{ name: "Raj Tiwari" }],
  creator: "Raj Tiwari",
  publisher: "Forge Editor",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Forge Editor",
    description:
      "Create, edit, run, preview, and review projects from a browser-based AI code editor.",
    url: "/",
    siteName: "Forge Editor",
    type: "website",
    images: [
      {
        url: "/forge-editor-thumbnail.svg",
        width: 1660,
        height: 929,
        alt: "Forge Editor workspace preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Forge Editor",
    description:
      "A browser-based AI code editor with Monaco, WebContainers, and reviewable AI workflows.",
    images: ["/forge-editor-thumbnail.svg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen">
              <Toaster/>
    <div className="flex-1">
{children}
    </div>
            </div>
        
        </ThemeProvider>
      </body>
    </html>
    </SessionProvider>
  );
}
