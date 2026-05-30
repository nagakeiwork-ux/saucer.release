import { useState } from 'react';
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
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Send as SendIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';

const mockChallenges = [
  {
    id: '1',
    company_name: 'Tech Innovation株式会社',
    company_logo: '🏢',
    title: 'リモートワーク時代の新しいコミュニケーションツール',
    description: 'オンラインでも対面のような温かみのあるコミュニケーションを実現するアイデアを募集しています。',
    reward: 50000,
    deadline: '2026-06-15',
    category: 'テクノロジー',
    proposals: 23,
  },
  {
    id: '2',
    company_name: 'Green Future株式会社',
    company_logo: '🌱',
    title: '日常生活で実践できるサステナブルな行動',
    description: '誰でも簡単に始められる環境に優しい生活習慣やサービスのアイデアを求めています。',
    reward: 30000,
    deadline: '2026-05-30',
    category: '環境',
    proposals: 45,
  },
  {
    id: '3',
    company_name: 'Health Plus株式会社',
    company_logo: '💊',
    title: '高齢者の健康管理をサポートする仕組み',
    description: 'テクノロジーに不慣れな高齢者でも使いやすい健康管理サービスのアイデアを募集中。',
    reward: 80000,
    deadline: '2026-06-30',
    category: 'ヘルスケア',
    proposals: 12,
  },
];

export function DemoChallengesPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [proposalText, setProposalText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const totalEarnings = 0;

  const handleOpenDialog = (challenge: any) => {
    setSelectedChallenge(challenge);
    setDialogOpen(true);
  };

  const handleSubmitProposal = () => {
    if (selectedChallenge && proposalText.trim()) {
      setProposals([...proposals, { challengeId: selectedChallenge.id }]);
      setProposalText('');
      setDialogOpen(false);
      setSelectedChallenge(null);
      alert('デモモード: 提案を送信しました（データは保存されません）');
    }
  };

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
            提案数: {proposals.length}件 | デモモード
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2d3748' }}>
        募集中のチャレンジ
      </Typography>

      <Stack spacing={3}>
        {mockChallenges.map((challenge) => (
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
                  {challenge.company_logo}
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
                  締切: {new Date(challenge.deadline).toLocaleDateString('ja-JP')} | 提案数: {challenge.proposals}件
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={() => handleOpenDialog(challenge)}
                  disabled={proposals.some((p) => p.challengeId === challenge.id)}
                  sx={{
                    bgcolor: '#ff6b35',
                    '&:hover': { bgcolor: '#e55a28' },
                    textTransform: 'none',
                  }}
                >
                  {proposals.some((p) => p.challengeId === challenge.id) ? '提案済み' : '提案する'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            チャレンジへ提案（デモモード）
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
