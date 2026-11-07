// Shared between the enquiry form (client) and the mailer route (server).

export const TOPICS = [
  { id: 'manufacturing', label: 'Third-party or white-label manufacturing', note: 'Your formulation made in our GMP-certified factory, or ours under your brand.',
    placeholder: 'For example: a capsule formulation for the European market' },
  { id: 'licence', label: 'Licence manufacture', note: 'Ayurveda products developed by AVVVS, manufactured under licence.',
    placeholder: 'Which products, and for which market?' },
  { id: 'clinic', label: 'AVVVS Ayur Speciality Clinic', note: 'Clinic partnerships in wellness, leisure and hospitality.',
    placeholder: 'Tell us about your property or centre' },
  { id: 'experience', label: 'Gloveda Experience', note: 'Ayurveda therapies and products for hotel and resort spas.',
    placeholder: 'Your hotel or resort, and its spa' },
  { id: 'revive', label: 'Gloveda Revive', note: 'Treatments and products for independent spas and wellness centres.',
    placeholder: 'Your spa or wellness centre' },
  { id: 'other', label: 'Something else', note: 'Tell us in your own words.',
    placeholder: 'What would you like to talk about?' },
] as const;

export type TopicId = (typeof TOPICS)[number]['id'];
export const topicById = (id: string) => TOPICS.find((t) => t.id === id);

export interface Enquiry {
  topic: TopicId;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  message: string;
}

export const LIMITS = { name: 120, company: 160, email: 200, phone: 40, country: 80, message: 4000 } as const;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Field errors in plain words, or an empty object when the enquiry is complete. */
export function validate(e: Partial<Enquiry>): Partial<Record<keyof Enquiry, string>> {
  const err: Partial<Record<keyof Enquiry, string>> = {};
  if (!e.topic || !topicById(e.topic)) err.topic = 'Choose what you would like to talk about.';
  if (!e.name?.trim()) err.name = 'Add your name so we know who to reply to.';
  if (!e.company?.trim()) err.company = 'Add your company or organisation.';
  if (!e.email?.trim()) err.email = 'Add an email address we can reply to.';
  else if (!EMAIL_RE.test(e.email.trim())) err.email = 'Check the email address: it needs an @ and a domain.';
  if (!e.message?.trim()) err.message = 'Tell us a little about what you have in mind.';
  for (const k of Object.keys(LIMITS) as (keyof typeof LIMITS)[]) {
    if ((e[k]?.length ?? 0) > LIMITS[k]) err[k] = 'That is longer than we can take here.';
  }
  return err;
}
