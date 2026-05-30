-- Idea Pocket 完全版データベースセットアップ
-- 企業チャレンジ＋マッチング機能を含む
-- Supabase SQL Editor で実行してください

-- 基本テーブル (SETUP_DATABASE.sqlと同じ)

-- 1. プロフィールテーブル
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  display_name text NOT NULL,
  avatar text,
  bio text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 2. 投稿テーブル
CREATE TABLE IF NOT EXISTS thoughts (
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
CREATE TABLE IF NOT EXISTS reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thought_id uuid REFERENCES thoughts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('insight', 'resonance', 'thinking', 'inspiration')),
  created_at timestamp DEFAULT now(),
  UNIQUE(thought_id, user_id, reaction_type)
);

-- 4. 返信テーブル
CREATE TABLE IF NOT EXISTS replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thought_id uuid REFERENCES thoughts(id) ON DELETE CASCADE,
  parent_reply_id uuid REFERENCES replies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) <= 500),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 5. ブックマークテーブル
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  thought_id uuid REFERENCES thoughts(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, thought_id)
);

-- 6. 共鳴者テーブル
CREATE TABLE IF NOT EXISTS resonators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  resonator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, resonator_id),
  CHECK (user_id != resonator_id)
);

-- 新規: 企業チャレンジ機能

-- 7. 企業チャレンジテーブル
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  company_logo text,
  title text NOT NULL CHECK (char_length(title) <= 100),
  description text NOT NULL CHECK (char_length(description) <= 1000),
  reward integer NOT NULL CHECK (reward >= 0),
  deadline date NOT NULL,
  category text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'closed', 'completed')),
  created_by uuid REFERENCES profiles(id),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 8. チャレンジへの提案テーブル
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) <= 2000),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'rewarded')),
  reward integer,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- 新規: マッチング機能

-- 9. マッチング候補テーブル (システムが生成)
CREATE TABLE IF NOT EXISTS matching_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  suggested_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  compatibility_score integer CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  reason text,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, suggested_user_id),
  CHECK (user_id != suggested_user_id)
);

-- 10. マッチングテーブル (相互いいね)
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id) -- 重複防止
);

-- 11. マッチングへの「いいね」
CREATE TABLE IF NOT EXISTS matching_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  UNIQUE(from_user_id, to_user_id),
  CHECK (from_user_id != to_user_id)
);

-- 12. マッチング後のメッセージ
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) <= 1000),
  is_read boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_thoughts_user ON thoughts(user_id);
CREATE INDEX IF NOT EXISTS idx_thoughts_created ON thoughts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_thoughts_private ON thoughts(is_private);
CREATE INDEX IF NOT EXISTS idx_reactions_thought ON reactions(thought_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_replies_thought ON replies(thought_id);
CREATE INDEX IF NOT EXISTS idx_replies_parent ON replies(parent_reply_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_resonators_user ON resonators(user_id);

-- 新規インデックス
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_deadline ON challenges(deadline);
CREATE INDEX IF NOT EXISTS idx_proposals_challenge ON proposals(challenge_id);
CREATE INDEX IF NOT EXISTS idx_proposals_user ON proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_matching_suggestions_user ON matching_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matching_likes_from ON matching_likes(from_user_id);
CREATE INDEX IF NOT EXISTS idx_matching_likes_to ON matching_likes(to_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- Row Level Security (RLS) ポリシー

-- 基本テーブルのRLS (既存)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE resonators ENABLE ROW LEVEL SECURITY;

-- プロフィール
CREATE POLICY IF NOT EXISTS "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 投稿
CREATE POLICY IF NOT EXISTS "Public thoughts are viewable by everyone"
  ON thoughts FOR SELECT
  USING (
    is_private = false
    OR (is_private = true AND auth.uid() = user_id)
  );

CREATE POLICY IF NOT EXISTS "Users can create thoughts"
  ON thoughts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own thoughts"
  ON thoughts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own thoughts"
  ON thoughts FOR DELETE
  USING (auth.uid() = user_id);

-- 評価
CREATE POLICY IF NOT EXISTS "Reactions are viewable for public thoughts"
  ON reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM thoughts
      WHERE thoughts.id = reactions.thought_id
      AND thoughts.is_private = false
    )
  );

CREATE POLICY IF NOT EXISTS "Users can add reactions to public thoughts"
  ON reactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM thoughts
      WHERE thoughts.id = reactions.thought_id
      AND thoughts.is_private = false
    )
  );

CREATE POLICY IF NOT EXISTS "Users can delete own reactions"
  ON reactions FOR DELETE
  USING (auth.uid() = user_id);

-- 返信
CREATE POLICY IF NOT EXISTS "Replies are viewable by everyone"
  ON replies FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Users can reply to allowed thoughts only"
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

CREATE POLICY IF NOT EXISTS "Users can update own replies"
  ON replies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own replies"
  ON replies FOR DELETE
  USING (auth.uid() = user_id);

-- ブックマーク
CREATE POLICY IF NOT EXISTS "Users can manage own bookmarks"
  ON bookmarks FOR ALL
  USING (auth.uid() = user_id);

-- 共鳴者
CREATE POLICY IF NOT EXISTS "Users can view own resonators"
  ON resonators FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can manage own resonators"
  ON resonators FOR ALL
  USING (auth.uid() = user_id);

-- 新規: チャレンジのRLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges are viewable by everyone"
  ON challenges FOR SELECT
  USING (true);

CREATE POLICY "Only admins can create challenges"
  ON challenges FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    -- 将来的に企業アカウントの権限チェックを追加
  );

CREATE POLICY "Challenge creators can update their challenges"
  ON challenges FOR UPDATE
  USING (auth.uid() = created_by);

-- 提案のRLS
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Proposals are viewable by creator and proposer"
  ON proposals FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() IN (
      SELECT created_by FROM challenges WHERE id = proposals.challenge_id
    )
  );

CREATE POLICY "Users can create proposals"
  ON proposals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own proposals"
  ON proposals FOR UPDATE
  USING (auth.uid() = user_id);

-- マッチング候補のRLS
ALTER TABLE matching_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own suggestions"
  ON matching_suggestions FOR SELECT
  USING (auth.uid() = user_id);

-- マッチングいいねのRLS
ALTER TABLE matching_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view likes they sent or received"
  ON matching_likes FOR SELECT
  USING (
    auth.uid() = from_user_id
    OR auth.uid() = to_user_id
  );

CREATE POLICY "Users can create likes"
  ON matching_likes FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can delete own likes"
  ON matching_likes FOR DELETE
  USING (auth.uid() = from_user_id);

-- マッチのRLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own matches"
  ON matches FOR SELECT
  USING (
    auth.uid() = user1_id
    OR auth.uid() = user2_id
  );

-- メッセージのRLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their matches"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their matches"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

-- トリガー: updated_at自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_thoughts_updated_at BEFORE UPDATE ON thoughts
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_replies_updated_at BEFORE UPDATE ON replies
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_challenges_updated_at BEFORE UPDATE ON challenges
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_proposals_updated_at BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- マッチング自動生成トリガー
CREATE OR REPLACE FUNCTION create_match_on_mutual_like()
RETURNS TRIGGER AS $$
BEGIN
  -- 相互いいねが成立したらマッチを作成
  IF EXISTS (
    SELECT 1 FROM matching_likes
    WHERE from_user_id = NEW.to_user_id
    AND to_user_id = NEW.from_user_id
  ) THEN
    -- マッチを作成 (小さいIDを先に)
    INSERT INTO matches (user1_id, user2_id)
    VALUES (
      LEAST(NEW.from_user_id, NEW.to_user_id),
      GREATEST(NEW.from_user_id, NEW.to_user_id)
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS matching_trigger
  AFTER INSERT ON matching_likes
  FOR EACH ROW
  EXECUTE FUNCTION create_match_on_mutual_like();

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

CREATE TRIGGER IF NOT EXISTS reaction_rate_limit
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

CREATE TRIGGER IF NOT EXISTS thought_rate_limit
  BEFORE INSERT ON thoughts
  FOR EACH ROW
  EXECUTE FUNCTION check_thought_rate_limit();

-- Rate Limiting: 提案のスパム防止
CREATE OR REPLACE FUNCTION check_proposal_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM proposals
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '1 hour';

  IF recent_count >= 5 THEN
    RAISE EXCEPTION '提案は1時間に5回までです。';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS proposal_rate_limit
  BEFORE INSERT ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION check_proposal_rate_limit();

-- サンプルデータ: チャレンジ (オプション)
-- 管理者として実行してください
/*
INSERT INTO challenges (company_name, company_logo, title, description, reward, deadline, category)
VALUES
  ('Tech Innovation株式会社', '🏢', 'リモートワーク時代の新しいコミュニケーションツール',
   'オンラインでも対面のような温かみのあるコミュニケーションを実現するアイデアを募集しています。',
   50000, CURRENT_DATE + INTERVAL '30 days', 'テクノロジー'),
  ('Green Future株式会社', '🌱', '日常生活で実践できるサステナブルな行動',
   '誰でも簡単に始められる環境に優しい生活習慣やサービスのアイデアを求めています。',
   30000, CURRENT_DATE + INTERVAL '20 days', '環境'),
  ('Health Plus株式会社', '💊', '高齢者の健康管理をサポートする仕組み',
   'テクノロジーに不慣れな高齢者でも使いやすい健康管理サービスのアイデアを募集中。',
   80000, CURRENT_DATE + INTERVAL '45 days', 'ヘルスケア');
*/

-- 完了
SELECT 'Full database setup complete!' as status;
