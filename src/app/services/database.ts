import { supabase } from '../../../utils/supabase/client'; // shared singleton

// Database service for direct KV store access
class DatabaseService {
  // Generic get operation
  async get(key: string) {
    try {
      const { data, error } = await supabase
        .from('kv_store_45351b4f')
        .select('value')
        .eq('key', key)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data?.value;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  // Generic set operation
  async set(key: string, value: unknown) {
    try {
      const { error } = await supabase
        .from('kv_store_45351b4f')
        .upsert({ key, value }, { onConflict: 'key' });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      throw error;
    }
  }

  // Generic delete operation
  async delete(key: string) {
    try {
      const { error } = await supabase
        .from('kv_store_45351b4f')
        .delete()
        .eq('key', key);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
      throw error;
    }
  }

  // Get multiple keys with prefix
  async getByPrefix(prefix: string) {
    try {
      const { data, error } = await supabase
        .from('kv_store_45351b4f')
        .select('key, value')
        .like('key', `${prefix}%`);

      if (error) throw error;
      return data?.map(item => item.value) || [];
    } catch (error) {
      console.error(`Error getting keys with prefix ${prefix}:`, error);
      return [];
    }
  }

  // Get all keys matching pattern
  async getAll(pattern?: string) {
    try {
      let query = supabase
        .from('kv_store_45351b4f')
        .select('key, value');

      if (pattern) {
        query = query.like('key', pattern);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error getting all keys:`, error);
      return [];
    }
  }

  // Batch set operations
  async batchSet(items: Array<{ key: string; value: unknown }>) {
    try {
      const { error } = await supabase
        .from('kv_store_45351b4f')
        .upsert(items, { onConflict: 'key' });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error in batch set:`, error);
      throw error;
    }
  }

  // Batch delete operations
  async batchDelete(keys: string[]) {
    try {
      const { error } = await supabase
        .from('kv_store_45351b4f')
        .delete()
        .in('key', keys);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error in batch delete:`, error);
      throw error;
    }
  }
}

export const db = new DatabaseService();