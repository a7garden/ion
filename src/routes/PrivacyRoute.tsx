import { LegalPage } from '@/components/LegalPage';
import { useI18n } from '@/i18n';

export function PrivacyRoute() {
  const { t } = useI18n();

  const sections = [
    {
      title: t('privacy.collection.title'),
      content: t('privacy.collection.content'),
    },
    {
      title: t('privacy.use.title'),
      content: t('privacy.use.content'),
    },
    {
      title: t('privacy.sharing.title'),
      content: t('privacy.sharing.content'),
    },
    {
      title: t('privacy.security.title'),
      content: t('privacy.security.content'),
    },
    {
      title: t('privacy.retention.title'),
      content: t('privacy.retention.content'),
    },
    {
      title: t('privacy.contact.title'),
      content: t('privacy.contact.content'),
    },
  ];

  return (
    <LegalPage
      title={t('privacy.title')}
      updated={t('privacy.updated')}
      sections={sections}
    />
  );
}
