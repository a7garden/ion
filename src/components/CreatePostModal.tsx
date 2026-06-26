import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/AuthProvider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Image, X, Loader2, Sparkles, Pencil, CornerDownLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useI18n } from '@/i18n';
import type { Post } from '@/types';
import { cn } from '@/lib/utils';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (opts: { content: string; mediaFile?: File }) => Promise<void>;
  requestImageCrop: (file: File) => Promise<Blob>;
  editPost?: Post | null;
  onEdit?: (postId: string, opts: { content: string; mediaFile?: File }) => Promise<void>;
}

const MAX_CONTENT = 1000;

export function CreatePostModal({
  open,
  onOpenChange,
  onSubmit,
  requestImageCrop,
  editPost,
  onEdit,
}: CreatePostModalProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [removeExistingMedia, setRemoveExistingMedia] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEditMode = !!editPost;

  // Reset / hydrate state on open
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) {
      setContent('');
      setMediaFile(null);
      setMediaPreview(null);
      setIsSubmitting(false);
      setIsDragOver(false);
      setRemoveExistingMedia(false);
      if (mediaInputRef.current) mediaInputRef.current.value = '';
      return;
    }
    if (isEditMode && editPost) {
      setContent(editPost.content || '');
      setMediaPreview(editPost.media || null);
      setMediaFile(null);
      setRemoveExistingMedia(false);
    }
  }, [open, isEditMode, editPost]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
  }, [content, open]);

  const isVideo = (file: File | null) => !!file && file.type.startsWith('video/');
  const isImage = (file: File | null) => !!file && file.type.startsWith('image/');

  const previewFile = (file: File) => {
    setMediaFile(file);
    setRemoveExistingMedia(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageFile = async (file: File) => {
    try {
      const blob = await requestImageCrop(file);
      const croppedFile = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
      previewFile(croppedFile);
    } catch {
      // User cancelled crop — do nothing
    }
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (isVideo(file)) {
      previewFile(file);
    } else if (isImage(file)) {
      handleImageFile(file);
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setRemoveExistingMedia(true);
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!content.trim() && !mediaFile && (!isEditMode || removeExistingMedia || !editPost?.media)) {
      toast(t('createPost.requireContent'), { duration: 2000 });
      return;
    }
    if (content.length > MAX_CONTENT) {
      toast(t('createPost.tooLong'), { duration: 2000 });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && editPost && onEdit) {
        await onEdit(editPost.id, {
          content,
          mediaFile: mediaFile || undefined,
        });
        toast(t('createPost.edited'), { duration: 2000 });
      } else {
        await onSubmit({
          content,
          mediaFile: mediaFile || undefined,
        });
        toast(t('createPost.created'), { duration: 2000 });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to submit post:', error);
      toast(isEditMode ? t('createPost.editFailed') : t('createPost.failed'), { duration: 2000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cmd/Ctrl+Enter to submit
  const onTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isSubmitting) handleSubmit();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSubmitting, content, mediaFile, isEditMode, removeExistingMedia, editPost],
  );

  const displayMediaPreview = useMemo(
    () =>
      mediaPreview ||
      (isEditMode && editPost?.media && !removeExistingMedia ? editPost.media : null),
    [mediaPreview, isEditMode, editPost, removeExistingMedia],
  );
  const hasMedia = !!displayMediaPreview;
  const hasVideo = isVideo(mediaFile) || (isEditMode && editPost?.mediaType === 'video' && !mediaFile);
  const charCount = content.length;
  const charOver = charCount > MAX_CONTENT;

  // Initial for avatar
  const authorInitial = (user?.displayName || user?.id || '?')[0]?.toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // Mobile: full-width, bottom sheet feel, large top radius
          'w-full max-w-[100vw] p-0 gap-0 overflow-hidden border border-border/60',
          'rounded-t-2xl bottom-0 top-auto translate-y-0 left-0 translate-x-0',
          'max-h-[92vh]',
          // Desktop (laptop ≥1024px): centered, wider 2-pane
          'laptop:max-h-[88vh] laptop:w-[calc(100vw-2rem)] laptop:max-w-[960px]',
          'laptop:bottom-auto laptop:top-[50%] laptop:translate-y-[-50%]',
          'laptop:left-[50%] laptop:translate-x-[-50%] laptop:rounded-2xl',
          'bg-card text-card-foreground shadow-xl',
        )}
        onOpenAutoFocus={(e) => {
          // Focus the textarea on open
          e.preventDefault();
          setTimeout(() => textareaRef.current?.focus(), 60);
        }}
      >
        {/* Header */}
        <DialogHeader className="relative flex-row items-center justify-between border-b border-border/60 px-4 py-3 laptop:px-6 laptop:py-4 space-y-0">
          <DialogTitle className="text-base laptop:text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-accent">
              {isEditMode ? <Pencil className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            </span>
            {isEditMode ? t('createPost.editTitle') : t('createPost.title')}
          </DialogTitle>
          <span className="hidden laptop:inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <CornerDownLeft className="w-3 h-3" />
            {t('createPost.shortcutHint')}
          </span>
        </DialogHeader>

        {/* Body — single column on mobile/tablet, 2-pane on laptop+ */}
        <div className="flex flex-col laptop:flex-row laptop:min-h-[520px] laptop:max-h-[calc(88vh-128px)]">
          {/* LEFT: compose */}
          <div className="flex flex-1 flex-col gap-4 p-4 laptop:gap-5 laptop:w-1/2 laptop:border-r laptop:border-border/60 laptop:p-6 overflow-y-auto laptop:overflow-y-hidden">
            {/* Author chip */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 laptop:w-10 laptop:h-10 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-sm">
                <span className="text-sm font-semibold text-primary-foreground">{authorInitial}</span>
              </div>
              <div className="min-w-0">
                <span className="block font-semibold text-sm text-foreground truncate">{user?.displayName}</span>
                <span className="block text-[11px] text-muted-foreground">{t('createPost.authorSub')}</span>
              </div>
            </div>

            {/* Textarea */}
            <div className="flex flex-col flex-1 min-h-0 laptop:min-h-[180px]">
              <textarea
                ref={textareaRef}
                className={cn(
                  'w-full resize-none rounded-xl border border-border/60 p-3 laptop:p-4',
                  'outline-none text-[15px] laptop:text-base leading-relaxed text-foreground bg-transparent',
                  'placeholder:text-muted-foreground/60',
                  'focus:ring-2 focus:ring-accent/30 focus:border-accent/50',
                  'transition-all duration-200 min-h-[140px] laptop:min-h-[180px] laptop:flex-1',
                )}
                placeholder={t('createPost.placeholder')}
                value={content}
                maxLength={MAX_CONTENT + 50}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={onTextareaKeyDown}
                aria-label={t('createPost.placeholder')}
              />
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="hidden laptop:inline">{t('createPost.markdownHint')}</span>
                <span className={cn('tabular-nums ml-auto', charOver && 'text-destructive font-semibold')}>
                  {charCount}/{MAX_CONTENT}
                </span>
              </div>
            </div>

            {/* Media dropzone / preview */}
            <div className="laptop:flex-1 laptop:min-h-0 laptop:flex laptop:flex-col">
              {hasMedia ? (
                <MediaPreview
                  preview={displayMediaPreview}
                  isVideo={hasVideo}
                  onRemove={handleRemoveMedia}
                />
              ) : (
                <motion.div
                  className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
                    isDragOver
                      ? 'border-accent bg-accent/5'
                      : 'border-border/50 hover:border-accent/30 hover:bg-muted/20'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (!file) return;
                    if (isVideo(file)) previewFile(file);
                    else if (isImage(file)) handleImageFile(file);
                  }}
                  onClick={() => mediaInputRef.current?.click()}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-2 sm:mb-3">
                    <Image className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground/60" />
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground/70">사진 또는 동영상을 추가해주세요</span>
                  <span className="text-xs text-muted-foreground/50 mt-1">또는 드래그하여 업로드</span>
                </motion.div>
              )}
              <input
                ref={mediaInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleMediaSelect}
              />
            </div>
          </div>

          {/* RIGHT: live preview (laptop+ only) */}
          <div className="hidden laptop:flex laptop:w-1/2 laptop:flex-col bg-muted/30 p-6 gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {t('createPost.previewLabel')}
              </span>
              <span className="text-[11px] text-muted-foreground">{t('createPost.previewHint')}</span>
            </div>
            <FeedCardPreview
              content={content}
              media={displayMediaPreview}
              isVideo={hasVideo}
              hasMedia={hasMedia}
              authorName={user?.displayName || ''}
            />
          </div>
        </div>

        {/* Footer / action bar */}
        <div className="sticky bottom-0 border-t border-border/60 bg-card/95 backdrop-blur-sm p-3 laptop:p-4 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
          <div className="flex items-center gap-2 laptop:gap-3">
            <Button
              variant="ghost"
              size="medium"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              {t('createPost.cancel')}
            </Button>

            <Button
              variant="outline"
              size="medium"
              onClick={() => mediaInputRef.current?.click()}
              className="gap-1.5 border-accent/30 hover:bg-accent/10 hover:border-accent/50"
            >
              <Image className="w-4 h-4" />
              <span className="hidden laptop:inline">{t('createPost.media')}</span>
              {hasMedia && (
                <span className="ml-1 inline-flex h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
              )}
            </Button>

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden laptop:inline-flex items-center text-[11px] text-muted-foreground mr-1">
                <kbd className="rounded border border-border/60 bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-foreground/80">
                  ⌘
                </kbd>
                <span className="mx-1">+</span>
                <kbd className="rounded border border-border/60 bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-foreground/80">
                  ↵
                </kbd>
              </span>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || charOver}
                className="min-w-[110px] bg-accent hover:bg-accent/90 text-accent-foreground font-medium transition-all duration-200 hover:shadow-lg hover:shadow-accent/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isEditMode ? t('createPost.editing') : t('createPost.posting')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    {isEditMode ? t('createPost.edit') : t('createPost.post')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="relative border-t border-border/50 p-3 sm:p-4">
          <input
            ref={mediaInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleMediaSelect}
          />

          <Button
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium transition-all duration-200 hover:shadow-lg hover:shadow-accent/20 touch-target"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEditMode ? '수정 중...' : '게시 중...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {isEditMode ? '수정하기' : '게시하기'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MediaPreview({
  preview,
  isVideo,
  onRemove,
}: {
  preview: string;
  isVideo: boolean;
  onRemove: () => void;
}) {
  const { t } = useI18n();
  return (
    <motion.div
      className="relative w-full laptop:flex-1 laptop:min-h-0 rounded-xl overflow-hidden bg-muted/60 border border-border/60"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18 }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {isVideo ? (
          <video
            src={preview}
            controls
            playsInline
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <img
            src={preview}
            alt={t('createPost.previewAlt')}
            className="max-h-full max-w-full object-contain"
          />
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={t('createPost.removeMedia')}
        className="absolute top-2 right-2 laptop:top-3 laptop:right-3 w-8 h-8 bg-foreground/80 hover:bg-foreground text-background rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

/**
 * Live preview that mirrors the PostCard (1:1 square) so the user
 * sees exactly what the post will look like in the feed.
 */
function FeedCardPreview({
  content,
  media,
  isVideo,
  hasMedia,
  authorName,
}: {
  content: string;
  media: string | null;
  isVideo: boolean;
  hasMedia: boolean;
  authorName: string;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="relative aspect-square w-full max-w-[320px] overflow-hidden rounded-2xl bg-elevated border border-border/60 shadow-md">
        {/* Media layer */}
        {hasMedia ? (
          <>
            {isVideo ? (
              <video
                src={media!}
                className="absolute inset-0 h-full w-full object-cover"
                muted
                playsInline
              />
            ) : (
              <img
                src={media!}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
              />
            )}
            {/* Collage scrim + text overlay (mirrors CollageOverlay) */}
            {content.trim() && (
              <>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-8 text-center">
                  <p className="text-[14px] font-medium leading-snug text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] whitespace-pre-wrap break-words line-clamp-6">
                    {content}
                  </p>
                </div>
              </>
            )}
          </>
        ) : (
          // Text-only card preview
          <div className="absolute inset-0 flex items-center justify-center p-5 bg-elevated">
            {content.trim() ? (
              <p className="text-[15px] leading-relaxed text-foreground/90 text-center whitespace-pre-wrap break-words line-clamp-6">
                {content}
              </p>
            ) : (
              <p className="text-[13px] text-muted-foreground/60 text-center">
                {t('createPost.previewEmpty')}
              </p>
            )}
          </div>
        )}

        {/* Author chip (top-left, like the post header in feed) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-background/80 backdrop-blur-sm px-2 py-1 shadow-sm">
          <div className="h-4 w-4 rounded-full bg-gradient-to-br from-accent to-accent/60" />
          <span className="text-[11px] font-semibold text-foreground/90 max-w-[120px] truncate">
            {authorName || 'me'}
          </span>
        </div>
      </div>
    </div>
  );
}
