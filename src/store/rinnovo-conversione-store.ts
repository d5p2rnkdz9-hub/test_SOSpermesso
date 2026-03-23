'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { rinnovoConversioneTree } from '@/lib/rinnovo-conversione-tree';
import { getNextNodeId, isTerminalNode } from '@/lib/tree-engine';

/**
 * Zustand store for the combined rinnovo-conversione decision tree session.
 *
 * Separate from main tree and conversione stores.
 * Uses its own localStorage key.
 */

interface RCState {
  currentNodeId: string;
  answers: Record<string, string>;
  history: string[];
  outcomeId: string | null;
  sessionStartedAt: string | null;
}

interface RCActions {
  startSession: () => void;
  selectOption: (optionKey: string) => void;
  goBack: () => void;
  goBackTo: (nodeId: string) => void;
  reset: () => void;
}

const initialState: RCState = {
  currentNodeId: rinnovoConversioneTree.startNodeId,
  answers: {},
  history: [],
  outcomeId: null,
  sessionStartedAt: null,
};

export const useRinnovoConversioneStore = create<RCState & RCActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      startSession: () => {
        set({
          sessionStartedAt: new Date().toISOString(),
          currentNodeId: rinnovoConversioneTree.startNodeId,
          answers: {},
          history: [],
          outcomeId: null,
        });
      },

      selectOption: (optionKey: string) => {
        const { currentNodeId, answers, history } = get();

        const existingAnswer = answers[currentNodeId];
        let newAnswers = { ...answers };
        let newHistory = [...history];

        if (existingAnswer !== undefined && existingAnswer !== optionKey) {
          const preservedNodes = new Set(newHistory);
          preservedNodes.add(currentNodeId);

          for (const nodeId of Object.keys(newAnswers)) {
            if (!preservedNodes.has(nodeId)) {
              delete newAnswers[nodeId];
            }
          }
        }

        newAnswers[currentNodeId] = optionKey;
        newHistory.push(currentNodeId);

        const nextNodeId = getNextNodeId(rinnovoConversioneTree, currentNodeId, optionKey);

        if (!nextNodeId) {
          set({ answers: newAnswers, history: newHistory });
          return;
        }

        const terminal = isTerminalNode(rinnovoConversioneTree, nextNodeId);

        set({
          currentNodeId: nextNodeId,
          answers: newAnswers,
          history: newHistory,
          outcomeId: terminal ? nextNodeId : null,
        });
      },

      goBack: () => {
        const { history } = get();
        if (history.length === 0) return;

        const newHistory = [...history];
        const previousNodeId = newHistory.pop()!;

        set({
          currentNodeId: previousNodeId,
          history: newHistory,
          outcomeId: null,
        });
      },

      goBackTo: (nodeId: string) => {
        const { history } = get();
        const targetIndex = history.indexOf(nodeId);
        if (targetIndex === -1) return;

        const newHistory = history.slice(0, targetIndex);

        set({
          currentNodeId: nodeId,
          history: newHistory,
          outcomeId: null,
        });
      },

      reset: () => {
        set({ ...initialState });
      },
    }),
    {
      name: 'sospermesso-rinnovo-conversione-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentNodeId: state.currentNodeId,
        answers: state.answers,
        history: state.history,
        outcomeId: state.outcomeId,
        sessionStartedAt: state.sessionStartedAt,
      }),
    },
  ),
);

/**
 * Hook to track Zustand persist hydration for the rinnovo-conversione store.
 * Same pattern as useTreeHydration in tree-store.ts.
 */
export function useRinnovoConversioneHydration(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (useRinnovoConversioneStore.persist.hasHydrated()) {
      setIsHydrated(true);
      return;
    }

    const unsubscribe = useRinnovoConversioneStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    return unsubscribe;
  }, []);

  return isHydrated;
}
