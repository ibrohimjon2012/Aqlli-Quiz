import {
  ActiveQuizSession,
  AppSettings,
  HostConfig,
  PlayerProgress,
  UserProfile,
} from '../types';

const KEYS = {
  PROFILE: 'smart_quiz_profile_v1',
  PROGRESS: 'smart_quiz_progress_v1',
  ACTIVE_SESSION: 'smart_quiz_active_session_v1',
  HOST_CONFIG: 'smart_quiz_host_config_v1',
  SETTINGS: 'smart_quiz_settings_v1',
  GUIDE_SEEN: 'smart_quiz_guide_seen_v1',
};

export const DEFAULT_PROGRESS: PlayerProgress = {
  coins: 0,
  attemptsUsed: 0,
  maxAttempts: 3,
  aiFreeUsed: false,
  aiUsageCount: 0,
  streakDays: 0,
  lastPlayedDate: null,
  badges: [],
  wrongQuestionsPool: [],
  results: [],
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  fontSizeOffset: 0,
  autoSpeak: true,
  soundEffects: true,
};

export const DEFAULT_HOST_CONFIG: HostConfig = {
  subject: 'informatics',
  level: '8-sinf',
  topic: 'Aralash',
  questionCount: 10,
  timerMode: 'total',
  totalSeconds: 300,
  perQuestionSeconds: 30,
  hostSupervised: true,
};

export function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function safeSetItem<T>(key: string, value: T): { ok: boolean; error?: string } {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (err) {
    console.warn('localStorage saqlash xatosi:', err);
    return {
      ok: false,
      error: "Qurilma xotirasi (localStorage) to'lgan yoki cheklangan. Eski natijalarni tozalab ko'ring.",
    };
  }
}

export function safeRemoveItem(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore storage errors
  }
}

export function loadProfile(): UserProfile | null {
  return safeGetItem<UserProfile | null>(KEYS.PROFILE, null);
}

export function saveProfile(profile: UserProfile | null) {
  if (!profile) {
    safeRemoveItem(KEYS.PROFILE);
    return { ok: true };
  }
  return safeSetItem(KEYS.PROFILE, profile);
}

export function loadProgress(): PlayerProgress {
  const loaded = safeGetItem<Partial<PlayerProgress>>(KEYS.PROGRESS, {});
  return {
    ...DEFAULT_PROGRESS,
    ...loaded,
    badges: Array.isArray(loaded.badges) ? loaded.badges : [],
    wrongQuestionsPool: Array.isArray(loaded.wrongQuestionsPool) ? loaded.wrongQuestionsPool : [],
    results: Array.isArray(loaded.results) ? loaded.results : [],
  };
}

export function saveProgress(progress: PlayerProgress) {
  return safeSetItem(KEYS.PROGRESS, progress);
}

export function loadActiveSession(): ActiveQuizSession | null {
  return safeGetItem<ActiveQuizSession | null>(KEYS.ACTIVE_SESSION, null);
}

export function saveActiveSession(session: ActiveQuizSession | null) {
  if (!session) {
    safeRemoveItem(KEYS.ACTIVE_SESSION);
    return { ok: true };
  }
  return safeSetItem(KEYS.ACTIVE_SESSION, session);
}

export function loadHostConfig(): HostConfig {
  return {
    ...DEFAULT_HOST_CONFIG,
    ...safeGetItem<Partial<HostConfig>>(KEYS.HOST_CONFIG, {}),
  };
}

export function saveHostConfig(config: HostConfig) {
  return safeSetItem(KEYS.HOST_CONFIG, config);
}

export function loadSettings(): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...safeGetItem<Partial<AppSettings>>(KEYS.SETTINGS, {}),
  };
}

export function saveSettings(settings: AppSettings) {
  return safeSetItem(KEYS.SETTINGS, settings);
}

export function hasSeenGuide(): boolean {
  try {
    return window.localStorage.getItem(KEYS.GUIDE_SEEN) === '1';
  } catch {
    return false;
  }
}

export function markGuideSeen(): void {
  try {
    window.localStorage.setItem(KEYS.GUIDE_SEEN, '1');
  } catch {
    // ignore
  }
}
