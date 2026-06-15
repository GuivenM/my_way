import { useEffect, useRef } from 'react'

export function useDebounce(fn, delay = 1000) {
  const timer = useRef(null)
  return (...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), delay)
  }
}
