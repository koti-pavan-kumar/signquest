"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🤟</span>
              <span className="text-lg font-bold">
                <span className="bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">Sign</span>Quest
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              An interactive sign-language learning game powered by AI.
              Real-time gesture detection, quizzes, and progress tracking.
              Built for LUMINIX&apos;26.
            </p>
          </div>

          {/* Game Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Game Modes
            </h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/quiz" className="hover:text-violet-600 transition-colors">🎯 Quiz Challenge</Link></li>
              <li><Link href="/alphabet" className="hover:text-violet-600 transition-colors">⌨️ Sign Keyboard</Link></li>
              <li><Link href="/game" className="hover:text-violet-600 transition-colors">🎮 Free Play</Link></li>
              <li><Link href="/scores" className="hover:text-violet-600 transition-colors">🏆 Score Dashboard</Link></li>
            </ul>
          </div>

          {/* Tech */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Built With
            </h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>Next.js 14 + TypeScript</li>
              <li>MediaPipe Hands + TensorFlow.js</li>
              <li>TailwindCSS + Framer Motion</li>
              <li>Web Speech API</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for LUMINIX&apos;26
          </p>
          <p className="text-xs text-gray-400">
            © 2026 SignQuest. Open source under MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
}
