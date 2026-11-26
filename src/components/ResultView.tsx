import React, { useEffect, useMemo, useRef } from 'react';
import {
  Award,
  CheckCircle2,
  Coins,
  Download,
  Home,
  RefreshCw,
  RotateCcw,
  Trophy,
  Volume2,
  XCircle,
} from 'lucide-react';
import { AppSettings, QuizResultRecord } from '../types';
import { downloadCertificatePNG, renderCertificateCanvas } from '../utils/certificate';
import { getCertificateRank, getPraiseMessage } from '../utils/quizLogic';
import { playSoundEffect, speakText, stopSpeaking } from '../utils/speechAndSound';

interface ResultViewProps {
  result: QuizResultRecord;
  settings: AppSettings;
  remainingAttempts: number;
  wrongPoolCount: number;
  onPlayAgain: () => void;
  onStartMistakesMode: () => void;
  onGoHome: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  settings,
  remainingAttempts,
  wrongPoolCount,
  onPlayAgain,
  onStartMistakesMode,
  onGoHome,
}) => {
  const certCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const praise = useMemo(
    () =>
      getPraiseMessage(
        result.finalScore,
        result.firstName,
        result.lastName,
        result.grade,
        result.subject
      ),
    [result]
  );

  const wrongAnswers = useMemo(
    () => result.answers.filter((a) => !a.isCorrect),
    [result.answers]
  );

  // Sertifikatni chizish
  useEffect(() => {
    if (certCanvasRef.current) {
      renderCertificateCanvas(certCanvasRef.current, result);
    }
  }, [result]);

  // Ovozli tabrik va tovush effekti
  useEffect(() => {
    if (result.finalScore >= 90) {
      playSoundEffect('fanfare', settings.soundEffects);
    } else if (result.coinsEarned > 0) {
      playSoundEffect('coin', settings.soundEffects);
    }

    if (settings.autoSpeak) {
      speakText(`${praise.title}. ${praise.message}`, 'uz-UZ');
    }

    return () => {
      stopSpeaking();
    };
  }, [result.id]);

  // 90-100 ball uchun konfeti animatsiyasi
  useEffect(() => {
    if (!praise.isTopTier || !confettiCanvasRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = confettiCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#0284c7', '#f59e0b', '#10b981', '#e11d48', '#6366f1'];
    const particles = Array.from({ length: 110 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: 7 + Math.random() * 6,
      h: 10 + Math.random() * 8,
      vy: 2.5 + Math.random() * 3.5,
      vx: (Math.random() - 0.5) * 2,
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.14,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    let animId = 0;
    let frames = 0;
    const tick = () => {
      frames++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vRot;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (frames < 240) {
        animId = window.requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animId);
  }, [praise.isTopTier]);

  const rank = getCertificateRank(result.finalScore);

  return (
    <div className="relative mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {praise.isTopTier && (
        <canvas
          ref={confettiCanvasRef}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-40"
        />
      )}

      {/* Natija bosh kartasi */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {result.subjectTitle} · {result.level} · {result.topic}
              {result.isPracticeMode ? ' · Xatolar mashqi' : ''}
            </p>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {praise.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed">
              {praise.message}
            </p>
            {result.grade === 8 && result.subject === 'informatics' && (
              <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                Informatika o‘qituvchisi: Shohista Qodirova · Unvon: {rank}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div
              className={`rounded-2xl px-6 py-4 text-center border ${
                result.won
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
              }`}
            >
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                {result.finalScore}
                <span className="text-base font-medium text-slate-500">/100</span>
              </div>
              <div
                className={`mt-1 text-xs font-bold ${
                  result.won
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-amber-700 dark:text-amber-300'
                }`}
              >
                {result.won ? 'Yutdi!' : 'Hali yutmadi, yana urinib ko‘r'}
              </div>
            </div>
          </div>
        </div>

        {/* Yutdi / Yutqazdi chegarasi va maqtovni qayta eshitish */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs sm:text-sm">
          <span className="text-slate-600 dark:text-slate-300">
            G‘alaba chegarasi: <strong>50 ball va undan yuqori</strong> — «Yutdi», 50 dan past — «Hali yutmadi, yana urinib ko‘r».
          </span>
          <button
            type="button"
            onClick={() => speakText(`${praise.title}. ${praise.message}`, 'uz-UZ')}
            className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Volume2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            Maqtovni eshitish
          </button>
        </div>

        {/* 4 ta metrika */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              To‘g‘ri javoblar
            </div>
            <div className="mt-1 text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
              {result.correctCount} / {result.totalQuestions}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <XCircle className="w-4 h-4" />
              Xato javoblar
            </div>
            <div className="mt-1 text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
              {result.wrongCount}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              <Coins className="w-4 h-4" />
              Sovg‘a tangalar
            </div>
            <div className="mt-1 text-2xl font-extrabold font-mono tabular-nums text-amber-600 dark:text-amber-400">
              +{result.coinsEarned}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 text-xs font-semibold">
              <Trophy className="w-4 h-4" />
              Unvon
            </div>
            <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white truncate">
              {rank}
            </div>
          </div>
        </div>

        {result.penaltyPoints > 0 && (
          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">
            Himoya tizimi jarimasi: -{result.penaltyPoints} ball ({result.violations} ta qoidabuzarlik).
            {result.terminatedByCheat && ' 3-qoidabuzarlik sababli quiz muddatidan oldin yakunlandi.'}
          </div>
        )}

        {/* Harakat tugmalari */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onPlayAgain}
            disabled={remainingAttempts <= 0}
            className="min-h-[46px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Qayta o‘ynash ({remainingAttempts}/3)
          </button>

          {wrongPoolCount > 0 && (
            <button
              type="button"
              onClick={onStartMistakesMode}
              className="min-h-[46px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Xatolar ustida ishlash ({wrongPoolCount})
            </button>
          )}

          <button
            type="button"
            onClick={onGoHome}
            className="min-h-[46px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-colors"
          >
            <Home className="w-4 h-4" />
            Bosh sahifa
          </button>
        </div>
      </section>

      {/* Sertifikat bo'limi (hamma o'yinchi uchun) */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-500" />
              Sizning shaxsiy sertifikatingiz
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Internetsiz ham PNG rasm sifatida yuklab olishingiz mumkin.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (certCanvasRef.current) {
                downloadCertificatePNG(certCanvasRef.current, result.playerName);
              }
            }}
            className="min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            PNG yuklab olish
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
          <canvas
            ref={certCanvasRef}
            className="w-full h-auto block"
            aria-label={`${result.playerName} uchun sertifikat`}
          />
        </div>
      </section>

      {/* Xato qilingan savollar ro'yxati */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Xato qilingan savollar tahlili ({wrongAnswers.length})
        </h2>

        {wrongAnswers.length === 0 ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
            Ajoyib! Siz birorta ham savolda xato qilmadingiz!
          </p>
        ) : (
          <div className="space-y-4">
            {wrongAnswers.map((item) => (
              <div
                key={item.questionId + item.questionNumber}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 space-y-2"
              >
                <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  {item.questionNumber}-savol · {item.topic}
                </div>
                <p className="font-bold text-slate-900 dark:text-white">{item.question}</p>
                <div className="text-sm space-y-1">
                  <p className="text-rose-600 dark:text-rose-400">
                    Sizning javobingiz: {item.selectedOption || 'Belgilanmagan'}
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    To‘g‘ri javob: {item.correctAnswer}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 pt-1">
                    <strong>Tushuntirish:</strong> {item.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
