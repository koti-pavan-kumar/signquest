"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Target,
  Zap,
  BookOpen,
  Star,
  TrendingUp,
  Calendar,
  Award,
  RotateCcw,
} from "lucide-react";
import {
  getDashboardStats,
  getAchievements,
  resetProgress,
  loadProgress,
} from "@/lib/persistence";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
};

export default function ScoresPage() {
  const [stats, setStats] = useState<ReturnType<typeof getDashboardStats> | null>(null);
  const [achievements, setAchievements] = useState<ReturnType<typeof getAchievements>>([]);
  const [showReset, setShowReset] = useState(false);

  // Load data on mount and when window gains focus
  useEffect(() => {
    const load = () => {
      setStats(getDashboardStats());
      setAchievements(getAchievements());
    };
    load();
    window.addEventListener("focus", load);
    return () => window.removeEventListener("focus", load);
  }, []);

  const handleReset = () => {
    resetProgress();
    setStats(getDashboardStats());
    setAchievements(getAchievements());
    setShowReset(false);
  };

  if (!stats) return null;

  const maxScore = Math.max(...stats.weeklyData.map((d) => d.score), 1);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/25">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            Score <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Track your real progress, streaks, and achievements.</p>
        </motion.div>

        {/* Level & XP */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Current Level</h3>
              <div className="text-4xl font-extrabold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                Level {stats.level}
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-semibold text-gray-500">Total XP</h3>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalXP.toLocaleString()}</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all"
              style={{ width: `${Math.min(100, ((stats.totalXP % 100) / 100) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{100 - (stats.totalXP % 100)} XP to Level {stats.level + 1}</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Target, label: "Quizzes Done", value: stats.totalAttempts, color: "text-pink-500" },
            { icon: Zap, label: "Best Streak", value: stats.bestStreak, color: "text-violet-500" },
            { icon: BookOpen, label: "Letters Learned", value: `${stats.lettersLearned}/26`, color: "text-emerald-500" },
            { icon: TrendingUp, label: "Accuracy", value: `${stats.accuracy}%`, color: "text-blue-500" },
            { icon: Star, label: "Total Gestures", value: stats.totalGestures, color: "text-amber-500" },
            { icon: Calendar, label: "Days Active", value: stats.daysActive, color: "text-cyan-500" },
            { icon: Award, label: "Words Learned", value: stats.wordsLearned, color: "text-orange-500" },
            { icon: Trophy, label: "Level", value: stats.level, color: "text-purple-500" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeInUp}
              className="p-4 rounded-2xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Weekly Activity Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Weekly Activity</h3>
          {stats.weeklyData.every((d) => d.score === 0) ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No activity yet. Start a quiz to see your weekly progress!</p>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-2 h-40">
              {stats.weeklyData.map((day) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{day.score}</span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-amber-500 to-orange-400 transition-all"
                    style={{ height: `${maxScore > 0 ? (day.score / maxScore) * 100 : 0}%`, minHeight: day.score > 0 ? "4px" : "0" }}
                  />
                  <span className="text-xs text-gray-400">{day.day}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Achievements */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Achievements ({unlockedCount}/{achievements.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-4 rounded-xl text-center transition-all ${
                  ach.unlocked
                    ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                    : "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 opacity-50"
                }`}
              >
                <div className="text-3xl mb-2">{ach.emoji}</div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{ach.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{ach.description}</p>
                {!ach.unlocked && <p className="text-xs text-gray-400 mt-2 italic">Locked</p>}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Detailed Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Learning Progress</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Alphabet</p>
              <p className="text-3xl font-extrabold text-emerald-600">{stats.lettersLearned}/26</p>
              <div className="w-full bg-emerald-200 dark:bg-emerald-800 rounded-full h-2 mt-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(stats.lettersLearned / 26) * 100}%` }} />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Words</p>
              <p className="text-3xl font-extrabold text-blue-600">{stats.wordsLearned}</p>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mt-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, (stats.wordsLearned / 28) * 100)}%` }} />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
              <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">Sentences</p>
              <p className="text-3xl font-extrabold text-violet-600">{stats.sentencesPracticed}</p>
              <div className="w-full bg-violet-200 dark:bg-violet-800 rounded-full h-2 mt-2">
                <div className="bg-violet-500 h-2 rounded-full" style={{ width: `${Math.min(100, (stats.sentencesPracticed / 10) * 100)}%` }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reset Button */}
        <div className="text-center">
          {!showReset ? (
            <button
              onClick={() => setShowReset(true)}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              <RotateCcw className="w-3 h-3 inline mr-1" />
              Reset all progress
            </button>
          ) : (
            <div className="inline-flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <span className="text-sm text-red-600">Are you sure? This cannot be undone.</span>
              <button
                onClick={handleReset}
                className="px-4 py-1.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowReset(false)}
                className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
