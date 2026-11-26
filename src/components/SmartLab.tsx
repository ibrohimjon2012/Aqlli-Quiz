import React, { useState } from 'react';
import {
  ArrowLeft,
  BookMarked,
  CheckCircle2,
  Coins,
  Flag,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Trash2,
  Volume2,
  Zap,
} from 'lucide-react';
import { AppSettings, PlayerProgress } from '../types';
import { playSoundEffect, speakText } from '../utils/speechAndSound';

interface SmartLabProps {
  progress: PlayerProgress;
  settings: AppSettings;
  onAwardDailyBonus: (coins: number) => void;
  onBack: () => void;
}

interface ScratchBlock {
  id: string;
  label: string;
  color: string;
  action: 'move' | 'jump' | 'turn' | 'say' | 'sound';
}

const AVAILABLE_BLOCKS: ScratchBlock[] = [
  { id: 'move', label: '10 qadam yurish', color: 'bg-sky-600', action: 'move' },
  { id: 'jump', label: 'Yuqoriga sakrash', color: 'bg-indigo-600', action: 'jump' },
  { id: 'turn', label: '15° burilish', color: 'bg-blue-600', action: 'turn' },
  { id: 'say', label: '"Salom!" deb aytish', color: 'bg-purple-600', action: 'say' },
  { id: 'sound', label: 'Tovush chiqarish', color: 'bg-pink-600', action: 'sound' },
];

const FLASHCARDS = [
  {
    subject: 'Informatika (Scratch)',
    image: '/src/assets/images/subj_informatics_1795709196869.jpg',
    front: 'Sprite (Sprayt) nima?',
    back: 'Scratch sahnasida harakatlanadigan, gapiradigan va o‘yinda ishtirok etadigan qahramon (obyekt).',
    lang: 'uz-UZ',
  },
  {
    subject: 'Informatika (Xavfsizlik)',
    image: '/src/assets/images/subj_informatics_1795709196869.jpg',
    front: 'Fishing (Phishing) nima?',
    back: 'Firibgarlarning ishonchli saytga o‘xshash soxta sahifa yasab, parol va karta ma’lumotlarini o‘g‘irlash usuli.',
    lang: 'uz-UZ',
  },
  {
    subject: 'Ingliz tili',
    image: '/src/assets/images/subj_english_1795709197123.jpg',
    front: 'Never give up!',
    back: 'Ma’nosi: Hech qachon taslim bo‘lma! ("give up" — taslim bo‘lmoq, tashlamoq).',
    lang: 'en-US',
  },
  {
    subject: 'Matematika',
    image: '/src/assets/images/subj_math_1795709197955.jpg',
    front: 'Pifagor teoremasi',
    back: 'To‘g‘ri burchakli uchburchakda katetlar kvadratlari yig‘indisi gipotenuza kvadratiga teng: a² + b² = c².',
    lang: 'uz-UZ',
  },
  {
    subject: 'Ona tili',
    image: '/src/assets/images/subj_uzbek_1795709198361.jpg',
    front: 'Omonim va Sinonim farqi',
    back: 'Sinonim — ma’nosi yaqin so‘zlar (go‘zal-chiroyli). Omonim — shakli bir xil, ma’nosi har xil so‘zlar (yuz).',
    lang: 'uz-UZ',
  },
  {
    subject: 'Rus tili',
    image: '/src/assets/images/subj_russian_1795709198252.jpg',
    front: 'Надеть va Одеть farqi',
    back: 'Надеть — kiyimni o‘ziga kiyish (надеть куртку). Одеть — boshqa birovni kiyintirish (одеть брата).',
    lang: 'ru-RU',
  },
];

const DAILY_TASKS = [
  {
    q: 'Scratch sahnasining eng markaziy koordinatasi qaysi?',
    options: ['x = 0, y = 0', 'x = 100, y = 100', 'x = 10, y = 0'],
    answer: 'x = 0, y = 0',
  },
  {
    q: '1 bayt necha bitdan tashkil topadi?',
    options: ['8 bit', '4 bit', '16 bit'],
    answer: '8 bit',
  },
  {
    q: 'Hujjatni tez saqlash tugmalari qaysi?',
    options: ['Ctrl + S', 'Ctrl + Z', 'Ctrl + P'],
    answer: 'Ctrl + S',
  },
];

export const SmartLab: React.FC<SmartLabProps> = ({
  progress,
  settings,
  onAwardDailyBonus,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'scratch' | 'cards' | 'daily'>('scratch');
  const [showLabGuide, setShowLabGuide] = useState(true);

  // Scratch ustaxonasi holati
  const [script, setScript] = useState<ScratchBlock[]>([
    AVAILABLE_BLOCKS[0],
    AVAILABLE_BLOCKS[3],
  ]);
  const [spriteX, setSpriteX] = useState(0);
  const [spriteY, setSpriteY] = useState(0);
  const [spriteDeg, setSpriteDeg] = useState(0);
  const [spriteSpeech, setSpriteSpeech] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Kartochkalar holati
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Kunlik bonus vazifa holati
  const todayStr = new Date().toISOString().slice(0, 10);
  const alreadyClaimedToday = progress.lastDailyChallengeDate === todayStr;
  const [dailyAnswers, setDailyAnswers] = useState<Record<number, string>>({});
  const [dailySubmitted, setDailySubmitted] = useState(false);

  const runScratchScript = async () => {
    if (isRunning || script.length === 0) return;
    setIsRunning(true);
    setSpriteSpeech(null);

    let x = spriteX;
    let y = spriteY;
    let deg = spriteDeg;

    for (const blk of script) {
      if (blk.action === 'move') {
        x = Math.min(90, x + 22);
        setSpriteX(x);
      } else if (blk.action === 'jump') {
        setSpriteY(-36);
        await new Promise((r) => setTimeout(r, 260));
        setSpriteY(0);
      } else if (blk.action === 'turn') {
        deg = (deg + 25) % 360;
        setSpriteDeg(deg);
      } else if (blk.action === 'say') {
        setSpriteSpeech('Salom, do‘stim!');
      } else if (blk.action === 'sound') {
        playSoundEffect('correct', settings.soundEffects);
      }
      await new Promise((r) => setTimeout(r, 420));
    }

    setIsRunning(false);
  };

  const resetStage = () => {
    setSpriteX(0);
    setSpriteY(0);
    setSpriteDeg(0);
    setSpriteSpeech(null);
  };

  const currentCard = FLASHCARDS[cardIndex];
  const dailyCorrectCount = DAILY_TASKS.filter(
    (t, idx) => dailyAnswers[idx] === t.answer
  ).length;

  const handleSubmitDaily = () => {
    setDailySubmitted(true);
    if (!alreadyClaimedToday && dailyCorrectCount === DAILY_TASKS.length) {
      playSoundEffect('coin', settings.soundEffects);
      onAwardDailyBonus(10);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
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
          onClick={() => setShowLabGuide((v) => !v)}
          className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 text-sm font-semibold"
        >
          <HelpCircle className="w-4 h-4" />
          {showLabGuide ? 'Qo‘llanmani yashirish' : 'Bu bo‘lim qanday ishlaydi?'}
        </button>
      </div>

      {/* Laboratoriya rasm banneri */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-3">
            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">
              Yangi bo‘lim · Urinish sarflanmaydi
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Sparkles className="w-7 h-7 text-teal-600 dark:text-teal-400 shrink-0" />
              Aqlli Laboratoriya (Amaliy Mashqlar)
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Test yechishdan tashqari Scratch bloklarini amalda sinab ko‘ring, rasmli kartochkalar bilan qoidalarni yodlang va kunlik bonus tangalarni qo‘lga kiriting!
            </p>
          </div>
          <div className="lg:col-span-5 min-h-[180px] bg-teal-50 dark:bg-slate-800">
            <img
              src="/src/assets/images/smart_lab_hero_1795709199157.jpg"
              alt="Aqlli Laboratoriya amaliy mashqlari"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Yangi menyu qo'llanmasi va nima qilishini tushuntiruvchi blok */}
      {showLabGuide && (
        <section className="rounded-3xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Laboratoriya qo‘llanmasi: bu bo‘lim nima qiladi va qanday qo‘llaniladi?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-1.5">
              <p className="font-bold text-sky-600 dark:text-sky-400">1. Scratch Mini-Ustaxonasi</p>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                <strong>Nima qiladi:</strong> 8-sinf Informatika darsidagi Scratch bloklarini jonli ko‘rsatadi.
                <br />
                <strong>Qanday qo‘llaniladi:</strong> Chapdagi rangli bloklarni bosing va «Yashil bayroqcha»ni ishga tushiring — qahramon sahnada harakatlanadi!
              </p>
            </div>
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-1.5">
              <p className="font-bold text-teal-600 dark:text-teal-400">2. Rasmli Kartochkalar</p>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                <strong>Nima qiladi:</strong> 5 ta fan bo‘yicha eng muhim atama va formulalarni tez eslab qolishga yordam beradi.
                <br />
                <strong>Qanday qo‘llaniladi:</strong> Kartochka ustiga bosib javobni oching va «Ovozda eshitish» bilan tinglang.
              </p>
            </div>
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-1.5">
              <p className="font-bold text-amber-600 dark:text-amber-400">3. Kunlik Bonus Vazifa</p>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                <strong>Nima qiladi:</strong> Har kuni 3 ta qisqa savol orqali qo‘shimcha <strong>+10 oltin tanga</strong> beradi.
                <br />
                <strong>Qanday qo‘llaniladi:</strong> Uchala javobni belgilab «Tekshirish» tugmasini bosing (urinish sarflanmaydi).
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Bo'limlar tanlovi */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'scratch' as const, label: 'Scratch Ustaxonasi', icon: Play },
          { id: 'cards' as const, label: 'Rasmli Kartochkalar', icon: BookMarked },
          { id: 'daily' as const, label: 'Kunlik Bonus (+10 tanga)', icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[46px] inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold border transition-colors ${
                active
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1-BO'LIM: SCRATCH USTAXONASI */}
      {activeTab === 'scratch' && (
        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white">Bloklarni tanlang (qo‘shish uchun bosing):</h3>
            <div className="space-y-2">
              {AVAILABLE_BLOCKS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setScript((prev) => [...prev.slice(0, 7), { ...b, id: `${b.id}-${Date.now()}` }])}
                  className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl text-white font-semibold text-sm text-left shadow-sm hover:opacity-90 transition-opacity ${b.color}`}
                >
                  + {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">Sizning dasturingiz ({script.length}/8):</h3>
              <button
                type="button"
                onClick={() => setScript([])}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 inline-flex items-center gap-1 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Tozalash
              </button>
            </div>
            <div className="min-h-[240px] rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 space-y-2">
              <div className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5" />
                Yashil bayroqcha bosilganda
              </div>
              {script.length === 0 ? (
                <p className="text-xs text-slate-400 pt-4">
                  Chap tomondagi bloklardan kamida bittasini qo‘shing.
                </p>
              ) : (
                script.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`px-3.5 py-2 rounded-xl text-white text-xs font-semibold flex items-center justify-between ${item.color}`}
                  >
                    <span>
                      {idx + 1}. {item.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setScript((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-white/80 hover:text-white font-bold px-1"
                      aria-label="Blokni o‘chirish"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">Scratch Sahnasi (Stage):</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={runScratchScript}
                  disabled={isRunning || script.length === 0}
                  className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Ishga tushir
                </button>
                <button
                  type="button"
                  onClick={resetStage}
                  className="min-h-[38px] inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Markaz
                </button>
              </div>
            </div>

            <div className="relative h-[240px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-sky-100 to-emerald-100 dark:from-slate-800 dark:to-slate-900 overflow-hidden flex items-center justify-center">
              <div className="absolute top-2.5 left-3 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                x: {spriteX} · y: {spriteY} · burchak: {spriteDeg}°
              </div>

              <div
                className="relative transition-all duration-300 flex flex-col items-center"
                style={{
                  transform: `translate(${spriteX}px, ${spriteY}px) rotate(${spriteDeg}deg)`,
                }}
              >
                {spriteSpeech && (
                  <div className="mb-2 px-3 py-1 rounded-xl bg-white text-slate-900 text-xs font-bold shadow border border-slate-200 whitespace-nowrap">
                    {spriteSpeech}
                  </div>
                )}
                <div className="w-16 h-16 rounded-2xl bg-amber-400 border-2 border-amber-600 shadow-md flex items-center justify-center text-3xl">
                  🐱
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2-BO'LIM: RASMLI KARTOCHKALAR */}
      {activeTab === 'cards' && (
        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>{currentCard.subject}</span>
            <span className="tabular-nums">
              Kartochka {cardIndex + 1} / {FLASHCARDS.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="w-full text-left rounded-3xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-950 hover:border-sky-500 transition-colors"
          >
            <div className="grid grid-cols-1 sm:grid-cols-5 items-stretch">
              <div className="sm:col-span-2 min-h-[160px] bg-slate-200 dark:bg-slate-800">
                <img
                  src={currentCard.image}
                  alt={currentCard.subject}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="sm:col-span-3 p-6 sm:p-8 flex flex-col justify-center space-y-3">
                <p className="text-xs font-bold text-sky-600 dark:text-sky-400">
                  {flipped ? 'IZOH VA QOIDA' : 'SAVOL / ATAMA (javob uchun bosing)'}
                </p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {flipped ? currentCard.back : currentCard.front}
                </h3>
              </div>
            </div>
          </button>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() =>
                speakText(
                  flipped ? currentCard.back : currentCard.front,
                  flipped ? 'uz-UZ' : currentCard.lang
                )
              }
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold"
            >
              <Volume2 className="w-4 h-4" />
              Ovozda eshitish
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFlipped(false);
                  setCardIndex((i) => (i - 1 + FLASHCARDS.length) % FLASHCARDS.length);
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold"
              >
                Oldingi
              </button>
              <button
                type="button"
                onClick={() => {
                  setFlipped(false);
                  setCardIndex((i) => (i + 1) % FLASHCARDS.length);
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold"
              >
                Keyingi
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3-BO'LIM: KUNLIK BONUS VAZIFA */}
      {activeTab === 'daily' && (
        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                Kunlik tezkor vazifa (+10 oltin tanga)
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Barcha 3 ta savolga to‘g‘ri javob bering va kuniga bir marta 10 ta bonus tanga oling!
              </p>
            </div>
          </div>

          {alreadyClaimedToday ? (
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-5 flex items-center gap-3 text-emerald-800 dark:text-emerald-200 font-semibold">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              Bugungi +10 tangalik kunlik bonusni allaqachon oldingiz! Ertaga yana qaytib keling.
            </div>
          ) : (
            <div className="space-y-5">
              {DAILY_TASKS.map((t, idx) => (
                <div
                  key={t.q}
                  className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 space-y-3"
                >
                  <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    {idx + 1}. {t.q}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {t.options.map((opt) => {
                      const selected = dailyAnswers[idx] === opt;
                      const isRight = dailySubmitted && opt === t.answer;
                      const isWrong = dailySubmitted && selected && opt !== t.answer;
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={dailySubmitted}
                          onClick={() => setDailyAnswers((prev) => ({ ...prev, [idx]: opt }))}
                          className={`min-h-[42px] px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                            isRight
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : isWrong
                              ? 'bg-rose-600 text-white border-rose-600'
                              : selected
                              ? 'bg-sky-600 text-white border-sky-600'
                              : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between gap-4">
                {dailySubmitted ? (
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Natija: {dailyCorrectCount} / {DAILY_TASKS.length} to‘g‘ri.
                    {dailyCorrectCount === DAILY_TASKS.length
                      ? ' Tabriklaymiz, +10 oltin tanga qo‘shildi!'
                      : ' Bonus olish uchun 3/3 to‘g‘ri bo‘lishi kerak. Qaytadan urinib ko‘ring!'}
                  </p>
                ) : (
                  <span className="text-xs text-slate-500">Urinish sarflanmaydi</span>
                )}

                {dailySubmitted && dailyCorrectCount < DAILY_TASKS.length ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDailyAnswers({});
                      setDailySubmitted(false);
                    }}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm"
                  >
                    Qayta urinish
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={dailySubmitted || Object.keys(dailyAnswers).length < DAILY_TASKS.length}
                    onClick={handleSubmitDaily}
                    className="min-h-[44px] px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-sm"
                  >
                    Tekshirish va bonus olish
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
