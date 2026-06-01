import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Edit as EditIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const AVATAR_OPTIONS = [
  { id: 'lion', emoji: '🦁', name: 'ライオン' },
  { id: 'wolf', emoji: '🐺', name: '狼' },
  { id: 'elephant', emoji: '🐘', name: '象' },
  { id: 'cat', emoji: '🐱', name: '猫' },
  { id: 'civet', emoji: '🦝', name: 'ハクビシン' }, // 絵文字ではアライグマで代用
];

export function ProfilePage() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState<string>('lion');
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);

  // ローカルストレージからアバターを読み込み
  useEffect(() => {
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
      setSelectedAvatar(savedAvatar);
    }
  }, []);

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

  const handleAvatarChange = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    localStorage.setItem('userAvatar', avatarId);
    setShowAvatarDialog(false);
  };

  // ユーザー情報を取得
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'ゲストユーザー';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const currentAvatar = AVATAR_OPTIONS.find(a => a.id === selectedAvatar);

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4, position: 'relative' }}>
        {user ? (
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
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

        <Box sx={{ position: 'relative', display: 'inline-block' }}>
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
                fontSize: '3rem',
                bgcolor: '#6366f1',
                margin: '0 auto',
                mb: 2,
              }}
            >
              {currentAvatar?.emoji}
            </Avatar>
          )}
          <Button
            size="small"
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setShowAvatarDialog(true)}
            sx={{
              position: 'absolute',
              bottom: 16,
              right: -10,
              minWidth: 'auto',
              px: 1,
              py: 0.5,
              fontSize: '0.75rem',
              bgcolor: '#6366f1',
              '&:hover': { bgcolor: '#4f46e5' },
            }}
          >
            変更
          </Button>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 600, color: '#2d3748', mb: 0.5 }}>
          {displayName}
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

      {/* アバター選択ダイアログ */}
      <Dialog open={showAvatarDialog} onClose={() => setShowAvatarDialog(false)}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600 }}>
          アバターを選択
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {AVATAR_OPTIONS.map((avatar) => (
              <Grid item xs={4} key={avatar.id}>
                <Box
                  onClick={() => handleAvatarChange(avatar.id)}
                  sx={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    p: 2,
                    borderRadius: 2,
                    border: selectedAvatar === avatar.id ? '3px solid #6366f1' : '2px solid #e5e7eb',
                    bgcolor: selectedAvatar === avatar.id ? '#f5f3ff' : 'white',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#f5f3ff',
                      borderColor: '#6366f1',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '3rem', mb: 1 }}>
                    {avatar.emoji}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#4a5568', fontWeight: 500 }}>
                    {avatar.name}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>

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
                No. 999 {!user && '(ゲストユーザー)'}
              </Typography>
            </Box>
            {!user && (
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
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
