'use client'

import { useState, useEffect, useRef } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Building2, AlertCircle, Calendar, Award, Heart, Home, ArrowLeft } from 'lucide-react'
import { submitClearance, searchResidents, calculateAge, type Resident } from '@/lib/supabase'

type ClearanceType = 
  | 'barangay'
  | 'business'
  | 'blotter'
  | 'facility'
  | 'good-moral'
  | 'indigency'
  | 'residency'

interface FormData {
  name: string
  [key: string]: string
}

const clearanceTypes = [
  { id: 'barangay' as ClearanceType, label: 'Barangay Clearance', icon: FileText },
  { id: 'business' as ClearanceType, label: 'Business Clearance', icon: Building2 },
  { id: 'blotter' as ClearanceType, label: 'Blotter', icon: AlertCircle },
  { id: 'facility' as ClearanceType, label: 'Facility Use', icon: Calendar },
  { id: 'good-moral' as ClearanceType, label: 'Certificate of Good Moral', icon: Award },
  { id: 'indigency' as ClearanceType, label: 'Certificate of Indigency', icon: Heart },
  { id: 'residency' as ClearanceType, label: 'Certificate of Residency', icon: Home },
]

export default function ClearancesPage() {
  const [selectedType, setSelectedType] = useState<ClearanceType | null>(null)
  const [formData, setFormData] = useState<FormData>({ name: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Autocomplete state
  const [nameQuery, setNameQuery] = useState('')
  const [residents, setResidents] = useState<Resident[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedResidentIndex, setSelectedResidentIndex] = useState(-1)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Search residents when name query changes
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (nameQuery.length >= 2) {
        const results = await searchResidents(nameQuery)
        setResidents(results as Resident[])
        setShowSuggestions(results.length > 0)
      } else {
        setResidents([])
        setShowSuggestions(false)
      }
    }, 300) // Debounce 300ms

    return () => clearTimeout(searchTimeout)
  }, [nameQuery])

  // Handle selecting a resident from suggestions
  const selectResident = (resident: Resident) => {
    const fullName = `${resident.first_name} ${resident.middle_name ? resident.middle_name + ' ' : ''}${resident.last_name}`.toUpperCase()
    setFormData(prev => ({ ...prev, name: fullName }))
    setNameQuery(fullName)
    setShowSuggestions(false)
    setSelectedResidentIndex(-1)
  }

  // Keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedResidentIndex(prev => 
        prev < residents.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedResidentIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter' && selectedResidentIndex >= 0) {
      e.preventDefault()
      selectResident(residents[selectedResidentIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const getFormFields = (type: ClearanceType) => {
    switch (type) {
      case 'barangay':
        return [
          { 
            id: 'purpose', 
            label: 'Purpose', 
            type: 'select', 
            required: true,
            options: ['Reference', 'Job Application', 'Scholarship', 'Loan', 'Other']
          },
          { id: 'contact', label: 'Contact Number', type: 'tel', required: true },
        ]
      case 'business':
        return [
          { id: 'businessName', label: 'Business Name', type: 'text', required: true },
          { id: 'businessAddress', label: 'Business Address', type: 'text', required: true },
          { id: 'contact', label: 'Contact Number', type: 'tel', required: true },
        ]
      case 'blotter':
        return [
          { id: 'age', label: 'Age', type: 'number', required: true },
          { id: 'contact', label: 'Contact Number', type: 'tel', required: true },
          { id: 'address', label: 'Address', type: 'text', required: true },
          { 
            id: 'civilStatus', 
            label: 'Civil Status', 
            type: 'select', 
            required: true,
            options: ['Single', 'Married', 'Widowed', 'Divorced', 'Separated']
          },
          { id: 'respondentName', label: 'Respondent Name', type: 'text', required: true },
          { id: 'incidentDate', label: 'Date of Incident', type: 'date', required: true },
          { id: 'incidentTime', label: 'Time of Incident', type: 'time', required: true },
          { id: 'incidentLocation', label: 'Place of Incident', type: 'text', required: true },
          { 
            id: 'incidentType', 
            label: 'Type of Incident', 
            type: 'select', 
            required: true,
            options: ['Unjust Vexation', 'Physical Injury', 'Theft', 'Grave Threats', 'Property Damage', 'Harassment', 'Disturbance of Peace', 'Trespassing', 'Robbery', 'Defamation', 'Vandalism', 'Scam / Fraud', 'Coercion', 'Other']
          },
          { id: 'incidentDescription', label: 'Brief Description of the Incident', type: 'textarea', required: true },
        ]
      case 'facility':
        return [
          { id: 'contact', label: 'Contact Number', type: 'tel', required: true },
          { 
            id: 'facility', 
            label: 'Facility', 
            type: 'select', 
            required: true,
            options: ['Basketball Court (300 php/hour)']
          },
          { id: 'eventDate', label: 'Date', type: 'date', required: true },
          { id: 'startTime', label: 'Starting Time', type: 'time', required: true },
          { id: 'endTime', label: 'End Time', type: 'time', required: true },
          { id: 'purpose', label: 'Purpose', type: 'textarea', required: true },
          { id: 'participants', label: 'Number of participants', type: 'number', required: true },
          { id: 'equipment', label: 'Equipment Needed', type: 'checkbox', required: false, checkboxLabel: 'Covered Court Lights (+200 php/hour)' },
        ]
      case 'good-moral':
        return [
          { id: 'contact', label: 'Contact Number', type: 'tel', required: true },
        ]
      case 'indigency':
        return [
          { id: 'purpose', label: 'Purpose', type: 'textarea', required: true },
          { id: 'contact', label: 'Contact Number', type: 'tel', required: true },
        ]
      case 'residency':
        return [
          { id: 'yearResided', label: 'Year resided', type: 'number', required: true },
          { id: 'contact', label: 'Contact Number', type: 'tel', required: true },
        ]
      default:
        return []
    }
  }

  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (!selectedType) {
        throw new Error('No clearance type selected')
      }

      // Submit to Supabase
      await submitClearance(selectedType, formData.name, formData)

      setIsSubmitting(false)
      setSubmitted(true)
      
      // Reset form after 3 seconds
      setTimeout(() => {
      setSubmitted(false)
      setSelectedType(null)
      setFormData({ name: '' })
      setNameQuery('')
      setResidents([])
      setShowSuggestions(false)
      }, 3000)
    } catch (err) {
      setIsSubmitting(false)
      setError(err instanceof Error ? err.message : 'Failed to submit form. Please try again.')
      console.error('Submission error:', err)
    }
  }

  const selectedTypeData = selectedType ? clearanceTypes.find(t => t.id === selectedType) : null
  const formFields = selectedType ? getFormFields(selectedType) : []

  return (
    <>
      <Header />
      <main style={{ paddingLeft: '5%', paddingRight: '5%', paddingTop: 'max(100px, min(20vh, 200px))', paddingBottom: '40px', minHeight: '100vh', overflow: 'visible' }}>
        <div className="w-full max-w-[1600px] mx-auto" style={{ overflow: 'visible' }}>
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <h1 className="font-black text-primary leading-none tracking-tight" style={{fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', marginBottom: 'clamp(0.5rem, 1vh, 0.75rem)'}}>Barangay Clearances & Certificates</h1>
            <p className="text-gray-600 font-medium" style={{fontSize: 'clamp(0.875rem, 1.5vw, 1rem)'}}>
              Select a clearance or certificate type to begin
            </p>
          </div>

          {!selectedType ? (
            <div className="flex flex-col lg:flex-row lg:flex-nowrap justify-center items-center gap-6 px-4 lg:overflow-x-visible lg:max-w-full py-8" style={{ margin: '0 auto', overflow: 'visible' }}>
              {clearanceTypes.map((type) => {
                const Icon = type.icon
                return (
                  <div
                    key={type.id}
                    className="bg-white/95 backdrop-blur-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/98 cursor-pointer rounded-lg border flex flex-col items-center justify-center text-center p-4 flex-shrink-0"
                    style={{ width: '160px', height: '160px', minWidth: '160px', minHeight: '160px', maxWidth: '160px', maxHeight: '160px' }}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <div className="flex items-center justify-center flex-shrink-0 mb-2">
                      <Icon className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="font-semibold text-xs leading-tight line-clamp-2">{type.label}</h3>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="px-4 sm:px-6">
              <div className="flex justify-center items-start">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedType(null)
                    setFormData({ name: '' })
                    setSubmitted(false)
                  }}
                  className="gap-2 hover:bg-primary/5 mt-1 flex-shrink-0 mr-3"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Card className="bg-white/95 backdrop-blur-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/98" style={{ width: '520px' }}>
                      <CardHeader className="pb-0 pt-4 text-center">
                        {selectedTypeData && (
                          <CardTitle className="flex items-center justify-center gap-2 text-primary text-2xl font-bold">
                            {selectedTypeData.icon && (
                              <selectedTypeData.icon className="h-5 w-5" />
                            )}
                            {selectedTypeData.label}
                          </CardTitle>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">

                {submitted ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Form Submitted Successfully!</h3>
                    <p className="text-muted-foreground">Your request has been received. We will process it shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error message */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-800">
                        {error}
                      </div>
                    )}

                    {/* Facility terms */}
                    {selectedType === 'facility' && (
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-xs space-y-2">
                        <h4 className="font-bold text-sm">TERMS AND CONDITIONS</h4>
                        <ul className="list-disc pl-4 space-y-1 text-gray-700">
                          <li>The facility/equipment shall be used exclusively for the approved purpose indicated in the request form.</li>
                          <li>The requestor is responsible for maintaining cleanliness, orderliness, and proper conduct within the facility at all times.</li>
                          <li>Any damage, loss, or misuse of barangay property shall be charged to the requestor, who will be held accountable for repair or replacement costs.</li>
                          <li>The Barangay reserves the right to cancel, deny, or reschedule the approved request at any time if the facility is required for official or emergency use.</li>
                          <li>The requestor shall strictly comply with all barangay rules, regulations, and safety protocols governing the use of the facility.</li>
                          <li>The Barangay shall not be held liable for any accidents, injuries, or loss of personal property that may occur during the use of the facility.</li>
                        </ul>
                      </div>
                    )}

                    {/* Name field - required for all forms */}
                    <div className="space-y-2 relative">
                      <label htmlFor="name" className="block text-sm font-semibold text-foreground">
                        {selectedType === 'blotter' ? 'Complainant Name' : 'Name'}
                      </label>
                      <input
                        ref={nameInputRef}
                        id="name"
                        type="text"
                        required
                        value={nameQuery}
                        onChange={(e) => {
                          const value = e.target.value
                          setNameQuery(value)
                          handleInputChange('name', value)
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                          if (residents.length > 0) setShowSuggestions(true)
                        }}
                        className="w-full px-4 py-2.5 border border-border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        placeholder="Start typing to search residents..."
                        autoComplete="off"
                      />
                      
                      {/* Autocomplete suggestions */}
                      {showSuggestions && residents.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white/98 backdrop-blur-lg border border-gray-200 rounded-lg shadow-2xl overflow-hidden">
                          {residents.slice(0, 5).map((resident, index) => (
                            <div
                              key={resident.id}
                              className={`px-4 py-3 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 ${
                                index === selectedResidentIndex
                                  ? 'bg-primary text-white shadow-md'
                                  : 'hover:bg-gray-50'
                              }`}
                              onClick={() => selectResident(resident)}
                              onMouseEnter={() => setSelectedResidentIndex(index)}
                            >
                              <div className="font-semibold text-sm">
                                {resident.first_name} {resident.middle_name} {resident.last_name}
                              </div>
                              <div className={`text-xs mt-0.5 flex items-center gap-2 ${index === selectedResidentIndex ? 'text-white/90' : 'text-gray-500'}`}>
                                {resident.purok && (
                                  <span className="flex items-center gap-1">
                                    <Home className="h-3 w-3" />
                                    {resident.purok}
                                  </span>
                                )}
                                {resident.birthdate && (
                                  <span className="flex items-center gap-1">
                                    • Age {calculateAge(resident.birthdate)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          {residents.length > 5 && (
                            <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 text-center">
                              +{residents.length - 5} more results
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Dynamic form fields based on selected type */}
                    {formFields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <label htmlFor={field.id} className="block text-sm font-semibold text-foreground">
                          {field.label}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            id={field.id}
                            required={field.required}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2.5 border border-border rounded-md text-sm bg-background resize-vertical focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                          />
                        ) : field.type === 'select' ? (
                          <select
                            id={field.id}
                            required={field.required}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            className="w-full px-4 py-2.5 border border-border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                          >
                            <option value="">Select an option</option>
                            {field.options?.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : field.type === 'checkbox' ? (
                          <div className="flex items-center gap-2">
                            <input
                              id={field.id}
                              type="checkbox"
                              checked={formData[field.id] === 'true'}
                              onChange={(e) => handleInputChange(field.id, e.target.checked.toString())}
                              className="w-4 h-4 border border-border rounded focus:ring-2 focus:ring-primary"
                            />
                            <label htmlFor={field.id} className="text-sm">{field.checkboxLabel}</label>
                          </div>
                        ) : (
                          <input
                            id={field.id}
                            type={field.type}
                            required={field.required}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            className="w-full px-4 py-2.5 border border-border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                          />
                        )}
                      </div>
                    ))}

                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 min-h-[44px]"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          'Submit Form'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFormData({ name: '' })
                        }}
                        disabled={isSubmitting}
                        className="min-h-[44px]"
                      >
                        Clear Form
                      </Button>
                    </div>
                  </form>
                )}
                  </CardContent>
                </Card>
                {/* Spacer to balance the back button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 mt-1 flex-shrink-0 ml-3 opacity-0 pointer-events-none"
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
