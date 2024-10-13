'use client';

import React from 'react';
import { Button } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, Check } from 'lucide-react';
import { SubscriptionType } from '@prisma/client';

import { cancelStripeSubscription, createStripeSession } from '@/actions/Payment/stripeSession';
import { getUserSettings } from '@/actions/UserSettings/getUserSettings';
import { useConfirm } from '@/hooks/use-confirm';

export const PaymentSettings: React.FC<{ userId?: string | null }> = ({ userId }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [ConfirmModal, confirm] = useConfirm({
    title: 'Cancel Subscription',
    message: 'Are you sure you want to cancel your subscription?',
  });

  const { data: userSettingsData } = useQuery({
    enabled: !!userId,
    queryKey: ['userSettings'],
    queryFn: () => getUserSettings({ userId: userId as string }),
  });

  const cancelMutation = useMutation({
    mutationFn: (sessionId: string) => cancelStripeSubscription(sessionId),
    onSuccess: () => {
      toast.success(`Subscription updated successfully`);
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createPaymentClick = async (subscriptionType: SubscriptionType) => {
    try {
      const lineItems = [
        {
          price:
            subscriptionType === SubscriptionType.Monthly
              ? process.env.NEXT_PUBLIC_MONTHLY_PRICE_ID
              : process.env.NEXT_PUBLIC_YEARLY_PRICE_ID,
          quantity: 1,
        },
      ];

      const { sessionUrl } = await createStripeSession({ lineItems, subscriptionType });

      if (sessionUrl) {
        router.push(sessionUrl);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create checkout session!');
    }
  };

  const cancelPaymentClick = async (sessionId: string | null) => {
    if (!sessionId) {
      return toast.error('Failed to cancel subscription!');
    }
    const ok = await confirm();
    if (ok) {
      cancelMutation.mutateAsync(sessionId);
    }
  };

  return (
    <>
      <div className="mb-8">
        <p className="w-full text-center mt-1 mb-1 text-2xl uppercase font-bold">Choose the best payment plan</p>
        {userSettingsData?.subscriptionType && (
          <>
            <div className="w-full flex justify-center items-center gap-1">
              <p className="text-gray-500 italic">{`your current plan: ${userSettingsData.subscriptionType}`}</p>
              <BadgeCheck
                color={
                  userSettingsData?.subscriptionType === SubscriptionType.Monthly
                    ? '#10b981'
                    : userSettingsData?.subscriptionType === SubscriptionType.Yearly
                      ? '#f0cc01'
                      : '#c0c0c0'
                }
                size={20}
              />
            </div>
          </>
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
          <Button
            color="primary"
            variant={userSettingsData?.subscriptionType === SubscriptionType.Monthly ? 'flat' : 'solid'}
            onClick={() =>
              userSettingsData?.subscriptionType === SubscriptionType.Monthly
                ? cancelPaymentClick(userSettingsData.subscriptionId)
                : createPaymentClick(SubscriptionType.Monthly)
            }
            isLoading={cancelMutation.isPending}
          >
            {userSettingsData?.subscriptionType === SubscriptionType.Monthly ? 'Unsubscribe' : 'Subscribe'}
          </Button>
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
          <Button
            color="primary"
            variant={userSettingsData?.subscriptionType === SubscriptionType.Yearly ? 'flat' : 'solid'}
            onClick={() =>
              userSettingsData?.subscriptionType === SubscriptionType.Yearly
                ? cancelPaymentClick(userSettingsData.subscriptionId)
                : createPaymentClick(SubscriptionType.Yearly)
            }
            isLoading={cancelMutation.isPending}
          >
            {userSettingsData?.subscriptionType === SubscriptionType.Yearly ? 'Unsubscribe' : 'Subscribe'}
          </Button>
        </div>
      </div>
      <ConfirmModal />
    </>
  );
};
