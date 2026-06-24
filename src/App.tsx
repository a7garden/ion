import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/hooks/AuthProvider';
import { ClientProvider } from '@/hooks/ClientProvider';
import { I18nProvider } from '@/i18n';
import { Layout } from '@/routes/Layout';
import { FeedRoute } from '@/routes/FeedRoute';
import { WorldRoute } from '@/routes/WorldRoute';
import { MyPageRoute } from '@/routes/MyPageRoute';
import { CalendarRoute } from '@/routes/CalendarRoute';
import { PrivacyRoute } from '@/routes/PrivacyRoute';
import { TermsRoute } from '@/routes/TermsRoute';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ClientProvider>
            <I18nProvider>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<FeedRoute />} />
                  <Route path="world" element={<WorldRoute />} />
                  <Route path="calendar" element={<CalendarRoute />} />
                  <Route path="privacy" element={<PrivacyRoute />} />
                  <Route path="terms" element={<TermsRoute />} />
                  <Route path="my" element={<MyPageRoute />} />
                </Route>
              </Routes>
            </I18nProvider>
          </ClientProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
