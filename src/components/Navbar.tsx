"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Gamepad2, Trophy, BookOpen, Target, Zap, GraduationCap, Languages } from "lucide-react";

const navLinks = [
  { href: "/train", label: "Train", icon: GraduationCap, ariaLabel: "Word and Sentence Trainer" },
  { href: "/isl", label: "ISL", icon: Languages, ariaLabel: "Indian Sign Language Explorer" },
  { href: "/alphabet", label: "Learn", icon: BookOpen, ariaLabel: "Alphabet Explorer" },
  { href: "/quiz", label: "Quiz", icon: Target, ariaLabel: "Quiz Challenge" },
  { href: "/game", label: "Play", icon: Gamepad2, ariaLabel: "Free Play practice mode" },
  { href: "/scores", label: "Scores", icon: Trophy, ariaLabel: "Score Dashboard" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-violet-400 focus:rounded-lg"
            aria-label="SignQuest home page"
          >
            <div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow"
              role="img"
              aria-label="SignQuest logo"
            >
              <span className="text-lg" aria-hidden="true">🤟</span>
            </div>
            <span className="text-xl font-bold">
              <span className="bg-gradient-to-r from-violet-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Sign</span>
              <span className="text-gray-900 dark:text-white">Quest</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1" role="menubar">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-violet-400 ${
                  link.href === "/isl"
                    ? "text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-bold"
                    : "text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                }`}
                aria-label={link.ariaLabel}
              >
                <link.icon className="w-4 h-4" aria-hidden="true" />
                {link.label}
                {link.href === "/isl" && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold" aria-label="Indian Sign Language">
                    🇮🇳
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/train"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-sm font-semibold rounded-lg shadow-md shadow-violet-500/25 transition-all focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
              aria-label="Start training — go to Word and Sentence Trainer"
            >
              <Zap className="w-4 h-4" aria-hidden="true" />
              Start Training
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-800"
            role="menu"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 ${
                    link.href === "/isl"
                      ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 font-bold"
                      : "text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                  }`}
                  aria-label={link.ariaLabel}
                >
                  <link.icon className="w-4 h-4" aria-hidden="true" />
                  {link.label}
                  {link.href === "/isl" && <span aria-hidden="true">🇮🇳</span>}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
