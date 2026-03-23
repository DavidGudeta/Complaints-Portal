import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wgxohuugcinzlqzeldys.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndneG9odXVnY2luemxxemVsZHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTA2MjMsImV4cCI6MjA4OTI2NjYyM30.lSDfMDxMpfBbU94eNttRXKf7lsOsfQ_1n0yqB_Hl4S8';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
