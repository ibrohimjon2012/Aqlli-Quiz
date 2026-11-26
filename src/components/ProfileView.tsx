import React from 'react';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Coins,
  Flame,
  Lock,
  LogOut,
  Trophy,
} from 'lucide-react';
import { PlayerProgress, QuizResultRecord, UserProfile } from '../types';
import { BADGE_DEFS } from '../utils/quizLogic';

interface ProfileViewProps {
  profile: UserProfile;
  progress: PlayerProgress;
  onBack: () => void;
  onViewCertificate: (result: QuizResultRecord) => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  progress,
  onBack,
  onViewCertificate,
  onLogout,
}) => {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Bosh sahifaga
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-sm font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Foydalanuvchini almashtirish
        </button>
      </div>

      {/* Profil sarlavhasi */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">
            {profile.grade}-sinf o‘quvchisi · Smart Quiz profili
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Yechilgan testlar: {progress.results.length} ta · AI maslahatlar: {progress.aiUsageCount} marta
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-5 py-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400 font-extrabold text-2xl font-mono tabular-nums">
              <Coins className="w-5 h-5" />
              {progress.coins}
            </div>
            <div className="text-xs text-amber-800 dark:text-amber-300 font-medium">Oltin tanga</div>
          </div>

          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-5 py-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-2xl font-mono tabular-nums">
              <Flame className="w-5 h-5" />
              {progress.streakDays}
            </div>
            <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">Kunlik seriya</div>
          </div>
        </div>
      </section>

      {/* Yutuq nishonlari (Badges) */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Yutuq nishonlari ({progress.badges.length} / {BADGE_DEFS.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BADGE_DEFS.map((b) => {
            const unlocked = progress.badges.includes(b.id);
            return (
              <div
                key={b.id}
                className={`rounded-2xl border p-4 flex items-start gap-3 ${
                  unlocked
                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 opacity-65'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {unlocked ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{b.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {b.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Oldingi natijalar va sertifikatlar */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          Olingan sertifikatlar tarixi ({progress.results.length})
        </h2>

        {progress.results.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hali yakunlangan viktorinalar yo‘q. Birinchi viktorinani o‘ynab sertifikat oling!
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {progress.results.map((r) => (
              <div
                key={r.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {r.subjectTitle} ({r.level}) —{' '}
                    <span className="font-mono text-sky-600 dark:text-sky-400">{r.finalScore} ball</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(r.dateISO).toLocaleString('uz-UZ')} · {r.correctCount}/{r.totalQuestions} to‘g‘ri · +{r.coinsEarned} tanga
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onViewCertificate(r)}
                  className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 whitespace-nowrap self-start sm:self-center"
                >
                  <Award className="w-4 h-4" />
                  Sertifikatni ochish
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
