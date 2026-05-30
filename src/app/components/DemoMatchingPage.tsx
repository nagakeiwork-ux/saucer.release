import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Stack,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Chat as ChatIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';

const mockUsers = [
  {
    id: '1',
    name: '田中 健太',
    avatar: '👨‍💼',
    bio: 'デザイン思考に興味があります。日々の小さな発見を大切にしています。',
    compatibility: 92,
    reason: '投稿内容に共通点が多く見られます',
  },
  {
    id: '2',
    name: '佐藤 美咲',
    avatar: '👩‍🎨',
    bio: 'アートと心理学を学んでいます。人の心の動きに興味があります。',
    compatibility: 87,
    reason: '同じトピックに関心を持っています',
  },
  {
    id: '3',
    name: '山田 悠人',
    avatar: '👨‍🔬',
    bio: 'テクノロジーで社会課題を解決したい。イノベーションに関心があります。',
    compatibility: 85,
    reason: '思考パターンに類似性があります',
  },
];

export function DemoMatchingPage() {
  const [tabValue, setTabValue] = useState(0);
  const [likedUsers, setLikedUsers] = useState<Set<string>>(new Set());
  const [matches, setMatches] = useState<any[]>([]);

  const handleLike = (userId: string) => {
    setLikedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <FavoriteIcon sx={{ fontSize: 48, color: '#ff6b35', mb: 1 }} />
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#2d3748', mb: 1 }}>
          マッチング
        </Typography>
        <Typography variant="body2" sx={{ color: '#718096' }}>
          思考の合う人と繋がろう（デモモード）
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': { textTransform: 'none' },
            '& .Mui-selected': { color: '#ff6b35' },
            '& .MuiTabs-indicator': { bgcolor: '#ff6b35' },
          }}
        >
          <Tab label={`おすすめ (${mockUsers.length})`} />
          <Tab label={`マッチ (${matches.length})`} />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Stack spacing={3}>
          {mockUsers.map((user) => (
            <Card
              key={user.id}
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
                  <Avatar sx={{ width: 56, height: 56, fontSize: '2rem' }}>
                    {user.avatar}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
                      {user.name}
                    </Typography>
                    <Chip
                      label={`相性 ${user.compatibility}%`}
                      size="small"
                      sx={{
                        bgcolor: '#fff5f0',
                        color: '#ff6b35',
                        fontWeight: 600,
                        mt: 0.5,
                      }}
                    />
                  </Box>
                  <IconButton
                    onClick={() => handleLike(user.id)}
                    sx={{
                      color: likedUsers.has(user.id) ? '#ff6b35' : '#cbd5e0',
                    }}
                  >
                    {likedUsers.has(user.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Stack>

                <Typography variant="body2" sx={{ color: '#4a5568', mb: 2, lineHeight: 1.7 }}>
                  {user.bio}
                </Typography>

                <Box
                  sx={{
                    bgcolor: '#f7fafc',
                    p: 2,
                    borderRadius: 1,
                    mb: 2,
                    borderLeft: '3px solid #ff6b35',
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#718096', display: 'block', mb: 0.5 }}>
                    マッチング理由
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2d3748' }}>
                    {user.reason}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => handleLike(user.id)}
                    disabled={likedUsers.has(user.id)}
                    sx={{
                      bgcolor: '#ff6b35',
                      '&:hover': { bgcolor: '#e55a28' },
                      textTransform: 'none',
                    }}
                  >
                    {likedUsers.has(user.id) ? 'いいね済み' : 'つながる'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {tabValue === 1 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" sx={{ color: '#a0aec0', mb: 2 }}>
            まだマッチした人はいません
          </Typography>
          <Typography variant="body2" sx={{ color: '#cbd5e0' }}>
            おすすめの人とつながってみましょう（デモモード）
          </Typography>
        </Box>
      )}
    </Box>
  );
}
