import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="min-h-[40px] inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors whitespace-nowrap shrink-0"
      >
        <Download className="w-4 h-4" />
        Ilovani o‘rnatish
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          Ilovani o‘rnatish
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                iPhone / iPad ga o‘rnatish
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                1. Safari pastki panelidan <strong>Ulashish (Share)</strong> tugmasini bosing.
                <br />
                2. Pastga tushib <strong>«Bosh ekranga qo‘shish» (Add to Home Screen)</strong> tugmasini tanlang.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full min-h-[44px] rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700"
              >
                Tushunarli
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
