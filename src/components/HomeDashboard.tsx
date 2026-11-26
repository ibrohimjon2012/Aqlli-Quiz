import React from 'react';
import {
  Award,
  BookOpen,
  Coins,
  Flame,
  Gamepad2,
  HelpCircle,
  History,
  RefreshCw,
  Shield,
  Sliders,
  Trophy,
} from 'lucide-react';
import { AppView, PlayerProgress, UserProfile, UserRole } from '../types';

interface HomeDashboardProps {
  profile: UserProfile;
  progress: PlayerProgress;
  role: UserRole;
  recentCoinGain: number | null;
  onSelectRole: (role: UserRole, targetView: AppView) => void;
  onNavigate: (view: AppView) => void;
  onStartMistakesMode: () => void;
  onOpenGuide: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  profile,
  progress,
  role,
  recentCoinGain,
  onSelectRole,
  onNavigate,
  onStartMistakesMode,
  onOpenGuide,
}) => {
  const remainingAttempts = Math.max(0, progress.maxAttempts - progress.attemptsUsed);
  const lastResult = progress.results[0];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* O'quvchi holati va tangalar paneli */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>{profile.grade}-sinf o‘quvchisi</span>
              <span aria-hidden="true">·</span>
              <span>Joriy rol: {role === 'player' ? 'O‘yinchi' : 'Boshlovchi'}</span>
              {profile.grade === 8 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-sky-600 dark:text-sky-400 font-semibold">
                    Ustoz: Shohista Qodirova
                  </span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Xush kelibsiz, {profile.firstName} {profile.lastName}!
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Bugun qaysi rolda qatnashasiz? Istalgan payt rolni almashtirishingiz mumkin.
            </p>
          </div>

          {/* 3 ta asosiy ko'rsatkich */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0">
            <div className="relative rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-4 py-3 text-center">
              {recentCoinGain && recentCoinGain > 0 && (
                <div className="animate-coin-pop absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-amber-500 text-white text-xs font-bold px-2.5 py-1 shadow-md">
                  +{recentCoinGain} tanga yig‘ildi!
                </div>
              )}
              <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400">
                <Coins className="w-5 h-5" />
                <span className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums">
                  {progress.coins}
                </span>
              </div>
              <div className="text-xs font-medium text-amber-800 dark:text-amber-300 mt-0.5">
                Oltin tanga
              </div>
            </div>

            <div className="rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-sky-600 dark:text-sky-400">
                <Shield className="w-5 h-5" />
                <span className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums">
                  {remainingAttempts}/{progress.maxAttempts}
                </span>
              </div>
              <div className="text-xs font-medium text-sky-800 dark:text-sky-300 mt-0.5">
                Qolgan urinish
              </div>
            </div>

            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Flame className="w-5 h-5" />
                <span className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums">
                  {progress.streakDays}
                </span>
              </div>
              <div className="text-xs font-medium text-emerald-800 dark:text-emerald-300 mt-0.5">
                Kunlik seriya
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ikki katta rol tugmasi */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          type="button"
          onClick={() => onSelectRole('player', 'setup')}
          className="group text-left rounded-3xl bg-sky-600 hover:bg-sky-700 text-white p-7 sm:p-8 shadow-sm transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
            <span className="text-xs font-semibold text-sky-100 tabular-nums">
              Qolgan urinish: {remainingAttempts}/{progress.maxAttempts}
            </span>
          </div>
          <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold">O‘yinchi bo‘laman</h2>
          <p className="mt-2 text-sm sm:text-base text-sky-100 leading-relaxed">
            Fan va darajani tanlang, savollarga javob bering, tangalar yig‘ing va shaxsiy sertifikat oling!
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSelectRole('host', 'host')}
          className="group text-left rounded-3xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 p-7 sm:p-8 shadow-sm transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-300"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center">
              <Sliders className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            </div>
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">
              Nazorat va taymer
            </span>
          </div>
          <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Boshlovchi bo‘laman
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Viktorinani boshqaring, taymer o‘rnating, o‘yin payti vaqt qo‘shing va natijalar jadvalini kuzating.
          </p>
        </button>
      </section>

      {/* Qo'shimcha bo'limlar (rasmli kartochkalar) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <button
          type="button"
          onClick={() => onNavigate('lab')}
          className="text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-teal-400 dark:hover:border-teal-500 transition-colors flex flex-col"
        >
          <div className="h-24 w-full overflow-hidden bg-teal-50 dark:bg-slate-800">
            <img
              src="/src/assets/images/smart_lab_hero_1795709199157.jpg"
              alt="Aqlli Laboratoriya"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Aqlli Laboratoriya</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Scratch bloklari, kartochkalar va +10 tanga bonusi
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('books')}
          className="text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-sky-400 dark:hover:border-sky-600 transition-colors flex flex-col"
        >
          <div className="h-24 w-full overflow-hidden bg-sky-50 dark:bg-slate-800">
            <img
              src="/src/assets/images/books_library_1795709198453.jpg"
              alt="Elektron kitoblar"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Elektron kitoblar</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              1–11-sinf darsliklari (ichki o‘quvchi)
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={onStartMistakesMode}
          disabled={progress.wrongQuestionsPool.length === 0}
          className="text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 hover:border-amber-400 dark:hover:border-amber-600 disabled:opacity-55 disabled:cursor-not-allowed transition-colors flex flex-col justify-between"
        >
          <RefreshCw className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-3" />
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Xatolar ustida ishlash ({progress.wrongQuestionsPool.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Xato savollarni qayta yeching (urinish sanalmaydi)
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className="text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors flex flex-col justify-between"
        >
          <Trophy className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-3" />
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Profil va Yutuqlar ({progress.badges.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Yutuq nishonlari va sertifikatlar tarixi
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenGuide}
          className="text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors flex flex-col"
        >
          <div className="h-24 w-full overflow-hidden bg-indigo-50 dark:bg-slate-800">
            <img
              src="/src/assets/images/guide_learning_1795705493456.jpg"
              alt="Qo‘llanma"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Qo‘llanmani ko‘rish</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Ilova va yangi bo‘limlar bo‘yicha yo‘riqnoma
            </p>
          </div>
        </button>
      </section>

      {/* Oxirgi natija qisqa ko'rinishi */}
      {lastResult && (
        <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <History className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Oxirgi o‘yin · {lastResult.subjectTitle} ({lastResult.level})
              </p>
              <p className="font-bold text-slate-900 dark:text-white">
                {lastResult.finalScore} / 100 ball — {lastResult.won ? 'Yutdi!' : 'Hali yutmadi'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('result')}
            className="min-h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <Award className="w-4 h-4" />
            Natija va Sertifikatni ko‘rish
          </button>
        </section>
      )}
    </div>
  );
};
