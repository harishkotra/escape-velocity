export type GamePhase = "title" | "playing" | "paused" | "levelComplete" | "gameOver"

export type LevelId = 1 | 2 | 3 | 4 | 5 | 6

export interface LevelConfig {
  id: LevelId
  title: string
  subtitle: string
  npc: string
  description: string
  timeLimit: number
}

export interface GameState {
  phase: GamePhase
  currentLevel: LevelId | null
  scores: Record<LevelId, LevelScore>
  totalScore: number
  achievements: Achievement[]
  cluesFound: number
  escapes: number
  transfers: number
  timePlayed: number
  playerName: string
  isJudgeMode: boolean
}

export interface LevelScore {
  patience: number
  problemSolving: number
  persistence: number
  empathy: number
  escapeSpeed: number
  negotiation: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: number
}

export interface NPCMessage {
  id: string
  role: "npc" | "player" | "system"
  content: string
  timestamp: number
}

export interface VoiceState {
  isRecording: boolean
  transcript: string
  error: string | null
}

export interface AIConfig {
  provider: "openai" | "featherless"
  model: string
  apiKey: string
  baseUrl: string
}

export interface Scenario {
  company: string
  industry: string
  complaint: string
  difficulty: string
  npcPersonality: string
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: "The Refund Maze",
    subtitle: "Find the actual refund path",
    npc: "Refund Robot",
    description: "A giant maze of policies, signs, and buttons. Every path leads nowhere.",
    timeLimit: 180,
  },
  {
    id: 2,
    title: "IVR Hell",
    subtitle: "Reach a human",
    npc: "Phone Menu",
    description: "Infinite phone menus where every option leads to another menu.",
    timeLimit: 120,
  },
  {
    id: 3,
    title: "Transfer Dungeon",
    subtitle: "Don't repeat yourself",
    npc: "Transfer Goblin",
    description: "Get transferred endlessly. Each department forgets everything.",
    timeLimit: 180,
  },
  {
    id: 4,
    title: "Subscription Prison",
    subtitle: "Cancel your membership",
    npc: "Manager Dragon",
    description: "Every button says 'Are you sure?'. NPCs guilt-trip you.",
    timeLimit: 150,
  },
  {
    id: 5,
    title: "The Chatbot Labyrinth",
    subtitle: "Convince AI you are human",
    npc: "Chatbot Wizard",
    description: "The bot misunderstands everything. Find the right keywords.",
    timeLimit: 150,
  },
  {
    id: 6,
    title: "Karen Boss Fight",
    subtitle: "The final battle",
    npc: "Karen Queen",
    description: "Face the impossible customer. De-escalate the fury.",
    timeLimit: 240,
  },
]

export const ACHIEVEMENTS_DEF = [
  { id: "transferred-12", title: "Transferred 12 Times", description: "Survived 12 transfers in one level", icon: "🔄" },
  { id: "still-on-hold", title: "Still On Hold", description: "Spent 60+ seconds on hold", icon: "🎵" },
  { id: "read-tos", title: "Read The Terms And Conditions", description: "Actually read the fine print", icon: "📄" },
  { id: "human-detected", title: "Human Detected", description: "Successfully reached a human", icon: "🧑" },
  { id: "no-repetition", title: "Did Not Repeat Yourself", description: "Escaped Transfer Dungeon without repeating", icon: "🔁" },
  { id: "speed-escape", title: "Speed Escaper", description: "Completed a level in under 60 seconds", icon: "⚡" },
  { id: "patience-monk", title: "Patience Monk", description: "Max patience score on any level", icon: "🧘" },
  { id: "karen-slayer", title: "Karen Slayer", description: "Defeated the Karen Boss", icon: "👑" },
]

export const SCORE_CATEGORIES: (keyof LevelScore)[] = [
  "patience", "problemSolving", "persistence", "empathy", "escapeSpeed", "negotiation"
]

export const RANK_THRESHOLDS = [
  { minScore: 0, title: "Casual Complainer", emoji: "🥉" },
  { minScore: 300, title: "Support Veteran", emoji: "🥈" },
  { minScore: 600, title: "Customer Champion", emoji: "🥇" },
  { minScore: 900, title: "Escape Legend", emoji: "👑" },
]
