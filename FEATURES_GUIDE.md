# Idea Pocket 機能ガイド

## 実装済み機能の詳細

### 1. 投稿タイプ

#### 公開投稿（みんなに公開）
- 全ユーザーに表示される
- 評価を受けることができる
- 投稿者が返信を許可/不許可を選択可能

#### プライベート書き留め（自分だけに表示）
- 投稿者本人にのみ表示される
- 評価や返信は受けない
- 個人的なメモや整理されていない思考の記録に最適

### 2. 返信機能の制御

投稿者が「返信可能」を選択した投稿のみ、他のユーザーが返信できます。

**返信を許可する場合の使い方:**
- 議論を深めたいトピック
- 他の人の意見を聞きたい内容
- コミュニティで共有したい気づき

**返信を許可しない場合の使い方:**
- 個人的な考えの表明
- 完結した思索
- クリーンに保ちたい投稿

### 3. 4種類の評価システム

投稿に対して4つの異なる角度から評価できます：

| 評価タイプ | アイコン | 意味 | 使用例 |
|-----------|---------|------|--------|
| 気づき | 💡 | 新しい視点や発見 | 「なるほど、そういう見方があるのか」 |
| 共感 | 💗 | 心に響いた | 「同じことを感じていた」 |
| 考察 | 🧠 | 深く考えさせられた | 「この投稿を読んで自分も考えた」 |
| 刺激的 | ✨ | インスピレーション | 「この考えから新しいアイデアが浮かんだ」 |

### 4. 共鳴者機能

お気に入りの投稿者を「共鳴者」として登録できます。

- 単なる「フォロー」ではなく、思考が共鳴する関係性を表現
- 共鳴者の最新投稿を専用ページで確認
- 共鳴者の数が表示される

### 5. ブックマーク機能

気になる投稿を保存して後で見返すことができます。

- 自分だけのコレクション
- 公開投稿・プライベート書き留めの両方に対応

## データベース設計のポイント

### プライベート投稿のセキュリティ

```sql
-- is_privateフィールドで制御
CREATE TABLE thoughts (
  ...
  is_private boolean DEFAULT false,
  allow_replies boolean DEFAULT false,
  ...
);

-- RLSで本人以外は閲覧不可
CREATE POLICY "thoughts are viewable by everyone or owner"
  ON thoughts FOR SELECT
  USING (
    is_private = false 
    OR (is_private = true AND auth.uid() = user_id)
  );
```

### 返信制限の実装

```sql
-- 返信可能な投稿にのみ返信を許可
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
```

## フロントエンドでの使用例

### プライベート投稿の作成

```typescript
async function createThought(
  content: string, 
  isPrivate: boolean, 
  allowReplies: boolean
) {
  const { data, error } = await supabase
    .from('thoughts')
    .insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      content: content,
      is_private: isPrivate,
      allow_replies: isPrivate ? false : allowReplies, // プライベートは常に返信不可
    })
    .select()
    .single();
  
  return data;
}
```

### 投稿の取得（公開 vs プライベート）

```typescript
// 公開投稿のみ取得
async function getPublicThoughts() {
  const { data } = await supabase
    .from('thoughts')
    .select('*, profiles(display_name, avatar)')
    .eq('is_private', false)
    .order('created_at', { ascending: false });
  
  return data;
}

// 自分のプライベート書き留めのみ取得
async function getMyPrivateNotes() {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  const { data } = await supabase
    .from('thoughts')
    .select('*, profiles(display_name, avatar)')
    .eq('is_private', true)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return data;
}
```

### 返信可能かチェック

```typescript
async function canReplyToThought(thoughtId: string): Promise<boolean> {
  const { data } = await supabase
    .from('thoughts')
    .select('allow_replies, is_private')
    .eq('id', thoughtId)
    .single();
  
  return data?.allow_replies === true && data?.is_private === false;
}
```

## ユーザー体験の設計思想

### なぜプライベート書き留めが必要か

1. **思考の段階に応じた使い分け**
   - まだ整理されていない考え → プライベート
   - 共有したい洞察 → 公開

2. **心理的安全性**
   - 判断されることを恐れずに書ける
   - 完璧でなくても記録できる

3. **後からの公開も可能**
   - プライベート → 公開への変更機能（将来実装予定）

### なぜ返信制限が必要か

1. **投稿の質の維持**
   - 議論したくない投稿に無理に返信されない
   - クリーンな思索の共有を保つ

2. **投稿者の意図の尊重**
   - 一方的な発信だけしたい場合もある
   - 対話を望むかどうかは投稿者が決める

3. **スパム・荒らし防止**
   - 返信が殺到することを防ぐ
   - コンテンツモデレーションの負担軽減

## 将来的な機能拡張案

### プライベート書き留めの拡張
- [ ] プライベート → 公開への変更機能
- [ ] プライベートノートのカテゴリ分け
- [ ] プライベートノートの検索・フィルタリング
- [ ] エクスポート機能（Markdown, PDF）

### 返信機能の拡張
- [ ] 返信の深さ制限（3階層まで等）
- [ ] 返信を後から無効化する機能
- [ ] 特定ユーザーのみ返信可能にする設定
- [ ] 返信のソート（新着順、評価順等）

### 評価システムの拡張
- [ ] 自分が付けた評価の一覧表示
- [ ] 評価の取り消し機能
- [ ] 評価の統計情報（どの評価が多いか等）
- [ ] 評価に基づくレコメンデーション

## トラブルシューティング

### プライベート投稿が他人に見えてしまう

**確認事項:**
1. RLSポリシーが有効になっているか
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'thoughts';
   ```

2. `is_private`フラグが正しく設定されているか
   ```sql
   SELECT id, content, is_private, user_id 
   FROM thoughts 
   WHERE is_private = true;
   ```

### 返信ボタンが表示されない

**確認事項:**
1. `allow_replies`が`true`になっているか
2. 投稿が公開（`is_private = false`）か
3. フロントエンドで条件分岐が正しいか

### 返信が投稿できない

**確認事項:**
1. RLSポリシーを確認
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'replies';
   ```

2. 投稿の設定を確認
   ```sql
   SELECT id, allow_replies, is_private 
   FROM thoughts 
   WHERE id = 'thought-id-here';
   ```

## セキュリティ考慮事項

### プライベートデータの保護

1. **サーバーサイドでの検証**
   - RLSポリシーに依存（フロントエンドは信用しない）
   - APIレスポンスからプライベートデータを除外

2. **クライアントサイドでの配慮**
   - URLに投稿IDを含めない（推測攻撃防止）
   - ブラウザのキャッシュに注意

3. **監査ログ**
   ```sql
   -- プライベート投稿へのアクセス試行をログ
   CREATE TABLE access_logs (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid,
     thought_id uuid,
     access_type text,
     was_allowed boolean,
     created_at timestamp DEFAULT now()
   );
   ```

### 返信スパム対策

```sql
-- 短時間での大量返信を防ぐ
CREATE OR REPLACE FUNCTION check_reply_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM replies
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '1 minute';
  
  IF recent_count >= 5 THEN
    RAISE EXCEPTION '返信の頻度が高すぎます。少し時間をおいてください。';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reply_rate_limit
  BEFORE INSERT ON replies
  FOR EACH ROW
  EXECUTE FUNCTION check_reply_rate_limit();
```

---

このガイドは実装の参考として使用してください。
質問や追加機能のリクエストがあれば、お気軽にお知らせください。
