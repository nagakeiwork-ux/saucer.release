import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  Button,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Edit as EditIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

export function ProfilePage() {
  const { user, signInWithGoogle, signOut } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      alert('ログインに失敗しました。もう一度お試しください。');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // ユーザー情報を取得
  const displayName = user?.user_metadata?.name || user?.email || 'ユーザー';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const email = user?.email || 'guest@saucer.app';

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4, position: 'relative' }}>
        {user ? (
          <Button
            variant="outlined"
            startIcon={<LoginIcon />}
            onClick={handleLogout}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              borderColor: '#ef4444',
              color: '#ef4444',
              textTransform: 'none',
              fontSize: '0.875rem',
              '&:hover': { borderColor: '#dc2626', bgcolor: '#fef2f2' },
            }}
          >
            ログアウト
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={handleGoogleLogin}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bgcolor: '#4285f4',
              color: 'white',
              textTransform: 'none',
              fontSize: '0.875rem',
              '&:hover': { bgcolor: '#357ae8' },
            }}
          >
            Googleでログイン
          </Button>
        )}
        
        {avatarUrl ? (
          <Avatar
            src={avatarUrl}
            sx={{
              width: 80,
              height: 80,
              margin: '0 auto',
              mb: 2,
            }}
          />
        ) : (
          <Avatar
            sx={{
              width: 80,
              height: 80,
              fontSize: '2.5rem',
              bgcolor: '#6366f1',
              margin: '0 auto',
              mb: 2,
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
        )}
        
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#2d3748', mb: 0.5 }}>
          {displayName}
        </Typography>
        <Typography variant="body2" sx={{ color: '#718096', mb: 1 }}>
          {email}
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
          <Chip
            label="No. 999"
            size="small"
            sx={{ bgcolor: '#ede9fe', color: '#6366f1', fontWeight: 600 }}
          />
          <Chip
            label="2026年5月12日登録"
            size="small"
            sx={{ bgcolor: '#dbeafe', color: '#1e40af' }}
          />
        </Stack>
      </Box>

      <Card
        elevation={3}
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: 'white',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={4} justifyContent="center">
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                12
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                投稿した気づき
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                1
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                読者
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                8
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                ブックマーク
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <TrophyIcon sx={{ color: '#6366f1' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
              獲得バッジ
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <Chip
              label="✍️ 初めての投稿"
              sx={{ bgcolor: '#ede9fe', color: '#6366f1', fontWeight: 500 }}
            />
            <Chip
              label="📚 10投稿達成"
              sx={{ bgcolor: '#ede9fe', color: '#6366f1', fontWeight: 500 }}
            />
            <Chip
              label="💫 初めての読者"
              sx={{ bgcolor: '#fae8ff', color: '#a855f7', fontWeight: 500 }}
            />
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={2}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <EditIcon sx={{ color: '#6366f1' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
              プロフィール情報
            </Typography>
          </Stack>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" sx={{ color: '#718096', display: 'block', mb: 0.5 }}>
                登録日
              </Typography>
              <Typography variant="body2" sx={{ color: '#2d3748' }}>
                2026年5月12日
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#718096', display: 'block', mb: 0.5 }}>
                登録番号
              </Typography>
              <Typography variant="body2" sx={{ color: '#2d3748' }}>
                No. 999 (ゲストユーザー)
              </Typography>
            </Box>
            <Box sx={{ bgcolor: '#fef3c7', p: 2, borderRadius: 1, mt: 2 }}>
              <Typography variant="body2" sx={{ color: '#92400e', fontWeight: 500 }}>
                💡 Googleアカウントでログインすると、全機能が利用できます
              </Typography>
              <Typography variant="caption" sx={{ color: '#92400e', display: 'block', mt: 1 }}>
                ・データの永続化<br />
                ・プロフィール編集<br />
                ・すべての投稿機能
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
