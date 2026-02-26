'use client'

import { useEffect, useRef } from 'react'
import { createTimeline, stagger, splitText } from 'animejs'
import { cn } from '@/lib/utils'

interface AnimatedTextProps {
  text: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div' | 'p'
}

export function AnimatedText({ 
  text, 
  className,
  as: Component = 'h1' 
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clean up any existing split elements from strict mode
    containerRef.current.innerHTML = text

    // Use Anime.js v4 splitText with requested config
    const { chars } = splitText(containerRef.current, {
      chars: { 
        wrap: 'clip',
        clone: 'bottom' 
      },
    })

    const tl = createTimeline()
    
    tl.add(chars, {
      y: '-100%',
      loop: true,
      loopDelay: 350,
      duration: 750,
      ease: 'inOut(2)',
    }, stagger(150, { from: 'center' }))

    const timeoutId = setTimeout(() => {
      tl.pause()
      if (containerRef.current) {
        containerRef.current.innerHTML = text
      }
    }, 3000)

    return () => {
      tl.pause()
      clearTimeout(timeoutId)
      // Restore the original text on unmount/re-render to avoid nested spans
      if (containerRef.current) {
        containerRef.current.innerHTML = text
      }
    }
  }, [text])

  return (
    <Component 
      // @ts-ignore
      ref={containerRef} 
      className={cn("text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground", className)}
      aria-label={text}
    >
      {text}
    </Component>
  )
}
