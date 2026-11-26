import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Bot,
  ChevronLeft,
  ChevronRight,
  Coins,
  ShieldCheck,
  UserCheck,
  Volume2,
  X,
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    title: '1. Oson kirish (parolsiz)',
    description:
      'Ilovaga kirish uchun faqat Ism, Familiya va Sinfingizni (1–11) tanlaysiz. Barcha ballar, tangalar va sertifikatlaringiz qurilmangizda internetsiz ham saqlanadi.',
    icon: UserCheck,
    accent: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60',
  },
  {
    title: '2. Rol tanlash: O‘yinchi yoki Boshlovchi',
    description:
      'Bosh ekranda "O‘yinchi bo‘laman" tugmasini bosib test yechishingiz yoki "Boshlovchi bo‘laman" orqali taymer, vaqt qo‘shish va natijalar jadvalini boshqarishingiz mumkin.',
    icon: ShieldCheck,
    accent: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60',
  },
  {
    title: '3. Savolga javob va jonli o‘zbekcha erkak ovozi',
    description:
      'Har bir savolda variantni belgilab "Tasdiqlash"ni bosing. Savollar jonli, tushunarli erkak ovozida avtomatik o‘qib beriladi va darhol sodda tushuntirish chiqadi.',
    icon: Volume2,
    accent: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60',
  },
  {
    title: '4. Oltin tangalar yig‘ing',
    description:
      'Har bir quiz oxirida to‘plagan ballingizga qarab 2 dan 100 tagacha oltin tanga olasiz! Tangalarni AI yordamchidan maslahat olish uchun ishlatishingiz mumkin.',
    icon: Coins,
    accent: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60',
  },
  {
    title: '5. Aqlli AI yordamchi',
    description:
      'Savolga qiynalsangiz "Tushunmadim, AI‘dan so‘ra" tugmasini bosing. Birinchi marta BEPUL, keyin 5 tanga. AI javobni aytmasdan sodda ishora beradi. Internetsiz ham ichki tushuntirish ishlaydi!',
    icon: Bot,
    accent: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
  },
  {
    title: '6. Elektron kitoblar va Sertifikat',
    description:
      'Kitoblar bo‘limida istalgan darslik ustiga bossangiz darhol ichki o‘quvchida boblar, misollar va ovozli o‘qish bilan ochiladi. Har bir o‘yinchi PNG sertifikat yuklab oladi.',
    icon: Award,
    accent: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60',
  },
  {
    title: '7. Yangi menyu: Aqlli Laboratoriya',
    description:
      'Yangi «Laboratoriya» bo‘limida Scratch bloklarini yig‘ib mushukchani harakatlantiring, rasmli kartochkalar bilan qoidalarni yodlang va har kuni +10 bonus tanga yuting (urinish sarflanmaydi).',
    icon: BookOpen,
    accent: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60',
  },
];

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);

  if (!isOpen) return null;

  const current = STEPS[stepIndex];
  const Icon = current.icon;
  const isLast = stepIndex === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
            <h2 id="guide-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
              Smart Quiz Qo‘llanmasi
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label="Qo‘llanmani yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 items-center">
            <div className="sm:col-span-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 aspect-[4/3]">
              <img
                src="/src/assets/images/guide_learning_1795705493456.jpg"
                alt="Smart Quiz o‘quv qo‘llanmasi"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="sm:col-span-3 space-y-3">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${current.accent}`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                Qadam {stepIndex + 1} / {STEPS.length}
              </p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {current.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {current.description}
              </p>
            </div>
          </div>

          {/* Step progress selector */}
          <div className="flex items-center justify-center gap-2">
            {STEPS.map((s, idx) => (
              <button
                key={s.title}
                type="button"
                onClick={() => setStepIndex(idx)}
                aria-label={`${idx + 1}-qadamga o‘tish`}
                className={`h-2.5 rounded-full transition-all ${
                  idx === stepIndex
                    ? 'w-8 bg-sky-600 dark:bg-sky-400'
                    : 'w-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={stepIndex === 0}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap"
          >
            <ChevronLeft className="w-4 h-4" />
            Oldingi
          </button>

          <div className="flex items-center gap-3">
            {!isLast && (
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
              >
                O‘tkazib yuborish
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (isLast) {
                  onClose();
                } else {
                  setStepIndex((prev) => Math.min(STEPS.length - 1, prev + 1));
                }
              }}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-sm transition-colors whitespace-nowrap"
            >
              {isLast ? 'Tushunarli, boshlaymiz!' : 'Keyingi'}
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
