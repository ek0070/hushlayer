// Landing page behaviour. Shared config, helpers and the header menu live in site.js.

// Loader --------------------------------------------------------------------
window.addEventListener('load', () => setTimeout(() => $('#loader').classList.add('is-done'), 500));

// Header theme follows the section underneath -------------------------------
const sections = $$('[data-section]');
function syncHeaderTheme() {
	const probe = 48;
	const current = sections.find((s) => {
		const r = s.getBoundingClientRect();
		return r.top <= probe && r.bottom > probe;
	});
	if (current) header.dataset.theme = current.dataset.theme;
}

// Launch status + countdown -------------------------------------------------
const pad = (n) => String(n).padStart(2, '0');
function tickTimer() {
	const { target, left, live, counting } = launchState();
	$('#timerLabel').textContent = live ? CONFIG.liveLabel : counting ? CONFIG.launchLabel : 'Launching soon';

	const digits = $('#timerDigits');
	const local = $('#timerLocal');
	digits.hidden = local.hidden = !counting;
	if (counting) {
		const parts = [
			['days', Math.floor(left / 86400)],
			['hrs', Math.floor((left % 86400) / 3600)],
			['min', Math.floor((left % 3600) / 60)],
			['sec', left % 60]
		].filter(([unit, v], i) => i > 0 || v > 0);
		digits.innerHTML = parts.map(([unit, v]) => `<div><b>${pad(v)}</b><small>${unit}</small></div>`).join('');
		local.textContent = 'Your time · ' + new Date(target).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
	}
}
tickTimer();
setInterval(tickTimer, 1000);

if (CONFIG.contractAddress) {
	const chip = $('#addressChip');
	const a = CONFIG.contractAddress;
	chip.hidden = false;
	$('#addressText').textContent = a.length > 14 ? a.slice(0, 6) + '…' + a.slice(-4) : a;
	chip.addEventListener('click', () => navigator.clipboard.writeText(a).then(() => toast('Address copied')));
}

// Hero crowd: figures step aside for the pointer ----------------------------
(function crowd() {
	const canvas = $('#crowd');
	const ctx = canvas.getContext('2d');
	const css = getComputedStyle(document.documentElement);
	const ink = css.getPropertyValue('--ink').trim();
	const accent = css.getPropertyValue('--accent').trim();
	const RADIUS = 120;
	const copy = $('.hero__copy');
	let people = [];
	let w = 0, h = 0, dpr = 1;
	const pointer = { x: -999, y: -999, active: false };
	let visible = true;

	function build() {
		dpr = Math.min(devicePixelRatio || 1, 2);
		w = canvas.clientWidth;
		h = canvas.clientHeight;
		canvas.width = w * dpr;
		canvas.height = h * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		people = [];
		const gap = w < 700 ? 26 : 34;
		const top = h * 0.4;
		// keep the headline block clear
		const cr = copy.getBoundingClientRect(), kr = canvas.getBoundingClientRect();
		const clear = { r: cr.right - kr.left + 30, b: cr.bottom - kr.top + 30 };
		let row = 0;
		for (let y = top; y < h + gap; y += gap * 0.8, row++) {
			// the crowd thins out towards the top
			const density = clamp((y - top) / (h * 0.22), 0.15, 1);
			for (let x = (row % 2) * (gap / 2) - gap; x < w + gap; x += gap) {
				if (Math.random() > density) continue;
				if (x < clear.r && y - 20 < clear.b) continue;
				const hx = x + (Math.random() - 0.5) * 8;
				const hy = y + (Math.random() - 0.5) * 6;
				people.push({ hx, hy, x: hx, y: hy, vx: 0, vy: 0, s: 0.85 + Math.random() * 0.35, you: false });
			}
		}
		// one figure in the middle of the crowd is "you"
		const cx = w * 0.62, cy = top + (h - top) * 0.55;
		let best = null, bd = Infinity;
		for (const p of people) {
			const d = (p.hx - cx) ** 2 + (p.hy - cy) ** 2;
			if (d < bd) { bd = d; best = p; }
		}
		if (best) best.you = true;
		people.sort((a, b) => a.hy - b.hy);
	}

	function figure(p) {
		const s = p.s;
		ctx.beginPath();
		ctx.arc(p.x, p.y - 13 * s, 5 * s, 0, Math.PI * 2);
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(p.x - 8 * s, p.y + 10 * s);
		ctx.quadraticCurveTo(p.x - 8 * s, p.y - 7 * s, p.x, p.y - 7 * s);
		ctx.quadraticCurveTo(p.x + 8 * s, p.y - 7 * s, p.x + 8 * s, p.y + 10 * s);
		ctx.closePath();
		ctx.fill();
	}

	function frame(t) {
		requestAnimationFrame(frame);
		if (!visible) return;
		// without a real pointer, a ghost one wanders through the crowd
		if (!pointer.active && !reduced) {
			pointer.x = w * (0.5 + 0.38 * Math.sin(t / 2300));
			pointer.y = h * (0.72 + 0.14 * Math.sin(t / 1500));
		}
		ctx.clearRect(0, 0, w, h);
		for (const p of people) {
			if (!p.you) {
				const dx = p.x - pointer.x, dy = p.y - pointer.y;
				const d = Math.hypot(dx, dy) || 1;
				if (d < RADIUS) {
					const f = ((RADIUS - d) / RADIUS) * 2.2;
					p.vx += (dx / d) * f;
					p.vy += (dy / d) * f;
				}
				p.vx += (p.hx - p.x) * 0.04;
				p.vy += (p.hy - p.y) * 0.04;
				p.vx *= 0.82;
				p.vy *= 0.82;
				p.x += p.vx;
				p.y += p.vy;
			}
			ctx.fillStyle = p.you ? accent : ink;
			figure(p);
			if (p.you) {
				ctx.strokeStyle = accent;
				ctx.lineWidth = 1.5;
				ctx.beginPath();
				ctx.arc(p.x, p.y - 3, 22 + 3 * Math.sin(t / 400), 0, Math.PI * 2);
				ctx.stroke();
			}
		}
	}

	const hero = canvas.parentElement;
	hero.addEventListener('pointermove', (e) => {
		const r = canvas.getBoundingClientRect();
		pointer.x = e.clientX - r.left;
		pointer.y = e.clientY - r.top;
		pointer.active = true;
	});
	hero.addEventListener('pointerleave', () => (pointer.active = false));
	new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
	new ResizeObserver(build).observe(canvas);
	if (coarse) $('[data-hint]').textContent = 'Drag through the crowd';
	build();
	requestAnimationFrame(frame);
})();

// Keyhole: the door opens as you scroll -------------------------------------
const keyhole = $('#keyhole');
const khShape = $('#khShape');
const khHint = $('#khHint');
const khReveals = $$('[data-reveal]', keyhole);
function syncKeyhole() {
	const r = keyhole.getBoundingClientRect();
	const p = clamp(-r.top / (r.height - innerHeight));
	const open = clamp(p / 0.55);
	const scale = 1 + open * open * open * 60;
	khShape.setAttribute('transform', `translate(50 50) scale(${scale}) translate(-50 -50)`);
	khHint.style.opacity = p > 0.03 ? 0 : 1;
	// once the door is mostly gone the stage reads as a light section
	keyhole.dataset.theme = open > 0.8 ? 'light' : 'dark';
	khReveals.forEach((el, i) => el.classList.toggle('is-in', p > 0.4 + i * 0.16));
}

// Phone demo: two taps ------------------------------------------------------
(function phone() {
	const device = $('#device');
	const cta = $('#deviceCta');
	const wallet = $('#deviceWallet');
	const balance = $('#deviceBalance');
	const badge = $('#deviceBadge');
	const list = $('#deviceTxs');
	const steps = $$('.phone__steps li');
	const TXS = [
		['Sent', '-1.20 ETH', 'to 0x8f3a…c21d'],
		['Swapped', '2,500 USDC', 'for 0.81 ETH'],
		['Bridged', '900 USDC', 'Ethereum → Base'],
		['Received', '+0.35 ETH', 'from 0x44be…9a07']
	];
	const GLYPHS = '▓▒░█#/\\<>*+';
	let state = 0;

	// swap an element's text through a burst of noise
	function scramble(el, to) {
		if (reduced) return (el.textContent = to);
		const from = el.textContent;
		const len = Math.max(from.length, to.length);
		let f = 0;
		const id = setInterval(() => {
			f++;
			el.textContent = [...Array(len)]
				.map((_, i) => (i < f / 2 ? to[i] || '' : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
				.join('');
			if (f / 2 >= len) { clearInterval(id); el.textContent = to; }
		}, 28);
	}

	function render(animate) {
		device.dataset.state = state;
		steps.forEach((li, i) => {
			li.classList.toggle('is-done', state > i);
			li.classList.toggle('is-active', state === i);
		});
		const set = (el, text) => (animate ? scramble(el, text) : (el.textContent = text));
		if (state === 0) {
			wallet.textContent = 'No wallet connected';
			balance.textContent = '—';
			badge.textContent = 'Public';
			list.innerHTML = '';
			cta.textContent = '1 · Connect wallet';
			return;
		}
		if (state === 1) {
			wallet.textContent = '0x71c9…e4b2';
			balance.textContent = '4.82 ETH';
			badge.textContent = 'Public';
			list.innerHTML = TXS.map(([a, b, c]) => `<li><span>${a}</span><span>${b}</span><small>${c}</small></li>`).join('');
			cta.textContent = '2 · Switch the shield on';
			return;
		}
		badge.textContent = 'Shielded';
		set(wallet, '0x••••…••••');
		set(balance, '••••• ETH');
		$$('li', list).forEach((li) => {
			set(li.children[0], 'Private transfer');
			set(li.children[1], '•••••');
			set(li.children[2], 'sender, receiver, amount hidden');
		});
		cta.textContent = 'Shielded ✓  ·  Run it again';
	}

	cta.addEventListener('click', () => {
		state = (state + 1) % 3;
		render(true);
	});
	render(false);
})();

// Card carousel -------------------------------------------------------------
(function cards() {
	const track = $('#cardsTrack');
	const cards = $$('.card', track);
	const dots = $('#cardsDots');
	const step = () => cards[1].offsetLeft - cards[0].offsetLeft;
	cards.forEach((card, i) => {
		const b = document.createElement('button');
		b.setAttribute('aria-label', 'Go to card ' + (i + 1));
		b.addEventListener('click', () => track.scrollTo({ left: i * step(), behavior: 'smooth' }));
		dots.append(b);
	});
	const io = new IntersectionObserver(
		(entries) => entries.forEach((e) => dots.children[cards.indexOf(e.target)].classList.toggle('is-active', e.isIntersecting)),
		{ root: track, threshold: 0.6 }
	);
	cards.forEach((c) => io.observe(c));
	$('#cardsPrev').addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
	$('#cardsNext').addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
})();

// Skyline -------------------------------------------------------------------
(function skyline() {
	const el = $('#skyline');
	const n = innerWidth < 700 ? 22 : 48;
	for (let i = 0; i < n; i++) {
		const b = document.createElement('i');
		const wave = 0.5 + 0.5 * Math.sin((i / n) * Math.PI);
		b.style.setProperty('--h', Math.round(18 + wave * 50 + Math.random() * 30) + '%');
		b.style.setProperty('--d', (i * 0.02).toFixed(2) + 's');
		if (Math.random() < 0.1) b.className = 'lit';
		el.append(b);
	}
	new IntersectionObserver(([e]) => e.isIntersecting && el.classList.add('is-in'), { threshold: 0.2 }).observe(el);
})();

// Eyes: they follow you, and shut when you reach for the buttons ------------
(function eyes() {
	const section = $('.eyes');
	const wall = $('#eyesWall');
	const count = Math.ceil(innerWidth / 78) * 2;
	for (let i = 0; i < count; i++) {
		const eye = document.createElement('span');
		eye.className = 'eye';
		eye.innerHTML = '<i></i>';
		wall.append(eye);
	}
	const pupils = $$('.eye i', wall);
	function look(x, y) {
		for (const p of pupils) {
			const r = p.parentElement.getBoundingClientRect();
			const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
			const d = Math.hypot(dx, dy) || 1;
			const reach = Math.min(16, d / 12);
			p.style.transform = `translate(${(dx / d) * reach}px, ${(dy / d) * reach}px)`;
		}
	}
	let queued = false;
	window.addEventListener('pointermove', (e) => {
		if (queued) return;
		queued = true;
		requestAnimationFrame(() => {
			queued = false;
			if (section.getBoundingClientRect().top < innerHeight) look(e.clientX, e.clientY);
		});
	});
	$$('.btn', section).forEach((b) => {
		b.addEventListener('pointerenter', () => section.classList.add('is-shut'));
		b.addEventListener('pointerleave', () => section.classList.remove('is-shut'));
	});
	// random blinks
	if (!reduced) {
		setInterval(() => {
			const eye = pupils[(Math.random() * pupils.length) | 0].parentElement;
			eye.style.transform = 'scaleY(0.06)';
			setTimeout(() => (eye.style.transform = ''), 160);
		}, 700);
	}
})();

// Scroll loop ---------------------------------------------------------------
let ticking = false;
function onScroll() {
	if (ticking) return;
	ticking = true;
	requestAnimationFrame(() => {
		ticking = false;
		syncKeyhole();
		syncHeaderTheme();
	});
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();
