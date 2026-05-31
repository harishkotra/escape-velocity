import type { LevelScore } from "./types"
import { RANK_THRESHOLDS } from "./types"

export function getRank(totalScore: number): { title: string; emoji: string } {
  let rank = RANK_THRESHOLDS[0]
  for (const r of RANK_THRESHOLDS) {
    if (totalScore >= r.minScore) rank = r
  }
  return rank
}

export function calculateLevelGrade(score: LevelScore): "S" | "A" | "B" | "C" | "F" {
  const total = score.patience + score.problemSolving + score.persistence + score.empathy + score.escapeSpeed + score.negotiation
  if (total >= 480) return "S"
  if (total >= 360) return "A"
  if (total >= 240) return "B"
  if (total >= 120) return "C"
  return "F"
}

export function formatScore(score: number): string {
  return `${Math.round(score)}`
}

export function getMaxScore(): number {
  return 600 * 6
}
