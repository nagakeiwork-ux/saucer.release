# 🚀 Saucer 正式版デプロイガイド

このガイドでは、Saucerアプリケーションを正式版として本番環境にデプロイする手順を説明します。

## 📋 前提条件

- Supabaseアカウント
- Vercelアカウント（またはNetlify、Cloudflare Pagesなど）
- Googleアカウント（OAuth認証用）
- Git/GitHubアカウント

---

## 🔧 ステップ1: Supabaseプロジェクトのセットアップ

### 1.1 Supabaseプロジェクト作成

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. 「New Project」をクリック
3. プロジェクト名を入力（例: `saucer-production`）
4. データベースパスワードを設定
5. リージョンを選択（日本の場合は `Northeast Asia (Tokyo)` を推奨）
6. 「Create new project」をクリック

### 1.2 データベーススキーマの実行

1. Supabaseダッシュボードで「SQL Editor」を開く
2. プロジェクトルートの `SAUCER_DATABASE_SCHEMA.sql` ファイルの内容をコピー
3. SQL Editorに貼り付けて「Run」をクリック
4. 成功メッセージ "Saucer database setup complete!" が表示されることを確認

### 1.3 API認証情報の取得

1. Supabaseダッシュボードで「Settings」→「API」を開く
2. 以下の情報をメモ：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` で始まる長い文字列
   - **Project ID**: URLの `xxxxx` 部分

---

## 🔑 ステップ2: Google OAuth設定

### 2.1 Google Cloud Console設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. 「APIとサービス」→「OAuth同意画面」を開く
4. ユーザータイプを「外部」で設定
5. アプリ情報を入力：
   - アプリ名: `Saucer`
   - サポートメール: あなたのメールアドレス
   - 開発者の連絡先: あなたのメールアドレス
6. スコープは追加せず「保存して次へ」

### 2.2 OAuth認証情報の作成

1. 「APIとサービス」→「認証情報」を開く
2. 「認証情報を作成」→「OAuthクライアントID」をクリック
3. アプリケーションの種類: `ウェブアプリケーション`
4. 名前: `Saucer Web Client`
5. 承認済みのJavaScript生成元に追加：
   - `http://localhost:5173`（開発用）
   - あなたのVercelドメイン（例: `https://saucer.vercel.app`）
6. 承認済みのリダイレクトURIに追加：
   - `https://xxxxx.supabase.co/auth/v1/callback`（Supabase Project URLを使用）
7. 「作成」をクリック
8. **クライアントID**と**クライアントシークレット**をメモ

### 2.3 SupabaseにGoogle OAuth設定

1. Supabaseダッシュボードで「Authentication」→「Providers」を開く
2. 「Google」を選択
3. 「Enable Google provider」をON
4. Google Cloud Consoleで取得した以下を入力：
   - **Client ID**: Google OAuthクライアントID
   - **Client Secret**: Google OAuthクライアントシークレット
5. 「Save」をクリック

---

## 📦 ステップ3: アプリケーションのビルドとデプロイ

### 3.1 環境変数の設定

プロジェクトルートに `.env` ファイルを作成：

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_SUPABASE_PROJECT_ID=xxxxx
```

### 3.2 ローカルでの動作確認

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動
pnpm dev
```

ブラウザで `http://localhost:5173` を開き、以下を確認：
- Googleログインが機能する
- 投稿が作成できる
- リアクションが動作する

### 3.3 Vercelへのデプロイ

#### GitHubリポジトリの作成

```bash
git init
git add .
git commit -m "Initial commit: Saucer production ready"
git branch -M main
git remote add origin https://github.com/your-username/saucer.git
git push -u origin main
```

#### Vercelプロジェクトの作成

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. 「Add New」→「Project」をクリック
3. GitHubリポジトリを選択
4. プロジェクト設定：
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
5. **Environment Variables**を追加：
   - `VITE_SUPABASE_URL`: Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Supabase anon key
   - `VITE_SUPABASE_PROJECT_ID`: Supabase Project ID
6. 「Deploy」をクリック

---

## 🔐 ステップ4: セキュリティ設定

### 4.1 Supabase URL制限

1. Supabaseダッシュボードで「Settings」→「API」を開く
2. 「Site URL」に本番URLを設定（例: `https://saucer.vercel.app`）
3. 「Redirect URLs」に以下を追加：
   - `https://saucer.vercel.app/**`
   - `http://localhost:5173/**`（開発用）

### 4.2 Rate Limitingの確認

データベーススキーマに以下のRate Limitingが設定されています：
- 投稿: 1分間に1回まで
- リアクション: 1分間に10回まで

---

## 🧪 ステップ5: 本番環境での動作確認

以下の機能をテスト：

### 認証
- [ ] Googleログインが正常に動作する
- [ ] ログアウト後、再ログインできる
- [ ] プロフィールが自動作成される

### 投稿機能
- [ ] 新規投稿が作成できる
- [ ] タグ付けが動作する
- [ ] プライベート投稿が自分にのみ表示される
- [ ] 投稿の削除が動作する

### リアクション機能
- [ ] 4種類のリアクション（気づき、共感、考察、刺激的）が動作する
- [ ] リアクション数が正しくカウントされる
- [ ] リアクションの追加/削除が動作する

### 返信機能
- [ ] 投稿に返信できる
- [ ] 返信に対して返信できる（ツリー構造）
- [ ] 返信の削除が動作する

### フォロー機能
- [ ] ユーザーをフォローできる
- [ ] フォロー解除できる
- [ ] フォロー中のユーザーが「読者」タブに表示される

### プロフィール
- [ ] 登録番号が自動採番される
- [ ] 登録日が正しく表示される
- [ ] ユーザーの投稿履歴が表示される

---

## 📊 ステップ6: 監視とメンテナンス

### Supabaseダッシュボード

- **Database**: テーブルのデータを確認
- **Authentication**: ユーザー数を監視
- **Logs**: エラーログを確認
- **Storage**: 使用容量を確認（将来画像対応時）

### Vercelダッシュボード

- **Analytics**: ページビュー、ユーザー数
- **Logs**: デプロイログ、実行時エラー
- **Performance**: ページロード時間

---

## ⚠️ 重要な注意事項

### データプライバシー

**Saucerは個人の思索を共有するアプリですが、以下に注意してください：**

1. **個人情報（PII）の取り扱い**
   - 実名、住所、電話番号などの投稿は推奨しません
   - 機密情報や企業秘密は投稿しないでください

2. **データ保護**
   - Supabaseは暗号化された接続（HTTPS）を使用
   - Row Level Security（RLS）でアクセス制御を実装
   - 定期的にバックアップを取得してください

3. **利用規約**
   - ユーザーに対して、投稿内容の責任について明示
   - 著作権侵害、誹謗中傷の禁止を記載

### スケーリング

無料プランの制限：
- Supabase: 500MB データベース、50,000 月間アクティブユーザー
- Vercel: 100GB 帯域幅、100 デプロイ/日

ユーザー数が増加した場合は、有料プランへのアップグレードを検討してください。

---

## 🎉 完了！

これでSaucerが本番環境で稼働しています！

### 次のステップ

- [ ] カスタムドメインの設定（例: `saucer.app`）
- [ ] OGP画像の設定（SNSシェア時の見栄え）
- [ ] Google Analyticsの導入
- [ ] フィードバック収集フォームの追加
- [ ] プッシュ通知機能の検討

---

## 📞 サポート

問題が発生した場合：

1. [Supabaseドキュメント](https://supabase.com/docs)
2. [Vercelドキュメント](https://vercel.com/docs)
3. プロジェクトのIssueトラッカー

---

**Saucerを楽しんでください！** ✨
