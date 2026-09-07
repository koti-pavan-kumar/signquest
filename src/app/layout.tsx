import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "SignQuest — Interactive Sign-Language Learning Game",
  description:
    "Learn ASL and ISL (Indian Sign Language) through an interactive AI-powered game. Real-time hand gesture detection, motion tracking, quizzes, levels, and progress tracking.",
  keywords: [
    "sign language",
    "ASL",
    "ISL",
    "Indian Sign Language",
    "accessibility",
    "AI",
    "game",
    "learning",
    "hand gesture",
    "LUMINIX",
    "hackathon",
    "Deaf community",
  ],
  openGraph: {
    title: "SignQuest — Interactive Sign-Language Learning Game",
    description:
      "Learn ASL and ISL through an interactive AI-powered game with real-time webcam gesture detection.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f0a1e" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased">
        {/* Skip to main content — WCAG 2.4.1 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
