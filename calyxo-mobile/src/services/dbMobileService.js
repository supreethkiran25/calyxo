import { supabase } from '../config/supabase';

export const dbMobileService = {
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (err) {
      console.log('Mobile DB - getCurrentUser:', err.message);
      return null;
    }
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async fetchUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (err) {
      console.log('Mobile DB - fetchUserProfile:', err.message);
      return null;
    }
  },

  async fetchDailyLogs(userId, dateStr) {
    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', dateStr)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.log('Mobile DB - fetchDailyLogs:', err.message);
      return null;
    }
  }
};
