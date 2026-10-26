import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gdhcsezauozoaedmqjsq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_lG6opy2Hz0paamqqya7ClQ_5QXyw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);