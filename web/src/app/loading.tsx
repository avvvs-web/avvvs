// Shown while a page is on its way (between routes). The shapes follow the pages' own openings:
// a header, a large title, a lede, a button and a big picture, all on the ivory ground.
export default function Loading() {
  return (
    <div className="skel" role="status" aria-live="polite" aria-label="Loading the page">
      <div className="skel-bar">
        <span className="sk sk-logo" />
        <span className="skel-nav"><span className="sk sk-link" /><span className="sk sk-link" /><span className="sk sk-link" /></span>
      </div>
      <div className="skel-hero">
        <div className="skel-copy">
          <span className="sk sk-kicker" />
          <span className="sk sk-title" />
          <span className="sk sk-title sk-short" />
          <span className="sk sk-line" />
          <span className="sk sk-line" />
          <span className="sk sk-line sk-short" />
          <span className="sk sk-btn" />
        </div>
        <span className="sk sk-media" />
      </div>
      <span className="skel-thread" aria-hidden="true"><span /></span>
    </div>
  );
}
