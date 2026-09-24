// Local, rule-based replacements for the Gemini calls in the first version.
// The async signatures are kept so an LLM-backed implementation can be
// swapped back in later without changing the components.

export const generateSubtasks = async (taskTitle: string): Promise<string[]> => {
  const base = taskTitle || "Görev";

  return [
    `${base} için hazırlık yap`,
    `${base} adımlarını belirle`,
    `${base} üzerinde odaklı çalışma`,
    `${base} için kontrol ve düzeltme`,
    `${base} tamamlandı mı diye gözden geçir`
  ];
};

export const getMotivation = async (completedCount: number): Promise<string> => {
  const messages = [
    "Harika başlangıç! Küçük adımlar büyük sonuçlar doğurur.",
    "Süpersin! Her odak döngüsü seni hedefine biraz daha yaklaştırıyor.",
    "Devam et! Vazgeçmeyenler her zaman kazanmaz ama kazananlar asla vazgeçmez.",
    "Odaklanman sayesinde beynin sana teşekkür ediyor.",
    "Bugünkü emeğin, yarının rahatlığı olacak. Devam! 💪",
    "Zor geldiğinde unutma: Başlamış olman bile çoğu kişiden ileride olduğun anlamına gelir."
  ];

  const index = Math.min(completedCount - 1, messages.length - 1);
  return messages[index] ?? messages[messages.length - 1];
};
