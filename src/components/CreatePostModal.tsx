import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/hooks/AppProvider';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Image, Music, X, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostModal({ open, onOpenChange }: CreatePostModalProps) {
  const { state, addPost } = useApp();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [bgmFile, setBgmFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const bgmInputRef = useRef<HTMLInputElement>(null);

  // 모달이 닫힐 때 폼 상태 초기화
  useEffect(() => {
    if (!open) {
      setContent('');
      setMediaFile(null);
      setMediaPreview(null);
      setBgmFile(null);
    }
  }, [open]);

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBgmSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setBgmFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !mediaFile && !bgmFile) {
      toast({ description: '내용, 사진, 또는 음악을 추가해주세요', duration: 2000 });
      return;
    }

    if (!state.currentUser) {
      toast({ description: '로그인이 필요합니다', duration: 2000 });
      return;
    }

    setIsSubmitting(true);

    try {
      const newPost = {
        authorId: state.currentUser,
        authorName: state.userName || state.currentUser,
        content: content,
        angle: Math.random() * 360,
        radius: 0,
        floatOffset: Math.random() * 2 - 1,
        floatDelay: Math.random() * 3,
        mediaFile: mediaFile || undefined,
        bgmFile: bgmFile || undefined,
      };

      await addPost(newPost);

      toast({ description: '게시물이 생성되었습니다!', duration: 2000 });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create post:', error);
      toast({ description: '게시물 생성에 실패했습니다', duration: 2000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[150px] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] rounded-2xl sm:rounded-3xl p-0 gap-0 overflow-hidden border-border/50 warm-glow">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />

        <DialogHeader className="relative border-b border-border/50 px-4 sm:px-6 py-4 sm:py-5">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            새로운 게시물
          </DialogTitle>
        </DialogHeader>

        <div className="relative flex-1 overflow-y-auto max-h-[60vh]">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-sm">
                <span className="text-sm font-semibold text-primary-foreground">
                  {(state.userName || state.currentUser)?.[0]?.toUpperCase()}
                </span>
              </div>
              <span className="font-semibold text-sm text-foreground">{state.userName || state.currentUser}</span>
            </div>

            <textarea
              className="w-full min-h-[100px] sm:min-h-[140px] resize-none border border-border/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 outline-none text-sm bg-transparent placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all duration-200"
              placeholder="무슨 생각을 하고 있나요?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <div className="space-y-3 sm:space-y-4">
              {mediaPreview ? (
                <motion.div
                  className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-muted/50 border border-border/50"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {mediaFile?.type.startsWith('video/') ? (
                    <video
                      src={mediaPreview || undefined}
                      controls
                      className="w-full max-h-[200px] sm:max-h-[280px] object-contain"
                    />
                  ) : (
                    <img
                      src={mediaPreview || undefined}
                      alt="Preview"
                      className="w-full max-h-[200px] sm:max-h-[280px] object-contain"
                    />
                  )}
                  <motion.button
                    onClick={() => {
                      setMediaFile(null);
                      setMediaPreview(null);
                    }}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 bg-foreground/80 hover:bg-foreground text-background rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                    whileHover={{ backgroundColor: 'hsl(var(--accent))' }}
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all duration-200 ${
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
                    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
                      setMediaFile(file);
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setMediaPreview(e.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-2 sm:mb-3">
                    <Image className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground/60" />
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground/70">사진을 추가해주세요</span>
                  <span className="text-xs text-muted-foreground/50 mt-1">또는 드래그하여 업로드</span>
                </motion.div>
              )}

              {bgmFile && (
                <motion.div
                  className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 bg-muted/30 rounded-xl sm:rounded-2xl border border-border/50"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                    <Music className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate text-foreground">{bgmFile.name}</div>
                    <div className="text-xs text-muted-foreground/60">음악</div>
                  </div>
                  <button
                    onClick={() => setBgmFile(null)}
                    className="p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground touch-target"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div className="relative border-t border-border/50 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleMediaSelect}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => mediaInputRef.current?.click()}
              className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-center border-accent/30 hover:bg-accent/10 hover:border-accent/50 transition-all touch-target"
            >
              <Image className="w-4 h-4" />
              <span>사진</span>
            </Button>

            <input
              ref={bgmInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleBgmSelect}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => bgmInputRef.current?.click()}
              className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-center border-accent/30 hover:bg-accent/10 hover:border-accent/50 transition-all touch-target"
            >
              <Music className="w-4 h-4" />
              <span>음악</span>
            </Button>
          </div>

          <Button
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium transition-all duration-200 hover:shadow-lg hover:shadow-accent/20 touch-target"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                게시 중...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                게시하기
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
