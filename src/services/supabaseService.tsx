import { createClient } from '../../utils/supabase/client';

const supabase = createClient();

// ========== プロフィール ==========

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
export async function canChangeName(userId: string) {
  const { data, error } = await supabase.rpc('can_change_name', { user_id: userId });

  if (error) throw error;
  return data as boolean;
}

export async function getNameChangeInfo(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('name_change_count, last_name_change_at')
    .eq('id', userId)
    .single();

  if (error) throw error;

  const count = data?.name_change_count || 0;
  const lastChange = data?.last_name_change_at;

  // 1ヶ月以上経過していればカウントは0扱い
  const isExpired = !lastChange || new Date(lastChange) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const remainingChanges = isExpired ? 5 : Math.max(0, 5 - count);

  return {
    count: isExpired ? 0 : count,
    remainingChanges,
    lastChange: lastChange ? new Date(lastChange) : null,
    canChange: remainingChanges > 0
  };
}

export async function updateDisplayName(userId: string, newName: string) {
  // 名前変更可能かチェック
  const canChange = await canChangeName(userId);

  if (!canChange) {
    throw new Error('今月の名前変更回数の上限（5回）に達しています。来月まで変更できません。');
  }

  // 名前を更新（トリガーが自動的にカウントを更新）
  const { data, error } = await supabase
    .from('profiles')
    .update({ display_name: newName })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
// ========== 投稿 ==========

export async function getThoughts(filters?: { tags?: string[]; userId?: string }) {
  let query = supabase
    .from('thoughts')
    .select(`
      *,
      profiles:user_id (id, display_name, avatar, registration_number),
      reactions (id, reaction_type, user_id)
    `)
    .eq('is_private', false)
    .order('created_at', { ascending: false })
    .limit(100);

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getThought(thoughtId: string) {
  const { data, error } = await supabase
    .from('thoughts')
    .select(`
      *,
      profiles:user_id (id, display_name, avatar, registration_number),
      reactions (id, reaction_type, user_id),
      replies (
        *,
        profiles:user_id (id, display_name, avatar)
      )
    `)
    .eq('id', thoughtId)
    .single();

  if (error) throw error;
  return data;
}

export async function createThought(thought: {
  content: string;
  tags?: string[];
  is_private?: boolean;
  allow_replies?: boolean;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('thoughts')
    .insert({
      user_id: user.id,
      ...thought,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteThought(thoughtId: string) {
  const { error } = await supabase
    .from('thoughts')
    .delete()
    .eq('id', thoughtId);

  if (error) throw error;
}

// ========== リアクション ==========

export async function addReaction(thoughtId: string, reactionType: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('reactions')
    .insert({
      thought_id: thoughtId,
      user_id: user.id,
      reaction_type: reactionType,
    })
    .select()
    .single();

  if (error) {
    // 既に評価済みの場合はエラーを無視
    if (error.code === '23505') {
      return null;
    }
    throw error;
  }
  return data;
}

export async function removeReaction(thoughtId: string, reactionType: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('reactions')
    .delete()
    .eq('thought_id', thoughtId)
    .eq('user_id', user.id)
    .eq('reaction_type', reactionType);

  if (error) throw error;
}

// ========== 返信 ==========

export async function createReply(thoughtId: string, content: string, parentReplyId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('replies')
    .insert({
      thought_id: thoughtId,
      parent_reply_id: parentReplyId,
      user_id: user.id,
      content,
    })
    .select(`
      *,
      profiles:user_id (id, display_name, avatar)
    `)
    .single();

  if (error) throw error;
  return data;
}

// ========== ブックマーク ==========

export async function getBookmarks() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      *,
      thoughts (
        *,
        profiles:user_id (id, display_name, avatar, registration_number),
        reactions (id, reaction_type, user_id)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addBookmark(thoughtId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('bookmarks')
    .insert({
      user_id: user.id,
      thought_id: thoughtId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return null;
    throw error;
  }
  return data;
}

export async function removeBookmark(thoughtId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', user.id)
    .eq('thought_id', thoughtId);

  if (error) throw error;
}

// ========== フォロー ==========

export async function getFollowing() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('follows')
    .select(`
      *,
      profiles:following_id (
        id,
        display_name,
        avatar,
        bio,
        registration_number,
        created_at
      )
    `)
    .eq('follower_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function followUser(userId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('follows')
    .insert({
      follower_id: user.id,
      following_id: userId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return null;
    throw error;
  }
  return data;
}

export async function unfollowUser(userId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', userId);

  if (error) throw error;
}
