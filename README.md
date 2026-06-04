# 🏢 Customer Escape Room

> **Can you survive being a customer?**

A mobile-first, voice-powered AI game where players must escape increasingly absurd customer service nightmares. Part escape room, part Black Mirror satire, part Duolingo-style gamification — full customer service hell.

**[Play the Judge Demo →](/game/judge)**

#### Screenshots

<img width="3154" height="2214" alt="screencapture-localhost-3000-game-judge-2026-06-04-20_04_56" src="https://github.com/user-attachments/assets/b4fd1fb3-fe0c-4bb5-bf5c-503ba388c0c3" />
<img width="3154" height="2214" alt="screencapture-localhost-3000-game-judge-2026-06-04-20_05_18" src="https://github.com/user-attachments/assets/86f231da-4819-44db-a42b-9fbbb0b26f22" />
<img width="3154" height="2214" alt="screencapture-localhost-3000-game-judge-2026-06-04-20_05_40" src="https://github.com/user-attachments/assets/dc9034f9-a9a1-4591-b3f6-92c1214e573c" />
<img width="3154" height="2214" alt="screencapture-localhost-3000-game-judge-2026-06-04-20_05_58" src="https://github.com/user-attachments/assets/bd487bf8-e2de-435f-a62c-36b33cc21f20" />

---

## The Concept

Most hackathon teams build chatbots, AI agents, and copilots. We built a game that **forces people to experience terrible customer journeys firsthand.**

Each level represents a real customer experience failure — from refund mazes to IVR hell to the Karen boss fight. Players use their voice (or type) to navigate bureaucratic nightmares, solve puzzles, and escape.

The result is hilarious, frustrating, educational, and extremely shareable.

---

## Games That Inspired This

| Game | Why |
|------|-----|
| Portal | Trapped in a corporate facility, testing your wits |
| The Stanley Parable | Absurd corporate satire, branching choices |
| Escape Room | Puzzle-solving under pressure |
| Duolingo | Mobile-first, streaks, notifications, shareable |
| Fall Guys | Colorful, cartoon dystopia |
| Among Us | Simple mechanics, viral multiplayer |

---

## Tech Stack

```
Frontend:  Next.js 16 + TypeScript + Tailwind v4 + Framer Motion + shadcn/ui
Backend:   Next.js Route Handlers + Server Actions
AI:        OpenAI SDK / OpenAI-compatible endpoints (Featherless, etc.)
Voice:     MediaRecorder API → Whisper transcription
State:     React Context + useReducer
Database:  Supabase (ready for persistence)
Auth:      Anonymous guest mode + optional Google login
Realtime:  Socket.io (ready for multiplayer)
Deploy:    Vercel
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  pages/                                                 │
│  ├── page.tsx              ← Game hub (title → play →   │
│  │                           game over)                  │
│  ├── game/judge/page.tsx   ← One-click judge demo       │
│  └── api/ai/route.ts       ← AI proxy + transcription   │
├─────────────────────────────────────────────────────────┤
│  components/game/                                        │
│  ├── GameEngine.tsx         ← Level orchestrator         │
│  ├── GameTitleScreen.tsx    ← Landing / title            │
│  ├── GameOverScreen.tsx     ← Final scores + rank        │
│  ├── LevelComplete.tsx      ← Per-level score breakout   │
│  ├── VoiceInput.tsx         ← Mic + text input toggle    │
│  ├── NPCDialogue.tsx        ← Typing animation + emotion │
│  ├── ScoreDisplay.tsx       ← HUD overlay                │
│  ├── ShareCard.tsx          ← X / LinkedIn / WhatsApp    │
│  ├── AchievementsDisplay.tsx                              │
│  └── levels/                                              │
│       ├── Level1RefundMaze.tsx                            │
│       ├── Level2IVRHell.tsx                               │
│       ├── Level3TransferDungeon.tsx                       │
│       ├── Level4SubscriptionPrison.tsx                    │
│       ├── Level5ChatbotLabyrinth.tsx                      │
│       └── Level6KarenBossFight.tsx                        │
├─────────────────────────────────────────────────────────┤
│  lib/                                                    │
│  ├── types.ts              ← All type definitions         │
│  ├── game-state.tsx        ← React Context + useReducer  │
│  ├── ai.ts                 ← Client-side AI abstraction  │
│  ├── voice.ts              ← MediaRecorder hook          │
│  ├── prompts.ts            ← NPC system prompts          │
│  └── scoring.ts            ← Rank / grade calculation    │
└─────────────────────────────────────────────────────────┘
```

### State Flow

```
User Input → VoiceInput (mic or text)
         → Level handleTranscript()
         → Game State (useReducer context)
         → dispatch ADD_SCORE, SET_PHASE, etc.
         → React re-renders
         → NPCDialogue displays NPC response
```

### AI Abstraction Layer

```
                   ┌──────────────┐
                   │  Client code  │
                   │ (level .tsx)  │
                   └──────┬───────┘
                          │
                   ┌──────▼───────┐
                   │   ai.ts      │
                   │ (fetch /ai)  │
                   └──────┬───────┘
                          │
              ┌───────────┴───────────┐
              │  /api/ai/route.ts     │
              │  OpenAI / Featherless │
              │  Whisper transcription│
              └───────────────────────┘
```

The AI layer supports provider switching via environment variables:

```env
AI_PROVIDER=openai           # OpenAI
# or
AI_PROVIDER=featherless      # Featherless (OpenAI-compatible)
```

---

## The 6 Levels

| Level | Title | NPC | Mechanic |
|-------|-------|-----|----------|
| 1 | The Refund Maze | 🤖 Refund Robot | Navigate bureaucratic policy hell to get a refund |
| 2 | IVR Hell | 📞 Phone Menu | Escape infinite phone menus before time runs out |
| 3 | Transfer Dungeon | 👺 Transfer Goblin | Survive endless transfers without repeating yourself |
| 4 | Subscription Prison | 🐉 Manager Dragon | Cancel through guilt trips and retention offers |
| 5 | Chatbot Labyrinth | 🧙 Chatbot Wizard | Find keywords to prove you're human |
| 6 | Karen Boss Fight | 👑 Karen Queen | De-escalate the ultimate impossible customer |

### Level Design Pattern

```typescript
// Each level follows this pattern:
type Stage = "intro" | "stage1" | "stage2" | "escaped"

// Deterministic stage map
const STAGE_DATA = {
  intro:   { npc: "...", advanceOn: ["keyword"], advanceTo: "stage1", hint: "..." },
  stage1:  { npc: "...", advanceOn: ["keyword"], advanceTo: "stage2", hint: "..." },
  stage2:  { npc: "...", advanceOn: ["keyword"], advanceTo: "escaped", hint: "..." },
}

// handleTranscript detects:
// 1. Confused input → shows hint
// 2. Correct keyword → advances stage
// 3. Off-script → redirects to objective
```

---

## Voice System

The voice system uses the **MediaRecorder API** for recording and **OpenAI Whisper** for transcription, with a text fallback.

```typescript
// src/lib/voice.ts
export function useVoice(): UseVoiceReturn {
  // Records audio via MediaRecorder
  // Sends to /api/ai with X-Transcribe header
  // Returns transcript text
  // Gracefully falls back to simulated transcription
}
```

The `VoiceInput` component toggles between mic and text:

```tsx
<VoiceInput onTranscript={handleTranscript} />
// Shows mic button + "⌨️ Type instead" toggle
// Falls back to pure text input if no mic support
```

---

## Scoring System

```
Score Categories: patience, problemSolving, persistence, empathy, escapeSpeed, negotiation
Each category: 0-100 per level
Total: 6 categories × 6 levels = 3,600 max

Ranks:
  🥉 Casual Complainer   (0+ pts)
  🥈 Support Veteran     (300+ pts)
  🥇 Customer Champion   (600+ pts)
  👑 Escape Legend       (900+ pts)
```

---

## Judge Demo Mode

One-click demo at `/game/judge`:

- Immediately loads **Level 2: IVR Hell**
- Starts action within 10 seconds
- No signup, no onboarding
- Yellow "JUDGE DEMO MODE" badge
- Judges are playing immediately

---

## Quick Start

```bash
git clone <repo>
cd escape-velocity

# Install dependencies
npm install

# Set up environment (optional — game works without API key)
cp .env.local.example .env.local
# Add your OPENAI_API_KEY for AI dialogue generation

# Run development server
npm run dev
# → http://localhost:3000
# → http://localhost:3000/game/judge (judge demo)

# Build for production
npm run build
npm start
```

---

## Environment Variables

```env
# Required for AI dialogue generation (optional — game falls back gracefully)
OPENAI_API_KEY=sk-...

# Provider switching
AI_PROVIDER=openai         # default
# AI_PROVIDER=featherless

# Model override
# AI_MODEL=gpt-4o-mini    # default for openai
# AI_MODEL=meta-llama/... # for featherless
```

---

## Contributing

### Ideas for New Features

1. **Multiplayer Mode** — Socket.io is already installed. 4-8 players share an escape room, cooperate via voice.
2. **More Levels** — The level pattern is well-defined. Add Level 7: "The Data Deletion Request" or Level 8: "The Warranty Voidening."
3. **Supabase Persistence** — Save scores, achievements, and leaderboard data.
4. **Google Login** — OAuth is ready, just wire it up.
5. **Dynamic Scenario Generation** — Use the AI provider to generate unique company names, NPC personalities, and complaints each playthrough.
6. **Sound Effects** — Add hold music, menu beeps, Karen screaming — the full audio experience.
7. **Share Cards** — Generate SVG/PNG share cards with scores and rank.
8. **Leaderboard** — Global rankings with percentile scores.
9. **Daily Challenge** — A randomly generated level every day (Duolingo-style streaks).
10. **Accessibility** — Screen reader support, colorblind modes, adjustable text sizes.

### How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes
4. Run `npm run build` to verify
5. Submit a PR

The level architecture is designed to be plug-and-play:

```typescript
// 1. Create src/components/game/levels/Level7YourIdea.tsx
// 2. Add to src/lib/types.ts LEVELS array
// 3. Add to GameEngine.tsx switch statement
// 4. Done
```

---

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

The project includes a `vercel.json` with the correct framework preset. Set `OPENAI_API_KEY` as an environment variable in the Vercel dashboard.
