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
  Phone,
  Mail,
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
    { name: "Arthur Marco", position: "Barangay Captain" },
    { name: "Juan Dela Cruz", position: "Barangay Kagawad" },
    { name: "Ana Rodriguez", position: "Barangay Kagawad" },
    { name: "Pedro Martinez", position: "Barangay Kagawad" },
    { name: "Rosa Garcia", position: "Barangay Secretary" },
    { name: "Carlos Lopez", position: "Barangay Treasurer" },
    { name: "Elena Reyes", position: "SK Chairperson" },
  ]

  return (
    <section id="community" className="min-h-screen bg-background py-12 sm:py-16 lg:py-20">
      <div className="w-full max-w-[1600px] mx-auto px-0 sm:px-0.5 lg:px-1 xl:px-2">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-balance">Community Information</h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            Everything you need to know about our barangay services, events, and community programs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {/* Services & Programs */}
          <div className="space-y-3 sm:space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-primary text-base">Community Services</CardTitle>
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

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary text-base">Office Hours</CardTitle>
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
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary text-base">
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

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary text-base">
                  <AlertCircle className="h-4 w-4" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">Barangay Emergency</span>
                    <span className="text-xs">(02) 123-4567</span>
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
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary text-base">
                  <Users className="h-4 w-4" />
                  Barangay Officials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {officials.map((official, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-balance">{official.name}</p>
                      <p className="text-xs text-muted-foreground">{official.position}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-base">Get Involved</CardTitle>
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

      {/* Footer - Full Width */}
      <div className="border-t border-border pt-4 bg-background">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-4 text-center md:text-left">
            <div>
              <h3 className="font-bold text-primary mb-1 text-balance" style={{fontSize: 'clamp(1rem, 2.5vw, 2rem)'}}>Banadero, Legazpi City</h3>
              <p className="text-muted-foreground text-pretty leading-relaxed" style={{fontSize: 'clamp(0.875rem, 1.5vw, 1rem)'}}>
                Committed to serving our community with transparency, integrity, and dedication to progress.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1" style={{fontSize: 'clamp(0.875rem, 1.5vw, 1rem)'}}>Quick Links</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <a href="#hero" className="text-muted-foreground hover:text-primary transition-colors">
                    Home
                  </a>
                </p>
                <p>
                  <a href="#projects" className="text-muted-foreground hover:text-primary transition-colors">
                    Projects
                  </a>
                </p>
                <p>
                  <a href="#community" className="text-muted-foreground hover:text-primary transition-colors">
                    Community
                  </a>
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-1" style={{fontSize: 'clamp(0.875rem, 1.5vw, 1rem)'}}>Contact Us</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <MapPin className="h-3 w-3" />
                  <span>4PQH+WXJ, Old Albay District, Legazpi City, Albay</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Phone className="h-3 w-3" />
                  <span>(02) 123-4567</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Mail className="h-3 w-3" />
                  <span>brgy6banadero@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-4 pt-2 text-center">
            <p className="text-xs text-muted-foreground">© 2024 Banadero, Legazpi City. All rights reserved.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
