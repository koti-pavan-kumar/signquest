# SignQuest — AI-Powered Sign-Language Learning Game

> Learn Sign Language Through Play — Real-Time Gesture Detection, Motion Tracking, Dual-Language (ASL + ISL), Gamified Progress

Built for **LUMINIX'26** on Hack2Skills
Problem Statement: **Sign-Language Learning Game**

---

## Problem Statement

The global deaf community numbers **70 million+**, with **268 million** hearing-impaired individuals in India alone (WHO, 2023). India's deaf community uses **Indian Sign Language (ISL)**, yet most sign language apps teach only ASL (American). Learning sign language is essential for communication, but traditional methods are:

- **Expensive**: In-person classes and certified tutors are prohibitively costly
- **Inaccessible**: No practice partners available outside classrooms
- **Boring**: Textbook-based learning with completion rates below 15%
- **No Feedback**: Existing apps show videos but never check if you're signing correctly
- **ASL-Only**: No app teaches ISL, leaving 18 million Indian deaf users without localized support

**SignQuest** solves this with an AI-powered interactive game that teaches both **ASL and ISL**, uses your webcam to detect hand gestures in real-time, validates your signs with motion tracking, and scores your accuracy through gamified levels.

---

## Features

### 🇮🇳 ISL Explorer (`/isl`)
- **34 Devanagari letters**: 10 vowels (अ-औ) + 24 consonants (क-ह) in ISL fingerspelling
- **35+ ISL words** across 9 categories: Greetings, Polite, Essential, Family, Food, Numbers, Emotions, Actions, Places
- **Cultural signs**: Namaste, Mother/Father (chin/forehead distinction), Rice, Milk, Indian food signs
- **Hindi pronunciation**: Web Speech API with `hi-IN` locale for audio feedback
- **SVG hand illustrations**: Every letter and word has a visual gesture reference
- **Camera practice**: Real-time MediaPipe validation for ISL hand shapes
- **Quick reference grid**: All vowels, consonants, and common words at a glance

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
- **Dual-language support**: Choose ASL or ISL before each quiz
- **ASL Quiz**: 20 words across 3 difficulty levels
- **ISL Quiz**: 31 Hindi words with Devanagari display and Hindi audio
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
|  ASL Pattern Library -- 17 Letters                |
|  ISL Pattern Library -- 34 Devanagari Letters     |
+--------------------------------------------------+
|           MOTION DETECTION LAYER                  |
|  MotionTracker -- 2s sliding window               |
|  Velocity/Oscillation/Circularity Analysis        |
|  20 Motion Signatures for Dynamic Signs           |
+--------------------------------------------------+
|              LEARNING ENGINE                      |
|  Tiered Curriculum (3 levels)                     |
|  ASL: 28 words + 10 sentences                    |
|  ISL: 35+ words across 9 categories              |
|  SVG Gesture Reference Illustrations              |
+--------------------------------------------------+
|              GAME ENGINE                          |
|  Dual-Language Quiz (ASL + ISL)                   |
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

## ISL (Indian Sign Language) Module

The ISL module is the key differentiator for the Indian hackathon audience. India has **18 million** ISL users, yet no learning app teaches ISL with real-time AI feedback.

### Devanagari Alphabet in ISL

| Vowels (स्वर) | Handshape | Consonants (व्यंजन) | Handshape |
|---|---|---|---|
| अ (a) | Fist + thumb side | क (ka) | 3 fingers spread |
| आ (aa) | L shape | ख (kha) | Pinch shape |
| इ (i) | Index up | ग (ga) | Index up |
| ई (ee) | V shape | घ (gha) | V shape |
| उ (u) | 2 fingers together | च (cha) | Pinky up |
| ऊ (oo) | Rock sign | छ (cha) | Middle up |
| ए (e) | 3 fingers | ज (ja) | 3 fingers up |
| ऐ (ai) | 4 fingers | ट (ta) | Thumb up |
| ओ (o) | Flat hand | ड (da) | Thumb + index |
| औ (au) | Open hand | ढ (dha) | 4 fingers up |
| | | त (ta) | 2 fingers together |
| | | द (da) | Phone gesture |
| | | न (na) | Tight fist |
| | | प (pa) | Flat hand |
| | | फ (pha) | Open hand spread |
| | | ब (ba) | 4 fingers up |
| | | म (ma) | Fist + thumb side |
| | | य (ya) | Y shape |
| | | र (ra) | Index sideways |
| | | ल (la) | 3 fingers |
| | | व (va) | Thumbs up |
| | | श (sha) | Pinch |
| | | स (sa) | Very tight fist |
| | | ह (ha) | 3 fingers spread |

### ISL Vocabulary Categories

| Category | Words | Hindi |
|---|---|---|
| Greetings | Namaste, Good Morning, Good Night, How are you | नमस्ते, सुप्रभात, शुभ रात्रि, आप कैसे हैं |
| Polite | Thank You, Please, Sorry | धन्यवाद, कृपया, माफ़ कीजिए |
| Essential | Yes, No, Help | हाँ, नहीं, मदद |
| Family | Mother, Father, Brother, Sister, Family, Friend | माँ, पापा, भाई, बहन, परिवार, दोस्त |
| Food & Drink | Rice, Water, Eat, Drink, Milk | चावल, पानी, खाना, पीना, दूध |
| Numbers | 1-Ek, 2-Do, 3-Teen, 5-Paanch | एक, दो, तीन, पाँच |
| Emotions | Happy, Sad, Love, Angry | खुश, उदास, प्यार, गुस्सा |
| Actions | Come, Go, Stop, Know, Don't Know, Name | आओ, जाओ, रुको, पता, नहीं पता, नाम |
| Places | School, Home, Hospital | विद्यालय, घर, अस्पताल |

### ISL Cultural Differentiators

- **Chin = Female, Forehead = Male**: Mother touches chin, Father touches forehead
- **Namaste**: Universal Indian greeting (prayer position)
- **Food signs**: Rice (bunched fingertips), Milk (milking motion) — unique to Indian culture
- **Hindi audio**: Web Speech API with `hi-IN` locale for pronunciation practice

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
| learnedLetters | Which of the 26 ASL letters + 34 ISL letters have been mastered |
| learnedWords | Which words from the ASL (28) and ISL (35+) vocabulary |
| practicedSentences | Which sentences from the 10-sentence set |
| quizResults | Each quiz attempt: word, score, correct, difficulty, language, timestamp |
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
| ISL Support | Custom ISL pattern library | 34 Devanagari letters, 35+ words, cultural signs |
| Speech | Web Speech API | Native browser TTS for English + Hindi audio |
| Persistence | localStorage | Zero-cost, instant, no server needed |
| Deployment | Vercel (Static) | Zero-cost hosting, CI/CD, global CDN |

---

## Project Structure

```
signquest/
  src/
    app/
      layout.tsx              # Root layout with dark mode
      page.tsx                # Landing page (hero, stats, ISL highlight)
      globals.css             # Global styles and glass-card utilities
      alphabet/page.tsx       # ASL Alphabet Explorer (26 letters, SVGs, camera)
      quiz/page.tsx           # Dual-Language Quiz (ASL + ISL, 51 words, motion)
      train/page.tsx          # Word & Sentence Trainer (28 words, 10 sentences)
      game/page.tsx           # Free Play (open practice, gesture detection)
      scores/page.tsx         # Score Dashboard (real data, achievements)
      isl/page.tsx            # ISL Explorer (34 letters, 35+ words, 9 categories)
      sign-language/page.tsx  # Sign Reference (quick lookup + camera)
    components/
      Navbar.tsx              # Navigation with ASL/ISL links
      Footer.tsx              # Footer with links
    hooks/
      useCamera.tsx           # Shared camera hook (5 states, error handling)
    lib/
      gesture-detection.ts    # 21-landmark hand analysis, finger states
      asl-patterns.ts         # ASL letter reference patterns (17 letters)
      isl-patterns.ts         # ISL patterns (34 Devanagari letters + 35 words)
      word-data.ts            # Word and sentence training data
      word-gesture-map.ts     # Word-to-gesture validation mapping
      gesture-illustrations.tsx  # ASL SVG hand gesture diagrams (A-Z + words)
      isl-illustrations.tsx   # ISL SVG hand diagrams (Devanagari + words)
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

1. **Enable Camera** — Grant webcam access. All processing happens locally in your browser.
2. **Choose Language** — Select ASL or ISL for the quiz, or explore the ISL module directly.
3. **Learn or Quiz** — Choose Alphabet Explorer, Word Trainer, ISL Explorer, or Quiz Challenge.
4. **Sign the Word** — The AI detects your hand via MediaPipe (21 landmarks) and classifies your gesture.
5. **Motion Validation** — For dynamic signs, the system tracks your hand movement over 2 seconds and validates the motion pattern (wave, circle, snap, etc.).
6. **Get Feedback** — Receive specific per-finger corrections or confirmation of correct signing.
7. **Track Progress** — Earn XP, level up, unlock achievements, and see your weekly activity.

---

## Impact Metrics

| Metric | Value |
|---|---|
| Target Users | 70M+ deaf community globally, 268M hearing-impaired in India |
| ASL Vocabulary | 28 words + 10 sentences across 3 difficulty levels |
| ISL Vocabulary | 35+ words across 9 categories + 34 Devanagari letters |
| Alphabet Coverage | 26 ASL letters + 34 ISL Devanagari letters |
| Gesture Recognition | 17 ASL letters + 34 ISL letters + 55+ word gestures + 9 motion types |
| Achievements | 10 unlockable badges |
| Server Cost | INR 0 (all client-side processing) |
| Privacy | 100% — no data leaves the browser |

---

## Why This Wins

1. **Solves a Real Problem**: 70M+ deaf people need accessible sign language learning
2. **Dual-Language**: Only app teaching both ASL and ISL with AI feedback
3. **ISL for India**: 18M Indian ISL users have no localized learning tool — until now
4. **Motion Detection**: Not just static poses — validates dynamic signs like Hello (wave) and Sorry (circle)
5. **Interactive Demo**: Live webcam gesture detection with instant feedback = instant "wow" factor
6. **Structured Curriculum**: Letters, words, sentences across 3 difficulty levels in both languages
7. **Gamification**: XP, levels, streaks, 10 achievements = sticky and engaging
8. **Privacy-First**: All AI runs in the browser — zero data collection, zero server cost
9. **Technical Depth**: Computer vision + motion tracking + gesture classification + dual-language support

---

**Built for**: LUMINIX'26 — Hack2Skills
**Problem Statement**: Sign-Language Learning Game
**Tech**: AI x Computer Vision x Motion Detection x Dual-Language x Gamification x Accessibility
