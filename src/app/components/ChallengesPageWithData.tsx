import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Send as SendIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { useAuth } from './AuthProvider';
import {
  getChallenges,
  createProposal,
  getUserProposals,
  getProposalCount,
} from '../../lib/database';

interface Challenge {
  id: string;
  company_name: string;
  company_logo: string | null;
  title: string;
  description: string;
  reward: number;
  deadline: string;
  category: string;
}

interface Proposal {
  id: string;
  challenge_id: string;
  content: string;
  status: string;
  reward: number | null;
  challenges: {
    company_name: string;
    title: string;
    reward: number;
  };
}

export function ChallengesPageWithData() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalCounts, setProposalCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [proposalText, setProposalText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // チャレンジ一覧を取得
      const challengesData = await getChallenges();
      setChallenges(challengesData || []);

      // ユーザーの提案を取得
      const proposalsData = await getUserProposals(user.id);
      setProposals(proposalsData || []);

      // 各チャレンジの提案数を取得
      const counts: Record<string, number> = {};
      for (const challenge of challengesData || []) {
        const count = await getProposalCount(challenge.id);
        counts[challenge.id] = count;
      }
      setProposalCounts(counts);
    } catch (error) {
      console.error('Failed to load challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalEarnings = proposals
    .filter((p) => p.status === 'rewarded' && p.reward)
    .reduce((sum, p) => sum + (p.reward || 0), 0);

  const handleOpenDialog = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setDialogOpen(true);
  };

  const handleSubmitProposal = async () => {
    if (!user || !selectedChallenge || !proposalText.trim()) return;

    try {
      await createProposal(user.id, selectedChallenge.id, proposalText.trim());
      setProposalText('');
      setDialogOpen(false);
      setSelectedChallenge(null);

      // データを再読み込み
      await loadData();
      alert('提案を送信しました！');
    } catch (error: any) {
      console.error('Failed to submit proposal:', error);
      if (error.message?.includes('duplicate')) {
        alert('このチャレンジには既に提案済みです');
      } else {
        alert('提案の送信に失敗しました');
      }
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
        <TrophyIcon sx={{ fontSize: 48, color: '#ff6b35', mb: 1 }} />
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#2d3748', mb: 1 }}>
          企業チャレンジ
        </Typography>
        <Typography variant="body2" sx={{ color: '#718096' }}>
          あなたのアイデアで報酬を獲得
        </Typography>
      </Box>

      <Card
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #ff6b35 0%, #ff8f6b 100%)',
          color: 'white',
        }}
        elevation={3}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <TrendingIcon sx={{ fontSize: 32 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                累計報酬
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ¥{totalEarnings.toLocaleString()}
              </Typography>
            </Box>
          </Stack>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            提案数: {proposals.length}件 | 採用: {proposals.filter((p) => p.status === 'rewarded').length}件
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2d3748' }}>
        募集中のチャレンジ
      </Typography>

      {challenges.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" sx={{ color: '#a0aec0', mb: 2 }}>
            現在募集中のチャレンジはありません
          </Typography>
          <Typography variant="body2" sx={{ color: '#cbd5e0' }}>
            新しいチャレンジをお待ちください
          </Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {challenges.map((challenge) => (
            <Card
              key={challenge.id}
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
                  <Avatar sx={{ width: 48, height: 48, fontSize: '1.5rem' }}>
                    {challenge.company_logo || '🏢'}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ color: '#718096', mb: 0.5 }}>
                      {challenge.company_name}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
                      {challenge.title}
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="body2" sx={{ color: '#4a5568', mb: 2, lineHeight: 1.7 }}>
                  {challenge.description}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip
                    label={challenge.category}
                    size="small"
                    sx={{ bgcolor: '#f0f4ff', color: '#4c6ef5' }}
                  />
                  <Chip
                    label={`¥${challenge.reward.toLocaleString()}`}
                    size="small"
                    sx={{ bgcolor: '#fff5f0', color: '#ff6b35', fontWeight: 600 }}
                  />
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mt: 2 }}
                >
                  <Typography variant="caption" sx={{ color: '#a0aec0' }}>
                    締切: {new Date(challenge.deadline).toLocaleDateString('ja-JP')} | 提案数: {proposalCounts[challenge.id] || 0}件
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={() => handleOpenDialog(challenge)}
                    disabled={proposals.some((p) => p.challenge_id === challenge.id)}
                    sx={{
                      bgcolor: '#ff6b35',
                      '&:hover': { bgcolor: '#e55a28' },
                      textTransform: 'none',
                    }}
                  >
                    {proposals.some((p) => p.challenge_id === challenge.id) ? '提案済み' : '提案する'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            チャレンジへ提案
          </Typography>
          {selectedChallenge && (
            <Typography variant="body2" sx={{ color: '#718096', mt: 1 }}>
              {selectedChallenge.title}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={6}
            fullWidth
            placeholder="あなたのアイデアや提案を詳しく書いてください..."
            value={proposalText}
            onChange={(e) => setProposalText(e.target.value)}
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setDialogOpen(false);
              setProposalText('');
            }}
            sx={{ textTransform: 'none' }}
          >
            キャンセル
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitProposal}
            disabled={!proposalText.trim()}
            sx={{
              bgcolor: '#ff6b35',
              '&:hover': { bgcolor: '#e55a28' },
              textTransform: 'none',
            }}
          >
            提案を送信
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
