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
} from "lucide-react";

import { GraduationCap } from "lucide-react";

const gameModes = [
  {
    icon: GraduationCap,
    title: "Word & Sentence Trainer",
    description: "Progress from simple words to full sentences. 20+ words and 10+ sentences across 3 difficulty levels.",
    href: "/train",
    color: "from-blue-500 to-indigo-600",
    badge: "NEW",
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
    description: "Learn each sign letter A-Z with animated guides and live practice.",
    href: "/alphabet",
    color: "from-emerald-500 to-teal-600",
    badge: "Start Here",
  },
  {
    icon: Gamepad2,
    title: "Free Play",
    description: "Open practice mode — sign anything and get real-time feedback.",
    href: "/game",
    color: "from-violet-500 to-purple-600",
    badge: "Practice",
  },
];

const stats = [
  { value: "268M+", label: "Deaf & Hard of Hearing in India" },
  { value: "300+", label: "Sign Languages Worldwide" },
  { value: "70M+", label: "Global Deaf Community" },
  { value: "#1", label: "Accessible Learning Game" },
];

const features = [
  { icon: Hand, title: "Real-Time Detection", desc: "AI detects your hand gestures via webcam instantly" },
  { icon: Brain, title: "AI-Powered Scoring", desc: "Machine learning evaluates your sign accuracy" },
  { icon: Star, title: "30+ Words & Sentences", desc: "Structured curriculum from letters to full sentences" },
  { icon: Zap, title: "Instant Feedback", desc: "Get corrected immediately — learn faster" },
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
              An AI-powered interactive game that teaches you sign language
              through quizzes, challenges, and real-time webcam feedback.
              No prior knowledge needed.
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
                href="/alphabet"
                className="px-8 py-3.5 border-2 border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 font-semibold rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all active:scale-95"
              >
                Learn the Alphabet
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
              Four ways to learn. All powered by real-time AI hand detection.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gameModes.map((mode, i) => (
              <motion.div
                key={mode.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeInUp}
              >
                <Link href={mode.href} className="block feature-card group">
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
              Real computer vision running in your browser. No server needed.
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
              { step: "03", title: "Get Scored", desc: "AI analyzes your hand shape and gives instant accuracy feedback + points." },
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
              No downloads. No sign-ups. Just open your camera and start learning sign language in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/train"
                className="px-8 py-3.5 bg-white text-violet-700 font-bold rounded-xl shadow-xl hover:bg-violet-50 transition-all active:scale-95"
              >
                🎯 Start Training
              </Link>
              <Link
                href="/alphabet"
                className="px-8 py-3.5 border-2 border-white/40 text-white font-bold rounded-xl hover:bg-white/10 transition-all active:scale-95"
              >
                📖 Learn the Alphabet
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
