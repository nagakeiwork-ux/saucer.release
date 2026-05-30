import { useState, useEffect } from 'react';
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
  CircularProgress,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Chat as ChatIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useAuth } from './AuthProvider';
import {
  getMatchingSuggestions,
  sendLike,
  removeLike,
  getMatches,
} from '../../lib/database';

interface MatchingSuggestion {
  id: string;
  suggested_user_id: string;
  compatibility_score: number;
  reason: string | null;
  profiles: {
    id: string;
    display_name: string;
    avatar: string | null;
    bio: string | null;
  };
}

interface Match {
  id: string;
  partner: {
    id: string;
    display_name: string;
    avatar: string | null;
    bio: string | null;
  };
  created_at: string;
}

export function MatchingPageWithData() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [suggestions, setSuggestions] = useState<MatchingSuggestion[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [likedUsers, setLikedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user, tabValue]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      if (tabValue === 0) {
        // おすすめを取得
        const suggestionsData = await getMatchingSuggestions(user.id);
        setSuggestions(suggestionsData || []);
      } else {
        // マッチを取得
        const matchesData = await getMatches(user.id);
        setMatches(matchesData || []);
      }
    } catch (error) {
      console.error('Failed to load matching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (userId: string) => {
    if (!user) return;

    try {
      if (likedUsers.has(userId)) {
        await removeLike(user.id, userId);
        setLikedUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      } else {
        await sendLike(user.id, userId);
        setLikedUsers((prev) => new Set(prev).add(userId));

        // マッチが成立した可能性があるので再読み込み
        setTimeout(() => loadData(), 500);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <FavoriteIcon sx={{ fontSize: 48, color: '#ff6b35', mb: 1 }} />
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#2d3748', mb: 1 }}>
          マッチング
        </Typography>
        <Typography variant="body2" sx={{ color: '#718096' }}>
          思考の合う人と繋がろう
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
          <Tab label={`おすすめ (${suggestions.length})`} />
          <Tab label={`マッチ (${matches.length})`} />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Stack spacing={3}>
          {suggestions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body1" sx={{ color: '#a0aec0', mb: 2 }}>
                現在おすすめのユーザーがいません
              </Typography>
              <Typography variant="body2" sx={{ color: '#cbd5e0' }}>
                もっと投稿して活動すると、マッチング候補が表示されます
              </Typography>
            </Box>
          ) : (
            suggestions.map((suggestion) => (
              <Card
                key={suggestion.id}
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
                      {suggestion.profiles.avatar || '👤'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
                        {suggestion.profiles.display_name}
                      </Typography>
                      <Chip
                        label={`相性 ${suggestion.compatibility_score}%`}
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
                      onClick={() => handleLike(suggestion.suggested_user_id)}
                      sx={{
                        color: likedUsers.has(suggestion.suggested_user_id) ? '#ff6b35' : '#cbd5e0',
                      }}
                    >
                      {likedUsers.has(suggestion.suggested_user_id) ? (
                        <FavoriteIcon />
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                  </Stack>

                  <Typography variant="body2" sx={{ color: '#4a5568', mb: 2, lineHeight: 1.7 }}>
                    {suggestion.profiles.bio || '自己紹介はまだありません'}
                  </Typography>

                  {suggestion.reason && (
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
                        {suggestion.reason}
                      </Typography>
                    </Box>
                  )}

                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="contained"
                      startIcon={<PersonAddIcon />}
                      onClick={() => handleLike(suggestion.suggested_user_id)}
                      disabled={likedUsers.has(suggestion.suggested_user_id)}
                      sx={{
                        bgcolor: '#ff6b35',
                        '&:hover': { bgcolor: '#e55a28' },
                        textTransform: 'none',
                      }}
                    >
                      {likedUsers.has(suggestion.suggested_user_id) ? 'いいね済み' : 'つながる'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      )}

      {tabValue === 1 && (
        <Stack spacing={3}>
          {matches.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body1" sx={{ color: '#a0aec0', mb: 2 }}>
                まだマッチした人はいません
              </Typography>
              <Typography variant="body2" sx={{ color: '#cbd5e0' }}>
                おすすめの人とつながってみましょう
              </Typography>
            </Box>
          ) : (
            matches.map((match) => (
              <Card
                key={match.id}
                elevation={2}
                sx={{
                  borderRadius: 2,
                  border: '2px solid #ff6b35',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Avatar sx={{ width: 56, height: 56, fontSize: '2rem' }}>
                      {match.partner.avatar || '👤'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
                        {match.partner.display_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#a0aec0' }}>
                        {new Date(match.created_at).toLocaleDateString('ja-JP')} にマッチ
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography variant="body2" sx={{ color: '#4a5568', mb: 2, lineHeight: 1.7 }}>
                    {match.partner.bio || '自己紹介はまだありません'}
                  </Typography>

                  <Button
                    variant="contained"
                    startIcon={<ChatIcon />}
                    fullWidth
                    sx={{
                      bgcolor: '#ff6b35',
                      '&:hover': { bgcolor: '#e55a28' },
                      textTransform: 'none',
                    }}
                    onClick={() => alert('メッセージ機能は近日公開予定です')}
                  >
                    メッセージを送る
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      )}
    </Box>
  );
}
