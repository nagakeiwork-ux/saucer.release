# Idea Pocket プレリリース版 実装ガイド

## アプリケーション概要

**Idea Pocket** は日常の些細な気づきや思索の断片を共有するプラットフォームです。
プレリリース版では、コア機能に焦点を当て、安全性を確保しながら段階的にリリースします。

### プレリリース版の機能

- ✅ 思索の投稿・閲覧
- ✅ 共鳴者の登録（お気に入りの投稿者）
- ✅ ブックマーク機能
- ✅ シンプルなプロフィール
- ❌ 企業チャレンジ（正式版で実装予定）
- ❌ マッチング機能（正式版で実装予定）
- ❌ 報酬システム（正式版で実装予定）

## 実装に必要なもの

### 1. 認証・ユーザー管理（最低限）

犯罪利用を防ぐための最小限の登録要件：

**必須の登録情報:**
- メールアドレス（確認必須）
- パスワード
- 表示名（ニックネーム可）

**任意の登録情報:**
- アバター（絵文字 or 画像）
- 自己紹介

**セキュリティ対策:**
```typescript
// Supabaseの例
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    emailRedirectTo: 'https://your-app.com/verify',
    data: {
      display_name: displayName,
    }
  }
})

// メール確認が完了するまでは機能制限
```

**重要な安全対策:**
- メールアドレス認証必須（未認証ユーザーは閲覧のみ）
- 利用規約への同意（不適切な利用の禁止を明記）
- 通報機能の実装
- 投稿内容のモデレーション

### 2. データベース設計（シンプル版）

Supabaseのテーブル設計：

```sql
-- ユーザープロフィール（auth.usersとは別）
CREATE TABLE profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  display_name text NOT NULL,
  avatar text,
  bio text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 思索の投稿
CREATE TABLE thoughts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  tags text[],
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- ブックマーク
CREATE TABLE bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  thought_id uuid REFERENCES thoughts(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, thought_id)
);

-- 共鳴者（お気に入りの投稿者）
CREATE TABLE resonators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  resonator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, resonator_id),
  CHECK (user_id != resonator_id)
);

-- 通報機能（安全対策）
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id),
  reported_thought_id uuid REFERENCES thoughts(id),
  reported_user_id uuid REFERENCES profiles(id),
  reason text NOT NULL,
  status text DEFAULT 'pending', -- pending, reviewed, resolved
  created_at timestamp DEFAULT now()
);
```

### 3. Row Level Security (RLS) ポリシー

データの安全性を確保するためのポリシー：

```sql
-- 誰でも投稿を閲覧可能
CREATE POLICY "thoughts are viewable by everyone"
  ON thoughts FOR SELECT
  USING (true);

-- 自分の投稿のみ作成可能
CREATE POLICY "users can create their own thoughts"
  ON thoughts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 自分の投稿のみ更新・削除可能
CREATE POLICY "users can update their own thoughts"
  ON thoughts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users can delete their own thoughts"
  ON thoughts FOR DELETE
  USING (auth.uid() = user_id);

-- ブックマークは自分のもののみアクセス可能
CREATE POLICY "users can manage their own bookmarks"
  ON bookmarks FOR ALL
  USING (auth.uid() = user_id);

-- 共鳴者も同様
CREATE POLICY "users can manage their own resonators"
  ON resonators FOR ALL
  USING (auth.uid() = user_id);
```

### 4. フロントエンドの実装

必要なパッケージ：

```bash
pnpm add @supabase/supabase-js
pnpm add @supabase/auth-ui-react  # 認証UIコンポーネント（オプション）
```

Supabaseクライアントの設定：

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

環境変数（.env.local）：

```
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. コンテンツモデレーション

不適切な投稿を防ぐための対策：

**即座に実装すべき対策:**

1. **文字数制限**
   - 投稿: 最大500文字
   - 表示名: 最大50文字
   - 自己紹介: 最大200文字

2. **禁止ワードフィルター**
   ```typescript
   const PROHIBITED_WORDS = ['違法', '詐欺', /* etc */];
   
   function containsProhibitedWords(text: string): boolean {
     return PROHIBITED_WORDS.some(word => text.includes(word));
   }
   ```

3. **投稿頻度制限（Rate Limiting）**
   - 1分間に1投稿まで
   - 1日に20投稿まで

4. **通報機能**
   ```typescript
   async function reportContent(thoughtId: string, reason: string) {
     await supabase.from('reports').insert({
       reporter_id: userId,
       reported_thought_id: thoughtId,
       reason: reason
     });
   }
   ```

**将来的な改善（正式版）:**
- OpenAI Moderations API / Azure Content Safety
- 人間によるレビュー体制
- ユーザー評価システム

### 6. 利用規約・プライバシーポリシー

必ず用意すべき法的文書：

**利用規約に含めるべき項目:**
- サービスの説明
- 禁止事項（違法行為、詐欺、ハラスメント等）
- アカウント停止の条件
- 免責事項
- 知的財産権
- サービス変更・終了の権利

**プライバシーポリシー:**
- 収集する情報
- 情報の利用目的
- 第三者提供の有無
- セキュリティ対策
- ユーザーの権利（削除要求等）

### 7. デプロイ

**フロントエンド（Vercel推奨）:**

```bash
# Vercelにデプロイ
vercel

# 環境変数を設定
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

**バックエンド:**
- Supabaseを使用する場合、追加のデプロイ不要
- 無料プランで開始可能

### 8. モニタリング・分析

**最低限必要なもの:**

1. **エラー監視**
   - Sentry（エラートラッキング）
   ```bash
   pnpm add @sentry/react
   ```

2. **アクセス解析**
   - Google Analytics 4
   - Plausible Analytics（プライバシー重視）

3. **データベース監視**
   - Supabase Dashboard（標準機能）
   - 投稿数、ユーザー数の推移

## 開発の流れ

### フェーズ1: ローカル開発（1-2週間）

1. Supabaseプロジェクト作成
2. データベーステーブル作成
3. RLSポリシー設定
4. 認証フローの実装
5. CRUD機能の実装
6. ローカルでのテスト

### フェーズ2: クローズドベータ（2-4週間）

1. Vercelへデプロイ
2. 友人・知人10-20名で試用
3. バグ修正
4. UIの改善
5. セキュリティチェック

### フェーズ3: プレリリース公開（4-8週間）

1. 利用規約・プライバシーポリシー公開
2. 通報機能の実装
3. モデレーション体制の確立
4. 限定公開（招待制 or 先着順）
5. フィードバック収集

### フェーズ4: 正式リリース

1. 企業チャレンジ機能の追加
2. マッチング機能の追加
3. 報酬システムの実装
4. 一般公開

## 予算の目安（プレリリース版）

**無料で開始可能:**
- Supabase: 無料プラン（500MB DB、50GB帯域）
- Vercel: 無料プラン（個人利用）
- ドメイン: 年間1,000-2,000円程度

**有料サービスが必要になるタイミング:**
- ユーザー数1,000人以上
- 月間アクセス100万PV以上
- データベース容量500MB超過

**スケールアップ時の月額コスト:**
- Supabase Pro: $25/月
- Vercel Pro: $20/月
- 合計: 約$45/月（6,000-7,000円）

## セキュリティチェックリスト

プレリリース前に必ず確認：

- [ ] メールアドレス認証が機能している
- [ ] RLSポリシーが正しく設定されている
- [ ] XSS対策（入力のサニタイゼーション）
- [ ] CSRF対策
- [ ] HTTPS通信のみ許可
- [ ] 環境変数が適切に管理されている
- [ ] 個人情報の暗号化
- [ ] 通報機能が動作している
- [ ] 利用規約・プライバシーポリシーが表示されている
- [ ] エラーメッセージに機密情報が含まれていない

## トラブルシューティング

### よくある問題

**1. RLSポリシーで投稿が見えない**
```sql
-- 確認: RLSが有効か
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 一時的に無効化してテスト（本番環境では絶対にしない）
ALTER TABLE thoughts DISABLE ROW LEVEL SECURITY;
```

**2. 認証がうまくいかない**
- メール認証のリンクが正しいか確認
- Supabase Dashboardでユーザーが作成されているか確認
- ブラウザのコンソールでエラーを確認

**3. データが保存されない**
- ネットワークタブでAPIリクエストを確認
- Supabase Logsでエラーを確認
- RLSポリシーが正しいか確認

---

質問や不明点があれば、いつでもお聞きください！
