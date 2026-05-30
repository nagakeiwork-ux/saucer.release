# 🚀 クイックスタート - 今すぐLINEで共有する

**所要時間: 5-10分**

## 最速デプロイ手順（3ステップ）

### ステップ1: Vercel CLIでデプロイ

```bash
# 1. Vercel CLIをインストール（初回のみ）
npm install -g vercel

# 2. Vercelにログイン（ブラウザが開きます）
vercel login

# 3. デプロイ（プロジェクトフォルダで実行）
cd /workspaces/default/code
vercel --prod
```

プロンプトが表示されたら：
- `Set up and deploy?` → **Y** を押す
- `Which scope?` → あなたのアカウントを選択
- `Link to existing project?` → **N** を押す
- `Project name?` → **idea-pocket** と入力
- `In which directory is your code?` → **./** （そのままEnter）
- `Want to override settings?` → **N** を押す

**完了！** URLが表示されます：
```
✅ Production: https://idea-pocket-xxxxx.vercel.app
```

### ステップ2: URLをコピー

表示されたURL（例: `https://idea-pocket-xxxxx.vercel.app`）をコピー

### ステップ3: LINEグループで送信

```
【アプリ作りました！】

Idea Pocket - 日々の気づきを共有
https://idea-pocket-xxxxx.vercel.app

スマホでもPCでも使えます👍
```

## できあがり！🎉

これでLINEグループのメンバーがアクセスできます。

---

## ⚠️ 現在の制限事項

- **データは保存されません**（ページをリロードすると消えます）
- **ユーザー登録はありません**（誰でもアクセス可能）
- **データは共有されません**（各自が独立して見ています）

これはデモ版です。実際に使えるようにするには、次のステップに進んでください。

---

## 📊 次のステップ: データ保存を有効化

実際にデータを保存して複数人で共有するには：

### 1. Supabaseアカウント作成（5分）

1. https://supabase.com/ にアクセス
2. 「Start your project」をクリック
3. GitHubアカウントでサインアップ
4. 新しいプロジェクトを作成
   - Name: `idea-pocket`
   - Database Password: 安全なパスワードを設定
   - Region: Northeast Asia (Tokyo) を選択
   - 「Create new project」をクリック

### 2. データベースをセットアップ（10分）

Supabase Dashboard → SQL Editor で以下を実行：

```sql
-- ユーザープロフィール
CREATE TABLE profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  display_name text NOT NULL,
  avatar text,
  bio text,
  created_at timestamp DEFAULT now()
);

-- 投稿
CREATE TABLE thoughts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  tags text[],
  is_private boolean DEFAULT false,
  allow_replies boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- RLS（セキュリティ）を有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;

-- 公開投稿は誰でも閲覧可能
CREATE POLICY "Public thoughts are viewable"
  ON thoughts FOR SELECT
  USING (is_private = false);
```

詳細は `PRERELEASE_GUIDE.md` を参照してください。

### 3. 環境変数を設定（3分）

1. Supabase Dashboard → Settings → API
2. 以下をコピー：
   - `Project URL`
   - `anon public` key

3. Vercel Dashboard → Project → Settings → Environment Variables
4. 以下を追加：
   - Name: `VITE_SUPABASE_URL` Value: (Project URL)
   - Name: `VITE_SUPABASE_ANON_KEY` Value: (anon public key)

5. Deployments → 最新のデプロイ → 「...」 → Redeploy

### 4. Supabase Clientを統合（5分）

```bash
# パッケージをインストール
pnpm add @supabase/supabase-js

# 再デプロイ
vercel --prod
```

---

## 💡 ヒント

### URLを短くしたい
Vercelプロジェクト名を変更すると、URLも変わります：
- Project Settings → General → Project Name

### カスタムドメインを使いたい
- Project Settings → Domains → Add Domain
- 例: `ideapocket.app` など

### アクセス数を知りたい
- Vercel Analytics（無料）を有効化
- Project Settings → Analytics → Enable

---

## トラブルシューティング

### `vercel: command not found`

```bash
# npmのグローバルパスを確認
npm config get prefix

# パスが通っていない場合
export PATH=$PATH:$(npm config get prefix)/bin

# または、npxを使用
npx vercel --prod
```

### ビルドエラーが出る

```bash
# ローカルでビルドを試す
npm run build

# エラーがあれば修正してから再デプロイ
vercel --prod
```

### URLが開かない

- デプロイが完了するまで1-2分待つ
- Vercel Dashboard → Deployments で状態を確認
- Ready になっていることを確認

---

## サポート

問題が解決しない場合：
1. Vercel Dashboard → Logs でエラーを確認
2. `DEPLOYMENT_GUIDE.md` の詳細版を参照
3. Vercelの[公式ドキュメント](https://vercel.com/docs)を確認

---

**これで完璧！LINEグループでアプリを楽しんでください 🎉**
