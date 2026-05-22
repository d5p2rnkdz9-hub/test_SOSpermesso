'use client';

import { create } from 'zustand';

import { italianTree } from '@/lib/tree-data';
import { getNextNodeId, isTerminalNode } from '@/lib/tree-engine';

/**
 * Zustand store for the decision tree session.
 *
 * In-memory only — every page load starts a fresh session.
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
  goBackTo: (nodeId: string) => void;
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

export const useTreeStore = create<TreeState & TreeActions>()((set, get) => ({
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

  goBackTo: (nodeId: string) => {
    const { history } = get();
    const targetIndex = history.indexOf(nodeId);
    if (targetIndex === -1) return; // Safety guard: nodeId not in history

    // Pop history to just before the target node.
    // Answers for popped nodes are preserved (same behavior as goBack).
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
}));
