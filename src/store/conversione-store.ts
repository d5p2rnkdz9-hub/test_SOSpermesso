'use client';

import { create } from 'zustand';

import { conversioneTree } from '@/lib/conversione-tree';
import { getNextNodeId, isTerminalNode } from '@/lib/tree-engine';

/**
 * Zustand store for the conversione decision tree session.
 *
 * In-memory only — every page load starts a fresh session.
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

export const useConversioneStore = create<ConversioneState & ConversioneActions>()((set, get) => ({
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
}));
