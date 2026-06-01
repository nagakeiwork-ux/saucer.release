// アプリケーション設定

export const APP_CONFIG = {
  // デモモード: 環境変数が設定されていない場合はtrue
  isDemoMode: !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY,

  // アプリ名
  appName: 'Saucer',

  // 最大投稿文字数
  maxThoughtLength: 500,

  // タグの最大数
  maxTags: 5,

  // リアクションタイプ
  reactionTypes: {
    insight: { label: '気づき', icon: '💡', color: '#fbbf24' },
    resonance: { label: '共感', icon: '❤️', color: '#ef4444' },
    thinking: { label: '考察', icon: '🤔', color: '#3b82f6' },
    inspiration: { label: '刺激的', icon: '⚡', color: '#8b5cf6' },
  },

  // 利用可能なタグ
  availableTags: [
    '朝',
    '昼',
    '夕方',
    '夜',
    '深夜',
    '通勤',
    '通学',
    '散歩',
    '入浴中',
    '食事中',
    '読書中',
    '勉強中',
    '仕事中',
    '旅行中',
    '休日',
    '季節',
  ],
};

export function getAppMode() {
  return APP_CONFIG.isDemoMode ? 'demo' : 'production';
}

export function isProductionMode() {
  return !APP_CONFIG.isDemoMode;
}