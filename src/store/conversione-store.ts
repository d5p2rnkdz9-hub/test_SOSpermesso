'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { conversioneTree } from '@/lib/conversione-tree';
import { getNextNodeId, isTerminalNode } from '@/lib/tree-engine';

/**
 * Zustand store for the conversione decision tree session.
 *
 * Separate from the main tree store to avoid disrupting existing
 * Italian tree sessions. Uses its own localStorage key.
 */

interface ConversioneState {
  currentNodeId: string;
  answers: Record<string, string>;
  history: string[];
  outcomeId: string | null;
  sessionStartedAt: string | null;
}

interface ConversioneActions {
  startSession: () => void;
  selectOption: (optionKey: string) => void;
  goBack: () => void;
  goBackTo: (nodeId: string) => void;
  reset: () => void;
}

const initialState: ConversioneState = {
  currentNodeId: conversioneTree.startNodeId,
  answers: {},
  history: [],
  outcomeId: null,
  sessionStartedAt: null,
};

export const useConversioneStore = create<ConversioneState & ConversioneActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      startSession: () => {
        set({
          sessionStartedAt: new Date().toISOString(),
          currentNodeId: conversioneTree.startNodeId,
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

        const nextNodeId = getNextNodeId(conversioneTree, currentNodeId, optionKey);

        if (!nextNodeId) {
          set({ answers: newAnswers, history: newHistory });
          return;
        }

        const terminal = isTerminalNode(conversioneTree, nextNodeId);

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
      name: 'sospermesso-conversione-session',
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
 * Hook to track Zustand persist hydration for the conversione store.
 * Same pattern as useTreeHydration in tree-store.ts.
 */
export function useConversioneHydration(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (useConversioneStore.persist.hasHydrated()) {
      setIsHydrated(true);
      return;
    }

    const unsubscribe = useConversioneStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    return unsubscribe;
  }, []);

  return isHydrated;
}
