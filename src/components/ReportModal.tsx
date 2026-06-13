import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/design-system';
import { Button } from '@/design-system';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/i18n';

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string | null;
  userId: string;
}

export function ReportModal({ open, onOpenChange, postId, userId }: ReportModalProps) {
  const { t } = useI18n();
  const REPORT_REASONS = [
    { value: 'spam', label: t('report.reason.spam') },
    { value: 'harmful', label: t('report.reason.harmful') },
    { value: 'inappropriate', label: t('report.reason.inappropriate') },
    { value: 'other', label: t('report.reason.other') },
  ] as const;
  const [reason, setReason] = useState<string>('');
  const [detail, setDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason || !postId) return;
    setIsSubmitting(true);
    try {
      const { reportPost } = await import('@/lib/supabase');
      await reportPost(userId, postId, reason, detail || undefined);
      toast(t('report.reported'), { duration: 2000 });
      onOpenChange(false);
      setReason('');
      setDetail('');
    } catch {
      toast(t('report.failed'), { duration: 2000 });
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
            {t('report.title')}
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
              placeholder={t('report.detailPlaceholder')}
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
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('report.submit')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
