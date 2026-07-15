import { PlayerClass, ActionType, ClientChallenge } from '../../shared/api';
import { getRandomChallenge } from '../core/challenge.core';

// Validate shape
function isValidChallenge(obj: any): obj is ClientChallenge {
  return (
    obj &&
    typeof obj.challengeId === 'string' &&
    (obj.type === 'multiple_choice' || obj.type === 'true_false') &&
    typeof obj.prompt === 'string' &&
    Array.isArray(obj.options) &&
    obj.options.every(
      (o: any) => typeof o.id === 'string' && typeof o.label === 'string'
    ) &&
    typeof obj.correctOptionId === 'string' &&
    (obj.explanation === undefined || typeof obj.explanation === 'string') &&
    ['RANGER', 'MENDER', 'WARDER', 'WEAVER'].includes(obj.playerClass)
  );
}

/** Generate a challenge for a specific class and action */
export async function getChallengeForAction(
  playerClass: PlayerClass,
  action?: ActionType
): Promise<ClientChallenge> {
  try {
    const aiChallenge = await generateChallengeWithAI(playerClass, action);
    if (aiChallenge && isValidChallenge(aiChallenge)) {
      return aiChallenge;
    }
  } catch (error) {
    console.error('AI challenge generation failed, falling back:', error);
  }
  // Fallback to the static pool (class‑level)
  return getRandomChallenge(playerClass);
}

/** Call external AI (OpenAI example) – adjust to your provider */
async function generateChallengeWithAI(
  playerClass: PlayerClass,
  action?: ActionType
): Promise<ClientChallenge | null> {
  const actionDescription = action
    ? `The challenge should be about performing the "${action}" action, which is a core activity for the ${playerClass} class.`
    : `The challenge should test general ${playerClass} skills.`;

  const prompt = `
You are a game master for a Reddit‑based RPG. Generate a multiple‑choice or true/false challenge for a player of class "${playerClass}".
${actionDescription}
The challenge must relate to community moderation, content discovery, empathy, or storytelling.

Return only a valid JSON object with:
- challengeId: a unique string (e.g., "ai_${Date.now()}")
- type: "multiple_choice" or "true_false"
- prompt: string
- options: array of { id: string, label: string }
- correctOptionId: the id of the correct option
- explanation: string (brief, educational)
- playerClass: "${playerClass}"

Ensure the JSON is valid and contains no extra text.
`;

  // Replace with your actual AI API call (e.g., OpenAI)
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty AI response');

  // Parse the AI response (it should be pure JSON)
  return JSON.parse(content);
}
