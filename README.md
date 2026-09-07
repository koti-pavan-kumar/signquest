# SignQuest — AI-Powered Sign-Language Learning Game

> Learn Sign Language Through Play — Real-Time Gesture Detection, Motion Tracking, Gamified Progress

Built for **LUMINIX'26** on Hack2Skills
Problem Statement: **Sign-Language Learning Game**

---

## Problem Statement

The global deaf community numbers **70 million+**, with **268 million** hearing-impaired individuals in India alone (WHO, 2023). Learning sign language is essential for communication, but traditional methods are:

- **Expensive**: In-person classes and certified tutors are prohibitively costly
- **Inaccessible**: No practice partners available outside classrooms
- **Boring**: Textbook-based learning with completion rates below 15%
- **No Feedback**: Existing apps show videos but never check if you're signing correctly

**SignQuest** solves this with an AI-powered interactive game that uses your webcam to detect hand gestures in real-time, validate your signs against ASL patterns, track your motion over time, and score your accuracy through gamified levels.

---

## Features

### Word & Sentence Trainer (`/train`)
- **28 words** and **10 sentences** organized across 3 difficulty levels
- Level 1 (Basic): Hello, Yes, No, Please, Thank You, Good, Bad, Help, Water, Eat, Drink, Sorry
- Level 2 (Intermediate): Friend, Love, Family, School, Learn, Time, Want, Play, Name, Where
- Level 3 (Advanced): Hospital, Emergency, Bathroom, Medicine, Danger, Paper
- SVG gesture reference illustrations for every letter in finger-spell breakdowns
- Real-time camera practice with AI validation
- Session XP tracking with difficulty multipliers (1x, 2x, 3x)

### Alphabet Explorer (`/alphabet`)
- All 26 ASL letters A-Z with detailed handshape descriptions
- Step-by-step numbered instructions for each letter
- SVG gesture reference illustrations showing correct hand position
- Live webcam practice with MediaPipe hand landmark detection
- AI validation with specific per-finger corrective feedback
- Progress tracking with localStorage persistence

### Quiz Challenge (`/quiz`)
- 20 words across 3 difficulty levels (Easy, Medium, Hard)
- **Dual validation**: static handshape + motion pattern detection
- Timed questions with streak bonuses and XP rewards
- Real-time "Expected vs Detected" comparison panel
- Constructive feedback showing which fingers to adjust
- Full quiz history saved to localStorage

### Free Play (`/game`)
- Open practice mode with real-time gesture classification
- 8 gesture types detected: fist, open palm, peace, L, Y, and more
- Session history with gesture recording
- Landmark overlay visualization on camera feed

### Score Dashboard (`/scores`)
- Real data from localStorage (no mock data)
- XP-based leveling system (100 XP per level)
- Weekly activity chart showing actual quiz scores per day
- Learning progress bars for Alphabet (26), Words (28), Sentences (10)
- 10 dynamic achievements computed from real progress
- Reset progress with confirmation dialog

---

## Technical Architecture

```
+--------------------------------------------------+
|              PRESENTATION LAYER                   |
|  Next.js 14 . TypeScript . TailwindCSS           |
|  Framer Motion . Responsive (Mobile + Desktop)   |
+--------------------------------------------------+
|           AI / ML LAYER (Client-Side)             |
|  MediaPipe Hands -- 21-Landmark Hand Detection   |
|  Custom Gesture Classifier -- Finger State Engine |
|  ASL Reference Pattern Library -- 17 Letters      |
+--------------------------------------------------+
|           MOTION DETECTION LAYER                  |
|  MotionTracker -- 2s sliding window               |
|  Velocity/Oscillation/Circularity Analysis        |
|  20 Motion Signatures for Dynamic Signs           |
+--------------------------------------------------+
|              LEARNING ENGINE                      |
|  Tiered Curriculum (3 levels)                     |
|  Word & Sentence Data (28 + 10 entries)           |
|  SVG Gesture Reference Illustrations              |
+--------------------------------------------------+
|              GAME ENGINE                          |
|  Quiz System (3 tiers, timer, scoring, streaks)   |
|  XP Progression, 10 Achievements                  |
|  localStorage Persistence Layer                   |
+--------------------------------------------------+
|              DEPLOYMENT                           |
|  Vercel (static export, zero server cost)         |
|  Zero data transmission -- 100% client-side       |
+--------------------------------------------------+
```

---

## Motion Detection System

The key technical differentiator is **motion detection** — the system doesn't just check static handshapes, it tracks hand movement over time to validate dynamic signs.

| Motion Type | What It Detects | Signs |
|---|---|---|
| wave | Horizontal oscillation (2+ direction changes) | Hello, Play |
| snap | Very fast downward motion | No |
| circle | Circular trajectory path | Sorry, Please, Family |
| forward | Forward/backward motion | Thank You, Good, Drink, Want |
| downward | Falling motion | Bad |
| sideways | Single lateral sweep | School |
| upward | Rising motion | Help, Learn |
| tap | Repeated short bursts | Water, Time, Eat, Yes |
| stationary | No significant movement | Love, Friend |

Combined scoring: **60% static handshape + 40% motion pattern**

---

## Persistence Layer

All user progress is saved to localStorage under the key `signquest_progress`:

| Data | What It Tracks |
|---|---|
| learnedLetters | Which of the 26 letters have been mastered |
| learnedWords | Which words from the 28-word vocabulary |
| practicedSentences | Which sentences from the 10-sentence set |
| quizResults | Each quiz attempt: word, score, correct, difficulty, timestamp |
| totalXP / level | Cumulative XP and computed level (100 XP per level) |
| bestStreak | Longest correct streak across all quizzes |
| daysActive | Unique dates the user has played |
| totalGestures | Total gestures recorded in Free Play |

---

## 10 Dynamic Achievements

| Badge | Requirement |
|---|---|
| First Quiz | Complete your first quiz |
| Hot Streak | Get 5 correct in a row |
| Halfway There | Learn 13 letters |
| Quiz Master | Score 90%+ on a quiz |
| All Letters | Learn all 26 letters |
| Century | Record 100 gestures |
| Big Brain | Reach level 5 |
| Word Master | Learn 10 words |
| Dedicated | Play on 3 different days |
| Quiz Veteran | Complete 5 quizzes |

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 14 + React 18 | SSR, static export, component architecture |
| Language | TypeScript | Type safety, maintainability |
| Styling | TailwindCSS + Framer Motion | Rapid prototyping, responsive, animations |
| Hand Detection | MediaPipe Hands (Google) | Industry-standard, 21-landmark, in-browser |
| Gesture Classification | Custom TypeScript classifier | Zero-dependency, deterministic, low-latency |
| Motion Detection | Custom motion tracking engine | Velocity, oscillation, circularity analysis |
| Speech | Web Speech API | Native browser TTS for audio pronunciation |
| Persistence | localStorage | Zero-cost, instant, no server needed |
| Deployment | Vercel (Static) | Zero-cost hosting, CI/CD, global CDN |

---

## Project Structure

```
signquest/
  src/
    app/
      layout.tsx              # Root layout with dark mode
      page.tsx                # Landing page (hero, stats, features)
      globals.css             # Global styles and glass-card utilities
      alphabet/page.tsx       # Alphabet Explorer (26 letters, SVGs, camera)
      quiz/page.tsx           # Quiz Challenge (20 words, 3 levels, motion)
      train/page.tsx          # Word & Sentence Trainer (28 words, 10 sentences)
      game/page.tsx           # Free Play (open practice, gesture detection)
      scores/page.tsx         # Score Dashboard (real data, achievements)
      sign-language/page.tsx  # Sign Reference (quick lookup + camera)
    components/
      Navbar.tsx              # Navigation with active state
      Footer.tsx              # Footer with links
    lib/
      gesture-detection.ts    # 21-landmark hand analysis, finger states
      asl-patterns.ts         # ASL letter reference patterns (17 letters)
      word-data.ts            # Word and sentence training data
      word-gesture-map.ts     # Word-to-gesture validation mapping
      gesture-illustrations.tsx  # SVG hand gesture diagrams (A-Z + words)
      motion-tracking.ts      # Motion detection engine (velocity, trajectory)
      persistence.ts          # localStorage persistence layer
  package.json
  tailwind.config.ts
  tsconfig.json
  next.config.js
  postcss.config.js
```

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/signquest.git
cd signquest

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3000

**Requirements:**
- A webcam (for gesture detection)
- A modern browser (Chrome, Edge, Firefox, Safari)
- HTTPS is required for camera access in production

---

## How It Works

1. **Enable Camera** -- Grant webcam access. All processing happens locally in your browser.
2. **Learn or Quiz** -- Choose Alphabet Explorer, Word Trainer, or Quiz Challenge.
3. **Sign the Word** -- The AI detects your hand via MediaPipe (21 landmarks) and classifies your gesture.
4. **Motion Validation** -- For dynamic signs, the system tracks your hand movement over 2 seconds and validates the motion pattern (wave, circle, snap, etc.).
5. **Get Feedback** -- Receive specific per-finger corrections or confirmation of correct signing.
6. **Track Progress** -- Earn XP, level up, unlock achievements, and see your weekly activity.

---

## Impact Metrics

| Metric | Value |
|---|---|
| Target Users | 70M+ deaf community globally, 268M hearing-impaired in India |
| Word Vocabulary | 28 words + 10 sentences across 3 difficulty levels |
| Alphabet Coverage | All 26 ASL letters with SVG references |
| Gesture Recognition | 17 ASL letters + 20 word gestures + 9 motion types |
| Achievements | 10 unlockable badges |
| Server Cost | INR 0 (all client-side processing) |
| Privacy | 100% -- no data leaves the browser |

---

## Why This Wins

1. **Solves a Real Problem**: 70M+ deaf people need accessible sign language learning
2. **Motion Detection**: Not just static poses -- validates dynamic signs like Hello (wave) and Sorry (circle)
3. **Interactive Demo**: Live webcam gesture detection with instant feedback = instant "wow" factor
4. **Structured Curriculum**: Letters, words, sentences across 3 difficulty levels
5. **Gamification**: XP, levels, streaks, 10 achievements = sticky and engaging
6. **Privacy-First**: All AI runs in the browser -- zero data collection, zero server cost
7. **Technical Depth**: Computer vision + motion tracking + gesture classification + real-time processing

---

**Built for**: LUMINIX'26 -- Hack2Skills
**Problem Statement**: Sign-Language Learning Game
**Tech**: AI x Computer Vision x Motion Detection x Gamification x Accessibility
