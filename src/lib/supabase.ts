import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://wccusmvgfsbplwqlalkb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjY3VzbXZnZnNicGx3cWxhbGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzODgxODIsImV4cCI6MjA4OTk2NDE4Mn0.JhBNmMiIObwr0SL5JTcbTbnPBgsRei66mIOcjMceybU";

export const supabase = createClient(supabaseUrl, supabaseKey);