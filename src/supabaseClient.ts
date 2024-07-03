// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://irxyqvsithjknuytafcl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyeHlxdnNpdGhqa251eXRhZmNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk2Mjk0NjAsImV4cCI6MjAzNTIwNTQ2MH0.eRSPYItLvtNcD-yCIaUeyX4c__e8S0wlyb_7rMqhnuw';

export const supabase = createClient(supabaseUrl, supabaseKey);
