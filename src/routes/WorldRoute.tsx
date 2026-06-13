import { useAuth } from '@/hooks/AuthProvider';
import { useLikedIdsQuery } from '@/hooks/queries/useLikes';
import { useWorldGraphQuery } from '@/hooks/queries/useWorld';
import { WorldPage as WorldPageComponent } from '@/components/WorldPage';

export function WorldRoute() {
  const { user } = useAuth();
  const currentUserPlanet = (user as any)?.planet ?? 'moon';
  const userId = user?.id ?? '';

  const { data: likedIdsData } = useLikedIdsQuery(userId);
  const worldQuery = useWorldGraphQuery(userId);

  return (
    <WorldPageComponent
      posts={worldQuery.data?.posts ?? []}
      likedIds={likedIdsData ?? []}
      connections={worldQuery.data?.connections ?? []}
      currentUserId={userId}
      currentUserPlanet={currentUserPlanet}
      isLoading={worldQuery.isLoading}
      isError={worldQuery.isError}
      onRetry={() => worldQuery.refetch()}
    />
  );
}
