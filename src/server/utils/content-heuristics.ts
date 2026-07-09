const SUPPORTIVE_WORDS = [
  'you got this',
  'proud of you',
  "you're not alone",
  'hang in there',
  'sending love',
  'here for you',
  'it gets better',
  'keep going',
  'you matter',
  'im sorry',
  "i'm sorry",
  'thank you for sharing',
  'thats okay',
  "that's okay",
  'take your time',
  'well done',
  'great job',
];

const DEFENSIVE_WORDS = [
  "that's not fair",
  'leave them alone',
  "that's uncalled for",
  'unnecessary attack',
  'please be kind',
  'no need for that',
  "that's not true",
  'actually,',
  'to clarify',
  'for context',
];

const NEGATIVE_SIGNALS = [
  'hate',
  'stupid',
  'idiot',
  'shut up',
  'worthless',
  'kill yourself',
  'trash',
  'garbage take',
  'ratio',
  'downvote this',
];

export interface ContentClassification {
  isSupportiveContext: boolean;
  isDefendingUser: boolean;
  threadSentiment: 'positive' | 'neutral' | 'negative';
}

export function classifyText(
  body: string | undefined | null
): ContentClassification {
  const text = (body || '').toLowerCase();

  const isSupportiveContext = SUPPORTIVE_WORDS.some((w) => text.includes(w));
  const isDefendingUser = DEFENSIVE_WORDS.some((w) => text.includes(w));
  const hasNegativeSignal = NEGATIVE_SIGNALS.some((w) => text.includes(w));

  let threadSentiment: ContentClassification['threadSentiment'] = 'neutral';
  if (hasNegativeSignal) threadSentiment = 'negative';
  else if (isSupportiveContext) threadSentiment = 'positive';

  return { isSupportiveContext, isDefendingUser, threadSentiment };
}
