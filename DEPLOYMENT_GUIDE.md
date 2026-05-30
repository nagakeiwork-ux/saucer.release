# Idea Pocket デプロイガイド（LINEグループ共有用）

LINEグループでアプリを共有するための手順です。

## ステップ1: Vercelアカウントの作成

1. [Vercel](https://vercel.com/)にアクセス
2. 「Sign Up」をクリック
3. GitHubアカウントで登録（推奨）

## ステップ2: GitHubリポジトリの作成

### 方法A: GitHub Desktop使用（初心者向け）

1. [GitHub Desktop](https://desktop.github.com/)をダウンロード・インストール
2. GitHub Desktopを起動してログイン
3. File → Add Local Repository を選択
4. このプロジェクトフォルダを選択
5. 「Publish repository」をクリック
   - Repository name: `idea-pocket`
   - Description: `日常の気づきを共有するアプリ`
   - Keep this code private のチェックを外す（公開）
6. 「Publish Repository」をクリック

### 方法B: コマンドライン使用

```bash
# プロジェクトフォルダで実行
cd /workspaces/default/code

# Gitリポジトリを初期化（まだの場合）
git init

# .gitignoreファイルを作成
echo "node_modules
.env
.env.local
dist
.DS_Store" > .gitignore

# すべてのファイルを追加
git add .

# 最初のコミット
git commit -m "Initial commit: Idea Pocket app"

# GitHubにリポジトリを作成後、リモートを追加
git remote add origin https://github.com/YOUR_USERNAME/idea-pocket.git

# プッシュ
git branch -M main
git push -u origin main
```

## ステップ3: Vercelにデプロイ

### 3-1. Vercel CLIを使う方法（最も簡単）

```bash
# Vercel CLIをインストール
npm install -g vercel

# ログイン
vercel login

# デプロイ
vercel

# プロンプトに答える:
# ? Set up and deploy "~/code"? [Y/n] y
# ? Which scope do you want to deploy to? (あなたのアカウント)
# ? Link to existing project? [y/N] n
# ? What's your project's name? idea-pocket
# ? In which directory is your code located? ./
# ? Want to override the settings? [y/N] n

# 本番環境にデプロイ
vercel --prod
```

デプロイが完了すると、URLが表示されます：
```
✅ Production: https://idea-pocket.vercel.app
```

### 3-2. Vercel Dashboardを使う方法

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. 「Add New」→ 「Project」をクリック
3. GitHubリポジトリをインポート
4. `idea-pocket` リポジトリを選択
5. 「Deploy」をクリック

## ステップ4: LINEグループで共有

デプロイが完了したら、以下の方法で共有できます：

### 共有メッセージの例

```
【新しいアプリを作りました！】

🌟 Idea Pocket
日常の些細な気づきや思索を共有できるアプリです

📱 アクセスURL:
https://idea-pocket.vercel.app

✨ できること:
・日々の気づきを投稿
・4種類の評価（気づき、共感、考察、刺激的）
・気になる人を「共鳴者」として登録
・プライベートな書き留めメモ

ぜひ使ってみて、感想を教えてください！
```

### QRコードの生成（オプション）

1. [QRコード作成サイト](https://www.qrcode-monkey.com/)にアクセス
2. URLを入力
3. QRコードを生成してダウンロード
4. LINEで画像として送信

## 現在の状態での注意点

⚠️ **重要:** 現在のバージョンはモックデータを使用しています

- データは保存されません（ページをリロードすると消えます）
- 認証機能はまだありません
- 複数人で同時に使用しても、データは共有されません

## 次のステップ: 完全版へのアップグレード

実際にデータを保存し、複数人で共有できるようにするには：

### 1. Supabaseのセットアップ

```bash
# Supabaseアカウントを作成
# https://supabase.com/

# プロジェクトを作成
# プロジェクト名: idea-pocket

# データベーステーブルを作成（PRERELEASE_GUIDE.mdを参照）
```

### 2. 環境変数の設定

Vercel Dashboardで環境変数を設定：

1. Project Settings → Environment Variables
2. 以下を追加：
   - `VITE_SUPABASE_URL`: Supabaseプロジェクトのurl
   - `VITE_SUPABASE_ANON_KEY`: Supabaseプロジェクトのanon key

### 3. Supabase Clientの統合

```bash
# パッケージをインストール
pnpm add @supabase/supabase-js

# 再デプロイ
vercel --prod
```

## トラブルシューティング

### デプロイエラー: "Build failed"

**原因:** ビルド設定が正しくない

**解決策:**
1. Vercel Dashboard → Project Settings → General
2. Build & Development Settings:
   - Build Command: `pnpm build` または `npm run build`
   - Output Directory: `dist`
   - Install Command: `pnpm install` または `npm install`

### URLにアクセスできない

**確認事項:**
1. デプロイが完了しているか（Vercel Dashboardで確認）
2. URLが正しいか
3. インターネット接続があるか

### モバイルで表示が崩れる

**対応:**
アプリは既にレスポンシブ対応していますが、問題がある場合：
1. ブラウザのキャッシュをクリア
2. 別のブラウザで試す
3. Vercelのログでエラーを確認

## カスタムドメインの設定（オプション）

独自のドメインを使いたい場合：

1. ドメインを購入（例: `ideapocket.com`）
   - [お名前.com](https://www.onamae.com/)
   - [Google Domains](https://domains.google/)

2. Vercel Dashboardで設定
   - Project Settings → Domains
   - Add Domain
   - DNSレコードを設定

3. 数分〜数時間でドメインが有効化

## セキュリティ設定（本番環境用）

### 利用規約・プライバシーポリシーの追加

```tsx
// 簡易的な利用規約ページを追加
// src/app/components/TermsPage.tsx

export function TermsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5">利用規約</Typography>
      <Typography variant="body2" sx={{ mt: 2 }}>
        1. このサービスは個人の思索を共有する目的で提供されています。
        2. 違法な内容、誹謗中傷、ハラスメントは禁止です。
        3. サービスは予告なく変更・終了する場合があります。
        ...
      </Typography>
    </Box>
  );
}
```

### HTTPS設定

- Vercelは自動的にHTTPSを有効化
- 設定不要で安全な通信が確保されます

## パフォーマンス最適化

### 1. 画像の最適化

アバター画像などを追加する場合：
```bash
pnpm add next-image-export-optimizer
```

### 2. ローディング状態の追加

```tsx
// データ取得中の表示
{loading ? (
  <CircularProgress />
) : (
  // コンテンツ
)}
```

## 分析・モニタリング

### Vercel Analytics（推奨）

```bash
pnpm add @vercel/analytics

# App.tsxに追加
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Analytics />
    </>
  );
}
```

### Google Analytics

```html
<!-- index.htmlに追加 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## よくある質問

**Q: デプロイは無料ですか？**
A: Vercelの無料プランで十分です。月間100GBの帯域まで無料。

**Q: 何人まで同時に使えますか？**
A: Vercelは無制限ですが、Supabase無料プランは月間50,000リクエストまで。

**Q: データは保存されますか？**
A: 現在のバージョンはモックデータです。Supabaseを設定すると永続化されます。

**Q: スマホで使えますか？**
A: はい、レスポンシブ対応済みでスマホでも快適に使えます。

**Q: アップデートはどうやってしますか？**
A: GitHubにプッシュすると、Vercelが自動的に再デプロイします。

---

何か問題があれば、Vercel Dashboardの「Logs」タブでエラーを確認してください。
