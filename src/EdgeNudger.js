import { useScroll } from '@react-three/drei';
import { useEffect } from 'react';

// Hacky component to nudge the scroll position slightly when at the top or bottom
// so that we don't get caught in the epsilons at the edges
// This is a workaround for the fact that ScrollControls doesn't scroll at perfect edges
export function EdgeNudger() {
  const scroll = useScroll();

  useEffect(() => {
    const el = scroll.el
    if (!el) return

    let isMouseDown = false

    const checkEdges = () => {
      const max = el.scrollHeight - el.clientHeight

      // run AFTER drei’s own scroll handler
      requestAnimationFrame(() => {
        if (el.scrollTop <= 0) el.scrollTop = 1           // top edge
        else if (el.scrollTop >= max) el.scrollTop = max - 1 // bottom edge
      })
    }

    const onScroll = () => !isMouseDown && checkEdges()

    const onMouseDown   = () => (isMouseDown = true)
    const onMouseUp     = () => { isMouseDown = false; checkEdges() }
    const onResize      = () => checkEdges()              // keep things sane on resize

    el.addEventListener('scroll', onScroll,  { passive: true })
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup',   onMouseUp)
    window.addEventListener('resize',      onResize)

    // make sure we start off-edge
    checkEdges()

    return () => {
      el.removeEventListener('scroll', onScroll)
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup',   onMouseUp)
      window.removeEventListener('resize',      onResize)
    }
  }, [scroll])   // will run again after every drei resize effect

  return null
}
