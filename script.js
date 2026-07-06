// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURE YOUR CREDENTIALS HERE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const MAL_USERNAME     = "neel_mvss";
const CODOLIO_USERNAME = "neel_mvss";

// Add as many playlists as you want — they render in a 2-column grid.
// ID is the part after open.spotify.com/playlist/ (stop before any ?si=...)
const SPOTIFY_PLAYLISTS = [
    { label: "playlist 01", id: "6NNp0Q8lypCDkDxTUh1IeZ" },
    { label: "playlist 02", id: "5HWDqGP4D8iD23o0hlh7Hg" },
];
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── THEME ──
const THEME_KEY = 'portfolio-theme';
const root = document.documentElement;

function applyTheme(theme) {
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
}

document.getElementById('theme-toggle').addEventListener('click', () => {
    const next = root.hasAttribute('data-theme') ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
});

applyTheme(localStorage.getItem(THEME_KEY) || 'light');

// ── TYPEWRITER ──
const WORK_PHRASES     = ["engineer.", "researcher.", "technophile.", "student.", "developer."];
const PERSONAL_PHRASES = ["reader.", "explorer.", "photographer.", "overthinker.", "human."];

const el       = document.getElementById("typed-text");
const TYPE_MS  = 75;
const DEL_MS   = 40;
const PAUSE_MS = 1800;
const GAP_MS   = 320;

let phrases   = [...WORK_PHRASES];
let phraseIdx = 0;
let charIdx   = 0;
let deleting  = false;
let timerId   = null;

function tick() {
    const phrase = phrases[phraseIdx];
    if (deleting) {
        charIdx--;
        el.textContent = phrase.slice(0, charIdx);
        if (charIdx === 0) {
            deleting  = false;
            phraseIdx = (phraseIdx + 1) % phrases.length;
            timerId   = setTimeout(tick, GAP_MS);
            return;
        }
        timerId = setTimeout(tick, DEL_MS);
    } else {
        charIdx++;
        el.textContent = phrase.slice(0, charIdx);
        if (charIdx === phrase.length) {
            deleting = true;
            timerId  = setTimeout(tick, PAUSE_MS);
            return;
        }
        timerId = setTimeout(tick, TYPE_MS);
    }
}

function restartTypewriter(mode) {
    clearTimeout(timerId);
    phrases   = mode === "work" ? [...WORK_PHRASES] : [...PERSONAL_PHRASES];
    phraseIdx = 0;
    charIdx   = 0;
    deleting  = false;
    el.textContent = "";
    timerId = setTimeout(tick, 400);
}

// ── STATE ──
let currentMode         = "work";
let currentSection      = "about";
let entertainmentLoaded = false;
let stackLoaded         = false;
let postsLoaded         = false;
let blogsLoaded         = false;
let projectsLoaded      = false;

// ── PAGINATION + FILTER STATE ──
const PAGE_SIZE         = 6;
let allProjects         = [];
let allWriteups         = [];
let allPubs             = [];
let projectFilters      = [
    { label: "Perception / CV",    color: "purple" },
    { label: "Path Planning",      color: "purple" },
    { label: "Motion Planning",    color: "purple" },
    { label: "Learning",           color: "green"  },
    { label: "Autonomous Systems", color: "purple" },
    { label: "C++",                color: "green"  },
    { label: "Python",             color: "green"  },
    { label: "Simulation",         color: "purple" },
    { label: "Hardware",           color: "green"  },
    { label: "Math",               color: "purple" },
    { label: "Web Dev",            color: "green"  },
];
let activeFilters       = new Set();
let currentProjectPage  = 0;
let currentWriteupPage  = 0;
let currentPubPage      = 0;

// ── STACK: CODOLIO ──
const PLATFORM_CONFIG = {
    leetcode:      { label: 'LC',  icon: 'https://cdn.simpleicons.org/leetcode/FFA116'      },
    geeksforgeeks: { label: 'GFG', icon: 'https://cdn.simpleicons.org/geeksforgeeks/2F8D46' },
    codeforces:    { label: 'CF',  icon: 'https://cdn.simpleicons.org/codeforces/1F8ACB'    },
    hackerrank:    { label: 'HR',  icon: 'https://cdn.simpleicons.org/hackerrank/2EC866'    },
    codestudio:    { label: 'CS',  icon: 'https://cdn.simpleicons.org/codingninjas/DD4914'  },
    codechef:      { label: 'CC',  icon: 'https://cdn.simpleicons.org/codechef/B92B27'      },
};

async function fetchCodolio() {
    const card = document.getElementById("codolio-card");
    if (!card) return;

    try {
        const r = await fetch(`https://api.codolio.com/profile?userKey=${CODOLIO_USERNAME}`);
        if (!r.ok) throw new Error(r.status);
        const { data } = await r.json();

        const platforms = (data.platformProfiles?.platformProfiles || [])
            .map(p => {
                const cfg = PLATFORM_CONFIG[p.platform] || { label: p.platform, icon: null };
                return {
                    label: cfg.label,
                    icon:  cfg.icon,
                    count: p.totalQuestionStats?.totalQuestionCounts || 0,
                };
            })
            .filter(p => p.count > 0)
            .sort((a, b) => b.count - a.count);

        const total = platforms.reduce((s, p) => s + p.count, 0);

        card.innerHTML = `
            <a class="codolio-link" href="https://codolio.com/profile/${CODOLIO_USERNAME}" target="_blank" rel="noopener">
                <div class="codolio-top">
                    <div class="codolio-stat">
                        <span class="codolio-num">${total}</span>
                        <span class="codolio-desc">problems solved across ${platforms.length} platforms</span>
                    </div>
                    <span class="codolio-ext">codolio ↗</span>
                </div>
                <div class="codolio-breakdown">
                    ${platforms.map(p => `
                        <span class="codolio-plat">
                            ${p.icon ? `<img class="codolio-plat-icon" src="${p.icon}" width="13" height="13" alt="" onerror="this.style.display='none'">` : ''}
                            <span class="codolio-plat-label">${p.label}</span>
                            <span class="codolio-plat-count">${p.count}</span>
                        </span>
                    `).join('')}
                </div>
            </a>`;
    } catch {
        card.innerHTML = `
            <a class="codolio-link" href="https://codolio.com/profile/${CODOLIO_USERNAME}" target="_blank" rel="noopener">
                <div class="codolio-top">
                    <span class="codolio-desc">competitive programming profile</span>
                    <span class="codolio-ext">@${CODOLIO_USERNAME} ↗</span>
                </div>
            </a>`;
    }
}

// ── POSTS: LINKEDIN CAROUSEL ──
async function loadPosts() {
    if (postsLoaded) return;
    postsLoaded = true;
    const grid = document.getElementById('posts-grid');
    if (!grid) return;
    try {
        const posts = await fetch('content/work/posts.json', { cache: 'no-store' }).then(r => r.json());
        const liSvg = `<svg class="post-card-li-logo" width="52" height="52" viewBox="0 0 24 24" fill="currentColor" style="color:#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`;
        const liBadge = `<span class="post-card-li-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></span>`;
        grid.innerHTML = posts.map(p => {
            const thumb = p.image
                ? `<img src="${p.image}" alt="" loading="lazy">`
                : liSvg;
            return `<a class="post-card" href="${p.external}" target="_blank" rel="noopener">
                <div class="post-card-thumb">
                    ${thumb}
                    ${liBadge}
                </div>
                <div class="post-card-body">
                    <div class="post-card-title">${p.title || 'LinkedIn Post'}</div>
                    ${p.desc ? `<p class="post-card-desc">${p.desc}</p>` : ''}
                    <div class="post-card-footer">
                        <span class="post-card-date">${p.date || ''}</span>
                        <span class="post-card-link">open ↗</span>
                    </div>
                </div>
            </a>`;
        }).join('');
    } catch {}
}

function initSidebarToggle() {
    const btn      = document.getElementById('sidebar-toggle-btn');
    const sidebar  = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (!btn || !sidebar) return;

    const iconOpen  = btn.querySelector('.st-icon-open');
    const iconClose = btn.querySelector('.st-icon-close');

    function openSidebar() {
        sidebar.classList.add('sidebar--open');
        if (backdrop) backdrop.classList.add('visible');
        if (iconOpen)  iconOpen.style.display  = 'none';
        if (iconClose) iconClose.style.display = '';
    }

    function closeSidebar() {
        sidebar.classList.remove('sidebar--open');
        if (backdrop) backdrop.classList.remove('visible');
        if (iconOpen)  iconOpen.style.display  = '';
        if (iconClose) iconClose.style.display = 'none';
    }

    btn.addEventListener('click', () =>
        sidebar.classList.contains('sidebar--open') ? closeSidebar() : openSidebar()
    );

    if (backdrop) backdrop.addEventListener('click', closeSidebar);

    document.querySelectorAll('.sidebar-link, .sidebar-avatar-wrap').forEach(el => {
        el.addEventListener('click', () => {
            if (window.innerWidth <= 900) closeSidebar();
        });
    });
}

// ── ENTERTAINMENT: ANIME (Jikan / MyAnimeList) ──
async function fetchAnimeList() {
    const grid = document.getElementById("anime-grid");
    if (!grid) return;

    if (!MAL_USERNAME) {
        grid.innerHTML = '<p class="ent-empty">set MAL_USERNAME in script.js to load your anime list from MyAnimeList.</p>';
        return;
    }

    try {
        const r = await fetch(
            `https://api.jikan.moe/v4/users/${MAL_USERNAME}/userupdates`
        );
        if (!r.ok) throw new Error(r.status);
        const { data } = await r.json();

        const watching = (data?.anime || []).filter(item => item.status === "Watching" || item.status === "Re-watching");

        if (watching.length === 0) {
            grid.innerHTML = '<p class="ent-empty">nothing in the queue right now.</p>';
            return;
        }

        grid.innerHTML = watching.slice(0, 8).map(item => {
            const total   = item.episodes_total || '?';
            const watched = item.episodes_seen  || 0;
            const img     = item.entry.images.webp.large_image_url;
            return `
                <a class="anime-card" href="${item.entry.url}" target="_blank" rel="noopener noreferrer">
                    <img class="anime-cover" src="${img}" alt="${item.entry.title}" loading="lazy"
                         onerror="this.style.background='var(--bg-surface)'">
                    <div class="anime-info">
                        <div class="anime-title">${item.entry.title}</div>
                        <div class="anime-progress">${watched} / ${total} eps</div>
                    </div>
                </a>
            `;
        }).join("");
    } catch (e) {
        grid.innerHTML = '<p class="ent-empty">couldn\'t load — MAL may be rate-limiting right now.</p>';
    }
}

// ── ENTERTAINMENT: MUSIC (Spotify grid) ──
function renderSpotifyEmbed() {
    const container = document.getElementById("music-tracks");
    if (!container) return;

    const active = SPOTIFY_PLAYLISTS.filter(p => p.id);
    if (!active.length) {
        container.innerHTML = `<p class="ent-empty">
            Add playlist IDs to <code style="color:var(--accent)">SPOTIFY_PLAYLISTS</code> in script.js.<br>
            Playlist ID = the part after <code style="color:var(--accent)">open.spotify.com/playlist/</code>.
        </p>`;
        return;
    }

    const theme = document.documentElement.hasAttribute('data-theme') ? '&theme=0' : '';
    container.innerHTML = `
        <div class="spotify-grid">
            ${active.map(p => `
                <div class="spotify-card">
                    <div class="spotify-card-label">${p.label}</div>
                    <iframe class="spotify-embed"
                        src="https://open.spotify.com/embed/playlist/${p.id}?utm_source=generator${theme}"
                        height="232"
                        frameborder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy">
                    </iframe>
                </div>
            `).join("")}
        </div>
    `;
}

async function loadEntertainment() {
    renderSpotifyEmbed();
    await fetchAnimeList();
}

// ── CONTENT: HELPERS ──
function parseFrontmatter(text) {
    const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { meta: {}, body: text };
    const meta = {};
    for (const line of match[1].split('\n')) {
        const idx = line.indexOf(':');
        if (idx === -1) continue;
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim();
        try { meta[key] = JSON.parse(val); } catch { meta[key] = val; }
    }
    return { meta, body: match[2] };
}

function renderMarkdown(md) {
    if (!md || typeof marked === 'undefined') return md || '';
    let html = marked.parse(md);
    html = html
        .replace(/<ul>/g, '<ul class="writeup-list">')
        .replace(/<blockquote>\s*<p>([\s\S]*?)<\/p>\s*<\/blockquote>/g,
                 '<div class="writeup-formula">$1</div>')
        .replace(/<code>([^<]*?)<\/code>/g,
                 '<span class="wu-code">$1</span>')
        .replace(/<a href="http/g, '<a target="_blank" rel="noopener" href="http');
    return html;
}

function renderWriteupSections(body) {
    return body.trim().split(/^## /m).filter(Boolean).map(section => {
        const nl      = section.indexOf('\n');
        const heading = nl === -1 ? section.trim() : section.slice(0, nl).trim();
        const content = nl === -1 ? '' : section.slice(nl + 1).trim();
        return `<div class="writeup-section">
            <div class="writeup-section-label">// ${heading}</div>
            ${renderMarkdown(content)}
        </div>`;
    }).join('\n');
}

// ── CONTENT: ABOUT ──
let workAboutLoaded     = false;
let personalAboutLoaded = false;

async function loadWorkAbout() {
    if (workAboutLoaded) return;
    workAboutLoaded = true;
    try {
        const [bioText, experience] = await Promise.all([
            fetch('content/work/about.md').then(r => r.text()),
            fetch('content/work/experience.json').then(r => r.json()),
        ]);
        const textEl = document.getElementById('work-about-text');
        if (textEl) textEl.innerHTML = renderMarkdown(bioText.trim());
        const listEl = document.getElementById('work-experience-list');
        if (listEl) listEl.innerHTML = experience.map(item => `
            <div class="work-item">
                <div class="work-period">${item.period}</div>
                <div>
                    <div class="work-title">${item.title}</div>
                    <span class="work-org">${item.org}</span>
                    <ul class="work-bullets">
                        ${(item.bullets || []).map(b => `<li>${b}</li>`).join('')}
                    </ul>
                </div>
            </div>`).join('');
    } catch {}
}

async function loadPersonalAbout() {
    if (personalAboutLoaded) return;
    personalAboutLoaded = true;
    try {
        const text = await fetch('content/personal/about.md').then(r => r.text());
        const el   = document.getElementById('personal-about-text');
        if (el) el.innerHTML = renderMarkdown(text.trim());
    } catch {}
}

// ── CONTENT: PUBLICATIONS ──
// ── PAGINATION HELPER ──
function renderPagination(containerId, current, total, onChange) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (total <= 1) { el.innerHTML = ''; return; }
    const prev  = `<button class="page-btn" ${current === 0 ? 'disabled' : ''} data-p="${current - 1}" aria-label="Previous page">←</button>`;
    const nums  = Array.from({ length: total }, (_, i) =>
        `<button class="page-btn ${i === current ? 'active' : ''}" data-p="${i}" aria-label="Page ${i + 1}">${i + 1}</button>`
    ).join('');
    const next  = `<button class="page-btn" ${current === total - 1 ? 'disabled' : ''} data-p="${current + 1}" aria-label="Next page">→</button>`;
    el.innerHTML = prev + nums + next;
    el.querySelectorAll('.page-btn:not([disabled])').forEach(btn =>
        btn.addEventListener('click', () => onChange(parseInt(btn.dataset.p)))
    );
}

// ── FILTER BAR ──
function renderFilterBar() {
    const bar = document.getElementById('project-filter-bar');
    if (!bar) return;
    bar.style.display = '';
    const allChip = `<button class="filter-chip filter-chip--all ${activeFilters.size === 0 ? 'active' : ''}" data-f="__all">all</button>`;
    const chips   = projectFilters.map(f =>
        `<button class="filter-chip filter-chip--${f.color} ${activeFilters.has(f.label) ? 'active' : ''}" data-f="${f.label}">${f.label}</button>`
    ).join('');
    bar.innerHTML = allChip + chips;
    bar.querySelectorAll('.filter-chip').forEach(chip =>
        chip.addEventListener('click', () => {
            const f = chip.dataset.f;
            if (f === '__all') { activeFilters.clear(); }
            else if (activeFilters.has(f)) { activeFilters.delete(f); }
            else { activeFilters.add(f); }
            currentProjectPage = 0;
            renderFilterBar();
            renderProjectsPage();
        })
    );
}

// ── PROJECTS PAGE RENDER ──
function renderProjectsPage() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    const filtered = activeFilters.size === 0
        ? allProjects
        : allProjects.filter(p => (p.meta.filters || []).some(f => activeFilters.has(f)));
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (currentProjectPage >= pages) currentProjectPage = 0;
    const slice = filtered.slice(currentProjectPage * PAGE_SIZE, (currentProjectPage + 1) * PAGE_SIZE);
    grid.innerHTML = slice.length
        ? slice.map(p => renderProjectCard(p.slug, p.meta)).join('')
        : '<p class="ent-empty">no projects match this filter</p>';
    grid.querySelectorAll('.project-card[data-project]').forEach(card =>
        card.addEventListener('click', e => {
            if (e.target.closest('a')) return;
            const p = allProjects.find(x => x.slug === card.dataset.project);
            if (!p) return;
            const container = document.getElementById('project-detail-container');
            container.innerHTML = renderProjectDetail(p.meta, renderWriteupSections(p.body));
            container.querySelector('.wu-back')?.addEventListener('click', () => history.back());
            initYtFacades(container);
            history.pushState({ project: p.slug }, '');
            showProjectDetailView();
        })
    );
    renderPagination('projects-pagination', currentProjectPage, pages, page => {
        currentProjectPage = page;
        renderProjectsPage();
        document.getElementById('projects-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

let publicationsLoaded = false;

function renderPubCard(p) {
    const titleEl = p.link
        ? `<a class="pub-title" href="${p.link}" target="_blank" rel="noopener">${p.title}</a>`
        : `<span class="pub-title">${p.title}</span>`;
    return `<div class="pub-item">
        <div class="pub-year">${p.year}</div>
        <div class="pub-body">
            ${titleEl}
            <div class="pub-venue">${p.venue}</div>
            <div class="pub-meta"><span class="tag tag-${p.role_color}">${p.role}</span></div>
        </div>
    </div>`;
}

function renderPubsPage() {
    const list = document.getElementById('publications-list');
    if (!list) return;
    const pages = Math.max(1, Math.ceil(allPubs.length / PAGE_SIZE));
    if (currentPubPage >= pages) currentPubPage = 0;
    const slice = allPubs.slice(currentPubPage * PAGE_SIZE, (currentPubPage + 1) * PAGE_SIZE);
    list.innerHTML = slice.map(renderPubCard).join('');
    renderPagination('pubs-pagination', currentPubPage, pages, page => {
        currentPubPage = page;
        renderPubsPage();
    });
}

async function loadPublications() {
    if (publicationsLoaded) return;
    publicationsLoaded = true;
    const list = document.getElementById('publications-list');
    if (!list) return;
    try {
        allPubs = await fetch('content/work/publications.json').then(r => r.json());
        renderPubsPage();
    } catch {}
}

// ── CONTENT: STACK ORBIT ──
let stackOrbitLoaded = false;

function buildOrbitIcon(item) {
    const fb  = item.text || item.name.slice(0, 3).toUpperCase();
    const src = item.slug
        ? `https://cdn.simpleicons.org/${item.slug}/${item.hex || 'ffffff'}`
        : item.url || null;
    if (src) return `<img class="orbit-badge-icon" src="${src}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='${fb}'">`;
    return `<span>${fb}</span>`;
}

async function loadStackOrbit() {
    if (stackOrbitLoaded) return;
    stackOrbitLoaded = true;
    const scene = document.getElementById('orbit-scene');
    if (!scene) return;
    try {
        const { inner, middle, outer } = await fetch('content/work/stack.json').then(r => r.json());
        const rings = [
            { items: inner,  cls: 'in',  anim: 'orb-in',  dur: 22 },
            { items: middle, cls: 'md',  anim: 'orb-md',  dur: 36 },
            { items: outer,  cls: 'out', anim: 'orb-out', dur: 54 },
        ];
        const frag = document.createDocumentFragment();
        for (const ring of rings) {
            (ring.items || []).forEach((item, i) => {
                const div = document.createElement('div');
                div.className = `orbit-item orbit-item--${ring.cls}`;
                div.style.animation = `${ring.anim}-${i} ${ring.dur}s linear infinite`;
                div.innerHTML = `<div class="orbit-node">
                    <div class="orbit-badge">${buildOrbitIcon(item)}</div>
                    <span class="orbit-label">${item.name}</span>
                </div>`;
                frag.appendChild(div);
            });
        }
        scene.appendChild(frag);
    } catch {}
}

// ── CONTENT: CERTIFICATIONS ──
let certificationsLoaded = false;

async function loadCertifications() {
    if (certificationsLoaded) return;
    certificationsLoaded = true;
    const grid = document.getElementById('cert-grid');
    if (!grid) return;
    try {
        const certs = await fetch('content/work/certifications.json').then(r => r.json());
        grid.innerHTML = certs.map(cert => {
            const src = cert.icon_slug
                ? `https://cdn.simpleicons.org/${cert.icon_slug}/${cert.icon_hex || 'ffffff'}`
                : cert.icon_url || '';
            const iconHtml = src
                ? `<img class="cert-card-icon" src="${src}" alt="${cert.issuer}" loading="lazy" onerror="this.style.display='none'">`
                : '';
            return `<a class="cert-card" href="${cert.link}" target="_blank" rel="noopener">
                ${iconHtml}
                <div class="cert-card-name">${cert.name}</div>
                <div class="cert-card-meta">${cert.issuer} · ${cert.date}</div>
            </a>`;
        }).join('');
    } catch {}
}

// ── CONTENT: WRITEUPS ──
function renderWriteupCard(slug, meta) {
    const tags = (meta.tags || []).map(t =>
        `<span class="tag tag-${t.color}">${t.label}</span>`).join('');
    const thumb = meta.youtube
        ? `<img src="https://img.youtube.com/vi/${meta.youtube}/hqdefault.jpg" alt="" loading="lazy"><span class="wu-thumb-play">▶</span>`
        : '';
    return `<div class="wu-card" data-writeup="${slug}">
        <div class="wu-card-thumb">${thumb}</div>
        <div class="wu-card-body">
            <div class="wu-card-kicker">${tags}</div>
            <div class="wu-card-title">${meta.title || ''}</div>
            <p class="wu-card-desc">${meta.subtitle || ''}</p>
        </div>
    </div>`;
}

function renderWriteupDetail(meta, bodyHtml) {
    const tags = (meta.tags || []).map(t =>
        `<span class="tag tag-${t.color}">${t.label}</span>`).join('');
    const demo = meta.youtube ? `
        <div class="writeup-demo">
            <div class="writeup-section-label">// demo</div>
            <div class="writeup-video-wrap yt-facade" data-vid="${meta.youtube}">
                <img class="yt-thumb" src="https://img.youtube.com/vi/${meta.youtube}/hqdefault.jpg" alt="demo" loading="lazy">
                <button class="yt-play-btn" aria-label="Play video">&#9654;</button>
            </div>
        </div>` : '';
    const links = [
        meta.github ? `<a class="writeup-link" href="${meta.github}" target="_blank" rel="noopener">code ↗</a>` : '',
        meta.demo   ? `<a class="writeup-link writeup-link--demo" href="${meta.demo}" target="_blank" rel="noopener">demo ▶</a>` : '',
    ].filter(Boolean).join('');
    return `<button class="wu-back">← writeups</button>
        <article class="writeup">
            <div class="writeup-header">
                <div class="writeup-kicker">${tags}</div>
                <h2 class="writeup-title">${meta.title || ''}</h2>
                <p class="writeup-subtitle">${meta.subtitle || ''}</p>
            </div>
            <div class="writeup-body">${bodyHtml}</div>
            ${demo}
            ${links ? `<div class="writeup-footer-links">${links}</div>` : ''}
        </article>`;
}

function showWriteupIndex() {
    const container = document.getElementById('writeup-detail-container');
    if (container) container.style.display = 'none';
    const index = document.getElementById('writeup-index');
    if (index) index.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showWriteupDetailView() {
    const index = document.getElementById('writeup-index');
    if (index) index.style.display = 'none';
    const container = document.getElementById('writeup-detail-container');
    if (container) container.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderWriteupsPage() {
    const index = document.getElementById('writeup-index');
    if (!index) return;
    const pages = Math.max(1, Math.ceil(allWriteups.length / PAGE_SIZE));
    if (currentWriteupPage >= pages) currentWriteupPage = 0;
    const slice = allWriteups.slice(currentWriteupPage * PAGE_SIZE, (currentWriteupPage + 1) * PAGE_SIZE);
    index.innerHTML = slice.map(w => renderWriteupCard(w.slug, w.meta)).join('');
    index.querySelectorAll('.wu-card').forEach(card =>
        card.addEventListener('click', () => {
            const wu = allWriteups.find(w => w.slug === card.dataset.writeup);
            if (!wu) return;
            const container = document.getElementById('writeup-detail-container');
            container.innerHTML = renderWriteupDetail(wu.meta, renderWriteupSections(wu.body));
            container.querySelector('.wu-back')?.addEventListener('click', () => history.back());
            initYtFacades(container);
            history.pushState({ writeup: wu.slug }, '');
            showWriteupDetailView();
        })
    );
    renderPagination('writeups-pagination', currentWriteupPage, pages, page => {
        currentWriteupPage = page;
        renderWriteupsPage();
    });
}

async function loadWriteups() {
    if (blogsLoaded) { showWriteupIndex(); return; }
    blogsLoaded = true;
    const index = document.getElementById('writeup-index');
    try {
        const slugs = await fetch('content/work/writeups/manifest.json').then(r => r.json());
        allWriteups = await Promise.all(slugs.map(async slug => {
            const text           = await fetch(`content/work/writeups/${slug}.md`).then(r => r.text());
            const { meta, body } = parseFrontmatter(text);
            return { slug, meta, body };
        }));
        renderWriteupsPage();
    } catch {
        index.innerHTML = '<p class="ent-empty">couldn\'t load writeups — run via local server, not file://</p>';
    }
    window.addEventListener('popstate', () => {
        if (currentSection === 'blogs') showWriteupIndex();
    });
}

// ── CONTENT: PROJECTS ──
function renderProjectCard(slug, meta) {
    const tags  = (meta.tags || []).map(t =>
        `<span class="tag tag-${t.color}">${t.label}</span>`).join('');
    const thumbSrc = meta.youtube
        ? `https://img.youtube.com/vi/${meta.youtube}/hqdefault.jpg`
        : meta.image || null;
    const thumb = thumbSrc
        ? `<div class="project-card-thumb">
               <img src="${thumbSrc}" alt="" loading="lazy" onerror="this.parentElement.style.display='none'">
               ${meta.youtube ? '<span class="wu-thumb-play">▶</span>' : ''}
           </div>` : '';
    const links = [
        meta.confidential
            ? `<span class="project-link project-link--confidential">code — private</span>`
            : meta.github
                ? `<a class="project-link" href="${meta.github}" target="_blank" rel="noopener">code ↗</a>`
                : '',
        meta.demo ? `<a class="project-link project-link--demo" href="${meta.demo}" target="_blank" rel="noopener">demo ▶</a>` : '',
    ].filter(Boolean).join('');

    return `<div class="project-card" data-project="${slug}" style="cursor:pointer">
        ${thumb}
        <div class="project-card-header"><div class="project-name">${meta.title}</div></div>
        ${tags ? `<div class="tags project-card-tags">${tags}</div>` : ''}
        <p class="project-desc">${meta.desc || ''}</p>
        <div class="project-card-footer">
            ${links ? `<div class="project-links">${links}</div>` : ''}
        </div>
    </div>`;
}

function renderProjectDetail(meta, bodyHtml) {
    const tags = (meta.tags || []).map(t =>
        `<span class="tag tag-${t.color}">${t.label}</span>`).join('');
    const demo = meta.youtube ? `
        <div class="writeup-demo">
            <div class="writeup-section-label">// demo</div>
            <div class="writeup-video-wrap yt-facade" data-vid="${meta.youtube}">
                <img class="yt-thumb" src="https://img.youtube.com/vi/${meta.youtube}/hqdefault.jpg" alt="demo" loading="lazy">
                <button class="yt-play-btn" aria-label="Play video">&#9654;</button>
            </div>
        </div>` : '';
    const footerLinks = [
        meta.confidential
            ? `<span class="writeup-link" style="opacity:0.5;cursor:default">code — private</span>`
            : meta.github
                ? `<a class="writeup-link" href="${meta.github}" target="_blank" rel="noopener">code ↗</a>`
                : '',
        meta.demo ? `<a class="writeup-link writeup-link--demo" href="${meta.demo}" target="_blank" rel="noopener">demo ▶</a>` : '',
    ].filter(Boolean).join('');
    return `<button class="wu-back">← projects</button>
        <article class="writeup">
            <div class="writeup-header">
                <h2 class="writeup-title">${meta.title}</h2>
                ${tags ? `<div class="writeup-kicker">${tags}</div>` : ''}
                ${meta.desc ? `<p class="writeup-subtitle">${meta.desc}</p>` : ''}
            </div>
            <div class="writeup-body">${bodyHtml}</div>
            ${demo}
            ${footerLinks ? `<div class="writeup-footer-links">${footerLinks}</div>` : ''}
        </article>`;
}

function showProjectIndex() {
    document.getElementById('project-detail-container').style.display  = 'none';
    document.getElementById('projects-grid').style.display             = '';
    const fw = document.querySelector('.project-filter-wrap');
    if (fw) fw.style.display = '';
    document.getElementById('projects-pagination').style.display       = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showProjectDetailView() {
    document.getElementById('projects-grid').style.display             = 'none';
    const fw = document.querySelector('.project-filter-wrap');
    if (fw) fw.style.display = 'none';
    document.getElementById('projects-pagination').style.display       = 'none';
    document.getElementById('project-detail-container').style.display  = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadProjects() {
    if (projectsLoaded) return;
    projectsLoaded = true;
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    try {
        // Load filter definitions from JSON (overrides hardcoded defaults if present)
        try {
            const r = await fetch('content/work/project-filters.json', { cache: 'no-store' });
            if (r.ok) projectFilters = await r.json();
        } catch {}

        const slugs = await fetch('content/work/projects/manifest.json', { cache: 'no-store' }).then(r => r.json());
        allProjects = await Promise.all(slugs.map(async slug => {
            const text           = await fetch(`content/work/projects/${slug}.md`, { cache: 'no-store' }).then(r => r.text());
            const { meta, body } = parseFrontmatter(text);
            return { slug, meta, body };
        }));
        renderFilterBar();
        renderProjectsPage();
        window.addEventListener('popstate', () => {
            if (currentSection === 'projects') showProjectIndex();
        });
    } catch(e) {
        console.error('loadProjects:', e);
        grid.innerHTML = `<p class="ent-empty">error: ${e?.message || e}</p>`;
    }
}

// ── YOUTUBE FACADE ──
function initYtFacades(root = document) {
    root.querySelectorAll('.yt-facade').forEach(wrap => {
        wrap.addEventListener('click', () => {
            const iframe = document.createElement('iframe');
            iframe.className = 'writeup-video';
            iframe.src = `https://www.youtube.com/embed/${wrap.dataset.vid}?autoplay=1`;
            iframe.title = 'YouTube video player';
            iframe.frameBorder = '0';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
            iframe.allowFullscreen = true;
            wrap.innerHTML = '';
            wrap.appendChild(iframe);
        });
    });
}

// ── SECTION SWITCHING ──
function switchSection(sectionId) {
    currentSection = sectionId;

    document.querySelectorAll(".section-panel").forEach(p =>
        p.classList.toggle("active", p.id === "panel-" + sectionId)
    );
    document.querySelectorAll(".sidebar-link").forEach(link =>
        link.classList.toggle("active", link.dataset.section === sectionId)
    );

    if (sectionId === "about") {
        document.querySelectorAll(".about-bio").forEach(bio =>
            bio.classList.toggle("active", bio.dataset.mode === currentMode)
        );
        if (currentMode === "work")     loadWorkAbout();
        if (currentMode === "personal") loadPersonalAbout();
    }
    if (sectionId === "watchlist" && !entertainmentLoaded) {
        entertainmentLoaded = true;
        loadEntertainment();
    }
    if (sectionId === "stack") {
        if (!stackLoaded) { stackLoaded = true; fetchCodolio(); }
        loadStackOrbit();
        loadCertifications();
    }
    if (sectionId === "publications") loadPublications();
    if (sectionId === "posts")    loadPosts();
    if (sectionId === "blogs")    loadWriteups();
    if (sectionId === "projects") { loadProjects(); showProjectIndex(); }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── MODE SWITCHING ──
function switchMode(mode) {
    currentMode = mode;
    document.querySelectorAll(".mode-btn").forEach(btn =>
        btn.classList.toggle("active", btn.dataset.mode === mode)
    );
    document.querySelectorAll(".sidebar-links").forEach(g =>
        g.classList.toggle("active", g.dataset.mode === mode)
    );
    switchSection("about");
    restartTypewriter(mode);
    if (mode === "personal") loadPersonalAbout();
}

// ── LISTENERS ──
document.querySelectorAll(".mode-btn").forEach(btn =>
    btn.addEventListener("click", () => switchMode(btn.dataset.mode))
);
document.querySelectorAll(".sidebar-link").forEach(link =>
    link.addEventListener("click", () => switchSection(link.dataset.section))
);

// ── SCROLL TO TOP ──
const scrollTopBtn = document.getElementById('scroll-top-btn');
window.addEventListener('scroll', () => {
    scrollTopBtn?.classList.toggle('visible', window.scrollY > 80);
}, { passive: true });
scrollTopBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── NAV BRAND + AVATAR → ABOUT ──
document.getElementById('nav-brand')?.addEventListener('click', e => {
    e.preventDefault();
    switchSection('about');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
document.getElementById('sidebar-avatar-btn')?.addEventListener('click', () => {
    switchSection('about');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── INIT ──
// ── DOCK LINKS ──
async function loadDockLinks() {
    try {
        const links = await fetch('content/work/dock-links.json').then(r => r.json());
        Object.entries(links).forEach(([key, url]) => {
            ['dock-', 'sidebar-'].forEach(prefix => {
                const el = document.getElementById(prefix + key);
                if (!el) return;
                if (url) { el.href = url; el.style.display = ''; }
                else      { el.style.display = 'none'; }
            });
        });
    } catch {}
}

document.addEventListener("DOMContentLoaded", () => {
    timerId = setTimeout(tick, 500);
    loadWorkAbout();
    loadDockLinks();
    initSidebarToggle();
});
