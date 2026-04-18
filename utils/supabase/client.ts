// utils/supabase/client.ts
// ─────────────────────────────────────────────────────────────────────────────
// ONE shared Supabase client for the entire app.
// Import this everywhere instead of calling createClient() yourself.
// Having multiple GoTrueClient instances causes them to fight over the same
// localStorage key and return stale/empty sessions to each other.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

// Module-level singleton — created once, reused everywhere
export const supabase: SupabaseClient = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: `sb-${projectId}-auth-token`, // explicit key prevents collisions
  },
});