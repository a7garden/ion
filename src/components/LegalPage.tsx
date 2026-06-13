import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';

interface LegalSection {
  title: string;
  content: string;
}

interface LegalPageProps {
  title: string;
  updated: string;
  sections: LegalSection[];
}

export function LegalPage({ title, updated, sections }: LegalPageProps) {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-card/20 z-[400] overflow-y-auto pt-14 sm:pt-[64px] pb-[var(--safe-area-bottom)]">
      <div className="max-w-[680px] mx-auto px-5 sm:px-8 py-8 sm:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors mb-6"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {t('legal.back')}
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-xs text-muted-foreground mb-8">
          {t('legal.lastUpdated')}: {updated}
        </p>

        <div className="space-y-6">
          {sections.map((section, idx) => (
            <section key={idx}>
              <h2 className="text-base sm:text-lg font-semibold text-foreground mb-2">{section.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line select-text">{section.content}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border/30 text-center">
          <p className="text-xs text-muted-foreground/60">ION — {t('legal.tagline')}</p>
        </div>
      </div>
    </div>
  );
}
