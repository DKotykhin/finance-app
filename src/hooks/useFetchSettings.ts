import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import type { UserSettings } from '@prisma/client';

import { getUserSettings, upsertUserSettings } from '@/actions';

export const useFetchSettings = (
  enabled = true
): {
  userSettings: UseQueryResult<UserSettings | null, Error>;
  upsertUserSettings: UseMutationResult<UserSettings, Error, Partial<UserSettings>, unknown>;
} => {
  const userSettings = useQuery({
    enabled,
    queryKey: ['userSettings'],
    queryFn: () => getUserSettings(),
  });

  const queryClient = useQueryClient();

  const upsertMutation = useMutation({
    mutationFn: (userSettingsData: Partial<UserSettings>) => upsertUserSettings(userSettingsData),
    onSuccess: () => {
      toast.success(`User Settings updated successfully`);
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  return { userSettings, upsertUserSettings: upsertMutation };
};
