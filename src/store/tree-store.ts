'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { italianTree } from '@/lib/tree-data';
import { getNextNodeId, isTerminalNode } from '@/lib/tree-engine';

/**
 * Zustand store for the decision tree session.
 *
 * Manages the full traversal state: current position, answer history,
 * back-navigation stack, and localStorage persistence.
 *
 * Key behavior:
 * - selectOption: tap-to-advance with silent downstream discard on branch change
 * - goBack: restores previous question with its answer still highlighted
 * - persist: survives page refresh via localStorage ('sospermesso-tree-session')
 *
 * Hydration note: Do NOT read hydration state from the store. Zustand v5's
 * useSyncExternalStore uses getInitialState() as getServerSnapshot, which
 * always returns pre-hydration state. Use the useTreeHydration() hook instead.
 */

interface TreeState {
  currentNodeId: string;
  answers: Record<string, string>; // nodeId -> optionKey
  history: string[]; // Stack of nodeIds for back navigation
  userName: string | null;
  outcomeId: string | null;
  sessionStartedAt: string | null;
}

interface TreeActions {
  startSession: (userName: string | null) => void;
  selectOption: (optionKey: string) => void;
  goBack: () => void;
  reset: () => void;
}

const initialState: TreeState = {
  currentNodeId: italianTree.startNodeId,
  answers: {},
  history: [],
  userName: null,
  outcomeId: null,
  sessionStartedAt: null,
};

export const useTreeStore = create<TreeState & TreeActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      startSession: (userName: string | null) => {
        set({
          userName,
          sessionStartedAt: new Date().toISOString(),
          currentNodeId: italianTree.startNodeId,
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

        // If the user changed their mind after going back, discard downstream answers.
        // After goBack(), currentNodeId is NOT in history (it was popped off).
        // Any answered node that is NOT in the history stack and is NOT the current
        // node is a downstream node from a previous forward traversal.
        if (existingAnswer !== undefined && existingAnswer !== optionKey) {
          const preservedNodes = new Set(newHistory);
          preservedNodes.add(currentNodeId);

          for (const nodeId of Object.keys(newAnswers)) {
            if (!preservedNodes.has(nodeId)) {
              delete newAnswers[nodeId];
            }
          }
        }

        // Record the new answer
        newAnswers[currentNodeId] = optionKey;

        // Push current node onto history stack (we're about to leave it)
        newHistory.push(currentNodeId);

        // Determine the next node
        const nextNodeId = getNextNodeId(italianTree, currentNodeId, optionKey);

        if (!nextNodeId) {
          // No matching edge -- should not happen with valid tree data, but handle gracefully
          set({ answers: newAnswers, history: newHistory });
          return;
        }

        // Check if the next node is a terminal (result) node
        const terminal = isTerminalNode(italianTree, nextNodeId);

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

        // Go back to the previous node. Do NOT remove its answer -- it stays highlighted.
        set({
          currentNodeId: previousNodeId,
          history: newHistory,
          outcomeId: null,
        });
      },

      reset: () => {
        set({ ...initialState });
      },
    }),
    {
      name: 'sospermesso-tree-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentNodeId: state.currentNodeId,
        answers: state.answers,
        history: state.history,
        userName: state.userName,
        outcomeId: state.outcomeId,
        sessionStartedAt: state.sessionStartedAt,
      }),
    },
  ),
);

/**
 * Hook to track Zustand persist hydration at the component level.
 *
 * Why this exists: Zustand v5's useSyncExternalStore uses
 * api.getInitialState() as getServerSnapshot. The persist middleware
 * sets getInitialState to the PRE-hydration state, so store-level
 * isHydrated flags read as false during React hydration even though
 * the actual store is already hydrated. This causes the hydration guard
 * to show a spinner that never resolves.
 *
 * This hook uses useEffect (client-only) + persist.onFinishHydration
 * to reliably track when localStorage data has been loaded.
 *
 * @returns true once the Zustand persist middleware has finished loading
 *          state from localStorage, false before that.
 */
export function useTreeHydration(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // The persist middleware may have already completed hydration
    // synchronously during module evaluation (localStorage is sync).
    if (useTreeStore.persist.hasHydrated()) {
      setIsHydrated(true);
      return;
    }

    // If not yet hydrated (e.g. async storage), listen for completion.
    const unsubscribe = useTreeStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    return unsubscribe;
  }, []);

  return isHydrated;
}
