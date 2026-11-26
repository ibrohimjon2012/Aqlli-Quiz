export type SubjectId =
  | 'informatics'
  | 'english'
  | 'math'
  | 'uzbek'
  | 'russian';

export type UserRole = 'player' | 'host';

export type AppView =
  | 'home'
  | 'setup'
  | 'quiz'
  | 'result'
  | 'host'
  | 'books'
  | 'profile';

export type TimerMode = 'none' | 'total' | 'per_question';

export interface QuestionItem {
  id: string;
  subject: SubjectId;
  level: string;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ShuffledQuestion extends QuestionItem {
  shuffledOptions: string[];
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  grade: number;
  createdAt: string;
}

export interface QuizAnswerRecord {
  questionId: string;
  questionNumber: number;
  question: string;
  topic: string;
  selectedOption: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  options: string[];
}

export interface QuizResultRecord {
  id: string;
  playerName: string;
  firstName: string;
  lastName: string;
  grade: number;
  subject: SubjectId;
  subjectTitle: string;
  level: string;
  topic: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  rawScore: number;
  penaltyPoints: number;
  finalScore: number;
  coinsEarned: number;
  won: boolean;
  violations: number;
  terminatedByCheat: boolean;
  isPracticeMode: boolean;
  dateISO: string;
  answers: QuizAnswerRecord[];
}

export interface HostConfig {
  subject: SubjectId;
  level: string;
  topic: string;
  questionCount: 10 | 20;
  timerMode: TimerMode;
  totalSeconds: number;
  perQuestionSeconds: number;
  hostSupervised: boolean;
}

export interface ActiveQuizSession {
  questions: ShuffledQuestion[];
  currentIndex: number;
  selectedOption: string | null;
  isConfirmed: boolean;
  answers: QuizAnswerRecord[];
  violations: number;
  penaltyPoints: number;
  timerMode: TimerMode;
  remainingSeconds: number;
  perQuestionLimit: number;
  isPaused: boolean;
  hostSupervised: boolean;
  subject: SubjectId;
  level: string;
  topic: string;
  isPracticeMode: boolean;
  startedAt: string;
}

export interface PlayerProgress {
  coins: number;
  attemptsUsed: number;
  maxAttempts: number;
  aiFreeUsed: boolean;
  aiUsageCount: number;
  streakDays: number;
  lastPlayedDate: string | null;
  badges: string[];
  wrongQuestionsPool: QuestionItem[];
  results: QuizResultRecord[];
}

export interface AppSettings {
  theme: 'light' | 'dark';
  fontSizeOffset: number; // -2 to +4
  autoSpeak: boolean;
  soundEffects: boolean;
}

export interface BookItem {
  id: string;
  subject: string;
  title: string;
  author: string;
  url: string;
}
