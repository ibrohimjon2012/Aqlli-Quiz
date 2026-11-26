import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertOctagon,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Pause,
  Play,
  Plus,
  RotateCcw,
  ShieldAlert,
  SkipForward,
  Volume2,
  VolumeX,
  WifiOff,
  XCircle,
} from 'lucide-react';
import {
  ActiveQuizSession,
  AppSettings,
  PlayerProgress,
  UserProfile,
} from '../types';
import { getSubjectMeta } from '../utils/quizLogic';
import { playSoundEffect, speakText, stopSpeaking } from '../utils/speechAndSound';

interface QuizArenaProps {
  session: ActiveQuizSession;
  profile: UserProfile;
  progress: PlayerProgress;
  settings: AppSettings;
  isOnline: boolean;
  onUpdateSession: (next: ActiveQuizSession) => void;
  onToggleAutoSpeak: () => void;
  onConsumeAIHint: (usedFree: boolean) => void;
  onFinishQuiz: (finalSession: ActiveQuizSession, terminatedByCheat: boolean) => void;
}

export const QuizArena: React.FC<QuizArenaProps> = ({
  session,
  profile,
  progress,
  settings,
  isOnline,
  onUpdateSession,
  onToggleAutoSpeak,
  onConsumeAIHint,
  onFinishQuiz,
}) => {
  const currentQ = session.questions[session.currentIndex];
  const subjectMeta = getSubjectMeta(session.subject);
  const totalQuestions = session.questions.length;

  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [cheatBanner, setCheatBanner] = useState<{
    title: string;
    detail: string;
    count: number;
  } | null>(null);
  const [screenBlurred, setScreenBlurred] = useState(false);

  const sessionRef = useRef(session);
  sessionRef.current = session;
  const lastViolationTimeRef = useRef(0);

  // Savol o'zgarganda AI hintni tozalash va savolni ovozda o'qish
  useEffect(() => {
    setAiHint(null);
    setAiMessage(null);

    if (settings.autoSpeak && currentQ) {
      const res = speakText(currentQ.question, subjectMeta.speechLang);
      if (!res.supported) {
        setSpeechNotice('Bu qurilmada ovozli o‘qish (SpeechSynthesis) qo‘llab-quvvatlanmaydi.');
      } else if (res.usedFallbackLang) {
        setSpeechNotice(
          `Qurilmada o‘zbekcha ovoz topilmadi, avtomatik ${res.actualLang} ovoziga o‘tildi.`
        );
      } else {
        setSpeechNotice(null);
      }
    } else {
      stopSpeaking();
    }

    return () => {
      stopSpeaking();
    };
  }, [session.currentIndex, currentQ?.id, settings.autoSpeak, subjectMeta.speechLang]);

  // Taymer ishlashi
  useEffect(() => {
    if (session.timerMode === 'none' || session.isPaused) return;

    const timer = window.setInterval(() => {
      const s = sessionRef.current;
      if (s.isPaused || s.timerMode === 'none') return;

      if (s.remainingSeconds <= 1) {
        if (s.timerMode === 'total') {
          onFinishQuiz({ ...s, remainingSeconds: 0 }, false);
        } else if (s.timerMode === 'per_question') {
          // Savol vaqti tugasa avtomatik keyingi savolga o'tish yoki yakunlash
          const alreadyAnswered = s.answers.some((a) => a.questionId === currentQ.id);
          const nextAnswers = alreadyAnswered
            ? s.answers
            : [
                ...s.answers,
                {
                  questionId: currentQ.id,
                  questionNumber: s.currentIndex + 1,
                  question: currentQ.question,
                  topic: currentQ.topic,
                  selectedOption: s.selectedOption,
                  correctAnswer: currentQ.correctAnswer,
                  isCorrect: s.selectedOption === currentQ.correctAnswer,
                  explanation: currentQ.explanation,
                  options: currentQ.shuffledOptions,
                },
              ];

          if (s.currentIndex + 1 >= s.questions.length) {
            onFinishQuiz({ ...s, answers: nextAnswers, remainingSeconds: 0 }, false);
          } else {
            onUpdateSession({
              ...s,
              answers: nextAnswers,
              currentIndex: s.currentIndex + 1,
              selectedOption: null,
              isConfirmed: false,
              remainingSeconds: s.perQuestionLimit,
            });
          }
        }
      } else {
        onUpdateSession({ ...s, remainingSeconds: s.remainingSeconds - 1 });
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [session.timerMode, session.isPaused, currentQ?.id, onFinishQuiz, onUpdateSession]);

  // Firibgarlikka qarshi himoya (faqat QuizArena davomida faol!)
  const registerViolation = useCallback(
    (reason: string) => {
      const now = Date.now();
      // Bir vaqtning o'zida blur + visibilitychange ikki marta hisoblanmasligi uchun 900ms debounce
      if (now - lastViolationTimeRef.current < 900) return;
      lastViolationTimeRef.current = now;

      const s = sessionRef.current;
      const nextCount = s.violations + 1;
      const addedPenalty = nextCount === 2 ? 10 : 0;
      const nextPenalty = s.penaltyPoints + addedPenalty;

      playSoundEffect('warning', settings.soundEffects);

      if (nextCount >= 3) {
        const finalState: ActiveQuizSession = {
          ...s,
          violations: nextCount,
          penaltyPoints: nextPenalty,
        };
        onFinishQuiz(finalState, true);
        return;
      }

      const detail =
        nextCount === 1
          ? `1-qoidabuzarlik (${reason}): Ogohlantirish! Keyingi safar -10 ball yechiladi.`
          : `2-qoidabuzarlik (${reason}): -10 ball jarima qo‘llanildi! 3-qoidabuzarlikda quiz to‘xtatiladi.`;

      setCheatBanner({
        title: 'Jazo qo‘llanildi!',
        detail,
        count: nextCount,
      });

      onUpdateSession({
        ...s,
        violations: nextCount,
        penaltyPoints: nextPenalty,
      });
    },
    [onFinishQuiz, onUpdateSession, settings.soundEffects]
  );

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        registerViolation('Boshqa oynaga yoki ilovaga o‘tildi');
      }
    };
    const handleBlur = () => {
      registerViolation('Oyna fokusdan chiqdi (Alt+Tab)');
    };
    const handleCopyCut = (e: ClipboardEvent) => {
      e.preventDefault();
      registerViolation('Nusxa olishga urinish');
    };
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      registerViolation('O‘ng tugma menyusi');
    };
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        setScreenBlurred(true);
        window.setTimeout(() => setScreenBlurred(false), 2200);
        registerViolation('Skrinshot olish taqiqlanadi');
        return;
      }

      if (
        e.key === 'F12' ||
        (ctrlOrMeta && ['c', 'u', 's', 'p', 'x'].includes(key)) ||
        (ctrlOrMeta && e.shiftKey && ['i', 'j', 'c'].includes(key))
      ) {
        e.preventDefault();
        registerViolation(`Taqiqlangan tugma (${e.key})`);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        setScreenBlurred(true);
        window.setTimeout(() => setScreenBlurred(false), 2200);
        registerViolation('Skrinshot olish taqiqlanadi');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('copy', handleCopyCut);
    document.addEventListener('cut', handleCopyCut);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('copy', handleCopyCut);
      document.removeEventListener('cut', handleCopyCut);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [registerViolation]);

  const handleConfirmAnswer = () => {
    if (!session.selectedOption || session.isConfirmed) return;
    const isCorrect = session.selectedOption === currentQ.correctAnswer;
    playSoundEffect(isCorrect ? 'correct' : 'wrong', settings.soundEffects);

    const record = {
      questionId: currentQ.id,
      questionNumber: session.currentIndex + 1,
      question: currentQ.question,
      topic: currentQ.topic,
      selectedOption: session.selectedOption,
      correctAnswer: currentQ.correctAnswer,
      isCorrect,
      explanation: currentQ.explanation,
      options: currentQ.shuffledOptions,
    };

    onUpdateSession({
      ...session,
      isConfirmed: true,
      answers: [...session.answers, record],
    });
  };

  const handleNextQuestion = () => {
    if (session.currentIndex + 1 >= totalQuestions) {
      onFinishQuiz(session, false);
    } else {
      onUpdateSession({
        ...session,
        currentIndex: session.currentIndex + 1,
        selectedOption: null,
        isConfirmed: false,
        remainingSeconds:
          session.timerMode === 'per_question'
            ? session.perQuestionLimit
            : session.remainingSeconds,
      });
    }
  };

  const handleAskAI = async () => {
    if (aiLoading) return;

    const isFree = !progress.aiFreeUsed;
    if (!isFree && progress.coins < 5) {
      setAiMessage(
        'AI yordamchidan foydalanish uchun kamida 5 ta oltin tanga kerak. Hozir tangalaringiz yetarli emas!'
      );
      return;
    }

    if (!isOnline) {
      setAiMessage('Hozir internet yo‘q, ichki tushuntirish ko‘rsatildi.');
      setAiHint(currentQ.explanation);
      return;
    }

    setAiLoading(true);
    setAiMessage(null);
    try {
      const resp = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ.question,
          options: currentQ.shuffledOptions,
          subject: subjectMeta.title,
          level: currentQ.level,
          studentGrade: profile.grade,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.hint) {
        throw new Error(data.error || 'Server xatosi');
      }
      setAiHint(data.hint);
      onConsumeAIHint(isFree);
    } catch {
      // Internet uzilib qolsa yoki API javob bermasa ichki tushuntirishga o'tish
      setAiMessage('Hozir internet yo‘q yoki AI ulanmadi, ichki tushuntirish ko‘rsatildi.');
      setAiHint(currentQ.explanation);
    } finally {
      setAiLoading(false);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (!currentQ) return null;

  const progressPct = Math.round(((session.currentIndex + (session.isConfirmed ? 1 : 0)) / totalQuestions) * 100);
  const currentRecord = session.answers.find((a) => a.questionId === currentQ.id);

  return (
    <div
      className={`quiz-protected relative mx-auto max-w-4xl px-4 sm:px-6 py-5 sm:py-8 space-y-5 transition-all ${
        screenBlurred ? 'blur-xl opacity-10' : ''
      }`}
    >
      {/* Foydalanuvchi identifikatori va skrinshot taqiqi suv belgisi */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-10 overflow-hidden opacity-[0.045] dark:opacity-[0.06] flex flex-wrap items-center justify-around gap-16 rotate-[-22deg] select-none"
      >
        {Array.from({ length: 8 }).map((_, idx) => (
          <span key={idx} className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
            {profile.firstName} {profile.lastName} · {profile.grade}-sinf · Skrinshot olish taqiqlanadi
          </span>
        ))}
      </div>

      {/* Skrinshot va firibgarlikka qarshi ogohlantirish banneri */}
      {cheatBanner && (
        <div
          role="alert"
          className="relative z-30 rounded-2xl bg-rose-600 text-white p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-extrabold text-base sm:text-lg">{cheatBanner.title}</h2>
              <p className="text-sm text-rose-100">{cheatBanner.detail}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCheatBanner(null)}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-semibold whitespace-nowrap self-end sm:self-center"
          >
            Tushundim ({cheatBanner.count}/3)
          </button>
        </div>
      )}

      {/* Boshlovchi (Host) jonli boshqaruv paneli */}
      {session.hostSupervised && (
        <div className="relative z-20 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white p-3.5 sm:px-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-300">
            <span>Boshlovchi boshqaruvi faol</span>
            {session.isPaused && <span>· PAUZADA</span>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {session.timerMode !== 'none' && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSession({ ...session, remainingSeconds: session.remainingSeconds + 30 })
                  }
                  className="min-h-[36px] inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  +30 sek
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSession({ ...session, remainingSeconds: session.remainingSeconds + 60 })
                  }
                  className="min-h-[36px] inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  +1 daqiqa
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => onUpdateSession({ ...session, isPaused: !session.isPaused })}
              className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold"
            >
              {session.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              {session.isPaused ? 'Davom ettirish' : 'To‘xtatish'}
            </button>
            <button
              type="button"
              onClick={() => {
                const alreadyAnswered = session.answers.some((a) => a.questionId === currentQ.id);
                const nextAnswers = alreadyAnswered
                  ? session.answers
                  : [
                      ...session.answers,
                      {
                        questionId: currentQ.id,
                        questionNumber: session.currentIndex + 1,
                        question: currentQ.question,
                        topic: currentQ.topic,
                        selectedOption: session.selectedOption,
                        correctAnswer: currentQ.correctAnswer,
                        isCorrect: session.selectedOption === currentQ.correctAnswer,
                        explanation: currentQ.explanation,
                        options: currentQ.shuffledOptions,
                      },
                    ];
                if (session.currentIndex + 1 >= totalQuestions) {
                  onFinishQuiz({ ...session, answers: nextAnswers }, false);
                } else {
                  onUpdateSession({
                    ...session,
                    answers: nextAnswers,
                    currentIndex: session.currentIndex + 1,
                    selectedOption: null,
                    isConfirmed: false,
                    remainingSeconds:
                      session.timerMode === 'per_question'
                        ? session.perQuestionLimit
                        : session.remainingSeconds,
                  });
                }
              }}
              className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
            >
              <SkipForward className="w-3.5 h-3.5" />
              Keyingi savolga o‘tkazish
            </button>
          </div>
        </div>
      )}

      {/* Yuqori holat qatori */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
          <span className="font-bold text-slate-900 dark:text-white">{subjectMeta.title}</span>
          <span aria-hidden="true">·</span>
          <span>{currentQ.level}</span>
          <span aria-hidden="true">·</span>
          <span>{currentQ.topic}</span>
          {session.isPracticeMode && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">Xatolar mashqi</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 tabular-nums text-sm font-bold">
          {session.timerMode !== 'none' && (
            <span
              className={`inline-flex items-center gap-1.5 ${
                session.remainingSeconds <= 15
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-800 dark:text-slate-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              {formatTimer(session.remainingSeconds)}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400" title="Qoidabuzarliklar">
            <ShieldAlert className="w-4 h-4" />
            {session.violations}/3
          </span>
          <span className="font-mono text-sky-600 dark:text-sky-400">
            {session.currentIndex + 1} / {totalQuestions}
          </span>
        </div>
      </div>

      {/* Jarayon chizig'i */}
      <div className="relative z-20 w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-sky-600 dark:bg-sky-400 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Asosiy savol kartasi */}
      <div className="relative z-20 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-8 shadow-sm space-y-6">
        {/* Ovoz va AI tugmalari */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onToggleAutoSpeak}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {settings.autoSpeak ? (
                <Volume2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              {settings.autoSpeak ? 'Ovoz yoqilgan' : 'Ovoz o‘chiq'}
            </button>

            <button
              type="button"
              onClick={() => speakText(currentQ.question, subjectMeta.speechLang)}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Qayta o‘qi
            </button>
          </div>

          <button
            type="button"
            onClick={handleAskAI}
            disabled={aiLoading || session.isConfirmed}
            className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors whitespace-nowrap"
          >
            <Bot className="w-4 h-4" />
            {aiLoading
              ? 'AI o‘ylamoqda...'
              : !progress.aiFreeUsed
              ? "Tushunmadim, AI'dan so‘ra (Bepul)"
              : "Tushunmadim, AI'dan so‘ra (5 tanga)"}
          </button>
        </div>

        {/* Qurilma ovoz ogohlantirishi va Skrinshot eslatmasi */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{speechNotice || 'Skrinshot olish taqiqlanadi · Savol matni himoyalangan'}</span>
          <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
            <Coins className="w-3.5 h-3.5" />
            {progress.coins} tanga
          </span>
        </div>

        {/* AI javobi */}
        {(aiHint || aiMessage) && (
          <div className="rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 p-4 space-y-1.5">
            {aiMessage && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                {!isOnline && <WifiOff className="w-3.5 h-3.5" />}
                {aiMessage}
              </p>
            )}
            {aiHint && (
              <p className="text-sm text-teal-900 dark:text-teal-100 leading-relaxed">
                <strong>AI maslahati:</strong> {aiHint}
              </p>
            )}
          </div>
        )}

        {/* Savol matni */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
          {currentQ.question}
        </h2>

        {/* 4 ta javob varianti */}
        <div className="grid grid-cols-1 gap-3">
          {currentQ.shuffledOptions.map((option, idx) => {
            const letter = ['A', 'B', 'C', 'D'][idx] || String(idx + 1);
            const isSelected = session.selectedOption === option;
            const isCorrectOption = option === currentQ.correctAnswer;

            let btnStyle =
              'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 hover:border-sky-400 dark:hover:border-sky-500';

            if (!session.isConfirmed && isSelected) {
              btnStyle =
                'border-sky-600 dark:border-sky-400 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-100 ring-2 ring-sky-500/20';
            } else if (session.isConfirmed) {
              if (isCorrectOption) {
                btnStyle =
                  'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100';
              } else if (isSelected && !isCorrectOption) {
                btnStyle =
                  'border-rose-600 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-100';
              } else {
                btnStyle = 'border-slate-200 dark:border-slate-800 opacity-60';
              }
            }

            return (
              <button
                key={option}
                type="button"
                disabled={session.isConfirmed || session.isPaused}
                onClick={() => onUpdateSession({ ...session, selectedOption: option })}
                className={`min-h-[54px] w-full text-left rounded-2xl border p-4 flex items-center justify-between gap-4 transition-all ${btnStyle}`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-mono text-sm font-bold shrink-0">
                    {letter}
                  </span>
                  <span className="text-sm sm:text-base font-medium">{option}</span>
                </div>
                {session.isConfirmed && isCorrectOption && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                {session.isConfirmed && isSelected && !isCorrectOption && (
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tasdiqlagandan keyin sodda tushuntirish */}
        {session.isConfirmed && currentRecord && (
          <div
            className={`rounded-2xl border p-4 sm:p-5 space-y-1.5 ${
              currentRecord.isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
              {currentRecord.isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-800 dark:text-emerald-200">To‘g‘ri javob!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  <span className="text-rose-800 dark:text-rose-200">
                    Noto‘g‘ri. To‘g‘ri javob: {currentQ.correctAnswer}
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Tasdiqlash / Keyingi tugmalari */}
        <div className="flex justify-end pt-2">
          {!session.isConfirmed ? (
            <button
              type="button"
              disabled={!session.selectedOption || session.isPaused}
              onClick={handleConfirmAnswer}
              className="w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold text-base shadow-sm transition-colors"
            >
              Tasdiqlash
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-slate-900 dark:bg-white hover:opacity-90 text-white dark:text-slate-900 font-bold text-base shadow-sm transition-opacity"
            >
              {session.currentIndex + 1 >= totalQuestions ? 'Natijani ko‘rish' : 'Keyingi savol'}
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
