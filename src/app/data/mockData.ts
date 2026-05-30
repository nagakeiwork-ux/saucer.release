// 仮想投稿データ生成

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

const users = [
  {
    id: 'user1',
    name: '田中 健太',
    avatar: '👨‍💼',
    registrationNumber: 1,
    registeredAt: new Date(2025, 0, 1)
  },
  {
    id: 'user2',
    name: '佐藤 美咲',
    avatar: '👩‍🎨',
    registrationNumber: 2,
    registeredAt: new Date(2025, 0, 2)
  },
  {
    id: 'user3',
    name: '山田 悠人',
    avatar: '👨‍🔬',
    registrationNumber: 3,
    registeredAt: new Date(2025, 0, 3)
  },
];

const tagsList = [
  '朝', '自然', '人間関係', '心理', 'コミュニケーション',
  '仕事', '哲学', '日常', '気づき', '習慣',
  '読書', '健康', '時間', '感情', '思考',
  '食事', '散歩', '季節', '夜', '音楽'
];

const contentTemplates = [
  'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
  '春夏秋冬東西南北上下左右天地人月日火水木金土',
  '赤青黄緑紫橙桃白黒灰茶空海山川森林草花木石',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomContent(): string {
  const template = getRandomElement(contentTemplates);
  const length = getRandomInt(20, 100);
  let content = '';

  for (let i = 0; i < length; i++) {
    content += template[Math.floor(Math.random() * template.length)];
  }

  return content;
}

function generateRandomTags(): string[] {
  const numTags = getRandomInt(1, 3);
  const tags: string[] = [];

  for (let i = 0; i < numTags; i++) {
    const tag = getRandomElement(tagsList);
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }

  return tags;
}

function generateRandomReactions(): Reaction {
  return {
    insight: getRandomInt(0, 30),
    resonance: getRandomInt(0, 40),
    thinking: getRandomInt(0, 25),
    inspiration: getRandomInt(0, 20),
  };
}

export function generateMockThoughts(): Thought[] {
  const thoughts: Thought[] = [];
  const now = new Date();

  // 100件の投稿を生成
  for (let i = 0; i < 100; i++) {
    const author = getRandomElement(users);
    const daysAgo = getRandomInt(0, 180); // 過去180日間
    const hoursAgo = getRandomInt(0, 23);
    const minutesAgo = getRandomInt(0, 59);

    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - daysAgo);
    createdAt.setHours(createdAt.getHours() - hoursAgo);
    createdAt.setMinutes(createdAt.getMinutes() - minutesAgo);

    thoughts.push({
      id: `thought-${i + 1}`,
      content: generateRandomContent(),
      createdAt,
      tags: generateRandomTags(),
      author: { ...author },
      reactions: generateRandomReactions(),
      replyCount: getRandomInt(0, 10),
      allowReplies: Math.random() > 0.3, // 70%の投稿で返信可能
    });
  }

  // 日付順にソート（新しい順）
  thoughts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return thoughts;
}

// 特定ユーザーの投稿を取得
export function getThoughtsByUserId(thoughts: Thought[], userId: string): Thought[] {
  return thoughts.filter(t => t.author.id === userId);
}

// タグで投稿をフィルター
export function getThoughtsByTag(thoughts: Thought[], tag: string): Thought[] {
  return thoughts.filter(t => t.tags?.includes(tag));
}

export { users };
export type { Thought, Reaction };
