'use client';

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

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Heart,
  GraduationCap,
  Leaf,
};

// Static data - no longer editable
const services = [
  { id: 1, title: "Peace & Order", description: "Maintaining community safety through barangay tanod patrols", icon: "Shield" },
  { id: 2, title: "Health Services", description: "Free medical consultations and health programs", icon: "Heart" },
  { id: 3, title: "Education Support", description: "Scholarship programs for deserving students", icon: "GraduationCap" },
  { id: 4, title: "Environment", description: "Clean and green initiatives for a sustainable community", icon: "Leaf" },
];

const events = [
  { id: 1, title: "Barangay Assembly", date: "Monthly", time: "9:00 AM", location: "Barangay Hall", type: "Assembly" },
  { id: 2, title: "Health Day", date: "Every Saturday", time: "8:00 AM - 12:00 PM", location: "Health Center", type: "Health" },
];

const officeHours = [
  { id: 1, day: "Monday - Friday", hours: "8:00 AM - 5:00 PM", is_closed: false },
  { id: 2, day: "Saturday", hours: "8:00 AM - 12:00 PM", is_closed: false },
  { id: 3, day: "Sunday", hours: "Closed", is_closed: true },
];

const contacts = [
  { id: 1, name: "Barangay Hall", number: "(052) 123-4567" },
  { id: 2, name: "Emergency Hotline", number: "0917-XXX-XXXX" },
];

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
];

export function CommunitySection() {
  return (
    <section id="community" className="pt-12 sm:pt-16 lg:pt-20 pb-2 sm:pb-4 lg:pb-6">
      <div className="w-full max-w-[1600px] mx-auto">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="font-black text-primary leading-none tracking-tight" style={{fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', marginBottom: 'clamp(0.5rem, 1vh, 0.75rem)'}}>COMMUNITY INFORMATION</h2>
          <p className="text-gray-600 font-medium" style={{fontSize: 'clamp(0.875rem, 1.5vw, 1rem)'}}>
            Everything you need to know about our barangay services, events, and community programs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {/* Services & Programs */}
          <div className="space-y-3 sm:space-y-4">
            <Card className="bg-white/95 backdrop-blur-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/98">
              <CardHeader className="pb-2">
                <CardTitle className="text-primary text-lg font-bold">Community Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {services.map((service) => {
                  const IconComponent = iconMap[service.icon] || Shield;
                  return (
                    <div key={service.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-balance text-sm">{service.title}</h3>
                        <p className="text-xs text-muted-foreground text-pretty leading-relaxed">{service.description}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/98">
              <CardHeader>
                <CardTitle className="text-primary text-lg font-bold">Office Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {officeHours.map((hour) => (
                  <div key={hour.id} className="flex items-center gap-3">
                    <Clock className={`h-4 w-4 ${hour.is_closed ? 'text-muted-foreground' : 'text-primary'}`} />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{hour.day}</p>
                      <p className={`text-xs ${hour.is_closed ? 'text-red-500' : 'text-muted-foreground'}`}>{hour.hours}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/98">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-primary text-lg font-bold">
                  <Calendar className="h-4 w-4" />
                  Covered Court Booked Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-4 text-center">
                  <div>
                    <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm">No bookings scheduled</p>
                    <p className="text-xs mt-1">Court is available for reservation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div className="space-y-3 sm:space-y-4">
            <Card className="bg-white/95 backdrop-blur-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/98">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary text-lg font-bold">
                  <Calendar className="h-4 w-4" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="border-l-4 border-primary pl-4">
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

            <Card className="bg-white/95 backdrop-blur-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/98">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary text-lg font-bold">
                  <AlertCircle className="h-4 w-4" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{contact.name}</span>
                      <span className="text-xs">{contact.number}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Officials & Contact */}
          <div className="space-y-3 sm:space-y-4">
            <Card className="bg-white/95 backdrop-blur-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/98">
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

            <Card className="shadow-2xl transition-all duration-300" style={{backgroundColor: '#0007C6'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-lg font-bold">
                  <Users className="h-4 w-4" />
                  Get Involved
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-white text-pretty leading-relaxed">
                  Join our community programs and help make our barangay a better place for everyone.
                </p>
                <div className="space-y-2">
                  <a href="https://docs.google.com/forms/d/e/1FAIpQLSe0dXTVprKmQqRG1_hZpcnIeN8TW9y-NX9-E9Yl3a3AJecIHQ/viewform" target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="secondary" className="w-full bg-yellow-400 text-black hover:bg-yellow-400">
                      <FileText className="h-4 w-4 mr-2" />
                      Submit Feedback
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
