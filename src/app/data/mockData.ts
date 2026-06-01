// 投稿データ

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

// ダミーユーザー（システム用）
export const users = [
  {
    id: 'system1',
    name: 'デモユーザーA',
    avatar: '🦁', // ライオン
    registrationNumber: 1,
    registeredAt: new Date(2026, 0, 15)
  },
  {
    id: 'system2',
    name: 'デモユーザーB',
    avatar: '🐺', // 狼
    registrationNumber: 2,
    registeredAt: new Date(2026, 1, 3)
  },
  {
    id: 'system3',
    name: 'デモユーザーC',
    avatar: '🐘', // 象
    registrationNumber: 3,
    registeredAt: new Date(2026, 2, 10)
  },
];

// リアルな投稿10件
export const mockThoughts: Thought[] = [
  {
    id: 'thought1',
    content: '電車の窓から見える街並みが、毎日同じ景色なのに季節で全然違って見える。今日は桜が咲き始めていて、春が来たんだなって実感した。',
    createdAt: new Date(2026, 4, 25, 7, 45),
    tags: ['朝', '通勤', '季節'],
    author: users[0],
    reactions: { insight: 12, resonance: 25, thinking: 3, inspiration: 8 },
    replyCount: 2,
    allowReplies: true,
  },
  {
    id: 'thought2',
    content: 'ランチの時間、いつもと違う店に入ってみた。新しい味との出会いって、日常に小さな冒険を加えてくれる気がする。',
    createdAt: new Date(2026, 4, 24, 12, 30),
    tags: ['昼', '食事中'],
    author: users[1],
    reactions: { insight: 8, resonance: 18, thinking: 2, inspiration: 15 },
    replyCount: 1,
    allowReplies: true,
  },
  {
    id: 'thought3',
    content: '夕焼けを見ながら散歩していたら、子どもたちが公園で遊んでいた。自分もこうやって遊んでいたなと懐かしくなった。時間って不思議。',
    createdAt: new Date(2026, 4, 23, 18, 15),
    tags: ['夕方', '散歩'],
    author: users[2],
    reactions: { insight: 15, resonance: 32, thinking: 7, inspiration: 10 },
    replyCount: 3,
    allowReplies: true,
  },
  {
    id: 'thought4',
    content: '仕事の合間にふと窓の外を見たら、雲が面白い形をしていた。忙しい時こそ、こういう小さなことに気づける余裕を持ちたい。',
    createdAt: new Date(2026, 4, 22, 14, 20),
    tags: ['仕事中'],
    author: users[0],
    reactions: { insight: 20, resonance: 28, thinking: 5, inspiration: 12 },
    replyCount: 0,
    allowReplies: true,
  },
  {
    id: 'thought5',
    content: '深夜、静かな部屋で本を読んでいると、昼間とは違う思考が浮かんでくる。夜の時間は自分と向き合う貴重な時間だと思う。',
    createdAt: new Date(2026, 4, 21, 23, 45),
    tags: ['深夜', '読書中'],
    author: users[1],
    reactions: { insight: 18, resonance: 35, thinking: 12, inspiration: 20 },
    replyCount: 4,
    allowReplies: true,
  },
  {
    id: 'thought6',
    content: '朝のコーヒーを淹れる時間が、一日で一番好きな時間かもしれない。香りと静けさが心を落ち着かせてくれる。',
    createdAt: new Date(2026, 4, 20, 6, 30),
    tags: ['朝'],
    author: users[2],
    reactions: { insight: 10, resonance: 42, thinking: 3, inspiration: 8 },
    replyCount: 2,
    allowReplies: true,
  },
  {
    id: 'thought7',
    content: '通学路で見かける猫が、今日は違う場所にいた。動物にも日々の変化があるんだなと、当たり前のことに気づかされた。',
    createdAt: new Date(2026, 4, 19, 8, 10),
    tags: ['朝', '通学'],
    author: users[0],
    reactions: { insight: 14, resonance: 21, thinking: 4, inspiration: 9 },
    replyCount: 1,
    allowReplies: true,
  },
  {
    id: 'thought8',
    content: 'お風呂に入りながら今日一日を振り返ると、意外と良いこともあったなと思える。入浴の時間は心のデトックスかも。',
    createdAt: new Date(2026, 4, 18, 21, 30),
    tags: ['夜', '入浴中'],
    author: users[1],
    reactions: { insight: 16, resonance: 38, thinking: 6, inspiration: 11 },
    replyCount: 3,
    allowReplies: true,
  },
  {
    id: 'thought9',
    content: '休日の午後、特に予定もなくゆっくり過ごす時間。何もしない贅沢というのも、たまには必要だと思う。',
    createdAt: new Date(2026, 4, 17, 15, 0),
    tags: ['休日'],
    author: users[2],
    reactions: { insight: 11, resonance: 45, thinking: 8, inspiration: 13 },
    replyCount: 2,
    allowReplies: true,
  },
  {
    id: 'thought10',
    content: '勉強中にふと外を見たら、雨が降り始めていた。雨音が集中力を高めてくれる気がする。自然の音って不思議な力がある。',
    createdAt: new Date(2026, 4, 16, 19, 45),
    tags: ['夜', '勉強中'],
    author: users[0],
    reactions: { insight: 13, resonance: 24, thinking: 9, inspiration: 17 },
    replyCount: 1,
    allowReplies: true,
  },
];

// 互換性のための関数
export function generateMockThoughts(): Thought[] {
  return mockThoughts;
}

export function getThoughtsByTag(tag: string): Thought[] {
  return mockThoughts.filter(thought => thought.tags?.includes(tag));
}

export type { Thought, Reaction };
