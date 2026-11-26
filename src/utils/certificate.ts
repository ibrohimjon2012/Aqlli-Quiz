import { QuizResultRecord } from '../types';
import { getCertificateRank } from './quizLogic';

export function renderCertificateCanvas(
  canvas: HTMLCanvasElement,
  result: QuizResultRecord
): void {
  const width = 1600;
  const height = 1130;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Toza iliq oq fon
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#f8fafc');
  bgGrad.addColorStop(0.5, '#ffffff');
  bgGrad.addColorStop(1, '#f0f9ff');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Dekorativ burchak nurlari
  ctx.save();
  ctx.fillStyle = 'rgba(2, 132, 199, 0.05)';
  ctx.beginPath();
  ctx.arc(0, 0, 380, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(15, 118, 110, 0.05)';
  ctx.beginPath();
  ctx.arc(width, height, 420, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Tashqi ko'k-oltin ramka
  const borderGrad = ctx.createLinearGradient(40, 40, width - 40, height - 40);
  borderGrad.addColorStop(0, '#0284c7');
  borderGrad.addColorStop(0.5, '#0f766e');
  borderGrad.addColorStop(1, '#d97706');
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 18;
  ctx.strokeRect(42, 42, width - 84, height - 84);

  // Ichki nafis oltin ramka
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.strokeRect(68, 68, width - 136, height - 136);

  // Burchak bezaklari
  const drawCorner = (x: number, y: number, sx: number, sy: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sx, sy);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, 56, 8);
    ctx.fillRect(0, 0, 8, 56);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(20, 20, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  drawCorner(84, 84, 1, 1);
  drawCorner(width - 84, 84, -1, 1);
  drawCorner(84, height - 84, 1, -1);
  drawCorner(width - 84, height - 84, -1, -1);

  // 4. Yuqori sarlavha
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 28px "Outfit", sans-serif';
  ctx.fillText('SMART QUIZ · TA’LIMIY PLATFORMA', width / 2, 150);

  ctx.fillStyle = '#0f172a';
  ctx.font = '800 84px "Outfit", sans-serif';
  ctx.fillText('SERTIFIKAT', width / 2, 245);

  // Ajratuvchi chiziq
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(460, 278);
  ctx.lineTo(width - 460, 278);
  ctx.stroke();

  // 5. Unvon lentasi
  const rank = getCertificateRank(result.finalScore);
  ctx.fillStyle = result.finalScore >= 50 ? '#fef3c7' : '#e0f2fe';
  const pillW = 460;
  const pillH = 56;
  const pillX = width / 2 - pillW / 2;
  const pillY = 308;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 28);
  ctx.fill();
  ctx.strokeStyle = result.finalScore >= 50 ? '#f59e0b' : '#0284c7';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = result.finalScore >= 50 ? '#b45309' : '#0369a1';
  ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Unvon: ${rank}`, width / 2, pillY + 38);

  // 6. O'quvchi ismi
  ctx.fillStyle = '#475569';
  ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Ushbu sertifikat quyidagi faol o‘quvchiga topshirildi:', width / 2, 430);

  ctx.fillStyle = '#0f172a';
  ctx.font = '800 62px "Outfit", sans-serif';
  ctx.fillText(result.playerName, width / 2, 512);

  // Ism tagidagi chiziq
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(360, 535);
  ctx.lineTo(width - 360, 535);
  ctx.stroke();

  // 7. Fan, sinf va natija
  ctx.fillStyle = '#334155';
  ctx.font = '600 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `${result.grade}-sinf o‘quvchisi · Fan: ${result.subjectTitle} (${result.level})`,
    width / 2,
    598
  );

  // Natija bloklari
  const cardW = 300;
  const cardH = 128;
  const startX = width / 2 - (cardW * 3 + 48) / 2;
  const cardY = 640;

  const stats = [
    { label: 'UMUMIY BALL', val: `${result.finalScore} / 100`, color: '#0284c7' },
    { label: 'TO‘G‘RI JAVOBLAR', val: `${result.correctCount} / ${result.totalQuestions}`, color: '#059669' },
    { label: 'SANA', val: new Date(result.dateISO).toLocaleDateString('uz-UZ'), color: '#0f172a' },
  ];

  stats.forEach((st, i) => {
    const x = startX + i * (cardW + 24);
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(x, cardY, cardW, cardH, 18);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(st.label, x + cardW / 2, cardY + 42);

    ctx.fillStyle = st.color;
    ctx.font = '800 38px "JetBrains Mono", monospace';
    ctx.fillText(st.val, x + cardW / 2, cardY + 95);
  });

  // 8. O'qituvchi va Muallif imzo qismi
  const bottomY = 935;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText("Informatika o'qituvchisi:", 160, bottomY);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 30px "Outfit", sans-serif';
  ctx.fillText('Shohista Qodirova', 160, bottomY + 42);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Quiz muallifi:', width - 160, bottomY);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 30px "Outfit", sans-serif';
  ctx.fillText('Ibrohimjon Abdumajidov', width - 160, bottomY + 42);

  // 9. Oltin muhr (markazda pastda)
  const sealX = width / 2;
  const sealY = 930;
  ctx.save();
  ctx.translate(sealX, sealY);
  // Tishli oltin aylana
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  for (let i = 0; i < 24; i++) {
    const angle = (i * Math.PI * 2) / 24;
    const r = i % 2 === 0 ? 78 : 68;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#fffbeb';
  ctx.beginPath();
  ctx.arc(0, 0, 56, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#b45309';
  ctx.font = 'bold 17px "Outfit", sans-serif';
  ctx.fillText('SMART QUIZ', 0, -10);
  ctx.font = '800 22px "Outfit", sans-serif';
  ctx.fillText('TASDIQLANDI', 0, 18);
  ctx.restore();
}

export function downloadCertificatePNG(
  canvas: HTMLCanvasElement,
  playerName: string
): void {
  try {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const safeName = playerName.toLowerCase().replace(/[^a-z0-9]+/gi, '_');
    link.download = `smart_quiz_sertifikat_${safeName || 'oquvchi'}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Sertifikat yuklab olishda xato:', err);
  }
}
