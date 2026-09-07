import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "SignQuest — Interactive Sign-Language Learning Game",
  description:
    "Learn sign language through an interactive AI-powered game. Real-time hand gesture detection, quizzes, levels, and progress tracking.",
  keywords: [
    "sign language",
    "accessibility",
    "AI",
    "game",
    "learning",
    "hand gesture",
    "LUMINIX",
    "hackathon",
  ],
  openGraph: {
    title: "SignQuest — Interactive Sign-Language Learning Game",
    description:
      "Learn sign language through an interactive AI-powered game.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
