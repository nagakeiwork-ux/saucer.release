-- Idea Pocket データベースセットアップ
-- Supabase SQL Editor で実行してください

-- 1. プロフィールテーブル
CREATE TABLE profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  display_name text NOT NULL,
  avatar text,
  bio text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 2. 投稿テーブル
CREATE TABLE thoughts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) <= 500),
  tags text[],
  is_private boolean DEFAULT false,
  allow_replies boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 3. 評価テーブル
CREATE TABLE reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thought_id uuid REFERENCES thoughts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('insight', 'resonance', 'thinking', 'inspiration')),
  created_at timestamp DEFAULT now(),
  UNIQUE(thought_id, user_id, reaction_type)
);

-- 4. 返信テーブル
CREATE TABLE replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thought_id uuid REFERENCES thoughts(id) ON DELETE CASCADE,
  parent_reply_id uuid REFERENCES replies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) <= 500),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 5. ブックマークテーブル
CREATE TABLE bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  thought_id uuid REFERENCES thoughts(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, thought_id)
);

-- 6. 共鳴者テーブル
CREATE TABLE resonators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  resonator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, resonator_id),
  CHECK (user_id != resonator_id)
);

-- インデックス作成
CREATE INDEX idx_thoughts_user ON thoughts(user_id);
CREATE INDEX idx_thoughts_created ON thoughts(created_at DESC);
CREATE INDEX idx_thoughts_private ON thoughts(is_private);
CREATE INDEX idx_reactions_thought ON reactions(thought_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);
CREATE INDEX idx_replies_thought ON replies(thought_id);
CREATE INDEX idx_replies_parent ON replies(parent_reply_id);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_resonators_user ON resonators(user_id);

-- Row Level Security (RLS) ポリシー

-- プロフィール
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 投稿
ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public thoughts are viewable by everyone"
  ON thoughts FOR SELECT
  USING (
    is_private = false
    OR (is_private = true AND auth.uid() = user_id)
  );

CREATE POLICY "Users can create thoughts"
  ON thoughts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own thoughts"
  ON thoughts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own thoughts"
  ON thoughts FOR DELETE
  USING (auth.uid() = user_id);

-- 評価
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions are viewable for public thoughts"
  ON reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM thoughts
      WHERE thoughts.id = reactions.thought_id
      AND thoughts.is_private = false
    )
  );

CREATE POLICY "Users can add reactions to public thoughts"
  ON reactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM thoughts
      WHERE thoughts.id = reactions.thought_id
      AND thoughts.is_private = false
    )
  );

CREATE POLICY "Users can delete own reactions"
  ON reactions FOR DELETE
  USING (auth.uid() = user_id);

-- 返信
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Replies are viewable by everyone"
  ON replies FOR SELECT
  USING (true);

CREATE POLICY "Users can reply to allowed thoughts only"
  ON replies FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM thoughts
      WHERE thoughts.id = replies.thought_id
      AND thoughts.allow_replies = true
      AND thoughts.is_private = false
    )
  );

CREATE POLICY "Users can update own replies"
  ON replies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own replies"
  ON replies FOR DELETE
  USING (auth.uid() = user_id);

-- ブックマーク
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bookmarks"
  ON bookmarks FOR ALL
  USING (auth.uid() = user_id);

-- 共鳴者
ALTER TABLE resonators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resonators"
  ON resonators FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own resonators"
  ON resonators FOR ALL
  USING (auth.uid() = user_id);

-- トリガー: updated_at自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_thoughts_updated_at BEFORE UPDATE ON thoughts
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_replies_updated_at BEFORE UPDATE ON replies
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Rate Limiting: 評価のスパム防止
CREATE OR REPLACE FUNCTION check_reaction_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM reactions
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '1 minute';

  IF recent_count >= 10 THEN
    RAISE EXCEPTION '評価の頻度が高すぎます。少し時間をおいてください。';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reaction_rate_limit
  BEFORE INSERT ON reactions
  FOR EACH ROW
  EXECUTE FUNCTION check_reaction_rate_limit();

-- Rate Limiting: 投稿のスパム防止
CREATE OR REPLACE FUNCTION check_thought_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM thoughts
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '1 minute';

  IF recent_count >= 1 THEN
    RAISE EXCEPTION '投稿は1分間に1回までです。';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER thought_rate_limit
  BEFORE INSERT ON thoughts
  FOR EACH ROW
  EXECUTE FUNCTION check_thought_rate_limit();

-- 完了
SELECT 'Database setup complete!' as status;
