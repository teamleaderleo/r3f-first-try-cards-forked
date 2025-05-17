import { useScroll } from '@react-three/drei';
import { useEffect } from 'react';

// Prevents teleportation during scrollbar drag
export function DragPreventer() {
  const scroll = useScroll();

  useEffect(() => {
    if (!scroll.el) return;

    const scrollElement = scroll.el;
    let isDraggingScrollbar = false;

    // Only run this on pointer down to detect scrollbar dragging
    const onPointerDown = (e) => {
      // Check if click is near the scrollbar area (right side of container)
      const rect = scrollElement.getBoundingClientRect();
      const isNearScrollbar = e.clientX > rect.right - 20;

      if (isNearScrollbar) {
        isDraggingScrollbar = true;

        // Function to handle pointer up anywhere in the document
        const onPointerUp = () => {
          isDraggingScrollbar = false;
          document.removeEventListener('pointerup', onPointerUp);
        };

        // Add temporary pointer up listener
        document.addEventListener('pointerup', onPointerUp);
      }
    };

    // Handle scroll events to prevent hitting exact edges during drag
    const onScroll = () => {
      if (!isDraggingScrollbar) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const maxScroll = scrollHeight - clientHeight;

      // During scrollbar drag, prevent hitting exactly 0 or maxScroll
      if (scrollTop === 0) {
        scrollElement.scrollTop = 1;
      } else if (scrollTop >= maxScroll) {
        scrollElement.scrollTop = maxScroll - 1;
      }
    };

    // Event listeners to prevent click teleportation
    document.addEventListener('pointerdown', onPointerDown);
    scrollElement.addEventListener('scroll', onScroll);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      scrollElement.removeEventListener('scroll', onScroll);
    };
  }, [scroll]);

  return null;
}
