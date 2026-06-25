import { useState } from 'react';
import { CreatePostModal } from '@/components/CreatePostModal';
import { useAuth } from '@/hooks/AuthProvider';
import { Button } from '@/components/ui/button';

/**
 * Dev-only route to inspect the CreatePostModal in isolation.
 * Mounted at /_dev/modal. Provides a fake user via the AuthProvider's
 * own shape by setting a hard-coded user only inside this route's tree.
 *
 * Since AuthProvider is at the app root, we can't mutate the global
 * user from here without dev credentials. Instead, the modal will
 * fall back to the current user. We just open the modal directly.
 */
export function DevModalHarnessRoute() {
  const [open, setOpen] = useState(true);
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">CreatePostModal Harness</h1>
        <p className="text-sm text-muted-foreground">
          Modal at full open. Author from auth context: <code>{user?.displayName ?? 'guest'}</code>
        </p>
        <div className="flex gap-2">
          <Button onClick={() => setOpen(true)}>Open modal</Button>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </div>
      </div>
      <CreatePostModal
        open={open}
        onOpenChange={setOpen}
        onSubmit={async () => { /* no-op for harness */ }}
        requestImageCrop={async () => new Blob() }
      />
    </div>
  );
}
