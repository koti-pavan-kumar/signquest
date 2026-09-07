"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Gamepad2,
  BookOpen,
  Trophy,
  Target,
  ArrowRight,
  Sparkles,
  Hand,
  Brain,
  Star,
  Zap,
  Languages,
} from "lucide-react";

import { GraduationCap } from "lucide-react";

const gameModes = [
  {
    icon: GraduationCap,
    title: "Word & Sentence Trainer",
    description: "Progress from simple words to full sentences. 28+ words and 10+ sentences across 3 difficulty levels.",
    href: "/train",
    color: "from-blue-500 to-indigo-600",
    badge: "Core",
  },
  {
    icon: Languages,
    title: "ISL Explorer",
    description: "Learn Indian Sign Language — 34 Devanagari letters, 35+ words, and cultural signs unique to India.",
    href: "/isl",
    color: "from-orange-500 to-amber-600",
    badge: "🇮🇳 ISL",
  },
  {
    icon: Target,
    title: "Quiz Challenge",
    description: "Test your skills! See a word, sign it, get scored by AI in real-time.",
    href: "/quiz",
    color: "from-pink-500 to-rose-600",
    badge: "Most Popular",
  },
  {
    icon: BookOpen,
    title: "Alphabet Explorer",
    description: "Learn each sign letter A-Z with animated guides, SVG illustrations, and live practice.",
    href: "/alphabet",
    color: "from-emerald-500 to-teal-600",
    badge: "Start Here",
  },
  {
    icon: Gamepad2,
    title: "Free Play",
    description: "Open practice mode — sign anything and get real-time AI feedback.",
    href: "/game",
    color: "from-violet-500 to-purple-600",
    badge: "Practice",
  },
];

const stats = [
  { value: "268M+", label: "Deaf & Hard of Hearing in India" },
  { value: "18M+", label: "ISL Users in India" },
  { value: "300+", label: "Sign Languages Worldwide" },
  { value: "#1", label: "Dual-Language Learning Game" },
];

const features = [
  { icon: Hand, title: "Real-Time Detection", desc: "AI detects your hand gestures via webcam instantly" },
  { icon: Brain, title: "Motion Detection", desc: "Custom engine tracks wave, circle, snap, and tap motions" },
  { icon: Languages, title: "ASL + ISL Support", desc: "Learn both American and Indian Sign Languages" },
  { icon: Zap, title: "Instant Feedback", desc: "Get corrected immediately with per-finger guidance" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-pink-500/10" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />
              Built for LUMINIX&apos;26 — Hack2Skills Problem Statement
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6"
            >
              Learn Sign Language
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Through Play
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 text-balance"
            >
              An AI-powered interactive game that teaches you{" "}
              <span className="font-semibold text-orange-500">ASL</span> and{" "}
              <span className="font-semibold text-orange-500">Indian Sign Language (ISL)</span>{" "}
              through quizzes, challenges, and real-time webcam feedback. No prior knowledge needed.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/train"
                className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl active:scale-95 group"
              >
                <Zap className="w-5 h-5" />
                Start Training Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/isl"
                className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all active:scale-95"
              >
                🇮🇳 Learn ISL
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Modes */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
              Choose Your <span className="bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">Game Mode</span>
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Five ways to learn. Both ASL and ISL. All powered by real-time AI hand detection.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gameModes.map((mode, i) => (
              <motion.div
                key={mode.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeInUp}
              >
                <Link href={mode.href} className="block feature-card group h-full">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mode.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <mode.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-violet-600 transition-colors">
                          {mode.title}
                        </h3>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                          {mode.badge}
                        </span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                        {mode.description}
                      </p>
                      <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-violet-600 dark:text-violet-400 group-hover:gap-2 transition-all">
                        Play now
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-gray-50 dark:bg-gray-950/50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
              Powered by <span className="bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">AI</span>
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Real computer vision running in your browser. Dual-language support. No server needed.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeInUp}
                className="p-6 rounded-2xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
              How It <span className="bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">Works</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Enable Camera", desc: "Grant webcam access — all processing happens locally in your browser." },
              { step: "02", title: "See the Challenge", desc: "A word or letter appears on screen. You have a few seconds to sign it." },
              { step: "03", title: "Get Scored", desc: "AI analyzes your hand shape AND motion pattern and gives instant feedback + points." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="text-5xl font-extrabold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent mb-2">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ISL Highlight Section */}
      <section className="section-padding bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-orange-500/10">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-5xl mb-4 block">🇮🇳</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
                Indian Sign Language (ISL)
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              India&apos;s native sign language, used by 18 million deaf and hard-of-hearing Indians.
              Learn Devanagari alphabet, common Hindi signs, and cultural gestures.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { title: "Devanagari Alphabet", desc: "10 vowels + 24 consonants in ISL fingerspelling", icon: "🔤" },
              { title: "35+ Common Words", desc: "Greetings, family, food, emotions, numbers, and places", icon: "📚" },
              { title: "Cultural Signs", desc: "Namaste, family terms, Indian food signs unique to ISL", icon: "🕉️" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeInUp}
                className="p-6 rounded-2xl bg-white dark:bg-gray-900/50 border border-orange-200 dark:border-orange-800 text-center"
              >
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/isl"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all active:scale-95"
            >
              🇮🇳 Start Learning ISL
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-gradient-to-r from-violet-600 to-purple-600">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
              Ready to Sign? 🤟
            </h2>
            <p className="text-lg text-violet-100 max-w-xl mx-auto mb-8">
              No downloads. No sign-ups. Just open your camera and start learning ASL or ISL in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/train"
                className="px-8 py-3.5 bg-white text-violet-700 font-bold rounded-xl shadow-xl hover:bg-violet-50 transition-all active:scale-95"
              >
                🎯 Start Training
              </Link>
              <Link
                href="/isl"
                className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl shadow-xl hover:from-orange-600 hover:to-amber-700 transition-all active:scale-95"
              >
                🇮🇳 Learn ISL
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
