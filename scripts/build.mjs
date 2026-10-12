import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const data = JSON.parse(fs.readFileSync(path.join(root, 'portfolio.json'), 'utf8'));
const { person, projects, site } = data;
const checkOnly = process.argv.includes('--check');
const assetVersion = file => createHash('sha256').update(fs.readFileSync(path.join(root, 'site', file))).digest('hex').slice(0, 12);
const cssVersion = assetVersion('site.css');
const jsVersion = assetVersion('site.js');
const output = new Map();
const html = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const md = value => String(value).replace(/[|\n]/g, ' ');
const two = number => String(number).padStart(2, '0');
const external = 'target="_blank" rel="noopener noreferrer"';
const categories = ['Web app', 'Mobile app', 'Automation', 'Research', 'Game', 'Developer tooling', 'Coursework'];
const filterNames = ['All work', 'Web', 'Mobile', 'Automation', 'Research', 'Games', 'Tooling', 'Coursework'];
const filters = ['all', ...categories];
const featured = projects.filter(p => p.featured);
const publicCount = projects.filter(p => p.source).length;
assert.equal(featured.length, 6);
assert.equal(new Set(projects.map(p => p.id)).size, projects.length);
for (const p of projects) {
  assert.match(p.id, /^[a-z0-9-]+$/);
  assert.ok(p.bullets.length && p.summary && p.role && categories.includes(p.category));
  if (p.sourceVisibility === 'Private') assert.equal(p.source, null);
  for (const url of [p.source, p.demo].filter(Boolean)) {
    const parsed = new URL(url);
    assert.equal(parsed.protocol, 'https:');
    assert.ok(!parsed.username && !parsed.password);
  }
}

const arrow = '<span aria-hidden="true">↗</span>';
const assetKey = p => p.feature?.visual || ({'Web app':'app','Mobile app':'habit','Automation':'media','Research':'research','Game':'game','Developer tooling':'tooling','Coursework':'coursework'}[p.category]);
const localLink = p => `projects/${p.id}/`;
const stackTags = p => p.stack.slice(0, 4).map(s => `<span class="tag">${html(s)}</span>`).join('');
const stage = p => `<span class="stage stage-${html(p.stage)}">${html(p.stage)}</span>`;
const nav = base => `<a class="skip-link" href="#main">Skip to content</a><header class="nav"><div class="wrap nav-inner"><a class="brand" href="${base}"><span class="mark" aria-hidden="true">ER</span>Enrik Rushiti</a><nav class="nav-links" aria-label="Main navigation"><a href="${base}#work">Work</a><a href="${base}#about">About</a><a href="${base}#contact">Contact</a><a class="external" href="${html(person.github)}" ${external}>GitHub ${arrow}</a></nav></div></header>`;
const footer = base => `<footer class="wrap footer"><span>© 2026 Enrik Rushiti<br>Made in Calgary.</span><span><a href="${html(site.repo)}" ${external}>Portfolio source ${arrow}</a><br><a href="${base}#work">Apps, automation &amp; games.</a></span></footer>`;
const contact = () => `<section class="contact" id="contact"><div class="wrap"><div class="contact-row"><div><div class="eyebrow">04 / Get in touch</div><h2>Something worth<br>building?</h2><p>Talk to me about a project, a collaboration, or something interesting you’ve been working on.</p></div><div><div class="contact-links"><a class="button button-primary" href="${html(person.linkedin)}" ${external}>LinkedIn ${arrow}</a><a class="button" href="${html(person.github)}" ${external}>GitHub ${arrow}</a><button class="button" type="button" data-copy-discord="${html(person.discord)}">Copy Discord <span aria-hidden="true">⧉</span></button></div><div class="copy-notice" data-copy-notice aria-live="polite">Discord: ${html(person.discord)}</div></div></div></div></section>`;
const head = (title, description, base, canonical) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="dark"><title>${html(title)}</title><meta name="description" content="${html(description)}"><meta property="og:type" content="website"><meta property="og:title" content="${html(title)}"><meta property="og:description" content="${html(description)}"><meta property="og:url" content="${html(canonical)}"><meta name="theme-color" content="#111216"><link rel="canonical" href="${html(canonical)}"><link rel="icon" type="image/svg+xml" href="${base}assets/favicon.svg"><link rel="stylesheet" href="${base}assets/site.css?v=${cssVersion}"><script src="${base}assets/site.js?v=${jsVersion}" defer></script></head><body>`;

const featureCards = featured.map(p => `<article class="feature"><a class="feature-art" href="${localLink(p)}" aria-label="Explore ${html(p.name)}"><img src="assets/${assetKey(p)}.svg" alt="${html(p.name)} project illustration" width="860" height="500" loading="lazy"><span class="arrow" aria-hidden="true">↗</span></a><div class="feature-meta"><span><span class="feature-index">${p.feature.number}</span> / ${html(p.category)}</span>${stage(p)}</div><h3><a class="feature-title" href="${localLink(p)}">${html(p.name)}</a></h3><p class="feature-description">${html(p.feature.outcome)}</p><div class="tags">${stackTags(p)}</div></article>`).join('');
const directory = projects.map((p,i) => `<a class="project-row" data-project data-category="${html(p.category)}" data-search="${html([p.name,p.summary,p.category,p.stage,...p.stack].join(' ').toLowerCase())}" href="${localLink(p)}"><span class="row-number" aria-hidden="true">${two(i+1)}</span><div><div class="row-name">${html(p.name)}</div><div class="row-summary">${html(p.summary)}</div></div><div class="row-category">${html(p.category)}</div>${stage(p)}<span class="row-arrow" aria-hidden="true">↗</span></a>`).join('');
const timeline = [...person.experience.map(e => `<article class="timeline-item"><div class="timeline-date">${html(e.period)}</div><h3>${html(e.role)}</h3><div class="timeline-company">${html(e.company)}</div><p class="timeline-summary">${html(e.summary)}</p></article>`), `<article class="timeline-item"><div class="timeline-date">${html(person.education.period)}</div><h3>${html(person.education.degree)}</h3><div class="timeline-company">${html(person.education.school)}</div><p class="timeline-summary">${html(person.education.detail)}</p></article>`].join('');
const content = `${head('Enrik Rushiti — Apps, automation & games', 'Personal portfolio of Enrik Rushiti. Explore web and mobile apps, automation tools, research systems, games, and development tooling.', './', site.url)}${nav('./')}<main id="main"><div class="wrap"><section class="hero" aria-labelledby="hero-title"><div><div class="eyebrow">Enrik Rushiti / Personal portfolio</div><h1 id="hero-title">Apps,<br>automation<br><span class="accent">&amp; games.</span></h1><p class="hero-intro">${html(person.intro)}</p><div class="actions"><a class="button button-primary" href="#work">Explore my work <span aria-hidden="true">↓</span></a><a class="button" href="#about">A little about me <span aria-hidden="true">↗</span></a></div><div class="hero-meta"><span><i class="dot" aria-hidden="true"></i>Calgary, Canada</span><span>BSc Computer Science · MRU</span></div></div><div class="workbench" aria-label="Illustrations of Enrik’s drawing and media tools"><div class="bench-header"><span>THE WORKBENCH</span><span>VOL. 01 / 2026</span></div><div class="bench-sheet"><img src="assets/draw.svg" alt="Illustration of a cloud drawing canvas" width="860" height="500"></div><div class="bench-mini"><img src="assets/media.svg" alt="Illustration of a desktop media queue" width="860" height="500"></div><span class="bench-index" aria-hidden="true">IDEA → BUILD → USE → REPEAT</span><div class="bench-label"><span><b>${projects.length}</b> PROJECTS, ONE BODY OF WORK</span><span>BUILT TO BE USED</span></div></div></section><div class="stat-strip" aria-label="Portfolio overview"><div class="stat"><span class="stat-number">${two(projects.length)}</span><span class="stat-text">Projects<br>in the index</span></div><div class="stat"><span class="stat-number">${two(featured.length)}</span><span class="stat-text">Featured<br>builds</span></div><div class="stat"><span class="stat-number">${two(categories.length)}</span><span class="stat-text">Areas<br>of work</span></div><div class="stat"><span class="stat-number">${two(publicCount)}</span><span class="stat-text">Public source<br>repositories</span></div></div></div><section class="section wrap" id="work"><div class="section-heading"><div><div class="eyebrow">01 / Selected work</div><h2>A few things<br>I’ve built.</h2></div><p>Every project starts with a reason.<br>These six show the range.</p></div><div class="featured-grid">${featureCards}</div></section><section class="section section-line wrap" id="projects"><div class="section-heading"><div><div class="eyebrow">02 / The full index</div><h2>All the work.</h2></div><p>Useful tools, unfinished experiments, games with friends, and the coursework that came before them.</p></div><div class="directory-top"><div class="search"><label class="visually-hidden" for="project-search">Search projects by name, technology, or purpose</label><input type="search" id="project-search" placeholder="Search projects, tools, or technologies…" autocomplete="off"><kbd aria-hidden="true">/</kbd></div><div class="result-count" data-result-count aria-live="polite">${projects.length} projects</div></div><div class="filters" role="group" aria-label="Filter by project category">${filters.map((f,i)=>`<button class="filter" type="button" data-filter="${html(f)}" aria-pressed="${i===0}">${filterNames[i]}</button>`).join('')}</div><div class="directory" data-project-directory>${directory}<div class="empty" data-empty hidden><h3>No projects match that search.</h3><p>Try a different tool, project name, or category.</p><button class="button" data-reset type="button">Reset filters</button></div></div><p class="directory-footnote">Stages describe what is built, rather than promising a finished product. Research projects are shown for their engineering and experiment design.</p><noscript><p class="directory-footnote">All projects are available below; search and filters require JavaScript.</p></noscript></section><section class="section section-line wrap" id="about"><div class="about"><div><div class="eyebrow">03 / Beyond the project list</div><h2>Curious by default.<br>Practical by choice.</h2><p class="lede">${html(person.about)}</p><p class="outside">${html(person.outside)}</p><div class="interest-list"><span class="interest">Bodybuilding</span><span class="interest">Bioenergetics</span><span class="interest">Philosophy</span></div></div><div class="timeline">${timeline}</div></div><div class="stack-band"><div class="label">Things I build with</div><div class="stack-items">${['Python','TypeScript','React Native','Next.js','Astro','Supabase','Firebase','Luau','Three.js','Git'].map(x=>`<span>${html(x)}</span>`).join('')}</div></div></section>${contact()}</main>${footer('./')}</body></html>`;
output.set('docs/index.html', content);
output.set('docs/assets/site.css', fs.readFileSync(path.join(root,'site/site.css'),'utf8') + '\n.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}\n');
output.set('docs/assets/site.js', fs.readFileSync(path.join(root,'site/site.js'),'utf8'));
output.set('docs/.nojekyll', '');
output.set('.nojekyll', '');
output.set('index.html', '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=./docs/"><title>Enrik Rushiti Portfolio</title></head><body><a href="./docs/">Open Enrik Rushiti’s portfolio</a></body></html>\n');
output.set('docs/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.url}sitemap.xml\n`);
output.set('docs/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[site.url,...projects.map(p=>site.url+localLink(p))].map(url=>`<url><loc>${html(url)}</loc></url>`).join('')}</urlset>\n`);
for (let index=0;index<projects.length;index++) {
  const p=projects[index];
  const prev=projects[(index+projects.length-1)%projects.length];
  const next=projects[(index+1)%projects.length];
  const links=`<div class="actions">${p.demo?`<a class="button button-primary" href="${html(p.demo)}" ${external}>Open app ${arrow}</a>`:''}${p.source?`<a class="button ${!p.demo?'button-primary':''}" href="${html(p.source)}" ${external}>View source ${arrow}</a>`:''}<a class="button" href="../../#projects">Back to the index <span aria-hidden="true">←</span></a></div>`;
  const detail = `${head(p.name+' — Enrik Rushiti',p.summary,'../../',site.url+localLink(p))}${nav('../../')}<main class="wrap detail" id="main"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../">Home</a><span aria-hidden="true">/</span><a href="../../#projects">Projects</a><span aria-hidden="true">/</span><span>${html(p.name)}</span></nav><div class="detail-top"><div class="eyebrow">${two(index+1)} / ${html(p.category)}</div>${stage(p)}</div><h1>${html(p.name)}</h1><p class="detail-summary">${html(p.summary)}</p>${links}<div class="detail-cover"><img src="../../assets/${assetKey(p)}.svg" alt="${html(p.name)} project illustration" width="860" height="500"></div><div class="detail-body"><article><h2>What I worked on</h2><ul class="detail-list">${p.bullets.map(b=>`<li>${html(b)}</li>`).join('')}</ul><h2>Where it stands</h2><p class="detail-state">${html(p.state)}</p></article><aside class="detail-meta" aria-label="Project details"><div class="meta-item"><div class="label">My part</div><p>${html(p.role)}</p></div><div class="meta-item"><div class="label">Built with</div><div class="tags">${p.stack.map(s=>`<span class="tag">${html(s)}</span>`).join('')}</div></div><div class="meta-item"><div class="label">Latest repository activity</div><p>${html(p.lastActivity)}</p></div><div class="meta-item"><div class="label">Source</div><p>${p.source?'Public repository':'Private repository'}</p></div>${!p.source?'<div class="private-note">The source code is private. This page describes the work without distributing the repository.</div>':''}</aside></div><nav class="related" aria-label="More projects"><a href="../${prev.id}/"><small>← Previous project</small>${html(prev.name)}</a><a class="next" href="../${next.id}/"><small>Next project →</small>${html(next.name)}</a></nav></main>${footer('../../')}</body></html>`;
  output.set(`docs/projects/${p.id}/index.html`, detail);
}

// Original vector illustrations. These are visual summaries, not screenshots.
const shapes = {
  draw:`<rect x="100" y="86" width="660" height="338" rx="12" fill="#edece6"/><rect x="100" y="86" width="660" height="36" rx="12" fill="#dbddd7"/><circle cx="120" cy="104" r="4" fill="#939891"/><circle cx="134" cy="104" r="4" fill="#939891"/><circle cx="148" cy="104" r="4" fill="#939891"/><rect x="124" y="152" width="36" height="203" rx="8" fill="#deded6"/><path d="M137 170l10 11-8 7zM136 213h12v12h-12zM138 263l11-12M139 295h9" stroke="#424942" fill="none" stroke-width="2"/><rect x="240" y="171" width="150" height="84" rx="8" stroke="#414b63" fill="#dfe6ff" stroke-width="3" transform="rotate(-3 310 210)"/><text x="270" y="218" font-size="22" fill="#35415d">An idea</text><path d="M407 216c37-25 69-16 92-10m-18-13 18 13-19 13" fill="none" stroke="#535d78" stroke-width="3"/><rect x="521" y="158" width="156" height="109" rx="10" fill="#e1edb9" stroke="#596540" stroke-width="3" transform="rotate(2 600 210)"/><text x="548" y="217" font-size="22" fill="#46522d">A useful tool</text><path d="M340 284c35 29 109 51 204 35" fill="none" stroke="#535d78" stroke-width="3"/><text x="308" y="361" font-size="23" fill="#5c6476" transform="rotate(-2 420 360)">Keep it. Come back to it.</text><rect x="605" y="389" width="122" height="20" rx="10" fill="#d6e5bd"/><text x="621" y="403" font-size="10" fill="#405030">● Cloud autosave</text>`,
  physique:`<g transform="translate(125 95)"><text x="0" y="25" font-size="14" fill="#c3d3a8">PHYSIQUE STUDIO</text><g stroke="#677261" stroke-width="1"><path d="M0 55h205M0 110h205M0 165h205M0 220h205M0 275h205"/></g><g fill="#d3fa79"><rect x="0" y="63" width="140" height="3"/><circle cx="140" cy="65" r="5"/><rect x="0" y="119" width="105" height="3"/><circle cx="105" cy="121" r="5"/><rect x="0" y="173" width="174" height="3"/><circle cx="174" cy="175" r="5"/></g><g fill="#c6cec0" font-size="12"><text x="0" y="49">Frame</text><text x="0" y="104">Insertions</text><text x="0" y="159">Development</text><text x="0" y="215">Pose / Front relaxed</text></g></g><g transform="translate(560 107)" fill="#b7beb5" stroke="#e1e6dc" stroke-width="2"><ellipse cx="0" cy="16" rx="24" ry="31"/><path d="M-21 47c-18 15-48 8-62 25l-13 92 24 10 19-65 7 48-13 48 22 83 29-6 8-60 8 60 29 6 22-83-13-48 7-48 19 65 24-10-13-92c-14-17-44-10-62-25z"/><path d="M-45 85c29-15 60-15 90 0M0 70v124M-29 124c19 9 40 9 58 0M-25 149h50M-20 173h40M-18 197-16 247M18 197l-2 50" fill="none" stroke="#697564" stroke-width="3"/></g><circle cx="560" cy="242" r="162" fill="none" stroke="#d3fa7935"/><path d="M400 243h320M560 82v320" stroke="#d3fa791c"/>
`,
  media:`<rect x="123" y="84" width="614" height="334" rx="12" fill="#20212c" stroke="#776b91"/><rect x="123" y="84" width="614" height="39" rx="12" fill="#2b2839"/><g fill="#9482b6"><circle cx="145" cy="105" r="4"/><circle cx="159" cy="105" r="4"/><circle cx="173" cy="105" r="4"/></g><text x="205" y="110" fill="#e2d8f5" font-size="12">MediaDownloader</text><g fill="#c2a5ff"><path d="M160 167v31l25-16z"/><path d="M160 240v31l25-16z"/><path d="M160 312v31l25-16z"/></g><g fill="#e1dcec" font-size="15"><text x="207" y="181">The next thing worth saving</text><text x="207" y="254">Something for the gym</text><text x="207" y="326">A reference for later</text></g><g fill="#65567d"><rect x="207" y="195" width="423" height="5" rx="3"/><rect x="207" y="268" width="423" height="5" rx="3"/><rect x="207" y="340" width="423" height="5" rx="3"/></g><g fill="#c2a5ff"><rect x="207" y="195" width="423" height="5" rx="3"/><rect x="207" y="268" width="282" height="5" rx="3"/></g><g fill="#bdb1d0" font-size="11"><text x="661" y="181">MP3</text><text x="661" y="254">MP4</text><text x="661" y="326">MP4</text></g><text x="161" y="391" font-size="12" fill="#c2a5ff">QUEUE / PROGRESS / HISTORY</text>`,
  habit:`<g transform="rotate(-7 323 245)"><rect x="218" y="53" width="211" height="396" rx="29" fill="#171b22" stroke="#8e7564" stroke-width="3"/><rect x="237" y="91" width="173" height="307" rx="11" fill="#272c36"/><rect x="284" y="68" width="77" height="5" rx="3" fill="#555c69"/><text x="251" y="121" fill="#ffd2aa" font-size="13">Streak Buddy</text><rect x="251" y="144" width="144" height="134" rx="9" fill="#625749"/><path d="M274 241l27-35 19 20 32-54 35 69" fill="none" stroke="#ffc892" stroke-width="5"/><circle cx="362" cy="168" r="12" fill="#ffe0ad"/><text x="253" y="305" fill="#eae4dd" font-size="13">Today’s proof</text><rect x="251" y="323" width="144" height="35" rx="7" fill="#ffad72"/><text x="288" y="346" fill="#442818" font-size="12">Submitted</text><circle cx="323" cy="421" r="7" fill="#37373a"/></g><g transform="rotate(9 580 270)"><rect x="457" y="177" width="235" height="124" rx="12" fill="#efe6d5"/><g fill="#ffc280" stroke="#c5905e" stroke-width="3"><circle cx="494" cy="219" r="16"/><circle cx="541" cy="219" r="16"/><circle cx="588" cy="219" r="16"/></g><text x="482" y="270" fill="#6c4f37" font-size="15">Show up. Send proof.</text></g>`,
  pdf:`<g transform="rotate(-7 290 251)"><rect x="151" y="76" width="265" height="341" rx="6" fill="#2a3c3f" stroke="#668b8e"/><text x="178" y="116" fill="#9be9e9" font-size="14">THE ARTICLE</text><g fill="#6a9092"><rect x="179" y="144" width="200" height="6" rx="3"/><rect x="179" y="159" width="190" height="6" rx="3"/><rect x="179" y="174" width="174" height="6" rx="3"/><rect x="179" y="303" width="200" height="6" rx="3"/><rect x="179" y="319" width="177" height="6" rx="3"/><rect x="179" y="334" width="196" height="6" rx="3"/></g><rect x="179" y="205" width="200" height="69" rx="4" fill="#3d6367"/></g><path d="M421 230h66m-15-13 15 13-15 13" stroke="#84d8dc" stroke-width="3" fill="none"/><g transform="rotate(5 601 250)"><rect x="501" y="61" width="224" height="366" rx="6" fill="#eeeee6"/><path d="M682 61v45h43" fill="#b8dadd"/><text x="526" y="139" fill="#263d43" font-size="27" font-weight="700">Read it</text><text x="526" y="173" fill="#263d43" font-size="27" font-weight="700">anywhere.</text><g fill="#97a6a6"><rect x="526" y="204" width="173" height="4"/><rect x="526" y="220" width="166" height="4"/><rect x="526" y="236" width="173" height="4"/><rect x="526" y="282" width="173" height="4"/><rect x="526" y="298" width="159" height="4"/><rect x="526" y="314" width="170" height="4"/></g><text x="527" y="382" fill="#40636b" font-size="11">PDF / LINKS / BOOKMARKS</text></g>`,
  portfolio:`<rect x="111" y="79" width="638" height="342" rx="10" fill="#181a20" stroke="#796c76"/><text x="141" y="118" fill="#e9dae3" font-size="12">ETHAN ALFANDARY</text><path d="M142 137h576" stroke="#493a47"/><text x="141" y="200" fill="#f2e6ed" font-size="36" font-weight="700">A body of work.</text><text x="144" y="237" fill="#b49fae" font-size="13">MEDIA / AUDIENCE / CREATIVE DIRECTION</text><rect x="144" y="278" width="169" height="101" rx="5" fill="#4b3547"/><rect x="332" y="278" width="169" height="101" rx="5" fill="#354351"/><rect x="520" y="278" width="195" height="101" rx="5" fill="#3c4943"/><path d="M169 353l32-44 38 26 40-33" fill="none" stroke="#f4bcda" stroke-width="3"/><circle cx="416" cy="327" r="28" fill="none" stroke="#9baec3" stroke-width="3"/><path d="M569 315h87M569 332h67M569 349h80" stroke="#a2c3b1" stroke-width="3"/>`
};
const palette={draw:'#6687ed',physique:'#708643',media:'#665488',habit:'#875e45',pdf:'#436e72',portfolio:'#715267',app:'#547693',research:'#595386',game:'#6f8054',tooling:'#6b707e',coursework:'#7b744c'};
for(const key of ['draw','physique','media','habit','pdf','portfolio','app','research','game','tooling','coursework']) {
  let shape=shapes[key];
  if(!shape) shape=`<rect x="156" y="103" width="548" height="295" rx="13" fill="#202430" stroke="#70778a"/><path d="M183 144h494" stroke="#565e75"/><circle cx="187" cy="125" r="4" fill="#aaaec3"/><circle cx="201" cy="125" r="4" fill="#aaaec3"/><circle cx="215" cy="125" r="4" fill="#aaaec3"/><text x="207" y="252" fill="#d3fa79" font-size="61" font-family="monospace">${key==='game'?'PLAY':key==='research'?'DATA':key==='coursework'?'LEARN':key==='tooling'?'BUILD':'CREATE'}</text><path d="M209 282h292M209 307h202" stroke="#8b93a9" stroke-width="4"/>`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="860" height="500" viewBox="0 0 860 500"><defs><radialGradient id="g"><stop stop-color="${palette[key]}" stop-opacity=".52"/><stop offset="1" stop-color="#181b23"/></radialGradient><pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#ffffff" stroke-opacity=".035"/></pattern></defs><rect width="860" height="500" fill="#181b23"/><rect width="860" height="500" fill="url(#g)"/><rect width="860" height="500" fill="url(#grid)"/><g font-family="Arial,sans-serif">${shape}</g></svg>\n`;
  output.set(`docs/assets/${key}.svg`,svg);
}
output.set('docs/assets/favicon.svg','<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#111216"/><text x="32" y="40" text-anchor="middle" fill="#d3fa79" font-family="Arial,sans-serif" font-weight="700" font-size="26">ER</text></svg>\n');
output.set('docs/assets/profile-banner.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="400" viewBox="0 0 1400 400"><defs><linearGradient id="bg"><stop stop-color="#12151e"/><stop offset="1" stop-color="#263040"/></linearGradient><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#fff" stroke-opacity=".045"/></pattern></defs><rect width="1400" height="400" rx="16" fill="url(#bg)"/><rect width="1400" height="400" rx="16" fill="url(#grid)"/><g font-family="Arial,sans-serif"><text x="66" y="68" fill="#bfc9d9" font-size="15" letter-spacing="3">CALGARY, CANADA / PERSONAL PORTFOLIO</text><text x="62" y="165" fill="#f5f5ed" font-size="78" font-weight="700" letter-spacing="-3">Enrik Rushiti</text><text x="65" y="232" fill="#d3fa79" font-size="43" font-weight="700" letter-spacing="-1">Apps, automation &amp; games.</text><text x="66" y="296" fill="#c1cad8" font-size="21">Computer Science graduate. Curious by default. Building things I use.</text><path d="M66 331h1268" stroke="#556174"/><text x="66" y="370" fill="#aeb9cc" font-size="14" letter-spacing="1">WEB / MOBILE / TOOLS / RESEARCH / GAMES</text><text x="1146" y="370" fill="#d3fa79" font-size="14">${projects.length} PROJECTS</text><g transform="translate(1080 77)"><rect x="0" y="0" width="230" height="220" rx="12" fill="#141921" stroke="#6c778c" transform="rotate(7 100 100)"/><rect x="-25" y="24" width="230" height="190" rx="12" fill="#202837" stroke="#8da5ff" transform="rotate(-7 100 100)"/><text x="26" y="138" fill="#d3fa79" font-size="80" font-weight="700">ER</text><text x="32" y="173" fill="#b6c6de" font-size="12" letter-spacing="3">THE WORKBENCH</text></g></g></svg>\n`);

const projectReadmeLink = p => site.published ? site.url+localLink(p) : p.source;
const linkedName = p => projectReadmeLink(p)?`[${md(p.name)}](${projectReadmeLink(p)})`:`**${md(p.name)}**`;
const readmeCards=featured.map((p,i)=>`<td width="50%" valign="top"><img src="docs/assets/${assetKey(p)}.svg" alt="${html(p.name)} project illustration" width="100%"><h3>${two(i+1)} · ${html(p.name)}</h3><p>${html(p.feature.outcome)}</p><p><strong>${html(p.stack.slice(0,4).join(' · '))}</strong></p><p>${projectReadmeLink(p)?`<a href="${projectReadmeLink(p)}">Explore the project ↗</a>`:'Private source · project overview below'}</p></td>`);
const tables=categories.map(category=>`### ${category==='Game'?'Games':category==='Research'?'Research systems':category==='Automation'?'Automation and data tools':category==='Developer tooling'?'Development tooling':category==='Coursework'?'University projects':category==='Web app'?'Web applications':'Mobile applications'}\n\n| Project | What it does | Stage |\n| :--- | :--- | :--- |\n${projects.filter(p=>p.category===category).map(p=>`| ${linkedName(p)} | ${md(p.summary)} | ${p.stage}${!p.source?' · Private source':''} |`).join('\n')}`).join('\n\n');
const readme=`<!-- Generated from portfolio.json by scripts/build.mjs. -->
<p align="center"><img src="docs/assets/profile-banner.svg" alt="Enrik Rushiti — Apps, automation and games. Computer Science graduate in Calgary, Canada." width="100%"></p>

<p align="center"><a href="#featured-builds"><strong>Featured builds</strong></a> · <a href="#the-full-project-index">Project index</a> · <a href="#background">Background</a> · <a href="${person.linkedin}">LinkedIn</a>${site.published?` · <a href="${site.url}"><strong>Full portfolio ↗</strong></a>`:''}</p>

I’m **Enrik**, a Computer Science graduate in Calgary. I build web and mobile apps, useful automations, research systems, and games with friends. A lot of it starts with a problem I want solved in my own life.

**${projects.length} projects · ${featured.length} featured builds · ${publicCount} public source repositories**

## Featured builds

<table>
${[0,2,4].map(i=>`<tr>${readmeCards[i]}${readmeCards[i+1]}</tr>`).join('\n')}
</table>

## Recent work

- **Picard Performance Platform** — coach dashboard and mobile app foundation, with authentication, role-based access, shared packages, and database security.
- **Loot Goblins & Don’t Touch That** — Roblox prototypes with Ethan and Ninety; shared source, playtests, and a repeatable development setup.
- **StreakPet** — a Whop community app with daily check-ins, evolving pet stages, reminders, and growth entitlements.
- **Web of Shadows DS tooling** — archive extraction, rebuild verification, versioned patches, and emulator research.

## The full project index

${tables}

Private source means the implementation repository is private; the project description remains part of this portfolio. Prototypes and research are labelled by their current stage. Trading research is presented for its engineering and experiments, without a claim of proven profitability.

## Things I build with

**Languages** — Python · TypeScript · JavaScript · SQL · Java · C/C++ · Luau  
**Apps** — React Native · Expo · Next.js · Astro · Three.js  
**Data & infrastructure** — Supabase · Firebase · SQLite · FastAPI · Docker · Oracle Cloud · n8n  
**Workflow** — Git/GitHub · automated checks · AI-assisted development · documentation that keeps projects understandable

## Background

| Experience | Focus |
| :--- | :--- |
| **IT Technician · Electronic Recycling Association**<br>Apr 2026–present | Hardware diagnostics, refurbishment, system imaging, and device lifecycle management. |
| **Data Analyst Intern · Suncor Energy**<br>Sep 2023–Aug 2024 | Data validation, schema work, cross-functional coordination, and communicating findings to stakeholders. |
| **BSc Computer Science · Mount Royal University**<br>2020–2025 | GIS cognate; President’s and Dean’s Honor Roll. |

## Beyond the code

Natural bodybuilding, bioenergetics, and philosophy. I like understanding how things work, finding something worth improving, and making the improvement concrete. Those interests show up in the software too.

## Get in touch

**[LinkedIn](${person.linkedin})** · **[GitHub](${person.github})** · **Discord: \`${person.discord}\`**

${site.published?`The full [portfolio website](${site.url}) and this profile share the same project data.`:'The full website is built alongside this profile. [Browse the portfolio source](docs/) or [see how the two stay connected](MAINTAINING.md).'}
`;
output.set('README.md',readme);

let changed=0;
for(const [relative,contents] of output) {
  const target=path.join(root,relative);
  const existing=fs.existsSync(target)?fs.readFileSync(target,'utf8'):null;
  if(existing!==contents) {
    changed++;
    if(checkOnly) throw new Error(`Generated output needs rebuilding: ${relative}`);
    fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,contents);
  }
}
console.log(`${checkOnly?'Verified':'Generated'} ${projects.length} projects, ${featured.length} featured builds, ${output.size} files. ${changed} changed.`);
