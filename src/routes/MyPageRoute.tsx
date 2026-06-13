import { useState } from 'react';
import { useAuth } from '@/hooks/AuthProvider';
import { useMyPostsQuery, useCreatePost, useDeletePost } from '@/hooks/queries/useMyPosts';
import { useUpdateProfile, useUpdatePlanet } from '@/hooks/queries/useProfile';
import { MyPage as MyPageComponent } from '@/components/MyPage';
import { DeleteAccountDialog } from '@/components/DeleteAccountDialog';
import { useImageCropper } from '@/hooks/useImageCropper';
import { toast } from 'sonner';
import { useI18n } from '@/i18n';
import { deleteAccount } from '@/lib/supabase';
import type { PlanetKey } from '@/constants/planets';

export function MyPageRoute() {
  const { user, logout, setPlanet, setDisplayName } = useAuth();
  const { t } = useI18n();
  const userId = user?.id ?? '';
  const authorName = user?.displayName ?? '';
  const authorPlanet = user?.planet ?? 'moon';

  const { data: posts = [], isLoading, isError, refetch } = useMyPostsQuery(userId);
  const { mutateAsync: createPostMutate } = useCreatePost(userId, authorName);
  const { mutate: deletePostMutate } = useDeletePost(userId);
  const { mutateAsync: updateProfileMutate } = useUpdateProfile(userId);
  const { mutateAsync: updatePlanetMutate } = useUpdatePlanet(userId);

  const { requestCrop, CropModal } = useImageCropper();

  const [logoutToast, setLogoutToast] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleLogout = async () => {
    await logout();
    setLogoutToast(true);
    setTimeout(() => setLogoutToast(false), 2000);
  };

  const handleChangeName = async (name: string) => {
    await updateProfileMutate(name);
    setDisplayName(name);
  };

  const handleChangePlanet = async (planet: PlanetKey) => {
    await updatePlanetMutate(planet);
    setPlanet(planet);
  };

  const handleDeleteAccount = async () => {
    if (deletingAccount) return;
    setDeletingAccount(true);
    try {
      await deleteAccount(userId);
      await logout();
      toast(t('myPageRoute.accountDeleted'), { duration: 2000 });
    } catch (err) {
      console.error('Account deletion failed:', err);
      toast(t('myPageRoute.deleteFailed'), { duration: 3000 });
      setDeletingAccount(false);
    }
  };

  return (
    <>
      <MyPageComponent
        posts={posts}
        userName={authorName}
        userPlanet={authorPlanet as PlanetKey}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onLogout={handleLogout}
        onDeleteAccount={async () => { setDeleteDialogOpen(true); }}
        onCreatePost={async (opts) => { await createPostMutate(opts); }}
        onDeletePost={(postId) => { deletePostMutate(postId); }}
        onChangeName={handleChangeName}
        onChangePlanet={handleChangePlanet}
        requestImageCrop={requestCrop}
      />
      {CropModal}
      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={async () => {
          await handleDeleteAccount();
          setDeleteDialogOpen(false);
        }}
      />
      {logoutToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-card border border-border/50 rounded-xl text-sm text-foreground shadow-lg z-[999]">
          {t('myPageRoute.loggedOut')}
        </div>
      )}
    </>
  );
}
