export const hasIncompleteVariables = (variables: string[], values: Record<string, string>) =>
  variables.some((variable) => {
    const value = values[variable];
    return !value || value.trim().length === 0;
  });
