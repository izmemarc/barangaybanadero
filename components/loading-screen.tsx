"use client"

import { useState, useEffect } from "react"

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isHydrated = false
    let checkCount = 0
    const maxChecks = 200 // 10 seconds max (50ms intervals)
    
    function checkHydration() {
      checkCount++
      
      // Check for multiple hydration indicators
      const hasReactHydrated = (
        window.React !== undefined ||
        document.querySelector('[data-nextjs-scroll-focus-boundary]') !== null ||
        document.querySelector('[data-nextjs-router]') !== null ||
        document.body?.getAttribute('data-reactroot') !== null ||
        document.querySelector('[data-reactroot]') !== null ||
        // Check if React components are actually rendered
        document.querySelector('header') !== null ||
        document.querySelector('main') !== null
      )
      
      if (hasReactHydrated) {
        isHydrated = true
        setIsLoading(false)
        return
      }
      
      // Continue checking if not hydrated and under limit
      if (!isHydrated && checkCount < maxChecks) {
        setTimeout(checkHydration, 50)
      } else if (!isHydrated) {
        // Fallback: hide loading after max checks
        setIsLoading(false)
      }
    }

    // Start checking after a short delay to let React initialize
    setTimeout(checkHydration, 200)
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}
