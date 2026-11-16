/* ==========================================================================
   MainWork — lightning protection, Synnex's main service, shown on the home
   page before the services list. English text, translated by lib/i18n.js.
   Photo: free Unsplash photo by Erik Gazi (Unsplash License).
   ========================================================================== */
import { Link } from '../lib/router.jsx';

const PHOTO = 'https://images.unsplash.com/photo-1623392962768-a759c255f59a?auto=format&fit=crop&q=72';

export default function MainWork() {
  return (
    <section className="mw" id="lightning-protection" aria-labelledby="mw-title">
      <div className="mw-w">
        <div className="mw-copy">
          <span className="mw-label">Our main work</span>
          <h2 id="mw-title">Lightning protection that takes every strike safely to ground.</h2>
          <p className="mw-lead">
            We design, install and test lightning arrester systems for homes, factories, hotels and towers across Sri Lanka, to SLS 1472 and IEC 62305.
          </p>
          <p className="mw-more">
            Every system includes the arrester on the roof, a protected down conductor, a tested earth pit and surge protection at your board, so the building and everything plugged into it stay safe.
          </p>
          <div className="mw-cta">
            <a className="mw-btn mw-btn-primary" href="#contact">Book a lightning risk check</a>
            <Link className="mw-btn mw-btn-ghost" to="/solutions/lightning-protection">How it works</Link>
          </div>
        </div>

        <figure className="mw-media">
          <img
            src={`${PHOTO}&w=1000&h=1250`}
            srcSet={`${PHOTO}&w=700&h=875 700w, ${PHOTO}&w=1000&h=1250 1000w, ${PHOTO}&w=1400&h=1750 1400w`}
            sizes="(max-width: 860px) 100vw, 560px"
            alt="Lightning striking near a building at night"
            loading="lazy"
            decoding="async"
          />
          <figcaption className="mw-tags">
            <span>Conventional rods</span>
            <span>ESE arresters</span>
            <span>Earth testing</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
