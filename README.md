# Ridgeline Pest Control — ridgelinepest.com

Marketing site for Ridgeline Pest Control, serving St. George and Washington County, Utah.

## Stack

Plain HTML/CSS/JS — no framework, no build step. Hosted on GitHub Pages (see `CNAME`) behind Cloudflare. **Pushing to `main` deploys the live site.**

## Structure

- `index.html` + 7 service/pricing pages (`residential`, `seasonal`, `ants`, `spiders`, `scorpions`, `rodents`, `pricing`), plus `404.html`
- `styles.css` — single stylesheet, design tokens in `:root`
- `script.js` — mobile menu, Formspree form submission, scroll animations
- `sitemap.xml` / `robots.txt` — keep sitemap in sync when adding pages

## Lead capture

All forms submit to Formspree (form ID `xojnwkar`) — via fetch when JS runs, and via the form `action` attribute as a no-JS fallback. Each form carries a hidden `_subject` field identifying the source page.

## Local preview

```
python3 -m http.server 8080
# open http://localhost:8080
```
