export const FREEMIUM_LIMITS = {
  prompts: 10,
  improvementsPerDay: 5
};

export const getPromptUsageCopy = (used: number) => `${used}/${FREEMIUM_LIMITS.prompts} prompts usados`;

export const hasReachedPromptLimit = (used: number) => used >= FREEMIUM_LIMITS.prompts;

export const hasReachedImproveLimit = (used: number) => used >= FREEMIUM_LIMITS.improvementsPerDay;
