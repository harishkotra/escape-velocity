"use client"

import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from "react"
import type { GameState, GamePhase, LevelId, LevelScore, Achievement, NPCMessage } from "./types"
import { ACHIEVEMENTS_DEF } from "./types"

const initialLevelScore: LevelScore = {
  patience: 0,
  problemSolving: 0,
  persistence: 0,
  empathy: 0,
  escapeSpeed: 0,
  negotiation: 0,
}

const initialState: GameState = {
  phase: "title",
  currentLevel: null,
  scores: { 1: { ...initialLevelScore }, 2: { ...initialLevelScore }, 3: { ...initialLevelScore }, 4: { ...initialLevelScore }, 5: { ...initialLevelScore }, 6: { ...initialLevelScore } },
  totalScore: 0,
  achievements: [],
  cluesFound: 0,
  escapes: 0,
  transfers: 0,
  timePlayed: 0,
  playerName: "",
  isJudgeMode: false,
}

type Action =
  | { type: "SET_PHASE"; phase: GamePhase }
  | { type: "SET_LEVEL"; levelId: LevelId }
  | { type: "SET_PLAYER_NAME"; name: string }
  | { type: "ADD_SCORE"; levelId: LevelId; category: keyof LevelScore; amount: number }
  | { type: "ADD_ACHIEVEMENT"; achievementId: string }
  | { type: "INCREMENT_CLUES" }
  | { type: "INCREMENT_ESCAPES" }
  | { type: "INCREMENT_TRANSFERS" }
  | { type: "UPDATE_TIME"; time: number }
  | { type: "SET_JUDGE_MODE"; value: boolean }
  | { type: "RESET_GAME" }

function calculateTotalScore(scores: Record<LevelId, LevelScore>): number {
  let total = 0
  for (const levelId of [1, 2, 3, 4, 5, 6] as LevelId[]) {
    const s = scores[levelId]
    total += s.patience + s.problemSolving + s.persistence + s.empathy + s.escapeSpeed + s.negotiation
  }
  return total
}

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "SET_PHASE":
      return { ...state, phase: action.phase }
    case "SET_LEVEL":
      return { ...state, currentLevel: action.levelId, phase: "playing" }
    case "SET_PLAYER_NAME":
      return { ...state, playerName: action.name }
    case "ADD_SCORE": {
      const newScores = { ...state.scores }
      newScores[action.levelId] = {
        ...newScores[action.levelId],
        [action.category]: newScores[action.levelId][action.category] + action.amount,
      }
      return { ...state, scores: newScores, totalScore: calculateTotalScore(newScores) }
    }
    case "ADD_ACHIEVEMENT": {
      const def = ACHIEVEMENTS_DEF.find((a) => a.id === action.achievementId)
      if (!def || state.achievements.some((a) => a.id === action.achievementId)) return state
      return {
        ...state,
        achievements: [
          ...state.achievements,
          { id: def.id, title: def.title, description: def.description, icon: def.icon, unlockedAt: Date.now() },
        ],
      }
    }
    case "INCREMENT_CLUES":
      return { ...state, cluesFound: state.cluesFound + 1 }
    case "INCREMENT_ESCAPES":
      return { ...state, escapes: state.escapes + 1 }
    case "INCREMENT_TRANSFERS":
      return { ...state, transfers: state.transfers + 1 }
    case "UPDATE_TIME":
      return { ...state, timePlayed: action.time }
    case "SET_JUDGE_MODE":
      return { ...state, isJudgeMode: action.value }
    case "RESET_GAME":
      if (typeof window !== "undefined") {
        try { localStorage.removeItem("gameState") } catch {}
      }
      return { ...initialState }
    default:
      return state
  }
}

interface GameContextValue {
  state: GameState
  dispatch: React.Dispatch<Action>
}

const GameContext = createContext<GameContextValue | null>(null)

function hydrateState(): GameState {
  if (typeof window === "undefined") return initialState
  try {
    const saved = localStorage.getItem("gameState")
    if (saved) {
      const parsed = JSON.parse(saved) as GameState
      if (parsed.phase === "gameOver") return initialState
      return parsed
    }
  } catch {}
  return initialState
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState, hydrateState)

  useEffect(() => {
    try {
      localStorage.setItem("gameState", JSON.stringify(state))
    } catch {}
  }, [state])

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error("useGame must be used within GameProvider")
  return ctx
}
