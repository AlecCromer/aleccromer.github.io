# Alec Cromer — Portfolio

## Structure

```
index.html                 Home (demo-reel video + project covers)
<page>/index.html          One folder per page, so URLs stay /about-me/, /resume/, ...
404.html                   Not-found page
assets/                    All images and the masthead video (downloaded from Adobe Portfolio)
css/style.css, js/main.js  Styling, mobile nav, image lightbox
content/site.json          The content model every page is generated from
tools/build.js             Regenerates the HTML from content/site.json
.nojekyll                  Tells GitHub Pages to serve files as-is
```

## Editing content

Edit `content/site.json` (page titles, text HTML, image paths, captions, YouTube embeds, and the home-page `tagline` shown over the reel), then run:

```
node tools/build.js
```

You can also edit the generated HTML directly, but it will be overwritten the next time you run the build.

## Contact

The contact page shows a mailto link. Change the address in `CONTACT_EMAIL` at the top of `tools/build.js`, then rebuild.

## Publishing on GitHub Pages

1. Create a repo named **`<your-github-username>.github.io`** (e.g. `AlecCromer.github.io`) so the site is served from the domain root.
   (A differently named repo also works, at `username.github.io/repo-name/`; every link is relative except in `404.html`.)
2. From this folder:
   ```
   git init
   git add .
   git commit -m "Portfolio site"
   git branch -M main
   git remote add origin https://github.com/<username>/<username>.github.io.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**.
4. Optional: to keep a custom domain, add it under Settings → Pages and point your DNS at GitHub.

## Preview locally

```
npx http-server -p 8080
```
then open http://localhost:8080.
