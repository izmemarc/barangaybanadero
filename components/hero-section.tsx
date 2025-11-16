"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Calendar, MapPin, Phone, Mail, Briefcase, AlertCircle } from "lucide-react"
import { EditableImage } from "@/components/admin/editable-image"
import { useState, useEffect } from "react"

export function HeroSection() {
  const [captainImage, setCaptainImage] = useState("/captain.webp")
  const [councilImage, setCouncilImage] = useState("/group.webp")
  const [imagesLoaded, setImagesLoaded] = useState(false)

  // Load saved images on component mount
  useEffect(() => {
    const loadImages = async () => {
      try {
        const captainResponse = await fetch('/api/admin/content?key=captain_image')
        const captainData = await captainResponse.json()
        if (captainData?.value) {
          setCaptainImage(captainData.value)
        }

        const councilResponse = await fetch('/api/admin/content?key=council_image')
        const councilData = await councilResponse.json()
        if (councilData?.value) {
          setCouncilImage(councilData.value)
        }
        
        setImagesLoaded(true)
      } catch (error) {
        console.error('Failed to load images:', error)
        setImagesLoaded(true)
      }
    }

    loadImages()
  }, [])

  // Save captain image to database
  const handleCaptainImageChange = async (newPath: string) => {
    console.log('Captain image change handler called with:', newPath)
    
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'captain_image',
          value: newPath,
          type: 'text',
        }),
      })
      
      const data = await response.json()
      console.log('Captain image save response:', data)
      
      if (!response.ok) {
        console.error('Failed to save captain image:', data)
        alert(`Failed to save captain image: ${data.error || 'Unknown error'}`)
      } else {
        console.log('Captain image saved successfully')
        // Immediately update the image with cache busting
        setCaptainImage(`${newPath}?t=${Date.now()}`)
      }
    } catch (error) {
      console.error('Failed to save captain image:', error)
      alert('Failed to save captain image. Check console for details.')
    }
  }

  // Save council image to database
  const handleCouncilImageChange = async (newPath: string) => {
    console.log('Council image change handler called with:', newPath)
    
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'council_image',
          value: newPath,
          type: 'text',
        }),
      })
      
      const data = await response.json()
      console.log('Council image save response:', data)
      
      if (!response.ok) {
        console.error('Failed to save council image:', data)
        alert(`Failed to save council image: ${data.error || 'Unknown error'}`)
      } else {
        console.log('Council image saved successfully')
        // Immediately update the image with cache busting
        setCouncilImage(`${newPath}?t=${Date.now()}`)
      }
    } catch (error) {
      console.error('Failed to save council image:', error)
      alert('Failed to save council image. Check console for details.')
    }
  }

  return (
    <section
      id="hero"
      className="relative hero-section-1080p w-full"
      style={{minHeight: 'auto', paddingTop: 'clamp(5rem, 8vh, 6rem)', paddingBottom: 'clamp(2rem, 4vh, 3rem)'}}
    >
      <div className="w-full max-w-[1600px] mx-auto flex items-start hero-content" style={{paddingTop: 'clamp(1rem, 2vh, 2rem)', minHeight: 'auto'}}>
        <div className="grid grid-cols-1 lg:grid-cols-3 w-full hero-grid gap-4 sm:gap-6 lg:gap-8" style={{paddingTop: 'clamp(1rem, 2vh, 2rem)', paddingBottom: 'clamp(1rem, 2vh, 2rem)'}}>
          {/* Left and Center Columns - Logo spanning both */}
          <div className="lg:col-span-2 flex flex-col hero-column gap-4 sm:gap-6 lg:gap-8">
            {/* Logo Card spanning left and center */}
            <Card className="bg-white/98 backdrop-blur-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] sm:shadow-xl w-full overflow-hidden hero-card transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row items-center lg:items-stretch">
                  {/* Logo Section */}
                  <div className="flex-shrink-0 flex items-center justify-center hero-logo-section" style={{paddingLeft: 'clamp(1.5rem, 3vw, 3rem)', paddingRight: 'clamp(1rem, 2vw, 2rem)', paddingTop: 'clamp(1.5rem, 3vh, 2.5rem)', paddingBottom: 'clamp(1.5rem, 3vh, 2.5rem)'}}>
                    <picture>
                      <source srcSet="/logo.webp" type="image/webp" />
                      <img
                        src="/logo.png"
                        alt="Barangay Logo"
                        className="drop-shadow-sm"
                        style={{width: 'clamp(10rem, 16vw, 9rem)', height: 'clamp(10rem, 16vw, 9rem)'}}
                        fetchPriority="high"
                        decoding="async"
                        loading="eager"
                        data-critical="true"
                        width="144"
                        height="144"
                      />
                    </picture>
                  </div>
                  
                  {/* Title Section */}
                  <div className="flex-1 text-center lg:text-left hero-text-section" style={{paddingLeft: 'clamp(0.5rem, 1vw, 1rem)', paddingRight: 'clamp(1rem, 2vw, 2rem)', paddingTop: 'clamp(1rem, 2vh, 2rem)', paddingBottom: 'clamp(1rem, 2vh, 2rem)'}}>
                     <h1 className="font-black text-primary leading-none tracking-tight" style={{fontSize: 'clamp(1.75rem, 3.6vw, 2.25rem)', marginBottom: 'clamp(0.5rem, 1vh, 0.75rem)'}}>
                       Barangay 6, Bañadero
                     </h1>
                     <h2 className="font-bold text-primary leading-none" style={{fontSize: 'clamp(1.5rem, 3.2vw, 2rem)', marginBottom: 'clamp(0.75rem, 1.5vh, 1rem)'}}>
                       Legazpi City
                     </h2>
                    <div className="text-gray-600 font-medium" style={{fontSize: 'clamp(1.125rem, 2vw, 1rem)', gap: 'clamp(0.25rem, 0.5vh, 0.25rem)'}}>
                      <p>Republic of the Philippines</p>
                      <p>Province of Albay</p>
                    </div>
                  </div>

                  {/* Contact Section - Hidden on mobile, shown on larger screens */}
                  <div className="hidden lg:flex flex-shrink-0 p-4 sm:p-6 lg:p-8 min-w-[250px] xl:min-w-[280px]">
                    <div className="w-full">
                      <h3 className="text-sm sm:text-sm font-bold text-primary mb-3 sm:mb-4 uppercase tracking-wider">Contact Information</h3>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
                          </div>
                          <div>
                           <p className="text-sm sm:text-sm font-medium text-gray-700">4PQH+WXJ, Old Albay District</p>
                           <p className="text-sm sm:text-sm text-gray-600">Legazpi City, Albay</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
                          </div>
                           <span className="text-sm sm:text-sm font-medium text-gray-700">0917 555 3323</span>
                        </div>
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Mail className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
                          </div>
                           <span className="text-sm font-medium text-gray-700 break-all">brgy6banadero@gmail.com</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Contact Section */}
                <div className="lg:hidden p-4 sm:p-6 bg-gray-50/50">
                  <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider text-center">Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                       <p className="text-sm font-medium text-gray-700">4PQH+WXJ, Old Albay District</p>
                       <p className="text-sm text-gray-600">Legazpi City, Albay</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                       <span className="text-sm font-medium text-gray-700">0917 555 3323</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                       <span className="text-sm font-medium text-gray-700 break-all">brgy6banadero@gmail.com</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Two columns for Mission/Vision and Services */}
            <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 gap-4 sm:gap-6 lg:gap-8">
              {/* Left Side - Mission & Vision */}
              <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8">
                <Card className="bg-white/95 backdrop-blur-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] sm:shadow-2xl hero-card hover-yellow transition-all duration-300 cursor-pointer">
                  <CardHeader className="pb-0 pt-0 px-3 sm:px-6 gap-0">
                    <CardTitle className="text-primary text-sm sm:text-base lg:text-lg font-semibold">Our Mission</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 pb-3 px-3 sm:px-6 pt-0">
                     <p className="text-sm sm:text-sm lg:text-base text-pretty leading-snug -mt-2">
                       With the inspiration and guidance of the Almighty God, we are committed to adopt state-of-the-art technologies, plan and implement programs, projects and activities using the Community Driven Development (CDD) strategy to promptly deliver quality basic services for the total improvement of the barangay.
                     </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/95 backdrop-blur-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] sm:shadow-2xl hero-card hover-yellow transition-all duration-300 cursor-pointer">
                  <CardHeader className="pb-0 pt-0 px-3 sm:px-6 gap-0">
                    <CardTitle className="text-primary text-sm sm:text-base lg:text-lg font-semibold">Our Vision</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 pb-3 px-3 sm:px-6 pt-0">
                     <p className="text-sm sm:text-sm lg:text-base text-pretty leading-snug -mt-2">
                       A self-reliant community enjoying a progressive and even-handed economy, disaster resilient, drug-free, well-managed solid wastes, peaceful and ecologically balanced environment with God-loving people guided by a responsive, participatory, transparent and accountable leadership and governance.
                     </p>
                  </CardContent>
                </Card>
              </div>

              {/* Right Side - Barangay Services */}
              <div className="flex flex-col order-first lg:order-none" style={{gap: 'clamp(0.75rem, 1.5vh, 1rem)'}}>
                <Card className="bg-white/95 backdrop-blur-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] sm:shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/98 hero-card">
                  <CardHeader className="pb-0 pt-0 px-3 sm:px-6 gap-0">
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-primary text-sm sm:text-base lg:text-lg font-semibold">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                      Barangay Services
                </CardTitle>
              </CardHeader>
                  <CardContent className="space-y-1.5 pb-3 px-3 sm:px-6 pt-0 mt-0.5">
                <a href="https://forms.gle/vTf6DqyxMA2besto6" target="_blank" rel="noopener noreferrer" className="w-full block -mt-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent hover-yellow border-primary/20 text-left text-sm sm:text-sm font-medium h-8 sm:h-9 px-3 py-1 sm:py-2 cursor-pointer"
                    aria-label="Request Barangay Clearance"
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                    Barangay Clearance
                  </Button>
                </a>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSe4yR6BKatbd4eSfzidaIQXbrnqxM_kE33x8hF-PDqlNMAbHg/viewform?fbzx=-8760112926224005484" target="_blank" rel="noopener noreferrer" className="w-full block">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent hover-yellow border-primary/20 text-left text-sm sm:text-sm font-medium h-8 sm:h-9 px-3 py-1 sm:py-2 cursor-pointer"
                    aria-label="Request Business Clearance"
                  >
                    <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                    Business Clearance
                  </Button>
                </a>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSd-HShEKWNL2y-ycpWGidjVQnQUuDtA5iaotSirX1KGLKABeQ/viewform" target="_blank" rel="noopener noreferrer" className="w-full block">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent hover-yellow border-primary/20 text-left text-sm sm:text-sm font-medium h-8 sm:h-9 px-3 py-1 sm:py-2 cursor-pointer"
                    aria-label="File a Blotter"
                  >
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                    Blotter
                  </Button>
                </a>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSdpiey70Vj9zLeaRKvZ_2kG7rxhcKhiZWa-Cw2UO6BpInslEQ/viewform" target="_blank" rel="noopener noreferrer" className="w-full block">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent hover-yellow border-primary/20 text-left text-sm sm:text-sm font-medium h-8 sm:h-9 px-3 py-1 sm:py-2 cursor-pointer"
                    aria-label="Request Facility Use"
                  >
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                    Facility Use
                  </Button>
                </a>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSexW6TC0zNe9V2FejpKzKJ3TeFGnWtTQjGuopwoQQPLwvpcgg/viewform?usp=header" target="_blank" rel="noopener noreferrer" className="w-full block">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent hover-yellow border-primary/20 text-left text-sm sm:text-sm font-medium h-8 sm:h-9 px-3 py-1 sm:py-2 cursor-pointer"
                    aria-label="Request Certificate of Good Moral"
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                    Certificate of Good Moral
                  </Button>
                </a>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSe4UiZDpxAuCyxxmh52Db67DRKfxP2w6gnEyehceyqmtVhGNg/viewform?usp=header" target="_blank" rel="noopener noreferrer" className="w-full block">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent hover-yellow border-primary/20 text-left text-sm sm:text-sm font-medium h-8 sm:h-9 px-3 py-1 sm:py-2 cursor-pointer"
                    aria-label="Request Certificate of Indigency"
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                    Certificate of Indigency
                  </Button>
                </a>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSdcXnix_r_TTxx23SRpWesRHZMHoUfUFmAdLNGF030jZJysJQ/viewform?usp=header" target="_blank" rel="noopener noreferrer" className="w-full block">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent hover-yellow border-primary/20 text-left text-sm sm:text-sm font-medium h-8 sm:h-9 px-3 py-1 sm:py-2 cursor-pointer"
                    aria-label="Request Certificate of Residency"
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                    Certificate of Residency
                  </Button>
                </a>
              </CardContent>
            </Card>
                </div>
                </div>
          </div>

          {/* Right Side - Barangay Captain */}
          <div className="flex flex-col items-center justify-start space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Captain Section */}
            <div className="flex flex-col items-center text-center w-full">
              <div className="relative mb-3 sm:mb-4">
                {imagesLoaded ? (
                  <EditableImage
                    currentPath={captainImage}
                    onImageChange={handleCaptainImageChange}
                    alt="Barangay Captain"
                    dataCritical
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="w-4/5 h-auto mx-auto xs:w-56 xs:h-64 sm:w-64 sm:h-72 md:w-72 md:h-80 lg:w-80 lg:h-88 xl:w-88 xl:h-104 object-cover object-[center_40%] rounded-lg shadow-2xl"
                    width={400}
                    height={500}
                  />
                ) : (
                  <div className="w-4/5 h-auto mx-auto xs:w-56 xs:h-64 sm:w-64 sm:h-72 md:w-72 md:h-80 lg:w-80 lg:h-88 xl:w-88 xl:h-104 bg-gray-200 rounded-lg shadow-2xl animate-pulse flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Loading...</span>
                  </div>
                )}
              </div>

              <div className="space-y-0 w-full">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-black text-balance text-primary uppercase tracking-wider leading-tight px-2">
                  Arthur Marco
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-medium">Punong Barangay</p>
              </div>
            </div>

            {/* Barangay Council Section */}
            <div className="w-full">
              <div className="w-full relative pb-[66.67%] sm:pb-0 sm:h-48 md:h-56 lg:h-64 xl:h-72 rounded-lg overflow-hidden shadow-lg">
                <div className="absolute top-0 left-0 w-full h-full">
                  {imagesLoaded ? (
                    <EditableImage
                      currentPath={councilImage}
                      onImageChange={handleCouncilImageChange}
                      alt="Barangay Council"
                      dataCritical
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      className="w-full h-full object-cover object-center sm:object-[center_30%]"
                      width={400}
                      height={300}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Loading...</span>
                    </div>
                  )}
                </div>
              </div>
              <h3 className="text-primary text-sm sm:text-base md:text-lg font-semibold text-center mt-3 px-2">
                Barangay Council
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
