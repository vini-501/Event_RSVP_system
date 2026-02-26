'use client'

import { useEffect, useRef } from 'react'
import { createAnimatable, createTimeline, utils, stagger } from 'animejs'

export function AttendeeHeaderBg() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    let bounds = containerRef.current.getBoundingClientRect()
    
    const refreshBounds = () => {
      if (containerRef.current) {
        bounds = containerRef.current.getBoundingClientRect()
      }
    }

    // 1. Interactive cursor tracking parallax
    const shapes = createAnimatable('.attendee-shape-inner', {
      x: 0,
      y: stagger(20, { from: 'center', start: 0 }),
      ease: 'out(4)',
    })

    const onMouseMove = (e: MouseEvent) => {
      const { width, height, left, top } = bounds
      const hw = width / 2
      const hh = height / 2
      
      const x = utils.clamp(e.clientX - left - hw, -hw, hw)
      const y = utils.clamp(e.clientY - top - hh, -hh, hh)
      
      shapes.x(x * 0.5).y(y * 0.5)
    }

    // 2. Idle continuous bubble floating
    const idleFloat = createTimeline({
      autoplay: true,
      loop: true,
    })
    
    // Animate the outer wrappers randomly to create a bubble effect
    idleFloat
      .add('.attendee-shape-outer.circle',   { translateY: -30, translateX: 20, duration: 4000, direction: 'alternate', easing: 'easeInOutSine' }, 0)
      .add('.attendee-shape-outer.triangle', { translateY: 40, translateX: -30, duration: 5000, direction: 'alternate', easing: 'easeInOutSine' }, 0)
      .add('.attendee-shape-outer.square',   { translateY: -20, translateX: -20, rotate: 45, duration: 6000, direction: 'alternate', easing: 'easeInOutSine' }, 0)

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('resize', refreshBounds)
    window.addEventListener('scroll', refreshBounds)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', refreshBounds)
      window.removeEventListener('scroll', refreshBounds)
      idleFloat.pause()
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 -z-0 pointer-events-none overflow-hidden rounded-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent backdrop-blur-[2px]" />
      
      {/* Container spanning the whole header for shapes to float freely in */}
      <div className="absolute inset-0 max-w-7xl mx-auto overflow-hidden opacity-40">
        
        {/* Circle */}
        <div className="attendee-shape-outer circle absolute left-[10%] top-[20%]">
          <div 
            className="attendee-shape-inner h-16 w-16 rounded-full bg-violet-500/50 blur-[2px]" 
            style={{ willChange: 'transform' }} 
          />
        </div>

        {/* Triangle */}
        <div className="attendee-shape-outer triangle absolute right-[20%] top-[40%]">
          <div 
            className="attendee-shape-inner h-16 w-16 bg-pink-500/50 blur-[2px] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" 
            style={{ willChange: 'transform' }} 
          />
        </div>

        {/* Square */}
        <div className="attendee-shape-outer square absolute left-[60%] bottom-[10%]">
          <div 
            className="attendee-shape-inner h-12 w-12 rounded-2xl bg-fuchsia-500/50 blur-[2px] rotate-12" 
            style={{ willChange: 'transform' }} 
          />
        </div>

      </div>
    </div>
  )
}
