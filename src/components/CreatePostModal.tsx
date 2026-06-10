import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/hooks/AppProvider';
import { useToast } from '@/components/ui/use-toast';

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
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const bgmInputRef = useRef<HTMLInputElement>(null);

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
    if (file) {
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
    if (file) {
      setBgmFile(file);
    }
  };

  const handleSubmit = () => {
    if (!content.trim() && !mediaFile && !bgmFile) {
      toast({ description: '내용, 사진/동영상, 또는 음악을 추가해주세요', duration: 2000 });
      return;
    }

    setIsSubmitting(true);

    const newPost = {
      authorId: state.currentUser || 'guest',
      content: content,
      angle: Math.random() * 360,
      radius: 0,
      floatOffset: Math.random() * 2 - 1,
      floatDelay: Math.random() * 3,
      media: mediaPreview || undefined,
      bgm: bgmFile?.name || undefined,
    };

    addPost(newPost);

    setTimeout(() => {
      toast({ description: '게시물이 생성되었습니다!', duration: 2000 });
      setIsSubmitting(false);
      onOpenChange(false);
    }, 500);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/80" 
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-[600px] max-h-[85vh] bg-background rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <span className="text-lg font-semibold text-foreground">새 게시물</span>
          <button
            onClick={() => onOpenChange(false)}
            className="text-2xl text-foreground hover:opacity-50 leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-semibold">{state.currentUser?.[0]?.toUpperCase()}</span>
              </div>
              <span className="font-semibold text-sm">{state.currentUser}</span>
            </div>

            <textarea
              className="w-full min-h-[150px] resize-none border border-border rounded-lg p-4 outline-none text-sm bg-transparent placeholder:text-muted-foreground"
              placeholder="무슨 생각을 하고 있나요?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <div className="space-y-4">
              <div className="text-sm font-medium text-foreground">미리보기</div>
              
              {mediaPreview ? (
                <div className="relative rounded-lg overflow-hidden bg-muted">
                  {mediaFile?.type.startsWith('video/') ? (
                    <video
                      src={mediaPreview}
                      className="w-full max-h-[300px] object-contain"
                      controls
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="w-full max-h-[300px] object-contain"
                    />
                  )}
                  <button
                    onClick={() => {
                      setMediaFile(null);
                      setMediaPreview(null);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 text-lg"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground">
                  <span className="text-4xl mb-2">🖼️</span>
                  <span className="text-sm">사진/동영상을 추가해주세요</span>
                </div>
              )}

              {bgmFile && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <span className="text-2xl">🎵</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{bgmFile.name}</div>
                    <div className="text-xs text-muted-foreground">음악</div>
                  </div>
                  <button
                    onClick={() => setBgmFile(null)}
                    className="text-lg hover:opacity-50"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 mb-4">
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleMediaSelect}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => mediaInputRef.current?.click()}
              className="flex items-center gap-2 flex-1 justify-center"
            >
              <span className="text-lg">📷</span>
              <span>사진/동영상 추가</span>
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
              className="flex items-center gap-2 flex-1 justify-center"
            >
              <span className="text-lg">🎵</span>
              <span>음악 추가</span>
            </Button>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '게시 중...' : '게시하기'}
          </Button>
        </div>
      </div>
    </div>
  );
}