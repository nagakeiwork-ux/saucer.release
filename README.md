# Saucer ☕

日常の些細な気づきを書き留めた思索の断片を共有するWebアプリケーション

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)
![Supabase](https://img.shields.io/badge/Supabase-Ready-00c896)
![PWA](https://img.shields.io/badge/PWA-Enabled-5a0fc8)

## ✨ 特徴

Saucerは、日常の中で生まれる些細な気づきや思索を大切にするためのプラットフォームです。

### コア機能

- 💡 **気づきの投稿** - 最大500文字で思索を記録・共有
- 🏷️ **タグ機能** - 投稿をタグで分類・検索
- ⭐ **4種類の質的評価** - 気づき、共感、考察、刺激的の4軸で反応
- 💬 **ツリー型返信** - 投稿に対して議論を深める
- 👥 **読者機能** - お気に入りの投稿者をフォロー
- 🔖 **ブックマーク** - 気になる投稿を保存
- 🔒 **プライベート投稿** - 自分だけに見える書き留め

### システム

- 🔐 **Google認証** - 安全で簡単なログイン
- 💾 **データ永続化** - Supabaseによる確実なデータ保存
- 🛡️ **セキュリティ** - Row Level Security + Rate Limiting
- 📱 **PWA対応** - スマホのホーム画面に追加可能
- ⚡ **高速** - React + Viteによる最適化

## 🎨 スクリーンショット

### ホーム画面
投稿の閲覧、タグフィルター、リアクション

### 読者タブ
フォロー中のユーザーと最新投稿

### プロフィール
登録番号、統計情報、獲得バッジ

## 🚀 クイックスタート

### デモモード（ローカル開発）

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動
pnpm dev
```

ブラウザで `http://localhost:5173` を開く

**デモモードでは**：
- 仮想データで動作
- ログイン不要
- データはブラウザのメモリに保存（リロードで消える）

### 正式版デプロイ

詳細は **[PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)** を参照

1. **Supabaseセットアップ**
   - プロジェクト作成
   - `SAUCER_DATABASE_SCHEMA.sql` 実行
   - Google OAuth設定

2. **環境変数設定**
   ```bash
   cp .env.example .env
   # .envにSupabase認証情報を記入
   ```

3. **デプロイ**
   - Vercel/Netlify/Cloudflare Pagesなどにデプロイ
   - 環境変数を設定

## 📦 技術スタック

### フロントエンド
- **React 18.3** - UIライブラリ
- **TypeScript** - 型安全性
- **Material UI 7.3** - UIコンポーネント
- **React Router 7.13** - ルーティング
- **Vite** - ビルドツール
- **PWA Plugin** - Progressive Web App対応

### バックエンド
- **Supabase** - BaaS（Backend as a Service）
  - PostgreSQL データベース
  - Authentication（Google OAuth）
  - Row Level Security
  - リアルタイム同期

### デプロイ
- **Vercel** - ホスティング（推奨）
- **Netlify** - 代替オプション
- **Cloudflare Pages** - 代替オプション

## 🗂️ プロジェクト構成

```
saucer/
├── src/
│   ├── app/
│   │   ├── components/         # Reactコンポーネント
│   │   │   ├── HomePage.tsx
│   │   │   ├── ResonatorsPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   └── UserProfilePage.tsx
│   │   ├── data/              # モックデータ
│   │   │   └── mockData.ts
│   │   └── App.tsx            # メインアプリ
│   ├── hooks/                 # カスタムフック
│   │   └── useAuth.tsx
│   ├── services/              # APIサービス
│   │   └── supabaseService.tsx
│   ├── config/                # 設定
│   │   └── appConfig.tsx
│   └── styles/                # スタイル
├── utils/
│   └── supabase/              # Supabase設定
│       └── client.tsx
├── public/                    # 静的ファイル
├── SAUCER_DATABASE_SCHEMA.sql # データベーススキーマ
├── PRODUCTION_DEPLOYMENT_GUIDE.md
├── RELEASE_NOTES.md
└── README.md
```

## 📖 ドキュメント

- **[PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)** - 本番デプロイの完全ガイド
- **[RELEASE_NOTES.md](./RELEASE_NOTES.md)** - バージョン履歴と変更内容
- **[SAUCER_DATABASE_SCHEMA.sql](./SAUCER_DATABASE_SCHEMA.sql)** - データベース定義

## 🛡️ セキュリティ

### Row Level Security（RLS）
- プロフィール: 全員が閲覧可、本人のみ編集可
- 投稿: 公開投稿は全員が閲覧可、プライベート投稿は本人のみ
- リアクション: 公開投稿に対してのみ可能
- フォロー: 全員が閲覧可、本人のみ管理可

### Rate Limiting
- 投稿: 1分間に1回まで
- リアクション: 1分間に10回まで

### データプライバシー
- **⚠️ 重要**: Saucerは個人の思索を共有するアプリですが、個人情報（PII）や機密情報の投稿は推奨しません
- 実名、住所、電話番号などは投稿しないでください
- データは暗号化されたHTTPS接続で送信されます

## 🎯 使い方

### 1. 投稿する
1. ホーム画面の「+」ボタンをクリック
2. 気づきを入力（最大500文字）
3. タグを選択（最大5つ）
4. 公開/プライベートを選択
5. 返信の許可/不許可を選択
6. 「投稿」をクリック

### 2. リアクションする
- 💡 **気づき** - 新しい視点を得た
- ❤️ **共感** - 同じ感覚を持った
- 🤔 **考察** - 深く考えさせられた
- ⚡ **刺激的** - インスピレーションを受けた

### 3. 返信する
- 投稿の「返信」ボタンをクリック
- 返信に対してさらに返信可能（ツリー構造）

### 4. ユーザーをフォローする
1. プロフィールページを開く
2. 「読者に追加」をクリック
3. 「読者」タブでフォロー中のユーザーを確認

### 5. ブックマーク
- 投稿の🔖アイコンをクリックして保存

## 📊 データベーススキーマ

### テーブル

- **profiles** - ユーザープロフィール
- **thoughts** - 投稿
- **reactions** - リアクション
- **replies** - 返信
- **bookmarks** - ブックマーク
- **follows** - フォロー関係

詳細は `SAUCER_DATABASE_SCHEMA.sql` を参照

## 🔄 バージョン履歴

### v2.0.0（現在）- 正式版リリース準備完了
- ✅ タグ機能
- ✅ 読者（フォロー）機能
- ✅ ユーザープロフィール強化
- ✅ Supabase統合
- ✅ PWA対応
- ✅ 3タブ構成に簡素化

### v1.0.0 - デモ版
- 基本的な投稿・閲覧機能
- 4種類の評価システム
- ツリー型返信機能

詳細は `RELEASE_NOTES.md` を参照

## 🚧 今後の予定

### v2.1.0
- [ ] 画像アップロード機能
- [ ] 通知機能
- [ ] ダークモード
- [ ] 多言語対応（英語）

### v2.2.0
- [ ] 検索機能の強化
- [ ] トレンドタグの表示
- [ ] おすすめユーザー機能

## 🤝 貢献

プルリクエストは歓迎します！

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 サポート

問題が発生した場合は、GitHubのIssueトラッカーで報告してください。

---

**Saucerで、あなたの日常の気づきを世界と共有しましょう！** ☕✨

Made with ❤️ by the Saucer Team
