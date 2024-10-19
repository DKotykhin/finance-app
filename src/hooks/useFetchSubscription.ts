import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import type { Subscription } from '@prisma/client';

import { cancelStripeSubscription, getSubscription } from '@/actions';

export const useFetchSubscription = (
  enabled = true
): {
  subscriptionData?: Subscription | null;
  isSubscriptionLoading: boolean;
  cancelSubscription: UseMutationResult<Subscription, Error, string, unknown>;
} => {
  const { data, isLoading } = useQuery({
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

  return { subscriptionData: data, isSubscriptionLoading: isLoading, cancelSubscription: cancelMutation };
};
