/* eslint-disable @next/next/no-img-element */
// AVVVS's own marks, cut from the brand sheet the client supplied (public/brand/avvvs-brand-sheet.svg).
// Shown in their true colours; never recoloured or redrawn.

const MARK = { src: '/brand/avvvs-mark.svg', w: 287.07, h: 138.23 };
const LOCKUP = { src: '/brand/avvvs-since-1921.svg', w: 572.99, h: 126.77 };

export function AvvvsMark({ height, className, alt = 'AVVVS' }: { height: number; className?: string; alt?: string }) {
  return <img src={MARK.src} alt={alt} height={height} width={Math.round((height * MARK.w) / MARK.h)} className={className} />;
}

export function AvvvsLockup({ height, className, alt = 'AVVVS, since 1921. Arya Vaidya Vilasini Vaidyasala' }: { height: number; className?: string; alt?: string }) {
  return (
    <img src={LOCKUP.src} alt={alt} height={height}
      width={Math.round((height * LOCKUP.w) / LOCKUP.h)} className={className} />
  );
}
