import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Users, Calendar, MapPin, Phone, Mail } from "lucide-react"

export function HeroSection() {
  return (
    <section
      id="hero"
      className="bg-white overflow-hidden relative"
      style={{minHeight: '100vh', paddingTop: 'clamp(5rem, 8vh, 6rem)'}}
    >
      <div className="w-full max-w-[1600px] mx-auto flex items-start" style={{paddingLeft: 'clamp(0px, 1vw, 1rem)', paddingRight: 'clamp(0px, 1vw, 1rem)', paddingTop: 'clamp(1rem, 2vh, 2rem)', minHeight: 'calc(100vh - 5rem)'}}>
        <div className="grid grid-cols-1 lg:grid-cols-3 w-full" style={{gap: 'clamp(0.75rem, 1.5vw, 1.5rem)', paddingTop: 'clamp(1rem, 2vh, 2rem)', paddingBottom: 'clamp(1rem, 2vh, 2rem)'}}>
          {/* Left and Center Columns - Logo spanning both */}
          <div className="lg:col-span-2 flex flex-col" style={{gap: 'clamp(0.75rem, 1.5vw, 1.5rem)'}}>
            {/* Logo Card spanning left and center */}
            <Card className="bg-white/98 backdrop-blur-xl border border-gray-200/50 shadow-xl w-full overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row items-center lg:items-stretch">
                  {/* Logo Section */}
                  <div className="flex-shrink-0 flex items-center justify-center" style={{paddingLeft: 'clamp(1.5rem, 3vw, 3rem)', paddingRight: 'clamp(1rem, 2vw, 2rem)', paddingTop: 'clamp(1.5rem, 3vh, 2.5rem)', paddingBottom: 'clamp(1.5rem, 3vh, 2.5rem)'}}>
                    <img
                      src="/logo.png"
                      alt="Barangay Logo"
                      className="drop-shadow-sm"
                      style={{width: 'clamp(5rem, 8vw, 9rem)', height: 'clamp(5rem, 8vw, 9rem)'}}
                    />
                  </div>
                  
                  {/* Title Section */}
                  <div className="flex-1 text-center lg:text-left" style={{paddingLeft: 'clamp(0.5rem, 1vw, 1rem)', paddingRight: 'clamp(1rem, 2vw, 2rem)', paddingTop: 'clamp(1rem, 2vh, 2rem)', paddingBottom: 'clamp(1rem, 2vh, 2rem)'}}>
                     <h1 className="font-black text-primary leading-none tracking-tight" style={{fontSize: 'clamp(1.125rem, 2.8vw, 2.25rem)', marginBottom: 'clamp(0.5rem, 1vh, 0.75rem)'}}>
                       Barangay 6, Bañadero
                     </h1>
                     <h2 className="font-bold text-primary leading-none" style={{fontSize: 'clamp(1rem, 2.5vw, 2rem)', marginBottom: 'clamp(0.75rem, 1.5vh, 1rem)'}}>
                       Legazpi City
                     </h2>
                    <div className="text-gray-600 font-medium" style={{fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', gap: 'clamp(0.25rem, 0.5vh, 0.25rem)'}}>
                      <p>Republic of the Philippines</p>
                      <p>Province of Albay</p>
                    </div>
                  </div>

                  {/* Contact Section - Hidden on mobile, shown on larger screens */}
                  <div className="hidden lg:flex flex-shrink-0 p-4 sm:p-6 lg:p-8 border-l-2 border-gray-300/60 min-w-[250px] xl:min-w-[280px]">
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
                           <span className="text-sm sm:text-sm font-medium text-gray-700">(02) 123-4567</span>
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
                <div className="lg:hidden border-t border-gray-200/50 p-4 sm:p-6 bg-gray-50/50">
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
                       <span className="text-sm font-medium text-gray-700">(02) 123-4567</span>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 flex-1" style={{gap: 'clamp(0.75rem, 1.5vw, 1.5rem)'}}>
              {/* Left Side - Mission & Vision */}
              <div className="flex flex-col" style={{gap: 'clamp(0.75rem, 1.5vw, 1.5rem)'}}>
                <Card className="bg-white/95 backdrop-blur-lg border-white/30 shadow-2xl">
                  <CardHeader className="pb-0 pt-2 px-3 sm:px-6">
                    <CardTitle className="text-primary text-sm sm:text-base lg:text-lg font-semibold">Our Mission</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2 px-3 sm:px-6">
                     <p className="text-sm sm:text-sm lg:text-base text-pretty leading-snug">
                       With the inspiration and guidance of the Almighty God, we are committed to adopt the state-of-the-art technologies, implement priority projects and programs through Community-Driven Development (CDD) strategy, to promptly deliver quality basic services for the total improvement of the barangay.
                     </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/95 backdrop-blur-lg border-white/30 shadow-2xl">
                  <CardHeader className="pb-0 pt-2 px-3 sm:px-6">
                    <CardTitle className="text-primary text-sm sm:text-base lg:text-lg font-semibold">Our Vision</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2 px-3 sm:px-6">
                     <p className="text-sm sm:text-sm lg:text-base text-pretty leading-snug">
                       A self-reliant community enjoying a progressive and even-handed economy, disaster resilient, livable, well-managed, with God-loving people guided with strong, committed, and dedicated leadership and governance.
                     </p>
                  </CardContent>
                </Card>
              </div>

              {/* Right Side - Barangay Services */}
              <div className="flex flex-col order-first lg:order-none" style={{gap: 'clamp(0.75rem, 1.5vh, 1rem)'}}>
                <Card className="bg-white/95 backdrop-blur-lg border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/98">
                  <CardHeader className="pb-0 pt-2 px-3 sm:px-6">
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-primary text-sm sm:text-base lg:text-lg font-semibold">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                      Barangay Services
                </CardTitle>
              </CardHeader>
                  <CardContent className="space-y-1.5 pb-3 px-3 sm:px-6">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent hover:bg-primary/5 border-primary/20 h-7 sm:h-8 text-left text-sm sm:text-sm font-medium"
                      aria-label="Request Barangay Certification"
                    >
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-primary" />
                      Barangay Certification
                    </Button>
                <Button
                  variant="outline"
                      className="w-full justify-start bg-transparent hover:bg-primary/5 border-primary/20 h-7 sm:h-8 text-left text-sm sm:text-sm font-medium"
                      aria-label="Request Barangay Clearance"
                >
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-primary" />
                  Barangay Clearance
                </Button>
                <Button
                  variant="outline"
                      className="w-full justify-start bg-transparent hover:bg-primary/5 border-primary/20 h-7 sm:h-8 text-left text-sm sm:text-sm font-medium"
                      aria-label="Request Community Tax Certificate"
                    >
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-primary" />
                      Community Tax Certificate
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent hover:bg-primary/5 border-primary/20 h-7 sm:h-8 text-left text-sm sm:text-sm font-medium"
                      aria-label="Request Records Reproduction"
                    >
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-primary" />
                      Records Reproduction
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent hover:bg-primary/5 border-primary/20 h-7 sm:h-8 text-left text-sm sm:text-sm font-medium"
                      aria-label="Request Facility Use"
                    >
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-primary" />
                      Facility Use
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent hover:bg-primary/5 border-primary/20 h-7 sm:h-8 text-left text-sm sm:text-sm font-medium"
                      aria-label="Access Socio-Economic Services"
                    >
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-primary" />
                      Socio-Economic Services
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent hover:bg-primary/5 border-primary/20 h-7 sm:h-8 text-left text-sm sm:text-sm font-medium"
                      aria-label="Access Health Services"
                    >
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-primary" />
                      Health Services
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent hover:bg-primary/5 border-primary/20 h-7 sm:h-8 text-left text-sm sm:text-sm font-medium"
                      aria-label="Access Environment Services"
                    >
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-primary" />
                      Environment Services
                </Button>
                <Button
                  variant="outline"
                      className="w-full justify-start bg-transparent hover:bg-primary/5 border-primary/20 h-7 sm:h-8 text-left text-sm sm:text-sm font-medium"
                      aria-label="Request Certification to File Action (CFA)"
                >
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-primary" />
                      Certification to File Action (CFA)
                </Button>
                <Button
                  variant="outline"
                      className="w-full justify-start bg-transparent hover:bg-primary/5 border-primary/20 h-7 sm:h-8 text-left text-sm sm:text-sm font-medium"
                      aria-label="Request Barangay Protection Order (BPO)"
                >
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-primary" />
                      Barangay Protection Order (BPO)
                </Button>
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
                <img
                  src="/captain.png"
                alt="Barangay Captain"
                  className="w-48 h-56 xs:w-56 xs:h-64 sm:w-64 sm:h-72 md:w-72 md:h-80 lg:w-80 lg:h-88 xl:w-88 xl:h-104 object-cover rounded-2xl shadow-2xl"
                />
              </div>

              <div className="space-y-1 sm:space-y-2 w-full">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-black text-balance text-primary uppercase tracking-wider leading-tight px-2">
                  Arthur Marco
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-medium">Punong Barangay</p>
              </div>
            </div>

            {/* Barangay Council Section */}
            <div className="w-full">
              <div className="w-full h-32 xs:h-40 sm:h-48 md:h-56 lg:h-64 xl:h-72 rounded-2xl overflow-hidden border border-gray-200/50 shadow-lg">
                <img
                  src="/group.jpeg"
                  alt="Barangay Council"
                  className="w-full h-full object-cover"
                  />
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
