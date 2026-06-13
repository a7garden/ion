import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/design-system';
import { Button } from '@/design-system';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useI18n } from '@/i18n';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function DeleteAccountDialog({ open, onOpenChange, onConfirm }: DeleteAccountDialogProps) {
  const { t, locale } = useI18n();
  const confirmKeyword = t('deleteAccount.confirmKeyword');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setConfirmText('');
      setIsDeleting(false);
    } else {
      // Focus input when dialog opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const canDelete = confirmText === confirmKeyword;

  const handleConfirm = async () => {
    if (!canDelete) return;
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] w-[calc(100vw-2rem)] rounded-2xl sm:rounded-3xl p-0 gap-0 overflow-hidden border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-transparent pointer-events-none" />
        <DialogHeader className="relative px-5 sm:px-6 pt-5 sm:pt-6 pb-3 text-center">
          <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <DialogTitle className="text-lg font-semibold text-foreground">{t('deleteAccount.title')}</DialogTitle>
        </DialogHeader>
        <div className="relative px-5 sm:px-6 space-y-3">
          <div className="bg-muted/30 rounded-xl p-3 text-xs text-muted-foreground space-y-1.5 leading-relaxed">
            <p>{t('deleteAccount.warning')}</p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>{t('deleteAccount.posts')}</li>
              <li>{t('deleteAccount.likes')}</li>
              <li>{t('deleteAccount.profile')}</li>
            </ul>
            <p className="pt-1">{t('deleteAccount.irreversible')}</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirm-input" className="text-xs text-muted-foreground">
              {locale === 'ko' ? '계속하려면 ' : 'Type '}<span className="font-mono font-bold text-destructive">{confirmKeyword}</span>{locale === 'ko' ? '를 입력하세요' : ' to continue'}
            </label>
            <input
              ref={inputRef}
              id="confirm-input"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={confirmKeyword}
              className="w-full px-3 py-2 border border-border/50 rounded-xl text-sm bg-transparent placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-destructive/30 focus:border-destructive/50 outline-none"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>
        <div className="relative px-5 sm:px-6 py-4 flex gap-2">
          <Button
            variant="ghost"
            className="flex-1 rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {t('deleteAccount.cancel')}
          </Button>
          <Button
            className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl"
            onClick={handleConfirm}
            disabled={!canDelete || isDeleting}
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('deleteAccount.confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
