import {createClient} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Database} from '../../types/database';

const SUPABASE_URL = 'https://vwdbtylahnqhxzskxftd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3ZGJ0eWxhaG5xaHh6c2t4ZnRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5ODA4NDgsImV4cCI6MjA1ODU1Njg0OH0.PR8DgOnu9maDV0txJ61laQw6LpQdaalTgsuPjlbtWNs';

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);