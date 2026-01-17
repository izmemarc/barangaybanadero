'use client'

import { useEffect, useState, useRef } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, CheckCircle, XCircle, Clock, UserPlus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface Submission {
  id: string
  clearance_type: string
  name: string
  form_data: any
  status: string
  document_url?: string
  created_at: string
  processed_at?: string
  processed_by?: string
}

interface Registration {
  id: string
  first_name: string
  middle_name?: string
  last_name: string
  suffix?: string
  birthdate: string
  age?: number
  gender: string
  civil_status: string
  citizenship: string
  purok: string
  contact?: string
  status: string
  created_at: string
  processed_at?: string
  processed_by?: string
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('pending')
  const [activeTab, setActiveTab] = useState<'clearances' | 'registrations'>('clearances')
  const [generating, setGenerating] = useState<string | null>(null)
  const [removingRegistrations, setRemovingRegistrations] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const filterRef = useRef(filter)
  const activeTabRef = useRef(activeTab)

  // Keep refs in sync
  useEffect(() => {
    filterRef.current = filter
    activeTabRef.current = activeTab
  }, [filter, activeTab])

  // Initial fetch
  useEffect(() => {
    if (activeTab === 'clearances') {
      fetchSubmissions()
    } else {
      fetchRegistrations()
    }
  }, [filter, activeTab])

  // Real-time subscriptions
  useEffect(() => {
    let submissionsChannel: ReturnType<typeof supabase.channel> | null = null
    let registrationsChannel: ReturnType<typeof supabase.channel> | null = null

    console.log('[Realtime] Setting up subscriptions...')

    // Subscribe to clearance_submissions changes
    submissionsChannel = supabase
      .channel('clearance_submissions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clearance_submissions',
        },
        (payload) => {
          console.log('[Realtime] Clearance submission change detected:', payload)
          const currentFilter = filterRef.current
          const newRecord = payload.new as any
          const oldRecord = payload.old as any
          // Refresh if change matches current filter or if status changed (item moved between filters)
          if (currentFilter === 'all' || 
              newRecord?.status === currentFilter || 
              oldRecord?.status === currentFilter ||
              (oldRecord?.status !== newRecord?.status)) {
            if (activeTabRef.current === 'clearances') {
              console.log('[Realtime] Fetching submissions due to change')
              fetchSubmissions()
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Clearance submissions subscription status:', status)
      })

    // Subscribe to pending_registrations changes
    registrationsChannel = supabase
      .channel('pending_registrations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pending_registrations',
        },
        (payload) => {
          console.log('[Realtime] Registration change detected:', payload)
          const currentFilter = filterRef.current
          const newRecord = payload.new as any
          const oldRecord = payload.old as any
          // Refresh if change matches current filter or if status changed (item moved between filters)
          if (currentFilter === 'all' || 
              newRecord?.status === currentFilter || 
              oldRecord?.status === currentFilter ||
              (oldRecord?.status !== newRecord?.status)) {
            if (activeTabRef.current === 'registrations') {
              console.log('[Realtime] Fetching registrations due to change')
              fetchRegistrations()
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Registrations subscription status:', status)
      })

    return () => {
      console.log('[Realtime] Cleaning up subscriptions')
      if (submissionsChannel) {
        supabase.removeChannel(submissionsChannel)
      }
      if (registrationsChannel) {
        supabase.removeChannel(registrationsChannel)
      }
    }
  }, [])

  async function fetchSubmissions() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/submissions?status=${filter}`)
      const result = await response.json()

      if (!response.ok) throw new Error(result.error)

      setSubmissions(result.data || [])
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to load')
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchRegistrations() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/registrations?status=${filter}`)
      const result = await response.json()

      if (!response.ok) throw new Error(result.error)

      setRegistrations(result.data || [])
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to load')
      setRegistrations([])
    } finally {
      setLoading(false)
    }
  }

  async function generateDocument(submissionId: string) {
    setGenerating(submissionId)
    try {
      const response = await fetch('/api/admin/generate-clearance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, processedBy: 'Secretary' })
      })

      const result = await response.json()

      if (!response.ok) throw new Error(result.error)

      await fetchSubmissions()
      toast({
        title: 'Document generated',
        description: 'The clearance document has been generated successfully.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to generate document',
        description: 'An error occurred while generating the document. Please try again.',
      })
    } finally {
      setGenerating(null)
    }
  }

  async function updateStatus(submissionId: string, status: string) {
    try {
      const response = await fetch('/api/admin/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, status })
      })

      if (!response.ok) throw new Error()

      await fetchSubmissions()
      toast({
        title: 'Status updated',
        description: 'The submission has been rejected.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to update',
        description: 'An error occurred while updating the status. Please try again.',
      })
    }
  }

  async function approveRegistration(registrationId: string) {
    try {
      const response = await fetch('/api/admin/approve-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, processedBy: 'Secretary' })
      })

      if (!response.ok) throw new Error()

      // Mark for removal and animate out
      setRemovingRegistrations(prev => new Set(prev).add(registrationId))
      
      // Remove from list after animation
      setTimeout(() => {
        setRegistrations(prev => prev.filter(r => r.id !== registrationId))
        setRemovingRegistrations(prev => {
          const next = new Set(prev)
          next.delete(registrationId)
          return next
        })
      }, 300)

      toast({
        title: 'Registration approved',
        description: 'The resident has been added to the database.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to approve',
        description: 'An error occurred while approving the registration. Please try again.',
      })
    }
  }

  async function rejectRegistration(registrationId: string) {
    try {
      const response = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, status: 'rejected' })
      })

      if (!response.ok) throw new Error()

      // Mark for removal and animate out
      setRemovingRegistrations(prev => new Set(prev).add(registrationId))
      
      // Remove from list after animation
      setTimeout(() => {
        setRegistrations(prev => prev.filter(r => r.id !== registrationId))
        setRemovingRegistrations(prev => {
          const next = new Set(prev)
          next.delete(registrationId)
          return next
        })
      }, 300)

      toast({
        title: 'Registration rejected',
        description: 'The registration has been rejected.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to reject',
        description: 'An error occurred while rejecting the registration. Please try again.',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', icon: Clock },
      processing: { variant: 'default', icon: Clock },
      approved: { variant: 'default', icon: CheckCircle },
      rejected: { variant: 'destructive', icon: XCircle }
    }
    const config = variants[status] || variants.pending
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  return (
    <>
      <Header />
      <main style={{ paddingLeft: '5%', paddingRight: '5%', paddingTop: 'max(100px, min(20vh, 200px))', paddingBottom: '40px', minHeight: '100vh', overflow: 'visible' }}>
        <div className="w-full max-w-[1600px] mx-auto" style={{ overflow: 'visible' }}>
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <h1 className="font-black text-primary leading-none tracking-tight" style={{fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', marginBottom: 'clamp(0.5rem, 1vh, 0.75rem)'}}>
              Admin Panel
            </h1>
            <p className="text-gray-600 font-medium" style={{fontSize: 'clamp(0.875rem, 1.5vw, 1rem)'}}>
              Manage clearance requests and resident registrations
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 sm:mb-6 border-b border-gray-200">
            <button
              onClick={() => { setActiveTab('clearances'); setFilter('pending'); }}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold transition-colors border-b-2 text-sm sm:text-base ${
                activeTab === 'clearances' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="inline h-4 w-4 mr-2" />
              Clearances
            </button>
            <button
              onClick={() => { setActiveTab('registrations'); setFilter('pending'); }}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold transition-colors border-b-2 text-sm sm:text-base ${
                activeTab === 'registrations' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserPlus className="inline h-4 w-4 mr-2" />
              Registrations
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {['pending', 'approved', 'rejected', 'all'].map((f) => (
              <Button 
                key={f} 
                size="sm" 
                variant={filter === f ? 'default' : 'outline'} 
                onClick={() => setFilter(f)}
                className="min-w-[90px]"
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>

          {/* Content */}
          {loading && (
            <Card className="shadow-xl">
              <CardContent className="py-12 text-center text-muted-foreground">
                Loading...
              </CardContent>
            </Card>
          )}
          
          {error && !loading && (
            <Card className="mb-4 shadow-xl">
              <CardContent className="py-6 text-center">
                <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm mb-2">{error}</p>
                <Button size="sm" onClick={() => activeTab === 'clearances' ? fetchSubmissions() : fetchRegistrations()}>Retry</Button>
              </CardContent>
            </Card>
          )}

          {!loading && !error && activeTab === 'clearances' && (
            submissions.length === 0 ? (
              <Card className="shadow-xl">
                <CardContent className="py-12 text-center text-muted-foreground">
                  No submissions found
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <Card key={submission.id} className="shadow-xl hover:shadow-2xl transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                            <span className="truncate">{submission.name}</span>
                          </CardTitle>
                        </div>
                        <div className="flex-shrink-0">
                          {getStatusBadge(submission.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="mb-3 text-xs sm:text-sm text-muted-foreground">
                        <span className="font-semibold">Submitted:</span> {new Date(submission.created_at).toLocaleString()}
                      </div>
                      <details className="mb-4">
                        <summary className="cursor-pointer text-xs sm:text-sm font-semibold mb-2 hover:text-primary">View Details</summary>
                        <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-48 border">{JSON.stringify(submission.form_data, null, 2)}</pre>
                      </details>
                      <div className="flex gap-2 flex-wrap">
                        {submission.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => generateDocument(submission.id)} disabled={generating === submission.id}>
                              {generating === submission.id ? 'Generating...' : 'Generate Document'}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => updateStatus(submission.id, 'rejected')}>
                              Reject
                            </Button>
                          </>
                        )}
                        {submission.document_url && (
                          <Button size="sm" variant="outline" onClick={() => window.open(submission.document_url, '_blank')}>
                            <Download className="h-4 w-4 mr-1" />View Document
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}

          {!loading && !error && activeTab === 'registrations' && (
            registrations.length === 0 ? (
              <Card className="shadow-xl">
                <CardContent className="py-12 text-center text-muted-foreground">
                  No registrations found
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {registrations.map((registration) => (
                  <Card 
                    key={registration.id} 
                    className={`shadow-xl hover:shadow-2xl transition-all duration-300 ${
                      removingRegistrations.has(registration.id) 
                        ? 'opacity-0 -translate-y-4 scale-95 pointer-events-none' 
                        : 'opacity-100 translate-y-0 scale-100'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                            <span className="truncate">{registration.first_name} {registration.middle_name} {registration.last_name} {registration.suffix}</span>
                          </CardTitle>
                        </div>
                        <div className="flex-shrink-0">
                          {getStatusBadge(registration.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4 text-xs sm:text-sm">
                        <div><span className="font-semibold">Birthdate:</span> {registration.birthdate} (Age: {registration.age})</div>
                        <div><span className="font-semibold">Gender:</span> {registration.gender}</div>
                        <div><span className="font-semibold">Civil Status:</span> {registration.civil_status}</div>
                        <div><span className="font-semibold">Purok:</span> {registration.purok}</div>
                        {registration.contact && <div><span className="font-semibold">Contact:</span> {registration.contact}</div>}
                        <div><span className="font-semibold">Submitted:</span> {new Date(registration.created_at).toLocaleString()}</div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {registration.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => approveRegistration(registration.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" />Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => rejectRegistration(registration.id)}>
                              <XCircle className="h-4 w-4 mr-1" />Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}
        </div>
      </main>
    </>
  )
}
