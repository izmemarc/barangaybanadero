"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
    setIsMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
      <div className="w-full max-w-[1600px] mx-auto" style={{paddingTop: 'clamp(0.75rem, 2vh, 1.25rem)', paddingBottom: 'clamp(0.75rem, 2vh, 1.25rem)', paddingLeft: '5%', paddingRight: '5%'}}>
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{gap: 'clamp(0.5rem, 2vw, 1rem)'}}>
            <picture>
              <source srcSet="/logo.webp" type="image/webp" />
              <img
                src="/logo.png"
                alt="Barangay Logo"
                className="object-cover flex-shrink-0"
                style={{width: 'clamp(2.5rem, 4vw, 3.5rem)', height: 'clamp(2.5rem, 4vw, 3.5rem)'}}
                fetchPriority="high"
                loading="eager"
                width="56"
                height="56"
              />
            </picture>
            <div className="min-w-0 flex-1">
                <h1 className="font-black text-primary leading-none tracking-tight" style={{fontWeight: '900', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 'clamp(1.125rem, 2.4vw, 1.25rem)', marginBottom: 'clamp(0.125rem, 0.3vh, 0.25rem)'}}>
                  Bañadero, Legazpi City
                </h1>
              <p className="text-gray-600 font-medium leading-tight" style={{fontSize: 'clamp(0.875rem, 1.6vw, 0.75rem)'}}>
                Serving Our Community
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center" style={{gap: 'clamp(0.25rem, 0.5vw, 0.5rem)'}}>
            <button
              onClick={() => scrollToSection("hero")}
              className="text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 font-medium min-h-[44px] min-w-[44px] flex items-center justify-center"
              style={{padding: 'clamp(0.75rem, 1.5vh, 1rem) clamp(1rem, 2vw, 1.25rem)', fontSize: 'clamp(0.875rem, 1.2vw, 1rem)'}}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("projects")}
              className="text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 font-medium min-h-[44px] min-w-[44px] flex items-center justify-center"
              style={{padding: 'clamp(0.75rem, 1.5vh, 1rem) clamp(1rem, 2vw, 1.25rem)', fontSize: 'clamp(0.875rem, 1.2vw, 1rem)'}}
            >
              Projects
            </button>
            <button
              onClick={() => scrollToSection("community")}
              className="text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 font-medium min-h-[44px] min-w-[44px] flex items-center justify-center"
              style={{padding: 'clamp(0.75rem, 1.5vh, 1rem) clamp(1rem, 2vw, 1.25rem)', fontSize: 'clamp(0.875rem, 1.2vw, 1rem)'}}
            >
              Community
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="lg:hidden p-2" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden border-t border-gray-200/50 animate-in slide-in-from-top-2 duration-200" style={{marginTop: 'clamp(0.75rem, 2vh, 1rem)', paddingTop: 'clamp(0.75rem, 2vh, 1rem)', paddingBottom: 'clamp(0.75rem, 2vh, 1rem)'}}>
            <div className="flex flex-col" style={{gap: 'clamp(0.5rem, 1.5vh, 0.75rem)'}}>
              <button
                onClick={() => scrollToSection("hero")}
                className="text-left text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 rounded-lg font-medium min-h-[44px] flex items-center"
                style={{padding: 'clamp(0.75rem, 2vh, 1rem) clamp(0.75rem, 1.5vw, 1rem)', fontSize: 'clamp(0.875rem, 2vw, 1rem)'}}
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("projects")}
                className="text-left text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 rounded-lg font-medium min-h-[44px] flex items-center"
                style={{padding: 'clamp(0.75rem, 2vh, 1rem) clamp(0.75rem, 1.5vw, 1rem)', fontSize: 'clamp(0.875rem, 2vw, 1rem)'}}
              >
                Projects
              </button>
              <button
                onClick={() => scrollToSection("community")}
                className="text-left text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 rounded-lg font-medium min-h-[44px] flex items-center"
                style={{padding: 'clamp(0.75rem, 2vh, 1rem) clamp(0.75rem, 1.5vw, 1rem)', fontSize: 'clamp(0.875rem, 2vw, 1rem)'}}
              >
                Community
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
