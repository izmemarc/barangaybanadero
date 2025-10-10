'use client';

import { ProjectCard, Project } from "./project-card"
import { useState, useEffect } from "react"

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const coreAreasProjectsStatic = [
    {
      title: "Financial Administration",
      description: "Barangay Assembly – Second Semester CY 2024. Held on October 26, 2024, the assembly gathered residents and officials to present the financial report, update ongoing projects, and address community concerns through open dialogue and feedback.",
      image: "/finance.webp",
      date: "October 26, 2024",
      beneficiaries: "All residents",
      url: "https://drive.google.com/drive/folders/10SxM2mhq1j7OqwlMr3FQAV3pEj9-18vQ?usp=sharing",
    },
    {
      title: "Disaster Preparedness",
      description: "Preemptive Evacuation and Relief Distribution for Typhoon Opong. PB Arthur Marco led the preemptive evacuation of 24 families to ensure safety as Typhoon Opong intensified. Together with Kagawad Regie Ajero, BDRRM Chairman, the barangay council and BHW distributed food packs at the evacuation center.",
      image: "/disaster.webp",
      date: "September 25, 2025",
      beneficiaries: "24 evacuated families",
      url: "https://drive.google.com/drive/folders/1kAyJOijS80A_Y3Yr4ca53s9C9-_DnNfa?usp=sharing",
    },
    {
      title: "Social Protection",
      description: "External Accreditation of Barangay 6 Bañadero Child Development Center. External evaluation was conducted to assess and improve the quality of education, ensuring standards for effective learning. Gratitude was extended to the accreditors, Barangay officials, and the Child Development Worker for their support in making the accreditation a success.",
      image: "/social protection.webp",
      date: "September 24, 2025",
      beneficiaries: "Children and families",
      url: "https://drive.google.com/drive/folders/191n5A7HwWok4vNpssWP8fE3udTi23eWc?usp=sharing",
    },
  ]

  const essentialAreasProjectsStatic = [
    {
      title: "Business-Friendliness and Competitiveness",
      description: "Empowering Women: Strengthening Lives Through Awareness and Opportunities. A seminar focused on gender advocacy, mental health, conflict resolution, and livelihood opportunities for women in the community.",
      image: "/livelihood.webp",
      date: "September 17, 2025",
      beneficiaries: "Women in the community",
      url: "https://drive.google.com/drive/folders/1vwyhTr3teTlupka_-9gQyMJ8KMNSCm9S?usp=sharing",
    },
    {
      title: "Peace and Order",
      description: "Seminar/Training for Lupon and Tanod – Empowering for a Drug-Free Community. Held on August 24, 2024, at the Barangay Action Center, the training covered the Katarungang Pambarangay Law, drug awareness and prevention, warrantless arrest procedures, and arresting and handcuffing techniques for barangay tanods.",
      image: "/peace and order.webp",
      date: "August 24, 2024",
      beneficiaries: "Lupon and Tanod members",
      url: "https://drive.google.com/drive/folders/1N_jgpcREiMRM1j-iE0JKs0tIJC46cfJ8?usp=sharing",
    },
    {
      title: "Environmental Management",
      description: "Seminar on Ecological Waste Segregation and Recycling for Livelihood. A community seminar held at the Barangay Action Center highlighting composting, waste segregation in line with RA 9003, and recycling as livelihood opportunities. Resource speakers from OCENR and ESWMO provided insights, while practical demonstrations showed how waste can be turned into useful and marketable products.",
      image: "/environment.webp",
      date: "March 8, 2025",
      beneficiaries: "Community residents",
      url: "https://drive.google.com/drive/folders/1m5xssM3vAWrQvgm2FcOe9VG5g3Lsjc6d?usp=sharing",
    },
  ]



  // Use database projects if available, otherwise fallback to static
  const coreAreasProjects = projects.length > 0 ? projects.slice(0, 3) : coreAreasProjectsStatic;
  const essentialAreasProjects = projects.length > 3 ? projects.slice(3, 6) : essentialAreasProjectsStatic;

  return (
    <section id="projects" className="min-h-screen bg-white py-12 sm:py-16 lg:py-20">
      <div className="w-full max-w-[1600px] mx-auto">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="font-black text-primary leading-none tracking-tight" style={{fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', marginBottom: 'clamp(0.5rem, 1vh, 0.75rem)'}}>Community Projects</h2>
          <p className="text-gray-600 font-medium" style={{fontSize: 'clamp(0.875rem, 1.5vw, 1rem)'}}>
            Discover the ongoing and completed projects that are transforming our barangay and improving the quality of
            life for all residents.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading projects...</p>
          </div>
        ) : (
          <>
            {/* Main Pillars Section */}
            <div className="mb-12 sm:mb-16 lg:mb-20">
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="font-bold text-primary leading-none tracking-tight" style={{fontSize: 'clamp(1.25rem, 2.5vw, 2rem)'}}>Main Pillars</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {coreAreasProjects.map((project: Project, index: number) => {
                  return (
                    <ProjectCard 
                      key={project.id || `core-${project.title}-${index}`} 
                      project={project}
                      onUpdate={fetchProjects}
                    />
                  );
                })}
                  </div>
                </div>

            {/* Supporting Pillars Section */}
            <div className="mb-8 sm:mb-10 lg:mb-12">
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="font-bold text-primary leading-none tracking-tight" style={{fontSize: 'clamp(1.25rem, 2.5vw, 2rem)'}}>Supporting Pillars</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {essentialAreasProjects.map((project: Project, index: number) => {
                  return (
                    <ProjectCard 
                      key={project.id || `essential-${project.title}-${index}`} 
                      project={project}
                      onUpdate={fetchProjects}
                    />
                  );
                })}
        </div>
        </div>
          </>
        )}
      </div>
    </section>
  )
}
