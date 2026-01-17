import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for clearance submissions
export type ClearanceType = 
  | 'barangay'
  | 'business'
  | 'blotter'
  | 'facility'
  | 'good-moral'
  | 'indigency'
  | 'residency'

export interface ClearanceSubmission {
  id?: string
  clearance_type: ClearanceType
  name: string
  form_data: Record<string, any>
  status: 'pending' | 'processing' | 'approved' | 'rejected'
  created_at?: string
  updated_at?: string
}

export interface Resident {
  id: string
  last_name: string
  first_name: string
  middle_name: string | null
  birthdate: string | null
  age: number | null
  gender: string | null
  civil_status: string | null
  citizenship: string
  purok: string | null
}

// Submit a clearance form
export async function submitClearance(
  clearanceType: ClearanceType,
  name: string,
  formData: Record<string, any>
) {
  const { data, error } = await supabase
    .from('clearance_submissions')
    .insert({
      clearance_type: clearanceType,
      name: name,
      form_data: formData,
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Search residents by name
export async function searchResidents(query: string, limit = 10) {
  if (!query || query.length < 2) return []

  const { data, error } = await supabase
    .from('residents')
    .select('id, first_name, middle_name, last_name, purok, birthdate')
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    .limit(limit)

  if (error) {
    console.error('Error searching residents:', error)
    return []
  }

  return data || []
}

// Calculate age from birthdate
export function calculateAge(birthdate: string | null): number | null {
  if (!birthdate) return null
  
  const today = new Date()
  const birth = new Date(birthdate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}
