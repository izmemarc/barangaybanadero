"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Settings, LogOut } from "lucide-react"
import { useAdmin } from "@/contexts/admin-context"
import { AdminLoginModal } from "./admin/admin-login-modal"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { isEditMode, isAuthenticated, setEditMode, logout } = useAdmin()

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
    setIsMenuOpen(false)
  }

  const handleAdminClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
    } else {
      setEditMode(!isEditMode)
    }
  }

  const handleLogout = async () => {
    await logout()
    setEditMode(false)
  }

  return (
    <>
      <AdminLoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-gray-200/50 shadow-lg" style={{backgroundColor: '#0007C6'}}>
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
                <h1 className="font-black text-white leading-none tracking-wide" style={{fontWeight: '900', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 'clamp(1.125rem, 2.4vw, 1.25rem)', marginBottom: 'clamp(0.125rem, 0.3vh, 0.25rem)', letterSpacing: '0.05em'}}>
                  Bañadero, Legazpi City
                </h1>
              <p className="text-gray-200 font-medium leading-tight" style={{fontSize: 'clamp(0.875rem, 1.6vw, 0.75rem)'}}>
                Serving Our Community
              </p>
            </div>
          </div>

              {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center" style={{gap: '0.0625rem'}}>
                <button
                  onClick={() => scrollToSection("hero")}
                  className="text-gray-200 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-semibold min-h-[44px] w-20 flex items-center justify-center"
                  style={{padding: '0.25rem 0.5rem', fontSize: 'clamp(0.875rem, 1.2vw, 1rem)'}}
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection("projects")}
                  className="text-gray-200 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-semibold min-h-[44px] w-20 flex items-center justify-center"
                  style={{padding: '0.25rem 0.5rem', fontSize: 'clamp(0.875rem, 1.2vw, 1rem)'}}
                >
                  Projects
                </button>
                <button
                  onClick={() => scrollToSection("community")}
                  className="text-gray-200 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-semibold min-h-[44px] w-20 flex items-center justify-center"
                  style={{padding: '0.25rem 0.5rem', fontSize: 'clamp(0.875rem, 1.2vw, 1rem)'}}
                >
                  Info
                </button>
                
                {/* Admin-only links */}
                {isAuthenticated && (
                  <>
                    <a
                      href="https://docs.google.com/spreadsheets/d/1nO_XV6XFHNFU-_vJ1OcgHsBYoi_Qc1eQyNHTkHmsYVA/edit?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-200 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-semibold min-h-[44px] w-20 flex items-center justify-center"
                      style={{padding: '0.25rem 0.5rem', fontSize: 'clamp(0.875rem, 1.2vw, 1rem)'}}
                    >
                      Sheets
                    </a>
                    <a
                      href="https://drive.google.com/drive/folders/1IS_XN7YK4m_aCXVpXUwuap40U9kTw583?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-200 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-semibold min-h-[44px] w-20 flex items-center justify-center"
                      style={{padding: '0.25rem 0.5rem', fontSize: 'clamp(0.875rem, 1.2vw, 1rem)'}}
                    >
                      Drive
                    </a>
                  </>
                )}
                
                {/* Admin Button */}
                <button
                  onClick={handleAdminClick}
                  className={`${isEditMode ? 'text-blue-300 bg-blue-900/30' : 'text-gray-200'} hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium min-h-[44px] min-w-[44px] flex items-center justify-center`}
                  style={{padding: 'clamp(0.75rem, 1.5vh, 1rem) clamp(1rem, 2vw, 1.25rem)'}}
                  title={isAuthenticated ? (isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode') : 'Admin Login'}
                >
                  <Settings size={20} />
                </button>
                
                {/* Logout Button */}
                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className="text-gray-200 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-all duration-200 font-medium min-h-[44px] min-w-[44px] flex items-center justify-center"
                    style={{padding: 'clamp(0.75rem, 1.5vh, 1rem) clamp(1rem, 2vw, 1.25rem)'}}
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                )}
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
                <div className="flex flex-col" style={{gap: 'clamp(0.125rem, 0.5vh, 0.25rem)'}}>
                  <button
                    onClick={() => scrollToSection("hero")}
                    className="text-left text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-lg font-semibold min-h-[44px] flex items-center"
                    style={{padding: 'clamp(0.5rem, 1.5vh, 0.75rem) clamp(0.5rem, 1vw, 0.75rem)', fontSize: 'clamp(0.875rem, 2vw, 1rem)'}}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => scrollToSection("projects")}
                    className="text-left text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-lg font-semibold min-h-[44px] flex items-center"
                    style={{padding: 'clamp(0.5rem, 1.5vh, 0.75rem) clamp(0.5rem, 1vw, 0.75rem)', fontSize: 'clamp(0.875rem, 2vw, 1rem)'}}
                  >
                    Projects
                  </button>
                  <button
                    onClick={() => scrollToSection("community")}
                    className="text-left text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-lg font-semibold min-h-[44px] flex items-center"
                    style={{padding: 'clamp(0.5rem, 1.5vh, 0.75rem) clamp(0.5rem, 1vw, 0.75rem)', fontSize: 'clamp(0.875rem, 2vw, 1rem)'}}
                  >
                    Info
                  </button>
                  
                  {/* Admin Button for Mobile */}
                  <button
                    onClick={handleAdminClick}
                    className={`text-left ${isEditMode ? 'text-blue-300 bg-blue-900/30' : 'text-gray-200'} hover:text-white hover:bg-white/10 transition-all duration-200 rounded-lg font-semibold min-h-[44px] flex items-center gap-2`}
                    style={{padding: 'clamp(0.5rem, 1.5vh, 0.75rem) clamp(0.5rem, 1vw, 0.75rem)', fontSize: 'clamp(0.875rem, 2vw, 1rem)'}}
                  >
                    <Settings size={20} />
                    <span>{isAuthenticated ? (isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode') : 'Admin Login'}</span>
                  </button>
                  
                  {/* Logout Button for Mobile */}
                  {isAuthenticated && (
                    <button
                      onClick={handleLogout}
                      className="text-left text-gray-200 hover:text-red-300 hover:bg-red-900/30 transition-all duration-200 rounded-lg font-semibold min-h-[44px] flex items-center gap-2"
                      style={{padding: 'clamp(0.5rem, 1.5vh, 0.75rem) clamp(0.5rem, 1vw, 0.75rem)', fontSize: 'clamp(0.875rem, 2vw, 1rem)'}}
                    >
                      <LogOut size={20} />
                      <span>Logout</span>
                    </button>
                  )}
                  
                  {/* Admin-only links */}
                  {isAuthenticated && (
                    <>
                      <a
                        href="https://docs.google.com/spreadsheets/d/1nO_XV6XFHNFU-_vJ1OcgHsBYoi_Qc1eQyNHTkHmsYVA/edit?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-left text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-lg font-semibold min-h-[44px] flex items-center"
                        style={{padding: 'clamp(0.5rem, 1.5vh, 0.75rem) clamp(0.5rem, 1vw, 0.75rem)', fontSize: 'clamp(0.875rem, 2vw, 1rem)'}}
                      >
                        Sheets
                      </a>
                      <a
                        href="https://drive.google.com/drive/folders/1IS_XN7YK4m_aCXVpXUwuap40U9kTw583?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-left text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-lg font-semibold min-h-[44px] flex items-center"
                        style={{padding: 'clamp(0.5rem, 1.5vh, 0.75rem) clamp(0.5rem, 1vw, 0.75rem)', fontSize: 'clamp(0.875rem, 2vw, 1rem)'}}
                      >
                        Drive
                      </a>
                    </>
                  )}
                </div>
              </nav>
        )}
      </div>
    </header>
    </>
  )
}
