export const ko = {
  // Header
  'nav.feed': '피드',
  'nav.world': '월드',
  'nav.my': '마이',
  'nav.login': '로그인',
  'header.toggleTheme': '테마 전환',

  // LoginModal
  'login.welcome': '환영합니다',
  'login.subtitle': 'Google 계정으로 로그인하여 피드를 작성하세요',
  'login.google': 'Google 로그인',
  'login.cancel': '취소',
  'login.failed': '로그인에 실패했습니다',

  // CreatePostModal
  'createPost.title': '새로운 피드',
  'createPost.placeholder': '무슨 생각을 하고 있나요?',
  'createPost.addMedia': '사진 또는 동영상을 추가해주세요',
  'createPost.dragDrop': '또는 드래그하여 업로드',
  'createPost.media': '미디어',
  'createPost.posting': '게시 중...',
  'createPost.post': '게시하기',
  'createPost.requireContent': '내용 또는 사진/동영상을 추가해주세요',
  'createPost.created': '게시물이 생성되었습니다!',
  'createPost.failed': '게시물 생성에 실패했습니다',

  // FeedView
  'feed.noPosts': '아직 게시물이 없습니다',
  'feed.noPostsHint': '첫 게시물을 작성해보세요',
  'feed.createPost': '게시물 작성',

  // MyPage
  'myPage.failed': '게시물을 불러오지 못했습니다',
  'myPage.retry': '다시 시도',
  'myPage.tagline': 'Alone, but not lonely',
  'myPage.myPosts': '내 게시물',
  'myPage.new': '새 글',
  'myPage.logout': '로그아웃',
  'myPage.noPosts': '아직 게시물이 없습니다',
  'myPage.createFirstPost': '첫 게시물 작성하기',
  'myPage.deleted': '삭제되었습니다',
  'myPage.deleteAccount': '회원 탈퇴',

  // MyPageRoute
  'myPageRoute.loggedOut': '로그아웃되었습니다',
  'myPageRoute.accountDeleted': '탈퇴되었습니다',
  'myPageRoute.deleteFailed': '탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해주세요.',

  // DeleteAccountDialog
  'deleteAccount.title': '회원 탈퇴',
  'deleteAccount.warning': '탈퇴 시 다음 데이터가 영구적으로 삭제됩니다:',
  'deleteAccount.posts': '작성한 모든 게시물과 미디어',
  'deleteAccount.likes': '좋아요, 공명, 차단 목록',
  'deleteAccount.profile': '행성 정보, 표시 이름',
  'deleteAccount.irreversible': '이 작업은 되돌릴 수 없습니다.',
  'deleteAccount.confirmKeyword': '탈퇴',
  'deleteAccount.cancel': '취소',
  'deleteAccount.confirm': '탈퇴하기',

  // ImageCropModal
  'crop.title': '이미지 크롭',
  'crop.subtitle': '정방형으로 크롭합니다',
  'crop.cancel': '취소',
  'crop.crop': '크롭',

  // ExpandedCard
  'expanded.anonymous': '익명',
  'expanded.postedRecently': '방금 전',

  // ResonanceNotification
  'resonance.title': '공명',
  'resonance.empty': '아직 공명이 없습니다',
  'resonance.emptyHint': '마음이 닿으면 여기에 나타납니다',
  'resonance.someone': '누군가와 공명했습니다',
  'resonance.twoUniverses': '두 우주가 잠시 겹쳤습니다',

  // PlanetSelector
  'planetSelector.title': '나의 행성 선택',
  'planetSelector.subtitle': '오직 나만 볼 수 있는 우주 아이덴티티입니다',

  // WorldPage
  'world.failed': '그래프를 불러오지 못했습니다',
  'world.retry': '다시 시도',
  'world.goToMyLocation': '내 위치로 이동',
  'world.fullView': '전체 보기',
  'world.centeredView': '특정 보기',
  'world.connectionSettings': '연결 설정',
  'world.linkStrength': '연결 강도',
  'world.chargeStrength': '충전 강도',
  'world.collideStrength': '충돌 강도',
  'world.center': '중심',
  'world.linkDistance': '링크 거리',
  'world.exploreHint': '스크롤 / 핀치 줌으로 탐색',

  // FeedRoute
  'feedRoute.failed': '피드를 불러오지 못했습니다',
  'feedRoute.retry': '다시 시도',

  // ReportModal
  'report.title': '신고하기',
  'report.reason.spam': '스팸',
  'report.reason.harmful': '유해 콘텐츠',
  'report.reason.inappropriate': '부적절한 콘텐츠',
  'report.reason.other': '기타',
  'report.detailPlaceholder': '상세 내용 (선택)',
  'report.submit': '신고하기',
  'report.reported': '신고되었습니다',
  'report.failed': '신고에 실패했습니다',

  // General/Common
  'common.loading': '로딩 중...',
} as const;
