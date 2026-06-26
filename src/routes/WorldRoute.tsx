import { useAuth } from '@/hooks/AuthProvider';
import { useWorldGraphQuery } from '@/hooks/queries/useWorld';
import { WorldPage as WorldPageComponent } from '@/components/WorldPage';
import { ZoomSlider } from '@/components/ZoomSlider';

export function WorldRoute() {
  const { user } = useAuth();
  const currentUserPlanet = user?.planet ?? 'moon';
  const userId = user?.id ?? '';

  const worldQuery = useWorldGraphQuery(userId);

  return (
    <>
      <WorldPageComponent
        posts={worldQuery.data?.posts ?? []}
        connections={worldQuery.data?.connections ?? []}
        currentUserId={userId}
        currentUserPlanet={currentUserPlanet}
        isLoading={worldQuery.isLoading}
        isError={worldQuery.isError}
        onRetry={() => worldQuery.refetch()}
      />
      <ZoomSlider />
    </>
  );
}
