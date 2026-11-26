// Tabiiy o'zbekcha Kamron ovozi (NeuronAI /api/tts) + Gemini TTS + Fonetik moslashtirilgan ichki ovoz + Web Audio effektlari

let audioCtx: AudioContext | null = null;
let currentAudioEl: HTMLAudioElement | null = null;
let currentRequestToken = 0;
let serverTtsAvailable: boolean | null = null;

interface CachedTTSAudio {
  dataUrl: string;
  mode: 'neuronai-kamron' | 'gemini-male';
  notice: string | null;
}

const ttsAudioCache = new Map<string, CachedTTSAudio>();

function getAudioContext(): AudioContext | null {
  try {
    if (typeof window === 'undefined') return null;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function playSoundEffect(
  type: 'correct' | 'wrong' | 'coin' | 'fanfare' | 'warning',
  enabled: boolean
): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const playTone = (
      freq: number,
      start: number,
      dur: number,
      wave: OscillatorType = 'sine',
      vol = 0.14
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(vol, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    };

    if (type === 'correct') {
      playTone(523.25, now, 0.14, 'triangle', 0.15);
      playTone(659.25, now + 0.09, 0.22, 'triangle', 0.15);
    } else if (type === 'wrong') {
      playTone(260, now, 0.16, 'sawtooth', 0.08);
      playTone(210, now + 0.12, 0.22, 'sawtooth', 0.08);
    } else if (type === 'coin') {
      playTone(987.77, now, 0.09, 'sine', 0.12);
      playTone(1318.51, now + 0.07, 0.24, 'sine', 0.13);
    } else if (type === 'fanfare') {
      playTone(523.25, now, 0.14, 'triangle', 0.15);
      playTone(659.25, now + 0.11, 0.14, 'triangle', 0.15);
      playTone(783.99, now + 0.22, 0.14, 'triangle', 0.15);
      playTone(1046.5, now + 0.34, 0.42, 'triangle', 0.18);
    } else if (type === 'warning') {
      playTone(440, now, 0.18, 'square', 0.09);
      playTone(330, now + 0.18, 0.25, 'square', 0.09);
    }
  } catch {
    // AudioContext cheklovlarida xato chiqarmaslik
  }
}

export interface SpeakResult {
  supported: boolean;
  mode: 'neuronai-kamron' | 'gemini-male' | 'browser-fallback' | 'none';
  notice: string | null;
}

export function stopSpeaking(): void {
  currentRequestToken++;
  try {
    if (currentAudioEl) {
      currentAudioEl.pause();
      currentAudioEl.currentTime = 0;
      currentAudioEl = null;
    }
  } catch {
    // ignore
  }
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch {
    // ignore
  }
}

function cleanTextForSpeech(raw: string): string {
  return raw
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/___+/g, " bo'sh joy ")
    .replace(/[‘’`ʻʼ´ʹ]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// O'zbek lotin matnini turkcha (tr-TR / az-AZ) ovoziga moslashtirish — talaffuz tabiiy chiqishi uchun
function uzbekToTurkishPhonetic(text: string): string {
  return text
    .replace(/O'/g, 'Ö')
    .replace(/o'/g, 'ö')
    .replace(/G'/g, 'Ğ')
    .replace(/g'/g, 'ğ')
    .replace(/Sh/g, 'Ş')
    .replace(/SH/g, 'Ş')
    .replace(/sh/g, 'ş')
    .replace(/Ch/g, 'Ç')
    .replace(/CH/g, 'Ç')
    .replace(/ch/g, 'ç')
    .replace(/X/g, 'H')
    .replace(/x/g, 'h')
    .replace(/Q/g, 'K')
    .replace(/q/g, 'k')
    .replace(/J/g, 'C')
    .replace(/j/g, 'c')
    .replace(/W/g, 'V')
    .replace(/w/g, 'v')
    .replace(/'/g, '');
}

// O'zbek lotin matnini kirillcha fonetikaga o'girish — ruscha (ru-RU) ovoz harfma-harf o'qib yubormasligi uchun
function uzbekToCyrillicPhonetic(text: string): string {
  const pairs: Array<[RegExp, string]> = [
    [/Yo'/g, 'Ё'],
    [/yo'/g, 'ё'],
    [/Ya/g, 'Я'],
    [/ya/g, 'я'],
    [/Yu/g, 'Ю'],
    [/yu/g, 'ю'],
    [/Ye/g, 'Е'],
    [/ye/g, 'е'],
    [/O'/g, 'У'],
    [/o'/g, 'у'],
    [/G'/g, 'Г'],
    [/g'/g, 'г'],
    [/Sh|SH/g, 'Ш'],
    [/sh/g, 'ш'],
    [/Ch|CH/g, 'Ч'],
    [/ch/g, 'ч'],
    [/Ts|TS/g, 'Ц'],
    [/ts/g, 'ц'],
    [/Ng/g, 'Нг'],
    [/ng/g, 'нг'],
  ];

  let out = text;
  for (const [pattern, replacement] of pairs) {
    out = out.replace(pattern, replacement);
  }

  const charMap: Record<string, string> = {
    A: 'А', a: 'а',
    B: 'Б', b: 'б',
    C: 'К', c: 'к',
    D: 'Д', d: 'д',
    E: 'Э', e: 'е',
    F: 'Ф', f: 'ф',
    G: 'Г', g: 'г',
    H: 'Х', h: 'х',
    I: 'И', i: 'и',
    J: 'Дж', j: 'дж',
    K: 'К', k: 'к',
    L: 'Л', l: 'л',
    M: 'М', m: 'м',
    N: 'Н', n: 'н',
    O: 'О', o: 'о',
    P: 'П', p: 'п',
    Q: 'К', q: 'к',
    R: 'Р', r: 'р',
    S: 'С', s: 'с',
    T: 'Т', t: 'т',
    U: 'У', u: 'у',
    V: 'В', v: 'в',
    W: 'В', w: 'в',
    X: 'Х', x: 'х',
    Y: 'Й', y: 'й',
    Z: 'З', z: 'з',
  };

  return out
    .replace(/'/g, '')
    .split('')
    .map((ch) => charMap[ch] || ch)
    .join('');
}

// Inglizcha ovoz o'zbekcha so'zlarni tushunarliroq aytishi uchun fonetik moslashuv
function uzbekToEnglishPhonetic(text: string): string {
  return text
    .replace(/o'/gi, 'o')
    .replace(/g'/gi, 'gh')
    .replace(/q/gi, 'k')
    .replace(/x/gi, 'kh')
    .replace(/(\b)e/gi, '$1eh')
    .replace(/'/g, '');
}

async function getBrowserVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const existing = window.speechSynthesis.getVoices();
  if (existing.length > 0) return existing;

  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.speechSynthesis.removeEventListener('voiceschanged', finish);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', finish);
    window.setTimeout(finish, 350);
  });
}

function pickMalePreferredVoice(
  voices: SpeechSynthesisVoice[],
  langPrefix: string
): SpeechSynthesisVoice | undefined {
  const candidates = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));
  if (candidates.length === 0) return undefined;

  const maleHint =
    /male|man|ahmet|tolga|emre|mehmet|pavel|dmitry|aleksandr|yuri|daniel|david|mark|guy|george|ryan|andrew|sardor|kamron/i;
  const femaleHint =
    /female|woman|emel|yeliz|seda|irina|svetlana|milena|katya|zira|jenny|aria|sara|samantha|victoria|madina/i;

  return (
    candidates.find((v) => maleHint.test(v.name) && !femaleHint.test(v.name)) ||
    candidates.find((v) => !femaleHint.test(v.name)) ||
    candidates[0]
  );
}

function playDataUrlAudio(
  dataUrl: string,
  token: number
): Promise<'played' | 'autoplay-blocked' | 'cancelled'> {
  return new Promise((resolve, reject) => {
    if (token !== currentRequestToken) {
      resolve('cancelled');
      return;
    }
    const audio = new Audio(dataUrl);
    currentAudioEl = audio;
    audio.onended = () => {
      if (currentAudioEl === audio) currentAudioEl = null;
      resolve('played');
    };
    audio.onerror = () => {
      if (currentAudioEl === audio) currentAudioEl = null;
      reject(new Error('Audio ijro etish xatosi'));
    };
    audio.play().catch((err: unknown) => {
      if (currentAudioEl === audio) currentAudioEl = null;
      const errName = (err as { name?: string })?.name || '';
      if (errName === 'NotAllowedError') {
        resolve('autoplay-blocked');
        return;
      }
      reject(err);
    });
  });
}

async function fallbackBrowserSpeech(
  cleaned: string,
  preferredLang: string,
  token: number
): Promise<SpeakResult> {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return {
        supported: false,
        mode: 'none',
        notice: 'Bu qurilmada ovozli o‘qish qo‘llab-quvvatlanmaydi.',
      };
    }

    const voices = await getBrowserVoices();
    if (token !== currentRequestToken) {
      return { supported: true, mode: 'none', notice: null };
    }

    const targetPrefix = preferredLang.toLowerCase().split('-')[0];
    let matchedVoice = pickMalePreferredVoice(voices, targetPrefix);
    let spokenText = cleaned;
    let notice: string | null = null;

    if (!matchedVoice && targetPrefix === 'uz') {
      const trVoice =
        pickMalePreferredVoice(voices, 'tr') || pickMalePreferredVoice(voices, 'az');
      const kkVoice = pickMalePreferredVoice(voices, 'kk');
      const ruVoice = pickMalePreferredVoice(voices, 'ru');
      const enVoice = pickMalePreferredVoice(voices, 'en');

      if (trVoice) {
        matchedVoice = trVoice;
        spokenText = uzbekToTurkishPhonetic(cleaned);
      } else if (kkVoice) {
        matchedVoice = kkVoice;
        spokenText = uzbekToCyrillicPhonetic(cleaned);
      } else if (ruVoice) {
        matchedVoice = ruVoice;
        spokenText = uzbekToCyrillicPhonetic(cleaned);
      } else if (enVoice) {
        matchedVoice = enVoice;
        spokenText = uzbekToEnglishPhonetic(cleaned);
      } else {
        spokenText = uzbekToTurkishPhonetic(cleaned);
      }
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 0.92;
    utterance.pitch = 0.9;

    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    } else {
      utterance.lang = targetPrefix === 'uz' ? 'tr-TR' : preferredLang;
    }

    window.speechSynthesis.speak(utterance);
    return { supported: true, mode: 'browser-fallback', notice };
  } catch {
    return { supported: false, mode: 'none', notice: null };
  }
}

export async function speakText(
  text: string,
  preferredLang = 'uz-UZ'
): Promise<SpeakResult> {
  stopSpeaking();
  const token = currentRequestToken;
  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) {
    return { supported: true, mode: 'none', notice: null };
  }

  const cacheKey = `${preferredLang}::${cleaned}`;
  const cached = ttsAudioCache.get(cacheKey);
  if (cached) {
    try {
      const playStatus = await playDataUrlAudio(cached.dataUrl, token);
      if (playStatus === 'autoplay-blocked') {
        return {
          supported: true,
          mode: cached.mode,
          notice: 'Ovozni tinglash uchun «Qayta o‘qi» tugmasini bosing.',
        };
      }
      return { supported: true, mode: cached.mode, notice: cached.notice };
    } catch {
      // Cache audio failed; try server or fallback
    }
  }

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (isOnline && serverTtsAvailable !== false) {
    try {
      const resp = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleaned, lang: preferredLang }),
      });

      if (token !== currentRequestToken) {
        return { supported: true, mode: 'none', notice: null };
      }

      const data = await resp.json().catch(() => ({}));

      if (resp.ok && data.audioBase64) {
        serverTtsAvailable = true;
        const mime = data.mimeType || 'audio/wav';
        const dataUrl = `data:${mime};base64,${data.audioBase64}`;
        const mode: 'neuronai-kamron' | 'gemini-male' =
          data.provider === 'neuronai-kamron' ? 'neuronai-kamron' : 'gemini-male';
        const notice: string | null = typeof data.notice === 'string' ? data.notice : null;

        if (ttsAudioCache.size > 40) {
          const firstKey = ttsAudioCache.keys().next().value;
          if (firstKey) ttsAudioCache.delete(firstKey);
        }
        ttsAudioCache.set(cacheKey, { dataUrl, mode, notice });

        const playStatus = await playDataUrlAudio(dataUrl, token);
        if (playStatus === 'autoplay-blocked') {
          return {
            supported: true,
            mode,
            notice: 'Ovozni tinglash uchun «Qayta o‘qi» tugmasini bosing.',
          };
        }
        return { supported: true, mode, notice };
      } else if (data?.provider === 'browser-tts') {
        serverTtsAvailable = false;
      }
    } catch {
      // Tarmoq xatosi bo'lsa fonetik ichki ovozga o'tamiz
    }
  }

  if (token !== currentRequestToken) {
    return { supported: true, mode: 'none', notice: null };
  }

  return fallbackBrowserSpeech(cleaned, preferredLang, token);
}
