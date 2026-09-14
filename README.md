# PMV Properties — House Rent / Property Listing App

React (Vite) frontend + Node/Express/MongoDB backend for a local property listings
business (rent, lease, plots, showrooms) with an admin panel to manage listings.

## Structure
```
pmvhouse-project/
├── frontend/     React app (what visitors see)
├── backend/      Express API + MongoDB models
├── DEPLOYMENT-GUIDE.md   ← full step-by-step hosting/domain guide
```

## Running locally

**Backend**
```
cd backend
npm install
cp .env.example .env      # then edit .env with your real values (incl. Cloudinary — see below)
npm run dev                # nodemon, auto-restarts on changes
```

> Image uploads require a free Cloudinary account (see `DEPLOYMENT-GUIDE.md`
> Part 2.5). Sign up, copy your Cloud Name / API Key / API Secret into
> `backend/.env`, and image upload works locally exactly the same way it will
> in production — no local `uploads` folder is used anymore.

**Frontend** (separate terminal)
```
cd frontend
npm install
cp .env.example .env       # set VITE_API_URL=http://localhost:5000
npm run dev
```

> ⚠️ `node_modules` is **not included** in this zip (it's huge and platform-specific —
> the folder you had before only worked on Windows). Run `npm install` in both
> `frontend/` and `backend/` first; it will fetch the correct packages for whatever
> computer/server you're on.

## What changed in this update

### Round 4 — Cloudinary image storage + final production audit
- **Fixed the last real production blocker**: uploaded house/property photos were
  saved to a local `backend/uploads/` folder. On Render (and most modern
  hosting platforms), the disk is **temporary** — every restart or redeploy
  wiped it, breaking every listing photo that had ever been uploaded. Switched
  image storage to **Cloudinary**: photos are now resized + compressed to
  modern `.webp` format with `sharp`, then uploaded straight to Cloudinary and
  the permanent HTTPS URL is saved on the listing. Nothing is written to local
  disk anymore, so this now works identically and permanently on any host.
- Delete routes now also remove the corresponding image from Cloudinary, so
  storage doesn't accumulate orphaned files.
- Removed the local `/uploads` static file route (no longer needed).
- Cleaned up `frontend/.env`/`.env.example`, which had unrelated backend
  variables mixed in by mistake and a duplicated `VITE_API_URL` line.
- Fixed two admin-panel image URLs (`AdminList.jsx`, `EditProperty.jsx`) that
  were missing the same `http` URL check already used everywhere else — needed
  so both legacy filenames and new Cloudinary URLs render correctly.
- Made the CORS allowed origin configurable via a `FRONTEND_URL` environment
  variable (defaults to allow all, so nothing breaks before you set it).
- Removed deprecated Mongoose connection options (no-ops on Mongoose 8, kept
  around from an older tutorial).
- Regenerated `backend/package-lock.json` to match the new dependency
  (`cloudinary`) — run `npm install` once after pulling this update.

### Round 3 — Production-readiness audit ("will this actually work when I paste it on a live server?")
- **Fixed the #1 production-breaking bug**: React Router's client-side routing
  (`BrowserRouter`) needs the host to redirect all unknown paths to
  `index.html`. This works automatically on `localhost` (Vite's dev server
  handles it) but causes real 404s in production without it. Added
  `frontend/vercel.json` and `frontend/public/_redirects` so this works on
  Vercel and Netlify out of the box; Nginx instructions included below for a
  custom VPS.
- **Fixed a broken `npm run dev`**: `backend/package.json` called `nodemon`
  without listing it as a dependency — it only worked before because nodemon
  happened to already be installed globally on that PC. A fresh `npm install`
  elsewhere would fail. Added it as a proper `devDependency`.
- Removed two frontend-only packages that were mistakenly listed in the
  **backend's** `package.json` (`react-icons`, `browser-image-compression`) —
  confirmed unused anywhere in the backend code.
- Removed a duplicate/stray route definition in `App.jsx` left over from an
  earlier edit.
- **Documented (not yet fixed)**: uploaded images are stored on local disk,
  which is wiped on every restart on ephemeral hosts like Render's free tier.
  See the warning in `DEPLOYMENT-GUIDE.md` for the two ways to handle this.
- Confirmed clean: every image URL, API call, and asset path in the frontend
  correctly derives from the `VITE_API_URL` environment variable — no
  hardcoded `localhost`/IP addresses remain anywhere in the codebase.

### Round 2 — Full native-app pass
- **Converted the top tab bar into a real bottom navigation bar** (Rent/Lease/Plot/
  Showroom) — the single biggest thing that makes an app *feel* native instead of
  like a mobile website. Fixed at the bottom, safe-area aware, active-tab highlight.
- **Finished the colored app-bar header**: logo in a white chip, white/orange
  brand text, a functional call icon button, fully edge-to-edge.
- **Fixed a real functional gap**: the Plot/Lease/Showroom details page had
  **no Call/WhatsApp button at all** — even though the owner's phone number is
  saved in the database. Added a sticky bottom contact bar (matching the rent
  details page) so every listing type can actually be contacted.
- **Fixed a real bug**: rent-details titles were being cut off
  ("2 BHK in PMV, Ponnamarava...") — caused by a global CSS class collision
  between `home.css` and `details.css` (`.title-row h3` was defined in both,
  and which one "won" depended on file load order). Scoped the fix so this
  can't silently regress again.
- **Floated the back button over the hero image** on detail pages, like
  Airbnb/Zomato/Swiggy do, instead of it sitting in its own row above the image.
- Repositioned the "House Owner?" floating bar so it stacks correctly above
  the new bottom nav instead of overlapping it.
- Removed more confirmed-dead files: `Header.jsx/css`, `HouseCard.jsx`,
  `HouseList.jsx/css`, `BottomBar.css`, `ProtectedRoute.jsx`, `RealEstate.jsx`
  and its CSS — none were imported/used anywhere.

### Round 1 — Core fixes + mobile/PWA setup

- **Fixed a critical bug**: the API URL was hardcoded to a local Wi-Fi IP
  (`http://192.168.1.6:5000`). This would have completely broken the site once
  moved online. It now reads from `VITE_API_URL` in `.env`, so the same code
  works on localhost, your LAN, and your live production server — just by
  changing one setting.
- Fixed a missing `noimage.jpg` fallback file that was referenced everywhere
  but never existed (caused broken image icons whenever a listing had no photo).
- Added `manifest.json` + app icons + mobile meta tags, so the site can be
  "Added to Home Screen" on a phone and opens full-screen like a real app.
- Added a responsive grid layout for tablets/desktops (previously the mobile
  cards stretched edge-to-edge on larger screens with no breakpoints).
- Added hover states for mouse/trackpad users (desktop only — untouched on touch devices).
- Added subtle entrance animations for cards and page transitions.
- Added a proper "no listings" empty state (previously just went blank).
- Removed ~200KB of unused Bootstrap CSS and an unused `react-swipeable`
  dependency that were slowing down load times for zero benefit.
- Removed dead/duplicate files (`api.js`, `App.css`, a stray `Home - Copy.jsx`).
- Added `build`/`preview` scripts to `frontend/package.json` — needed to produce
  a production bundle (this was missing entirely before).
- Added `.env.example` files for both frontend and backend documenting every
  required setting.
- See `DEPLOYMENT-GUIDE.md` for the full walkthrough of buying a domain and
  putting this online.

## Security — do this before going live
Your backend's default admin password and JWT secret are weak placeholders.
Change `ADMIN_PASS` and `SECRET` in your production environment variables
before launching (see `backend/.env.example` and the deployment guide).
