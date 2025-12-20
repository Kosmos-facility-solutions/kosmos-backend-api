export const PAYMENT_REMINDER_LEAD_DAYS = [10, 7, 3, 1] as const;

export type PaymentReminderLeadDays =
  (typeof PAYMENT_REMINDER_LEAD_DAYS)[number];

export const DEFAULT_PAYMENT_REMINDER_LEAD_DAYS = 7;
