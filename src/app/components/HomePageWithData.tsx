import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  Stack,
  Paper,
  Avatar,
  Collapse,
  Divider,
  Popover,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkedIcon,
  Share as ShareIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  ChatBubbleOutline as CommentIcon,
  EmojiObjects as InsightIcon,
  FavoriteBorder as ResonanceIcon,
  Psychology as ThinkingIcon,
  AutoAwesome as InspirationIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useAuth } from './AuthProvider';
import {
  getPublicThoughts,
  getPrivateNotes,
  createThought,
  addReaction,
  getReactionCounts,
  addReply,
  getReplies,
  addBookmark,
  removeBookmark,
  getBookmarks,
  addResonator,
  removeResonator,
  getResonators,
} from '../../lib/database';

interface Thought {
  id: string;
  content: string;
  created_at: string;
  tags: string[] | null;
  user_id: string;
  is_private: boolean;
  allow_replies: boolean;
  profiles: {
    display_name: string;
    avatar: string | null;
  };
}

export function HomePageWithData() {
  const { user } = useAuth();
  const [thoughts, setThoughts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newThought, setNewThought] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [isPrivateNote, setIsPrivateNote] = useState(false);
  const [allowReplies, setAllowReplies] = useState(false);
  const [showPrivateNotes, setShowPrivateNotes] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [resonatorIds, setResonatorIds] = useState<string[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedThought, setExpandedThought] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, any[]>>({});
  const [reactions, setReactions] = useState<Record<string, any>>({});
  const [reactionAnchor, setReactionAnchor] = useState<{
    element: HTMLElement | null;
    thoughtId: string | null;
  }>({ element: null, thoughtId: null });

  useEffect(() => {
    loadData();
  }, [showPrivateNotes, user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 投稿を取得
      const thoughtsData = showPrivateNotes
        ? await getPrivateNotes(user.id)
        : await getPublicThoughts();

      setThoughts(thoughtsData || []);

      // ブックマークを取得
      const bookmarks = await getBookmarks(user.id);
      setBookmarkedIds(bookmarks);

      // 共鳴者を取得
      const resonatorsData = await getResonators(user.id);
      setResonatorIds(resonatorsData.map((r: any) => r.resonator_id));

      // 評価数を取得
      const reactionCounts: Record<string, any> = {};
      for (const thought of thoughtsData || []) {
        const counts = await getReactionCounts(thought.id);
        reactionCounts[thought.id] = counts;
      }
      setReactions(reactionCounts);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddThought = async () => {
    if (!user || !newThought.trim()) return;

    try {
      await createThought(
        user.id,
        newThought.trim(),
        [],
        isPrivateNote,
        isPrivateNote ? false : allowReplies
      );

      setNewThought('');
      setIsComposing(false);
      setIsPrivateNote(false);
      setAllowReplies(false);

      // データを再読み込み
      await loadData();
    } catch (error) {
      console.error('Failed to create thought:', error);
      alert('投稿に失敗しました');
    }
  };

  const handleReaction = async (
    thoughtId: string,
    reactionType: 'insight' | 'resonance' | 'thinking' | 'inspiration'
  ) => {
    if (!user) return;

    try {
      await addReaction(thoughtId, user.id, reactionType);
      setReactionAnchor({ element: null, thoughtId: null });

      // 評価数を更新
      const counts = await getReactionCounts(thoughtId);
      setReactions((prev) => ({ ...prev, [thoughtId]: counts }));
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleToggleBookmark = async (thoughtId: string) => {
    if (!user) return;

    try {
      if (bookmarkedIds.includes(thoughtId)) {
        await removeBookmark(user.id, thoughtId);
        setBookmarkedIds(bookmarkedIds.filter((id) => id !== thoughtId));
      } else {
        await addBookmark(user.id, thoughtId);
        setBookmarkedIds([...bookmarkedIds, thoughtId]);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleToggleResonator = async (userId: string) => {
    if (!user) return;

    try {
      if (resonatorIds.includes(userId)) {
        await removeResonator(user.id, userId);
        setResonatorIds(resonatorIds.filter((id) => id !== userId));
      } else {
        await addResonator(user.id, userId);
        setResonatorIds([...resonatorIds, userId]);
      }
    } catch (error) {
      console.error('Failed to toggle resonator:', error);
    }
  };

  const handleToggleReplies = async (thoughtId: string) => {
    if (expandedThought === thoughtId) {
      setExpandedThought(null);
    } else {
      setExpandedThought(thoughtId);
      // 返信を取得
      if (!replies[thoughtId]) {
        try {
          const repliesData = await getReplies(thoughtId);
          setReplies((prev) => ({ ...prev, [thoughtId]: repliesData }));
        } catch (error) {
          console.error('Failed to load replies:', error);
        }
      }
    }
  };

  const handleAddReply = async (thoughtId: string) => {
    if (!user || !replyText.trim()) return;

    try {
      await addReply(thoughtId, user.id, replyText.trim());
      setReplyText('');
      setReplyingTo(null);

      // 返信を再読み込み
      const repliesData = await getReplies(thoughtId);
      setReplies((prev) => ({ ...prev, [thoughtId]: repliesData }));
    } catch (error) {
      console.error('Failed to add reply:', error);
      alert('返信に失敗しました');
    }
  };

  const displayedThoughts = thoughts;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#2d3748', mb: 1 }}>
          日々の気づき
        </Typography>
        <Typography variant="body2" sx={{ color: '#718096' }}>
          日常の些細な気づきを共有しましょう
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} sx={{ mb: 3 }} justifyContent="center">
        <Chip
          label="みんなの投稿"
          onClick={() => setShowPrivateNotes(false)}
          sx={{
            bgcolor: !showPrivateNotes ? '#6366f1' : '#e5e7eb',
            color: !showPrivateNotes ? 'white' : '#4a5568',
            cursor: 'pointer',
            '&:hover': { bgcolor: !showPrivateNotes ? '#4f46e5' : '#d1d5db' },
          }}
        />
        <Chip
          label="自分の書き留め"
          onClick={() => setShowPrivateNotes(true)}
          sx={{
            bgcolor: showPrivateNotes ? '#6366f1' : '#e5e7eb',
            color: showPrivateNotes ? 'white' : '#4a5568',
            cursor: 'pointer',
            '&:hover': { bgcolor: showPrivateNotes ? '#4f46e5' : '#d1d5db' },
          }}
        />
      </Stack>

      {!isComposing ? (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsComposing(true)}
          fullWidth
          sx={{
            mb: 3,
            py: 1.5,
            bgcolor: '#6366f1',
            '&:hover': { bgcolor: '#4f46e5' },
            textTransform: 'none',
            fontSize: '1rem',
            borderRadius: 2,
          }}
        >
          新しい気づきを書く
        </Button>
      ) : (
        <Paper elevation={3} sx={{ mb: 3, p: 3, borderRadius: 2 }}>
          <TextField
            multiline
            rows={4}
            fullWidth
            placeholder="今日の気づきや思索を自由に書いてください..."
            value={newThought}
            onChange={(e) => setNewThought(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                label={isPrivateNote ? '🔒 自分だけに表示' : '🌐 みんなに公開'}
                onClick={() => setIsPrivateNote(!isPrivateNote)}
                sx={{
                  bgcolor: isPrivateNote ? '#fef3c7' : '#dbeafe',
                  color: isPrivateNote ? '#92400e' : '#1e40af',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              />
              {!isPrivateNote && (
                <Chip
                  label={allowReplies ? '💬 返信可能' : '🚫 返信不可'}
                  onClick={() => setAllowReplies(!allowReplies)}
                  sx={{
                    bgcolor: allowReplies ? '#dcfce7' : '#fee2e2',
                    color: allowReplies ? '#166534' : '#991b1b',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                />
              )}
            </Stack>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => {
                  setIsComposing(false);
                  setNewThought('');
                  setIsPrivateNote(false);
                  setAllowReplies(false);
                }}
                sx={{ textTransform: 'none' }}
              >
                キャンセル
              </Button>
              <Button
                variant="contained"
                onClick={handleAddThought}
                disabled={!newThought.trim()}
                sx={{
                  bgcolor: '#6366f1',
                  '&:hover': { bgcolor: '#4f46e5' },
                  textTransform: 'none',
                }}
              >
                {isPrivateNote ? '書き留める' : '投稿する'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      <Stack spacing={3}>
        {displayedThoughts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="body1" sx={{ color: '#a0aec0', mb: 2 }}>
              {showPrivateNotes ? 'まだ書き留めがありません' : '投稿がありません'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#cbd5e0' }}>
              {showPrivateNotes
                ? '自分だけのメモや気づきを書き留めましょう'
                : '最初の投稿をしてみましょう'}
            </Typography>
          </Box>
        ) : (
          displayedThoughts.map((thought) => {
            const isBookmarked = bookmarkedIds.includes(thought.id);
            const isResonator = resonatorIds.includes(thought.user_id);
            const thoughtReactions = reactions[thought.id] || {
              insight: 0,
              resonance: 0,
              thinking: 0,
              inspiration: 0,
            };
            const replyCount = replies[thought.id]?.length || 0;

            return (
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
                  border: thought.is_private ? '2px solid #fbbf24' : 'none',
                  bgcolor: thought.is_private ? '#fffbeb' : 'white',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Avatar sx={{ width: 40, height: 40, fontSize: '1.25rem' }}>
                      {thought.profiles.avatar || '👤'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#2d3748' }}>
                          {thought.profiles.display_name}
                        </Typography>
                        {thought.user_id !== user?.id && !thought.is_private && (
                          <IconButton
                            size="small"
                            onClick={() => handleToggleResonator(thought.user_id)}
                            sx={{
                              color: isResonator ? '#6366f1' : '#cbd5e0',
                            }}
                          >
                            {isResonator ? (
                              <PersonRemoveIcon fontSize="small" />
                            ) : (
                              <PersonAddIcon fontSize="small" />
                            )}
                          </IconButton>
                        )}
                      </Stack>
                      <Typography variant="caption" sx={{ color: '#a0aec0' }}>
                        {format(new Date(thought.created_at), 'M月d日 HH:mm', { locale: ja })}
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography
                    variant="body1"
                    sx={{
                      mb: 2,
                      lineHeight: 1.8,
                      color: '#2d3748',
                    }}
                  >
                    {thought.content}
                  </Typography>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mt: 2 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      {thought.is_private && (
                        <Chip
                          label="🔒 自分のみ"
                          size="small"
                          sx={{
                            bgcolor: '#fef3c7',
                            color: '#92400e',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                          }}
                        />
                      )}
                      {!thought.is_private && thought.allow_replies && (
                        <Chip
                          label="💬 返信可"
                          size="small"
                          sx={{
                            bgcolor: '#dcfce7',
                            color: '#166534',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Stack>

                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {!thought.is_private && (
                        <>
                          <IconButton
                            size="small"
                            onClick={(e) =>
                              setReactionAnchor({ element: e.currentTarget, thoughtId: thought.id })
                            }
                            sx={{ color: '#6366f1' }}
                          >
                            <InsightIcon fontSize="small" />
                            <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.7rem' }}>
                              {Object.values(thoughtReactions).reduce((a: number, b: number) => a + b, 0)}
                            </Typography>
                          </IconButton>
                          {thought.allow_replies && (
                            <IconButton
                              size="small"
                              onClick={() => handleToggleReplies(thought.id)}
                              sx={{ color: '#718096' }}
                            >
                              <CommentIcon fontSize="small" />
                              <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.7rem' }}>
                                {replyCount}
                              </Typography>
                            </IconButton>
                          )}
                        </>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleToggleBookmark(thought.id)}
                        sx={{
                          color: isBookmarked ? '#6366f1' : '#cbd5e0',
                        }}
                      >
                        {isBookmarked ? (
                          <BookmarkedIcon fontSize="small" />
                        ) : (
                          <BookmarkIcon fontSize="small" />
                        )}
                      </IconButton>
                      {!thought.is_private && (
                        <IconButton size="small" sx={{ color: '#cbd5e0' }}>
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </Stack>

                  {thought.allow_replies && (
                    <Collapse in={expandedThought === thought.id} timeout="auto" unmountOnExit>
                      <Divider sx={{ my: 2 }} />
                      <Box>
                        <Stack spacing={2} sx={{ mb: 2 }}>
                          {replies[thought.id]?.map((reply: any) => (
                            <Box key={reply.id} sx={{ pl: 2, borderLeft: '2px solid #e5e7eb' }}>
                              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                  {reply.profiles.avatar || '👤'}
                                </Avatar>
                                <Box>
                                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#4a5568' }}>
                                    {reply.profiles.display_name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#a0aec0', ml: 1 }}>
                                    {format(new Date(reply.created_at), 'M月d日 HH:mm', { locale: ja })}
                                  </Typography>
                                </Box>
                              </Stack>
                              <Typography variant="body2" sx={{ color: '#2d3748', lineHeight: 1.6 }}>
                                {reply.content}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>

                        {replyingTo === thought.id ? (
                          <Box>
                            <TextField
                              multiline
                              rows={2}
                              fullWidth
                              size="small"
                              placeholder="返信を書く..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              variant="outlined"
                              sx={{ mb: 1 }}
                            />
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText('');
                                }}
                                sx={{ textTransform: 'none' }}
                              >
                                キャンセル
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleAddReply(thought.id)}
                                disabled={!replyText.trim()}
                                sx={{
                                  bgcolor: '#6366f1',
                                  '&:hover': { bgcolor: '#4f46e5' },
                                  textTransform: 'none',
                                }}
                              >
                                返信
                              </Button>
                            </Stack>
                          </Box>
                        ) : (
                          <Button
                            size="small"
                            startIcon={<CommentIcon />}
                            onClick={() => setReplyingTo(thought.id)}
                            sx={{ textTransform: 'none', color: '#6366f1' }}
                          >
                            返信する
                          </Button>
                        )}
                      </Box>
                    </Collapse>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </Stack>

      <Popover
        open={Boolean(reactionAnchor.element)}
        anchorEl={reactionAnchor.element}
        onClose={() => setReactionAnchor({ element: null, thoughtId: null })}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="caption" sx={{ color: '#718096', display: 'block', mb: 1 }}>
            この投稿は...
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton
              onClick={() => reactionAnchor.thoughtId && handleReaction(reactionAnchor.thoughtId, 'insight')}
              sx={{
                flexDirection: 'column',
                bgcolor: '#fef3c7',
                '&:hover': { bgcolor: '#fde68a' },
                borderRadius: 2,
                p: 1,
              }}
            >
              <InsightIcon sx={{ color: '#f59e0b', fontSize: 28 }} />
              <Typography variant="caption" sx={{ color: '#92400e', fontSize: '0.65rem', mt: 0.5 }}>
                気づき
              </Typography>
            </IconButton>
            <IconButton
              onClick={() => reactionAnchor.thoughtId && handleReaction(reactionAnchor.thoughtId, 'resonance')}
              sx={{
                flexDirection: 'column',
                bgcolor: '#fce7f3',
                '&:hover': { bgcolor: '#fbcfe8' },
                borderRadius: 2,
                p: 1,
              }}
            >
              <ResonanceIcon sx={{ color: '#ec4899', fontSize: 28 }} />
              <Typography variant="caption" sx={{ color: '#831843', fontSize: '0.65rem', mt: 0.5 }}>
                共感
              </Typography>
            </IconButton>
            <IconButton
              onClick={() => reactionAnchor.thoughtId && handleReaction(reactionAnchor.thoughtId, 'thinking')}
              sx={{
                flexDirection: 'column',
                bgcolor: '#dbeafe',
                '&:hover': { bgcolor: '#bfdbfe' },
                borderRadius: 2,
                p: 1,
              }}
            >
              <ThinkingIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
              <Typography variant="caption" sx={{ color: '#1e3a8a', fontSize: '0.65rem', mt: 0.5 }}>
                考察
              </Typography>
            </IconButton>
            <IconButton
              onClick={() => reactionAnchor.thoughtId && handleReaction(reactionAnchor.thoughtId, 'inspiration')}
              sx={{
                flexDirection: 'column',
                bgcolor: '#f3e8ff',
                '&:hover': { bgcolor: '#e9d5ff' },
                borderRadius: 2,
                p: 1,
              }}
            >
              <InspirationIcon sx={{ color: '#a855f7', fontSize: 28 }} />
              <Typography variant="caption" sx={{ color: '#581c87', fontSize: '0.65rem', mt: 0.5 }}>
                刺激的
              </Typography>
            </IconButton>
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
}
