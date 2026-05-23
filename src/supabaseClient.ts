import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mediaserver.tuplataformaweb.com';

const supabaseKey =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3ODU0MDA0MCwiZXhwIjo0OTM0MjEzNjQwLCJyb2xlIjoiYW5vbiJ9.qBlHdJpJ9jKWcy_BZkQi2XjyKYC1Rw6MpFkzXiXgXXo';

export const supabase = createClient(supabaseUrl, supabaseKey);
