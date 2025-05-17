import { useScroll } from '@react-three/drei';
import { useEffect } from 'react';

// Hacky component to nudge the scroll position slightly when at the top or bottom
// so that we don't get caught in the epsilons at the edges
// This is a workaround for the fact that ScrollControls doesn't scroll at perfect edges
export function EdgeNudger() {
  const scroll = useScroll();

  useEffect(() => {
    if (!scroll.el) return;

    // Add small delay for initialization
    setTimeout(() => {
      const scrollElement = scroll.el;
      let isAtEdge = false;
      let isMouseDown = false;

      // Track mouse down/up to prevent nudging during drag
      const onMouseDown = () => {
        isMouseDown = true;
      };

      const onMouseUp = () => {
        isMouseDown = false;
        // Check edges after mouse up, with a small delay
        setTimeout(checkEdges, 100);
      };

      const checkEdges = () => {
        if (isAtEdge || isMouseDown) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollElement;
        const maxScroll = scrollHeight - clientHeight;

        // Check if we're exactly at the top or bottom
        if (scrollTop === 0) {
          isAtEdge = true;
          // Nudge slightly down (into the epsilon zone)
          scrollElement.scrollTop = 0.001 * maxScroll;
          setTimeout(() => { isAtEdge = false; }, 100);
        } else if (scrollTop >= maxScroll) {
          isAtEdge = true;
          // Nudge slightly up (into the epsilon zone)
          scrollElement.scrollTop = maxScroll - 0.001 * maxScroll;
          setTimeout(() => { isAtEdge = false; }, 100);
        }
      };

      // Check edges on scroll events
      const onScroll = () => {
        if (!isMouseDown) {
          checkEdges();
        }
      };

      // Also check periodically but not during mouse drag
      const interval = setInterval(() => {
        if (!isMouseDown) {
          checkEdges();
        }
      }, 500);

      // Add event listeners
      scrollElement.addEventListener('scroll', onScroll);
      document.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mouseup', onMouseUp);

      return () => {
        scrollElement.removeEventListener('scroll', onScroll);
        document.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('mouseup', onMouseUp);
        clearInterval(interval);
      };
    }, 500);
  }, [scroll]);

  return null;
}
