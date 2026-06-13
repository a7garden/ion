import { useState } from 'react';
import { useAuth } from '@/hooks/AuthProvider';
import { useMyPostsQuery, useCreatePost, useDeletePost } from '@/hooks/queries/useMyPosts';
import { useUpdateProfile, useUpdatePlanet } from '@/hooks/queries/useProfile';
import { MyPage as MyPageComponent } from '@/components/MyPage';
import { useImageCropper } from '@/hooks/useImageCropper';
import { toast } from 'sonner';
import { deleteAccount } from '@/lib/supabase';
import type { PlanetKey } from '@/constants/planets';

export function MyPageRoute() {
  const { user, logout, setPlanet, setDisplayName } = useAuth();
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
      toast('탈퇴되었습니다', { duration: 2000 });
    } catch (err) {
      console.error('Account deletion failed:', err);
      toast('탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해주세요.', { duration: 3000 });
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
        onDeleteAccount={handleDeleteAccount}
        onCreatePost={async (opts) => { await createPostMutate(opts); }}
        onDeletePost={(postId) => { deletePostMutate(postId); }}
        onChangeName={handleChangeName}
        onChangePlanet={handleChangePlanet}
        requestImageCrop={requestCrop}
      />
      {CropModal}
      {logoutToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-card border border-border/50 rounded-xl text-sm text-foreground shadow-lg z-[600]">
          Logged out
        </div>
      )}
    </>
  );
}
