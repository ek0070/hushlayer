// Compliance page data. Everything on the page is rendered from this file.
// Only put in facts that are true of your own deployment: addresses you control,
// a mailbox you answer, and processes you actually run.
const COMPLIANCE = {
	// Shown as the law-enforcement contact. Leave empty until the mailbox exists.
	contactEmail: '',
	// Sentences describing how you handle requests. Empty = "not published yet".
	contactPolicy: [],

	networks: [
		// {
		// 	name: 'Ethereum mainnet',
		// 	chainId: 1,
		// 	explorer: 'https://etherscan.io', // used for address and block links
		// 	explorerName: 'Etherscan',
		// 	deployBlock: 0,
		// 	contracts: [{ name: 'Pool (proxy)', tag: 'Proxy', note: 'The address users deposit to and withdraw from.', address: '0x…' }],
		// 	operational: [{ name: 'Deployer', note: 'Deployed the pool.', address: '0x…' }],
		// 	assets: [{ symbol: 'ETH', type: 'Native' }, { symbol: 'USDC', type: 'ERC-20', address: '0x…' }]
		// }
	],

	// Free-text sections. Each is { id, title, html }. Empty html = "not published yet".
	sections: [
		{ id: 'screening', title: 'How deposits are screened', html: '' },
		{ id: 'bridge', title: 'Bridge', html: '' },
		{ id: 'security', title: 'Security', html: '' },
		{ id: 'ownership', title: 'Proof of ownership', html: '' }
	]
};
