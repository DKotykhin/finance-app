'use server';

import Stripe from 'stripe';
import { currentUser } from '@clerk/nextjs/server';
import { SubscriptionType } from '@prisma/client';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export type LineItem = Stripe.Checkout.SessionCreateParams.LineItem;

export const createStripeSession = async ({
  lineItems,
  subscriptionType,
}: {
  lineItems: LineItem[];
  subscriptionType: SubscriptionType;
}) => {
  const user = await currentUser();
  if (!user) {
    throw ApiError.unauthorized('Unauthorized');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: lineItems,
    success_url: `${process.env.NEXT_PUBLIC_FRONT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_FRONT_URL}/settings`,
    payment_method_types: ['card'],
    customer_email: user.emailAddresses[0].emailAddress,
    metadata: {
      user_id: user.id,
      subscription_type: subscriptionType,
    },
  });

  return { sessionId: session.id, sessionUrl: session.url };
};

export const retrieveStripeSession = async (sessionId: string) => {
  if (!sessionId) {
    throw ApiError.badRequest('Session ID is required');
  }
  const user = await currentUser();
  if (!user) {
    throw ApiError.unauthorized('Unauthorized');
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const userSettings = await db.userSettings.upsert({
      where: {
        userId: user.id,
      },
      update: {
        subscriptionType: session.metadata?.subscription_type as SubscriptionType,
        subscriptionId: session.subscription as string,
        subscriptionStart: new Date(session.created * 1000),
        subscriptionEnd: new Date(session.expires_at * 1000),
      },
      create: {
        userId: user.id,
        subscriptionId: session.subscription as string,
        subscriptionStart: new Date(session.created * 1000),
        subscriptionEnd: new Date(session.expires_at * 1000),
      },
    });

    return userSettings;
  } catch (error: any) {
    throw ApiError.internalError(error.message || 'Error updating user settings');
  }
};

export const cancelStripeSubscription = async (subscriptionId: string) => {
  if (!subscriptionId) {
    throw ApiError.badRequest('Subscription ID is required');
  }
  const user = await currentUser();
  if (!user) {
    throw ApiError.unauthorized('Unauthorized');
  }
  try {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return await db.userSettings.update({
      where: {
        userId: user.id,
      },
      data: {
        subscriptionType: SubscriptionType.Free,
        subscriptionId: null,
        subscriptionStart: null,
        subscriptionEnd: new Date(),
      },
    });
  } catch (error: any) {
    throw ApiError.internalError(error.message || 'Error canceling subscription');
  }
};
