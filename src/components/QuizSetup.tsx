import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Play,
  ShieldAlert,
} from 'lucide-react';
import { PlayerProgress, SubjectId, TimerMode } from '../types';
import { SUBJECTS, getSubjectMeta, getTopicsForSubject } from '../utils/quizLogic';

interface QuizSetupProps {
  progress: PlayerProgress;
  onBack: () => void;
  onGoToHost: () => void;
  onStartQuiz: (params: {
    subject: SubjectId;
    level: string;
    topic: string;
    questionCount: 10 | 20;
    timerMode: TimerMode;
    totalSeconds: number;
    perQuestionSeconds: number;
  }) => void;
}

export const QuizSetup: React.FC<QuizSetupProps> = ({
  progress,
  onBack,
  onGoToHost,
  onStartQuiz,
}) => {
  const [subject, setSubject] = useState<SubjectId>('informatics');
  const subjectMeta = useMemo(() => getSubjectMeta(subject), [subject]);
  const [level, setLevel] = useState<string>(subjectMeta.levels[0]);
  const topics = useMemo(() => getTopicsForSubject(subject, level), [subject, level]);
  const [topic, setTopic] = useState<string>('Aralash');
  const [questionCount, setQuestionCount] = useState<10 | 20>(10);
  const [timerMode, setTimerMode] = useState<TimerMode>('none');

  const remainingAttempts = Math.max(0, progress.maxAttempts - progress.attemptsUsed);
  const noAttemptsLeft = remainingAttempts <= 0;

  const handleSubjectChange = (newSub: SubjectId) => {
    setSubject(newSub);
    const meta = getSubjectMeta(newSub);
    setLevel(meta.levels[0]);
    setTopic('Aralash');
  };

  const handleLevelChange = (newLevel: string) => {
    setLevel(newLevel);
    setTopic('Aralash');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Bosh sahifaga
        </button>
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
          Qolgan urinish: <span className="text-sky-600 dark:text-sky-400">{remainingAttempts}/{progress.maxAttempts}</span>
        </div>
      </div>

      {noAttemptsLeft && (
        <div
          role="alert"
          className="rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-rose-900 dark:text-rose-200">
                Urinishlaringiz tugadi (0/3)
              </h2>
              <p className="text-sm text-rose-700 dark:text-rose-300 mt-1">
                Qayta o‘ynash uchun Boshlovchi panelidan «Urinishlarni tiklash» tugmasini bosing.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onGoToHost}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold whitespace-nowrap"
          >
            Boshlovchi paneliga o‘tish
          </button>
        </div>
      )}

      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-8 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Viktorinani sozlash
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Fan, daraja, mavzu va savollar sonini tanlang. Savollar va variantlar har safar aralashtiriladi.
          </p>
        </div>

        {/* 1. Fan tanlash */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-100">
            1. Fanni tanlang
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUBJECTS.map((s) => {
              const active = s.id === subject;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSubjectChange(s.id)}
                  className={`text-left rounded-2xl overflow-hidden border transition-all flex flex-col ${
                    active
                      ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/50 dark:border-sky-400 ring-2 ring-sky-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="h-28 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={s.image}
                      alt={s.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{s.title}</span>
                      {active && <CheckCircle2 className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {s.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Daraja tanlash */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-100">
            2. Darajani tanlang
          </label>
          <div className="flex flex-wrap gap-2">
            {subjectMeta.levels.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => handleLevelChange(lvl)}
                className={`min-h-[42px] px-4 py-2 rounded-xl text-sm font-semibold border transition-colors whitespace-nowrap ${
                  level === lvl
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Mavzu tanlash */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-100">
            3. Mavzuni tanlang
          </label>
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(t)}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-sm font-medium border transition-colors whitespace-nowrap ${
                  topic === t
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Savollar soni va Taymer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-100">
              4. Savollar soni
            </label>
            <div className="grid grid-cols-2 gap-3">
              {([10, 20] as const).map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`min-h-[46px] px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                    questionCount === cnt
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {cnt} ta savol
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-100">
              5. Vaqt rejimi
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'none' as TimerMode, label: 'Taymersiz' },
                { id: 'total' as TimerMode, label: '5 daqiqa' },
                { id: 'per_question' as TimerMode, label: '30 sek/savol' },
              ].map((tm) => (
                <button
                  key={tm.id}
                  type="button"
                  onClick={() => setTimerMode(tm.id)}
                  className={`min-h-[46px] px-2 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors ${
                    timerMode === tm.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {tm.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Himoya eslatmasi */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>Halol o‘yin qoidasi:</strong> Quiz davomida boshqa oynaga o‘tish, nusxa olish yoki skrinshot olish bloklanadi. 1-buzilishda ogohlantirish, 2-sida -10 ball, 3-sida quiz to‘xtatiladi. Yutish chegarasi: 50 balldan boshlab!
          </p>
        </div>

        <button
          type="button"
          disabled={noAttemptsLeft}
          onClick={() =>
            onStartQuiz({
              subject,
              level,
              topic,
              questionCount,
              timerMode,
              totalSeconds: 300,
              perQuestionSeconds: 30,
            })
          }
          className="w-full min-h-[52px] inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-base shadow-sm transition-all active:scale-[0.99]"
        >
          <Play className="w-5 h-5 fill-current" />
          Viktorinani boshlash ({subjectMeta.title})
        </button>
      </div>
    </div>
  );
};
