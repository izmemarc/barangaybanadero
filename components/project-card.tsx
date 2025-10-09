"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users } from "lucide-react"

interface Project {
  title: string
  description: string
  image?: string
  date: string
  beneficiaries: string
  url: string
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card 
      className="bg-white/95 backdrop-blur-lg border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] h-full flex flex-col overflow-hidden p-0 cursor-pointer"
      onClick={() => window.open(project.url, '_blank')}
    >
      <div className="relative">
        <picture>
          <source srcSet={`${project.image || "/placeholder.svg"} 1x`} type="image/webp" />
          <source srcSet={`${project.image?.replace(/\.webp$/, '.jpg') || "/placeholder.svg"} 1x`} type="image/jpeg" />
          <img
            src={project.image?.replace(/\.webp$/, '.jpg') || "/placeholder.svg"}
            alt={project.title}
            className="w-full h-48 sm:h-56 lg:h-64 object-cover"
            loading="lazy"
            width={400}
            height={300}
          />
        </picture>
      </div>
      <CardHeader className="pb-2 px-4 sm:px-6">
        <CardTitle className="font-bold text-primary leading-tight text-center" style={{fontSize: 'clamp(1rem, 1.5vw, 1.25rem)'}}>{project.title}</CardTitle>
      </CardHeader>
       <CardContent className="space-y-4 flex-1 flex flex-col px-4 sm:px-6 pb-4">
         {project.title === "Business-Friendliness and Competitiveness" ? (
           <>
             <h3 className="font-semibold text-gray-800 leading-tight mb-3" style={{fontSize: 'clamp(0.9rem, 1.2vw, 1rem)'}}>Empowering Women: Strengthening Lives Through Awareness and Opportunities</h3>
             <p className="text-gray-600 font-medium text-pretty leading-relaxed flex-1" style={{fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)'}}>A seminar focused on gender advocacy, mental health, conflict resolution, and livelihood opportunities for women in the community.</p>
           </>
         ) : project.title === "Financial Administration" ? (
           <>
             <h3 className="font-semibold text-gray-800 leading-tight mb-3" style={{fontSize: 'clamp(0.9rem, 1.2vw, 1rem)'}}>Barangay Assembly – Second Semester CY 2024</h3>
             <p className="text-gray-600 font-medium text-pretty leading-relaxed flex-1" style={{fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)'}}>Held on October 26, 2024, the assembly gathered residents and officials to present the financial report, update ongoing projects, and address community concerns through open dialogue and feedback.</p>
           </>
         ) : project.title === "Social Protection" ? (
           <>
             <h3 className="font-semibold text-gray-800 leading-tight mb-3" style={{fontSize: 'clamp(0.9rem, 1.2vw, 1rem)'}}>External Accreditation of Barangay 6 Bañadero Child Development Center</h3>
             <p className="text-gray-600 font-medium text-pretty leading-relaxed flex-1" style={{fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)'}}>External evaluation was conducted to assess and improve the quality of education, ensuring standards for effective learning. Gratitude was extended to the accreditors, Barangay officials, and the Child Development Worker for their support in making the accreditation a success.</p>
           </>
        ) : project.title === "Disaster Preparedness" ? (
          <>
            <h3 className="font-semibold text-gray-800 leading-tight mb-3" style={{fontSize: 'clamp(0.9rem, 1.2vw, 1rem)'}}>Preemptive Evacuation and Relief Distribution for Typhoon Opong</h3>
            <p className="text-gray-600 font-medium text-pretty leading-relaxed flex-1" style={{fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)'}}>PB Arthur Marco led the preemptive evacuation of 24 families to ensure safety as Typhoon Opong intensified. Together with Kagawad Regie Ajero, BDRRM Chairman, the barangay council and BHW distributed food packs at the evacuation center.</p>
          </>
        ) : project.title === "Environmental Management" ? (
           <>
             <h3 className="font-semibold text-gray-800 leading-tight mb-3" style={{fontSize: 'clamp(0.9rem, 1.2vw, 1rem)'}}>Seminar on Ecological Waste Segregation and Recycling for Livelihood</h3>
             <p className="text-gray-600 font-medium text-pretty leading-relaxed flex-1" style={{fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)'}}>A community seminar held at the Barangay Action Center highlighting composting, waste segregation in line with RA 9003, and recycling as livelihood opportunities. Resource speakers from OCENR and ESWMO provided insights, while practical demonstrations showed how waste can be turned into useful and marketable products.</p>
           </>
         ) : project.title === "Peace and Order" ? (
           <>
             <h3 className="font-semibold text-gray-800 leading-tight mb-3" style={{fontSize: 'clamp(0.9rem, 1.2vw, 1rem)'}}>Seminar/Training for Lupon and Tanod – Empowering for a Drug-Free Community</h3>
             <p className="text-gray-600 font-medium text-pretty leading-relaxed flex-1" style={{fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)'}}>Held on August 24, 2024, at the Barangay Action Center, the training covered the Katarungang Pambarangay Law, drug awareness and prevention, warrantless arrest procedures, and arresting and handcuffing techniques for barangay tanods.</p>
           </>
         ) : (
           <p className="text-gray-600 font-medium text-pretty leading-relaxed flex-1" style={{fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)'}}>{project.description}</p>
         )}

        <div className="space-y-3 mt-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 truncate">{project.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 truncate">{project.beneficiaries}</span>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
