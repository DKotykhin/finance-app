'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@nextui-org/react';
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, Check } from 'lucide-react';
import { SubscriptionStatus, SubscriptionType } from '@prisma/client';

import { format } from 'date-fns';

import { cancelStripeSubscription, createStripeSession } from '@/actions/Payment/stripeSession';
import { getSubscription } from '@/actions/Payment/getSubscription';
import { useConfirm } from '@/hooks/use-confirm';

export const PaymentSettings: React.FC<{ userId?: string | null }> = ({ userId }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [ConfirmModal, confirm] = useConfirm({
    title: 'Cancel Subscription',
    message: 'Are you sure you want to cancel your subscription?',
  });

  const { data: subscriptionData } = useQuery({
    enabled: !!userId,
    queryKey: ['subscription'],
    queryFn: () => getSubscription({ userId: userId as string }),
  });

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

  const createPaymentClick = async (subscriptionType: SubscriptionType) => {
    try {
      const { sessionUrl, sessionId } = await createStripeSession({ subscriptionType });

      if (!sessionId) {
        return toast.error('Failed to create checkout session!');
      }

      if (sessionUrl) {
        router.push(sessionUrl);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create checkout session!');
    }
  };

  const cancelPaymentClick = async (subscriptionId: string | null) => {
    if (!subscriptionId) {
      return toast.error('Failed to cancel subscription!');
    }

    const ok = await confirm();

    if (ok) {
      cancelMutation.mutateAsync(subscriptionId);
    }
  };

  return (
    <>
      <div className="mb-8">
        <p className="w-full text-center mt-1 mb-1 text-2xl uppercase font-bold">Choose the best payment plan</p>
        {subscriptionData?.type ? (
          <>
            <div className="w-full flex justify-center items-center gap-1">
              <p className="text-gray-500 italic">{`your current plan: ${subscriptionData?.type}`}</p>
              <BadgeCheck color={subscriptionData?.type === SubscriptionType.PRO ? '#10b981' : '#f0cc01'} size={20} />
            </div>
          </>
        ) : (
          <div className="w-full flex justify-center items-center gap-1">
            <p className="text-gray-500 italic">your current plan: Free</p>
            <BadgeCheck color="#c0c0c0" size={20} />
          </div>
        )}
      </div>
      <div className="flex flex-col lg:flex-row justify-center items-center lg:items-stretch gap-4">
        <div className="flex flex-col gap-2 items-center border p-4 rounded-md w-full max-w-[400px] shadow-lg">
          <div className="flex items-center gap-1">
            <p className="font-bold text-2xl uppercase text-blue-600">Free</p>
            <BadgeCheck color="#c0c0c0" />
          </div>
          <div className="border border-blue-600 w-6"></div>
          <p className="font-bold text-2xl mt-4">$ 0</p>
          <p className="text-grey-500 text-sm italic mb-8">per month</p>
          <div>
            <div className="flex gap-2 items-center">
              <Check color="#2563eb" />
              <p className="text-gray-500 text-sm italic">Maximum 3 accounts</p>
            </div>
            <div className="flex gap-2 items-center">
              <Check color="#2563eb" />
              <p className="text-gray-500 text-sm italic">Maximum 5 categories</p>
            </div>
            <div className="flex gap-2 items-center">
              <Check color="#2563eb" />
              <p className="text-gray-500 text-sm italic">Maximum 3 transactions a day</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-center border p-4 rounded-md w-full max-w-[400px] shadow-lg">
          <div className="flex items-center gap-1">
            <p className="font-bold text-2xl uppercase text-blue-600">Pro</p>
            <BadgeCheck color="#10b981" />
          </div>
          <div className="border border-blue-600 w-6"></div>
          <p className="font-bold text-2xl mt-4">$ 5.99</p>
          <p className="text-grey-500 text-sm italic mb-8">per month</p>
          <div className="mb-6 grow">
            <div className="flex gap-2 items-center">
              <Check color="#2563eb" />
              <p className="text-gray-500 text-sm italic">Unlimited accounts</p>
            </div>
            <div className="flex gap-2 items-center">
              <Check color="#2563eb" />
              <p className="text-gray-500 text-sm italic">Unlimited categories</p>
            </div>
            <div className="flex gap-2 items-center">
              <Check color="#2563eb" />
              <p className="text-gray-500 text-sm italic">Unlimited transactions</p>
            </div>
          </div>
          {subscriptionData?.type === SubscriptionType.PRO &&
            subscriptionData?.status === SubscriptionStatus.Canceled &&
            subscriptionData.endDate &&
            new Date(subscriptionData.endDate) > new Date() && (
              <div className="text-sm text-grey-500 text-center space-y-1">
                <p>{subscriptionData?.status}</p>
                <p>Expiration Date: {format(new Date(subscriptionData.endDate), 'dd MMM, yyyy')}</p>
              </div>
            )}
          {(!subscriptionData ||
            (subscriptionData.endDate && new Date(subscriptionData.endDate) < new Date()) ||
            (subscriptionData?.type === SubscriptionType.PRO &&
              subscriptionData?.status === SubscriptionStatus.Active)) && (
            <Button
              color="primary"
              variant={
                subscriptionData?.type === SubscriptionType.PRO &&
                subscriptionData?.status === SubscriptionStatus.Active
                  ? 'flat'
                  : 'solid'
              }
              onClick={() =>
                subscriptionData?.type === SubscriptionType.PRO &&
                subscriptionData?.status === SubscriptionStatus.Active
                  ? cancelPaymentClick(subscriptionData.subscriptionId)
                  : createPaymentClick(SubscriptionType.PRO)
              }
              isLoading={cancelMutation.isPending}
            >
              {subscriptionData?.type === SubscriptionType.PRO && subscriptionData?.status === SubscriptionStatus.Active
                ? 'Unsubscribe'
                : 'Subscribe'}
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-2 items-center border p-4 rounded-md w-full max-w-[400px] shadow-lg relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-6 left-[-40px] w-[200px] bg-orange-500 text-white font-bold pl-8 py-1 rotate-[-45deg] shadow-md pointer-events-auto">
              Most Popular
            </div>
          </div>
          <div className="flex items-center gap-1">
            <p className="font-bold text-2xl uppercase text-blue-600">Gold</p>
            <BadgeCheck color="#f0cc01" />
          </div>
          <div className="border border-blue-600 w-6"></div>
          <p className="font-bold text-2xl mt-4">$ 59.99</p>
          <p className="text-grey-500 text-sm italic mb-8">per year</p>
          <div className="mb-6">
            <div className="flex gap-2 items-center">
              <Check color="#2563eb" />
              <p className="text-gray-500 text-sm italic">Unlimited accounts</p>
            </div>
            <div className="flex gap-2 items-center">
              <Check color="#2563eb" />
              <p className="text-gray-500 text-sm italic">Unlimited categories</p>
            </div>
            <div className="flex gap-2 items-center">
              <Check color="#2563eb" />
              <p className="text-gray-500 text-sm italic">Unlimited transactions</p>
            </div>
            <div className="flex gap-2 items-center">
              <Check color="#2563eb" />
              <p className="text-gray-500 text-sm italic">Save 17%</p>
            </div>
          </div>
          {subscriptionData?.type === SubscriptionType.GOLD &&
            subscriptionData?.status === SubscriptionStatus.Canceled &&
            subscriptionData.endDate &&
            new Date(subscriptionData.endDate) > new Date() && (
              <div className="text-sm text-grey-500 text-center space-y-1">
                <p>{subscriptionData?.status}</p>
                <p>Expiration Date: {format(new Date(subscriptionData.endDate), 'dd MMM, yyyy')}</p>
              </div>
            )}
          {(!subscriptionData ||
            (subscriptionData.endDate && new Date(subscriptionData.endDate) < new Date()) ||
            (subscriptionData?.type === SubscriptionType.GOLD &&
              subscriptionData?.status === SubscriptionStatus.Active)) && (
            <Button
              color="primary"
              variant={
                subscriptionData?.type === SubscriptionType.GOLD &&
                subscriptionData?.status === SubscriptionStatus.Active
                  ? 'flat'
                  : 'solid'
              }
              onClick={() =>
                subscriptionData?.type === SubscriptionType.GOLD &&
                subscriptionData?.status === SubscriptionStatus.Active
                  ? cancelPaymentClick(subscriptionData.subscriptionId)
                  : createPaymentClick(SubscriptionType.GOLD)
              }
              isLoading={cancelMutation.isPending}
            >
              {subscriptionData?.type === SubscriptionType.GOLD &&
              subscriptionData?.status === SubscriptionStatus.Active
                ? 'Unsubscribe'
                : 'Subscribe'}
            </Button>
          )}
        </div>
      </div>
      <ConfirmModal />
    </>
  );
};
