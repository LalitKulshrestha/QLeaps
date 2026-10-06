# Quantum Leaps — Lead Capture Site

Specialist hiring partner landing page for **qleaps.in**, built with vanilla HTML/CSS/JS and deployed on Netlify with a serverless lead capture backend.

---

## 🚀 Hosting Choice: Netlify

**Why Netlify:**
- Free tier includes serverless functions (Node 18)
- Built-in HTTPS and CDN
- CLI deploy in one command
- Environment variables managed via dashboard or CLI
- Easy custom domain + DNS management
- Automatic deploys on Git push

---

## 📁 Project Structure

```
├── index.html              Main landing page
├── privacy.html            Privacy policy
├── styles.css              All styles (vanilla CSS)
├── main.js                 Client-side JS (form, nav, validation)
├── netlify.toml            Netlify config (redirects, headers, functions)
├── netlify/
│   └── functions/
│       └── lead.js         Serverless function: POST /api/lead
└── README.md               This file
```

---

## 🔑 Environment Variables

Set these in the **Netlify dashboard** → Site settings → Environment variables, or via CLI:

| Variable | Description | Example |
|---|---|---|
| `RESEND_API_KEY` | Your Resend API key | `re_xxxxxxxxx` |
| `RESEND_FROM` | Verified sender email on Resend | `leads@qleaps.in` |
| `OWNER_EMAIL` | Where lead notifications go | `contact@qleaps.in` |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key | `0x4AAA...` |
| `SITE_URL` | Your deployed URL | `https://qleaps.in` |

**Never commit actual values to Git.**

---

## 🛠 First-time Setup

### 1. Prerequisites
```bash
# Install Netlify CLI globally
npm install -g netlify-cli
```

### 2. Set up accounts (free)
1. **Resend** — https://resend.com → get API key, verify sender domain
2. **Cloudflare Turnstile** — https://dash.cloudflare.com → Security → Turnstile → Create widget → get sitekey + secret
3. **Netlify** — https://netlify.com → sign up

### 3. Update the Turnstile sitekey in index.html
Find this line in `index.html` and replace the placeholder with your real sitekey:
```html
data-sitekey="0x4AAAAAABkMzB1g_placeholder__"
```

### 4. Initialise Git and deploy
```bash
cd /Users/lalit/Downloads/minor

# Initialise Git repo
git init
git add .
git commit -m "Initial commit: Quantum Leaps lead capture site"

# Login to Netlify
netlify login

# Link to new Netlify site
netlify sites:create --name quantum-leaps-qleaps

# Set environment variables
netlify env:set RESEND_API_KEY "re_your_actual_key_here"
netlify env:set RESEND_FROM "leads@qleaps.in"
netlify env:set OWNER_EMAIL "contact@qleaps.in"
netlify env:set TURNSTILE_SECRET_KEY "0x4AAA...your_secret..."
netlify env:set SITE_URL "https://qleaps.in"

# Deploy to production
netlify deploy --prod
```

---

## 🌐 DNS Records for qleaps.in

After deploying, Netlify will give you a URL like `quantum-leaps.netlify.app`.
To point **qleaps.in** at it, set these DNS records at your domain registrar (e.g. GoDaddy, Namecheap, Cloudflare DNS):

| Type | Name | Value | TTL |
|---|---|---|---|
| `A` | `@` | `75.2.60.5` | 3600 |
| `CNAME` | `www` | `quantum-leaps.netlify.app` | 3600 |

**Or use Netlify DNS (recommended):**
1. Netlify dashboard → Domain settings → Add custom domain → `qleaps.in`
2. Change nameservers at your registrar to Netlify's (they'll show you the exact NS records)
3. HTTPS is automatic — Let's Encrypt cert is provisioned within minutes

---

## 🔄 How to Redeploy

After any code change:
```bash
git add .
git commit -m "Your change description"
netlify deploy --prod
```

Or push to GitHub and enable auto-deploy in Netlify dashboard.

---

## 📬 How to Change the Lead Destination

Currently leads are delivered via **Resend email** to `OWNER_EMAIL`.

### Switch to Airtable (optional)
1. Create an Airtable base with fields: Name, Email, Message, Timestamp
2. Get your Airtable Personal Access Token and Base ID
3. Add env vars:
   ```
   AIRTABLE_API_KEY=patXXXXXX
   AIRTABLE_BASE_ID=appXXXXXX
   AIRTABLE_TABLE_NAME=Leads
   ```
4. In `netlify/functions/lead.js`, after `sendEmail()`, add:
   ```js
   await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_NAME}`, {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       fields: { Name: name, Email: email, Message: message, Timestamp: new Date().toISOString() }
     }),
   });
   ```

---

## 🔒 Spam Protection

| Layer | Implementation |
|---|---|
| Honeypot field | `#company` input, off-screen positioned, server-side checked |
| Time trap | Reject submissions < 2 seconds after page load |
| Cloudflare Turnstile | Server-side token verification via siteverify API |
| Rate limiting | 5 requests/minute per IP (in-memory, resets on cold start) |
| Server validation | Email regex, field length, consent check |
| Input sanitisation | Trim, strip control chars, max lengths |

---

## ✅ Post-Deploy Verification Checklist

After deploying, run these checks:

```bash
# 1. Check HTTPS and 200 response
curl -I https://qleaps.in

# 2. Test the lead endpoint with Turnstile test token
curl -X POST https://qleaps.in/api/lead \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Lead","email":"test@example.com","message":"Hello","consent":"yes","cf-turnstile-response":"1x0000000000000000000000000000000AA","loadTime":"'$(date -d '30 seconds ago' +%s%3N)'"}'

# 3. Test honeypot rejection (should silently succeed but not send email)
curl -X POST https://qleaps.in/api/lead \
  -H "Content-Type: application/json" \
  -d '{"name":"Bot","email":"bot@bot.com","honeypot":"filled","consent":"yes","cf-turnstile-response":"1x0000000000000000000000000000000AA","loadTime":"0"}'

# 4. Test rate limiting (run 6+ times quickly)
for i in {1..6}; do curl -s -o /dev/null -w "%{http_code}\n" -X POST https://qleaps.in/api/lead -H "Content-Type: application/json" -d '{"name":"RateTest","email":"t@t.com","consent":"yes","cf-turnstile-response":"1x0000000000000000000000000000000AA","loadTime":"0"}'; done
```

---

## 📊 Handoff Summary

| Item | Value |
|---|---|
| Live URL | https://qleaps.in (or `https://quantum-leaps.netlify.app` before DNS) |
| Email lead destination | `OWNER_EMAIL` env var |
| Turnstile sitekey location | `index.html` → `data-sitekey` attribute |
| Function logs | Netlify dashboard → Functions → `lead` |
| Redeploy command | `netlify deploy --prod` |
| Privacy policy | https://qleaps.in/privacy.html |

### Open Items
- [ ] Replace Turnstile placeholder sitekey in `index.html` with real key from Cloudflare dashboard
- [ ] Verify sender domain on Resend (add DNS TXT records)
- [ ] Point qleaps.in DNS to Netlify (see DNS section above)
- [ ] Set all 5 environment variables in Netlify dashboard
- [ ] Run post-deploy checklist above
- [ ] Run Lighthouse audit: `npx lighthouse https://qleaps.in --output html --output-path ./lighthouse-report.html`
