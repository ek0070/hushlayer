// Docs content. Each page is { id, group, title, html } or { id, group, title, todo }.
// A page with `todo` renders as "not written yet" with a note on what it needs to cover.
// Replace `todo` with `html` once you have the real text for your product.
const DOCS = [
	{
		id: 'welcome',
		group: 'Getting started',
		title: 'Welcome to Hushlayer',
		html: `
			<p>Hushlayer is a privacy layer for crypto, built to work from the wallet you already use.</p>
			<p class="note">Hushlayer has not launched. These docs are a skeleton: the structure is in place, and most pages are waiting for the details of the finished product.</p>
			<h2 id="what-it-is-for">What it is for</h2>
			<ul>
				<li>Keeping transfers, swaps and bridging private.</li>
				<li>Doing that from your existing wallet, with no new seed phrase.</li>
				<li>Leaving your funds under your own control throughout.</li>
			</ul>
			<h2 id="start-here">Start here</h2>
			<ul>
				<li><a href="#getting-started">Get started</a></li>
				<li><a href="#fees">Fees</a></li>
				<li><a href="#privacy">What stays private</a></li>
				<li><a href="#faq">FAQ</a></li>
			</ul>`
	},
	{ id: 'getting-started', group: 'Getting started', title: 'Get started', todo: 'The first-run steps: where the app lives, how to connect a wallet, and how to make a first deposit.' },
	{ id: 'networks', group: 'Getting started', title: 'Networks and addresses', todo: 'Which networks are supported, their chain IDs, and the contract addresses on each.' },

	{ id: 'deposit', group: 'Using Hushlayer', title: 'Deposit', todo: 'How a deposit works, which assets are accepted, minimums, and how long it takes to be credited.' },
	{ id: 'send', group: 'Using Hushlayer', title: 'Send privately', todo: 'How to send to another account, what the recipient needs, and what appears on-chain.' },
	{ id: 'withdraw', group: 'Using Hushlayer', title: 'Withdraw', todo: 'How to withdraw to an address, the timing options, and any limits.' },
	{ id: 'swap', group: 'Using Hushlayer', title: 'Swap', todo: 'Which asset pairs can be swapped, where liquidity comes from, and how slippage is handled.' },
	{ id: 'bridge', group: 'Using Hushlayer', title: 'Bridge', todo: 'Which networks can be bridged to, which bridge is used, and the expected wait.' },
	{ id: 'gas', group: 'Using Hushlayer', title: 'Gas balance', todo: 'How gas is paid for private actions and how to top it up.' },

	{ id: 'fees', group: 'Fees', title: 'Fees', todo: 'The fee for each action, with the actual numbers.' },

	{ id: 'privacy', group: 'Privacy and safety', title: 'What stays private', todo: 'Exactly what an outside observer can and cannot see, and what the operator can see.' },
	{ id: 'deposit-checks', group: 'Privacy and safety', title: 'Deposit checks', todo: 'Whether deposits are screened, by whom, and what happens to a deposit that fails.' },
	{ id: 'security', group: 'Privacy and safety', title: 'Security', todo: 'Audits (with links), who holds admin keys, upgrade controls, and how to report a vulnerability.' },

	{ id: 'faq', group: 'More', title: 'FAQ', todo: 'Short answers to the questions users actually ask.' },
	{
		id: 'project-roadmap',
		group: 'More',
		title: 'Project roadmap',
		html: `
			<p>Where Hushlayer is headed. These are goals, not commitments or dates.</p>
			<h2 id="every-network">Every network</h2>
			<p>Reach beyond EVM chains, to the likes of Solana and Bitcoin, through proxying.</p>
			<h2 id="programmable-privacy">Programmable privacy</h2>
			<p>Expressive spending scripts and zero-knowledge account abstraction.</p>
			<h2 id="autopilot">Privacy on autopilot</h2>
			<p>Swaps, bridges and routing chosen for you to keep the trail cold.</p>
			<h2 id="default">Privacy as the default</h2>
			<p>For everyone who uses web3, not only the people who study it.</p>`
	}
];
