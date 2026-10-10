// Behaviour for docs.html and compliance.html. Shared helpers come from site.js.
const copyText = (text, msg = 'Copied') => navigator.clipboard.writeText(text).then(() => toast(msg));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Docs: sidebar + hash routing ----------------------------------------------
if (typeof DOCS !== 'undefined') {
	const nav = $('#docsNav');
	const content = $('#docsContent');
	const pager = $('#docsPager');
	const navToggle = $('#docsNavToggle');

	let group = null;
	let list;
	DOCS.forEach((page) => {
		if (page.group !== group) {
			group = page.group;
			nav.insertAdjacentHTML('beforeend', `<h4>${esc(group)}</h4><ul></ul>`);
			list = nav.lastElementChild;
		}
		list.insertAdjacentHTML('beforeend', `<li><a href="#${page.id}" data-doc="${page.id}">${esc(page.title)}</a></li>`);
	});

	function show() {
		const hash = location.hash.slice(1);
		let index = DOCS.findIndex((p) => p.id === hash);
		// a hash that isn't a page is a heading inside the current page
		const anchor = index === -1 && hash && document.getElementById(hash);
		if (anchor) return anchor.scrollIntoView();
		if (index === -1) index = 0;
		const page = DOCS[index];

		const body = page.html || `<div class="note note--todo"><strong>Not written yet.</strong> ${esc(page.todo)}</div>`;
		content.innerHTML = `<h1>${esc(page.title)}</h1>${body}`;
		$('#docsCrumb').textContent = '/ ' + page.title;
		document.title = `${page.title} — Hushlayer Docs`;
		$$('[data-doc]', nav).forEach((a) => a.classList.toggle('is-active', a.dataset.doc === page.id));

		const prev = DOCS[index - 1];
		const next = DOCS[index + 1];
		pager.innerHTML =
			(prev ? `<a href="#${prev.id}"><small>Previous</small>${esc(prev.title)}</a>` : '<span></span>') +
			(next ? `<a href="#${next.id}" class="is-next"><small>Next</small>${esc(next.title)}</a>` : '<span></span>');

		// heading anchors, like "What you can do #"
		$$('h2[id]', content).forEach((h) => h.insertAdjacentHTML('beforeend', ` <a class="anchor" href="#${h.id}" aria-label="Link to this section">#</a>`));
		nav.classList.remove('is-open');
		navToggle.setAttribute('aria-expanded', false);
		scrollTo(0, 0);
	}

	navToggle.addEventListener('click', () => navToggle.setAttribute('aria-expanded', nav.classList.toggle('is-open')));
	window.addEventListener('hashchange', show);
	show();
}

// Compliance: rendered from compliance-data.js ------------------------------
if (typeof COMPLIANCE !== 'undefined') {
	const C = COMPLIANCE;
	const out = $('#compSections');
	const pending = '<p class="note note--todo"><strong>Not published yet.</strong></p>';
	const netId = (n) => n.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
	const allRows = []; // [network, label, address] for the CSV

	const addressRow = (net, item) => {
		if (item.address) allRows.push([net.name, item.name || item.symbol, item.address]);
		return `<li class="addr">
			<div><strong>${esc(item.name || item.symbol)}</strong>${item.tag || item.type ? ` <span class="badge">${esc(item.tag || item.type)}</span>` : ''}
			${item.note ? `<p>${esc(item.note)}</p>` : ''}</div>
			${item.address ? `<code>${esc(item.address)}</code>
			<span class="addr__actions"><button class="chip" data-copy="${esc(item.address)}">Copy</button>
			<a class="chip" href="${esc(net.explorer)}/address/${esc(item.address)}" target="_blank" rel="noopener noreferrer">${esc(net.explorerName || 'Explorer')}</a></span>` : ''}
		</li>`;
	};
	const group = (title, net, items) => (items && items.length ? `<h3>${title}</h3><ul class="addrs">${items.map((i) => addressRow(net, i)).join('')}</ul>` : '');

	const names = C.networks.map((n) => n.name);
	$('#compCrumb').textContent = ['Hushlayer', ...names].join(' · ');
	$('#compLead').textContent = names.length
		? `Hushlayer is deployed on ${names.join(' and ')}. This page lists its on-chain addresses, explains how deposits are handled, and shows how to reach us.`
		: 'Hushlayer has not launched and has nothing deployed on-chain yet. This page will list its contract addresses, explain how deposits are handled, and show how to reach us.';

	let html = `<section id="law-enforcement"><h2>Law enforcement contact</h2>
		${C.contactEmail ? `<p class="addr addr--solo"><code>${esc(C.contactEmail)}</code><button class="chip" data-copy="${esc(C.contactEmail)}">Copy</button></p>` : pending}
		${C.contactPolicy.length ? `<ul class="plain">${C.contactPolicy.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}</section>`;

	html += C.networks.map((n) => `<section id="${netId(n)}"><h2>${esc(n.name)}</h2>
		<p class="meta"><span class="badge">Chain ID ${esc(n.chainId)}</span>${n.deployBlock ? ` <a class="badge" href="${esc(n.explorer)}/block/${esc(n.deployBlock)}" target="_blank" rel="noopener noreferrer">Deployed at block ${esc(n.deployBlock)}</a>` : ''}</p>
		${group('Contract addresses', n, n.contracts)}${group('Operational addresses', n, n.operational)}${group('Accepted assets', n, n.assets)}</section>`).join('');
	if (!C.networks.length) html += `<section id="networks"><h2>Networks and contracts</h2>${pending}</section>`;

	html += C.sections.map((s) => `<section id="${esc(s.id)}"><h2>${esc(s.title)}</h2>${s.html || pending}</section>`).join('');
	out.innerHTML = html;

	$('#compToc').innerHTML = $$('section', out).map((s) => `<a href="#${s.id}">${esc($('h2', s).textContent)}</a>`).join('');
	out.addEventListener('click', (e) => {
		const b = e.target.closest('[data-copy]');
		if (b) copyText(b.dataset.copy);
	});
	$('#compCsv').addEventListener('click', () => {
		if (!allRows.length) return toast('No addresses published yet');
		copyText(['network,label,address', ...allRows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n'), `${allRows.length} addresses copied`);
	});
}
