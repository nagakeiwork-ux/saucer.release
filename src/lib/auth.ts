import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatar: string | null;
}

// サインアップ
export async function signUp(email: string, password: string, displayName: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (authError) throw authError;

  // プロフィールを作成
  if (authData.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      display_name: displayName,
      avatar: getRandomAvatar(),
    });

    if (profileError) throw profileError;
  }

  return authData;
}

// ログイン
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// ログアウト
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// 現在のユーザーを取得
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return {
    id: user.id,
    email: user.email!,
    displayName: profile.display_name,
    avatar: profile.avatar,
  };
}

// 認証状態の変更を監視
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const user = await getCurrentUser();
      callback(user);
    } else {
      callback(null);
    }
  });
}

// ランダムアバターを取得
function getRandomAvatar(): string {
  const avatars = ['👤', '👨‍💼', '👩‍🎨', '👨‍🔬', '👩‍💻', '👨‍🎓', '👩‍⚕️', '👨‍🏫', '👩‍🚀', '👨‍🎤'];
  return avatars[Math.floor(Math.random() * avatars.length)];
}
