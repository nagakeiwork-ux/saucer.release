import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Lightbulb as LightbulbIcon } from '@mui/icons-material';
import { signIn, signUp } from '../../lib/auth';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await signIn(email, password);
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      setError('');

      if (!displayName.trim()) {
        setError('表示名を入力してください');
        return;
      }

      await signUp(email, password, displayName);
      setError('');
      alert('確認メールを送信しました。メールのリンクをクリックしてアカウントを有効化してください。');
    } catch (err: any) {
      setError(err.message || '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#fafafa',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }} elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LightbulbIcon sx={{ fontSize: 48, color: '#6366f1', mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#2d3748' }}>
              Idea Pocket
            </Typography>
            <Typography variant="body2" sx={{ color: '#718096', mt: 1 }}>
              日々の気づきを共有しましょう
            </Typography>
          </Box>

          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="ログイン" sx={{ flex: 1, textTransform: 'none' }} />
            <Tab label="新規登録" sx={{ flex: 1, textTransform: 'none' }} />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {tab === 0 ? (
            // ログインフォーム
            <Box>
              <TextField
                fullWidth
                label="メールアドレス"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
                disabled={loading}
              />
              <TextField
                fullWidth
                label="パスワード"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 3 }}
                disabled={loading}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleSignIn}
                disabled={loading || !email || !password}
                sx={{
                  bgcolor: '#6366f1',
                  '&:hover': { bgcolor: '#4f46e5' },
                  textTransform: 'none',
                  py: 1.5,
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'ログイン'}
              </Button>
            </Box>
          ) : (
            // 新規登録フォーム
            <Box>
              <TextField
                fullWidth
                label="表示名"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                sx={{ mb: 2 }}
                disabled={loading}
                helperText="他のユーザーに表示される名前"
              />
              <TextField
                fullWidth
                label="メールアドレス"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
                disabled={loading}
              />
              <TextField
                fullWidth
                label="パスワード"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 3 }}
                disabled={loading}
                helperText="8文字以上"
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleSignUp}
                disabled={loading || !email || !password || !displayName}
                sx={{
                  bgcolor: '#6366f1',
                  '&:hover': { bgcolor: '#4f46e5' },
                  textTransform: 'none',
                  py: 1.5,
                }}
              >
                {loading ? <CircularProgress size={24} /> : '新規登録'}
              </Button>
            </Box>
          )}

          <Typography variant="caption" sx={{ display: 'block', mt: 3, color: '#a0aec0', textAlign: 'center' }}>
            登録することで、利用規約とプライバシーポリシーに同意したものとみなされます
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
