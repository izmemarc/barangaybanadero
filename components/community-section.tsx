import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Calendar,
  Heart,
  GraduationCap,
  Shield,
  Leaf,
  MapPin,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react"

export function CommunitySection() {
  const upcomingEvents = [
    {
      title: "Barangay Assembly Meeting",
      date: "March 15, 2024",
      time: "7:00 PM",
      location: "Community Center",
      type: "Meeting",
    },
    {
      title: "Health and Wellness Fair",
      date: "March 22, 2024",
      time: "8:00 AM - 4:00 PM",
      location: "Basketball Court",
      type: "Health",
    },
    {
      title: "Environmental Clean-up Drive",
      date: "March 30, 2024",
      time: "6:00 AM - 10:00 AM",
      location: "Various Areas",
      type: "Environment",
    },
  ]

  const services = [
    {
      icon: Shield,
      title: "Peace & Order",
      description: "24/7 security patrol and emergency response services",
    },
    {
      icon: Heart,
      title: "Health Services",
      description: "Free medical consultations and health programs",
    },
    {
      icon: GraduationCap,
      title: "Education Support",
      description: "Scholarship programs and educational assistance",
    },
    {
      icon: Leaf,
      title: "Environmental Programs",
      description: "Waste management and environmental protection initiatives",
    },
  ]

  const officials = [
    { name: "Arthur R. Marco", position: "Punong Barangay", image: "/officers/arthur.webp" },
    { name: "Josefa B. Ballon", position: "Kagawad", image: "/officers/josefa.webp" },
    { name: "Clarence A. Castillo", position: "Kagawad", image: "/officers/clarance.webp" },
    { name: "Randy G. Loresto", position: "Kagawad", image: "/officers/randy.webp" },
    { name: "Ardi L. Marco", position: "Kagawad", image: "/officers/ardi.webp" },
    { name: "Annabelle L. Azicate", position: "Kagawad", image: "/officers/annabelle.webp" },
    { name: "Regie M. Ajero", position: "Kagawad", image: "/officers/regie.webp" },
    { name: "Carmelo A. Abache", position: "Kagawad", image: "/officers/carmelo.webp" },
    { name: "Franz Vincent B. Reynoso", position: "SK Chairman", image: "/officers/franz.webp" },
    { name: "Maria Angela A. Nalles", position: "Secretary", image: "/officers/maria.webp" },
    { name: "Judith H. Silvestre", position: "Treasurer", image: "/officers/judith.webp" },
  ]

  return (
    <section id="community" className="bg-white pt-12 sm:pt-16 lg:pt-20">
      <div className="w-full max-w-[1600px] mx-auto px-0 sm:px-0.5 lg:px-1 xl:px-2">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="font-black text-primary leading-none tracking-tight" style={{fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', marginBottom: 'clamp(0.5rem, 1vh, 0.75rem)'}}>Community Information</h2>
          <p className="text-gray-600 font-medium" style={{fontSize: 'clamp(0.875rem, 1.5vw, 1rem)'}}>
            Everything you need to know about our barangay services, events, and community programs.
          </p>
        </div>



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {/* Services & Programs */}
          <div className="space-y-3 sm:space-y-4">
            <Card className="bg-white/95 backdrop-blur-lg border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/98">
              <CardHeader className="pb-2">
                 <CardTitle className="text-primary text-lg font-bold">Community Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {services.map((service, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <service.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-balance text-sm">{service.title}</h3>
                      <p className="text-xs text-muted-foreground text-pretty leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-lg border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/98">
              <CardHeader>
                 <CardTitle className="text-primary text-lg font-bold">Office Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">Monday - Friday</p>
                    <p className="text-xs text-muted-foreground">8:00 AM - 5:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">Saturday</p>
                    <p className="text-xs text-muted-foreground">8:00 AM - 12:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground">Sunday</p>
                    <p className="text-xs text-muted-foreground">Closed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div className="space-y-3 sm:space-y-4">
            <Card className="bg-white/95 backdrop-blur-lg border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/98">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-primary text-lg font-bold">
                  <Calendar className="h-4 w-4" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-balance text-sm">{event.title}</h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-lg border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/98">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-primary text-lg font-bold">
                  <AlertCircle className="h-4 w-4" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">Barangay Emergency</span>
                    <span className="text-xs">0917 555 3323</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">Police Station</span>
                    <span className="text-xs">117</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">Fire Department</span>
                    <span className="text-xs">116</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">Medical Emergency</span>
                    <span className="text-xs">911</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Officials & Contact */}
          <div className="space-y-3 sm:space-y-4">
            <Card className="bg-white/95 backdrop-blur-lg border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/98">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-primary text-lg font-bold">
                  <Users className="h-4 w-4" />
                  Barangay Officials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {officials.map((official, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <picture>
                        <source srcSet={official.image} type="image/webp" />
                        <img
                          src={official.image?.replace(/\.webp$/, '.png') || "/placeholder.svg"}
                          alt={official.name}
                          className="w-full h-full object-cover object-top"
                          loading="lazy"
                        />
                      </picture>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-balance">{official.name}</p>
                      <p className="text-xs text-muted-foreground">{official.position}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-primary/95 backdrop-blur-lg border-primary/30 text-primary-foreground shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-primary/98 hover:scale-[1.02]">
              <CardHeader>
                 <CardTitle className="text-lg font-bold">Get Involved</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-primary-foreground/90 text-pretty leading-relaxed">
                  Join our community programs and help make our barangay a better place for everyone.
                </p>
                <div className="space-y-2">
                  <Button variant="secondary" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/95 backdrop-blur-lg border-t border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/98" style={{paddingTop: 'clamp(0.75rem, 2vh, 1.25rem)', paddingBottom: 'clamp(0.75rem, 2vh, 1.25rem)'}}>
        <div className="w-full max-w-[1600px] mx-auto" style={{paddingLeft: 'clamp(0px, 1vw, 1rem)', paddingRight: 'clamp(0px, 1vw, 1rem)'}}>
          <div className="text-center">
            <p className="text-gray-600 font-medium" style={{fontSize: 'clamp(0.875rem, 1.5vw, 1rem)'}}>
              © 2024 Barangay 6, Bañadero, Legazpi City. All Rights Reserved.
            </p>
            <p className="text-gray-500 text-sm mt-1" style={{fontSize: 'clamp(0.75rem, 1vw, 0.875rem)'}}>
              Developed & Maintained by the Barangay Information Team.
            </p>
          </div>
        </div>
      </footer>
    </section>
  )
}
