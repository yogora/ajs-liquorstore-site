# AJ's Beer, Wine & Spirits — Website

Static site for AJ's Beer, Wine & Spirits (Carterville, IL), hosted on Netlify at [ajscarterville.com](https://ajscarterville.com). Plain HTML/CSS, no build step — see `CLAUDE.md` for architecture details.

## SEO maintenance

**Whenever a new page is added to the site, add it to `sitemap.xml`** (a `<url>` entry with its canonical URL and a `<lastmod>` date) so it gets picked up by Google Search Console. Also give the new page its own self-referencing `<link rel="canonical">` tag, matching the pattern already used on every existing page.
