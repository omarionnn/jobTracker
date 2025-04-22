import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cawooyjfdgreooxjryhg.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhd29veWpmZGdyZW9veGpyeWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMDg2ODcsImV4cCI6MjA2MDc4NDY4N30.GgHJeQqdS6LLcexwBQfc0EYi46PcRJ4cpChJN3EXbPM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);