'use server';

import Stripe from 'stripe';
import { currentUser } from '@clerk/nextjs/server';
import { SubscriptionStatus, SubscriptionType } from '@prisma/client';

import { db } from '@/libs/db';
import { ApiError } from '@/handlers/apiError';

import { checkAuth } from '../checkAuth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export type LineItem = Stripe.Checkout.SessionCreateParams.LineItem;

export const createStripeSession = async ({ subscriptionType }: { subscriptionType: SubscriptionType }) => {
  const user = await currentUser();

  if (!user) {
    throw ApiError.unauthorized('Unauthorized');
  }

  const lineItems: LineItem[] = [
    {
      price: subscriptionType === SubscriptionType.PRO ? process.env.MONTHLY_PRICE_ID : process.env.YEARLY_PRICE_ID,
      quantity: 1,
    },
  ];

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: lineItems,
    success_url: `${process.env.NEXT_PUBLIC_FRONT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_FRONT_URL}/payment-intend?status=cancel`,
    payment_method_types: ['card'],
    customer_email: user.emailAddresses[0].emailAddress,
    metadata: {
      user_id: user.id,
      subscription_type: subscriptionType,
      user_name: user.firstName + ' ' + user.lastName,
    },
  });

  return { sessionId: session.id, sessionUrl: session.url };
};

export const retrieveStripeSession = async (sessionId: string) => {
  if (!sessionId) {
    throw ApiError.badRequest('Session ID is required');
  }

  const userId = checkAuth();

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const subscription = await db.subscription.findFirst({
      where: {
        subscriptionId: session.subscription as string,
      },
    });

    if (subscription) {
      return subscription;
    } else {
      return await db.subscription.create({
        data: {
          userId,
          subscriptionId: session.subscription as string,
          type: session.metadata?.subscription_type as SubscriptionType,
          startDate: new Date(session.created * 1000),
          price: session.amount_total as number,
          mode: session.mode,
          currency: session.currency as string,
          customerId: session.customer as string,
          customerEmail: session.customer_email as string,
          status: SubscriptionStatus.Active,
        },
      });
    }
  } catch (error: any) {
    throw ApiError.internalError(error.message || 'Error updating subscription');
  }
};

export const cancelStripeSubscription = async (subscriptionId: string) => {
  if (!subscriptionId) {
    throw ApiError.badRequest('Subscription ID is required');
  }

  checkAuth();

  try {
    const session = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    const subscription = await db.subscription.findFirst({
      where: {
        subscriptionId,
      },
    });
    
    return await db.subscription.update({
      where: {
        id: subscription?.id,
      },
      data: {
        status: SubscriptionStatus.Canceled,
        cancelledAt: session.canceled_at ? new Date(session.canceled_at * 1000) : null,
        endDate: session.cancel_at ? new Date(session.cancel_at * 1000) : null,
      },
    });
  } catch (error: any) {
    throw ApiError.internalError(error.message || 'Error canceling subscription');
  }
};

// Example of Stripe session object (subscription):
// session {
//   id: 'cs_test_a1FHDWFt7tjdJW0kSLq8aBfvEPLvTMi4QFKq6USO0iFAJ51KSc7w5l1Ipg',
//   object: 'checkout.session',
//   after_expiration: null,
//   allow_promotion_codes: null,
//   amount_subtotal: 599,
//   amount_total: 599,
//   automatic_tax: { enabled: false, liability: null, status: null },
//   billing_address_collection: null,
//   cancel_url: 'http://localhost:3000/settings',
//   client_reference_id: null,
//   client_secret: null,
//   consent: null,
//   consent_collection: null,
//   created: 1728854328,
//   currency: 'usd',
//   currency_conversion: null,
//   custom_fields: [],
//   custom_text: {
//     after_submit: null,
//     shipping_address: null,
//     submit: null,
//     terms_of_service_acceptance: null
//   },
//   customer: 'cus_R1cQI5iG2p6ivX',
//   customer_creation: 'always',
//   customer_details: {
//     address: {
//       city: null,
//       country: 'UA',
//       line1: null,
//       line2: null,
//       postal_code: null,
//       state: null
//     },
//     email: 'kotykhin_d@ukr.net',
//     name: 'Dmytro Kotykhin',
//     phone: null,
//     tax_exempt: 'none',
//     tax_ids: []
//   },
//   customer_email: 'kotykhin_d@ukr.net',
//   expires_at: 1728940728,
//   invoice: 'in_1Q9ZBrLsaoR3fGdDpzvxwNFs',
//   invoice_creation: null,
//   livemode: false,
//   locale: null,
//   metadata: {
//     subscription_type: 'Monthly',
//     user_id: 'user_2jVYHAZKO3OanLZ3NfsGwvuzXLg'
//   },
//   mode: 'subscription',
//   payment_intent: null,
//   payment_link: null,
//   payment_method_collection: 'always',
//   payment_method_configuration_details: null,
//   payment_method_options: { card: { request_three_d_secure: 'automatic' } },
//   payment_method_types: [ 'card' ],
//   payment_status: 'paid',
//   phone_number_collection: { enabled: false },
//   recovered_from: null,
//   saved_payment_method_options: {
//     allow_redisplay_filters: [ 'always' ],
//     payment_method_remove: null,
//     payment_method_save: null
//   },
//   setup_intent: null,
//   shipping_address_collection: null,
//   shipping_cost: null,
//   shipping_details: null,
//   shipping_options: [],
//   status: 'complete',
//   submit_type: null,
//   subscription: 'sub_1Q9ZBrLsaoR3fGdDErBJ8TcD',
//   success_url: 'http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}',
//   total_details: { amount_discount: 0, amount_shipping: 0, amount_tax: 0 },
//   ui_mode: 'hosted',
//   url: null
// }

// Example of Stripe session object (cancel subscription):

// cancelStripeSubscription {
//   id: 'sub_1Q9ZBrLsaoR3fGdDErBJ8TcD',
//   object: 'subscription',
//   application: null,
//   application_fee_percent: null,
//   automatic_tax: { enabled: false, liability: null },
//   billing_cycle_anchor: 1728854343,
//   billing_cycle_anchor_config: null,
//   billing_thresholds: null,
//   cancel_at: 1731532743,
//   cancel_at_period_end: true,
//   canceled_at: 1728855460,
//   cancellation_details: { comment: null, feedback: null, reason: 'cancellation_requested' },
//   collection_method: 'charge_automatically',
//   created: 1728854343,
//   currency: 'usd',
//   current_period_end: 1731532743,
//   current_period_start: 1728854343,
//   customer: 'cus_R1cQI5iG2p6ivX',
//   days_until_due: null,
//   default_payment_method: 'pm_1Q9ZBpLsaoR3fGdDCuxxuqZi',
//   default_source: null,
//   default_tax_rates: [],
//   description: null,
//   discount: null,
//   discounts: [],
//   ended_at: null,
//   invoice_settings: { account_tax_ids: null, issuer: { type: 'self' } },
//   items: {
//     object: 'list',
//     data: [ [Object] ],
//     has_more: false,
//     total_count: 1,
//     url: '/v1/subscription_items?subscription=sub_1Q9ZBrLsaoR3fGdDErBJ8TcD'
//   },
//   latest_invoice: 'in_1Q9ZBrLsaoR3fGdDpzvxwNFs',
//   livemode: false,
//   metadata: {},
//   next_pending_invoice_item_invoice: null,
//   on_behalf_of: null,
//   pause_collection: null,
//   payment_settings: {
//     payment_method_options: {
//       acss_debit: null,
//       bancontact: null,
//       card: [Object],
//       customer_balance: null,
//       konbini: null,
//       sepa_debit: null,
//       us_bank_account: null
//     },
//     payment_method_types: null,
//     save_default_payment_method: 'off'
//   },
//   pending_invoice_item_interval: null,
//   pending_setup_intent: null,
//   pending_update: null,
//   plan: {
//     id: 'price_1PqGbOLsaoR3fGdDMmL0cjgH',
//     object: 'plan',
//     active: true,
//     aggregate_usage: null,
//     amount: 599,
//     amount_decimal: '599',
//     billing_scheme: 'per_unit',
//     created: 1724254658,
//     currency: 'usd',
//     interval: 'month',
//     interval_count: 1,
//     livemode: false,
//     metadata: {},
//     meter: null,
//     nickname: null,
//     product: 'prod_QhfxU7ko65Pmc2',
//     tiers_mode: null,
//     transform_usage: null,
//     trial_period_days: null,
//     usage_type: 'licensed'
//   },
//   quantity: 1,
//   schedule: null,
//   start_date: 1728854343,
//   status: 'active',
//   test_clock: null,
//   transfer_data: null,
//   trial_end: null,
//   trial_settings: { end_behavior: { missing_payment_method: 'create_invoice' } },
//   trial_start: null
// }
