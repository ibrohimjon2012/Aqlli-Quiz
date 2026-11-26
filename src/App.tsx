import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  HelpCircle,
  Menu,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { BooksSection } from './components/BooksSection';
import { GuideModal } from './components/GuideModal';
import { HomeDashboard } from './components/HomeDashboard';
import { HostPanel } from './components/HostPanel';
import { LoginScreen } from './components/LoginScreen';
import { ProfileView } from './components/ProfileView';
import { PWAInstallButton } from './components/PWAInstallButton';
import { QuizArena } from './components/QuizArena';
import { QuizSetup } from './components/QuizSetup';
import { ResultView } from './components/ResultView';
import { useOnlineStatus } from './hooks/usePWAInstall';
import {
  ActiveQuizSession,
  AppSettings,
  AppView,
  HostConfig,
  PlayerProgress,
  QuestionItem,
  QuizResultRecord,
  SubjectId,
  TimerMode,
  UserProfile,
  UserRole,
} from './types';
import {
  buildMistakesQuizQuestions,
  buildQuizQuestions,
  calculateCoins,
  evaluateBadges,
  getSubjectMeta,
  updateStreak,
} from './utils/quizLogic';
import {
  DEFAULT_PROGRESS,
  hasSeenGuide,
  loadActiveSession,
  loadHostConfig,
  loadProfile,
  loadProgress,
  loadSettings,
  markGuideSeen,
  saveActiveSession,
  saveHostConfig,
  saveProfile,
  saveProgress,
  saveSettings,
} from './utils/storage';

export default function App() {
  const isOnline = useOnlineStatus();

  const [profile, setProfile] = useState<UserProfile | null>(() => loadProfile());
  const [progress, setProgress] = useState<PlayerProgress>(() => loadProgress());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [hostConfig, setHostConfig] = useState<HostConfig>(() => loadHostConfig());
  const [activeSession, setActiveSession] = useState<ActiveQuizSession | null>(() =>
    loadActiveSession()
  );

  const [role, setRole] = useState<UserRole>('player');
  const [view, setView] = useState<AppView>(() => (loadActiveSession() ? 'quiz' : 'home'));
  const [selectedResult, setSelectedResult] = useState<QuizResultRecord | null>(
    () => loadProgress().results[0] || null
  );
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(() => !hasSeenGuide());
  const [recentCoinGain, setRecentCoinGain] = useState<number | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Yorug'/Qorong'i rejim va shrift o'lchamini HTML ildiziga qo'llash
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    const basePx = 16 + settings.fontSizeOffset * 1.5;
    root.style.fontSize = `${Math.max(13, Math.min(22, basePx))}px`;
    const saved = saveSettings(settings);
    if (!saved.ok && saved.error) setStorageWarning(saved.error);
  }, [settings]);

  const persistProgress = useCallback((next: PlayerProgress) => {
    setProgress(next);
    const saved = saveProgress(next);
    if (!saved.ok && saved.error) {
      setStorageWarning(saved.error);
    }
  }, []);

  const persistSession = useCallback((next: ActiveQuizSession | null) => {
    setActiveSession(next);
    const saved = saveActiveSession(next);
    if (!saved.ok && saved.error) {
      setStorageWarning(saved.error);
    }
  }, []);

  const handleCloseGuide = () => {
    setIsGuideOpen(false);
    markGuideSeen();
  };

  const handleLogin = (newProfile: UserProfile) => {
    setProfile(newProfile);
    const saved = saveProfile(newProfile);
    if (!saved.ok && saved.error) setStorageWarning(saved.error);
    setView('home');
  };

  const handleLogout = () => {
    saveProfile(null);
    persistSession(null);
    setProfile(null);
    setView('home');
  };

  const startStandardQuiz = (params: {
    subject: SubjectId;
    level: string;
    topic: string;
    questionCount: 10 | 20;
    timerMode: TimerMode;
    totalSeconds: number;
    perQuestionSeconds: number;
    hostSupervised?: boolean;
  }) => {
    if (progress.attemptsUsed >= progress.maxAttempts) {
      setView('host');
      return;
    }
    const questions = buildQuizQuestions(
      params.subject,
      params.level,
      params.topic,
      params.questionCount
    );
    if (questions.length === 0) return;

    const initialRemaining =
      params.timerMode === 'total'
        ? params.totalSeconds
        : params.timerMode === 'per_question'
        ? params.perQuestionSeconds
        : 0;

    const session: ActiveQuizSession = {
      questions,
      currentIndex: 0,
      selectedOption: null,
      isConfirmed: false,
      answers: [],
      violations: 0,
      penaltyPoints: 0,
      timerMode: params.timerMode,
      remainingSeconds: initialRemaining,
      perQuestionLimit: params.perQuestionSeconds,
      isPaused: false,
      hostSupervised: Boolean(params.hostSupervised),
      subject: params.subject,
      level: params.level,
      topic: params.topic,
      isPracticeMode: false,
      startedAt: new Date().toISOString(),
    };

    persistSession(session);
    setView('quiz');
    setMobileMenuOpen(false);
  };

  const handleStartMistakesMode = () => {
    if (progress.wrongQuestionsPool.length === 0) return;
    const questions = buildMistakesQuizQuestions(progress.wrongQuestionsPool);
    const first = questions[0];
    const session: ActiveQuizSession = {
      questions,
      currentIndex: 0,
      selectedOption: null,
      isConfirmed: false,
      answers: [],
      violations: 0,
      penaltyPoints: 0,
      timerMode: 'none',
      remainingSeconds: 0,
      perQuestionLimit: 30,
      isPaused: false,
      hostSupervised: false,
      subject: first.subject,
      level: first.level,
      topic: 'Xatolar ustida ishlash',
      isPracticeMode: true,
      startedAt: new Date().toISOString(),
    };
    persistSession(session);
    setView('quiz');
    setMobileMenuOpen(false);
  };

  const handleConsumeAIHint = (usedFree: boolean) => {
    const nextProgress: PlayerProgress = {
      ...progress,
      aiFreeUsed: true,
      aiUsageCount: progress.aiUsageCount + 1,
      coins: usedFree ? progress.coins : Math.max(0, progress.coins - 5),
    };
    nextProgress.badges = evaluateBadges(nextProgress);
    persistProgress(nextProgress);
  };

  const handleFinishQuiz = useCallback(
    (finalSession: ActiveQuizSession, terminatedByCheat: boolean) => {
      if (!profile) return;

      const totalQ = finalSession.questions.length;
      const answeredMap = new Map(finalSession.answers.map((a) => [a.questionId, a]));

      // Agar quiz muddatidan oldin (vaqt tugashi yoki 3-qoidabuzarlik) tugasa, qolgan savollarni ham tahlilga kiritamiz
      const fullAnswers = finalSession.questions.map((q, idx) => {
        const existing = answeredMap.get(q.id);
        if (existing) return existing;
        return {
          questionId: q.id,
          questionNumber: idx + 1,
          question: q.question,
          topic: q.topic,
          selectedOption: null,
          correctAnswer: q.correctAnswer,
          isCorrect: false,
          explanation: q.explanation,
          options: q.shuffledOptions,
        };
      });

      const correctCount = fullAnswers.filter((a) => a.isCorrect).length;
      const wrongCount = totalQ - correctCount;
      const rawScore = Math.round((correctCount / totalQ) * 100);
      const finalScore = Math.max(0, Math.min(100, rawScore - finalSession.penaltyPoints));
      const won = finalScore >= 50;
      const coinsEarned = finalSession.isPracticeMode
        ? Math.max(2, Math.round(calculateCoins(finalScore) / 2))
        : calculateCoins(finalScore);

      const subjectMeta = getSubjectMeta(finalSession.subject);
      const resultRecord: QuizResultRecord = {
        id: `res-${Date.now()}`,
        playerName: `${profile.firstName} ${profile.lastName}`,
        firstName: profile.firstName,
        lastName: profile.lastName,
        grade: profile.grade,
        subject: finalSession.subject,
        subjectTitle: subjectMeta.title,
        level: finalSession.level,
        topic: finalSession.topic,
        totalQuestions: totalQ,
        correctCount,
        wrongCount,
        rawScore,
        penaltyPoints: finalSession.penaltyPoints,
        finalScore,
        coinsEarned,
        won,
        violations: finalSession.violations,
        terminatedByCheat,
        isPracticeMode: finalSession.isPracticeMode,
        dateISO: new Date().toISOString(),
        answers: fullAnswers,
      };

      // Xato qilingan savollar hovuzini yangilash
      const wrongIds = new Set(fullAnswers.filter((a) => !a.isCorrect).map((a) => a.questionId));
      const correctIds = new Set(fullAnswers.filter((a) => a.isCorrect).map((a) => a.questionId));

      const poolMap = new Map<string, QuestionItem>();
      progress.wrongQuestionsPool.forEach((item) => {
        if (!correctIds.has(item.id)) {
          poolMap.set(item.id, item);
        }
      });
      finalSession.questions.forEach((q) => {
        if (wrongIds.has(q.id)) {
          poolMap.set(q.id, {
            id: q.id,
            subject: q.subject,
            level: q.level,
            topic: q.topic,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          });
        }
      });

      const streakInfo = updateStreak(progress);
      const nextProgress: PlayerProgress = {
        ...progress,
        coins: progress.coins + coinsEarned,
        attemptsUsed: finalSession.isPracticeMode
          ? progress.attemptsUsed
          : Math.min(progress.maxAttempts, progress.attemptsUsed + 1),
        streakDays: streakInfo.streakDays,
        lastPlayedDate: streakInfo.lastPlayedDate,
        wrongQuestionsPool: Array.from(poolMap.values()).slice(0, 60),
        results: [resultRecord, ...progress.results].slice(0, 50),
      };
      nextProgress.badges = evaluateBadges(nextProgress, resultRecord);

      persistProgress(nextProgress);
      persistSession(null);
      setSelectedResult(resultRecord);
      setRecentCoinGain(coinsEarned);
      window.setTimeout(() => setRecentCoinGain(null), 3500);
      setView('result');
    },
    [profile, progress, persistProgress, persistSession]
  );

  const isQuizActive = Boolean(profile && view === 'quiz' && activeSession);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* 3 zonali yuqori navigatsiya paneli */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
          {/* 1-zona: Brend nomi (bitta qator) */}
          <button
            type="button"
            onClick={() => {
              if (!isQuizActive) setView('home');
            }}
            className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
          >
            Smart Quiz
          </button>

          {/* 2-zona: 4 ta qisqa navigatsiya havolasi */}
          {profile && !isQuizActive ? (
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <button
                type="button"
                onClick={() => setView('home')}
                className={`hover:text-sky-600 dark:hover:text-sky-400 transition-colors whitespace-nowrap shrink-0 ${
                  view === 'home' ? 'text-sky-600 dark:text-sky-400' : ''
                }`}
              >
                Bosh sahifa
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('player');
                  setView('setup');
                }}
                className={`hover:text-sky-600 dark:hover:text-sky-400 transition-colors whitespace-nowrap shrink-0 ${
                  view === 'setup' ? 'text-sky-600 dark:text-sky-400' : ''
                }`}
              >
                Viktorina
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('host');
                  setView('host');
                }}
                className={`hover:text-sky-600 dark:hover:text-sky-400 transition-colors whitespace-nowrap shrink-0 ${
                  view === 'host' ? 'text-sky-600 dark:text-sky-400' : ''
                }`}
              >
                Boshlovchi
              </button>
              <button
                type="button"
                onClick={() => setView('books')}
                className={`hover:text-sky-600 dark:hover:text-sky-400 transition-colors whitespace-nowrap shrink-0 ${
                  view === 'books' ? 'text-sky-600 dark:text-sky-400' : ''
                }`}
              >
                Kitoblar
              </button>
              <button
                type="button"
                onClick={() => setView('profile')}
                className={`hover:text-sky-600 dark:hover:text-sky-400 transition-colors whitespace-nowrap shrink-0 ${
                  view === 'profile' ? 'text-sky-600 dark:text-sky-400' : ''
                }`}
              >
                Profil
              </button>
            </nav>
          ) : (
            <div className="hidden md:block" />
          )}

          {/* 3-zona: 1 ta asosiy harakat (PWA o'rnatish yoki Qo'llanma) + mobil menyu */}
          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton />
            {profile && !isQuizActive && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label="Menyu"
                className="md:hidden min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobil menyu */}
        {mobileMenuOpen && profile && !isQuizActive && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 flex flex-wrap gap-2">
            {[
              { label: 'Bosh sahifa', target: 'home' as AppView },
              { label: 'Viktorina', target: 'setup' as AppView },
              { label: 'Boshlovchi', target: 'host' as AppView },
              { label: 'Kitoblar', target: 'books' as AppView },
              { label: 'Profil', target: 'profile' as AppView },
            ].map((item) => (
              <button
                key={item.target}
                type="button"
                onClick={() => {
                  setView(item.target);
                  setMobileMenuOpen(false);
                }}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-sm font-semibold ${
                  view === item.target
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Qulayliklar va Internet holati paneli (headerdan alohida) */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Online/Offline holati */}
          <div className="flex items-center gap-2 font-semibold">
            {isOnline ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <Wifi className="w-3.5 h-3.5" />
                Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <WifiOff className="w-3.5 h-3.5" />
                Offline (internetsiz rejim)
              </span>
            )}
          </div>

          {/* Shrift A-/A+, Tovushlar, Yorug'/Qorong'i, Qo'llanma */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <button
                type="button"
                onClick={() =>
                  setSettings((s) => ({
                    ...s,
                    fontSizeOffset: Math.max(-2, s.fontSizeOffset - 1),
                  }))
                }
                aria-label="Shriftni kichiklashtirish"
                className="px-2.5 py-1.5 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                A-
              </button>
              <span className="px-1.5 text-slate-400">|</span>
              <button
                type="button"
                onClick={() =>
                  setSettings((s) => ({
                    ...s,
                    fontSizeOffset: Math.min(4, s.fontSizeOffset + 1),
                  }))
                }
                aria-label="Shriftni kattalashtirish"
                className="px-2.5 py-1.5 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                A+
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                setSettings((s) => ({ ...s, soundEffects: !s.soundEffects }))
              }
              aria-label="Tovush effektlarini yoqish yoki o‘chirish"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {settings.soundEffects ? (
                <Volume2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="hidden sm:inline">
                {settings.soundEffects ? 'Tovush bor' : 'Tovush o‘chiq'}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setSettings((s) => ({
                  ...s,
                  theme: s.theme === 'light' ? 'dark' : 'light',
                }))
              }
              aria-label="Yorug‘ va qorong‘i rejimni almashtirish"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {settings.theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  <span className="hidden sm:inline">Tungi rejim</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Kunduzgi rejim</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Qo‘llanma</span>
            </button>
          </div>
        </div>
      </div>

      {/* Xotira xatosi xabari */}
      {storageWarning && (
        <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 pt-4">
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 px-4 py-3 flex items-center justify-between gap-3 text-sm text-amber-900 dark:text-amber-200">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {storageWarning}
            </span>
            <button
              type="button"
              onClick={() => setStorageWarning(null)}
              className="font-bold underline"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

      {/* Asosiy sahifa tarkibi */}
      <main className="flex-1">
        {!profile ? (
          <LoginScreen onLogin={handleLogin} onOpenGuide={() => setIsGuideOpen(true)} />
        ) : view === 'quiz' && activeSession ? (
          <QuizArena
            session={activeSession}
            profile={profile}
            progress={progress}
            settings={settings}
            isOnline={isOnline}
            onUpdateSession={persistSession}
            onToggleAutoSpeak={() =>
              setSettings((s) => ({ ...s, autoSpeak: !s.autoSpeak }))
            }
            onConsumeAIHint={handleConsumeAIHint}
            onFinishQuiz={handleFinishQuiz}
          />
        ) : view === 'setup' ? (
          <QuizSetup
            progress={progress}
            onBack={() => setView('home')}
            onGoToHost={() => {
              setRole('host');
              setView('host');
            }}
            onStartQuiz={(params) => startStandardQuiz(params)}
          />
        ) : view === 'result' && selectedResult ? (
          <ResultView
            result={selectedResult}
            settings={settings}
            remainingAttempts={Math.max(0, progress.maxAttempts - progress.attemptsUsed)}
            wrongPoolCount={progress.wrongQuestionsPool.length}
            onPlayAgain={() => setView('setup')}
            onStartMistakesMode={handleStartMistakesMode}
            onGoHome={() => setView('home')}
          />
        ) : view === 'host' ? (
          <HostPanel
            config={hostConfig}
            progress={progress}
            onUpdateConfig={(next) => {
              setHostConfig(next);
              saveHostConfig(next);
            }}
            onStartHostedQuiz={(cfg) => startStandardQuiz(cfg)}
            onResetAttempts={() =>
              persistProgress({
                ...progress,
                attemptsUsed: 0,
              })
            }
            onClearResults={() =>
              persistProgress({
                ...progress,
                results: [],
                wrongQuestionsPool: [],
              })
            }
            onBack={() => setView('home')}
          />
        ) : view === 'books' ? (
          <BooksSection
            initialGrade={profile.grade}
            onBack={() => setView('home')}
          />
        ) : view === 'profile' ? (
          <ProfileView
            profile={profile}
            progress={progress}
            onBack={() => setView('home')}
            onViewCertificate={(res) => {
              setSelectedResult(res);
              setView('result');
            }}
            onLogout={handleLogout}
          />
        ) : (
          <HomeDashboard
            profile={profile}
            progress={progress}
            role={role}
            recentCoinGain={recentCoinGain}
            onSelectRole={(selectedRole, targetView) => {
              setRole(selectedRole);
              setView(targetView);
            }}
            onNavigate={(target) => setView(target)}
            onStartMistakesMode={handleStartMistakesMode}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        )}
      </main>

      {/* Sokin pastki qism */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-5 px-4 sm:px-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Smart Quiz · Muallif: Ibrohimjon Abdumajidov · Informatika o‘qituvchisi: Shohista Qodirova
      </footer>

      <GuideModal isOpen={isGuideOpen} onClose={handleCloseGuide} />
    </div>
  );
}

// Re-export DEFAULT_PROGRESS usage guard if needed
export { DEFAULT_PROGRESS };
