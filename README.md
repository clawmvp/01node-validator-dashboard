# 01node Validator Dashboard

Analytics dashboard for **01node** validator operations across 35+ blockchain networks.

**Live Demo:** [https://01node-validator-dashboard.vercel.app](https://01node-validator-dashboard.vercel.app)

![Dashboard Preview](https://via.placeholder.com/1200x630/1a1a2e/ffffff?text=01node+Validator+Dashboard)

## Features

- **35+ Networks Tracked** - Cosmos ecosystem, Solana, SUI, Ethereum, NEAR, and more
- **APR Comparison** - Visual comparison of rewards across all networks
- **Stake Distribution** - See how stake is distributed across ecosystems
- **Profitability Analytics** - Track revenue vs infrastructure costs (coming soon)
- **Dark/Light Mode** - Full theme support
- **Responsive Design** - Works on desktop and mobile
- **Real-time Data** - API integrations for live data (coming soon)

## Networks Included

### Cosmos Ecosystem
Cosmos Hub (ATOM), Osmosis (OSMO), Celestia (TIA), Dymension (DYM), Juno (JUNO), Secret Network (SCRT), Quicksilver (QCK), Persistence (XPRT), Regen (REGEN), Agoric (BLD), Nomic (NOM), Sentinel (DVPN), and 15+ more

### Other Networks
- **Solana** (SOL)
- **SUI** (SUI)
- **Ethereum/EigenLayer** (ETH)
- **NEAR Protocol** (NEAR)
- **Gnosis Chain** (GNO)
- **The Graph** (GRT)
- **SKALE** (SKL)
- **Oasis** (ROSE)
- And more...

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts
- **State:** React hooks
- **Deployment:** Vercel

## Getting Started

```bash
# Clone the repository
git clone https://github.com/clawmvp/01node-validator-dashboard.git

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Configuration

### Adding Infrastructure Costs

To enable profitability calculations, edit the network data in `src/data/networks.ts`:

```typescript
{
  id: 'cosmos',
  name: 'Cosmos Hub',
  // ... other fields
  infrastructureCost: 500, // Monthly cost in USD
}
```

### API Integrations (Coming Soon)

The dashboard supports integration with:
- **Mintscan API** - Cosmos ecosystem data
- **Solana Beach API** - Solana validator data
- **Suiscan API** - SUI network data
- **CoinGecko API** - Token prices

## Validator Addresses

| Network | Validator Address |
|---------|-------------------|
| Cosmos | `cosmosvaloper17mggn4znyeyg25wd7498qxl7r2jhgue8u4qjcq` |
| Solana | `BH7asDZbKkTmT3UWiNfmMVRgQEEpXoVThGPmQfgWwDhg` |
| SUI | `0x876e2ad4ba0375c7752d24ca47c69e7096e6dbfd82a215612a08f47cffebcfbc` |
| Osmosis | `osmovaloper17mggn4znyeyg25wd7498qxl7r2jhgue8td054x` |

See `src/data/networks.ts` for all validator addresses.

## Roadmap

- [ ] Live data from blockchain APIs
- [ ] Token price integration
- [ ] Profitability calculator with custom costs
- [ ] Historical data and trends
- [ ] Export reports (PDF/CSV)
- [ ] Alerts and notifications
- [ ] Multi-validator support

## Inspiration

Design inspired by:
- [Observatory.zone](https://observatory.zone) - Cosmos validator infrastructure analytics
- [Mintscan](https://www.mintscan.io) - Cosmos blockchain explorer

## Links

- **01node Website:** [https://01node.com](https://01node.com)
- **Mintscan Profile:** [https://www.mintscan.io/visualization/validators/01node](https://www.mintscan.io/visualization/validators/01node)
- **Staking Rewards:** [https://www.stakingrewards.com/provider/01node](https://www.stakingrewards.com/provider/01node)

## License

MIT License - Feel free to use and modify for your own validator operations.

---

Built with ❤️ for the 01node team
