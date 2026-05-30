import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const hasCredentials = supabaseUrl && supabaseAnonKey;

if (!hasCredentials) {
  console.warn('⚠️ Supabase credentials not found. Running in demo mode.');
  console.warn('To enable database features, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local');
}

export const supabase = hasCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://demo.supabase.co', 'demo-anon-key');

// 型定義
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar?: string | null;
          bio?: string | null;
          created_at?: string;
        };
        Update: {
          display_name?: string;
          avatar?: string | null;
          bio?: string | null;
        };
      };
      thoughts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          tags: string[] | null;
          is_private: boolean;
          allow_replies: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          content: string;
          tags?: string[] | null;
          is_private?: boolean;
          allow_replies?: boolean;
        };
        Update: {
          content?: string;
          tags?: string[] | null;
          is_private?: boolean;
          allow_replies?: boolean;
        };
      };
      reactions: {
        Row: {
          id: string;
          thought_id: string;
          user_id: string;
          reaction_type: 'insight' | 'resonance' | 'thinking' | 'inspiration';
          created_at: string;
        };
        Insert: {
          thought_id: string;
          user_id: string;
          reaction_type: 'insight' | 'resonance' | 'thinking' | 'inspiration';
        };
      };
      replies: {
        Row: {
          id: string;
          thought_id: string;
          parent_reply_id: string | null;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          thought_id: string;
          parent_reply_id?: string | null;
          user_id: string;
          content: string;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          thought_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          thought_id: string;
        };
      };
      resonators: {
        Row: {
          id: string;
          user_id: string;
          resonator_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          resonator_id: string;
        };
      };
    };
  };
}
