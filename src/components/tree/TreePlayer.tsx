'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getNode, getOptionsForNode } from '@/lib/tree-engine';
import type { TreeData } from '@/types/tree';

import { QuestionScreen } from './QuestionScreen';
import { SlideTransition } from './SlideTransition';

interface TreePlayerProps {
  tree: TreeData;
  currentNodeId: string;
  answers: Record<string, string>;
  historyLength: number;
  onSelectOption: (optionKey: string) => void;
}

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
export function TreePlayer({
  tree,
  currentNodeId,
  answers,
  historyLength,
  onSelectOption,
}: TreePlayerProps) {
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevHistoryLengthRef = useRef(historyLength);

  // Detect goBack by watching historyLength changes
  useEffect(() => {
    if (historyLength < prevHistoryLengthRef.current) {
      setDirection('back');
    }
    prevHistoryLengthRef.current = historyLength;
  }, [historyLength]);

  const handleSelect = useCallback(
    (optionKey: string) => {
      if (isTransitioning) return;

      setIsTransitioning(true);
      setDirection('forward');

      // Brief delay to show selected card state before advancing
      setTimeout(() => {
        onSelectOption(optionKey);
        setIsTransitioning(false);
      }, 200);
    },
    [isTransitioning, onSelectOption],
  );

  const node = getNode(tree, currentNodeId);
  const options = getOptionsForNode(tree, currentNodeId);
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
