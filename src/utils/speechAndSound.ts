// Web Speech API va Web Audio API yordamchi moduli

let audioCtx: AudioContext | null = null;

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
    const playTone = (freq: number, start: number, dur: number, wave: OscillatorType = 'sine', vol = 0.14) => {
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
  usedFallbackLang: boolean;
  actualLang: string;
}

export function stopSpeaking(): void {
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch {
    // ignore
  }
}

function cleanTextForSpeech(raw: string): string {
  // Emojilar va ortiqcha belgilarni tozalash
  return raw
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/___+/g, ' bo‘sh joy ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function speakText(text: string, preferredLang = 'uz-UZ'): SpeakResult {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return { supported: false, usedFallbackLang: false, actualLang: preferredLang };
    }

    window.speechSynthesis.cancel();
    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) {
      return { supported: true, usedFallbackLang: false, actualLang: preferredLang };
    }

    const voices = window.speechSynthesis.getVoices();
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = 0.96;
    utterance.pitch = 1.02;

    const targetPrefix = preferredLang.toLowerCase().split('-')[0];
    let matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetPrefix));
    let usedFallbackLang = false;
    let actualLang = preferredLang;

    if (!matchedVoice && targetPrefix === 'uz') {
      // O'zbek ovozi bo'lmasa avtomatik ru-RU yoki en-US ovoziga o'tish
      matchedVoice =
        voices.find((v) => v.lang.toLowerCase().startsWith('ru')) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('en'));
      if (matchedVoice) {
        usedFallbackLang = true;
        actualLang = matchedVoice.lang;
      } else {
        usedFallbackLang = true;
        actualLang = 'ru-RU';
      }
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    } else {
      utterance.lang = actualLang;
    }

    window.speechSynthesis.speak(utterance);
    return { supported: true, usedFallbackLang, actualLang };
  } catch {
    return { supported: false, usedFallbackLang: false, actualLang: preferredLang };
  }
}
