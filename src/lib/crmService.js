import { isMockFirebase } from './dbService';
import { supabase } from './supabaseClient';

/* ==========================================================================
   TRAINER CRM & CONNECTION API
   ========================================================================== */

export const fetchTrainerClients = async (trainerId) => {
  if (isMockFirebase || !trainerId) return [];
  try {
    const { data, error } = await supabase
      .from("pt_connections")
      .select(`
        id,
        user_id,
        status,
        user_profiles!user_id (
          id,
          full_name,
          username,
          goal
        )
      `)
      .eq("trainer_id", trainerId);
    
    if (error) throw error;
    
    // Normalize data structure
    return data.map(item => ({
      connectionId: item.id,
      clientId: item.user_id,
      name: item.user_profiles?.full_name || 'Unknown',
      username: item.user_profiles?.username || '',
      goal: item.user_profiles?.goal || '',
      status: item.status === 'active' ? 'ACTIVE' : 'PENDING'
    }));
  } catch (err) {
    console.error("fetchTrainerClients error:", err?.message || JSON.stringify(err));
    return [];
  }
};

export const inviteClientByUsernameOrEmail = async (trainerId, identifier) => {
  if (isMockFirebase || !trainerId) return { error: "Local DB only" };
  try {
    // 1. Find the user
    let query = supabase.from("user_profiles").select("id").limit(1);
    if (identifier.includes("@")) {
      return { error: "Email search not implemented via client securely yet. Please search by Username." };
    } else {
      query = query.eq("username", identifier.replace("@", ""));
    }
    
    const { data: users, error: searchError } = await query;
    if (searchError) throw searchError;
    if (!users || users.length === 0) return { error: "User not found" };
    
    const clientId = users[0].id;

    // 2. Insert into pt_connections as pending
    const { data, error } = await supabase
      .from("pt_connections")
      .insert({
        trainer_id: trainerId,
        user_id: clientId,
        status: 'pending'
      })
      .select();
      
    if (error) {
      if (error.code === '23505') return { error: "Client is already connected or pending." };
      throw error;
    }
    return { success: true, data };
  } catch (err) {
    console.error("inviteClient error", err);
    return { error: err.message };
  }
};

export const fetchClientTrainerRequests = async (clientId) => {
  if (isMockFirebase || !clientId) return [];
  try {
    const { data, error } = await supabase
      .from("pt_connections")
      .select(`
        id,
        trainer_id,
        status,
        trainer_profiles!trainer_id (
          id,
          full_name,
          username
        )
      `)
      .eq("user_id", clientId);
      
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("fetchClientTrainerRequests error", err);
    return [];
  }
};

export const respondToTrainerRequest = async (connectionId, accept) => {
  if (isMockFirebase) return { success: true };
  try {
    if (accept) {
      const { error } = await supabase
        .from("pt_connections")
        .update({
          status: 'active'
        })
        .eq("id", connectionId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("pt_connections")
        .delete()
        .eq("id", connectionId);
      if (error) throw error;
    }
    return { success: true };
  } catch (err) {
    console.error("respondToTrainerRequest error", err);
    return { error: err.message };
  }
};
