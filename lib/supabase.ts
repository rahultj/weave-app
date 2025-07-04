import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './database.types'

// Export the client instance directly
export const supabase = createClientComponentClient<Database>()

// Keep function export for any components that might need it
export const createClient = () => createClientComponentClient<Database>()