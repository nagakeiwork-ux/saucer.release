# デモモードで起動完了 ✅

アプリがデモモードで動作するようになりました！

## 🎉 すぐに使えます

開発サーバーが起動しています：

```
http://localhost:5173
```

ブラウザでアクセスしてください。

## ✨ 利用可能な機能

### すべてのページが動作します

1. **ホーム** 💡
   - 思索の投稿と閲覧
   - 4種類の評価システム
   - 返信機能
   - ブックマーク

2. **チャレンジ** 🏢
   - サンプルの企業チャレンジを表示
   - 提案の送信（デモ）
   - 報酬の確認

3. **マッチング** 💕
   - おすすめユーザーの表示
   - いいね機能
   - 相性スコア表示

4. **共鳴者** 👥
   - お気に入り投稿者の管理

5. **プロフィール** 👤
   - マイページ
   - 統計情報

## ⚠️ デモモードの制限

- **データは保存されません** - リロードすると消えます
- **認証なし** - 誰でもアクセス可能
- **複数ユーザー** - データは各自独立

## 🚀 正式版にアップグレード

データを永続化して複数ユーザーで使うには：

### 1. Supabaseプロジェクトを作成

```bash
# https://supabase.com/ でプロジェクト作成
```

### 2. データベースをセットアップ

```sql
-- Supabase SQL Editorで SETUP_DATABASE_FULL.sql を実行
```

### 3. 環境変数を設定

```bash
# .env.local を更新
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. App.tsxを更新

```typescript
// src/app/App.tsx を以下に変更：

import { Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { AuthPage } from './components/AuthPage';
import { RouterProvider } from 'react-router';
import { router } from './routes-with-data';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={() => window.location.reload()} />;
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
```

### 5. routes-with-data.tsを更新

```typescript
// デモコンポーネントを本番版に変更
import { HomePageWithData } from './components/HomePageWithData';
import { ChallengesPageWithData } from './components/ChallengesPageWithData';
import { MatchingPageWithData } from './components/MatchingPageWithData';
```

### 6. サーバーを再起動

```bash
npm run dev
```

詳細は `FULL_VERSION_SETUP.md` を参照してください。

---

**デモモードで楽しんでください！🎉**
