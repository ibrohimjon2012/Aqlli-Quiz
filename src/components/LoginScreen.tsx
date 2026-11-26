import React, { useState } from 'react';
import { ArrowRight, BookOpen, Code2, GraduationCap, HelpCircle, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginScreenProps {
  onLogin: (profile: UserProfile) => void;
  onOpenGuide: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onOpenGuide }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [grade, setGrade] = useState<number>(8);
  const [error, setError] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const [heroError, setHeroError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    if (!cleanFirst || cleanFirst.length < 2) {
      setError('Iltimos, ismingizni kamida 2 ta harf bilan kiriting.');
      return;
    }
    if (!cleanLast || cleanLast.length < 2) {
      setError('Iltimos, familiyangizni kamida 2 ta harf bilan kiriting.');
      return;
    }
    if (grade < 1 || grade > 11) {
      setError('Sinf 1 dan 11 gacha bo‘lishi kerak.');
      return;
    }

    setError('');
    onLogin({
      firstName: cleanFirst,
      lastName: cleanLast,
      grade,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 lg:py-12 space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Chap qism: Kirish formasi */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-wide text-sky-600 dark:text-sky-400">
                Parolsiz tezkor kirish · Oflayn ishlaydi
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white text-balance">
                Bilimingizni sinang va oltin tangalar yig‘ing
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Informatika, Ingliz tili, Matematika, Ona tili va Rus tili fanlaridan qiziqarli viktorinalar, AI maslahatchi va elektron darsliklar.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="login-firstname"
                    className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
                  >
                    Ismingiz
                  </label>
                  <input
                    id="login-firstname"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Masalan: Azizbek"
                    maxLength={40}
                    className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="login-lastname"
                    className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
                  >
                    Familiyangiz
                  </label>
                  <input
                    id="login-lastname"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Masalan: Karimov"
                    maxLength={40}
                    className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-grade"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
                >
                  Sinfingiz (1–11)
                </label>
                <select
                  id="login-grade"
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => (
                    <option key={g} value={g}>
                      {g}-sinf {g === 8 ? '(Informatika asosiy)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-300"
                >
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="min-h-[48px] flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white font-semibold text-base shadow-sm transition-all whitespace-nowrap"
                >
                  Ilovaga kirish
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={onOpenGuide}
                  className="min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition-colors whitespace-nowrap"
                >
                  <HelpCircle className="w-4 h-4" />
                  Qo‘llanmani ko‘rish
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Informatika o‘qituvchisi: <strong className="text-slate-700 dark:text-slate-200">Shohista Qodirova</strong>
            </span>
          </div>
        </div>

        {/* O'ng qism: Illyustratsiya */}
        <div className="lg:col-span-6 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-sky-50 dark:bg-slate-900 flex flex-col">
          <div className="relative flex-1 min-h-[260px]">
            {!heroError ? (
              <img
                src="/src/assets/images/hero_smart_quiz_1795705492053.jpg"
                alt="Smart Quiz o‘quv maydoni"
                referrerPolicy="no-referrer"
                onError={() => setHeroError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-sky-100 to-teal-100 dark:from-sky-950 dark:to-teal-950 text-center">
                <BookOpen className="w-16 h-16 text-sky-600 dark:text-sky-400 mb-3" />
                <p className="font-bold text-slate-800 dark:text-slate-100">Smart Quiz Ta’lim Platformasi</p>
              </div>
            )}
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-extrabold font-mono tabular-nums text-sky-600 dark:text-sky-400">300+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Qiziqarli savollar</div>
            </div>
            <div>
              <div className="text-xl font-extrabold font-mono tabular-nums text-teal-600 dark:text-teal-400">5 ta</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Maktab fanlari</div>
            </div>
            <div>
              <div className="text-xl font-extrabold font-mono tabular-nums text-amber-600 dark:text-amber-400">1–11</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sinf darsliklari</div>
            </div>
          </div>
        </div>
      </div>

      {/* Kim yaratgan? bo'limi */}
      <section
        aria-labelledby="about-author-heading"
        className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-teal-50 dark:bg-teal-950">
            {!avatarError ? (
              <img
                src="/src/assets/images/author_ibrohimjon_1795705493261.jpg"
                alt="Ibrohimjon Abdumajidov — Quiz muallifi"
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Code2 className="w-10 h-10" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-300">
              <Sparkles className="w-4 h-4" />
              <span>Kim yaratgan?</span>
              <span aria-hidden="true">·</span>
              <span>15 yoshli yosh dasturchi</span>
            </div>
            <h2 id="about-author-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Ibrohimjon Abdumajidov
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              Salom! Men Ibrohimjon Abdumajidovman, 15 yoshli dasturchiman. Shu kungacha ko‘plab foydali veb-saytlar, qiziqarli o‘yinlar va ta’limiy dasturlar yaratganman. Ushbu «Smart Quiz» platformasini maktab o‘quvchilari, ayniqsa 8-sinf do‘stlarim informatika va boshqa fanlarni zavq bilan, oson o‘rganishlari uchun yaratdim!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
