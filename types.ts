
export type Mood = 'great' | 'good' | 'okay' | 'bad' | 'awful';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  metadata?: {
    emotion?: string;
    domain?: string;
    distortion?: string;
  };
}

export interface DiaryEntry {
  id: string;
  timestamp: string;
  summary: string;
  conversation: Message[];
  mood?: Mood;
}

export interface CalendarEvent {
  title: string;
  startTime: string;
  endTime: string;
}

export interface StressHotspot {
  startTime: string;
  endTime: string;
  reason: string;
}

export enum HrvStatus {
    STABLE = 'STABLE',
    CRITICAL = 'CRITICAL'
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: 'award' | 'star' | 'flame';
  requirement: {
    type: 'points' | 'streak';
    value: number;
  };
}

export interface GamificationState {
  points: number;
  streak: number;
  badges: string[]; // Array of badge IDs
  lastCheckInDate: string | null; // ISO date string yyyy-mm-dd
}

export interface AssessmentAnswer {
  questionId: number;
  score: number; // 1-5
}

export interface OnboardingResult {
  completed: boolean;
  scores: AssessmentAnswer[];
  timestamp: string;
}
