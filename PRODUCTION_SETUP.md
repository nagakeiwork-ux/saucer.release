# Idea Pocket 正式版セットアップガイド

Supabaseを使用してデータを永続化し、複数ユーザーで使える完全版のセットアップ手順です。

## 所要時間

**合計: 約15-20分**
- Supabaseプロジェクト作成: 5分
- データベースセットアップ: 5分
- ローカル環境設定: 5分
- デプロイ（オプション）: 5分

---

## ステップ1: Supabaseプロジェクトを作成（5分）

### 1-1. アカウント作成

1. https://supabase.com/ にアクセス
2. 「Start your project」をクリック
3. GitHubアカウントでサインアップ
4. 「New Project」をクリック

### 1-2. プロジェクト設定

以下の情報を入力：

- **Organization**: 新規作成 or 既存を選択
- **Name**: `idea-pocket`
- **Database Password**: 安全なパスワードを設定（保存しておく）
- **Region**: `Northeast Asia (Tokyo)` を選択
- **Pricing Plan**: Free（無料プラン）を選択

「Create new project」をクリック。プロジェクト作成に1-2分かかります。

---

## ステップ2: データベースをセットアップ（5分）

### 2-1. SQLエディタでテーブル作成

1. 左メニューから「SQL Editor」を選択
2. 「New query」をクリック
3. プロジェクトの `SETUP_DATABASE.sql` の内容をコピー&ペースト
4. 「Run」をクリック

✅ `Database setup complete!` と表示されればOK

### 2-2. 認証設定

1. 左メニューから「Authentication」→「Providers」を選択
2. 「Email」がEnableになっていることを確認
3. 「Settings」タブで以下を設定：
   - Enable email confirmations: **ON**（メール確認を有効化）
   - Secure email change: **ON**

---

## ステップ3: ローカル環境設定（5分）

### 3-1. 環境変数を取得

1. Supabase Dashboard → 「Settings」→「API」
2. 以下の2つをコピー：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...`

### 3-2. .env.localファイルを作成

プロジェクトルートに `.env.local` ファイルを作成：

```bash
cd /workspaces/default/code

# .env.localファイルを作成
cat > .env.local << 'EOF'
VITE_SUPABASE_URL=https://あなたのプロジェクトID.supabase.co
VITE_SUPABASE_ANON_KEY=あなたのanon-key
EOF
```

**重要:** 上記の値を実際の値に置き換えてください。

### 3-3. アプリケーションコードを更新

現在のApp.tsxを正式版に切り替えます：

```bash
# 元のApp.tsxをバックアップ
mv src/app/App.tsx src/app/App.demo.tsx

# 正式版をApp.tsxにリネーム
mv src/app/AppWithAuth.tsx src/app/App.tsx

# ルーティングも更新
mv src/app/routes.ts src/app/routes.demo.ts
mv src/app/routes-with-data.ts src/app/routes.ts
```

### 3-4. 起動確認

```bash
# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

✅ ログイン画面が表示されればOK

---

## ステップ4: 初回ログイン（2分）

### 4-1. アカウント作成

1. 「新規登録」タブをクリック
2. 以下を入力：
   - 表示名: あなたの名前
   - メールアドレス: あなたのメール
   - パスワード: 8文字以上
3. 「新規登録」をクリック

### 4-2. メール確認

1. 登録したメールアドレスの受信箱を確認
2. Supabaseからの確認メールを開く
3. 「Confirm your mail」リンクをクリック
4. アプリに戻ってログイン

✅ アプリが表示されれば完了！

---

## ステップ5: デプロイ（オプション・5分）

### 5-1. Vercelにデプロイ

```bash
# Vercel CLIでデプロイ
vercel --prod
```

### 5-2. Vercelに環境変数を設定

1. Vercel Dashboard → Project → Settings → Environment Variables
2. 以下を追加：

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` |

3. Deployments → 最新のデプロイ → 「...」 → Redeploy

✅ 数分後、本番環境で動作確認

---

## 動作確認チェックリスト

以下の機能が動作することを確認：

- [ ] アカウント登録
- [ ] ログイン・ログアウト
- [ ] 投稿の作成（公開）
- [ ] 投稿の作成（プライベート）
- [ ] 返信可能/不可の選択
- [ ] 評価の追加（4種類）
- [ ] 返信の投稿
- [ ] ブックマーク
- [ ] 共鳴者の追加・削除
- [ ] プライベート書き留めの表示切替

---

## トラブルシューティング

### ログインできない

**症状:** メールアドレスが確認されていません

**解決策:**
1. メールの受信箱を確認
2. 迷惑メールフォルダも確認
3. Supabase Dashboard → Authentication → Users で確認状態をチェック

### データが表示されない

**症状:** 投稿が表示されない

**解決策:**
1. ブラウザのコンソールでエラーを確認（F12）
2. `.env.local` の値が正しいか確認
3. Supabase Dashboard → Logs でエラーを確認

### RLSエラーが出る

**症状:** `new row violates row-level security policy`

**解決策:**
1. `SETUP_DATABASE.sql` を再度実行
2. Supabase Dashboard → Database → Policies で確認
3. RLSが有効になっているか確認

### 投稿できない

**症状:** 「投稿は1分間に1回までです」エラー

**原因:** Rate Limitingが動作中（正常）

**解決策:** 1分待ってから再度投稿

---

## セキュリティ設定

### メール確認を必須にする（推奨）

Supabase Dashboard → Authentication → Settings:

```
Enable email confirmations: ON
```

これにより、メール確認なしではログインできません。

### カスタムドメインの設定

Supabase Dashboard → Settings → Auth:

```
Site URL: https://your-domain.com
Redirect URLs: https://your-domain.com/**
```

---

## データベース管理

### バックアップ

無料プランでは自動バックアップなし。手動でエクスポート：

1. Supabase Dashboard → Database → Backups
2. 「Download backup」をクリック

### データ閲覧

1. Supabase Dashboard → Table Editor
2. テーブルを選択してデータを確認

---

## パフォーマンス最適化

### 無料プランの制限

- **データベース**: 500MB
- **Storage**: 1GB
- **API requests**: 50,000/月
- **同時接続**: 500

### スケールアップ

ユーザー数が増えたら：

1. Supabase Pro: $25/月
2. Database indexes の最適化
3. CDN の活用（Vercel）

---

## 次のステップ

正式版が動作したら：

1. ✅ 利用規約とプライバシーポリシーを追加
2. ✅ 通報機能を実装
3. ✅ モデレーション体制を整備
4. ✅ Google Analytics を設定
5. ✅ カスタムドメインを設定

---

## サポート

問題が解決しない場合：

1. Supabase Dashboard → Logs でエラーを確認
2. ブラウザコンソール（F12）でエラーを確認
3. `PRERELEASE_GUIDE.md` の詳細版を参照
4. Supabase Discord: https://discord.supabase.com/

---

**おめでとうございます！🎉**

Idea Pocket の正式版が動作しています。
LINEグループで共有して、フィードバックを集めましょう！
