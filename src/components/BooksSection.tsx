import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileUp,
  Lightbulb,
  Maximize2,
  Minimize2,
  Volume2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { BOOKS_BY_GRADE } from '../data/books.js';
import { BookItem } from '../types';
import { speakText, stopSpeaking } from '../utils/speechAndSound';

interface BooksSectionProps {
  initialGrade: number;
  onBack: () => void;
}

export const BooksSection: React.FC<BooksSectionProps> = ({ initialGrade, onBack }) => {
  const [selectedGrade, setSelectedGrade] = useState<number>(initialGrade || 8);
  const [activeBook, setActiveBook] = useState<BookItem | null>(null);
  const [chapterIndex, setChapterIndex] = useState<number>(0);
  const [localPdfUrl, setLocalPdfUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [fullscreen, setFullscreen] = useState(false);

  const books: BookItem[] =
    (BOOKS_BY_GRADE as Record<number, BookItem[]>)[selectedGrade] || [];

  const handleOpenBook = (book: BookItem) => {
    setLocalPdfUrl(null);
    setActiveBook(book);
    setChapterIndex(0);
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
    stopSpeaking();
    if (localPdfUrl) {
      URL.revokeObjectURL(localPdfUrl);
      setLocalPdfUrl(null);
    }
    setActiveBook(null);
    setFullscreen(false);
  };

  const chapters = activeBook?.chapters || [];
  const currentChapter = chapters[chapterIndex];
  const hasPdfUrl = Boolean(activeBook?.url && activeBook.url.trim().length > 0);

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
          Qo‘shimcha PDF ochish
          <input
            type="file"
            accept="application/pdf"
            onChange={handleLocalFile}
            className="hidden"
          />
        </label>
      </div>

      {/* Kutubxona rasm banneri */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-3">
            <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">
              Ichki elektron kutubxona · Internetsiz ishlaydi
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <BookOpen className="w-7 h-7 text-sky-600 dark:text-sky-400 shrink-0" />
              Elektron kitoblar (1–11-sinflar)
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Istalgan darslik ustiga bosing — kitob darhol ichki o‘quvchida boblar, qoidalar, misollar va ovozli o‘qish bilan ochiladi!
            </p>
          </div>
          <div className="lg:col-span-5 min-h-[180px] bg-sky-50 dark:bg-slate-800">
            <img
              src="/src/assets/images/books_library_1795709198453.jpg"
              alt="Elektron maktab kutubxonasi"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Sinf tanlash va kitoblar ro'yxati */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
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

        {/* Rasmli kitob kartochkalari */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {books.map((book) => (
            <button
              key={book.id}
              type="button"
              onClick={() => handleOpenBook(book)}
              className="group text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden hover:border-sky-500 dark:hover:border-sky-400 transition-all shadow-sm flex flex-col justify-between"
            >
              <div className="aspect-[16/10] w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                <img
                  src={book.coverImage || '/src/assets/images/books_library_1795709198453.jpg'}
                  alt={book.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between gap-4 w-full">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                    {book.subject} · {selectedGrade}-sinf
                  </p>
                  <h2 className="font-bold text-slate-900 dark:text-white text-base">
                    {book.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {book.author} · {book.chapters?.length || 2} ta bob
                  </p>
                </div>

                <div className="min-h-[42px] w-full rounded-xl bg-sky-600 group-hover:bg-sky-700 text-white text-sm font-semibold flex items-center justify-center transition-colors">
                  Kitobni ochish
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Ichki Elektron Kitob va PDF Ko'ruvchi */}
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
            {/* Kitob yuqori boshqaruv paneli */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm sm:text-base">
                  {activeBook.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {hasPdfUrl ? `PDF ko‘ruvchi · Masshtab: ${zoom}%` : `Bob ${chapterIndex + 1}/${chapters.length} · Masshtab: ${zoom}%`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!hasPdfUrl && currentChapter && (
                  <button
                    type="button"
                    onClick={() =>
                      speakText(
                        `${currentChapter.title}. ${currentChapter.summary}. ${currentChapter.content.join(' ')} Muhim qoida: ${currentChapter.keyRule}`,
                        activeBook.subject === 'Ingliz tili'
                          ? 'en-US'
                          : activeBook.subject === 'Rus tili'
                          ? 'ru-RU'
                          : 'uz-UZ'
                      )
                    }
                    className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Ovozda tinglash</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(80, z - 15))}
                  aria-label="Uzoqlashtirish"
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs font-bold tabular-nums w-11 text-center">
                  {zoom}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(175, z + 15))}
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

            {/* Kitob ichki mazmuni */}
            {hasPdfUrl ? (
              <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-950 p-2 sm:p-4 flex justify-center">
                <div
                  style={{
                    width: `${zoom}%`,
                    minWidth: '100%',
                    height: '100%',
                    minHeight: '560px',
                  }}
                >
                  <iframe
                    src={activeBook.url}
                    title={activeBook.title}
                    className="w-full h-full min-h-[560px] rounded-xl bg-white"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
                {/* Mundarija */}
                <aside className="md:col-span-4 lg:col-span-3 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 overflow-y-auto space-y-2">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2 pb-1">
                    KITOB MUNDARIJASI
                  </p>
                  {chapters.map((ch, idx) => (
                    <button
                      key={ch.title}
                      type="button"
                      onClick={() => {
                        stopSpeaking();
                        setChapterIndex(idx);
                      }}
                      className={`w-full text-left rounded-xl p-3 text-xs sm:text-sm font-semibold transition-colors ${
                        idx === chapterIndex
                          ? 'bg-sky-600 text-white'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {ch.title}
                    </button>
                  ))}
                </aside>

                {/* Sahifa matni (zoom bilan kattalashadi) */}
                <div className="md:col-span-8 lg:col-span-9 overflow-y-auto p-5 sm:p-8 bg-white dark:bg-slate-900">
                  {currentChapter && (
                    <article
                      className="max-w-3xl mx-auto space-y-6"
                      style={{ fontSize: `${zoom}%` }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                        <img
                          src={activeBook.coverImage || '/src/assets/images/books_library_1795709198453.jpg'}
                          alt={activeBook.title}
                          referrerPolicy="no-referrer"
                          className="w-24 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div>
                          <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                            {activeBook.title} · {chapterIndex + 1}-sahifa
                          </p>
                          <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                            {currentChapter.title}
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {currentChapter.summary}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 leading-relaxed text-slate-700 dark:text-slate-200">
                        {currentChapter.content.map((para, i) => (
                          <p key={i} className="text-base">
                            {para}
                          </p>
                        ))}
                      </div>

                      <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-5 space-y-1.5">
                        <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300 text-sm">
                          <Lightbulb className="w-4 h-4" />
                          Eslab qoling (Muhim qoida)
                        </div>
                        <p className="text-sm text-amber-950 dark:text-amber-100 leading-relaxed">
                          {currentChapter.keyRule}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 p-5 space-y-1.5">
                        <div className="font-bold text-sky-800 dark:text-sky-300 text-sm">
                          Amaliy misol
                        </div>
                        <p className="text-sm text-sky-950 dark:text-sky-100 leading-relaxed">
                          {currentChapter.example}
                        </p>
                      </div>

                      {/* Oldingi / Keyingi bob */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button
                          type="button"
                          disabled={chapterIndex === 0}
                          onClick={() => {
                            stopSpeaking();
                            setChapterIndex((i) => Math.max(0, i - 1));
                          }}
                          className="min-h-[42px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold disabled:opacity-40"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Oldingi bob
                        </button>
                        <button
                          type="button"
                          disabled={chapterIndex >= chapters.length - 1}
                          onClick={() => {
                            stopSpeaking();
                            setChapterIndex((i) => Math.min(chapters.length - 1, i + 1));
                          }}
                          className="min-h-[42px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white text-sm font-semibold disabled:opacity-40"
                        >
                          Keyingi bob
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </article>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
