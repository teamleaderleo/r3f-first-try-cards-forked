import { useEffect, useRef } from 'react'
import { useScroll } from '@react-three/drei'

/**
 * Fixes drei's infinite scroll on browsers / zoom levels where the
 * built-in bottom check cannot be reached because of DPR rounding.
 * Works for vertical and horizontal scroll.
 */
export function WrapFixer() {
  const state = useScroll()
  const disableRef = useRef(false)          // mimics drei’s 40 ms lock

  useEffect(() => {
    const el = state.el
    if (!el) return

    const axis = state.horizontal ? 'scrollLeft' : 'scrollTop'
    const len  = state.horizontal ? 'clientWidth' : 'clientHeight'
    const size = state.horizontal ? 'scrollWidth' : 'scrollHeight'

    const maxScroll = () => el[size] - el[len]          // real bottom

    /** Teleport to the opposite side and keep drei’s `offset` in sync */
    const wrap = (toTop) => {
      const damp = toTop ? 1 - state.offset : 1 + state.offset
      el[axis]   = toTop ? 1 : maxScroll() - 1          // stay off the edge
      state.offset = toTop ? -damp : damp
    }

    const onScroll = () => {
      if (disableRef.current) return
      const cur = el[axis]
      if (cur <= 0) {
        disableRef.current = true
        wrap(false)                                      // bottom → top
        setTimeout(() => (disableRef.current = false), 40)
      } else if (cur >= maxScroll()) {
        disableRef.current = true
        wrap(true)                                       // top → bottom
        setTimeout(() => (disableRef.current = false), 40)
      }
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [state])

  return null
}
