import type {
  ChallengeType,
  ClientChallenge,
  ChallengeSubmitResult,
  PlayerClass,
} from '../../shared/api';
import { NotFoundError } from '../utils/errors';
import challengeData from './challenges.json';

interface ChallengeDefinition {
  challengeId: string;
  type: ChallengeType;
  prompt: string;
  options: { id: string; label: string }[];
  correctOptionId: string;
  explanation?: string;
  playerClass: PlayerClass;
}

const CHALLENGE_BANK: ChallengeDefinition[] = challengeData;

export function getRandomChallenge(playerClass: PlayerClass): ClientChallenge {
  const pool = CHALLENGE_BANK.filter((c) => c.playerClass === playerClass);
  const picked = pool[Math.floor(Math.random() * pool.length)]!;
  return {
    challengeId: picked.challengeId,
    type: picked.type,
    prompt: picked.prompt,
    options: picked.options,
    playerClass: picked.playerClass,
  };
}

export function submitAnswer(
  challengeId: string,
  chosenOptionId: string
): ChallengeSubmitResult {
  const def = CHALLENGE_BANK.find((c) => c.challengeId === challengeId);
  if (!def) throw new NotFoundError(`Challenge ${challengeId} not found`);
  const correct = def.correctOptionId === chosenOptionId;
  return {
    correct,
    explanation: def.explanation,
    scoreFraction: correct ? 1.0 : 0.4,
  };
}
