'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Building2, AlertCircle, Calendar, Award, Heart, Home, ArrowLeft, UserPlus, CheckCircle, User, Camera, X } from 'lucide-react'
import { submitClearance, searchResidents, calculateAge, type Resident, supabase } from '@/lib/supabase'

type ClearanceType = 
  | 'barangay'
  | 'business'
  | 'blotter'
  | 'facility'
  | 'good-moral'
  | 'indigency'
  | 'residency'
  | 'register'

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
  { id: 'register' as ClearanceType, label: 'Register as Resident', icon: UserPlus },
]

export default function ClearancesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
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
  const [nameWasSelected, setNameWasSelected] = useState(false)
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null)
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null)
  const [residentPhotoUrl, setResidentPhotoUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)
  
  // Image caching
  const photoUrlCacheRef = useRef<Map<string, string | null>>(new Map())
  
  // Camera capture state for registration
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Read type from URL parameter on mount
  useEffect(() => {
    const typeParam = searchParams.get('type')
    if (typeParam && clearanceTypes.some(t => t.id === typeParam)) {
      setSelectedType(typeParam as ClearanceType)
    }
  }, [searchParams])

  // Search residents when name query changes
  useEffect(() => {
    // Don't search if name was just selected
    if (nameWasSelected) return
    
    const searchTimeout = setTimeout(async () => {
      if (nameQuery.length >= 2) {
        const results = await searchResidents(nameQuery)
        setResidents(results as Resident[])
        setShowSuggestions(results.length > 0)
        
        // Prefetch images for top 5 results in background (non-blocking)
        if (results.length > 0) {
          results.slice(0, 5).forEach((resident) => {
            // Only prefetch if not already in cache
            if (!photoUrlCacheRef.current.has(resident.id)) {
              fetchResidentPhoto(resident as Resident).catch(() => {
                // Silently fail - this is just prefetching
              })
            }
          })
        }
      } else {
        setResidents([])
        setShowSuggestions(false)
      }
    }, 300) // Debounce 300ms

    return () => clearTimeout(searchTimeout)
  }, [nameQuery, nameWasSelected])

  // Set default citizenship when register type is selected
  useEffect(() => {
    if (selectedType === 'register' && !formData.citizenship) {
      setFormData(prev => ({ ...prev, citizenship: 'Filipino' }))
    }
  }, [selectedType])

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Enable scrolling for all clearances
  useEffect(() => {
    document.body.style.overflow = 'auto'
    document.documentElement.style.overflow = 'auto'
    document.body.style.height = 'auto'
    document.documentElement.style.height = 'auto'
    
    return () => {
      document.body.style.overflow = 'auto'
      document.documentElement.style.overflow = 'auto'
      document.body.style.height = 'auto'
      document.documentElement.style.height = 'auto'
    }
  }, [])

  // Reset image error and loading state when photo URL changes
  useEffect(() => {
    setImageError(false)
    setImageLoaded(false)
  }, [residentPhotoUrl])

  // Update resident info when selectedResidentId changes
  useEffect(() => {
    if (selectedResidentId && selectedType !== 'register') {
      const fetchResidentData = async () => {
        const { data: fullResident } = await supabase
          .from('residents')
          .select('*')
          .eq('id', selectedResidentId)
          .single()
        
        if (fullResident) {
          setSelectedResident(fullResident as Resident)
          const photoUrl = await fetchResidentPhoto(fullResident as Resident)
          setResidentPhotoUrl(photoUrl || null)
          
          // If no photo exists, clear captured photo to allow new capture
          if (!photoUrl) {
            setCapturedPhoto(null)
          }
        }
      }
      fetchResidentData()
    }
  }, [selectedResidentId, selectedType])

  // Fetch resident photo from Supabase Storage
  const fetchResidentPhoto = async (resident: Resident, skipCache = false) => {
    // Define cache key outside try-catch for error handling
    const cacheKey = resident.id
    
    try {
      // Check cache first
      if (!skipCache && photoUrlCacheRef.current.has(cacheKey)) {
        const cachedUrl = photoUrlCacheRef.current.get(cacheKey)
        console.log(`[Photo] Using cached URL for ${resident.first_name} ${resident.last_name}`)
        return cachedUrl
      }
      
      // Normalize name for filename matching
      const normalize = (str: string) => {
        return str.toUpperCase()
          .trim()
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/Ñ/g, 'N')
          .replace(/ñ/g, 'N')
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      }
      
      const clean = (str: string) => normalize(str)
      const baseName = [
        clean(resident.last_name), 
        clean(resident.first_name), 
        clean(resident.middle_name || '')
      ]
        .filter(v => v)
        .join('-')
        .replace(/-+/g, '-') // Ensure single hyphens
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      const fullBase = resident.suffix ? `${baseName}-${clean(resident.suffix)}` : baseName

      // Search for photo in Supabase Storage
      const bucketName = 'extracted_images'
      console.log(`[Photo] Attempting to list files from bucket: ${bucketName}`)
      const { data: files, error } = await supabase.storage
        .from(bucketName)
        .list('', {
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' }
        })

      if (error) {
        console.error('[Photo] Error listing files:', error)
        console.error('[Photo] Error details:', JSON.stringify(error, null, 2))
        return null
      }

      console.log(`[Photo] Searching for: ${fullBase}`)
      console.log(`[Photo] Found ${files?.length || 0} files in bucket`)
      
      // Find matching photo file - try multiple patterns
      // Normalize file names to replace spaces with hyphens for matching
      const normalizeFileName = (name: string) => {
        return name.toUpperCase()
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Collapse multiple hyphens
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/Ñ/g, 'N')
          .replace(/ñ/g, 'N')
          .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      }
      
      // Also normalize the search base to ensure spaces become hyphens
      const normalizedSearchBase = fullBase.toUpperCase().replace(/\s+/g, '-').replace(/-+/g, '-')
      
      let matchingFile = files?.find((file: any) => {
        const fileName = normalizeFileName(file.name)
        const isImage = fileName.endsWith('.JPG') || fileName.endsWith('.JPEG') || 
                        fileName.endsWith('.PNG') || fileName.endsWith('.jpg') || 
                        fileName.endsWith('.jpeg') || fileName.endsWith('.png')
        // Try exact match or starts with pattern
        const matches = fileName === normalizedSearchBase + '.JPG' ||
                        fileName === normalizedSearchBase + '.JPEG' ||
                        fileName === normalizedSearchBase + '.PNG' ||
                        fileName === normalizedSearchBase + '.jpg' ||
                        fileName === normalizedSearchBase + '.jpeg' ||
                        fileName === normalizedSearchBase + '.png' ||
                        fileName.startsWith(normalizedSearchBase + '.') ||
                        fileName.includes(normalizedSearchBase)
        if (matches && isImage) {
          console.log(`[Photo] Match found: ${file.name} (normalized: ${fileName}, search: ${normalizedSearchBase})`)
        }
        return matches && isImage
      })

      // If no match, try alternative patterns (first-last, last-first, etc.)
      if (!matchingFile && files) {
        const altPatterns = [
          `${clean(resident.first_name)}-${clean(resident.last_name)}`,
          `${clean(resident.last_name)}-${clean(resident.first_name)}`,
          `${clean(resident.first_name)}-${clean(resident.middle_name || '')}-${clean(resident.last_name)}`.replace(/-+/g, '-').replace(/^-|-$/g, ''),
        ]
        
        for (const pattern of altPatterns) {
          matchingFile = files.find((file: any) => {
            const fileName = normalizeFileName(file.name)
            const isImage = fileName.endsWith('.JPG') || fileName.endsWith('.JPEG') || 
                            fileName.endsWith('.PNG') || fileName.endsWith('.jpg') || 
                            fileName.endsWith('.jpeg') || fileName.endsWith('.png')
            return fileName.includes(pattern.toUpperCase()) && isImage
          })
          if (matchingFile) {
            console.log(`[Photo] Match found with alternative pattern: ${pattern}`)
            break
          }
        }
      }

      if (!matchingFile) {
        console.log(`[Photo] No photo found for ${fullBase}`)
        console.log(`[Photo] Sample filenames:`, files?.slice(0, 5).map((f: any) => f.name))
        
        // Fallback: Try to construct URL directly if listing failed (permissions issue)
        // Since document generation works, files exist - we just can't list them from client
        if (files?.length === 0 || !files) {
          console.log(`[Photo] Bucket listing returned 0 files, trying direct URL construction`)
          const extensions = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG']
          
          // Try the normalized search base (LAST-FIRST-MIDDLE format)
          for (const ext of extensions) {
            const fileName = `${normalizedSearchBase}${ext}`
            const { data: urlData } = supabase.storage
              .from(bucketName)
              .getPublicUrl(fileName)
            
            console.log(`[Photo] Trying direct URL: ${urlData.publicUrl} (filename: ${fileName})`)
            
            // Return .jpg first as it's most common
            if (ext === '.jpg' || ext === '.JPG') {
              return urlData.publicUrl
            }
          }
          
          // Also try alternative patterns
          const altPatterns = [
            `${clean(resident.last_name)}-${clean(resident.first_name)}-${clean(resident.middle_name || '')}`.replace(/-+/g, '-').replace(/^-|-$/g, ''),
            `${clean(resident.first_name)}-${clean(resident.middle_name || '')}-${clean(resident.last_name)}`.replace(/-+/g, '-').replace(/^-|-$/g, ''),
          ]
          
          for (const pattern of altPatterns) {
            if (!pattern) continue
            const fileName = `${pattern.toUpperCase().replace(/\s+/g, '-')}.jpg`
            const { data: urlData } = supabase.storage
              .from(bucketName)
              .getPublicUrl(fileName)
            console.log(`[Photo] Trying alternative pattern: ${urlData.publicUrl}`)
            return urlData.publicUrl
          }
        }
        
        return null
      }

      console.log(`[Photo] Using photo: ${matchingFile.name}`)

      // Get public URL from Supabase Storage
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(matchingFile.name)

      const photoUrl = urlData.publicUrl
      console.log(`[Photo] Using URL: ${photoUrl}`)
      
      // Cache the result
      photoUrlCacheRef.current.set(cacheKey, photoUrl)
      
      return photoUrl
    } catch (error) {
      console.error('[Photo] Error fetching photo:', error)
      // Cache null result to avoid repeated failed fetches
      photoUrlCacheRef.current.set(cacheKey, null)
      return null
    }
  }

  // Camera functions for registration photo capture
  const openCamera = async () => {
    setIsCameraOpen(true)
    try {
      console.log('[Camera] Requesting camera access...')
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 640 } 
      })
      console.log('[Camera] Stream obtained:', stream)
      streamRef.current = stream
      
      // Wait for video element to be in DOM
      requestAnimationFrame(() => {
        if (videoRef.current) {
          console.log('[Camera] Setting video srcObject')
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(err => {
            console.error('[Camera] Error playing video:', err)
          })
        } else {
          console.error('[Camera] Video ref is null')
        }
      })
    } catch (error) {
      console.error('[Camera] Error accessing camera:', error)
      setError('Unable to access camera. Please check permissions.')
      setIsCameraOpen(false)
    }
  }

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCameraOpen(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const photoData = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedPhoto(photoData)
        closeCamera()
      }
    }
  }

  const retakePhoto = () => {
    setCapturedPhoto(null)
    openCamera()
  }

  const removePhoto = () => {
    setCapturedPhoto(null)
  }

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Set video stream when camera opens
  useEffect(() => {
    if (isCameraOpen && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [isCameraOpen])

  // Handle selecting a resident from suggestions
  const selectResident = async (resident: Resident) => {
    const fullName = `${resident.first_name} ${resident.middle_name ? resident.middle_name + ' ' : ''}${resident.last_name}`.toUpperCase()
    setFormData(prev => ({ ...prev, name: fullName }))
    setNameQuery(fullName)
    setShowSuggestions(false)
    setSelectedResidentIndex(-1)
    setNameWasSelected(true)
    setSelectedResidentId(resident.id)
    
    // Fetch full resident data including all fields
    const { data: fullResident } = await supabase
      .from('residents')
      .select('*')
      .eq('id', resident.id)
      .single()
    
    if (fullResident) {
      setSelectedResident(fullResident as Resident)
      // Fetch photo
      const photoUrl = await fetchResidentPhoto(fullResident as Resident)
      setResidentPhotoUrl(photoUrl ?? null)
    } else {
      setSelectedResident(resident)
      const photoUrl = await fetchResidentPhoto(resident)
      setResidentPhotoUrl(photoUrl ?? null)
    }
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
      case 'register':
        return [
          { id: 'firstName', label: 'First Name', type: 'text', required: true },
          { id: 'middleName', label: 'Middle Name', type: 'text', required: false },
          { id: 'lastName', label: 'Last Name', type: 'text', required: true },
          { 
            id: 'suffix', 
            label: 'Suffix', 
            type: 'select', 
            required: false,
            options: ['None', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V']
          },
          { id: 'birthdate', label: 'Birthdate', type: 'date', required: true },
          { 
            id: 'gender', 
            label: 'Gender', 
            type: 'select', 
            required: true,
            options: ['Male', 'Female']
          },
          { 
            id: 'civilStatus', 
            label: 'Civil Status', 
            type: 'select', 
            required: true,
            options: ['Single', 'Married', 'Widowed', 'Divorced', 'Separated']
          },
          { id: 'citizenship', label: 'Citizenship', type: 'text', required: true, placeholder: 'Filipino' },
          { 
            id: 'purok', 
            label: 'Purok', 
            type: 'select', 
            required: true,
            options: ['1', '2', '3', '4', '5', '6']
          },
          { id: 'contact', label: 'Contact Number', type: 'tel', required: true },
        ]
      default:
        return []
    }
  }

  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }))
    
    // If name field is manually changed, clear resident selection
    if (id === 'name') {
      setSelectedResidentId(null)
      setNameWasSelected(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    // Hide resident info immediately when submit is clicked
    setSelectedResident(null)
    setResidentPhotoUrl(null)

    try {
      if (!selectedType) {
        throw new Error('No clearance type selected')
      }

      // For registration, use different submission
      if (selectedType === 'register') {
        // Check if photo is captured
        if (!capturedPhoto) {
          setIsSubmitting(false)
          setError('Please capture a photo before submitting')
          return
        }

        const response = await fetch('/api/register-resident', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            photo: capturedPhoto
          })
        })

        const result = await response.json()

        if (!response.ok) throw new Error(result.error || 'Registration failed')

        setIsSubmitting(false)
        setSubmitted(true)
        
        // Clear resident info immediately when success shows
        setSelectedResident(null)
        setResidentPhotoUrl(null)
        setSelectedResidentId(null)
        setCapturedPhoto(null)
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setSubmitted(false)
          setSelectedType(null)
          setFormData({ name: '' })
          setNameQuery('')
          setResidents([])
          setShowSuggestions(false)
          setNameWasSelected(false)
          setSelectedResidentId(null)
        }, 3000)
        return
      }

      // For other clearances, check if resident has photo or if photo was captured
      if (selectedResidentId && (!residentPhotoUrl || imageError) && !capturedPhoto) {
        setIsSubmitting(false)
        setError('Please capture a photo of the resident before submitting')
        return
      }

      // Submit clearance to Supabase via API (includes SMS notification)
      console.log('[Clearance] Submitting:', { 
        type: selectedType, 
        name: formData.name, 
        residentId: selectedResidentId,
        formData,
        hasCapturedPhoto: !!capturedPhoto
      })
      
      const response = await fetch('/api/submit-clearance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clearanceType: selectedType,
          name: formData.name,
          formData,
          residentId: selectedResidentId,
          capturedPhoto: capturedPhoto || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit clearance')
      }

      setIsSubmitting(false)
      setSubmitted(true)
      
      // Clear resident info immediately when success shows
      setSelectedResident(null)
      setResidentPhotoUrl(null)
      setSelectedResidentId(null)
      setCapturedPhoto(null)
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false)
        setSelectedType(null)
        setFormData({ name: '' })
        setNameQuery('')
        setResidents([])
        setShowSuggestions(false)
        setNameWasSelected(false)
        setSelectedResidentId(null)
        setCapturedPhoto(null)
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
      <main className="px-4 sm:px-[5%]" style={{ 
        paddingTop: 'max(100px, min(20vh, 200px))', 
        paddingBottom: isMobile ? '60px' : '80px',
        minHeight: '100vh',
        overflow: 'visible',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '100%'
      }}>
        <div className="w-full max-w-[1600px] mx-auto" style={{ 
          overflow: 'visible', 
          paddingBottom: '40px',
          maxWidth: '100%'
        }}>
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <h1 className="font-black text-primary leading-none tracking-tight" style={{fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', marginBottom: 'clamp(0.5rem, 1vh, 0.75rem)'}}>Barangay Clearances & Certificates</h1>
            <p className="text-gray-600 font-medium" style={{fontSize: 'clamp(0.875rem, 1.5vw, 1rem)'}}>
              Select a clearance or certificate type to begin
            </p>
          </div>

          {!selectedType ? (
            <div className="flex flex-col lg:flex-row lg:flex-nowrap justify-center items-center gap-6 px-4 lg:overflow-x-visible lg:max-w-full py-8" style={{ margin: '0 auto', overflow: 'visible', paddingBottom: isMobile ? '100px' : '32px' }}>
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
            <div className="relative mx-auto" style={{ overflow: 'visible', width: '100%', maxWidth: '100%' }}>
              {/* Fixed width container to prevent shifting */}
              <div 
                className="mx-auto transition-all duration-500 ease-in-out"
                style={{ 
                  width: selectedResident && selectedType !== 'register' && !submitted 
                    ? 'calc(475px + 400px + 24px)' 
                    : '475px',
                  maxWidth: '100%',
                  overflow: 'visible'
                }}
              >
                <div className="flex justify-start items-start gap-6" style={{ overflow: 'visible' }}>
                  <div 
                    className="flex-shrink-0 w-full lg:w-auto"
                    style={{ 
                      overflow: 'visible', 
                      minWidth: 0,
                      maxWidth: '100%'
                    }}
                  >
                  <Card className="bg-white/95 backdrop-blur-lg shadow-2xl hover:bg-white/98 h-full flex flex-col relative w-full lg:w-[475px]" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', marginBottom: selectedType === 'register' ? '40px' : undefined, minWidth: 0, overflow: 'visible', maxWidth: '100%' }}>
                      {!submitted && (
                        <CardHeader className="pb-0 pt-3 lg:pt-4 lg:px-6 px-4">
                          <div className="relative flex items-center justify-center">
                            {/* Back button on left side for all screen sizes */}
                            <div className="absolute left-0 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  router.push('/#hero')
                                }}
                                className="hover:bg-primary/5 p-2.5 lg:p-1.5"
                              >
                                <ArrowLeft className="lg:w-6 lg:h-6 w-5 h-5" />
                              </Button>
                            </div>
                            {selectedTypeData && (
                              <CardTitle className="w-full text-center text-primary text-2xl font-bold">
                                {selectedTypeData.label}
                              </CardTitle>
                            )}
                          </div>
                        </CardHeader>
                      )}
                      <CardContent className="pt-0 flex-1 flex flex-col" style={{ paddingBottom: selectedType === 'register' ? '40px' : undefined, minWidth: 0, maxWidth: '100%', overflow: 'visible', boxSizing: 'border-box' }}>

                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="flex justify-center">
                      <CheckCircle className="h-20 w-20 text-green-600" />
                    </div>
                    <p className="text-gray-600 text-lg">
                      {selectedType === 'register' 
                        ? 'Your registration has been submitted successfully. Pending admin approval.'
                        : 'Form submitted successfully.'}
                    </p>
                  </div>
                ) : (
                <form onSubmit={handleSubmit} className="space-y-6" style={{ minWidth: 0, maxWidth: '100%', overflow: 'visible', boxSizing: 'border-box' }}>
                    {/* Error message */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-800">
                        {error}
                      </div>
                    )}

                    {/* Facility terms */}
                    {selectedType === 'facility' && (
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-xs space-y-2 break-words" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                        <h4 className="font-bold text-sm">TERMS AND CONDITIONS</h4>
                        <ul className="list-disc pl-4 space-y-1 text-gray-700 break-words">
                          <li>The facility/equipment shall be used exclusively for the approved purpose indicated in the request form.</li>
                          <li>The requestor is responsible for maintaining cleanliness, orderliness, and proper conduct within the facility at all times.</li>
                          <li>Any damage, loss, or misuse of barangay property shall be charged to the requestor, who will be held accountable for repair or replacement costs.</li>
                          <li>The Barangay reserves the right to cancel, deny, or reschedule the approved request at any time if the facility is required for official or emergency use.</li>
                          <li>The requestor shall strictly comply with all barangay rules, regulations, and safety protocols governing the use of the facility.</li>
                          <li>The Barangay shall not be held liable for any accidents, injuries, or loss of personal property that may occur during the use of the facility.</li>
                        </ul>
                      </div>
                    )}

                    {/* Name field - required for all forms except register */}
                    {selectedType !== 'register' && (
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
                          // Reset flag when user types
                          if (nameWasSelected && value !== formData.name) {
                            setNameWasSelected(false)
                            setSelectedResident(null)
                            setResidentPhotoUrl(null)
                            setSelectedResidentId(null)
                          }
                          // Clear resident info when name is cleared
                          if (!value) {
                            setSelectedResident(null)
                            setResidentPhotoUrl(null)
                          }
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                          if (residents.length > 0 && !nameWasSelected) setShowSuggestions(true)
                        }}
                        className="w-full max-w-full px-4 py-2.5 border border-border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        style={{ boxSizing: 'border-box' }}
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
                    )}

                    {/* Camera capture for registration */}
                    {selectedType === 'register' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-foreground">
                          Photo <span className="text-red-500">*</span>
                        </label>
                        
                        {!capturedPhoto && !isCameraOpen && (
                          <div 
                            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={openCamera}
                          >
                            <Camera className="h-12 w-12 text-gray-400 mb-3" />
                            <p className="text-sm text-gray-600">Click to take a photo of the resident</p>
                          </div>
                        )}

                        {isCameraOpen && (
                          <div className="space-y-3">
                            <div className="relative rounded-lg overflow-hidden bg-black">
                              <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-auto"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                onClick={capturePhoto}
                                className="flex-1"
                              >
                                <Camera className="h-4 w-4 mr-2" />
                                Capture Photo
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={closeCamera}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {capturedPhoto && (
                          <div className="space-y-3">
                            <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                              <img
                                src={capturedPhoto}
                                alt="Captured resident photo"
                                className="w-full h-auto"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={retakePhoto}
                                className="flex-1"
                              >
                                <Camera className="h-4 w-4 mr-2" />
                                Retake Photo
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={removePhoto}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                      </div>
                    )}

                    {/* Dynamic form fields based on selected type */}
                    {formFields.map((field) => (
                      <div key={field.id} className="space-y-2" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
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
                            className="w-full max-w-full px-4 py-2.5 border border-border rounded-md text-sm bg-background resize-vertical focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                            style={{ boxSizing: 'border-box', wordWrap: 'break-word', overflowWrap: 'break-word' }}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                          />
                        ) : field.type === 'select' ? (
                          <>
                          <select
                            id={field.id}
                            required={field.required}
                            value={formData[field.id] || (field.id === 'suffix' ? 'None' : '')}
                            onChange={(e) => handleInputChange(field.id, e.target.value === 'None' ? '' : e.target.value)}
                            className="w-full max-w-full px-4 py-2.5 pr-10 border border-border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                            style={{ boxSizing: 'border-box' }}
                          >
                            {field.id === 'suffix' ? null : <option value="">Select an option</option>}
                            {field.options?.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          {formData[field.id] === 'Other' && (
                            <textarea
                              id={`${field.id}Details`}
                              required
                              value={formData[`${field.id}Details`] || ''}
                              onChange={(e) => handleInputChange(`${field.id}Details`, e.target.value)}
                              rows={3}
                              className="w-full max-w-full px-4 py-2.5 border border-border rounded-md text-sm bg-background resize-vertical focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors mt-2"
                              style={{ boxSizing: 'border-box', wordWrap: 'break-word', overflowWrap: 'break-word' }}
                              placeholder="Please specify..."
                            />
                          )}
                          </>
                        ) : field.type === 'checkbox' ? (
                          <div className="flex items-center gap-2">
                            <input
                              id={field.id}
                              type="checkbox"
                              checked={formData[field.id] === 'true'}
                              onChange={(e) => handleInputChange(field.id, e.target.checked.toString())}
                              className="w-4 h-4 border border-border rounded focus:ring-2 focus:ring-primary"
                            />
                            <label htmlFor={field.id} className="text-sm">{'checkboxLabel' in field ? field.checkboxLabel : field.label}</label>
                          </div>
                        ) : (
                          <input
                            id={field.id}
                            type={field.type}
                            required={field.required}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            onClick={(e) => {
                              if (field.type === 'date' && (e.target as HTMLInputElement).showPicker) {
                                (e.target as HTMLInputElement).showPicker()
                              }
                            }}
                            className="w-full max-w-full px-4 py-2.5 border border-border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors cursor-pointer"
                            style={{ boxSizing: 'border-box' }}
                            placeholder={'placeholder' in field ? field.placeholder : `Enter ${field.label.toLowerCase()}`}
                            autoComplete={selectedType === 'register' ? 'off' : undefined}
                          />
                        )}
                      </div>
                    ))}

                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
                      <Button
                        type="submit"
                        disabled={
                          isSubmitting || 
                          (selectedType === 'register' && !capturedPhoto) ||
                          (selectedType !== 'register' && selectedResidentId !== null && (!residentPhotoUrl || imageError) && !capturedPhoto)
                        }
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
                          setNameQuery('')
                          setResidents([])
                          setShowSuggestions(false)
                          setNameWasSelected(false)
                          setSelectedResidentId(null)
                          setSelectedResident(null)
                          setResidentPhotoUrl(null)
                          setSelectedResidentIndex(-1)
                          setCapturedPhoto(null)
                          closeCamera()
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
                </div>

                {/* Resident Photo & Details Panel - Slides in from right */}
                <div 
                  className="hidden lg:block transition-all duration-500 ease-in-out flex-shrink-0"
                  style={{
                    width: selectedResident && selectedType !== 'register' && !submitted ? '400px' : '0px',
                    opacity: selectedResident && selectedType !== 'register' && !submitted ? 1 : 0,
                    overflow: 'hidden'
                  }}
                >
                  {selectedResident && selectedType !== 'register' && !submitted && (
                    <div className="w-[400px] h-full">
                      <Card className="bg-white/95 backdrop-blur-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/98 h-full flex flex-col">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold">Resident Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 flex-1 flex flex-col">
                        <div className="flex justify-center relative w-48 h-48 mx-auto">
                          {capturedPhoto ? (
                            <img 
                              src={capturedPhoto} 
                              alt="Captured photo"
                              className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                            />
                          ) : residentPhotoUrl && !imageError ? (
                            <>
                              {!imageLoaded && (
                                <div className="absolute inset-0 flex flex-col justify-center items-center bg-gray-100 rounded-lg border-2 border-gray-200">
                                  <User className="w-16 h-16 text-gray-400 mb-2" />
                                  <span className="text-gray-400 text-sm">Loading...</span>
                                </div>
                              )}
                              <img 
                                src={residentPhotoUrl} 
                                alt={`${selectedResident.first_name} ${selectedResident.last_name}`}
                                className={`w-48 h-48 object-cover rounded-lg border-2 border-gray-200 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
                                width={192}
                                height={192}
                                loading="eager"
                                decoding="async"
                                onLoad={() => setImageLoaded(true)}
                                onError={() => setImageError(true)}
                              />
                            </>
                          ) : (
                            <div 
                              className="flex flex-col justify-center items-center w-48 h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={openCamera}
                            >
                              <Camera className="w-12 h-12 text-gray-400 mb-2" />
                              <span className="text-gray-500 text-sm font-medium">Take Photo</span>
                              <span className="text-gray-400 text-xs mt-1">Click to open camera</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-semibold">Name:</span>{' '}
                            {selectedResident.first_name} {selectedResident.middle_name} {selectedResident.last_name} {selectedResident.suffix || ''}
                          </div>
                          {selectedResident.birthdate && (
                            <div>
                              <span className="font-semibold">Birthdate:</span>{' '}
                              {new Date(selectedResident.birthdate).toLocaleDateString()} 
                              {selectedResident.age && ` (Age: ${selectedResident.age})`}
                            </div>
                          )}
                          {selectedResident.gender && (
                            <div>
                              <span className="font-semibold">Gender:</span> {selectedResident.gender}
                            </div>
                          )}
                          {selectedResident.civil_status && (
                            <div>
                              <span className="font-semibold">Civil Status:</span> {selectedResident.civil_status}
                            </div>
                          )}
                          {selectedResident.citizenship && (
                            <div>
                              <span className="font-semibold">Citizenship:</span> {selectedResident.citizenship}
                            </div>
                          )}
                          {selectedResident.purok && (
                            <div>
                              <span className="font-semibold">Purok:</span> {selectedResident.purok}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                </div>
              </div>
              </div>
              
              {/* Mobile: Resident info card below form */}
              {selectedResident && selectedType !== 'register' && !submitted && (
                <div className="lg:hidden mt-6 mb-8">
                  <div className="flex justify-center">
                    <Card className="bg-white/95 backdrop-blur-lg shadow-2xl w-full max-w-full flex flex-col">
                    <CardHeader className="pb-2 px-4">
                      <CardTitle className="text-base font-semibold">Resident Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 flex-1 flex flex-col px-4 pb-4">
                      <div className="flex justify-center relative mx-auto flex-shrink-0" style={{ width: '128px', height: '128px', minWidth: '128px', minHeight: '128px' }}>
                        {capturedPhoto ? (
                          <img 
                            src={capturedPhoto} 
                            alt="Captured photo"
                            className="object-cover rounded-lg border-2 border-gray-200 flex-shrink-0"
                            style={{ width: '128px', height: '128px', minWidth: '128px', minHeight: '128px', maxWidth: '128px', maxHeight: '128px' }}
                          />
                        ) : residentPhotoUrl && !imageError ? (
                          <>
                            {!imageLoaded && (
                              <div className="absolute inset-0 flex flex-col justify-center items-center bg-gray-100 rounded-lg border-2 border-gray-200 flex-shrink-0" style={{ width: '128px', height: '128px', minWidth: '128px', minHeight: '128px' }}>
                                <User className="w-10 h-10 text-gray-400 mb-1" />
                                <span className="text-gray-400 text-xs">Loading...</span>
                              </div>
                            )}
                            <img 
                              src={residentPhotoUrl} 
                              alt={`${selectedResident.first_name} ${selectedResident.last_name}`}
                              className={`object-cover rounded-lg border-2 border-gray-200 flex-shrink-0 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
                              style={{ width: '128px', height: '128px', minWidth: '128px', minHeight: '128px', maxWidth: '128px', maxHeight: '128px' }}
                              width={128}
                              height={128}
                              loading="eager"
                              decoding="async"
                              onLoad={() => setImageLoaded(true)}
                              onError={() => setImageError(true)}
                            />
                          </>
                        ) : (
                          <div 
                            className="flex flex-col justify-center items-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex-shrink-0 cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ width: '128px', height: '128px', minWidth: '128px', minHeight: '128px' }}
                            onClick={openCamera}
                          >
                            <Camera className="w-8 h-8 text-gray-400 mb-1" />
                            <span className="text-gray-500 text-xs font-medium">Take Photo</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5 text-xs w-full">
                        <div className="break-words">
                          <span className="font-semibold">Name:</span>{' '}
                          {selectedResident.first_name} {selectedResident.middle_name} {selectedResident.last_name} {selectedResident.suffix || ''}
                        </div>
                        {selectedResident.birthdate && (
                          <div className="break-words">
                            <span className="font-semibold">Birthdate:</span>{' '}
                            {new Date(selectedResident.birthdate).toLocaleDateString()} 
                            {selectedResident.age && ` (Age: ${selectedResident.age})`}
                          </div>
                        )}
                        {selectedResident.gender && (
                          <div className="break-words">
                            <span className="font-semibold">Gender:</span> {selectedResident.gender}
                          </div>
                        )}
                        {selectedResident.civil_status && (
                          <div className="break-words">
                            <span className="font-semibold">Civil Status:</span> {selectedResident.civil_status}
                          </div>
                        )}
                        {selectedResident.citizenship && (
                          <div className="break-words">
                            <span className="font-semibold">Citizenship:</span> {selectedResident.citizenship}
                          </div>
                        )}
                        {selectedResident.purok && (
                          <div className="break-words">
                            <span className="font-semibold">Purok:</span> {selectedResident.purok}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Camera Modal */}
        {isCameraOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={closeCamera} style={{ alignItems: 'flex-start', paddingTop: '20vh' }}>
            <div className="relative bg-white rounded-lg p-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold">Take Photo</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={closeCamera}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden mb-3">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={capturePhoto}
                  className="flex-1"
                  size="sm"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeCamera}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        )}
      </main>
    </>
  )
}
