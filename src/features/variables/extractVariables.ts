const VARIABLE_REGEX = /{{(.*?)}}/g;

export const extractVariables = (content: string): string[] => {
  if (!content) return [];
  const matches = content.match(VARIABLE_REGEX);
  if (!matches) return [];

  const normalized = matches
    .map((match) => match.replace(/[{}]/g, '').trim())
    .filter(Boolean)
    .map((name) => name.replace(/\s+/g, '_'));

  return Array.from(new Set(normalized));
};

export const replaceVariables = (content: string, values: Record<string, string>) => {
  return content.replace(VARIABLE_REGEX, (_, variable) => {
    const key = variable.trim().replace(/\s+/g, '_');
    return values[key] ?? `{{${variable}}}`;
  });
};
