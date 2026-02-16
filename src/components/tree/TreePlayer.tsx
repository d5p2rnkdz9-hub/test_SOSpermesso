'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { italianTree } from '@/lib/tree-data';
import { getNode, getOptionsForNode } from '@/lib/tree-engine';
import { useTreeStore } from '@/store/tree-store';

import { QuestionScreen } from './QuestionScreen';
import { SlideTransition } from './SlideTransition';

/**
 * Main tree orchestrator component.
 *
 * Renders the current question with slide transitions, handles
 * tap-to-advance with a brief delay (200ms) to show the selected
 * card state, and prevents double-tap during transitions.
 *
 * Terminal (result) nodes are NOT rendered here -- the parent
 * page checks outcomeId and renders the result screen itself.
 */
export function TreePlayer() {
  const currentNodeId = useTreeStore((s) => s.currentNodeId);
  const answers = useTreeStore((s) => s.answers);
  const selectOption = useTreeStore((s) => s.selectOption);

  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevHistoryLengthRef = useRef(
    useTreeStore.getState().history.length,
  );

  // Detect goBack by subscribing to history length changes
  useEffect(() => {
    const unsubscribe = useTreeStore.subscribe((state) => {
      const currentLength = state.history.length;
      if (currentLength < prevHistoryLengthRef.current) {
        setDirection('back');
      }
      prevHistoryLengthRef.current = currentLength;
    });
    return unsubscribe;
  }, []);

  const handleSelect = useCallback(
    (optionKey: string) => {
      if (isTransitioning) return;

      setIsTransitioning(true);
      setDirection('forward');

      // Brief delay to show selected card state before advancing
      setTimeout(() => {
        selectOption(optionKey);
        setIsTransitioning(false);
      }, 200);
    },
    [isTransitioning, selectOption],
  );

  const node = getNode(italianTree, currentNodeId);
  const options = getOptionsForNode(italianTree, currentNodeId);
  const selectedOptionKey = answers[currentNodeId] ?? null;

  // Terminal (result) nodes or missing nodes are not rendered by TreePlayer
  // Both 'question' and 'info' nodes are rendered (info has exactly 1 edge)
  if (!node || node.type === 'result') {
    return null;
  }

  return (
    <SlideTransition nodeId={currentNodeId} direction={direction}>
      <QuestionScreen
        question={node.question ?? ''}
        description={node.description}
        options={options}
        selectedOptionKey={selectedOptionKey}
        onSelect={handleSelect}
        disabled={isTransitioning}
      />
    </SlideTransition>
  );
}
