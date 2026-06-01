-- Saucer v2.1 データベースアップデート
-- Supabase SQL Editor で実行してください

-- 1. 登録番号をNo.11から開始
-- 既存のシーケンスをリセット
ALTER SEQUENCE profiles_registration_number_seq RESTART WITH 11;

-- 2. データ半永続化設定

-- 非アクティブ投稿の自動削除（6ヶ月間リアクションなし）
CREATE OR REPLACE FUNCTION delete_inactive_thoughts()
RETURNS void AS $$
BEGIN
  DELETE FROM thoughts
  WHERE created_at < NOW() - INTERVAL '6 months'
    AND id NOT IN (
      SELECT DISTINCT thought_id
      FROM reactions
      WHERE created_at > NOW() - INTERVAL '6 months'
    )
    AND id NOT IN (
      SELECT DISTINCT thought_id
      FROM bookmarks
    );
END;
$$ LANGUAGE plpgsql;

-- 非アクティブユーザーの自動削除（1年間ログインなし）
CREATE OR REPLACE FUNCTION delete_inactive_users()
RETURNS void AS $$
BEGIN
  DELETE FROM profiles
  WHERE id IN (
    SELECT id FROM auth.users
    WHERE last_sign_in_at < NOW() - INTERVAL '1 year'
  );
END;
$$ LANGUAGE plpgsql;

-- 完了
SELECT 'Database update v2.1 complete!' as status;
SELECT 'Next registration number will be: 11' as info;