export const shouldResetDaily = (
  lastResetAt: string | null | undefined
): boolean => {
  if (!lastResetAt) return true;
  const lastResetDate = new Date(lastResetAt);
  if (Number.isNaN(lastResetDate.getTime())) return true;
  const now = new Date();
  return (
    lastResetDate.getUTCFullYear() !== now.getUTCFullYear() ||
    lastResetDate.getUTCMonth() !== now.getUTCMonth() ||
    lastResetDate.getUTCDate() !== now.getUTCDate()
  );
};

export const nowIsoString = (): string => {
  return new Date().toISOString();
};
