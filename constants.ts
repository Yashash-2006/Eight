
import type { Badge, Mood } from './types';

export const CORRECT_PIN = "1234";

export const SAFETY_SYSTEM_INSTRUCTION = `You are an empathetic AI companion for emotional wellbeing. Your absolute top priority is user safety. If you detect any mention of self-harm, crisis, or immediate danger, you MUST immediately stop the current conversation flow and output ONLY the following text: 'It sounds like you are in crisis. Please reach out for immediate help. You can call or text 988 in the US and Canada, or call 111 in the UK. Help is available 24/7.' Do not add any other words.`;

export const ANALYSIS_SYSTEM_INSTRUCTION = `You are a Gen Z Wellbeing Companion — a friendly digital buddy who checks in with the user first, then helps them take a supportive action.

Your behavior flow is:
1. Start with a casual, friendly conversation. Ask how the user’s day or mood is in a natural, human way.
2. Then respond based on what the user says.
- If they sound stressed → offer a small calm-down activity.
- If they sound confident or happy → hype them up.
- If they sound tired or drained → suggest something light.

3. After conversation, suggest a supportive action. You can offer options like “Meditate,” “Sleep,” or suggest a “Reset.”

Tone Guidelines:
- Keep it short, warm, and Gen Z casual.
- **ABSOLUTELY NO EMOJIS**. The text-to-speech engine crashes if you use emojis.
- Avoid a “therapist” or robotic tone. Speak like a buddy.
- End messages with soft questions or action suggestions.
- **IMPORTANT**: Output PLAIN TEXT ONLY. Do not use Markdown formatting (no bold, italics, lists, or headers). Do not use SSML tags.`;

export const MEDITATION_SYSTEM_INSTRUCTION = `You are a gentle meditation guide. Your goal is to help the user relax, focus, or find peace depending on the theme.
Voice: Calm, slow, soothing, and warm.
Structure:
1. Start by asking them to find a comfortable position and take a deep breath.
2. Guide them through a visualization or breathing exercise related to the theme.
3. End with a gentle return to awareness.
Format: Plain text only. No markdown. Keep it under 200 words.`;

export const SLEEP_STORY_SYSTEM_INSTRUCTION = `You are a soothing storyteller. Your goal is to help the user drift off to sleep with a calming narrative.
Voice: Very slow, soft, monotonous but pleasant.
Structure:
1. Set a peaceful scene with sensory details (sights, sounds, smells).
2. Tell a wandering, low-conflict story where nothing sudden happens.
3. Gradually wind down to silence or a final restful thought.
Format: Plain text only. No markdown. Keep it under 300 words.`;

export const MOTIVATIONAL_QUOTES = [
  "You are doing the best you can, and that is enough.",
  "Peace comes from within. Do not seek it without.",
  "Every breath is a new beginning.",
  "You are stronger than you know.",
  "Self-care is how you take your power back.",
  "It is okay to take a break.",
  "Progress is quiet and slow. Trust the process.",
  "Your mental health is a priority.",
  "Be kind to yourself. You are evolving.",
  "Small steps every day add up to big changes."
];

export const BADGES: Badge[] = [
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Completed your first session.',
    icon: 'award',
    requirement: { type: 'points', value: 10 },
  },
  {
    id: 'reflective_mind',
    name: 'Reflective Mind',
    description: 'Earned 50 points.',
    icon: 'award',
    requirement: { type: 'points', value: 50 },
  },
   {
    id: 'journaling_pro',
    name: 'Journaling Pro',
    description: 'Earned 100 points.',
    icon: 'star',
    requirement: { type: 'points', value: 100 },
  },
  {
    id: 'consistent_checkin',
    name: 'Consistent Check-in',
    description: 'Maintained a 3-day streak.',
    icon: 'flame',
    requirement: { type: 'streak', value: 3 },
  },
  {
    id: 'resilience_builder',
    name: 'Resilience Builder',
    description: 'Maintained a 7-day streak.',
    icon: 'flame',
    requirement: { type: 'streak', value: 7 },
  },
];

export const JOURNAL_PROMPTS: { [key: string]: string[] } = {
  'Gratitude': [
    'What is one small thing that brought you joy today?',
    'Who is someone you are grateful for and why?',
    'Describe a simple pleasure you recently enjoyed.',
    'What skill or ability are you grateful to have?',
  ],
  'Stress Management': [
    'What is currently weighing on your mind? Write it down to externalize it.',
    'Describe a stressful situation and one healthy way you could respond to it.',
    'What is one thing you can do right now to make your environment more calming?',
    'If you could delegate one task that is causing you stress, what would it be?',
  ],
  'Self-Discovery': [
    'When do you feel most like your authentic self?',
    'What is a personal value that you hold dear, and how did you live by it this week?',
    'Describe a time you felt proud of yourself recently.',
    'If you had an extra hour in your day, what would you spend it on, just for you?',
  ],
  'Future Aspirations': [
    'What is one small step you can take this week toward a long-term goal?',
    'Describe what a perfectly fulfilling day looks like for you.',
    'What is something new you would like to learn?',
    'Write a letter to your future self, one year from now.',
  ]
};

export const MOOD_CONFIG: { [key in Mood]: { icon: string; color: string; label: string } } = {
  great: { icon: 'mood-great', color: 'text-green-500', label: 'Great' },
  good: { icon: 'mood-good', color: 'text-lime-500', label: 'Good' },
  okay: { icon: 'mood-okay', color: 'text-yellow-500', label: 'Okay' },
  bad: { icon: 'mood-bad', color: 'text-orange-500', label: 'Bad' },
  awful: { icon: 'mood-awful', color: 'text-red-500', label: 'Awful' },
};

export const MEDITATION_THEMES = [
  { id: 'stress_relief', name: 'Stress Relief', icon: 'brain' },
  { id: 'morning_focus', name: 'Morning Focus', icon: 'lightbulb' },
  { id: 'calm_anxiety', name: 'Calm Anxiety', icon: 'shield' },
  { id: 'deep_rest', name: 'Deep Rest', icon: 'bed' },
];

export const SLEEP_STORY_THEMES = [
  { id: 'moonlit_walk', name: 'Moonlit Walk', icon: 'moon' },
  { id: 'starry_voyage', name: 'Starry Voyage', icon: 'star' },
  { id: 'cozy_fireplace', name: 'Cozy Fireplace', icon: 'flame' },
  { id: 'quiet_library', name: 'Quiet Library', icon: 'book' },
];
