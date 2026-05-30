# プロジェクトの共有方法

このプロジェクト（Idea Pocket）のソースコードを他の人と共有する方法です。

## 方法1: ZIPファイルで共有（最も簡単）

### ステップ1: ZIPファイルを作成

```bash
# プロジェクトフォルダの親ディレクトリに移動
cd /workspaces/default

# ZIPファイルを作成（node_modulesは除外）
zip -r idea-pocket.zip code \
  -x "code/node_modules/*" \
  -x "code/.git/*" \
  -x "code/dist/*" \
  -x "code/.DS_Store"
```

または、手動で：

**macOS / Linux:**
1. プロジェクトフォルダ `/workspaces/default/code` を右クリック
2. 「圧縮」を選択
3. `code.zip` が作成されます
4. `idea-pocket.zip` にリネーム

**Windows:**
1. プロジェクトフォルダを右クリック
2. 「送る」→「圧縮（zip形式）フォルダー」を選択
3. `idea-pocket.zip` にリネーム

### ステップ2: LINEで送信

1. LINEのトーク画面を開く
2. クリップアイコン（添付）をクリック
3. 「ファイル」を選択
4. `idea-pocket.zip` を選択して送信

**サイズ制限:** LINEは最大1GBまでのファイルを送信できます。

### ステップ3: 受け取った人の使い方

受け取った人は：

```bash
# ZIPを解凍
unzip idea-pocket.zip
cd code

# 依存関係をインストール
npm install
# または
pnpm install

# 開発サーバーを起動
npm run dev
# または
pnpm dev
```

---

## 方法2: GitHubで共有（推奨）

### ステップ1: GitHubリポジトリを作成

```bash
cd /workspaces/default/code

# .gitignoreを作成
cat > .gitignore << 'EOF'
# 依存関係
node_modules/
package-lock.json
pnpm-lock.yaml

# ビルド成果物
dist/
build/

# 環境変数
.env
.env.local
.env.*.local

# エディタ設定
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# ログ
*.log
npm-debug.log*
EOF

# Gitリポジトリを初期化
git init

# すべてのファイルを追加
git add .

# 最初のコミット
git commit -m "Initial commit: Idea Pocket"

# GitHubでリポジトリを作成（ブラウザで実行）
# https://github.com/new
# Repository name: idea-pocket
# Public にチェック
# Create repository

# リモートを追加（YOUR_USERNAMEを自分のユーザー名に変更）
git remote add origin https://github.com/YOUR_USERNAME/idea-pocket.git

# プッシュ
git branch -M main
git push -u origin main
```

### ステップ2: URLをLINEで共有

GitHubのリポジトリURL（例: `https://github.com/YOUR_USERNAME/idea-pocket`）をLINEで送信：

```
【プロジェクト共有】

Idea Pocket のソースコードです
https://github.com/YOUR_USERNAME/idea-pocket

セットアップ方法:
1. 上記URLを開く
2. 緑の「Code」ボタンをクリック
3. 「Download ZIP」をクリック
4. 解凍して npm install を実行

または git clone:
git clone https://github.com/YOUR_USERNAME/idea-pocket.git
cd idea-pocket
npm install
npm run dev
```

### ステップ3: 受け取った人の使い方

```bash
# GitHubからクローン
git clone https://github.com/YOUR_USERNAME/idea-pocket.git
cd idea-pocket

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

---

## 方法3: Google Drive / Dropbox で共有

### Google Drive

1. プロジェクトフォルダをZIP化
2. [Google Drive](https://drive.google.com/) にアップロード
3. ファイルを右クリック → 「共有」
4. 「リンクをコピー」
5. LINEで共有リンクを送信

### Dropbox

1. プロジェクトフォルダをZIP化
2. [Dropbox](https://www.dropbox.com/) にアップロード
3. 「共有」→「リンクをコピー」
4. LINEで共有リンクを送信

---

## プロジェクトの説明文（LINEで送る用）

```
【Idea Pocket プロジェクト】

日々の気づきや思索を共有するWebアプリです

🎯 主な機能:
・思索の投稿・共有
・4種類の評価システム（気づき、共感、考察、刺激的）
・返信機能（ツリー構造）
・共鳴者機能（お気に入りの投稿者）
・プライベート書き留めメモ

💻 技術スタック:
・React 18
・TypeScript
・Material UI
・React Router
・Vite

📦 セットアップ:
1. プロジェクトを解凍
2. npm install
3. npm run dev
4. http://localhost:5173 を開く

📚 ドキュメント:
・QUICK_START.md - デプロイ方法
・PRERELEASE_GUIDE.md - 実装ガイド
・FEATURES_GUIDE.md - 機能詳細

質問があれば気軽に聞いてください！
```

---

## README.mdの作成

プロジェクトに README を追加しておくと親切です：

```bash
cat > README.md << 'EOF'
# Idea Pocket

日々の気づきや思索を共有するWebアプリケーション

## 特徴

- 💡 日常の気づきを投稿・共有
- ⭐ 4種類の質的評価システム
- 💬 ツリー型返信機能
- 👥 共鳴者（お気に入り投稿者）機能
- 🔒 プライベート書き留めメモ

## セットアップ

### 必要な環境

- Node.js 18以上
- npm または pnpm

### インストール

```bash
# 依存関係をインストール
npm install
# または
pnpm install
```

### 開発サーバー起動

```bash
npm run dev
# または
pnpm dev
```

ブラウザで http://localhost:5173 を開きます

### ビルド

```bash
npm run build
# または
pnpm build
```

## デプロイ

詳細は `QUICK_START.md` を参照してください。

## ドキュメント

- [クイックスタート](QUICK_START.md) - 最速デプロイ方法
- [デプロイガイド](DEPLOYMENT_GUIDE.md) - 詳細なデプロイ手順
- [プレリリースガイド](PRERELEASE_GUIDE.md) - 実装ガイド
- [機能ガイド](FEATURES_GUIDE.md) - 機能の詳細説明
- [データベース設計](DATABASE_SCHEMA_UPDATE.md) - DB設計

## 技術スタック

- React 18.3
- TypeScript
- Material UI 7
- React Router 7
- Vite 6
- date-fns

## ライセンス

MIT
EOF

git add README.md
git commit -m "Add README"
git push
```

---

## ファイルサイズを小さくするヒント

ZIPファイルが大きすぎる場合：

```bash
# node_modulesを削除してからZIP化
rm -rf node_modules
zip -r idea-pocket.zip .

# 受け取った人が npm install すればOK
```

**推奨サイズ:**
- node_modules除外: 約 1-5 MB
- node_modules含む: 約 200-500 MB

---

## トラブルシューティング

### LINEでファイルが送れない

→ Google DriveやDropboxを使用

### GitHubにプッシュできない

```bash
# 認証情報を確認
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# GitHubの認証トークンを使用
# https://github.com/settings/tokens
```

### 受け取った人が起動できない

**確認事項:**
1. Node.jsがインストールされているか
2. `npm install` を実行したか
3. ポート5173が空いているか

```bash
# Node.jsのバージョン確認
node --version  # v18以上が必要

# 別のポートで起動
npm run dev -- --port 3000
```

---

**どの方法が良い？**

- **GitHub**: コード管理、共同開発、バージョン管理に最適
- **ZIP**: 一番簡単、LINEで直接送信可能
- **Google Drive**: 大きいファイル、複数人共有に便利

目的に応じて選んでください！
EOF
