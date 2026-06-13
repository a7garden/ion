import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useI18n } from '@/i18n';

interface LegalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'privacy' | 'terms';
}

const sectionKeys = {
  privacy: ['collection', 'use', 'sharing', 'security', 'retention', 'contact'] as const,
  terms: ['acceptance', 'accounts', 'content', 'prohibited', 'termination', 'contact'] as const,
};

export function LegalModal({ open, onOpenChange, type }: LegalModalProps) {
  const { t } = useI18n();
  const keys = sectionKeys[type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] max-h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-2">
          <DialogTitle className="text-base font-semibold">
            {t(`${type}.title`)}
          </DialogTitle>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {t('legal.lastUpdated')}: {t(`${type}.updated`)}
          </p>
        </DialogHeader>

        <div className="px-5 pb-5 space-y-5 overflow-y-auto max-h-[calc(80vh-100px)]">
          {keys.map((key) => (
            <section key={key}>
              <h3 className="text-sm font-semibold text-foreground mb-1.5">
                {t(`${type}.${key}.title`)}
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line">
                {t(`${type}.${key}.content`)}
              </p>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
