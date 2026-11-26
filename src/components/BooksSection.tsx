import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  FileUp,
  Maximize2,
  Minimize2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { BOOKS_BY_GRADE } from '../data/books.js';
import { BookItem } from '../types';

interface BooksSectionProps {
  initialGrade: number;
  onBack: () => void;
}

export const BooksSection: React.FC<BooksSectionProps> = ({ initialGrade, onBack }) => {
  const [selectedGrade, setSelectedGrade] = useState<number>(initialGrade || 8);
  const [activeBook, setActiveBook] = useState<BookItem | null>(null);
  const [localPdfUrl, setLocalPdfUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [fullscreen, setFullscreen] = useState(false);

  const books: BookItem[] =
    (BOOKS_BY_GRADE as Record<number, BookItem[]>)[selectedGrade] || [];

  const handleOpenBook = (book: BookItem) => {
    if (!book.url) return;
    setLocalPdfUrl(null);
    setActiveBook(book);
    setZoom(100);
  };

  const handleLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (localPdfUrl) {
      URL.revokeObjectURL(localPdfUrl);
    }
    const blobUrl = URL.createObjectURL(file);
    setLocalPdfUrl(blobUrl);
    setActiveBook({
      id: 'local-pdf',
      subject: 'Mahalliy fayl',
      title: file.name,
      author: 'Qurilmadan ochilgan PDF',
      url: blobUrl,
    });
    setZoom(100);
  };

  const closeViewer = () => {
    if (localPdfUrl) {
      URL.revokeObjectURL(localPdfUrl);
      setLocalPdfUrl(null);
    }
    setActiveBook(null);
    setFullscreen(false);
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

        <label className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors">
          <FileUp className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          Qurilmadan PDF ochish
          <input
            type="file"
            accept="application/pdf"
            onChange={handleLocalFile}
            className="hidden"
          />
        </label>
      </div>

      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-sky-600 dark:text-sky-400" />
            Elektron kitoblar (1–11-sinflar)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Sinfni tanlang va kerakli darslikni oching. Rasmiy PDF havolalar{' '}
            <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              src/data/books.js
            </code>{' '}
            fayliga qo‘shilganda shu yerda ochiladi.
          </p>
        </div>

        {/* 1-11 sinf tanlash */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setSelectedGrade(g)}
              className={`min-h-[42px] px-4 py-2 rounded-xl text-sm font-bold border transition-colors tabular-nums ${
                selectedGrade === g
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {g}-sinf
            </button>
          ))}
        </div>

        {/* Fanlar ro'yxati */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => {
            const hasUrl = Boolean(book.url && book.url.trim().length > 0);
            return (
              <div
                key={book.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                    {book.subject} · {selectedGrade}-sinf
                  </p>
                  <h2 className="font-bold text-slate-900 dark:text-white text-base">
                    {book.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{book.author}</p>
                </div>

                {hasUrl ? (
                  <button
                    type="button"
                    onClick={() => handleOpenBook(book)}
                    className="min-h-[42px] w-full rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors"
                  >
                    Kitobni ochish
                  </button>
                ) : (
                  <div className="min-h-[42px] w-full rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Tez kunda
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Ichki PDF ko'ruvchi */}
      {activeBook && (
        <div
          className={`fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col ${
            fullscreen ? 'p-0' : 'p-2 sm:p-6'
          }`}
        >
          <div
            className={`flex-1 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl ${
              fullscreen ? 'rounded-none' : 'rounded-2xl'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm sm:text-base">
                  {activeBook.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Masshtab: {zoom}%
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(60, z - 15))}
                  aria-label="Uzoqlashtirish"
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs font-bold tabular-nums w-12 text-center">
                  {zoom}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(200, z + 15))}
                  aria-label="Yaqinlashtirish"
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setFullscreen((f) => !f)}
                  aria-label="To‘liq ekran"
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={closeViewer}
                  aria-label="Yopish"
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-950 p-2 sm:p-4 flex justify-center">
              <div
                style={{
                  width: `${zoom}%`,
                  minWidth: '100%',
                  height: '100%',
                  minHeight: '560px',
                }}
                className="transition-all"
              >
                <iframe
                  src={activeBook.url}
                  title={activeBook.title}
                  className="w-full h-full min-h-[560px] rounded-xl bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
