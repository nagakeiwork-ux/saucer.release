import { useParams } from 'react-router';
import { useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Tag as NumberIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { users } from '../data/mockData';
import { useState } from 'react';
import { generateMockThoughts } from '../data/mockData';

interface Reaction {
  insight: number;
  resonance: number;
  thinking: number;
  inspiration: number;
}

interface Thought {
  id: string;
  content: string;
  createdAt: Date;
  tags?: string[];
  author: {
    id: string;
    name: string;
    avatar: string;
    registrationNumber: number;
    registeredAt: Date;
  };
  isBookmarked?: boolean;
  reactions: Reaction;
  replyCount: number;
  isPrivate?: boolean;
  allowReplies?: boolean;
}

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [allThoughts] = useState<Thought[]>(() => generateMockThoughts());

  const user = users.find((u) => u.id === userId);

  const userThoughts = useMemo(() => {
    return allThoughts.filter((t) => t.author.id === userId);
  }, [allThoughts, userId]);

  const totalReactions = useMemo(() => {
    return userThoughts.reduce((sum, t) => {
      return sum + Object.values(t.reactions).reduce((a, b) => a + b, 0);
    }, 0);
  }, [userThoughts]);

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" sx={{ color: '#a0aec0' }}>
          ユーザーが見つかりません
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
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
          {user.avatar}
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#2d3748', mb: 0.5 }}>
          {user.name}
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1 }}>
          <Chip
            icon={<NumberIcon />}
            label={`No. ${user.registrationNumber}`}
            size="small"
            sx={{ bgcolor: '#ede9fe', color: '#6366f1', fontWeight: 600 }}
          />
          <Chip
            icon={<CalendarIcon />}
            label={format(user.registeredAt, 'yyyy年M月d日登録', { locale: ja })}
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
                {userThoughts.length}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                投稿した気づき
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {totalReactions}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                獲得リアクション
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748', mb: 2 }}>
        投稿履歴 ({userThoughts.length}件)
      </Typography>

      {userThoughts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" sx={{ color: '#a0aec0' }}>
            まだ投稿がありません
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {userThoughts.map((thought) => (
            <Card
              key={thought.id}
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
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#a0aec0' }}>
                    {format(thought.createdAt, 'yyyy年M月d日 HH:mm', { locale: ja })}
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    {thought.tags?.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{
                          bgcolor: '#ede9fe',
                          color: '#6366f1',
                          fontSize: '0.7rem',
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>

                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    lineHeight: 1.8,
                    color: '#2d3748',
                  }}
                >
                  {thought.content}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Stack direction="row" spacing={3} sx={{ fontSize: '0.8rem', color: '#718096' }}>
                  <Box>💡 気づき: {thought.reactions.insight}</Box>
                  <Box>💓 共感: {thought.reactions.resonance}</Box>
                  <Box>🤔 考察: {thought.reactions.thinking}</Box>
                  <Box>✨ 刺激的: {thought.reactions.inspiration}</Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
