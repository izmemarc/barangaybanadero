import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Wrench } from "lucide-react"

export function ProjectsSection() {
  const projects = [
    {
      title: "Multi-Purpose Community Center",
      status: "Completed",
      description: "A modern facility for community events, meetings, and recreational activities.",
      image: "/modern-community-center-building-in-philippines.jpg",
      date: "Completed March 2024",
      beneficiaries: "2,500 residents",
      budget: "₱5.2M",
    },
    {
      title: "Street Lighting Project",
      status: "Ongoing",
      description: "Installation of LED street lights along major roads for improved safety and security.",
      image: "/led-street-lights-installation-in-residential-area.jpg",
      date: "Expected completion: June 2024",
      beneficiaries: "All residents",
      budget: "₱1.8M",
    },
    {
      title: "Covered Basketball Court",
      status: "Completed",
      description: "Weather-proof basketball court with modern facilities for sports and events.",
      image: "/covered-basketball-court-in-philippines-barangay.jpg",
      date: "Completed January 2024",
      beneficiaries: "Youth and sports enthusiasts",
      budget: "₱3.5M",
    },
    {
      title: "Drainage System Improvement",
      status: "Planning",
      description: "Comprehensive drainage system upgrade to prevent flooding during rainy season.",
      image: "/drainage-system-construction-project.jpg",
      date: "Target start: August 2024",
      beneficiaries: "1,800 households",
      budget: "₱4.2M",
    },
    {
      title: "Health Center Expansion",
      status: "Ongoing",
      description: "Expansion of the barangay health center to accommodate more patients and services.",
      image: "/health-center-medical-facility-in-philippines.jpg",
      date: "Expected completion: September 2024",
      beneficiaries: "All residents",
      budget: "₱2.9M",
    },
    {
      title: "Senior Citizens Center",
      status: "Planning",
      description: "Dedicated facility for senior citizens' activities, health programs, and social services.",
      image: "/senior-citizens-center-building.jpg",
      date: "Target start: October 2024",
      beneficiaries: "450 senior citizens",
      budget: "₱2.1M",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "Ongoing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Planning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <section id="projects" className="min-h-screen bg-muted py-12 sm:py-16 lg:py-20">
      <div className="w-full max-w-[1600px] mx-auto px-0 sm:px-0.5 lg:px-1 xl:px-2">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-balance">Community Projects</h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            Discover the ongoing and completed projects that are transforming our barangay and improving the quality of
            life for all residents.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12">
          {projects.map((project, index) => (
            <Card key={index} className="bg-card border-border hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full flex flex-col">
              <div className="relative">
                <img
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-40 sm:h-48 lg:h-52 object-cover rounded-t-lg"
                />
                <Badge className={`absolute top-2 sm:top-3 right-2 sm:right-3 text-xs sm:text-sm ${getStatusColor(project.status)}`} variant="outline">
                  {project.status}
                </Badge>
              </div>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-base sm:text-lg lg:text-xl text-balance leading-tight">{project.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 flex-1 flex flex-col">
                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground text-pretty leading-relaxed flex-1">{project.description}</p>

                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    <span className="truncate">{project.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    <span className="truncate">{project.beneficiaries}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wrench className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    <span className="font-semibold">{project.budget}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full bg-transparent text-xs sm:text-sm h-8 sm:h-9 lg:h-10 mt-auto">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Card className="bg-primary text-primary-foreground max-w-4xl mx-auto">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 lg:mb-6 text-balance">Project Transparency</h3>
              <p className="text-primary-foreground/90 mb-4 sm:mb-6 lg:mb-8 text-pretty leading-relaxed text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
                We believe in full transparency regarding our community projects. All project details, budgets, and
                progress reports are available for public viewing.
              </p>
              <Button variant="secondary" size="lg" className="text-sm sm:text-base h-10 sm:h-11 lg:h-12 px-4 sm:px-6 lg:px-8">
                View Full Project Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
