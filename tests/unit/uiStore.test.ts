import { describe, expect, it } from 'vitest';

import { useUiStore } from '@/store/uiStore';

describe('uiStore', () => {
  it('updates delete and improve prompt ids', () => {
    const { setDeletePromptId, setImprovePromptId } = useUiStore.getState();

    setDeletePromptId('123');
    setImprovePromptId('456');

    const state = useUiStore.getState();
    expect(state.deletePromptId).toBe('123');
    expect(state.improvePromptId).toBe('456');
  });

  it('toggles install banner visibility', () => {
    const { setInstallBannerVisible } = useUiStore.getState();
    setInstallBannerVisible(true);
    expect(useUiStore.getState().installBannerVisible).toBe(true);
  });
});
