// Static site generator for the portfolio.
// Usage: node tools/build.js   (reads content/site.json, writes HTML into the repo root)
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const site = JSON.parse(fs.readFileSync(path.join(root, 'content', 'site.json'), 'utf8'));

// Email address shown on the contact page.
const CONTACT_EMAIL = 'cromeralec@gmail.com';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugOf = href => href.replace(/^\//, '');

function layout({ title, active, prefix, body, bodyClass = '' }) {
  const link = href => (slugOf(href) === 'home' ? `${prefix}index.html` : `${prefix}${slugOf(href)}/`);
  const navItem = (n, cls) =>
    `<li class="${cls}"><a href="${link(n.href)}"${slugOf(n.href) === active ? ' class="active" aria-current="page"' : ''}>${esc(n.label)}</a></li>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="Alec Cromer — software engineer and 3D / technical artist portfolio.">
<meta name="theme-color" content="#1b1b1f"><link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${prefix}css/style.css">
</head>
<body class="${bodyClass}">
<div class="site">
  <aside class="sidebar">
    <a class="logo" href="${prefix}index.html">${esc(site.title)}</a>
    <button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false"><span></span><span></span><span></span></button>
    <nav class="nav">
      <ul class="nav-gallery">${site.nav.map((n, i) => navItem(n, i === 0 ? 'gallery-title' : 'project-title')).join('')}</ul>
      <ul class="nav-pages">${site.navPages.map(n => navItem(n, 'page-title')).join('')}</ul>
    </nav>
  </aside>
  <main class="main">
${body}
    <footer class="footer"><a href="#top" class="back-to-top">&uarr; Back to Top</a><span>&copy; ${new Date().getFullYear()} ${esc(site.title)}</span></footer>
  </main>
</div>
<div class="lightbox" hidden><button class="lightbox-close" aria-label="Close">&times;</button><img alt=""></div>
<script src="${prefix}js/main.js"></script>
</body>
</html>
`;
}

function image(m, prefix, cls = '') {
  const src = prefix + m.src;
  const ratio = m.ratio ? ` style="aspect-ratio: 1 / ${m.ratio.toFixed(4)}"` : '';
  const cap = m.caption ? `<figcaption class="rich">${m.caption}</figcaption>` : '';
  // wide images (e.g. contact sheets) need more room than a thumbnail slot gives them
  if (m.ratio && m.ratio < 0.7) cls += ' wide';
  return `<figure class="module image ${cls}"><a class="zoom" href="${src}"><img src="${src}" alt="" loading="lazy"${ratio}></a>${cap}</figure>`;
}

function embed(m) {
  return `<div class="module embed"><iframe src="${esc(m.src)}" title="Embedded video" loading="lazy" allow="autoplay; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
}

function contactEmail() {
  return `<div class="module contact-card">
      <a class="contact-address" href="mailto:${esc(CONTACT_EMAIL)}">${esc(CONTACT_EMAIL)}</a>
      <div><a class="button button-solid" href="mailto:${esc(CONTACT_EMAIL)}">Send an email <span aria-hidden="true">&rarr;</span></a></div>
    </div>`;
}

function modules(list, prefix) {
  return list.map(m => {
    switch (m.type) {
      case 'text': return `<div class="module text rich">${m.html}</div>`;
      case 'image': return image(m, prefix);
      case 'embed': return embed(m);
      case 'form': return contactEmail();
      case 'gallery': return `<div class="module gallery">${modules(m.items, prefix)}</div>`;
      case 'row': {
        // myportfolio stores each column's flex grow; very large values are just scaled widths.
        // Each cell is a stack of modules (text, images, embeds) laid out vertically.
        // a cell that starts with text is the description column (it may end with thumbnails)
        const isText = i => i.items[0] && i.items[0].type === 'text';
        const textCells = m.items.filter(isText).length;
        const items = m.items.map(i => {
          // in a text | media row the media cell sticks beside long text
          const kind = isText(i) ? ' cell-text' : textCells ? ' cell-media' : '';
          return `<div class="cell${kind}" style="flex: ${i.flex} 1 0">${modules(i.items, prefix)}</div>`;
        });
        return `<div class="module row valign-${m.valign || 'top'}">${items.join('')}</div>`;
      }
      default: return '';
    }
  }).join('\n');
}

// Split a page's modules into project sections: a new section starts at each module holding a title.
const hasHeading = m => (m.type === 'text' && m.html.includes('<h2>')) || (m.items || []).some(hasHeading);
function sections(list, prefix) {
  const groups = [];
  for (const m of list) {
    if (!groups.length || hasHeading(m)) groups.push([]);
    groups[groups.length - 1].push(m);
  }
  return groups.map(g => `<section class="project">\n${modules(g, prefix)}\n</section>`).join('\n');
}

function write(rel, html) {
  const dest = path.join(root, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html);
  console.log('wrote', rel);
}

// Home
const homeBody = `
    <section class="hero">
      <div class="masthead"><video autoplay loop muted playsinline src="${site.mastheadVideo}"></video></div>
      <div class="masthead-contents">
        <div class="masthead-text">
          <h1 class="masthead-title">${esc(site.title)}</h1>
          ${site.tagline ? `<p class="masthead-tagline">${esc(site.tagline)}</p>` : ''}
        </div>
        <a class="button button-play" href="${esc(site.mastheadButton.href)}" target="_blank" rel="noopener"><span class="play-icon" aria-hidden="true"></span>Watch ${esc(site.mastheadButton.label)}</a>
      </div>
    </section>
    <h2 class="section-label">Selected Work</h2>
    <section class="covers">
${site.covers.map(c => `      <a class="cover" href="${slugOf(c.href)}/"><img src="${c.img}" alt="" loading="lazy"><span class="cover-title">${esc(c.title)}<span class="cover-arrow" aria-hidden="true">&rarr;</span></span></a>`).join('\n')}
    </section>`;
write('index.html', layout({ title: site.title, active: 'home', prefix: '', body: homeBody, bodyClass: 'home' }));

// Inner pages
for (const [slug, page] of Object.entries(site.pages)) {
  const prefix = '../';
  const body = `
    <header class="page-header">${site.nav.some(n => slugOf(n.href) === slug) ? '<p class="eyebrow">Portfolio</p>' : ''}<h1>${esc(page.title)}</h1>${page.description ? `<p>${esc(page.description)}</p>` : ''}</header>
    <div class="modules">
${sections(page.modules, prefix)}
    </div>`;
  write(`${slug}/index.html`, layout({ title: `${page.title} — ${site.title}`, active: slug, prefix, body }));
}

// 404 page (GitHub Pages serves it from the site root, so use absolute-free links relative to root)
write('404.html', layout({
  title: `Page not found — ${site.title}`, active: '', prefix: '/',
  body: `<header class="page-header"><h1>Page not found</h1><p>That page doesn't exist. <a href="/">Back to the portfolio</a>.</p></header>`,
}));

// The previous version of the site used flat URLs (/about-me.html); keep those links working.
const redirect = to => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Redirecting…</title>
<link rel="canonical" href="${to}"><meta http-equiv="refresh" content="0; url=${to}">
</head><body><a href="${to}">Continue to ${to}</a></body></html>
`;
write('home.html', redirect('index.html'));
for (const slug of Object.keys(site.pages)) write(`${slug}.html`, redirect(`${slug}/`));
