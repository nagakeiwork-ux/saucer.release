import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  IconButton,
  Chip,
  Divider,
  Button,
} from '@mui/material';
import {
  PersonRemove as PersonRemoveIcon,
  Lightbulb as LightbulbIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Resonator {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  thoughtCount: number;
  latestThought: {
    content: string;
    createdAt: Date;
  };
}

export function ResonatorsPage() {
  const navigate = useNavigate();
  const [resonators, setResonators] = useState<Resonator[]>([
    {
      id: 'user2',
      name: '佐藤 美咲',
      avatar: '👩‍🎨',
      bio: 'アートと心理学を学んでいます',
      thoughtCount: 24,
      latestThought: {
        content: '人は他人の失敗には寛容だが、自分の失敗には厳しい。逆であるべきなのかもしれない。',
        createdAt: new Date(2026, 4, 10, 14, 15),
      },
    },
    {
      id: 'user1',
      name: '田中 健太',
      avatar: '👨‍💼',
      bio: '日々の気づきを大切にしています',
      thoughtCount: 32,
      latestThought: {
        content: '朝のコーヒーを飲みながら窓の外を見ていたら、木漏れ日が葉の間を通って床に模様を作っていた。',
        createdAt: new Date(2026, 4, 11, 7, 30),
      },
    },
    {
      id: 'user3',
      name: '山田 悠人',
      avatar: '👨‍🔬',
      bio: '科学と哲学の接点を探求中',
      thoughtCount: 28,
      latestThought: {
        content: '沈黙は言葉よりも多くを語ることがある。特に親しい人との間では。',
        createdAt: new Date(2026, 4, 9, 21, 45),
      },
    },
  ]);

  const handleRemoveResonator = (userId: string) => {
    setResonators(resonators.filter((r) => r.id !== userId));
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/user/${userId}`);
  };

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <LightbulbIcon sx={{ fontSize: 48, color: '#6366f1', mb: 1 }} />
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#2d3748', mb: 1 }}>
          読者
        </Typography>
        <Typography variant="body2" sx={{ color: '#718096' }}>
          フォロー中のユーザー
        </Typography>
      </Box>

      {resonators.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" sx={{ color: '#a0aec0', mb: 2 }}>
            まだ読者がいません
          </Typography>
          <Typography variant="body2" sx={{ color: '#cbd5e0' }}>
            ホームで気になる投稿者を見つけて、読者に追加してみましょう
          </Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {resonators.map((resonator) => (
            <Card
              key={resonator.id}
              elevation={2}
              sx={{
                borderRadius: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      fontSize: '2rem',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.1)' },
                    }}
                    onClick={() => handleViewProfile(resonator.id)}
                  >
                    {resonator.avatar}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#2d3748',
                        cursor: 'pointer',
                        '&:hover': { color: '#6366f1' },
                      }}
                      onClick={() => handleViewProfile(resonator.id)}
                    >
                      {resonator.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#718096', mb: 1 }}>
                      {resonator.bio}
                    </Typography>
                    <Chip
                      label={`${resonator.thoughtCount}件の投稿`}
                      size="small"
                      sx={{ bgcolor: '#ede9fe', color: '#6366f1' }}
                    />
                  </Box>
                  <IconButton
                    onClick={() => handleRemoveResonator(resonator.id)}
                    sx={{ color: '#cbd5e0', alignSelf: 'flex-start' }}
                  >
                    <PersonRemoveIcon />
                  </IconButton>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#718096', display: 'block', mb: 1 }}>
                    最新の投稿
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: '#f7fafc',
                      p: 2,
                      borderRadius: 1,
                      borderLeft: '3px solid #6366f1',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#2d3748', mb: 1, lineHeight: 1.7 }}>
                      {resonator.latestThought.content}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#a0aec0' }}>
                      {format(resonator.latestThought.createdAt, 'M月d日 HH:mm', { locale: ja })}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => handleViewProfile(resonator.id)}
                  sx={{
                    textTransform: 'none',
                    borderColor: '#6366f1',
                    color: '#6366f1',
                    '&:hover': {
                      borderColor: '#4f46e5',
                      bgcolor: '#f5f3ff',
                    },
                  }}
                >
                  プロフィールを見る
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
