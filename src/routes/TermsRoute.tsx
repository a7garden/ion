import { LegalPage } from '@/components/LegalPage';
import { useI18n } from '@/i18n';

export function TermsRoute() {
  const { t } = useI18n();

  const sections = [
    {
      title: t('terms.acceptance.title'),
      content: t('terms.acceptance.content'),
    },
    {
      title: t('terms.accounts.title'),
      content: t('terms.accounts.content'),
    },
    {
      title: t('terms.content.title'),
      content: t('terms.content.content'),
    },
    {
      title: t('terms.prohibited.title'),
      content: t('terms.prohibited.content'),
    },
    {
      title: t('terms.termination.title'),
      content: t('terms.termination.content'),
    },
    {
      title: t('terms.contact.title'),
      content: t('terms.contact.content'),
    },
  ];

  return (
    <LegalPage
      title={t('terms.title')}
      updated={t('terms.updated')}
      sections={sections}
    />
  );
}
