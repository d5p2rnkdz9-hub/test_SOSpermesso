'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

interface SlideTransitionProps {
  nodeId: string;
  direction: 'forward' | 'back';
  children: ReactNode;
}

/**
 * CSS slide transition wrapper for question navigation.
 *
 * When nodeId changes:
 * 1. Fade out + slide in exit direction (200ms)
 * 2. Swap children
 * 3. Fade in + slide from entry direction (300ms ease-out)
 *
 * RTL-aware via Tailwind rtl: variants that mirror translate directions.
 */
export function SlideTransition({
  nodeId,
  direction,
  children,
}: SlideTransitionProps) {
  const [displayedChildren, setDisplayedChildren] = useState(children);
  const [visible, setVisible] = useState(true);
  const previousNodeIdRef = useRef(nodeId);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const animateTransition = useCallback(
    (newChildren: ReactNode) => {
      // Phase 1: fade out
      setVisible(false);

      // Phase 2: after fade out completes, swap content
      timeoutRef.current = setTimeout(() => {
        setDisplayedChildren(newChildren);

        // Phase 3: on next frame, fade in from new direction
        requestAnimationFrame(() => {
          setVisible(true);
        });
      }, 200);
    },
    [],
  );

  useEffect(() => {
    if (nodeId !== previousNodeIdRef.current) {
      previousNodeIdRef.current = nodeId;
      animateTransition(children);
    } else {
      // Same node, just update children directly (e.g. selection state change)
      setDisplayedChildren(children);
    }
  }, [nodeId, children, animateTransition]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Translate classes based on direction and visibility
  // Forward: enter from end (right in LTR, left in RTL)
  // Back: enter from start (left in LTR, right in RTL)
  const getTranslateClass = () => {
    if (visible) return 'translate-x-0';

    if (direction === 'forward') {
      // Exit: slide to start; Enter: slide from end
      return 'translate-x-5 rtl:-translate-x-5';
    }
    // Back: exit to end; enter from start
    return '-translate-x-5 rtl:translate-x-5';
  };

  return (
    <div
      className={`
        transition-all duration-300 ease-out
        ${visible ? 'opacity-100' : 'opacity-0'}
        ${getTranslateClass()}
      `}
    >
      {displayedChildren}
    </div>
  );
}
