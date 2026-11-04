export type ErrorPageCode = '400' | '404' | '500' | '403' | 'offline' | 'unknown';

export interface ErrorPageCta {
  label: string;
  path: string;
}

/** Plain step, or step with an inline router link (e.g. “contact us here”). */
export interface ErrorPageStep {
  text: string;
  linkLabel?: string;
  linkPath?: string;
  textAfter?: string;
}

export interface ErrorPageContent {
  /** Empty = hide the ERROR eyebrow (avoids “ERROR Error”). */
  code: string;
  title: string;
  why: string;
  nextSteps: ErrorPageStep[];
  primary: ErrorPageCta;
  secondary?: ErrorPageCta;
}

export const ERROR_PAGES: Record<ErrorPageCode, ErrorPageContent> = {
  '400': {
    code: '400',
    title: 'That request could not be understood',
    why: 'The shop got a bad or incomplete request — often a form that was incomplete, or a link that is no longer valid.',
    nextSteps: [
      { text: 'Go back and check the form or link you used.' },
      { text: 'Try the step again from the shop or your account.' },
      {
        text: 'If it keeps failing, ',
        linkLabel: 'contact us here',
        linkPath: '/help/contact',
        textAfter: '.',
      },
    ],
    primary: { label: 'Back to home', path: '/' },
    secondary: { label: 'Browse the shop', path: '/shop' },
  },
  '404': {
    code: '404',
    title: 'Page not found',
    why: 'That address is not a page in this shop. The link may be old, mistyped, or the product was removed.',
    nextSteps: [
      { text: 'Check the URL for typos.' },
      { text: 'Use Shop to browse what is in stock.' },
      {
        text: 'If you followed a link from an email, open Account → Orders when signed in, or ',
        linkLabel: 'contact us here',
        linkPath: '/help/contact',
        textAfter: ' with the order number.',
      },
    ],
    primary: { label: 'Browse the shop', path: '/shop' },
    secondary: { label: 'Back to home', path: '/' },
  },
  '500': {
    code: '500',
    title: 'Something went wrong on our side',
    why: 'The shop hit an unexpected server error while handling your request. Your bag and account data are usually fine — this is not a payment failure by itself.',
    nextSteps: [
      { text: 'Wait a moment and try again.' },
      {
        text: 'If you were checking out, open your bag and continue — do not pay twice unless the first attempt clearly failed.',
      },
      {
        text: 'Still stuck? ',
        linkLabel: 'Contact us here',
        linkPath: '/help/contact',
        textAfter: ' with what you were doing and the time (SAST).',
      },
    ],
    primary: { label: 'Try home', path: '/' },
  },
  '403': {
    code: '403',
    title: 'You do not have access',
    why: 'This area is limited to signed-in staff or a different account role. Your session may also have expired.',
    nextSteps: [
      { text: 'Sign in with the account that should have access.' },
      { text: 'If you are a customer, use Account for your own orders instead of Admin.' },
      {
        text: 'Need help? ',
        linkLabel: 'Contact us here',
        linkPath: '/help/contact',
        textAfter: '.',
      },
    ],
    primary: { label: 'Sign in', path: '/sign-in' },
    secondary: { label: 'Back to home', path: '/' },
  },
  offline: {
    code: 'Offline',
    title: 'We cannot reach the shop right now',
    why: 'Your browser could not reach our servers. That is often a network blip, or the shop is briefly restarting.',
    nextSteps: [
      { text: 'Check your internet connection.' },
      { text: 'Refresh the page in a minute.' },
      {
        text: 'If it keeps failing, try again later, or ',
        linkLabel: 'contact us here',
        linkPath: '/help/contact',
        textAfter: '.',
      },
    ],
    primary: { label: 'Back to home', path: '/' },
  },
  unknown: {
    code: '',
    title: 'Something went wrong',
    why: 'The shop ran into a problem we could not classify. It may be temporary.',
    nextSteps: [
      { text: 'Go back and try the same step again.' },
      {
        text: 'If you were paying, check Account → Orders or your email before starting a second payment.',
      },
      {
        text: 'If it keeps happening, ',
        linkLabel: 'contact us here',
        linkPath: '/help/contact',
        textAfter: '.',
      },
    ],
    primary: { label: 'Back to home', path: '/' },
    secondary: { label: 'Browse the shop', path: '/shop' },
  },
} as const;

export function errorPageFor(code: string | null | undefined): ErrorPageContent {
  const key = (code ?? '').trim().toLowerCase();
  if (key === '400' || key === 'bad-request') {
    return ERROR_PAGES['400'];
  }
  if (key === '404' || key === 'not-found') {
    return ERROR_PAGES['404'];
  }
  if (key === '500' || key === 'server') {
    return ERROR_PAGES['500'];
  }
  if (key === '403' || key === 'forbidden') {
    return ERROR_PAGES['403'];
  }
  if (key === 'offline' || key === '0') {
    return ERROR_PAGES.offline;
  }
  // Keep a real status number in the eyebrow when the URL has one we do not special-case.
  if (/^\d{3}$/.test(key)) {
    return { ...ERROR_PAGES.unknown, code: key };
  }
  return ERROR_PAGES.unknown;
}
