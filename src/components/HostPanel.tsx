import React, { useMemo } from 'react';
import {
  ArrowLeft,
  Clock,
  Play,
  RotateCcw,
  Sliders,
  Trash2,
  Users,
} from 'lucide-react';
import { HostConfig, PlayerProgress, SubjectId, TimerMode } from '../types';
import { SUBJECTS, getSubjectMeta, getTopicsForSubject } from '../utils/quizLogic';

interface HostPanelProps {
  config: HostConfig;
  progress: PlayerProgress;
  onUpdateConfig: (next: HostConfig) => void;
  onStartHostedQuiz: (config: HostConfig) => void;
  onResetAttempts: () => void;
  onClearResults: () => void;
  onBack: () => void;
}

export const HostPanel: React.FC<HostPanelProps> = ({
  config,
  progress,
  onUpdateConfig,
  onStartHostedQuiz,
  onResetAttempts,
  onClearResults,
  onBack,
}) => {
  const subjectMeta = useMemo(() => getSubjectMeta(config.subject), [config.subject]);
  const topics = useMemo(
    () => getTopicsForSubject(config.subject, config.level),
    [config.subject, config.level]
  );

  const remainingAttempts = Math.max(0, progress.maxAttempts - progress.attemptsUsed);
  const totalMinutes = Math.floor(config.totalSeconds / 60);
  const totalRemSeconds = config.totalSeconds % 60;

  const handleSubjectChange = (sub: SubjectId) => {
    const meta = getSubjectMeta(sub);
    onUpdateConfig({
      ...config,
      subject: sub,
      level: meta.levels[0],
      topic: 'Aralash',
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Bosh sahifaga
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onResetAttempts}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            Urinishlarni tiklash ({remainingAttempts}/3)
          </button>
          <button
            type="button"
            onClick={onClearResults}
            disabled={progress.results.length === 0}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-40 text-sm font-semibold transition-colors whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4" />
            Jadvalni tozalash
          </button>
        </div>
      </div>

      {/* Boshlovchi o'yin sozlamalari */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Sliders className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              Boshlovchi (Host) paneli
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              O‘yin taymerini sozlang, boshlovchi nazorati bilan viktorinani boshlang va o‘yin davomida vaqt qo‘shing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
              Fan
            </label>
            <select
              value={config.subject}
              onChange={(e) => handleSubjectChange(e.target.value as SubjectId)}
              className="w-full min-h-[46px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
            >
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
              Daraja
            </label>
            <select
              value={config.level}
              onChange={(e) =>
                onUpdateConfig({ ...config, level: e.target.value, topic: 'Aralash' })
              }
              className="w-full min-h-[46px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
            >
              {subjectMeta.levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
              Mavzu
            </label>
            <select
              value={config.topic}
              onChange={(e) => onUpdateConfig({ ...config, topic: e.target.value })}
              className="w-full min-h-[46px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
            >
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Taymer va savollar soni */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
              Savollar soni
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([10, 20] as const).map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => onUpdateConfig({ ...config, questionCount: cnt })}
                  className={`min-h-[46px] rounded-xl font-bold text-sm border ${
                    config.questionCount === cnt
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {cnt} ta
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
              Taymer rejimi
            </label>
            <select
              value={config.timerMode}
              onChange={(e) =>
                onUpdateConfig({ ...config, timerMode: e.target.value as TimerMode })
              }
              className="w-full min-h-[46px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
            >
              <option value="total">Umumiy taymer (butun quiz uchun)</option>
              <option value="per_question">Har bir savol uchun alohida vaqt</option>
              <option value="none">Taymersiz</option>
            </select>
          </div>

          {config.timerMode === 'total' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                Umumiy vaqt (Daqiqa : Sekund)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={totalMinutes}
                  onChange={(e) => {
                    const mins = Math.max(0, Math.min(120, Number(e.target.value) || 0));
                    onUpdateConfig({
                      ...config,
                      totalSeconds: Math.max(15, mins * 60 + totalRemSeconds),
                    });
                  }}
                  aria-label="Daqiqa"
                  className="w-full min-h-[46px] px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-center"
                />
                <span className="font-bold">:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={totalRemSeconds}
                  onChange={(e) => {
                    const secs = Math.max(0, Math.min(59, Number(e.target.value) || 0));
                    onUpdateConfig({
                      ...config,
                      totalSeconds: Math.max(15, totalMinutes * 60 + secs),
                    });
                  }}
                  aria-label="Sekund"
                  className="w-full min-h-[46px] px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-center"
                />
              </div>
            </div>
          )}

          {config.timerMode === 'per_question' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                Har bir savolga vaqt (sekund)
              </label>
              <input
                type="number"
                min={10}
                max={300}
                value={config.perQuestionSeconds}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    perQuestionSeconds: Math.max(10, Math.min(300, Number(e.target.value) || 30)),
                  })
                }
                className="w-full min-h-[46px] px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono"
              />
            </div>
          )}

          {config.timerMode === 'none' && (
            <div className="flex items-end">
              <p className="text-xs text-slate-500 dark:text-slate-400 pb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Vaqt cheklovisiz rejim tanlangan
              </p>
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Boshlovchi rejimida o‘yin payti <strong>+30 sek</strong>, <strong>+1 daqiqa</strong> qo‘shish, savolni to‘xtatish va keyingi savolga o‘tkazish tugmalari ko‘rinadi.
          </p>
          <button
            type="button"
            disabled={remainingAttempts <= 0}
            onClick={() => onStartHostedQuiz({ ...config, hostSupervised: true })}
            className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm shadow-sm transition-colors whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-current" />
            Boshlovchi nazoratida boshlash
          </button>
        </div>
      </section>

      {/* Lokal natijalar jadvali */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Natijalar jadvali ({progress.results.length})
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Ishlatilgan urinish: {progress.attemptsUsed} / {progress.maxAttempts}
          </span>
        </div>

        {progress.results.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Hali birorta quiz natijasi saqlanmagan. O‘yin yakunlangach barcha natijalar shu jadvalda ko‘rinadi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <th className="py-3 pr-4 font-semibold">Ism Familiya</th>
                  <th className="py-3 px-3 font-semibold">Sinf</th>
                  <th className="py-3 px-3 font-semibold">Fan</th>
                  <th className="py-3 px-3 font-semibold">Ball</th>
                  <th className="py-3 px-3 font-semibold">Holat</th>
                  <th className="py-3 pl-3 font-semibold">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {progress.results.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-white">
                      {r.playerName}
                    </td>
                    <td className="py-3 px-3 tabular-nums text-slate-600 dark:text-slate-300">
                      {r.grade}-sinf
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {r.subjectTitle} ({r.level})
                    </td>
                    <td className="py-3 px-3 font-mono font-bold tabular-nums text-sky-600 dark:text-sky-400">
                      {r.finalScore}
                    </td>
                    <td className="py-3 px-3 font-medium">
                      <span className={r.won ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                        {r.won ? 'Yutdi' : 'Yutmadi'}
                      </span>
                    </td>
                    <td className="py-3 pl-3 tabular-nums text-xs text-slate-500 dark:text-slate-400">
                      {new Date(r.dateISO).toLocaleDateString('uz-UZ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
