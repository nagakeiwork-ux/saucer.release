import { supabase } from './supabase';

// 投稿を取得
export async function getPublicThoughts() {
  const { data, error } = await supabase
    .from('thoughts')
    .select(`
      *,
      profiles:user_id (
        display_name,
        avatar
      )
    `)
    .eq('is_private', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// プライベート書き留めを取得
export async function getPrivateNotes(userId: string) {
  const { data, error } = await supabase
    .from('thoughts')
    .select(`
      *,
      profiles:user_id (
        display_name,
        avatar
      )
    `)
    .eq('is_private', true)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// 投稿を作成
export async function createThought(
  userId: string,
  content: string,
  tags: string[] = [],
  isPrivate: boolean = false,
  allowReplies: boolean = false
) {
  const { data, error } = await supabase
    .from('thoughts')
    .insert({
      user_id: userId,
      content,
      tags,
      is_private: isPrivate,
      allow_replies: isPrivate ? false : allowReplies,
    })
    .select(`
      *,
      profiles:user_id (
        display_name,
        avatar
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

// 評価を追加
export async function addReaction(
  thoughtId: string,
  userId: string,
  reactionType: 'insight' | 'resonance' | 'thinking' | 'inspiration'
) {
  const { data, error } = await supabase
    .from('reactions')
    .insert({
      thought_id: thoughtId,
      user_id: userId,
      reaction_type: reactionType,
    });

  if (error) throw error;
  return data;
}

// 評価を削除
export async function removeReaction(
  thoughtId: string,
  userId: string,
  reactionType: 'insight' | 'resonance' | 'thinking' | 'inspiration'
) {
  const { error } = await supabase
    .from('reactions')
    .delete()
    .eq('thought_id', thoughtId)
    .eq('user_id', userId)
    .eq('reaction_type', reactionType);

  if (error) throw error;
}

// 投稿の評価数を取得
export async function getReactionCounts(thoughtId: string) {
  const { data, error } = await supabase
    .from('reactions')
    .select('reaction_type')
    .eq('thought_id', thoughtId);

  if (error) throw error;

  const counts = {
    insight: 0,
    resonance: 0,
    thinking: 0,
    inspiration: 0,
  };

  data.forEach((r) => {
    counts[r.reaction_type]++;
  });

  return counts;
}

// 返信を追加
export async function addReply(
  thoughtId: string,
  userId: string,
  content: string,
  parentReplyId?: string
) {
  const { data, error } = await supabase
    .from('replies')
    .insert({
      thought_id: thoughtId,
      user_id: userId,
      content,
      parent_reply_id: parentReplyId || null,
    })
    .select(`
      *,
      profiles:user_id (
        display_name,
        avatar
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

// 投稿の返信を取得
export async function getReplies(thoughtId: string) {
  const { data, error } = await supabase
    .from('replies')
    .select(`
      *,
      profiles:user_id (
        display_name,
        avatar
      )
    `)
    .eq('thought_id', thoughtId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// ブックマークを追加
export async function addBookmark(userId: string, thoughtId: string) {
  const { error } = await supabase.from('bookmarks').insert({
    user_id: userId,
    thought_id: thoughtId,
  });

  if (error) throw error;
}

// ブックマークを削除
export async function removeBookmark(userId: string, thoughtId: string) {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('thought_id', thoughtId);

  if (error) throw error;
}

// ユーザーのブックマークを取得
export async function getBookmarks(userId: string) {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('thought_id')
    .eq('user_id', userId);

  if (error) throw error;
  return data.map((b) => b.thought_id);
}

// 共鳴者を追加
export async function addResonator(userId: string, resonatorId: string) {
  const { error } = await supabase.from('resonators').insert({
    user_id: userId,
    resonator_id: resonatorId,
  });

  if (error) throw error;
}

// 共鳴者を削除
export async function removeResonator(userId: string, resonatorId: string) {
  const { error } = await supabase
    .from('resonators')
    .delete()
    .eq('user_id', userId)
    .eq('resonator_id', resonatorId);

  if (error) throw error;
}

// 共鳴者リストを取得
export async function getResonators(userId: string) {
  const { data, error } = await supabase
    .from('resonators')
    .select(`
      resonator_id,
      profiles:resonator_id (
        id,
        display_name,
        avatar,
        bio
      )
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}

// ============ 企業チャレンジ機能 ============

// チャレンジ一覧を取得
export async function getChallenges() {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('status', 'active')
    .order('deadline', { ascending: true });

  if (error) throw error;
  return data;
}

// チャレンジを作成
export async function createChallenge(
  userId: string,
  companyName: string,
  title: string,
  description: string,
  reward: number,
  deadline: string,
  category: string,
  companyLogo?: string
) {
  const { data, error } = await supabase
    .from('challenges')
    .insert({
      created_by: userId,
      company_name: companyName,
      company_logo: companyLogo,
      title,
      description,
      reward,
      deadline,
      category,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 提案を作成
export async function createProposal(
  userId: string,
  challengeId: string,
  content: string
) {
  const { data, error } = await supabase
    .from('proposals')
    .insert({
      user_id: userId,
      challenge_id: challengeId,
      content,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ユーザーの提案一覧を取得
export async function getUserProposals(userId: string) {
  const { data, error } = await supabase
    .from('proposals')
    .select(`
      *,
      challenges (
        company_name,
        title,
        reward
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// チャレンジの提案数を取得
export async function getProposalCount(challengeId: string) {
  const { count, error } = await supabase
    .from('proposals')
    .select('*', { count: 'exact', head: true })
    .eq('challenge_id', challengeId);

  if (error) throw error;
  return count || 0;
}

// ============ マッチング機能 ============

// マッチング候補を取得
export async function getMatchingSuggestions(userId: string) {
  const { data, error } = await supabase
    .from('matching_suggestions')
    .select(`
      *,
      profiles:suggested_user_id (
        id,
        display_name,
        avatar,
        bio
      )
    `)
    .eq('user_id', userId)
    .order('compatibility_score', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data;
}

// マッチング候補を生成（システム管理者用）
export async function generateMatchingSuggestion(
  userId: string,
  suggestedUserId: string,
  compatibilityScore: number,
  reason?: string
) {
  const { data, error } = await supabase
    .from('matching_suggestions')
    .insert({
      user_id: userId,
      suggested_user_id: suggestedUserId,
      compatibility_score: compatibilityScore,
      reason,
    });

  if (error) throw error;
  return data;
}

// いいねを送る
export async function sendLike(fromUserId: string, toUserId: string) {
  const { data, error } = await supabase
    .from('matching_likes')
    .insert({
      from_user_id: fromUserId,
      to_user_id: toUserId,
    });

  if (error) throw error;
  return data;
}

// いいねを削除
export async function removeLike(fromUserId: string, toUserId: string) {
  const { error } = await supabase
    .from('matching_likes')
    .delete()
    .eq('from_user_id', fromUserId)
    .eq('to_user_id', toUserId);

  if (error) throw error;
}

// マッチ一覧を取得
export async function getMatches(userId: string) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      user1:user1_id (
        id,
        display_name,
        avatar,
        bio
      ),
      user2:user2_id (
        id,
        display_name,
        avatar,
        bio
      )
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // 相手のプロフィールを抽出
  return data?.map((match) => {
    const partner = match.user1_id === userId ? match.user2 : match.user1;
    return {
      ...match,
      partner,
    };
  });
}

// メッセージを送信
export async function sendMessage(
  matchId: string,
  senderId: string,
  content: string
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      match_id: matchId,
      sender_id: senderId,
      content,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// メッセージ一覧を取得
export async function getMessages(matchId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:sender_id (
        id,
        display_name,
        avatar
      )
    `)
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// メッセージを既読にする
export async function markMessageAsRead(messageId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', messageId);

  if (error) throw error;
}
