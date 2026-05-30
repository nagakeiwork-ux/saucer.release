# データベーススキーマ更新（評価・返信・プライベートメモ機能追加）

評価機能、ツリー機能（返信）、プライベートな書き留め機能を追加するためのデータベース変更内容です。

## 追加するテーブル

### 1. reactions（評価テーブル）

投稿に対する4種類の評価を記録します：
- **気づき (insight)**: 新しい視点や発見があった
- **共感 (resonance)**: 心に響いた、同じように感じた
- **考察 (thinking)**: 深く考えさせられた
- **刺激的 (inspiration)**: インスピレーションを得た

```sql
CREATE TABLE reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thought_id uuid REFERENCES thoughts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type text NOT NULL, -- 'insight', 'resonance', 'thinking', 'inspiration'
  created_at timestamp DEFAULT now(),
  UNIQUE(thought_id, user_id, reaction_type)
);

-- インデックス
CREATE INDEX idx_reactions_thought ON reactions(thought_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);
```

### 2. replies（返信テーブル）

投稿に対する返信・ツリー構造を実現します。

```sql
CREATE TABLE replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thought_id uuid REFERENCES thoughts(id) ON DELETE CASCADE,
  parent_reply_id uuid REFERENCES replies(id) ON DELETE CASCADE, -- 返信への返信の場合
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- インデックス
CREATE INDEX idx_replies_thought ON replies(thought_id);
CREATE INDEX idx_replies_parent ON replies(parent_reply_id);
CREATE INDEX idx_replies_user ON replies(user_id);
```

## Row Level Security (RLS) ポリシー

### reactions テーブル

```sql
-- 公開投稿の評価のみ閲覧可能
CREATE POLICY "reactions are viewable for public thoughts"
  ON reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM thoughts
      WHERE thoughts.id = reactions.thought_id
      AND thoughts.is_private = false
    )
  );

-- 公開投稿にのみ評価を追加可能
CREATE POLICY "users can add reactions to public thoughts"
  ON reactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM thoughts
      WHERE thoughts.id = reactions.thought_id
      AND thoughts.is_private = false
    )
  );

-- 自分の評価のみ削除可能
CREATE POLICY "users can delete their own reactions"
  ON reactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLSを有効化
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
```

### replies テーブル

```sql
-- 誰でも返信を閲覧可能
CREATE POLICY "replies are viewable by everyone"
  ON replies FOR SELECT
  USING (true);

-- 返信が許可されている投稿にのみ返信可能
CREATE POLICY "users can reply to allowed thoughts only"
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

-- 自分の返信のみ更新可能
CREATE POLICY "users can update their own replies"
  ON replies FOR UPDATE
  USING (auth.uid() = user_id);

-- 自分の返信のみ削除可能
CREATE POLICY "users can delete their own replies"
  ON replies FOR DELETE
  USING (auth.uid() = user_id);

-- RLSを有効化
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
```

## ビュー（集計用）

投稿ごとの評価数と返信数を簡単に取得するためのビュー

```sql
CREATE VIEW thought_stats AS
SELECT 
  t.id as thought_id,
  COUNT(DISTINCT CASE WHEN r.reaction_type = 'insight' THEN r.id END) as insight_count,
  COUNT(DISTINCT CASE WHEN r.reaction_type = 'resonance' THEN r.id END) as resonance_count,
  COUNT(DISTINCT CASE WHEN r.reaction_type = 'thinking' THEN r.id END) as thinking_count,
  COUNT(DISTINCT CASE WHEN r.reaction_type = 'inspiration' THEN r.id END) as inspiration_count,
  COUNT(DISTINCT rep.id) as reply_count
FROM thoughts t
LEFT JOIN reactions r ON t.id = r.thought_id
LEFT JOIN replies rep ON t.id = rep.thought_id
GROUP BY t.id;
```

## フロントエンドでの使用例

### 評価を追加

```typescript
// 評価を追加
async function addReaction(thoughtId: string, reactionType: string) {
  const { data, error } = await supabase
    .from('reactions')
    .insert({
      thought_id: thoughtId,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      reaction_type: reactionType
    });
  
  if (error) {
    // 既に同じ評価をしている場合はエラーになる（UNIQUE制約）
    console.error('既に評価済み、または他のエラー:', error);
  }
}

// 評価を取り消し
async function removeReaction(thoughtId: string, reactionType: string) {
  const { error } = await supabase
    .from('reactions')
    .delete()
    .eq('thought_id', thoughtId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
    .eq('reaction_type', reactionType);
}
```

### 返信を追加

```typescript
// 投稿に返信
async function addReply(thoughtId: string, content: string) {
  const { data, error } = await supabase
    .from('replies')
    .insert({
      thought_id: thoughtId,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      content: content
    })
    .select('*, profiles(display_name, avatar)')
    .single();
  
  return data;
}

// 返信に返信（ツリー構造）
async function replyToReply(thoughtId: string, parentReplyId: string, content: string) {
  const { data, error } = await supabase
    .from('replies')
    .insert({
      thought_id: thoughtId,
      parent_reply_id: parentReplyId,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      content: content
    })
    .select('*, profiles(display_name, avatar)')
    .single();
  
  return data;
}
```

### 投稿と評価・返信を一緒に取得

```typescript
async function getThoughtsWithStats() {
  const { data, error } = await supabase
    .from('thoughts')
    .select(`
      *,
      profiles(display_name, avatar),
      thought_stats(
        insight_count,
        resonance_count,
        thinking_count,
        inspiration_count,
        reply_count
      )
    `)
    .order('created_at', { ascending: false });
  
  return data;
}

// 特定の投稿の返信をツリー構造で取得
async function getRepliesForThought(thoughtId: string) {
  const { data, error } = await supabase
    .from('replies')
    .select('*, profiles(display_name, avatar)')
    .eq('thought_id', thoughtId)
    .order('created_at', { ascending: true });
  
  // クライアント側でツリー構造に変換
  return buildReplyTree(data);
}

function buildReplyTree(replies: any[]) {
  const replyMap = new Map();
  const rootReplies: any[] = [];
  
  // まず全ての返信をMapに格納
  replies.forEach(reply => {
    replyMap.set(reply.id, { ...reply, children: [] });
  });
  
  // 親子関係を構築
  replies.forEach(reply => {
    const replyNode = replyMap.get(reply.id);
    if (reply.parent_reply_id) {
      const parent = replyMap.get(reply.parent_reply_id);
      if (parent) {
        parent.children.push(replyNode);
      }
    } else {
      rootReplies.push(replyNode);
    }
  });
  
  return rootReplies;
}
```

## リアルタイム更新（オプション）

Supabase Realtimeを使って評価や返信をリアルタイムで反映

```typescript
// 評価の変更をリッスン
supabase
  .channel('reactions-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'reactions'
  }, (payload) => {
    // UIを更新
    console.log('評価が変更されました:', payload);
  })
  .subscribe();

// 返信の追加をリッスン
supabase
  .channel('replies-changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'replies'
  }, (payload) => {
    // 新しい返信を表示
    console.log('新しい返信:', payload.new);
  })
  .subscribe();
```

## スパム対策（Rate Limiting）

```sql
-- 同じユーザーが短時間に大量の評価をできないようにする関数
CREATE OR REPLACE FUNCTION check_reaction_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count integer;
BEGIN
  -- 過去1分間の評価数をカウント
  SELECT COUNT(*) INTO recent_count
  FROM reactions
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '1 minute';
  
  -- 1分間に10個以上の評価は拒否
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
```

## マイグレーション順序

1. `reactions` テーブルを作成
2. `replies` テーブルを作成
3. RLSポリシーを設定
4. ビュー `thought_stats` を作成
5. Rate Limitingトリガーを設定（オプション）

これらの変更により、以下の機能が実現されます：
- 📊 4種類の質的な評価システム
- 💬 階層的な返信（ツリー構造）
- 🔄 リアルタイム更新
- 🛡️ スパム対策
