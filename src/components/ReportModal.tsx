import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string | null;
  userId: string;
}

const REPORT_REASONS = [
  { value: 'spam', label: '스팸' },
  { value: 'harmful', label: '유해 콘텐츠' },
  { value: 'inappropriate', label: '부적절한 콘텐츠' },
  { value: 'other', label: '기타' },
] as const;

export function ReportModal({ open, onOpenChange, postId, userId }: ReportModalProps) {
  const [reason, setReason] = useState<string>('');
  const [detail, setDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason || !postId) return;
    setIsSubmitting(true);
    try {
      const { reportPost } = await import('@/lib/supabase');
      await reportPost(userId, postId, reason, detail || undefined);
      toast({ description: '신고되었습니다', duration: 2000 });
      onOpenChange(false);
      setReason('');
      setDetail('');
    } catch {
      toast({ description: '신고에 실패했습니다', duration: 2000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[360px] w-[calc(100vw-2rem)] rounded-2xl sm:rounded-3xl p-0 gap-0 overflow-hidden border-border/50 warm-glow">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />
        <DialogHeader className="relative px-5 sm:px-6 pt-5 sm:pt-6 pb-3 text-center">
          <DialogTitle className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            신고하기
          </DialogTitle>
        </DialogHeader>
        <div className="relative px-5 sm:px-6 space-y-3">
          {REPORT_REASONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setReason(r.value)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
                reason === r.value
                  ? 'bg-accent/15 text-foreground border border-accent/40'
                  : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-transparent'
              }`}
            >
              {r.label}
            </button>
          ))}
          {reason && (
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="상세 내용 (선택)"
              className="w-full min-h-[80px] resize-none border border-border/50 rounded-xl p-3 text-sm bg-transparent placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-accent/30 focus:border-accent/50 outline-none"
            />
          )}
        </div>
        <div className="relative px-5 sm:px-6 py-4">
          <Button
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl"
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '신고하기'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
