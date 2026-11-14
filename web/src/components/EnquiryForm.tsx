'use client';

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { CONTACT } from '@/lib/contact';
import { TOPICS, topicById, validate, type Enquiry, type TopicId } from '@/lib/enquiry';
import { trackLead } from '@/lib/track';

export const ENQUIRE_EVENT = 'avvvs:enquire';

/** Open the enquiry panel from anywhere, optionally with a topic chosen. */
export function openEnquiry(topic?: TopicId) {
  window.dispatchEvent(new CustomEvent<TopicId | undefined>(ENQUIRE_EVENT, { detail: topic }));
}

type Values = Omit<Enquiry, 'topic'> & { topic: TopicId | '' };
type Errors = Partial<Record<keyof Enquiry, string>>;
type State = 'idle' | 'sending' | 'sent' | 'failed';
const EMPTY: Values = { topic: '', name: '', company: '', email: '', phone: '', country: '', message: '' };

/**
 * The enquiry panel, mounted once in the layout. Any link to #enquire opens it (a data-topic
 * attribute picks the topic), so every page can ask without carrying its own form.
 * Step one: what about. Step two: who, and what. Then a quiet thank-you.
 */
export function EnquiryPanel() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [values, setValues] = useState<Values>(EMPTY);
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<State>('idle');
  const startedAt = useRef(0);
  const honeypot = useRef<HTMLInputElement>(null);
  const uid = useId();

  const closing = useRef(0);
  // `from`: the middle of the control that asked, so the panel grows out of it
  const open = useCallback((topic?: TopicId, from?: { x: number; y: number }) => {
    const d = dialog.current;
    if (!d) return;
    window.clearTimeout(closing.current); // a close in progress turns round
    if (state === 'sent') { setValues(EMPTY); setState('idle'); setStep(1); }
    if (topic) { setValues((v) => ({ ...v, topic })); setStep(2); } else if (state !== 'sent') setStep((s) => s);
    startedAt.current = Date.now();
    if (!d.open) {
      d.showModal(); document.documentElement.classList.add('is-locked');
      // the panel sits against the right edge, from the top
      d.style.transformOrigin = from ? `${from.x - (window.innerWidth - d.offsetWidth)}px ${from.y}px` : '';
      void d.offsetWidth; // the closed state must be painted once for the transition to run
    }
    d.classList.add('is-in');
  }, [state]);

  const close = useCallback(() => {
    const d = dialog.current;
    if (!d?.open) return;
    d.classList.remove('is-in');
    window.clearTimeout(closing.current);
    closing.current = window.setTimeout(() => { if (!d.classList.contains('is-in')) d.close(); }, 340);
  }, []);

  // every link to #enquire, on any page, opens the panel instead of jumping
  useEffect(() => {
    const onEvent = (e: Event) => open((e as CustomEvent<TopicId | undefined>).detail);
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.('a[href$="#enquire"]') as HTMLAnchorElement | null;
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      const r = a.getBoundingClientRect();
      open((a.dataset.topic as TopicId) || undefined, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
    };
    window.addEventListener(ENQUIRE_EVENT, onEvent);
    document.addEventListener('click', onClick);
    if (window.location.hash === '#enquire') open();
    return () => { window.removeEventListener(ENQUIRE_EVENT, onEvent); document.removeEventListener('click', onClick); };
  }, [open]);

  useEffect(() => {
    const d = dialog.current!;
    const onClose = () => document.documentElement.classList.remove('is-locked');
    const onBackdrop = (e: MouseEvent) => { if (e.target === d) close(); };
    const onCancel = (e: Event) => { e.preventDefault(); close(); };
    d.addEventListener('close', onClose);
    d.addEventListener('click', onBackdrop);
    d.addEventListener('cancel', onCancel);
    return () => { d.removeEventListener('close', onClose); d.removeEventListener('click', onBackdrop); d.removeEventListener('cancel', onCancel); };
  }, [close]);

  const set = (k: keyof Values) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k as keyof Enquiry]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const pick = (topic: TopicId) => {
    setValues((v) => ({ ...v, topic }));
    setErrors({});
    setStep(2);
    requestAnimationFrame(() => dialog.current?.querySelector<HTMLInputElement>('#' + CSS.escape(`${uid}-name`))?.focus());
  };

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    const found = validate(values as Partial<Enquiry>);
    setErrors(found);
    const first = (['topic', 'name', 'company', 'email', 'message'] as const).find((k) => found[k]);
    if (first === 'topic') { setStep(1); return; }
    if (first) { dialog.current?.querySelector<HTMLElement>('#' + CSS.escape(`${uid}-${first}`))?.focus(); return; }
    setState('sending');
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, website: honeypot.current?.value ?? '', startedAt: startedAt.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) { setState('sent'); trackLead(topicById(values.topic)?.label ?? values.topic); return; }
      if (res.status === 422 && data.fields) { setErrors(data.fields); setState('idle'); return; }
      setState('failed');
    } catch { setState('failed'); }
  }

  const topic = values.topic ? topicById(values.topic) : undefined;
  const first = values.name.trim().split(/\s+/)[0];
  const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent(`Partner enquiry: ${topic?.label ?? 'AVVVS'}`)}&body=${encodeURIComponent(
    `${values.message}\n\n${values.name}\n${values.company}\n${values.phone}\n${values.country}`.trim())}`;

  const field = (k: 'name' | 'company' | 'email' | 'phone' | 'country', label: string, opts: { type?: string; auto?: string; optional?: boolean; wide?: boolean } = {}) => (
    <div className={`ef-field${opts.wide ? ' ef-wide' : ''}${errors[k] ? ' has-error' : ''}`}>
      <input id={`${uid}-${k}`} name={k} type={opts.type ?? 'text'} autoComplete={opts.auto} placeholder=" "
        value={values[k]} onChange={set(k)} aria-invalid={errors[k] ? true : undefined}
        aria-describedby={errors[k] ? `${uid}-${k}-err` : undefined} required={!opts.optional} />
      <label htmlFor={`${uid}-${k}`}>{label}{opts.optional && <span className="ef-opt"> (optional)</span>}</label>
      {errors[k] && <p className="ef-error" id={`${uid}-${k}-err`}>{errors[k]}</p>}
    </div>
  );

  return (
    <dialog ref={dialog} className="ef" aria-labelledby={`${uid}-title`}>
      <div className="ef-panel">
        <header className="ef-head">
          <p className="ef-kicker">Partner enquiry</p>
          <button type="button" className="ef-close" onClick={close} aria-label="Close the enquiry form">
            <span aria-hidden="true" /><span aria-hidden="true" />
          </button>
        </header>

        {state === 'sent' ? (
          <div className="ef-done" role="status">
            <svg className="ef-done-mark" viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="30" /><path d="M20 33 L29 42 L45 24" />
            </svg>
            <h2 id={`${uid}-title`}>Thank you{first ? `, ${first}` : ''}</h2>
            <p>Your enquiry about {topic?.label.toLowerCase()} has reached the AVVVS team. The right person will reply to you at <b>{values.email}</b>.</p>
            <p className="ef-muted">If it is urgent, call us on <a href={`tel:${CONTACT.phones[0].replace(/\s/g, '')}`}>{CONTACT.phones[0]}</a>.</p>
            <button type="button" className="ef-btn ef-btn-quiet" onClick={close}>Back to the site</button>
          </div>
        ) : (
          <form className="ef-form" noValidate onSubmit={submit}>
            <div className="ef-progress" aria-hidden="true"><span style={{ transform: `scaleX(${step === 1 ? 0.5 : 1})` }} /></div>
            <p className="ef-step">Step {step} of 2</p>

            {step === 1 ? (
              <fieldset className="ef-topics">
                <legend><h2 id={`${uid}-title`}>What would you like to talk about?</h2></legend>
                {TOPICS.map((t) => (
                  <label key={t.id} className={`ef-topic${values.topic === t.id ? ' is-on' : ''}`}>
                    <input type="radio" name="topic" value={t.id} checked={values.topic === t.id} onChange={() => pick(t.id)} />
                    <span className="ef-topic-title">{t.label}</span>
                    <span className="ef-topic-note">{t.note}</span>
                    <span className="ef-topic-arrow" aria-hidden="true">→</span>
                  </label>
                ))}
                {errors.topic && <p className="ef-error">{errors.topic}</p>}
              </fieldset>
            ) : (
              <>
                <div className="ef-chosen">
                  <h2 id={`${uid}-title`}>Tell us about you</h2>
                  <p>About <b>{topic?.label}</b>. <button type="button" className="ef-link" onClick={() => setStep(1)}>Change</button></p>
                </div>
                <div className="ef-grid">
                  {field('name', 'Your name', { auto: 'name' })}
                  {field('company', 'Company or organisation', { auto: 'organization' })}
                  {field('email', 'Work email', { type: 'email', auto: 'email' })}
                  {field('phone', 'Phone', { type: 'tel', auto: 'tel', optional: true })}
                  {field('country', 'Country', { auto: 'country-name', optional: true, wide: true })}
                  <div className={`ef-field ef-wide ef-area${errors.message ? ' has-error' : ''}`}>
                    <textarea id={`${uid}-message`} name="message" rows={5} placeholder=" " value={values.message} onChange={set('message')}
                      aria-invalid={errors.message ? true : undefined} aria-describedby={errors.message ? `${uid}-message-err` : `${uid}-message-hint`} required />
                    <label htmlFor={`${uid}-message`}>What do you have in mind?</label>
                    {errors.message ? <p className="ef-error" id={`${uid}-message-err`}>{errors.message}</p>
                      : <p className="ef-hint" id={`${uid}-message-hint`}>{topic?.placeholder}</p>}
                  </div>
                  {/* a field people never see: bots fill it in */}
                  <div className="ef-hp" aria-hidden="true">
                    <label htmlFor={`${uid}-website`}>Website</label>
                    <input id={`${uid}-website`} name="website" tabIndex={-1} autoComplete="off" ref={honeypot} />
                  </div>
                </div>

                {state === 'failed' && (
                  <div className="ef-failed" role="alert">
                    <p>We couldn&apos;t send that just now. Your words are still here: try again, or <a href={mailto}>send it by email</a> to {CONTACT.email}.</p>
                  </div>
                )}

                <div className="ef-foot">
                  <button type="submit" className="ef-btn" disabled={state === 'sending'}>
                    {state === 'sending' ? <><span className="ef-spin" aria-hidden="true" /> Sending</> : 'Send enquiry'}
                  </button>
                  <p className="ef-privacy">We use these details only to reply to you. <a href="/privacy">Privacy Policy</a></p>
                </div>
              </>
            )}
          </form>
        )}

        <footer className="ef-direct">
          <span>Or write to us directly</span>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          <a href={`tel:${CONTACT.phones[0].replace(/\s/g, '')}`}>{CONTACT.phones[0]}</a>
        </footer>
      </div>
    </dialog>
  );
}

/** The close of a page: an invitation to talk, with the direct lines beside it. The form itself is the panel. */
export function EnquiryInvite({ title, intro, topic, cta = 'Start a conversation' }: { title: string; intro: string; topic?: TopicId; cta?: string }) {
  return (
    <section className="invite" id="enquire" aria-labelledby="invite-title">
      <span className="invite-thread" aria-hidden="true" />
      <div className="invite-main">
        <h2 id="invite-title">{title}</h2>
        <p>{intro}</p>
        <a className="ef-btn invite-btn" href="#enquire" data-topic={topic}>{cta} <span aria-hidden="true">→</span></a>
      </div>
      <ol className="invite-steps">
        <li><b>01</b><span>Tell us what you have in mind, in a few lines.</span></li>
        <li><b>02</b><span>We pass it to the right team: manufacturing, the clinics or Gloveda.</span></li>
        <li><b>03</b><span>They reply to you directly.</span></li>
      </ol>
      <div className="invite-direct">
        <p className="invite-h">Or reach us directly</p>
        <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        {CONTACT.phones.map((p) => <a key={p} href={`tel:${p.replace(/\s/g, '')}`}>{p}</a>)}
      </div>
    </section>
  );
}
