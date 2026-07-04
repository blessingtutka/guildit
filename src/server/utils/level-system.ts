import {
  LEVEL_THRESHOLDS,
  MAX_HAND_TUNED_LEVEL,
  POST_CAP_LEVEL_STEP,
  RECLASS_MIN_TAX,
  RECLASS_TAX_STEP,
  RECLASS_MAX_TAX,
  type ReclassPreview,
} from '../../shared/api';

//  Lookup
function thresholdForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level <= MAX_HAND_TUNED_LEVEL) {
    return LEVEL_THRESHOLDS[level - 1] ?? 0;
  }
  const levelsAboveCap = level - MAX_HAND_TUNED_LEVEL;
  const base = LEVEL_THRESHOLDS[MAX_HAND_TUNED_LEVEL - 1] ?? 4500;
  return base + levelsAboveCap * POST_CAP_LEVEL_STEP;
}

export function getLevel(points: number): number {
  let level = 1;

  for (let i = 0; i < MAX_HAND_TUNED_LEVEL; i++) {
    const threshold = LEVEL_THRESHOLDS[i] ?? 0;
    if (points >= threshold) {
      level = i + 1;
    } else {
      break; // No need to check further; levels are sequential
    }
  }

  if (level === MAX_HAND_TUNED_LEVEL) {
    let next = MAX_HAND_TUNED_LEVEL + 1;
    while (points >= thresholdForLevel(next)) {
      level = next;
      next++;
    }
  }

  return level;
}

export function pointsToNextLevel(points: number): {
  current: number;
  needed: number;
  remaining: number;
} {
  const currentLevel = getLevel(points);
  const nextThreshold = thresholdForLevel(currentLevel + 1);
  return {
    current: points,
    needed: nextThreshold,
    remaining: Math.max(nextThreshold - points, 0),
  };
}

// Reclass Tax
export function getTaxRate(level: number): number {
  if (level <= 1) return 0; // grace period
  return Math.min(
    RECLASS_MIN_TAX + (level - 2) * RECLASS_TAX_STEP,
    RECLASS_MAX_TAX
  );
}

export function previewReclass(points: number): ReclassPreview {
  const currentLevel = getLevel(points);
  const taxRate = getTaxRate(currentLevel);
  const cost = Math.floor(points * taxRate);
  const newPoints = points - cost;
  const newLevel = getLevel(newPoints);

  return {
    currentPoints: points,
    currentLevel,
    taxRate: Math.round(taxRate * 100),
    cost,
    newPoints,
    newLevel,
  };
}
