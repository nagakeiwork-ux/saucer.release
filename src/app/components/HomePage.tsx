import { useState, useMemo } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkedIcon,
  Share as ShareIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  ChatBubbleOutline as CommentIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  EmojiObjects as InsightIcon,
  FavoriteBorder as ResonanceIcon,
  Psychology as ThinkingIcon,
  AutoAwesome as InspirationIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { generateMockThoughts, getThoughtsByTag } from '../data/mockData';

interface Reaction {
  insight: number; // 気づき
  resonance: number; // 共感
  thinking: number; // 考えさせられた
  inspiration: number; // 刺激的
}

interface Reply {
  id: string;
  thoughtId: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: Date;
  parentReplyId?: string;
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
  };
  isBookmarked?: boolean;
  reactions: Reaction;
  replyCount: number;
  isPrivate?: boolean; // プライベートな書き留め
  allowReplies?: boolean; // 返信を許可するか
}

export function HomePage() {
  const [resonators, setResonators] = useState<string[]>(['user2']);
  const [thoughts, setThoughts] = useState<Thought[]>(() => generateMockThoughts());
  const [replies, setReplies] = useState<Reply[]>([
    {
      id: 'r1',
      thoughtId: '2',
      content: '確かに。自分に厳しすぎると成長の妨げになることもありますよね。',
      author: { id: 'user1', name: '田中 健太', avatar: '👨‍💼' },
      createdAt: new Date(2026, 4, 10, 15, 30),
    },
    {
      id: 'r2',
      thoughtId: '2',
      content: 'バランスが大切ですね。自己批判と自己受容の間で。',
      author: { id: 'user4', name: '鈴木 里奈', avatar: '👩‍💻' },
      createdAt: new Date(2026, 4, 10, 16, 45),
    },
  ]);
  const [newThought, setNewThought] = useState('');
  const [newTags, setNewTags] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [isPrivateNote, setIsPrivateNote] = useState(false);
  const [allowReplies, setAllowReplies] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [expandedThought, setExpandedThought] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [reactionAnchor, setReactionAnchor] = useState<{
    element: HTMLElement | null;
    thoughtId: string | null;
  }>({ element: null, thoughtId: null });
  const [showPrivateNotes, setShowPrivateNotes] = useState(false);

  const handleAddThought = () => {
    if (newThought.trim()) {
      const tags = newTags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      const thought: Thought = {
        id: Date.now().toString(),
        content: newThought.trim(),
        createdAt: new Date(),
        tags: tags.length > 0 ? tags : undefined,
        author: { id: 'me', name: 'あなた', avatar: '👤' },
        reactions: { insight: 0, resonance: 0, thinking: 0, inspiration: 0 },
        replyCount: 0,
        isPrivate: isPrivateNote,
        allowReplies: isPrivateNote ? false : allowReplies,
      };
      setThoughts([thought, ...thoughts]);
      setNewThought('');
      setNewTags('');
      setIsComposing(false);
      setIsPrivateNote(false);
      setAllowReplies(false);
    }
  };

  const handleToggleResonator = (userId: string) => {
    if (resonators.includes(userId)) {
      setResonators(resonators.filter((id) => id !== userId));
    } else {
      setResonators([...resonators, userId]);
    }
  };

  const handleToggleBookmark = (thoughtId: string) => {
    setThoughts(
      thoughts.map((t) =>
        t.id === thoughtId ? { ...t, isBookmarked: !t.isBookmarked } : t
      )
    );
  };

  const handleReaction = (thoughtId: string, reactionType: keyof Reaction) => {
    setThoughts(
      thoughts.map((t) =>
        t.id === thoughtId
          ? {
              ...t,
              reactions: {
                ...t.reactions,
                [reactionType]: t.reactions[reactionType] + 1,
              },
            }
          : t
      )
    );
    setReactionAnchor({ element: null, thoughtId: null });
  };

  const handleToggleReplies = (thoughtId: string) => {
    setExpandedThought(expandedThought === thoughtId ? null : thoughtId);
  };

  const handleAddReply = (thoughtId: string) => {
    if (replyText.trim()) {
      const newReply: Reply = {
        id: `r${Date.now()}`,
        thoughtId,
        content: replyText.trim(),
        author: { id: 'me', name: 'あなた', avatar: '👤' },
        createdAt: new Date(),
      };
      setReplies([...replies, newReply]);
      setThoughts(
        thoughts.map((t) =>
          t.id === thoughtId ? { ...t, replyCount: t.replyCount + 1 } : t
        )
      );
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const getRepliesToThought = (thoughtId: string) => {
    return replies.filter((r) => r.thoughtId === thoughtId);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  let displayedThoughts = showPrivateNotes
    ? thoughts.filter((t) => t.isPrivate && t.author.id === 'me')
    : thoughts.filter((t) => !t.isPrivate);

  if (selectedTag) {
    displayedThoughts = displayedThoughts.filter((t) => t.tags?.includes(selectedTag));
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

      {selectedTag && (
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Chip
            icon={<FilterIcon />}
            label={`タグ: ${selectedTag}`}
            onDelete={() => setSelectedTag(null)}
            sx={{
              bgcolor: '#6366f1',
              color: 'white',
              fontWeight: 600,
              '& .MuiChip-deleteIcon': { color: 'white' },
            }}
          />
        </Box>
      )}

      <Stack direction="row" spacing={1} sx={{ mb: 3 }} justifyContent="center">
        <Chip
          label="みんなの投稿"
          onClick={() => {
            setShowPrivateNotes(false);
            setSelectedTag(null);
          }}
          sx={{
            bgcolor: !showPrivateNotes ? '#6366f1' : '#e5e7eb',
            color: !showPrivateNotes ? 'white' : '#4a5568',
            cursor: 'pointer',
            '&:hover': { bgcolor: !showPrivateNotes ? '#4f46e5' : '#d1d5db' },
          }}
        />
        <Chip
          label="自分の書き留め"
          onClick={() => {
            setShowPrivateNotes(true);
            setSelectedTag(null);
          }}
          sx={{
            bgcolor: showPrivateNotes ? '#6366f1' : '#e5e7eb',
            color: showPrivateNotes ? 'white' : '#4a5568',
            cursor: 'pointer',
            '&:hover': { bgcolor: showPrivateNotes ? '#4f46e5' : '#d1d5db' },
          }}
        />
      </Stack>

      {selectedTag && (
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Chip
            label={`🏷️ ${selectedTag}`}
            onDelete={() => setSelectedTag(null)}
            sx={{
              bgcolor: '#6366f1',
              color: 'white',
              fontWeight: 600,
              '& .MuiChip-deleteIcon': { color: 'white' },
            }}
          />
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#718096' }}>
            「{selectedTag}」でフィルタリング中
          </Typography>
        </Box>
      )}

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
          <TextField
            fullWidth
            placeholder="タグをカンマ区切りで入力 (例: 朝, 自然, 気づき)"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            variant="outlined"
            size="small"
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
                  setNewTags('');
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
          displayedThoughts.map((thought) => (
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
                border: thought.isPrivate ? '2px solid #fbbf24' : 'none',
                bgcolor: thought.isPrivate ? '#fffbeb' : 'white',
              }}
            >
              <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Avatar sx={{ width: 40, height: 40, fontSize: '1.25rem' }}>
                  {thought.author.avatar}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2d3748' }}>
                      {thought.author.name}
                    </Typography>
                    {thought.author.id !== 'me' && (
                      <IconButton
                        size="small"
                        onClick={() => handleToggleResonator(thought.author.id)}
                        sx={{
                          color: resonators.includes(thought.author.id)
                            ? '#6366f1'
                            : '#cbd5e0',
                        }}
                      >
                        {resonators.includes(thought.author.id) ? (
                          <PersonRemoveIcon fontSize="small" />
                        ) : (
                          <PersonAddIcon fontSize="small" />
                        )}
                      </IconButton>
                    )}
                  </Stack>
                  <Typography variant="caption" sx={{ color: '#a0aec0' }}>
                    {format(thought.createdAt, 'M月d日 HH:mm', { locale: ja })}
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
                  {thought.isPrivate && (
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
                  {!thought.isPrivate && thought.allowReplies && (
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
                  {thought.tags?.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      onClick={() => handleTagClick(tag)}
                      sx={{
                        bgcolor: selectedTag === tag ? '#6366f1' : '#ede9fe',
                        color: selectedTag === tag ? 'white' : '#6366f1',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: selectedTag === tag ? '#4f46e5' : '#ddd6fe',
                        },
                      }}
                    />
                  ))}
                </Stack>

                <Stack direction="row" spacing={0.5} alignItems="center">
                  {!thought.isPrivate && (
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
                          {Object.values(thought.reactions).reduce((a, b) => a + b, 0)}
                        </Typography>
                      </IconButton>
                      {thought.allowReplies && (
                        <IconButton
                          size="small"
                          onClick={() => handleToggleReplies(thought.id)}
                          sx={{ color: '#718096' }}
                        >
                          <CommentIcon fontSize="small" />
                          <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.7rem' }}>
                            {thought.replyCount}
                          </Typography>
                        </IconButton>
                      )}
                    </>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => handleToggleBookmark(thought.id)}
                    sx={{
                      color: thought.isBookmarked ? '#6366f1' : '#cbd5e0',
                    }}
                  >
                    {thought.isBookmarked ? (
                      <BookmarkedIcon fontSize="small" />
                    ) : (
                      <BookmarkIcon fontSize="small" />
                    )}
                  </IconButton>
                  {!thought.isPrivate && (
                    <IconButton size="small" sx={{ color: '#cbd5e0' }}>
                      <ShareIcon fontSize="small" />
                    </IconButton>
                  )}
                </Stack>
              </Stack>

              {thought.allowReplies && (
                <Collapse in={expandedThought === thought.id} timeout="auto" unmountOnExit>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Stack spacing={2} sx={{ mb: 2 }}>
                    {getRepliesToThought(thought.id).map((reply) => (
                      <Box key={reply.id} sx={{ pl: 2, borderLeft: '2px solid #e5e7eb' }}>
                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                            {reply.author.avatar}
                          </Avatar>
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#4a5568' }}>
                              {reply.author.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#a0aec0', ml: 1 }}>
                              {format(reply.createdAt, 'M月d日 HH:mm', { locale: ja })}
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
          ))
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
