"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { DisclosureDashboard } from "@/components/disclosure-dashboard"
import { ProjectsSection } from "@/components/projects-section"
import { CommunitySection } from "@/components/community-section"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Prefetch the clearances page after the main page loads
    const prefetchClearances = async () => {
      router.prefetch('/clearances')
      // Mark as prefetched to skip loading screen
      sessionStorage.setItem('clearances-prefetched', 'true')
    }
    
    // Delay prefetch slightly to let main page finish loading
    const timer = setTimeout(prefetchClearances, 1000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <>
      <Header />
      <main style={{paddingLeft: '5%', paddingRight: '5%'}}>
        <HeroSection />
        <DisclosureDashboard />
        <ProjectsSection />
        <CommunitySection />
      </main>
    </>
  )
}
