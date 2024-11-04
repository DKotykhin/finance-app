import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import type { Subscription } from '@prisma/client';

import { cancelStripeSubscription, getSubscription } from '@/actions';

export const useFetchSubscription = (
  enabled = true
): {
  subscription: UseQueryResult<Subscription | null, Error>;
  cancelSubscription: UseMutationResult<Subscription, Error, string, unknown>;
} => {
  const subscription = useQuery({
    enabled,
    queryKey: ['subscription'],
    queryFn: () => getSubscription(),
  });

  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: (sessionId: string) => cancelStripeSubscription(sessionId),
    onSuccess: () => {
      toast.success(`Subscription updated successfully`);
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  return { subscription, cancelSubscription: cancelMutation };
};
