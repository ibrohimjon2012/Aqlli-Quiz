import { GoogleGenAI, ThinkingLevel } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Faqat POST so'rovi qabul qilinadi." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "Serverda GEMINI_API_KEY sozlanmagan.",
      code: 'MISSING_API_KEY',
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { question, options, subject, level, studentGrade } = body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: "Savol matni yuborilmadi." });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const formattedOptions = Array.isArray(options)
      ? options.map((opt, idx) => `${idx + 1}) ${opt}`).join('\n')
      : '';

    const systemInstruction = `Sen maktab o'quvchilari (ayniqsa ${studentGrade || 8}-sinf) uchun mehribon, samimiy o'zbek tilidagi ustoz yordamchisan.
QOIDALAR:
1. Savolni bolaga juda sodda, tushunarli va qisqa (2-3 gap) o'zbek tilida (lotin yozuvida) tushuntir.
2. MUHIM: To'g'ri javob qaysi ekanligini TO'G'RIDAN-TO'G'RI AYTMA! Variant raqamini yoki aniq javob so'zini oshkor qilma.
3. Faqat o'quvchini to'g'ri fikrlashga yo'naltiruvchi foydali ishora (maslahat) ber.
4. Ohanging do'stona va ruhlantiruvchi bo'lsin.`;

    const prompt = `Fan: ${subject || 'Umumiy'} (${level || 'Maktab darajasi'})
Savol: ${question}
${formattedOptions ? `Variantlar:\n${formattedOptions}` : ''}

O'quvchiga to'g'ri javobni aytmasdan, savolning ma'nosini tushunishga yordam beradigan qisqa ishora yoz:`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const hintText = (response.text || '').trim();
    if (!hintText) {
      return res.status(500).json({ error: "AI javob qaytarmadi." });
    }

    return res.status(200).json({ hint: hintText });
  } catch (error) {
    console.error('Gemini API xatosi:', error);
    return res.status(500).json({
      error: "AI yordamchiga ulanishda xatolik yuz berdi.",
    });
  }
}
