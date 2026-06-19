import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getProfile, updateDisplayName, updatePlanet } from '@/lib/supabase';

export interface ProfileData {
  id: string;
  displayName: string;
  planet: string;
}

export function useProfileQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: async (): Promise<ProfileData> => {
      const data = await getProfile(userId);
      return {
        id: data.id,
        displayName: data.display_name,
        planet: data.planet,
      };
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.profile(userId);

  return useMutation({
    mutationFn: async (displayName: string) => { await updateDisplayName(userId, displayName); },
    onMutate: async (displayName) => {
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<ProfileData>(key);
      queryClient.setQueryData<ProfileData>(key, (old) =>
        old ? { ...old, displayName } : old
      );
      return { prev: prev ?? null };
    },
    onError: (_err, _name, context: { prev: ProfileData | null } | undefined) => {
      if (context?.prev) queryClient.setQueryData(key, context.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

export function useUpdatePlanet(userId: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.profile(userId);

  return useMutation({
    mutationFn: async (planet: string) => { await updatePlanet(userId, planet); },
    onMutate: async (planet) => {
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<ProfileData>(key);
      queryClient.setQueryData<ProfileData>(key, (old) =>
        old ? { ...old, planet } : old
      );
      return { prev: prev ?? null };
    },
    onError: (_err, _planet, context: { prev: ProfileData | null } | undefined) => {
      if (context?.prev) queryClient.setQueryData(key, context.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
