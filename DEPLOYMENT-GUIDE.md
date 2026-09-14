# PMV Properties — Going Live: Full Deployment Guide

## ⚠️ Read this first — the #1 mistake to avoid

**Do not copy your local `node_modules` folder to the server.** It was installed
on your Windows PC, and several packages inside it (`sharp`, and the frontend's
build tools) contain **compiled binaries specific to Windows** — they will not
run on a Linux server at all. This is the single most common reason a project
that "works perfectly on localhost" fails completely the moment it's moved online.

Instead: copy everything **except** `node_modules`, then run `npm install` fresh
on the server (or let your hosting platform run it automatically during deploy,
which Vercel/Render/Railway all do by default when deploying from Git — this is
the easiest path and the one this guide recommends).

## Other things fixed in this round so it works identically on both

- **Client-side routing 404s in production**: this app uses React Router's
  `BrowserRouter`, which needs the server to send every URL to `index.html` (the
  browser then figures out the route). Vite's local dev server does this
  automatically, which is why it worked on localhost — but a plain static host
  won't do this by default, so opening a link like `yourdomain.com/details/abc123`
  directly, or refreshing that page, would 404 in production. Fixed by adding
  `frontend/vercel.json` (for Vercel) and `frontend/public/_redirects` (for
  Netlify) — both tell the host "for any unknown path, serve `index.html`
  anyway." If you deploy to a custom Nginx server instead, see the
  `try_files $uri /index.html;` line in the Nginx config later in this guide —
  it does the same job.
- **`backend/package.json` had a broken dev script**: `npm run dev` calls
  `nodemon`, but `nodemon` wasn't listed as a dependency — it only worked before
  because it happened to be installed globally on that PC already. Fixed by
  adding it as a proper `devDependency`, so `npm install` alone makes `npm run
  dev` work on any machine.
- Removed two unused frontend-only packages (`react-icons`, `browser-image-
  compression`) that had been mistakenly added to the **backend's**
  `package.json` — harmless, but unnecessary install weight.

## ⚠️ Image uploads now use Cloudinary — nothing to worry about

Earlier versions of this project saved uploaded house/property photos to a
local `backend/uploads` folder. That breaks on hosts like **Render**, whose
disk is *temporary* — every restart/redeploy would wipe it and every listing
photo would 404.

This is now fixed: uploaded images are compressed to modern `.webp` format
and uploaded straight to **Cloudinary** (a free image-hosting service made
exactly for this), and the permanent HTTPS link is what gets saved on the
listing. This means:
- Images survive restarts, redeploys, and free-tier sleep/wake cycles.
- Images load fast worldwide (Cloudinary is a CDN).
- You don't need a paid Render plan or persistent disk add-on just for images.

You just need to create a free Cloudinary account and paste 3 values into
your environment variables — that's Part 2.5 below.

---

Your project has two separate pieces that both need to be hosted:

| Piece | What it is | Where it lives in this zip |
|---|---|---|
| **Frontend** | The React website people see (houses, tabs, details page) | `frontend/` |
| **Backend** | The API + database logic (login, add/edit/delete listings) | `backend/` |
| **Database** | MongoDB, stores all houses/properties | not included — you connect to a hosted Mongo database |

They are deployed **separately**, then wired together with one setting (the API URL).

This guide gives you two paths:

- **Path A — Easiest & cheapest (recommended)**: free/near-free managed hosting (Vercel + Render + MongoDB Atlas). No server administration. Good for a business site like this.
- **Path B — Traditional hosting**: a VPS or Node-enabled hosting plan with cPanel, if you specifically want "one hosting account for everything."

---

## Part 1 — Buying a Domain Name

1. Pick a registrar. Popular, reliable options (India-friendly, all accept UPI/cards):
   - **Namecheap** — namecheap.com (usually cheapest, easy to use)
   - **Hostinger** — hostinger.in
   - **GoDaddy** — godaddy.com/en-in
   - **BigRock** — bigrock.in
2. Search your desired name, e.g. `pmvproperties.com` or `pmvproperties.in`.
3. Add to cart, **decline unnecessary upsells** (SSL, hosting, email — you don't need these from the registrar; skip them).
4. Complete payment and checkout. You now own the domain — that's it for this step. (Domains typically cost ₹700–1500/yr for `.com`/`.in`.)

You don't need "hosting" from the domain seller — you'll point the domain at Vercel/Render (or your VPS) instead, in Part 4.

---

## Part 2 — Database: MongoDB Atlas (Free)

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Create a **free M0 cluster** (choose a region close to India, e.g. Mumbai).
3. Under **Database Access**, create a database user with a username + strong password (write these down).
4. Under **Network Access**, click **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`). (Fine for a small business app; Render/Vercel use dynamic IPs.)
5. Click **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pmvhouse
   ```
6. Replace `<username>`/`<password>` with your real values. Keep this string — you'll paste it into the backend's environment variables in Part 3.

---

## Part 2.5 — Images: Cloudinary (Free)

1. Go to https://cloudinary.com/users/register/free and create a free account
   (25GB storage + bandwidth free, no credit card required).
2. After signing up, you land on your **Dashboard** — it shows three values at
   the top:
   - **Cloud Name**
   - **API Key**
   - **API Secret** (click "reveal" to see it)
3. Copy all three. You'll paste them into Render's environment variables in
   Part 3 below.

That's the entire setup — no code changes needed on your end, this project
already talks to Cloudinary once these 3 values are in place.

---

## Part 3 — Backend: Deploy to Render (Free tier available)

1. Push this project to a GitHub repository (Render deploys from Git). If you don't use Git yet:
   - Install Git, then in the `backend/` folder run:
     ```
     git init
     git add .
     git commit -m "initial commit"
     ```
   - Create a new repo on GitHub and push it (GitHub shows you the exact commands after you create the repo).
2. Go to https://render.com → sign up (can use GitHub login) → **New +** → **Web Service**.
3. Connect your GitHub repo, select the `backend` folder as the root directory.
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Under **Environment**, add these variables (values from `backend/.env.example`):
   | Key | Value |
   |---|---|
   | `MONGO_URI` | your MongoDB Atlas connection string from Part 2 |
   | `ADMIN_USER` | your chosen admin username |
   | `ADMIN_PASS` | a **strong new password** (not the sample one) |
   | `SECRET` | a long random string — generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
   | `CLOUDINARY_CLOUD_NAME` | from Part 2.5 |
   | `CLOUDINARY_API_KEY` | from Part 2.5 |
   | `CLOUDINARY_API_SECRET` | from Part 2.5 |
   | `FRONTEND_URL` | your Vercel URL, e.g. `https://pmvhouse.vercel.app` (you can add this *after* Part 4 once you know the URL — leave blank for now, it defaults to allowing all origins) |
6. Click **Create Web Service**. Render builds and deploys it, then gives you a live URL like:
   ```
   https://pmvhouse-backend.onrender.com
   ```
   Test it by opening that URL — you should see `✅ API Running...`.

> Note: Render's free tier "sleeps" after inactivity and takes ~30s to wake on the next request. Fine for a low-traffic local business site; upgrade to a paid instance (~$7/mo) later if that delay becomes annoying.

**Alternative to Render:** Railway.app works almost identically and is also beginner-friendly.

---

## Part 4 — Frontend: Deploy to Vercel (Free)

1. In `frontend/.env`, you don't need to change anything locally — instead, you'll set the variable **on Vercel**.
2. Go to https://vercel.com → sign up with GitHub.
3. **Add New Project** → import the same GitHub repo → set **Root Directory** to `frontend`.
4. Vercel auto-detects Vite. Confirm:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | the Render backend URL from Part 3, e.g. `https://pmvhouse-backend.onrender.com` |
6. Click **Deploy**. In ~1 minute you'll get a live URL like:
   ```
   https://pmvhouse.vercel.app
   ```
7. Open it and confirm listings load (the skeleton loaders should resolve into real cards, or the new "No houses available" empty state if the database is still empty).

**Alternative to Vercel:** Netlify works the same way (Build command `npm run build`, publish directory `dist`).

---

## Part 4.5 — Lock the backend down to your real frontend URL

Now that you have your live Vercel URL from Part 4:

1. Go back to your **Render** service → **Environment**.
2. Set `FRONTEND_URL` to your Vercel URL, e.g. `https://pmvhouse.vercel.app`
   (add `https://pmvproperties.com` too, comma-separated, once you've connected
   your custom domain in Part 5).
3. Save — Render redeploys automatically. Your API now only accepts requests
   from your real site instead of any website, which is safer.

---

## Part 5 — Connect Your Own Domain

**On Vercel (frontend):**
1. Project → **Settings** → **Domains** → add `pmvproperties.com` (and `www.pmvproperties.com`).
2. Vercel shows you DNS records to add (usually an `A` record and a `CNAME`).

**At your domain registrar (Namecheap/Hostinger/etc):**
3. Go to your domain's **DNS settings**.
4. Add the exact records Vercel showed you.
5. Wait 10 minutes–24 hours for DNS to propagate. Vercel will show "Valid Configuration" once it's live, and automatically issues a free HTTPS certificate.

**Backend domain (optional):** You can leave the backend on its Render URL (`https://pmvhouse-backend.onrender.com`) — it doesn't need a pretty domain since users never see it directly. If you want `api.pmvproperties.com`, Render's dashboard has the same "Custom Domain" option — add a CNAME at your registrar pointing to Render.

---

## Part 6 — Before You Go Live: Security Checklist

- [ ] Changed `ADMIN_PASS` from the sample `1993@123` to a strong unique password
- [ ] Changed `SECRET` from `mysecretkey` to a long random string
- [ ] `.env` files are **not** committed to Git (already covered by `.gitignore`)
- [ ] Cloudinary credentials added to Render's environment variables (Part 2.5 + Part 3)
- [ ] `FRONTEND_URL` set on Render to your real Vercel/custom domain (Part 4.5)
- [ ] Tested login at `https://yourdomain.com/login` with the new admin password
- [ ] Tested adding a house/property with an image upload end-to-end
- [ ] Confirmed images display correctly (no broken image icons) and open the Cloudinary URL directly to verify

---

## Part 7 (Alternative) — Traditional VPS / cPanel Hosting

If you'd rather have one traditional hosting account instead of Vercel+Render:

1. Buy a **VPS** (e.g. Hostinger VPS, DigitalOcean, Linode) — must support Node.js (shared "cPanel-only" hosting often does NOT run Node/MongoDB well; a VPS is safer).
2. SSH into the server, install Node.js (v18+), and MongoDB (or just use MongoDB Atlas from Part 2 instead of self-hosting the database — simpler and safer).
3. Upload the project (via `git clone` or `scp`), then in `backend/`:
   ```
   npm install
   npm install -g pm2
   pm2 start server.js --name pmv-properties-backend
   pm2 save && pm2 startup
   ```
   This keeps the backend running permanently and restarts it if the server reboots.
4. Build the frontend locally or on the server:
   ```
   cd frontend
   npm install
   npm run build
   ```
   This produces a `dist/` folder — a plain static website.
5. Install **Nginx** and serve `dist/` as the website, while forwarding `/api` requests to the Node backend running on its own port. A minimal Nginx config:
   ```nginx
   server {
       listen 80;
       server_name pmvproperties.com www.pmvproperties.com;

       root /var/www/pmvproperties/frontend/dist;
       index index.html;
       location / { try_files $uri /index.html; }

       location /api/ {
           proxy_pass http://localhost:5000;
       }
   }
   ```
6. Point your domain's DNS `A` record at the VPS's IP address.
7. Install a free HTTPS certificate with **Certbot** (`sudo certbot --nginx`).

This path gives you full control but requires basic Linux command-line comfort. Path A (Vercel + Render) is strongly recommended if you're not already comfortable with servers.

---

## Quick Reference — What Goes Where

```
Domain registrar  → only sells the domain name, point its DNS elsewhere
Vercel/Netlify    → hosts frontend/  (the website itself)
Render/Railway    → hosts backend/   (the API server)
MongoDB Atlas     → hosts the database
Cloudinary        → hosts uploaded house/property photos
```

Once all pieces are deployed and `VITE_API_URL` (frontend) + `MONGO_URI` /
`CLOUDINARY_*` (backend) point to your live services, your site is fully
online — the exact same code that runs on localhost now runs for the public,
with no further code changes needed.
