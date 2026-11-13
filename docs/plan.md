# Synnex Technology Website Plan

## Scope
Build a polished one-page responsive website for Synnex Technology, an electrical engineering business in Colombo, Sri Lanka. The confirmed stack is React/Vite for the frontend, Laravel/PHP for the backend API, and PostgreSQL for durable contact submissions. Exact credentials are intentionally omitted until supplied. Project imagery is represented by clearly labeled placeholders.

## Implementation approach
- React/Vite single-page frontend with semantic sections, responsive layout, accessible controls, smooth scrolling, animated counters, project category filtering, testimonial carousel, FAQ accordion, and client-side contact validation.
- Laravel API scaffold under `backend/` with a validated `POST /api/contact-submissions` endpoint, Eloquent model, PostgreSQL migration, and CORS-ready response contract. The frontend remains demo-only and does not submit externally until a backend base URL is configured.
- PostgreSQL is configured through environment variables; no credentials are committed.
- SEO metadata, Open Graph tags, JSON-LD LocalBusiness schema, and `/manus-routes.json` are included.

## Project structure
- `src/`: React app, styles, icons, content data, and UI behavior.
- `public/`: route manifest and static assets.
- `backend/`: Laravel-compatible API structure and database migration.
- `README.md`: local setup and replacement instructions.
- `plan.md` / `TODO.md`: approved plan and implementation outcomes.

## Design direction
Three possible directions were considered: Precision Grid (0.06), Field Notes Engineering (0.04), and Night Voltage (0.08). The selected direction is **Night Voltage**.

- **Design movement:** contemporary engineering editorial with a dark technical shell, sharp yellow signal accents, and calm white content surfaces.
- **Core principles:** safety before spectacle; high information clarity; confident, human service; visible proof through metrics and process.
- **Color philosophy:** deep navy creates trust and technical depth, electric yellow marks actions and energy, and soft grey surfaces keep the page approachable.
- **Layout paradigm:** alternating full-bleed bands with offset proof panels and a diagonal circuit-line motif instead of a uniform centered grid.
- **Signature elements:** yellow signal bars, thin circuit traces, and compact uppercase utility labels.
- **Interaction philosophy:** interactions should feel like reliable controls—clear hover states, purposeful motion, and no decorative motion that competes with content.
- **Animation:** short fade/slide reveals, count-up stats on entry, and restrained carousel motion; respect reduced-motion preferences.
- **Typography:** Poppins for high-confidence headings and Inter for readable body copy; uppercase utility labels use letter spacing rather than a third font.
- **Brand essence:** practical electrical expertise for Sri Lankan homes and businesses, delivered with safety-first discipline. Personality: dependable, precise, grounded.
- **Brand voice:** direct and reassuring. Example lines: “Power that works as hard as you do.” and “Plan it properly. Install it safely. Keep it running.”
- **Wordmark concept:** a compact lightning mark nested inside a rounded circuit node beside the Synnex Technology wordmark.
- **Signature brand color:** electric yellow `#FFC21A`.
