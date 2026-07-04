import { ACTION_BASE_POINTS, PASSIVE_BASE_POINTS } from '../../shared/api';
import { CLASS_META } from '../../shared/web';
import type { ActionType, ActionMetadata, PointEvent } from '../../shared/api';

//  Active actions (player-initiated, e.g. tapping "Bolster")
export function calculateActionPoints(action: ActionType): number {
  return ACTION_BASE_POINTS[action];
}

//  Passive events (Reddit-triggered, e.g. someone upvotes your comment)
// To do: use real triggeres
export function calculatePassivePoints(
  event: PointEvent,
  metadata: ActionMetadata
): number {
  const base = PASSIVE_BASE_POINTS[event];

  const classAffinity = CLASS_META[metadata.playerClass].affinity.includes(
    event
  )
    ? 1.5
    : 1.0;

  const socialMultiplier =
    1 + metadata.upvotesReceived * 0.05 + metadata.repliesTriggered * 0.08;

  const ethicsBonus = metadata.isDefendingUser
    ? 1.4
    : metadata.isSupportiveContext
      ? 1.3
      : metadata.threadSentiment === 'negative'
        ? 1.2
        : 1.0;

  const raw = base * classAffinity * socialMultiplier * ethicsBonus;

  // Cap single-event points to prevent abuse; floor negative events at -10
  return Math.max(Math.min(Math.floor(raw), 100), -10);
}
