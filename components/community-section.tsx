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
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-balance">Community Information</h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            Everything you need to know about our barangay services, events, and community programs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12">
          {/* Services & Programs */}
          <div className="space-y-4 sm:space-y-6">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-primary text-lg sm:text-xl">Community Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <service.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-balance text-sm sm:text-base">{service.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground text-pretty leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary">Office Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-semibold">Monday - Friday</p>
                    <p className="text-sm text-muted-foreground">8:00 AM - 5:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-semibold">Saturday</p>
                    <p className="text-sm text-muted-foreground">8:00 AM - 12:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-muted-foreground">Sunday</p>
                    <p className="text-sm text-muted-foreground">Closed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Calendar className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-balance">{event.title}</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
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
                <CardTitle className="flex items-center gap-2 text-primary">
                  <AlertCircle className="h-5 w-5" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Barangay Emergency</span>
                    <span className="text-sm">(02) 123-4567</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Police Station</span>
                    <span className="text-sm">117</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Fire Department</span>
                    <span className="text-sm">116</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Medical Emergency</span>
                    <span className="text-sm">911</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Officials & Contact */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Users className="h-5 w-5" />
                  Barangay Officials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                <CardTitle>Get Involved</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-primary-foreground/90 text-pretty leading-relaxed">
                  Join our community programs and help make our barangay a better place for everyone.
                </p>
                <div className="space-y-2">
                  <Button variant="secondary" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </Button>
                  <Button variant="secondary" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Volunteer Programs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border pt-8">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="font-bold text-lg mb-3 text-balance">Banadero, Legazpi City</h3>
              <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
                Committed to serving our community with transparency, integrity, and dedication to progress.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <div className="space-y-2 text-sm">
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
              <h4 className="font-semibold mb-3">Contact Us</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <MapPin className="h-4 w-4" />
                  <span>4PQH+WXJ, Old Albay District, Legazpi City, Albay</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Phone className="h-4 w-4" />
                  <span>(02) 123-4567</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Mail className="h-4 w-4" />
                  <span>brgy6banadero@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-4 text-center">
            <p className="text-sm text-muted-foreground">© 2024 Banadero, Legazpi City. All rights reserved.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
