'use client';

import { create } from 'zustand';

type UiStore = {
  deletePromptId: string | null;
  setDeletePromptId: (id: string | null) => void;
  improvePromptId: string | null;
  setImprovePromptId: (id: string | null) => void;
  installBannerVisible: boolean;
  setInstallBannerVisible: (visible: boolean) => void;
};

export const useUiStore = create<UiStore>((set) => ({
  deletePromptId: null,
  setDeletePromptId: (id) => set({ deletePromptId: id }),
  improvePromptId: null,
  setImprovePromptId: (id) => set({ improvePromptId: id }),
  installBannerVisible: false,
  setInstallBannerVisible: (visible) => set({ installBannerVisible: visible })
}));
