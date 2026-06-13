import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/hooks/AuthProvider';
import { ClientProvider } from '@/hooks/ClientProvider';
import { Layout } from '@/routes/Layout';
import { FeedRoute } from '@/routes/FeedRoute';
import { WorldRoute } from '@/routes/WorldRoute';
import { MyPageRoute } from '@/routes/MyPageRoute';
import { PrivacyRoute } from '@/routes/PrivacyRoute';
import { TermsRoute } from '@/routes/TermsRoute';
import { RequireAuth } from '@/routes/RequireAuth';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ClientProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<FeedRoute />} />
                <Route path="world" element={<WorldRoute />} />
                <Route path="privacy" element={<PrivacyRoute />} />
                <Route path="terms" element={<TermsRoute />} />
                <Route element={<RequireAuth />}>
                  <Route path="my" element={<MyPageRoute />} />
                </Route>
              </Route>
            </Routes>
          </ClientProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
