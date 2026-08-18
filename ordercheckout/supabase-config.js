// ATHAQ DATES - Supabase Configuration
// IMPORTANT: This file is safe to use in frontend code with the anon/publishable key.
// Never put the Supabase service_role/secret key here.

const ATHAQ_SUPABASE_URL = "https://bqgjphfokruwobyxqycv.supabase.co";
const ATHAQ_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxZ2pwaGZva3J1d29ieXhxeWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3OTIxNDUsImV4cCI6MjEwMjM2ODE0NX0.M2AMyWngrDTb3AKiAN-7_TgazdBE1sWQVYsT6HFy3lE";

window.ATHAQ_SUPABASE = window.supabase.createClient(
    ATHAQ_SUPABASE_URL,
    ATHAQ_SUPABASE_ANON_KEY
);
