// ❌ Artık hiçbir dış paket yok, sadece local logic

export const generateSubtasks = async (taskTitle: string): Promise<string[]> => {
  const base = taskTitle || "Görev";

  // İstersen burayı kendi stiline göre düzenleyebilirsin
  return [
    `${base} için hazırlık yap`,
    `${base} adımlarını planla`,
    `${base} üzerinde odaklı çalışma yap`,
    `${base} için gözden geçir ve düzelt`,
    `${base} tamamlandı mı kontrol et`
  ];
};

export const getMotivation = async (completedCount: number): Promise<string> => {
  const messages = [
    "Harika başlangıç! Küçük adımlar büyük sonuçlar getirir.",
    "Süpersin, her odak döngüsü seni hedefine yaklaştırıyor.",
    "Vazgeçme, istikrar her şeyden daha güçlüdür.",
    "Bugün kendin için çok iyi bir şey yapıyorsun.",
    "Zorlandığın yerde büyüyorsun, devam et.",
    "Her Pomodoro, gelecekteki rahatlığın için bir yatırım."
  ];

  const index = Math.min(completedCount - 1, messages.length - 1);
  return messages[index] ?? messages[messages.length - 1];
};
