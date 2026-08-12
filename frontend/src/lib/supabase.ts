import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eszksuagxvqgryweiwtn.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzemtzdWFneHZxZ3J5d2Vpd3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MTYyOTMsImV4cCI6MjEwMjA5MjI5M30.fVOkfjFmQ8yBgwTIE8ttW_79ZYEOjQkw55Xbu5L0_UQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
