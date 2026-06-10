export const SAMPLE_AUTHORS = [
  'user_7823', 'user_1456', 'user_9021', 'user_3347', 'user_8890',
  'user_4562', 'user_7234', 'user_1089', 'user_5678', 'user_9012',
  'user_3456', 'user_6789', 'user_2341', 'user_8901', 'user_4123',
  'user_5512', 'user_8763', 'user_2094', 'user_6347', 'user_3281'
];

export const SAMPLE_CONTENTS = [
  '오늘 날씨가 정말 좋네요.',
  '这部电影真不错，推荐大家看看。',
  '新しいカフェを発見しました！',
  'Just finished a great workout session.',
  '正在学习新的编程语言，感觉很有趣。',
  '여름이 다가오고 있다.',
  'Coffee is the answer to everything.',
  '旅行の計画を立てている最中です。',
  '하늘이 맑아서 기분이 좋네요.',
  'Reading a fascinating book these days.',
  '새로운 프로젝트를 시작했어요.',
  '오늘은 기분이 좋지 않다.',
  '맛있는 음식을 먹었다.',
  '영화관을 갔다.',
  '산책을 했다.'
];

export const DEFAULT_STATE = {
  posts: [],
  friends: [],
  theme: 'white' as const,
  sidebarOpen: false,
  likedPosts: [],
  zoomLevel: 50,
  worldPageOpen: false,
  currentUser: null,
  userLikes: {},
  isAdmin: false
};

export const STORAGE_KEY = 'simpleSnsData';