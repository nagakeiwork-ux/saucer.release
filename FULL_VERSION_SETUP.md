# Idea Pocket 完全版セットアップ

企業チャレンジ＋マッチング機能を含む完全版のセットアップガイドです。

## 🆕 新機能

### 企業チャレンジ
- 企業が提示するテーマに対してアイデアを提案
- 採用されると報酬を獲得
- 提案の管理と進捗確認

### マッチング機能
- 思考の相性が良いユーザーをレコメンド
- 相互いいねでマッチング成立
- マッチ後にメッセージ交換（近日実装）

## セットアップ手順

### ステップ1: データベースセットアップ

`SETUP_DATABASE.sql` の代わりに **`SETUP_DATABASE_FULL.sql`** を使用してください。

```bash
# Supabase SQL Editorで実行
# SETUP_DATABASE_FULL.sql の内容を全てコピー&ペースト
```

このSQLには以下が含まれます：
- 基本機能のテーブル
- 企業チャレンジ用テーブル（challenges, proposals）
- マッチング用テーブル（matching_suggestions, matches, matching_likes, messages）
- Row Level Security ポリシー
- Rate Limiting トリガー
- 相互いいね時の自動マッチング生成

### ステップ2: コンポーネントの確認

以下のコンポーネントが追加されています：

```
src/app/components/
├── ChallengesPageWithData.tsx  # 企業チャレンジページ
├── MatchingPageWithData.tsx    # マッチングページ
```

### ステップ3: ルーティングの確認

`src/app/routes-with-data.ts` に以下が追加されています：

```typescript
{ path: 'challenges', Component: ChallengesPageWithData },
{ path: 'matching', Component: MatchingPageWithData },
```

### ステップ4: ナビゲーションバー

下部ナビゲーションが5つのタブに更新されています：

1. ホーム - 投稿一覧
2. チャレンジ - 企業チャレンジ
3. マッチング - おすすめユーザー
4. 共鳴者 - お気に入り投稿者
5. プロフィール - マイページ

## 管理者向け: チャレンジの作成

企業チャレンジを作成するには、Supabase SQL Editorで実行：

```sql
INSERT INTO challenges (
  company_name,
  company_logo,
  title,
  description,
  reward,
  deadline,
  category,
  created_by
)
VALUES (
  'あなたの会社名',
  '🏢',
  'チャレンジのタイトル',
  '詳細な説明文',
  50000,  -- 報酬額
  CURRENT_DATE + INTERVAL '30 days',  -- 締切
  'カテゴリ名',
  'あなたのユーザーID'
);
```

## 管理者向け: マッチング候補の生成

マッチング候補を手動で生成する場合：

```sql
INSERT INTO matching_suggestions (
  user_id,
  suggested_user_id,
  compatibility_score,
  reason
)
VALUES (
  'ユーザーAのID',
  'ユーザーBのID',
  85,  -- 相性スコア (0-100)
  '同じような投稿傾向があります'
);
```

**注:** 将来的には投稿内容から自動的に相性を計算する機能を実装予定

## 機能の流れ

### 企業チャレンジ

1. **企業がチャレンジを作成**
   - 管理者がSQL or 管理画面で作成
   
2. **ユーザーが提案を送信**
   - チャレンジページで「提案する」ボタンをクリック
   - アイデアを記入して送信
   
3. **企業が提案を審査**
   - proposals テーブルで status を更新
   - 'pending' → 'accepted' → 'rewarded'
   
4. **報酬が付与**
   - status が 'rewarded' になると累計報酬に反映

### マッチング

1. **システムが候補を生成**
   - 管理者が matching_suggestions テーブルに追加
   
2. **ユーザーがいいねを送る**
   - おすすめタブで「つながる」ボタンをクリック
   
3. **相互いいねでマッチング成立**
   - トリガーが自動的に matches テーブルに追加
   
4. **メッセージ交換**
   - マッチタブからメッセージを送信（近日実装）

## データベーステーブル一覧

### 基本機能
- `profiles` - ユーザープロフィール
- `thoughts` - 投稿
- `reactions` - 評価
- `replies` - 返信
- `bookmarks` - ブックマーク
- `resonators` - 共鳴者

### 企業チャレンジ
- `challenges` - チャレンジ一覧
- `proposals` - ユーザーの提案

### マッチング
- `matching_suggestions` - おすすめユーザー
- `matching_likes` - いいね
- `matches` - マッチング成立
- `messages` - メッセージ

## セキュリティ設定

### Row Level Security (RLS)

全てのテーブルでRLSが有効化されています：

- **プライベートデータ**: 本人のみアクセス可能
- **提案**: 提案者と企業のみ閲覧可能
- **マッチング**: 関係者のみアクセス可能
- **メッセージ**: マッチした相手のみ

### Rate Limiting

スパム防止のため：

- **投稿**: 1分間に1回
- **評価**: 1分間に10回
- **提案**: 1時間に5回

## トラブルシューティング

### チャレンジが表示されない

**原因**: チャレンジが作成されていない

**解決策**: SQL Editorでサンプルチャレンジを作成

### マッチング候補が表示されない

**原因**: matching_suggestions テーブルが空

**解決策**: 手動で候補を追加するか、今後実装される自動生成を待つ

### 提案が送信できない

**原因**: 同じチャレンジに既に提案済み

**確認**: 
```sql
SELECT * FROM proposals WHERE user_id = 'あなたのID';
```

## 将来の拡張予定

- [ ] 投稿内容からの自動マッチング生成（AI活用）
- [ ] リアルタイムメッセージング
- [ ] 提案の下書き保存
- [ ] チャレンジのカテゴリフィルター
- [ ] 企業用管理画面
- [ ] 報酬の自動支払い連携（Stripe等）

---

**完全版で楽しんでください！🎉**
