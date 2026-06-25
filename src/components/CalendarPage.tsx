import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pencil, Trash2, X, Plus } from 'lucide-react';
import { useI18n } from '@/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { CreatePostModal } from '@/components/CreatePostModal';
import { PlanetAvatar } from '@/components/PlanetAvatar';
import { toast } from 'sonner';
import type { Post } from '@/types';
import { useImageCropper } from '@/hooks/useImageCropper';

interface CalendarPageProps {
  posts: Post[];
  onDeletePost: (postId: string) => void;
  onUpdatePost: (postId: string, opts: { content: string; mediaFile?: File }) => Promise<void>;
  onCreatePost: (opts: { content: string; mediaFile?: File }) => Promise<void>;
}

type View = 'month' | 'detail' | 'expanded';

const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_KO = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString();
  }
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return 'now';
}

export function CalendarPage({
  posts,
  onDeletePost,
  onUpdatePost,
  onCreatePost,
}: CalendarPageProps) {
  const { t, locale } = useI18n();
  const { requestCrop, CropModal } = useImageCropper();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [view, setView] = useState<View>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);

  const isKorean = locale === 'ko';
  const DAYS = isKorean ? DAYS_KO : DAYS_EN;
  const MONTHS = isKorean ? MONTHS_KO : MONTHS_EN;

  const postsByDate = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const post of posts) {
      if (!post.createdAt) continue;
      const dateKey = getDateKey(new Date(post.createdAt));
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, post]);
    }
    return map;
  }, [posts]);

  const calendarDays = useMemo(() => {
    const year = currentYear;
    const month = currentMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    return days;
  }, [currentYear, currentMonth]);

  const selectedDatePosts = useMemo(() => {
    if (!selectedDate) return [];
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();
    return posts
      .filter(post => {
        if (!post.createdAt) return false;
        const d = new Date(post.createdAt);
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt!).getTime();
        const dateB = new Date(b.createdAt!).getTime();
        return dateB - dateA;
      });
  }, [selectedDate, posts]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    setSelectedDate(date);
    setView('detail');
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setView('expanded');
  };

  const handleBack = () => {
    if (view === 'expanded') {
      setSelectedPost(null);
      setView('detail');
    } else if (view === 'detail') {
      setSelectedDate(null);
      setView('month');
    }
  };

  const handleDelete = async (postId: string) => {
    onDeletePost(postId);
    toast(t('myPage.deleted'), { duration: 2000 });
    setView('detail');
    setSelectedPost(null);
  };

  const handleEditSubmit = async (postId: string, opts: { content: string; mediaFile?: File }) => {
    await onUpdatePost(postId, opts);
    setEditModalOpen(false);
    setSelectedPost(null);
    setView('detail');
  };

  const requestImageCropForEdit = useCallback(async (file: File) => {
    return requestCrop(file);
  }, [requestCrop]);

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const getPostsForCell = (day: number): Post[] => {
    const dateKey = getDateKey(new Date(currentYear, currentMonth, day));
    return postsByDate.get(dateKey) || [];
  };

  const renderMonthView = () => (
    <div className="flex flex-col h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentYear}-${currentMonth}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-full hover:bg-muted/50 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <select
                value={currentYear}
                onChange={e => setCurrentYear(Number(e.target.value))}
                className="text-lg font-semibold bg-transparent border-none outline-none cursor-pointer text-foreground"
              >
                {Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select
                value={currentMonth}
                onChange={e => setCurrentMonth(Number(e.target.value))}
                className="text-lg font-semibold bg-transparent border-none outline-none cursor-pointer text-foreground"
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-full hover:bg-muted/50 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="flex-1 grid grid-cols-7 gap-0.5 auto-rows-fr">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="min-h-[100px]" />;
              }
              const posts = getPostsForCell(day);
              const postCount = posts.length;
              const firstPost = posts[0];
              const isTodayCell = isToday(day);
              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`
                    min-h-[100px] rounded-xl border-2 transition-all duration-200 overflow-hidden
                    flex flex-col items-center justify-start p-1
                    ${isTodayCell
                      ? 'border-accent shadow-[0_0_12px_oklch(var(--accent)/0.3)]'
                      : 'border-transparent hover:border-border'
                    }
                    ${postCount > 0 ? 'bg-muted/30' : 'bg-muted/10'}
                  `}
                >
                  <span className={`text-sm font-medium mt-1 ${isTodayCell ? 'text-accent' : 'text-foreground'}`}>
                    {day}
                  </span>
                  {postCount > 0 && (
                    <div className="relative flex-1 w-full mt-1 overflow-hidden rounded-lg">
                      {firstPost.mediaType === 'video' ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <video
                            src={firstPost.media}
                            className="w-full h-full object-cover rounded-lg"
                            muted
                            preload="metadata"
                          />
                          <div className="absolute inset-0 flex items-center justify-center rounded-lg">
                            <svg className="w-4 h-4 dark:text-gray-100 text-black drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      ) : firstPost.media ? (
                        <>
                          <img
                            src={firstPost.media}
                            alt=""
                            className="w-full h-full object-cover rounded-lg"
                            draggable={false}
                          />
                          {postCount > 1 && (
                            <div className="absolute bottom-1 right-1 dark:text-gray-100 text-black text-[10px] font-medium px-1">
                              +{postCount - 1}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="w-full h-full flex items-center justify-center rounded-lg px-1">
                            <span className="text-[11px] dark:text-gray-100 text-black leading-relaxed line-clamp-2 text-center truncate">
                              {firstPost.content.slice(0, 8)}{firstPost.content.length > 8 ? '…' : ''}
                            </span>
                          </div>
                          {postCount > 1 && (
                            <div className="absolute bottom-1 right-1 dark:text-gray-100 text-black text-[11px] font-medium px-1">
                              +{postCount - 1}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );

  const renderDetailView = () => {
    const dateStr = selectedDate
      ? `${selectedDate.getFullYear()}. ${selectedDate.getMonth() + 1}. ${selectedDate.getDate()}.`
      : '';

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-muted/50 transition-colors"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-lg font-semibold">{dateStr}</span>
        </div>

        {selectedDatePosts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground/50" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <p className="text-muted-foreground">
              {isKorean ? '이 달에 게시물이 없습니다' : 'No posts this month'}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {selectedDatePosts.map((post, idx) => {
              const postDate = post.createdAt ? new Date(post.createdAt) : null;
              const dayStr = postDate
                ? `${postDate.getMonth() + 1}/${postDate.getDate()}`
                : '';
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    className="overflow-hidden border-border/50 hover:border-accent/30 transition-all duration-200 cursor-pointer hover:shadow-md"
                    onClick={() => handlePostClick(post)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <PlanetAvatar planet={post.authorPlanet} size={24} />
                        <span className="text-xs font-medium text-foreground">{post.authorName}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{dayStr}</span>
                      </div>
                      {post.media && (
                        <div className="mb-2 rounded-lg overflow-hidden">
                          {post.mediaType === 'video' ? (
                            <video
                              src={post.media}
                              className="w-full max-h-[120px] object-contain"
                              muted
                              preload="metadata"
                            />
                          ) : (
                            <img
                              src={post.media}
                              alt=""
                              className="w-full max-h-[120px] object-contain"
                              draggable={false}
                            />
                          )}
                        </div>
                      )}
                      {post.content && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderExpandedView = () => {
    if (!selectedPost) return null;
    const postDate = selectedPost.createdAt ? new Date(selectedPost.createdAt) : null;
    const timeAgo = selectedPost.createdAt ? formatTimeAgo(selectedPost.createdAt) : '';

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-muted/50 transition-colors"
            aria-label="Back"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-lg font-semibold">
            {postDate ? `${postDate.getMonth() + 1}/${postDate.getDate()}` : ''}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setEditModalOpen(true)}
              className="p-2 rounded-full hover:bg-muted/50 transition-colors"
              aria-label="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(selectedPost.id)}
              className="p-2 rounded-full hover:bg-destructive/10 transition-colors text-destructive"
              aria-label="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div
            className="relative w-full flex flex-col select-text"
            style={{
              paddingTop: 'calc(var(--safe-area-top) + 16px)',
              paddingBottom: 'calc(var(--safe-area-bottom) + 24px)',
              paddingLeft: 'max(16px, var(--safe-area-left))',
              paddingRight: 'max(16px, var(--safe-area-right))',
            }}
          >
            <div className="mx-auto w-full max-w-[420px] flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <PlanetAvatar planet={selectedPost.authorPlanet} size={42} showGlow />
                <div className="min-w-0 flex-1">
                  <h2 className="text-[15px] font-semibold text-foreground truncate leading-tight">
                    {selectedPost.authorName || t('expanded.anonymous')}
                  </h2>
                  <p className="text-xs text-muted-foreground/70">{timeAgo}</p>
                </div>
              </div>

              {selectedPost.media && (
                <div className="mb-4 flex-shrink-0">
                  <div className="relative rounded-2xl overflow-hidden thread-glow">
                    {selectedPost.mediaType === 'video' ? (
                      <>
                        <video
                          src={selectedPost.media}
                          className="w-full object-cover"
                          style={{ aspectRatio: '4/5' }}
                          controls
                          playsInline
                        />
                      </>
                    ) : (
                      <img
                        src={selectedPost.media}
                        alt=""
                        className="w-full object-cover"
                        style={{ aspectRatio: '4/5' }}
                        draggable={false}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              )}

              <div className="flex-1 min-h-0 mb-4">
                <p className="text-[15px] leading-[1.55] text-foreground/90 whitespace-pre-wrap">
                  {selectedPost.content}
                </p>
              </div>
            </div>
          </div>
        </div>

        <CreatePostModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onSubmit={async () => {}}
          requestImageCrop={requestImageCropForEdit}
          editPost={selectedPost}
          onEdit={handleEditSubmit}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-card/20 z-[400] overflow-hidden pt-14 sm:pt-[64px] pb-[var(--safe-area-bottom)]">
      <div className="mx-auto h-full flex flex-col px-2 sm:px-3 py-4 w-full max-w-[800px]">
        <div className="flex items-center justify-between mb-4">
          <div />
          {view === 'detail' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCreatePostOpen(true)}
                className="flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {isKorean ? '글쓰기' : 'New'}
              </button>
              <button
                onClick={() => {
                  setView('month');
                  setSelectedDate(null);
                  setSelectedPost(null);
                }}
                className="text-sm text-accent hover:text-accent/80 transition-colors"
              >
                {t('calendar.backToToday')}
              </button>
            </div>
          )}
          {view === 'expanded' && (
            <button
              onClick={() => {
                setView('month');
                setSelectedDate(null);
                setSelectedPost(null);
              }}
              className="text-sm text-accent hover:text-accent/80 transition-colors"
            >
              {t('calendar.backToToday')}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          {view === 'month' && renderMonthView()}
          {view === 'detail' && renderDetailView()}
          {view === 'expanded' && renderExpandedView()}
        </div>
      </div>
      {CropModal}
      <CreatePostModal
        open={createPostOpen}
        onOpenChange={setCreatePostOpen}
        onSubmit={onCreatePost}
        requestImageCrop={requestCrop}
      />
    </div>
  );
}
