import { create } from 'zustand';

interface AppState {
  classificationVersion: number;
  triggerClassificationRefresh: () => void;
}

export const useAppStore = create<AppState>((set: (fn: (state: AppState) => Partial<AppState>) => void) => ({
  classificationVersion: 0,
  triggerClassificationRefresh: () => set((state: AppState) => ({ classificationVersion: state.classificationVersion + 1 })),
}));
