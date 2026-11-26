import informaticsData from '../data/informatics.json';
import englishData from '../data/english.json';
import mathData from '../data/math.json';
import uzbekData from '../data/uzbek.json';
import russianData from '../data/russian.json';
import {
  PlayerProgress,
  QuestionItem,
  QuizResultRecord,
  ShuffledQuestion,
  SubjectId,
} from '../types';

export interface SubjectMeta {
  id: SubjectId;
  title: string;
  subtitle: string;
  levels: string[];
  speechLang: string;
  accentColor: string;
  image: string;
}

export const SUBJECTS: SubjectMeta[] = [
  {
    id: 'informatics',
    title: 'Informatika',
    subtitle: '8-sinf boshlang‘ich va o‘rtacha daraja · Scratch, Qurilmalar, Xavfsizlik',
    levels: ['8-sinf'],
    speechLang: 'uz-UZ',
    accentColor: 'sky',
    image: '/src/assets/images/subj_informatics_1795709196869.jpg',
  },
  {
    id: 'english',
    title: 'Ingliz tili',
    subtitle: 'Beginner darajasidan IELTS gacha 7 bosqichli testlar',
    levels: [
      'Beginner',
      'Elementary',
      'Pre-Intermediate',
      'Intermediate',
      'Upper-Intermediate',
      'Advanced',
      'IELTS',
    ],
    speechLang: 'en-US',
    accentColor: 'indigo',
    image: '/src/assets/images/subj_english_1795709197123.jpg',
  },
  {
    id: 'math',
    title: 'Matematika',
    subtitle: 'Arifmetika, algebra, geometriya va mantiqiy masalalar',
    levels: ['Oson', "O'rtacha", 'Qiyin'],
    speechLang: 'uz-UZ',
    accentColor: 'amber',
    image: '/src/assets/images/subj_math_1795709197955.jpg',
  },
  {
    id: 'uzbek',
    title: 'Ona tili',
    subtitle: 'Imlo, so‘z turkumlari, sintaksis va adabiyot asoslari',
    levels: ['Oson', "O'rtacha", 'Qiyin'],
    speechLang: 'uz-UZ',
    accentColor: 'emerald',
    image: '/src/assets/images/subj_uzbek_1795709198361.jpg',
  },
  {
    id: 'russian',
    title: 'Rus tili',
    subtitle: 'So‘z boyligi, rodlar, kelishiklar va grammatika',
    levels: ['Oson', "O'rtacha", 'Qiyin'],
    speechLang: 'ru-RU',
    accentColor: 'rose',
    image: '/src/assets/images/subj_russian_1795709198252.jpg',
  },
];

const DATA_MAP: Record<SubjectId, QuestionItem[]> = {
  informatics: informaticsData as QuestionItem[],
  english: englishData as QuestionItem[],
  math: mathData as QuestionItem[],
  uzbek: uzbekData as QuestionItem[],
  russian: russianData as QuestionItem[],
};

export function getSubjectMeta(id: SubjectId): SubjectMeta {
  return SUBJECTS.find((s) => s.id === id) || SUBJECTS[0];
}

export function getTopicsForSubject(subject: SubjectId, level?: string): string[] {
  const list = DATA_MAP[subject] || [];
  const filtered = level ? list.filter((q) => q.level === level) : list;
  const topics = Array.from(new Set(filtered.map((q) => q.topic)));
  return ['Aralash', ...topics];
}

export function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function buildQuizQuestions(
  subject: SubjectId,
  level: string,
  topic: string,
  requestedCount: 10 | 20
): ShuffledQuestion[] {
  const all = DATA_MAP[subject] || [];
  let pool = all.filter((q) => q.level === level);
  if (topic && topic !== 'Aralash') {
    const topicPool = pool.filter((q) => q.topic === topic);
    if (topicPool.length > 0) {
      pool = topicPool;
    }
  }

  let selected = shuffleArray(pool);
  // Agar tanlangan mavzu/darajada savollar soni so'ralgandan kam bo'lsa, shu fanning boshqa savollaridan to'ldiramiz
  if (selected.length < requestedCount) {
    const usedIds = new Set(selected.map((q) => q.id));
    const sameLevelExtra = shuffleArray(all.filter((q) => q.level === level && !usedIds.has(q.id)));
    selected = [...selected, ...sameLevelExtra];
  }
  if (selected.length < requestedCount) {
    const usedIds = new Set(selected.map((q) => q.id));
    const otherExtra = shuffleArray(all.filter((q) => !usedIds.has(q.id)));
    selected = [...selected, ...otherExtra];
  }

  return selected.slice(0, requestedCount).map((q) => ({
    ...q,
    shuffledOptions: shuffleArray(q.options),
  }));
}

export function buildMistakesQuizQuestions(pool: QuestionItem[]): ShuffledQuestion[] {
  return shuffleArray(pool).slice(0, 20).map((q) => ({
    ...q,
    shuffledOptions: shuffleArray(q.options),
  }));
}

export function calculateCoins(score: number): number {
  if (score < 20) return 2;
  if (score <= 29) return 5;
  if (score <= 39) return 8;
  if (score <= 49) return 12;
  if (score <= 59) return 18;
  if (score <= 69) return 25;
  if (score <= 79) return 35;
  if (score <= 84) return 50;
  if (score <= 89) return 65;
  if (score <= 94) return 80;
  return 100;
}

export function getCertificateRank(score: number): string {
  if (score >= 90) return 'Ustoz faxri';
  if (score >= 85) return "A'lochi bilimdon";
  if (score >= 70) return 'Bilimdon';
  if (score >= 50) return 'Bilim izlovchi';
  return 'Faol ishtirokchi';
}

export function getPraiseMessage(
  score: number,
  firstName: string,
  lastName: string,
  grade: number,
  subject: SubjectId
): { title: string; message: string; isTopTier: boolean } {
  const fullName = `${firstName} ${lastName}`.trim();
  const is8thInformatics = grade === 8 && subject === 'informatics';
  const teacherSuffix = is8thInformatics
    ? " Informatika ustozing Shohista Qodirova ham bu harakatingni albatta qadrlaydi!"
    : '';

  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  if (score < 20) {
    return {
      title: 'Ilk qadam qo‘yildi!',
      message: pick([
        `Xafa bo‘lma, ${fullName}! Har bir buyuk dasturchi ham xatolar orqali o‘rgangan. Biroz tayyorlanib yana urinib ko‘r, senga ishonamiz!${teacherSuffix}`,
        `Bu endi boshlanishi, ${firstName}! Bugun tajriba orttirding va 2 ta sovg‘a tanga olding. "Xatolar ustida ishlash" tugmasi bilan mashq qilib ko‘r!${teacherSuffix}`,
        `Taslim bo‘lish yo‘q, ${firstName}! Kitoblar bo‘limidan mavzularni ko‘rib chiqib qaytib kelsang, albatta yuqori ball olasan!${teacherSuffix}`,
      ]),
      isTopTier: false,
    };
  }

  if (score <= 39) {
    return {
      title: 'Boshlanishi yomon emas!',
      message: pick([
        `Mayli, bu endi boshlanishi, ${firstName}! Hali taslim bo‘lma, sen albatta uddalaysan!${teacherSuffix}`,
        `Yaxshi harakat, ${fullName}! Hali oldinda ko‘p imkoniyatlar bor, xatolar ustida ishlasang keyingi safar 50 balldan oshasan!${teacherSuffix}`,
        `To‘xtab qolma, ${firstName}! Har bir savol senga yangi bilim berdi. O‘z ustingda ishlashda davom et!${teacherSuffix}`,
      ]),
      isTopTier: false,
    };
  }

  if (score <= 59) {
    const winPart = score >= 50 ? 'G‘alaba marrasidan o‘tding!' : 'Yutishga juda oz qoldi!';
    return {
      title: score >= 50 ? 'Yaxshi natija — Yutding!' : 'Yaxshi urinish!',
      message: pick([
        `Yaxshi urinish, ${fullName}! ${winPart} Yana biroz e’tibor bersang, natijang yanada zo‘r bo‘ladi.${teacherSuffix}`,
        `Barakalla, ${firstName}, harakating ko‘rinib turibdi! ${winPart} Keyingi safar bundan ham yuqori natijani kutamiz.${teacherSuffix}`,
        `Ajoyib boshlanish, ${firstName}! Biliming kun sayin o‘sib bormoqda. Xatolaringni ko‘rib chiqsang, 80+ ball olishing aniq!${teacherSuffix}`,
      ]),
      isTopTier: false,
    };
  }

  if (score <= 79) {
    return {
      title: 'Barakalla!',
      message: pick([
        `Barakalla, ${fullName}! Juda yaxshi bilim namoyish etding. Shu sur’atda davom etsang, tez orada eng yuqori cho‘qqiga chiqasan!${teacherSuffix}`,
        `Barakalla, ${firstName}! Ko‘pchilik savollarga aniq va tez javob berding. Biliming bilan faxrlansang arziydi!${teacherSuffix}`,
        `Zo‘r natija, ${fullName}! Sening tirishqoqliging tahsinga loyiq. Keyingi safar 90+ ball sari olg‘a!${teacherSuffix}`,
      ]),
      isTopTier: false,
    };
  }

  if (score <= 84) {
    return {
      title: 'Yuqori natija!',
      message: pick([
        `Qoyil, ${fullName}! Sen juda kuchli bilim va ziyraklik ko‘rsatding. Sinfdoshlaringga o‘rnak bo‘la olasan!${teacherSuffix}`,
        `A’lo harakat, ${firstName}! 80 balldan oshish haqiqiy mehnat mevasi. Kelajakda katta yutuqlar seni kutmoqda!${teacherSuffix}`,
        `Ofarin, ${fullName}! Savollarning katta qismini qiynalmasdan yechding. Olg‘a, chempion!${teacherSuffix}`,
      ]),
      isTopTier: false,
    };
  }

  if (score <= 89) {
    return {
      title: 'Ajoyib mahorat!',
      message: pick([
        `Juda samimiy tabriklaymiz, ${fullName}! Sening zukkoliging va bilimga chanqoqliging har qanday maqtovga arziydi. Ozgina qadam qoldi — 90+ marra ham seniki bo‘ladi!${teacherSuffix}`,
        `Barakalla, ${firstName}! Bunday yuqori natijani faqat muntazam o‘qib-izlanadigan tirishqoq o‘quvchilar qo‘lga kiritadi. Ota-onang va ustozlaring sendan xursand!${teacherSuffix}`,
        `Haqiqiy bilimdonlik, ${fullName}! Murakkab savollarda ham o‘zingni yo‘qotmay to‘g‘ri yo‘l topding. Biz senga doim ishonamiz!${teacherSuffix}`,
      ]),
      isTopTier: false,
    };
  }

  // 90 - 100 ball
  return {
    title: 'Chempionlik natijasi! Tabriklaymiz!',
    message: pick([
      `Uraaa! Chin dildan tabriklaymiz, ${fullName}! ${score} ball — bu haqiqiy g‘alaba va zukkolik cho‘qqisi! Ustozing Shohista Qodirova bilan faxrlanamiz! Sen kelajakda albatta buyuk inson bo‘lasan!`,
      `Barakalla, ${fullName}! Aql-zakovating va tezkor fikrlashing bilan hammani hayratda qoldirding! Ustozing Shohista Qodirova bilan faxrlanamiz! Ilm yo‘ling doimo yorug‘ bo‘lsin!`,
      `Eng yuksak tahsin, ${firstName}! ${score} ball to‘plab haqiqiy bilim chempioni ekaningni isbotlading. Ustozing Shohista Qodirova bilan faxrlanamiz va sening yangi g‘alabangni kutib qolamiz!`,
    ]),
    isTopTier: true,
  };
}

export interface BadgeDef {
  id: string;
  title: string;
  description: string;
}

export const BADGE_DEFS: BadgeDef[] = [
  { id: 'first_quiz', title: 'Ilk qadam', description: 'Birinchi viktorinani yakunlagan' },
  { id: 'winner_50', title: "G'olib o'quvchi", description: '50+ ball to‘plab g‘alaba qozongan' },
  { id: 'champion_90', title: 'Ustoz faxri (90+)', description: '90 va undan yuqori ball olgan' },
  { id: 'informatics_8', title: '8-sinf IT ustasi', description: '8-sinf Informatikadan 75+ ball olgan' },
  { id: 'ai_explorer', title: 'AI tadqiqotchi', description: 'AI yordamchidan foydalangan' },
  { id: 'coin_collector', title: 'Oltin xazina', description: '100+ oltin tanga yig‘gan' },
];

export function evaluateBadges(progress: PlayerProgress, latestResult?: QuizResultRecord): string[] {
  const set = new Set(progress.badges);
  if (progress.results.length >= 1) set.add('first_quiz');
  if (latestResult && latestResult.finalScore >= 50) set.add('winner_50');
  if (latestResult && latestResult.finalScore >= 90) set.add('champion_90');
  if (
    latestResult &&
    latestResult.subject === 'informatics' &&
    latestResult.grade === 8 &&
    latestResult.finalScore >= 75
  ) {
    set.add('informatics_8');
  }
  if (progress.aiUsageCount >= 1) set.add('ai_explorer');
  if (progress.coins >= 100) set.add('coin_collector');
  return Array.from(set);
}

export function updateStreak(progress: PlayerProgress): { streakDays: number; lastPlayedDate: string } {
  const today = new Date().toISOString().slice(0, 10);
  if (!progress.lastPlayedDate) {
    return { streakDays: 1, lastPlayedDate: today };
  }
  if (progress.lastPlayedDate === today) {
    return { streakDays: Math.max(1, progress.streakDays), lastPlayedDate: today };
  }
  const prev = new Date(progress.lastPlayedDate);
  const curr = new Date(today);
  const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) {
    return { streakDays: progress.streakDays + 1, lastPlayedDate: today };
  }
  return { streakDays: 1, lastPlayedDate: today };
}
