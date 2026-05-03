# myalicia.com

The website for [myalicia](https://github.com/mrdaemoni/myalicia) — the tangible example of [humorphism](https://humorphism.com).

This site is the spiritual home of the project. The codebase is the technical home. The site explains *why*; the repo explains *how*. Visitors come here to understand what relationship-shaped AI means and to see the diagrams; they leave to clone the repo.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:4321 in your browser.

## Building for production

```bash
npm run build
```

Output goes to `dist/`. Deploy that folder to any static host.

## Structure

```
src/
├── pages/             # one .astro file per route
│   ├── index.astro    # the manifesto + diagrams + CTA to repo
│   ├── philosophy.astro
│   └── architecture.astro
├── components/        # reusable pieces (e.g. the loops diagram)
├── layouts/           # page layouts
└── styles/            # global CSS
public/
└── diagrams/          # exported SVG diagrams
```

## Deploying

Recommended: [Netlify](https://www.netlify.com/) or [Cloudflare Pages](https://pages.cloudflare.com/) — both have free tiers, drag-and-drop deploys from a GitHub repo, and automatic HTTPS for custom domains.

To point myalicia.com at the deploy: in your domain registrar, set the DNS A or CNAME record to your hosting provider. Both Netlify and Cloudflare have one-click instructions.
