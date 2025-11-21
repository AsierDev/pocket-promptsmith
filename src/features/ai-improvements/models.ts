import { FREEMIUM_LIMITS } from "@/lib/limits";

export const PREMIUM_MODELS = [
  "google/gemini-2.5-flash-lite",
  "google/gemini-2.0-flash-lite-001",
] as const;

export const FREE_MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "x-ai/grok-4.1-fast:free",
] as const;

export type PremiumModel = (typeof PREMIUM_MODELS)[number];
export type FreeModel = (typeof FREE_MODELS)[number];

export const PREMIUM_DAILY_LIMIT = FREEMIUM_LIMITS.improvementsPerDay;

export const getModelsForImprovement = (premiumUsedToday: number) => {
  const hasPremiumLeft = premiumUsedToday < PREMIUM_DAILY_LIMIT;
  return hasPremiumLeft ? PREMIUM_MODELS : FREE_MODELS;
};

export const isPremiumModel = (model?: string | null): model is PremiumModel =>
  Boolean(model && PREMIUM_MODELS.includes(model as PremiumModel));

export const isFreeModel = (model?: string | null): model is FreeModel =>
  Boolean(model && FREE_MODELS.includes(model as FreeModel));
