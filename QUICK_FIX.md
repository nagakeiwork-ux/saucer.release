# クイックフィックスガイド

## エラー修正完了 ✅

`App.tsx` を更新して、企業チャレンジとマッチング機能のルートが使えるようになりました。

## 次のステップ

### 1. 環境変数の設定

`.env.local` ファイルが必要です。まだ作成していない場合：

```bash
# プロジェクトルートで実行
cat > .env.local << 'EOF'
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
EOF
```

**重要:** 実際のSupabaseプロジェクトのURLとキーに置き換えてください。

### 2. Supabaseの設定確認

まだSupabaseプロジェクトを作成していない場合：

1. https://supabase.com/ でプロジェクト作成
2. SQL Editorで `SETUP_DATABASE_FULL.sql` を実行
3. Settings → API で以下をコピー：
   - Project URL
   - anon public key
4. `.env.local` に貼り付け

### 3. 開発サーバーを再起動

```bash
# サーバーを停止（Ctrl+C）して再起動
npm run dev
```

## トラブルシューティング

### "Supabase credentials not found" 警告が出る

**原因:** `.env.local` が設定されていない

**解決策:** 上記の手順1を実行

### ログイン画面が表示される

**正常です！** 正式版は認証が必要です。

1. 「新規登録」タブをクリック
2. 必要事項を入力
3. メール確認
4. ログイン

### チャレンジが表示されない

**原因:** チャレンジが作成されていない

**解決策:** Supabase SQL Editorで実行

```sql
INSERT INTO challenges (
  company_name,
  company_logo,
  title,
  description,
  reward,
  deadline,
  category
)
VALUES (
  'サンプル企業',
  '🏢',
  'テストチャレンジ',
  'これはテスト用のチャレンジです',
  10000,
  CURRENT_DATE + INTERVAL '30 days',
  'テスト'
);
```

### マッチング候補が表示されない

**原因:** マッチング候補が生成されていない

**解決策:** 複数のユーザーアカウントを作成後、手動で候補を追加

```sql
-- ユーザーIDを確認
SELECT id, display_name FROM profiles;

-- マッチング候補を作成
INSERT INTO matching_suggestions (user_id, suggested_user_id, compatibility_score, reason)
VALUES ('ユーザーAのID', 'ユーザーBのID', 85, 'テスト');
```

## デモモードで試す場合

Supabaseなしでデモとして動作させたい場合：

```bash
# App.tsxを元に戻す
git checkout src/app/App.tsx

# または手動で編集して routes-with-data を routes に変更
```

**注意:** デモモードでは企業チャレンジとマッチングは動作しません（データ保存なし）

---

**これで完全版が動作するはずです！🎉**
