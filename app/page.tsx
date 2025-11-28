import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { MapSection } from "@/components/map-section"
import { ProjectsSection } from "@/components/projects-section"
import { CommunitySection } from "@/components/community-section"

export default function Home() {
  return (
    <>
      <Header />
      <main style={{paddingLeft: '5%', paddingRight: '5%'}}>
        <HeroSection />
        <MapSection />
        <ProjectsSection />
        <CommunitySection />
      </main>
    </>
  )
}
