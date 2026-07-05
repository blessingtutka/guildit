import { ActionType, PlayerClass, PointEvent } from './api';
import {
  type LucideIcon,
  Search,
  Shell,
  ShieldHalf,
  Sparkles,
} from 'lucide-react';

// ===============================================
// CLASS METADATA
// ===============================================

export interface ClassMeta {
  key: PlayerClass;
  icon: LucideIcon;
  image?: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  tailwindAccent: string;
  affinity: PointEvent[];
}

// ===============================================
// CLASS METADATA
// ===============================================

export const CLASS_META: Record<PlayerClass, ClassMeta> = {
  RANGER: {
    key: 'RANGER',
    icon: Search,
    image: 'ranger-guildit-class.png',
    name: 'Ranger',
    tagline: 'Explorer of the Unknown',
    description:
      'Surface hidden gems. Fight information bubbles. Map the unseen.',
    color: '#E07B39',
    tailwindAccent: 'orange-400',
    affinity: ['RANGER_DISCOVER', 'POST_CREATED', 'CONTENT_SAVED'],
  },
  MENDER: {
    key: 'MENDER',
    icon: Sparkles,
    image: 'mender-guildit-class.png',

    name: 'Mender',
    tagline: 'Healer of Communities',
    description:
      'Lift struggling voices. De-escalate conflict. Hold space for others.',
    color: '#3d7d59',
    tailwindAccent: 'emerald-600',
    affinity: ['MENDER_COUNSEL', 'SUPPORTIVE_REPLY', 'AWARD_RECEIVED'],
  },
  WARDER: {
    key: 'WARDER',
    icon: ShieldHalf,
    image: 'warder-guildit-class.png',

    name: 'Warder',
    tagline: 'Defender of Truth',
    description:
      'Shield the vulnerable. Stand against misinformation. Hold the line.',
    color: '#5d84b5',
    tailwindAccent: 'blue-600',
    affinity: ['WARDER_GUARD', 'DEFENSE_REPLY', 'DOWNVOTE_RECEIVED'],
  },
  WEAVER: {
    key: 'WEAVER',
    icon: Shell,
    image: 'weaver-guildit-class.png',
    name: 'Weaver',
    tagline: 'Conjurer of Meaning',
    description:
      'Spark conversations. Build culture. Create what others remember.',
    color: '#9d61d2',
    tailwindAccent: 'purple-600',
    affinity: ['WEAVER_INSPIRE', 'QUALITY_COMMENT', 'REPLY_RECEIVED'],
  },
};

// ===============================================
// ACTIONS — active (player-initiated)
// ===============================================

export const ACTION_LABELS: Record<
  ActionType,
  { label: string; description: string }
> = {
  RANGER_EXPLORE: {
    label: 'Explore',
    description: 'Uncover the daily loot cache',
  },
  RANGER_DISCOVER: {
    label: 'Discover',
    description: 'Upvote an underrated post',
  },
  RANGER_WAYPOINT: { label: 'Waypoint', description: 'Share quality content' },
  RANGER_SCOUT_REPORT: {
    label: 'Scout Report',
    description: 'Nominate the find of the day',
  },
  MENDER_BOLSTER: {
    label: 'Bolster',
    description: 'Encourage someone struggling',
  },
  MENDER_REVIVE: {
    label: 'Revive',
    description: 'Reply to a downvoted comment',
  },
  MENDER_COUNSEL: { label: 'Counsel', description: 'Provide helpful advice' },
  MENDER_SANCTUARY: {
    label: 'Sanctuary',
    description: 'De-escalate a heated argument',
  },
  WARDER_DEFEND: {
    label: 'Defend',
    description: 'Vote in the daily Boss Poll',
  },
  WARDER_GUARD: {
    label: 'Guard',
    description: 'Defend someone being attacked',
  },
  WARDER_FORTIFY: {
    label: 'Fortify',
    description: 'Upvote a factual correction',
  },
  WARDER_VERDICT: { label: 'Verdict', description: 'Vote on flagged content' },
  WEAVER_INVOKE: {
    label: 'Invoke',
    description: 'Submit the daily creative prompt',
  },
  WEAVER_CRAFT: {
    label: 'Craft',
    description: 'Write a post that gets 25+ upvotes',
  },
  WEAVER_INSPIRE: { label: 'Inspire', description: 'Trigger a 5+ reply chain' },
  WEAVER_ENCHANT: {
    label: 'Enchant',
    description: 'Create content that gets saved',
  },
};

// ===============================================
// NOTIFICATIONS
// ===============================================

export type NotificationType = 'duel_invite';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  subtitle?: string;
  createdAt: number;
  avatarInitial: string;
  avatarColor: string;

  payload: unknown;
}
