import { describe, expect, it } from 'vitest';
import { getNextFeedbackState, type FeedbackChoice } from '@/features/prompts/components/PromptDiffModal';

describe('prompt diff modal helpers', () => {
  it('activates selection when no previous vote exists', () => {
    expect(getNextFeedbackState(null, 'up')).toBe('up');
  });

  it('toggles off the same selection', () => {
    const vote: FeedbackChoice = 'down';
    expect(getNextFeedbackState(vote, 'down')).toBeNull();
  });

  it('switches between positive and negative feedback', () => {
    expect(getNextFeedbackState('up', 'down')).toBe('down');
  });
});
