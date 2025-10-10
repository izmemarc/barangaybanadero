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
  Pencil,
  Save,
  X,
} from "lucide-react"
import { useAdmin } from "@/contexts/admin-context"
import { useState, useEffect } from "react"

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
}

interface OfficeHour {
  id: number;
  day: string;
  hours: string;
  is_closed: boolean;
}

interface EmergencyContact {
  id: number;
  name: string;
  number: string;
}

const iconMap: Record<string, any> = {
  Shield,
  Heart,
  GraduationCap,
  Leaf,
};

export function CommunitySection() {
  const { isEditMode } = useAdmin();
  const [services, setServices] = useState<Service[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [officeHours, setOfficeHours] = useState<OfficeHour[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  
  const [editingService, setEditingService] = useState<number | null>(null);
  const [editingEvent, setEditingEvent] = useState<number | null>(null);
  const [editingHour, setEditingHour] = useState<number | null>(null);
  const [editingContact, setEditingContact] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, eventsRes, hoursRes, contactsRes] = await Promise.all([
        fetch('/api/admin/community/services'),
        fetch('/api/admin/community/events'),
        fetch('/api/admin/community/hours'),
        fetch('/api/admin/community/contacts'),
      ]);
      
      setServices(await servicesRes.json());
      setEvents(await eventsRes.json());
      setOfficeHours(await hoursRes.json());
      setContacts(await contactsRes.json());
    } catch (error) {
      console.error('Error fetching community data:', error);
    }
  };

  const handleSaveService = async (service: Service) => {
    try {
      await fetch('/api/admin/community/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service),
      });
      setEditingService(null);
      fetchData();
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleSaveEvent = async (event: Event) => {
    try {
      await fetch('/api/admin/community/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      setEditingEvent(null);
      fetchData();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleSaveHour = async (hour: OfficeHour) => {
    try {
      await fetch('/api/admin/community/hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hour),
      });
      setEditingHour(null);
      fetchData();
    } catch (error) {
      console.error('Error saving office hour:', error);
    }
  };

  const handleSaveContact = async (contact: EmergencyContact) => {
    try {
      await fetch('/api/admin/community/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      });
      setEditingContact(null);
      fetchData();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  // Keep officials static (not editable)
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
    <section id="community" className="bg-white pt-12 sm:pt-16 lg:pt-20 pb-2 sm:pb-4 lg:pb-6">
      <div className="w-full max-w-[1600px] mx-auto">
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
                {services.map((service) => {
                  const IconComponent = iconMap[service.icon] || Shield;
                  const isEditing = editingService === service.id;
                  
                  return (
                    <div key={service.id} className="flex items-start gap-3 relative group">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={service.title}
                              onChange={(e) => setServices(services.map(s => s.id === service.id ? {...s, title: e.target.value} : s))}
                              className="w-full font-semibold text-sm border rounded px-2 py-1 mb-1"
                            />
                            <textarea
                              value={service.description}
                              onChange={(e) => setServices(services.map(s => s.id === service.id ? {...s, description: e.target.value} : s))}
                              className="w-full text-xs border rounded px-2 py-1"
                              rows={2}
                            />
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => handleSaveService(service)} className="text-green-600 hover:text-green-700">
                                <Save className="h-4 w-4" />
                              </button>
                              <button onClick={() => { setEditingService(null); fetchData(); }} className="text-red-600 hover:text-red-700">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <h3 className="font-semibold text-balance text-sm">{service.title}</h3>
                            <p className="text-xs text-muted-foreground text-pretty leading-relaxed">{service.description}</p>
                            {isEditMode && (
                              <button
                                onClick={() => setEditingService(service.id)}
                                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Pencil className="h-3 w-3 text-primary" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-lg border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/98">
              <CardHeader>
                 <CardTitle className="text-primary text-lg font-bold">Office Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {officeHours.map((hour) => {
                  const isEditing = editingHour === hour.id;
                  
                  return (
                    <div key={hour.id} className="flex items-center gap-3 relative group">
                      <Clock className={`h-4 w-4 ${hour.is_closed ? 'text-muted-foreground' : 'text-primary'}`} />
                      <div className="flex-1">
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={hour.day}
                              onChange={(e) => setOfficeHours(officeHours.map(h => h.id === hour.id ? {...h, day: e.target.value} : h))}
                              className="w-full font-semibold text-sm border rounded px-2 py-1 mb-1"
                            />
                            <input
                              type="text"
                              value={hour.hours}
                              onChange={(e) => setOfficeHours(officeHours.map(h => h.id === hour.id ? {...h, hours: e.target.value} : h))}
                              className="w-full text-xs border rounded px-2 py-1"
                            />
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => handleSaveHour(hour)} className="text-green-600 hover:text-green-700">
                                <Save className="h-4 w-4" />
                              </button>
                              <button onClick={() => { setEditingHour(null); fetchData(); }} className="text-red-600 hover:text-red-700">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className={`font-semibold text-sm ${hour.is_closed ? 'text-muted-foreground' : ''}`}>{hour.day}</p>
                            <p className="text-xs text-muted-foreground">{hour.hours}</p>
                            {isEditMode && (
                              <button
                                onClick={() => setEditingHour(hour.id)}
                                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Pencil className="h-3 w-3 text-primary" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
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
                {events.map((event) => {
                  const isEditing = editingEvent === event.id;
                  
                  return (
                    <div key={event.id} className="border-l-4 border-primary pl-4 relative group">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={event.type}
                            onChange={(e) => setEvents(events.map(ev => ev.id === event.id ? {...ev, type: e.target.value} : ev))}
                            className="w-full text-xs border rounded px-2 py-1 mb-1"
                            placeholder="Type"
                          />
                          <input
                            type="text"
                            value={event.title}
                            onChange={(e) => setEvents(events.map(ev => ev.id === event.id ? {...ev, title: e.target.value} : ev))}
                            className="w-full font-semibold text-sm border rounded px-2 py-1 mb-1"
                          />
                          <input
                            type="text"
                            value={event.date}
                            onChange={(e) => setEvents(events.map(ev => ev.id === event.id ? {...ev, date: e.target.value} : ev))}
                            className="w-full text-xs border rounded px-2 py-1 mb-1"
                            placeholder="Date"
                          />
                          <input
                            type="text"
                            value={event.time}
                            onChange={(e) => setEvents(events.map(ev => ev.id === event.id ? {...ev, time: e.target.value} : ev))}
                            className="w-full text-xs border rounded px-2 py-1 mb-1"
                            placeholder="Time"
                          />
                          <input
                            type="text"
                            value={event.location}
                            onChange={(e) => setEvents(events.map(ev => ev.id === event.id ? {...ev, location: e.target.value} : ev))}
                            className="w-full text-xs border rounded px-2 py-1 mb-1"
                            placeholder="Location"
                          />
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => handleSaveEvent(event)} className="text-green-600 hover:text-green-700">
                              <Save className="h-4 w-4" />
                            </button>
                            <button onClick={() => { setEditingEvent(null); fetchData(); }} className="text-red-600 hover:text-red-700">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
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
                          {isEditMode && (
                            <button
                              onClick={() => setEditingEvent(event.id)}
                              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Pencil className="h-3 w-3 text-primary" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
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
                  {contacts.map((contact) => {
                    const isEditing = editingContact === contact.id;
                    
                    return (
                      <div key={contact.id} className="space-y-1 relative group">
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={contact.name}
                              onChange={(e) => setContacts(contacts.map(c => c.id === contact.id ? {...c, name: e.target.value} : c))}
                              className="w-full font-semibold text-sm border rounded px-2 py-1 mb-1"
                            />
                            <input
                              type="text"
                              value={contact.number}
                              onChange={(e) => setContacts(contacts.map(c => c.id === contact.id ? {...c, number: e.target.value} : c))}
                              className="w-full text-xs border rounded px-2 py-1"
                            />
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => handleSaveContact(contact)} className="text-green-600 hover:text-green-700">
                                <Save className="h-4 w-4" />
                              </button>
                              <button onClick={() => { setEditingContact(null); fetchData(); }} className="text-red-600 hover:text-red-700">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm">{contact.name}</span>
                              <span className="text-xs">{contact.number}</span>
                            </div>
                            {isEditMode && (
                              <button
                                onClick={() => setEditingContact(contact.id)}
                                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Pencil className="h-3 w-3 text-primary" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
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

    </section>
  )
}
