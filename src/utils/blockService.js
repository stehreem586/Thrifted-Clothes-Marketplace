import { supabase } from './supabaseClient';

export async function blockUser({ blockerId, blockedId }) {
  const { error } = await supabase
    .from('blocks')
    .insert([{ blocker_id: blockerId, blocked_id: blockedId }]);
  if (error && error.code !== '23505') throw error; // ignore "already blocked"
}

export async function unblockUser({ blockerId, blockedId }) {
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);
  if (error) throw error;
}

/** True if `blockerId` has blocked `otherId`, OR `otherId` has blocked `blockerId`. */
export async function isBlocked({ userId, otherId }) {
  const { data, error } = await supabase
    .from('blocks')
    .select('id')
    .or(
      `and(blocker_id.eq.${userId},blocked_id.eq.${otherId}),and(blocker_id.eq.${otherId},blocked_id.eq.${userId})`
    )
    .limit(1);
  if (error) throw error;
  return (data?.length || 0) > 0;
}
