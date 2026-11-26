// Elektron darsliklar bazasi (1-sinfdan 11-sinfgacha).
// Har bir kitob bosilganda darhol ichki darslik o'quvchisida boblari, qoidalari va misollari bilan ochiladi.
// Agar rasmiy PDF fayl havolasini ham ulamoqchi bo'lsangiz, kerakli kitobning "url" maydonini to'ldiring.

const COVER_BY_SUBJECT = {
  Informatika: '/src/assets/images/subj_informatics_1795709196869.jpg',
  'Ingliz tili': '/src/assets/images/subj_english_1795709197123.jpg',
  Matematika: '/src/assets/images/subj_math_1795709197955.jpg',
  Geometriya: '/src/assets/images/subj_math_1795709197955.jpg',
  'Ona tili': '/src/assets/images/subj_uzbek_1795709198361.jpg',
  Alifbe: '/src/assets/images/subj_uzbek_1795709198361.jpg',
  'Rus tili': '/src/assets/images/subj_russian_1795709198252.jpg',
  'Tabiiy fan': '/src/assets/images/smart_lab_hero_1795709199157.jpg',
};

function buildDefaultChapters(grade, subject) {
  if (subject === 'Informatika') {
    return [
      {
        title: '1-bob. Axborot va kompyuter qurilmalari',
        summary: `${grade}-sinf uchun axborot turlari, kompyuterning asosiy va qo'shimcha qurilmalari haqida asosiy tushunchalar.`,
        content: [
          "Axborot — bu bizni o'rab turgan olam haqidagi bilim va xabarlardir. Kompyuter axborotni ikkilik sanoq sistemasida (0 va 1 raqamlari yordamida) qayta ishlaydi.",
          "Kompyuterning eng asosiy qurilmalari: tizimli blok (ichida protsessor — CPU, tezkor xotira — RAM va doimiy xotira — SSD/HDD joylashgan), monitor, klaviatura va sichqoncha.",
          "Kiritish qurilmalari (klaviatura, sichqoncha, skaner, mikrofon) ma'lumotni kompyuterga kiritadi. Chiqarish qurilmalari (monitor, printer, kalonka) esa natijani bizga ko'rsatadi yoki eshittiradi."
        ],
        keyRule: "1 bayt = 8 bit. 1 Kilobayt (KB) = 1024 bayt. Protsessor — kompyuterning 'miyasi', RAM esa vaqtinchalik tezkor xotiradir.",
        example: "Masalan: Word hujjatini yozayotganingizda u RAM xotirasida turadi, Ctrl + S bosib saqlaganingizda esa doimiy diskka (SSD/HDD) yoziladi."
      },
      {
        title: '2-bob. Fayl, papka va matn muharriri',
        summary: "Fayllarni tartibga solish, kengaytmalar va klaviatura tezkor tugmalari.",
        content: [
          "Fayl — kompyuter xotirasida saqlanadigan nomlangan ma'lumotlar to'plamidir. Papka esa fayllarni tartib bilan joylashtirish uchun xizmat qiluvchi 'quti'dir.",
          "Fayl kengaytmasi uning turini bildiradi: .jpg/.png — rasm, .mp3 — musiqa, .mp4 — video, .docx — Word matn hujjati.",
          "Word va Paint dasturlari maktab o'quvchilari uchun matn yozish hamda rasm chizishda eng qulay asosiy dasturlardir."
        ],
        keyRule: "Tezkor tugmalar: Ctrl + C (nusxa olish), Ctrl + V (qo'yish), Ctrl + Z (bekor qilish), Ctrl + S (saqlash).",
        example: "Agar matnda bitta so'zni tasodifan o'chirib yuborsangiz, darhol Ctrl + Z tugmasini bosing — matn joyiga qaytadi!"
      },
      {
        title: '3-bob. Scratch vizual dasturlash asoslari',
        summary: "Sprite, Sahna, Harakat, Takrorlash va Tovush bloklari yordamida o'yin va multfilm yaratish.",
        content: [
          "Scratch — bolalar va o'quvchilar uchun yaratilgan vizual dasturlash muhiti. Unda kodlar yozilmaydi, balki rangli bloklar lego kabi bir-biriga ulanadi.",
          "Ekrandagi harakatlanuvchi qahramon Sprite (Sprayt), orqa fon esa Sahna (Stage) deb ataladi. Dastur yashil bayroqcha tugmasi bilan ishga tushiriladi.",
          "Ko'k bloklar — Harakat (Motion), binafsha bloklar — Ko'rinish (Looks), pushti bloklar — Tovush (Sound), sariq/to'q sariq bloklar esa Hodisalar va Takrorlash (Events/Control) uchun ishlatiladi."
        ],
        keyRule: "Sahna markazi koordinatasi x = 0, y = 0 ga teng. Harakatni ko'p marta bajarish uchun 'Takrorlash (Repeat)' bloki qo'llaniladi.",
        example: "Yashil bayroqcha bosilganda → 10 marta takrorla [10 qadam yurish + 0.2 soniya kutish] → 'Salom!' deb aytish."
      },
      {
        title: '4-bob. Internet xavfsizligi qoidalari',
        summary: "Xavfsiz parol tuzish, fishing va viruslardan himoyalanish.",
        content: [
          "Internetda ishlashda brauzer (Chrome, Edge, Safari) dan foydalaniladi. Xavfsiz sayt manzili doim https:// bilan boshlanadi va qulfcha belgisi turadi.",
          "Kuchli parol kamida 8 ta belgidan iborat bo'lib, unda katta va kichik harflar, raqamlar hamda maxsus belgilar (!, @, #) qatnashishi shart.",
          "Notanish odamlardan kelgan shubhali havolalarga (fishing) aslo kirmang va shaxsiy parolingizni hech kimga bermang."
        ],
        keyRule: "Ikki bosqichli tekshiruv (2FA) va antivirus dasturi hisobingiz hamda kompyuteringiz xavfsizligini bir necha barobar oshiradi.",
        example: "Yomon parol: 123456. Kuchli parol: Maktab_2026#Uz!"
      }
    ];
  }

  if (subject === 'Matematika' || subject === 'Geometriya') {
    return [
      {
        title: `1-bob. ${grade}-sinf asosiy sonli amallar va tenglamalar`,
        summary: "Natural, butun va kasr sonlar ustida amallar hamda chiziqli tenglamalar.",
        content: [
          "Matematikada amallar bajarish tartibi qat'iy: avval qavs ichidagi amallar, keyin daraja va ildizlar, so'ngra ko'paytirish va bo'lish, oxirida qo'shish va ayirish bajariladi.",
          "Tenglamaning noma'lum hadini topish uchun ma'lum sonlarni tenglikning ikkinchi tomoniga qarama-qarshi ishora bilan o'tkazamiz.",
          "Foiz (%) — sonning yuzdan bir ulushidir: 50% = yarmi (1/2), 25% = choragi (1/4), 10% = o'ndan biri (1/10)."
        ],
        keyRule: "Qisqa ko'paytirish formulalari: (a + b)² = a² + 2ab + b², hamda (a - b)(a + b) = a² - b².",
        example: "Misol: 3x - 7 = 14 → 3x = 14 + 7 → 3x = 21 → x = 7."
      },
      {
        title: '2-bob. Geometriya: Shakllar, perimetr va yuza',
        summary: "Uchburchak, kvadrat, to'g'ri to'rtburchak va aylana xossalari.",
        content: [
          "Har qanday uchburchakning ichki burchaklari yig'indisi 180° ga, to'rtburchakniki esa 360° ga teng.",
          "Kvadratning tomoni a bo'lsa, perimetri P = 4a, yuzi S = a² ga teng. To'g'ri to'rtburchakda P = 2(a + b), S = a × b.",
          "To'g'ri burchakli uchburchakda Pifagor teoremasi o'rinli: katetlar kvadratlari yig'indisi gipotenuza kvadratiga teng (a² + b² = c²)."
        ],
        keyRule: "Aylana uzunligi L = 2πR, doira yuzi S = πR².",
        example: "Katetlari 3 sm va 4 sm bo'lgan uchburchakda gipotenuza c = √(3² + 4²) = √25 = 5 sm."
      }
    ];
  }

  if (subject === 'Ingliz tili') {
    return [
      {
        title: 'Unit 1. Tenses & Sentence Structure (Zamonlar va gap tuzilishi)',
        summary: `${grade}-sinf uchun ingliz tili asosiy zamonlari va to be fe'li qoidalari.`,
        content: [
          "Ingliz tilida gap tartibi qat'iy: Ega (Subject) + Kesim (Verb) + To'ldiruvchi (Object). Masalan: I read books every day.",
          "Hozirgi oddiy zamon (Present Simple) kundalik odatlarni bildiradi. He, She, It olmoshlaridan keyin fe'lga -s yoki -es qo'shiladi.",
          "O'tgan oddiy zamon (Past Simple) kecha yoki avval bo'lgan ishlar uchun ishlatiladi: to'g'ri fe'llarga -ed qo'shiladi (watched, played)."
        ],
        keyRule: "I am / He, She, It is / We, You, They are. Sifatlarning qiyosiy darajasida qisqa so'zlarga -er qo'shiladi (taller than).",
        example: "Example: She goes to school by bus every morning. Yesterday she watched a movie."
      },
      {
        title: 'Unit 2. Essential Vocabulary & Prepositions',
        summary: "Kundalik so'z boyligi, artikllar va predloglar.",
        content: [
          "Birlikdagi sanaladigan otlar oldidan 'a' (undosh bilan boshlansa) yoki 'an' (unli bilan boshlansa) noaniq artikli qo'yiladi.",
          "Transport turlari bilan 'by' predlogi ishlatiladi: by bus, by car, by train.",
          "Vaqt davomiyligi bilan 'for' (for 5 years), boshlanish vaqti bilan 'since' (since 2021) qo'llaniladi."
        ],
        keyRule: "There is (birlik uchun) / There are (ko'plik uchun). How much (sanalmaydigan) / How many (sanaladigan).",
        example: "Example: There is an apple on the table. There are three books in my bag."
      }
    ];
  }

  if (subject === 'Rus tili') {
    return [
      {
        title: '1-bob. Otlarning jinsi (Род имён существительных)',
        summary: "Мужской, женский va средний rodlarni oson ajratish qoidalari.",
        content: [
          "Rus tilida barcha otlar 3 ta rodga bo'linadi: мужской род (m.r.), женский род (j.r.) va средний род (s.r.).",
          "Undosh harf bilan tugagan otlar odatda мужской род (дом, стол, друг); -а, -я bilan tugaganlari женский род (мама, книга, школа); -о, -е bilan tugaganlari средний род (окно, море) bo'ladi.",
          "Olmoshlar rodga qarab moslashadi: мой друг (m.r.), моя книга (j.r.), моё окно (s.r.)."
        ],
        keyRule: "Imlo qoidasi: ЖИ va ШИ har doim И harfi bilan yoziladi (жизнь, машина, карандаши).",
        example: "Misol: Это моя новая книга. У меня есть хороший друг."
      },
      {
        title: '2-bob. Kelishiklar va predloglar (Падежи)',
        summary: "6 ta padej va eng ko'p ishlatiladigan predloglar.",
        content: [
          "Rus tilida 6 ta padej bor: Именительный, Родительный, Дательный, Винительный, Творительный va Предложный.",
          "'У меня нет...' iborasidan keyin doim Родительный padej (кого? чего?) ishlatiladi: У меня нет книги.",
          "Joyni bildirishda 'на' (ustida) va 'в' (ichida) predloglari Predlojniy padej bilan qo'llaniladi: книга на столе, ученик в школе."
        ],
        keyRule: "Надеть — kiyimni kiyish (надеть шапку); Одеть — birovni kiyintirish (одеть ребёнка).",
        example: "Misol: Мы ходим в школу каждый день. На столе лежит интересная книга."
      }
    ];
  }

  // Ona tili, Alifbe, Tabiiy fan
  return [
    {
      title: `1-bob. ${subject} asosiy tushunchalar va imlo (${grade}-sinf)`,
      summary: `${grade}-sinf ${subject} fani bo'yicha eng muhim nazariy qoidalar va misollar.`,
      content: [
        "O'zbek lotin alifbosida 29 ta harf bor: 26 ta yakka harf va 3 ta harf birikmasi (sh, ch, ng). Tilimizda 6 ta unli tovush mavjud: a, o, u, i, e, o'.",
        "So'zlar ma'no va grammatik xususiyatiga ko'ra mustaqil (ot, sifat, son, olmosh, fe'l, ravish) va yordamchi so'z turkumlariga bo'linadi.",
        "Atoqli otlar (kishilarning ism-familiyalari, shahar va davlat nomlari) doimo bosh harf bilan yoziladi."
      ],
      keyRule: "Sinonim — ma'nodosh so'zlar (go'zal — chiroyli); Antonim — zid ma'noli so'zlar (katta — kichik); Omonim — shakldosh so'zlar (yuz — 100 va chehra).",
      example: "Misol: 'O'zbekiston — kelajagi buyuk davlat' gapida 'O'zbekiston' atoqli ot bo'lib, bosh harf bilan yoziladi."
    },
    {
      title: '2-bob. Gap bo‘laklari, kelishiklar va tinish belgilari',
      summary: "Ega, kesim, 6 ta kelishik va to'g'ri yozuv qoidalari.",
      content: [
        "Gapning asosini tashkil etuvchi bosh bo'laklar — Ega (kim? nima?) va Kesim (nima qildi? qanday?).",
        "O'zbek tilida 6 ta kelishik mavjud: Bosh, Qaratqich (-ning), Tushum (-ni), Jo'nalish (-ga/-ka/-qa), O'rin-payt (-da) va Chiqish (-dan).",
        "So'roq gap oxirida (?), his-hayajonli undov gap oxirida (!) va darak gap oxirida nuqta (.) qo'yiladi."
      ],
      keyRule: "Juft so'zlar (ota-ona, katta-kichik) doimo chiziqcha bilan ajratib yoziladi. Tutuq belgisi (') ma'no, mas'uliyat kabi so'zlarda to'g'ri qo'llanilishi shart.",
      example: "Misol: 'Azizbek kitobni qiziqib o'qidi' — bu yerda 'Azizbek' ega, 'o'qidi' kesim, 'kitobni' tushum kelishigidagi to'ldiruvchi."
    }
  ];
}

function makeBook(grade, id, subject, title, author = 'Rasmiy o‘quv darsligi') {
  return {
    id,
    subject,
    title,
    author,
    coverImage: COVER_BY_SUBJECT[subject] || '/src/assets/images/books_library_1795709198453.jpg',
    url: '',
    chapters: buildDefaultChapters(grade, subject),
  };
}

export const BOOKS_BY_GRADE = {
  1: [
    makeBook(1, '1-alifbe', 'Alifbe', 'Alifbe (1-sinf)'),
    makeBook(1, '1-matematika', 'Matematika', 'Matematika (1-sinf)'),
    makeBook(1, '1-ona-tili', 'Ona tili', 'Ona tili va o‘qish savodxonligi (1-sinf)'),
    makeBook(1, '1-tabiiy', 'Tabiiy fan', 'Tabiiy fanlar (1-sinf)'),
  ],
  2: [
    makeBook(2, '2-ona-tili', 'Ona tili', 'Ona tili va o‘qish savodxonligi (2-sinf)'),
    makeBook(2, '2-matematika', 'Matematika', 'Matematika (2-sinf)'),
    makeBook(2, '2-ingliz', 'Ingliz tili', 'English (2-sinf)'),
    makeBook(2, '2-rus', 'Rus tili', 'Rus tili (2-sinf)'),
  ],
  3: [
    makeBook(3, '3-ona-tili', 'Ona tili', 'Ona tili va o‘qish savodxonligi (3-sinf)'),
    makeBook(3, '3-matematika', 'Matematika', 'Matematika (3-sinf)'),
    makeBook(3, '3-ingliz', 'Ingliz tili', 'English (3-sinf)'),
    makeBook(3, '3-tabiiy', 'Tabiiy fan', 'Tabiiy fanlar (3-sinf)'),
  ],
  4: [
    makeBook(4, '4-ona-tili', 'Ona tili', 'Ona tili (4-sinf)'),
    makeBook(4, '4-matematika', 'Matematika', 'Matematika (4-sinf)'),
    makeBook(4, '4-ingliz', 'Ingliz tili', 'English (4-sinf)'),
    makeBook(4, '4-rus', 'Rus tili', 'Rus tili (4-sinf)'),
  ],
  5: [
    makeBook(5, '5-informatika', 'Informatika', 'Informatika va axborot texnologiyalari (5-sinf)'),
    makeBook(5, '5-matematika', 'Matematika', 'Matematika (5-sinf)'),
    makeBook(5, '5-ona-tili', 'Ona tili', 'Ona tili (5-sinf)'),
    makeBook(5, '5-ingliz', 'Ingliz tili', 'English (5-sinf)'),
  ],
  6: [
    makeBook(6, '6-informatika', 'Informatika', 'Informatika va axborot texnologiyalari (6-sinf)'),
    makeBook(6, '6-matematika', 'Matematika', 'Matematika (6-sinf)'),
    makeBook(6, '6-ona-tili', 'Ona tili', 'Ona tili (6-sinf)'),
    makeBook(6, '6-ingliz', 'Ingliz tili', 'English (6-sinf)'),
  ],
  7: [
    makeBook(7, '7-informatika', 'Informatika', 'Informatika va axborot texnologiyalari (7-sinf)'),
    makeBook(7, '7-algebra', 'Matematika', 'Algebra (7-sinf)'),
    makeBook(7, '7-ona-tili', 'Ona tili', 'Ona tili (7-sinf)'),
    makeBook(7, '7-ingliz', 'Ingliz tili', 'English (7-sinf)'),
  ],
  8: [
    makeBook(8, '8-informatika', 'Informatika', 'Informatika va axborot texnologiyalari (8-sinf)', 'Ustoz: Shohista Qodirova tavsiyasi'),
    makeBook(8, '8-algebra', 'Matematika', 'Algebra (8-sinf)'),
    makeBook(8, '8-geometriya', 'Geometriya', 'Geometriya (8-sinf)'),
    makeBook(8, '8-ona-tili', 'Ona tili', 'Ona tili (8-sinf)'),
    makeBook(8, '8-ingliz', 'Ingliz tili', 'English (8-sinf)'),
    makeBook(8, '8-rus', 'Rus tili', 'Rus tili (8-sinf)'),
  ],
  9: [
    makeBook(9, '9-informatika', 'Informatika', 'Informatika va axborot texnologiyalari (9-sinf)'),
    makeBook(9, '9-algebra', 'Matematika', 'Algebra (9-sinf)'),
    makeBook(9, '9-ona-tili', 'Ona tili', 'Ona tili (9-sinf)'),
    makeBook(9, '9-ingliz', 'Ingliz tili', 'English (9-sinf)'),
  ],
  10: [
    makeBook(10, '10-informatika', 'Informatika', 'Informatika va axborot texnologiyalari (10-sinf)'),
    makeBook(10, '10-algebra', 'Matematika', 'Algebra va analiz asoslari (10-sinf)'),
    makeBook(10, '10-ona-tili', 'Ona tili', 'Ona tili (10-sinf)'),
    makeBook(10, '10-ingliz', 'Ingliz tili', 'English (10-sinf)'),
  ],
  11: [
    makeBook(11, '11-informatika', 'Informatika', 'Informatika va axborot texnologiyalari (11-sinf)'),
    makeBook(11, '11-algebra', 'Matematika', 'Algebra va analiz asoslari (11-sinf)'),
    makeBook(11, '11-ona-tili', 'Ona tili', 'Ona tili (11-sinf)'),
    makeBook(11, '11-ingliz', 'Ingliz tili', 'English (11-sinf)'),
  ],
};
