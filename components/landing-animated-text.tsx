'use client'

import { useEffect, useRef } from 'react'
import { animate, stagger, splitText } from 'animejs'

export function LandingAnimatedText() {
  const containerRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clean up any existing split elements from strict mode
    containerRef.current.innerHTML = "Manage events effortlessly"

    const { chars } = splitText(containerRef.current, {
      chars: { wrap: true },
    })

    // Inline elements cannot be transformed, so ensure they are inline-block
    if (chars && chars.length) {
      chars.forEach((c: HTMLElement) => {
        c.style.display = 'inline-block'
      })
    }

    const animation = animate(chars, {
      y: ['75%', '0%'],
      duration: 750,
      ease: 'out(3)',
      delay: stagger(50),
      loop: true,
      alternate: true,
    })

    return () => {
      animation.pause()
      if (containerRef.current) {
        containerRef.current.innerHTML = "Manage events effortlessly"
      }
    }
  }, [])

  return (
    <h1 
      ref={containerRef} 
      className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground"
      aria-label="Manage events effortlessly"
    >
      Manage events effortlessly
    </h1>
  )
}
