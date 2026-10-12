# Profile and portfolio

This repository contains both surfaces:

| File or folder | Purpose |
| --- | --- |
| `README.md` | The portfolio shown on the GitHub profile |
| `docs/` | The complete static portfolio website |
| `portfolio.json` | Shared profile, project, and experience content |
| `scripts/build.mjs` | Generates the README, static pages, and vector artwork |
| `site/` | Website styles and interactions |

## Update content

Edit `portfolio.json`, then run these commands with Node.js 22 or later:

```sh
npm run build
npm run check
```

Commit the source and generated outputs together. Neither surface needs a database, API credentials, or runtime dependencies. The Notion inventory is the private working hub; public content is curated into this file rather than exposed directly.

Project illustrations are original vector artwork describing product concepts. They are not product screenshots. Private repositories remain private, and their URLs are omitted from the public dataset. Personal phone numbers, private résumé links, and account credentials are not used by the site.

## Enable GitHub Pages

Open this repository’s **Settings → Pages**. Select **Deploy from a branch**, branch **main**, folder **/docs**, and save. GitHub publishes the complete site at:

`https://enrikr2002.github.io/EnrikR2002/`

Once the deployment succeeds, set `site.published` to `true` in `portfolio.json`, rebuild, check, and commit. That adds the live website link to the profile and makes every profile project link open its portfolio detail page. Public source links remain available on each project page.

If the publishing source is already the repository root, the root `index.html` forwards to `docs/`. The recommended configuration is still `main /docs`.

The profile README always works independently: publishing the website is not required for the project tables, artwork, and background to appear on the profile.
