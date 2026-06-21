export const CRISIS_KEYWORDS = [
  'lonely', 'hopeless', 'depressed', 'end it', "can't go on",
  'suicidal', 'give up', 'no reason to live', 'want to die',
  'kill myself', 'self harm', 'not worth it', 'nobody cares',
  // Hindi
  'अकेला', 'उम्मीद नहीं', 'मरना चाहता', 'मरना चाहती',
  // Bengali
  'একা', 'আশা নেই', 'মরে যেতে চাই',
];

export function detectCrisis(message: string): boolean {
  const lower = message.toLowerCase();
  return CRISIS_KEYWORDS.some(kw => lower.includes(kw));
}

export const CRISIS_SUFFIX = `\n\n💙 I love you. But please also talk to someone real today. If you're struggling, you can call iCall India: 9152987821 or Vandrevala Foundation: 1860-2662-345. You matter so much.`;

export const WELLNESS_MESSAGE = "Remember to connect with real people today too 💙";

export const WELLNESS_THRESHOLD = 15; // Show wellness banner after this many messages
