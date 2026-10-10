// ---------------------------------------------------------------------------
// Site config — edit these, nothing else needs to change.
// ---------------------------------------------------------------------------
const CONFIG = {
	live: false, // true → "Now live" everywhere
	launchAt: null, // ISO date string, e.g. '2026-12-01T16:00:00Z' → shows a countdown
	launchLabel: 'Launching in',
	liveLabel: 'Now live',
	soonLabel: 'Beta closed. Launching soon',
	contractAddress: '', // optional; shows a click-to-copy chip under the timer
	links: {
		docs: 'docs.html',
		x: '#',
		telegram: '#',
		articles: '#',
		email: 'mailto:hello@example.com',
		compliance: 'compliance.html'
	}
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const coarse = matchMedia('(hover: none), (pointer: coarse)').matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Links ---------------------------------------------------------------------
$$('[data-link]').forEach((a) => {
	const href = CONFIG.links[a.dataset.link];
	a.href = href;
	if (!/^https?:/.test(href)) a.removeAttribute('target');
});
$$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));


// Toast ---------------------------------------------------------------------
let toastTimer;
function toast(msg) {
	const t = $('#toast');
	t.textContent = msg;
	t.classList.add('is-on');
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => t.classList.remove('is-on'), 1800);
}

// Header: menu + theme follows the section underneath -----------------------
const header = $('#header');
const menu = $('#menu');
const toggle = $('#menuToggle');
function setMenu(open) {
	header.classList.toggle('is-open', open);
	menu.hidden = !open;
	toggle.setAttribute('aria-expanded', open);
	toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
toggle.addEventListener('click', () => setMenu(menu.hidden));
document.addEventListener('click', (e) => !header.contains(e.target) && setMenu(false));
document.addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));
menu.addEventListener('click', (e) => e.target.closest('a') && setMenu(false));

// Launch status, shared by the menu on every page ---------------------------
function launchState() {
	const target = CONFIG.launchAt ? new Date(CONFIG.launchAt).getTime() : null;
	const left = target ? Math.ceil((target - Date.now()) / 1000) : null;
	const live = CONFIG.live || (left !== null && left <= 0);
	return { target, left, live, counting: !live && left !== null };
}
function syncStatus() {
	const { live } = launchState();
	$$('[data-status-text]').forEach((el) => (el.textContent = live ? CONFIG.liveLabel : CONFIG.soonLabel));
	$$('[data-status-dot]').forEach((el) => el.classList.toggle('is-live', live));
}
syncStatus();
setInterval(syncStatus, 1000);
