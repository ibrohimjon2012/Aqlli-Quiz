import { GoogleGenAI } from '@google/genai';

function normalizeTextForTTS(raw) {
  return String(raw || '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/___+/g, " bo'sh joy ")
    .replace(/[‘’`ʻʼ´ʹ]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1200);
}

async function synthesizeWithNeuronAI(text, language, apiKey) {
  const response = await fetch('https://my.neuronai.uz/api/v1/tts/synthesize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      voice_id: 'kamron',
      text,
      language,
      quality: 'standard',
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    let errDetail = `HTTP ${response.status}`;
    try {
      const textBody = await response.text();
      if (textBody) {
        const parsed = JSON.parse(textBody);
        errDetail = parsed.detail || parsed.error || parsed.message || errDetail;
      }
    } catch {
      // ignore non-json error body
    }
    throw new Error(`NeuronAI xatosi: ${errDetail}`);
  }

  const contentType = (response.headers.get('content-type') || 'audio/wav').split(';')[0].trim();
  if (contentType.includes('application/json')) {
    const json = await response.json();
    if (json.audioBase64 || json.audio) {
      return {
        audioBase64: json.audioBase64 || json.audio,
        mimeType: json.mimeType || 'audio/wav',
      };
    }
    throw new Error(json.detail || json.error || 'NeuronAI audio qaytarmadi.');
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length) {
    throw new Error("NeuronAI bo'sh audio qaytardi.");
  }

  return {
    audioBase64: buffer.toString('base64'),
    mimeType: contentType.startsWith('audio/') ? contentType : 'audio/wav',
  };
}

async function synthesizeWithGemini(text, langCode, apiKey) {
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  let styleInstruction =
    'Warm, natural, friendly Uzbek male school teacher speaking clear and fluent Uzbek language without any robotic tone.';
  if (langCode.startsWith('en')) {
    styleInstruction =
      'Warm, clear, friendly English male teacher speaking natural English at a comfortable pace for students.';
  } else if (langCode.startsWith('ru')) {
    styleInstruction =
      'Warm, clear, friendly Russian male school teacher speaking natural fluent Russian.';
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash-lite-tts',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text,
            speechMetadata: {
              style: styleInstruction,
            },
          },
        ],
      },
    ],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Charon' },
        },
      },
    },
  });

  const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  const base64Audio = inlineData?.data;
  const mimeType = inlineData?.mimeType || 'audio/wav';

  if (!base64Audio) {
    throw new Error('Gemini TTS audio qaytarmadi.');
  }

  return { audioBase64: base64Audio, mimeType };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Faqat POST so'rovi qabul qilinadi." });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { text, lang } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: "O'qish uchun matn yuborilmadi." });
    }

    const normalized = normalizeTextForTTS(text);
    if (!normalized) {
      return res.status(400).json({ error: "O'qish uchun yaroqli matn topilmadi." });
    }

    const langCode = String(lang || 'uz-UZ').toLowerCase();
    const neuronLang = langCode.startsWith('en') ? 'en' : langCode.startsWith('ru') ? 'ru' : 'uz';

    const neuronKey = process.env.NEURONAI_API_KEY?.trim();
    const geminiKey = process.env.GEMINI_API_KEY?.trim();

    if (neuronKey && neuronKey !== 'MY_NEURONAI_API_KEY') {
      try {
        const result = await synthesizeWithNeuronAI(normalized, neuronLang, neuronKey);
        return res.status(200).json({
          audioBase64: result.audioBase64,
          mimeType: result.mimeType,
          provider: 'neuronai-kamron',
          voiceName: 'Kamron (NeuronAI)',
          notice: null,
        });
      } catch (neuronErr) {
        console.error('NeuronAI Kamron TTS xatosi:', neuronErr?.message || neuronErr);
      }
    }

    if (geminiKey && geminiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const fallback = await synthesizeWithGemini(normalized, langCode, geminiKey);
        return res.status(200).json({
          audioBase64: fallback.audioBase64,
          mimeType: fallback.mimeType,
          provider: 'gemini-male',
          voiceName: 'Charon (Gemini)',
          notice: null,
        });
      } catch (geminiErr) {
        console.error('Gemini TTS zaxira xatosi:', geminiErr?.message || geminiErr);
      }
    }

    // Kalit hali ulanmagan yoki server TTS vaqtincha band bo'lsa,
    // brauzer konsolida qizil xato chiqarmasdan ichki fonetik ovozga silliq o'tish
    return res.status(200).json({
      audioBase64: null,
      mimeType: null,
      provider: 'browser-tts',
      voiceName: 'Ichki fonetik ovoz',
      notice: null,
    });
  } catch (error) {
    console.error('TTS handler xatosi:', error);
    return res.status(200).json({
      audioBase64: null,
      mimeType: null,
      provider: 'browser-tts',
      voiceName: 'Ichki fonetik ovoz',
      notice: null,
    });
  }
}
