// app/lib/supabase.js - Supabase client for app directory
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://clolnikizfjkvhgjfxce.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsb2xuaWtpemZqa3ZoZ2pmeGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzOTkwMjMsImV4cCI6MjA1Nzk3NTAyM30.FxkqpedcFri4G2pJS_EVVlvJbhGKAHaNvtkCIftPfTo';

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseKey); 