import { useMemo } from 'react';

interface CharacterLimitValidationProps {
  content: string;
  maxLength: number;
  existingError?: string;
}

interface CharacterLimitValidationResult {
  charCount: number;
  isApproachingLimit: boolean;
  isOverLimit: boolean;
  contentError: string | undefined;
}

export const useCharacterLimitValidation = ({
  content,
  maxLength,
  existingError
}: CharacterLimitValidationProps): CharacterLimitValidationResult => {
  return useMemo(() => {
    const charCount = content?.length ?? 0;
    const isApproachingLimit =
      charCount >= maxLength * 0.9 && charCount <= maxLength;
    const isOverLimit = charCount > maxLength;
    const contentError = isOverLimit
      ? `Has superado el límite de ${maxLength} caracteres. Simplifica el prompt o divídelo en varios.`
      : existingError;

    return {
      charCount,
      isApproachingLimit,
      isOverLimit,
      contentError
    };
  }, [content, maxLength, existingError]);
};
