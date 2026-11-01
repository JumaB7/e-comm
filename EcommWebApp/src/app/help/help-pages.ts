export type HelpPageSlug = 'delivery' | 'returns' | 'contact';

export interface HelpPage {
  slug: HelpPageSlug;
  title: string;
  summary: string;
  sections: { heading: string; body: string[] }[];
}

export const helpPages: Record<HelpPageSlug, HelpPage> = {
  delivery: {
    slug: 'delivery',
    title: 'Delivery',
    summary: 'Courier nationwide, or collect when the order is packed.',
    sections: [
      {
        heading: 'Courier',
        body: [
          'We ship across South Africa with a national courier. Most orders take 2–5 working days after payment clears.',
          'Courier is free on orders over R1 500. Below that, the courier fee shows on checkout before you pay on PayFast.',
        ],
      },
      {
        heading: 'Collect from the shop',
        body: [
          'Choose collect at checkout if you want to pick up. We email you when the order is packed and ready.',
        ],
      },
      {
        heading: 'Tracking',
        body: [
          'Once the parcel is with the courier, tracking details go to the email on the order. You can also check status under Account → Orders when you are signed in.',
        ],
      },
    ],
  },
  returns: {
    slug: 'returns',
    title: 'Returns',
    summary: 'Unused kit in original condition can come back within 14 days of delivery.',
    sections: [
      {
        heading: 'What we accept',
        body: [
          'Unused items with tags and packaging intact, within 14 days of delivery or collection.',
          'Faulty goods are covered separately — contact us with your order number and photos so we can sort a replacement or refund.',
        ],
      },
      {
        heading: 'How to return',
        body: [
          'Email hello@veldsupply.co.za with your order number and what you want to return. We will confirm the address and next steps.',
          'Refunds go back to the original PayFast payment method after we receive and check the goods.',
        ],
      },
      {
        heading: 'What we cannot take back',
        body: [
          'Opened consumables, personalised items, or gear that shows clear use or damage from the field.',
        ],
      },
    ],
  },
  contact: {
    slug: 'contact',
    title: 'Contact',
    summary: 'Orders, stock, and returns — we reply on weekdays.',
    sections: [
      {
        heading: 'Email',
        body: [
          'hello@veldsupply.co.za — orders, delivery, and returns.',
          'Include your order number (for example VS-1048) when you have one so we can find it quickly.',
        ],
      },
      {
        heading: 'Hours',
        body: [
          'Monday to Friday, 08:00–17:00 SAST. We aim to reply within one working day.',
        ],
      },
      {
        heading: 'Payment',
        body: [
          'Card, Instant EFT, and Capitec Pay run through PayFast at checkout. We never take card details on this site.',
        ],
      },
    ],
  },
};

export function isHelpPageSlug(value: string): value is HelpPageSlug {
  return value === 'delivery' || value === 'returns' || value === 'contact';
}
