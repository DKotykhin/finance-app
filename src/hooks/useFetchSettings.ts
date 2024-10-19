import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import type { UserSettings } from '@prisma/client';

import { getUserSettings, upsertUserSettings } from '@/actions';

export const useFetchSettings = (
  enabled = true
): {
  userSettingsData?: UserSettings | null;
  isUserSettingsLoading: boolean;
  upsertUserSettings: UseMutationResult<UserSettings, Error, Partial<UserSettings>, unknown>;
} => {
  const { data, isLoading } = useQuery({
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

  return { userSettingsData: data, isUserSettingsLoading: isLoading, upsertUserSettings: upsertMutation };
};
