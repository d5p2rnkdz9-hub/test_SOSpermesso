'use client';

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
 */

interface TreeState {
  currentNodeId: string;
  answers: Record<string, string>; // nodeId -> optionKey
  history: string[]; // Stack of nodeIds for back navigation
  userName: string | null;
  outcomeId: string | null;
  sessionStartedAt: string | null;
  isHydrated: boolean;
}

interface TreeActions {
  startSession: (userName: string | null) => void;
  selectOption: (optionKey: string) => void;
  goBack: () => void;
  reset: () => void;
  setHydrated: () => void;
}

const initialState: TreeState = {
  currentNodeId: italianTree.startNodeId,
  answers: {},
  history: [],
  userName: null,
  outcomeId: null,
  sessionStartedAt: null,
  isHydrated: false,
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
        set({
          ...initialState,
          // Preserve isHydrated since we're already in the client
          isHydrated: true,
        });
      },

      setHydrated: () => {
        set({ isHydrated: true });
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
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (!error) {
            useTreeStore.getState().setHydrated();
          }
        };
      },
    },
  ),
);
