// ===============================================
// PLAYER
// ===============================================

export type PlayerClass = 'RANGER' | 'MENDER' | 'WARDER' | 'WEAVER';

export interface Player {
  userId: string;
  username: string;
  class: PlayerClass | null;
  points: number;
  level: number; // computed
  guildId: string | null;
  snoovatar: string | null;
}

// ===============================================
// GUILD
// ===============================================

export interface Guild {
  guildId: string;
  name: string;
  founderId: string;
  members: string[]; // array of userIds
}

export interface GuildStatus {
  guild: Omit<Guild, 'members'>;
  members: string[];
  classesPresent: PlayerClass[];
  totalPoints: number;
  multiplier: number;
  guildScore: number;
  isComplete: boolean; // true when all 4 classes present
}

// Completeness multipliers — used by guild.controller and leaderboard display
export const GUILD_MULTIPLIERS = {
  COMPLETE: 1.0, // all 4 classes
  PARTIAL: 0.6, // 2–3 classes
  SOLO: 0.3, // 1 class
} as const;

// ===============================================
// ACTIONS — active (player-initiated)
// ===============================================

export type ActionType =
  // Ranger
  | 'RANGER_EXPLORE'
  | 'RANGER_DISCOVER'
  | 'RANGER_WAYPOINT'
  | 'RANGER_SCOUT_REPORT'
  // Mender
  | 'MENDER_BOLSTER'
  | 'MENDER_REVIVE'
  | 'MENDER_COUNSEL'
  | 'MENDER_SANCTUARY'
  // Warder
  | 'WARDER_DEFEND'
  | 'WARDER_GUARD'
  | 'WARDER_FORTIFY'
  | 'WARDER_VERDICT'
  // Weaver
  | 'WEAVER_INVOKE'
  | 'WEAVER_CRAFT'
  | 'WEAVER_INSPIRE'
  | 'WEAVER_ENCHANT';

// How many times per day each action can be completed
export const ACTION_DAILY_CAPS: Record<ActionType, number> = {
  RANGER_EXPLORE: 1,
  RANGER_DISCOVER: 3,
  RANGER_WAYPOINT: 2,
  RANGER_SCOUT_REPORT: 1,
  MENDER_BOLSTER: 3,
  MENDER_REVIVE: 2,
  MENDER_COUNSEL: 2,
  MENDER_SANCTUARY: 1,
  WARDER_DEFEND: 1,
  WARDER_GUARD: 3,
  WARDER_FORTIFY: 3,
  WARDER_VERDICT: 2,
  WEAVER_INVOKE: 1,
  WEAVER_CRAFT: 2,
  WEAVER_INSPIRE: 3,
  WEAVER_ENCHANT: 2,
};

// Base points per active action
export const ACTION_BASE_POINTS: Record<ActionType, number> = {
  RANGER_EXPLORE: 10,
  RANGER_DISCOVER: 20,
  RANGER_WAYPOINT: 12,
  RANGER_SCOUT_REPORT: 15,
  MENDER_BOLSTER: 15,
  MENDER_REVIVE: 18,
  MENDER_COUNSEL: 20,
  MENDER_SANCTUARY: 25,
  WARDER_DEFEND: 12,
  WARDER_GUARD: 20,
  WARDER_FORTIFY: 10,
  WARDER_VERDICT: 15,
  WEAVER_INVOKE: 20,
  WEAVER_CRAFT: 22,
  WEAVER_INSPIRE: 18,
  WEAVER_ENCHANT: 25,
};

// Which actions belong to which class
export const CLASS_ACTIONS: Record<PlayerClass, ActionType[]> = {
  RANGER: [
    'RANGER_EXPLORE',
    'RANGER_DISCOVER',
    'RANGER_WAYPOINT',
    'RANGER_SCOUT_REPORT',
  ],
  MENDER: [
    'MENDER_BOLSTER',
    'MENDER_REVIVE',
    'MENDER_COUNSEL',
    'MENDER_SANCTUARY',
  ],
  WARDER: ['WARDER_DEFEND', 'WARDER_GUARD', 'WARDER_FORTIFY', 'WARDER_VERDICT'],
  WEAVER: ['WEAVER_INVOKE', 'WEAVER_CRAFT', 'WEAVER_INSPIRE', 'WEAVER_ENCHANT'],
};

// ===============================================
// POINT EVENTS — passive (Reddit event triggers)
// ===============================================

export type PointEvent =
  // Universal
  | 'POST_CREATED'
  | 'COMMENT_CREATED'
  | 'UPVOTE_RECEIVED'
  | 'DOWNVOTE_RECEIVED'
  | 'REPLY_RECEIVED'
  | 'AWARD_RECEIVED'
  // Social / Ethical
  | 'SUPPORTIVE_REPLY'
  | 'DEFENSE_REPLY'
  | 'QUALITY_COMMENT'
  | 'CONTENT_SAVED'
  // Class-specific
  | 'RANGER_DISCOVER'
  | 'MENDER_COUNSEL'
  | 'WARDER_GUARD'
  | 'WEAVER_INSPIRE';

// Base points per passive event
export const PASSIVE_BASE_POINTS: Record<PointEvent, number> = {
  POST_CREATED: 5,
  COMMENT_CREATED: 3,
  UPVOTE_RECEIVED: 2,
  DOWNVOTE_RECEIVED: -1,
  REPLY_RECEIVED: 4,
  AWARD_RECEIVED: 25,
  SUPPORTIVE_REPLY: 8,
  DEFENSE_REPLY: 10,
  QUALITY_COMMENT: 12,
  CONTENT_SAVED: 15,
  RANGER_DISCOVER: 20,
  MENDER_COUNSEL: 20,
  WARDER_GUARD: 20,
  WEAVER_INSPIRE: 20,
};

export interface ActionMetadata {
  upvotesReceived: number;
  repliesTriggered: number;
  isDefendingUser: boolean;
  isSupportiveContext: boolean;
  threadSentiment: 'positive' | 'neutral' | 'negative';
  playerClass: PlayerClass;
}

// ===============================================
// LEVEL SYSTEM
// ===============================================

// Hand-tuned thresholds for levels 1–10, then +500/level after that
export const LEVEL_THRESHOLDS: readonly number[] = [
  0, 100, 250, 500, 850, 1300, 1900, 2600, 3400, 4500,
] as const;

export const MAX_HAND_TUNED_LEVEL = LEVEL_THRESHOLDS.length; // 10
export const POST_CAP_LEVEL_STEP = 500;

// Tax rate formula constants
export const RECLASS_MIN_TAX = 0.2; // 20% at level 2
export const RECLASS_TAX_STEP = 0.02; // +2% per level
export const RECLASS_MAX_TAX = 0.4; // capped at 40%

export interface ReclassPreview {
  currentPoints: number;
  currentLevel: number;
  taxRate: number;
  cost: number;
  newPoints: number;
  newLevel: number;
}

// ===============================================
// MINI-GAMES
// ===============================================

export type MiniGameType = 'SOLO_TRIAL' | 'DUEL' | 'GUILD_RAID';

export interface Duel {
  duelId: string;
  challenger: string; // userId
  challenged: string; // userId
  stake: number; // points each puts in
  prompt: string; // same prompt sent to both
  status: 'pending' | 'active' | 'complete';
  winnerId: string | null;
  expiresAt: number; // ex: expires if not accepted in 24h
}

// Class advantage in duels (rock-paper-scissors)
export const DUEL_ADVANTAGE: Record<PlayerClass, PlayerClass> = {
  RANGER: 'WARDER', // Ranger beats Warder
  WARDER: 'WEAVER', // Warder beats Weaver
  WEAVER: 'MENDER', // Weaver beats Mender
  MENDER: 'RANGER', // Mender beats Ranger
};

export const DUEL_ADVANTAGE_MULTIPLIER = 1.3;

export interface GuildRaid {
  raidId: string;
  attackerId: string; // guildId
  defenderId: string; // guildId
  weekOf: string; // ISO date string YYYY-MM-DD
  status: 'pending' | 'active' | 'resolved';
  attackScore: number;
  defendScore: number;
  winnerId: string | null;
  // Winner: raid trophy on guild profile + 1.15× guild score multiplier next week
}

// ===============================================
// POSTMESSAGE BRIDGE — Devvit => Webview
// ===============================================

// Messages sent FROM Devvit server TO the React webview
export type DevvitToWebviewMessage =
  | { type: 'INIT'; player: Player }
  | { type: 'CLASS_SET'; player: Player }
  | {
      type: 'POINTS_UPDATE';
      newPoints: number;
      newLevel: number;
      leveledUp: boolean;
    }
  | { type: 'GUILD_UPDATE'; status: GuildStatus }
  | {
      type: 'ACTION_RESULT';
      action: ActionType;
      success: boolean;
      pointsEarned: number;
      error?: string;
    }
  | { type: 'ERROR'; message: string };

// Messages sent FROM the React webview TO Devvit server
export type WebviewToDevvitMessage =
  | { type: 'READY' }
  | { type: 'SELECT_CLASS'; playerClass: PlayerClass }
  | { type: 'LOG_ACTION'; action: ActionType }
  | { type: 'CREATE_GUILD'; name: string }
  | { type: 'JOIN_GUILD'; guildId: string }
  | { type: 'GET_GUILD'; guildId: string }
  | { type: 'CHALLENGE_DUEL'; challengedUserId: string; stake: number }
  | { type: 'ACCEPT_DUEL'; duelId: string }
  | { type: 'RAID_GUILD'; targetGuildId: string };
