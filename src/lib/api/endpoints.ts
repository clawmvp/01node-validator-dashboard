// Public API/RPC Endpoints for each blockchain network
// These are public endpoints - for production, consider using your own nodes

export const ENDPOINTS = {
  // === COSMOS ECOSYSTEM LCD/REST ENDPOINTS ===
  cosmos: {
    lcd: 'https://cosmoshub.api.kjnodes.com',
    rpc: 'https://cosmoshub-rpc.publicnode.com',
    chainId: 'cosmoshub-4',
  },
  osmosis: {
    lcd: 'https://lcd.osmosis.zone',
    rpc: 'https://rpc.osmosis.zone',
    chainId: 'osmosis-1',
  },
  celestia: {
    lcd: 'https://celestia-rest.publicnode.com',
    rpc: 'https://celestia-rpc.publicnode.com',
    chainId: 'celestia',
  },
  secret: {
    lcd: 'https://secretnetwork-api.lavenderfive.com',
    rpc: 'https://secretnetwork-rpc.lavenderfive.com',
    chainId: 'secret-4',
  },
  persistence: {
    lcd: 'https://rest.core.persistence.one',
    rpc: 'https://rpc.core.persistence.one',
    chainId: 'core-1',
  },
  agoric: {
    lcd: 'https://main.api.agoric.net',
    rpc: 'https://main.rpc.agoric.net',
    chainId: 'agoric-3',
  },
  regen: {
    lcd: 'https://regen-api.polkachu.com',
    rpc: 'https://regen-rpc.polkachu.com',
    chainId: 'regen-1',
  },
  nibiru: {
    lcd: 'https://nibiru-api.polkachu.com',
    rpc: 'https://nibiru-rpc.polkachu.com',
    chainId: 'cataclysm-1',
  },
  dymension: {
    lcd: 'https://dymension-rest.publicnode.com',
    rpc: 'https://dymension-rpc.publicnode.com',
    chainId: 'dymension_1100-1',
    decimals: 18, // adym uses 18 decimals
  },
  neutron: {
    lcd: 'https://rest-lb.neutron.org',
    rpc: 'https://rpc-lb.neutron.org',
    chainId: 'neutron-1',
  },
  union: {
    lcd: 'https://union-api.polkachu.com',
    rpc: 'https://union-rpc.polkachu.com',
    chainId: 'union-1',
    decimals: 18, // au uses 18 decimals
  },
  lava: {
    lcd: 'https://lava-api.polkachu.com',
    rpc: 'https://lava-rpc.polkachu.com',
    chainId: 'lava-mainnet-1',
  },
  xpla: {
    lcd: 'https://dimension-lcd.xpla.dev',
    rpc: 'https://dimension-rpc.xpla.dev',
    chainId: 'dimension_37-1',
  },
  
  // === SOLANA ===
  solana: {
    rpc: 'https://api.mainnet-beta.solana.com',
    // Backup RPCs
    rpcBackup: [
      'https://solana-mainnet.g.alchemy.com/v2/demo',
      'https://rpc.ankr.com/solana',
    ],
  },
  
  // === SUI ===
  sui: {
    rpc: 'https://fullnode.mainnet.sui.io:443',
    rpcBackup: 'https://sui-mainnet.nodeinfra.com',
  },
  
  // === NEAR ===
  near: {
    rpc: 'https://rpc.mainnet.near.org',
    rpcBackup: 'https://near.lava.build',
  },
  
  // === SKALE ===
  skale: {
    // SKALE uses Ethereum mainnet contracts
    // Data from Staking Rewards API or direct contract calls
    stakingContract: '0x00c83aeCC790e8a4453e5dD3B0B4b3680501a7A7',
  },
  
  // === PRICE APIS ===
  coingecko: {
    base: 'https://api.coingecko.com/api/v3',
  },
} as const;

// Validator addresses for 01node
export const VALIDATOR_ADDRESSES = {
  cosmos: 'cosmosvaloper17mggn4znyeyg25wd7498qxl7r2jhgue8u4qjcq',
  osmosis: 'osmovaloper17mggn4znyeyg25wd7498qxl7r2jhgue8td054x',
  celestia: 'celestiavaloper1murrqgqahxevedty0nzqrn5hj434fvffxufxcl',
  secret: 'secretvaloper1larnhgur2ts7hlhphmtk65c3qz6dt52y79szst',
  persistence: 'persistencevaloper1etueaqe9teaamq40pln9xrncwgfns8mtdfr02c',
  agoric: 'agoricvaloper148xd583ya4pjs3g7wj2h2eatsy294azk452k6v',
  regen: 'regenvaloper1xk5hddxck0tevelchlvcq93waqd07antxvksph',
  dymension: 'dymvaloper1ycsjsqqucdyvl2560y7y2yhfjaj0vvta4v7hm3',
  neutron: 'neutronvaloper1rlyy2ltkc9t9s8gp2tmqxk6guggf6h9g6xj26y',
  union: 'unionvaloper1dqsjs63kpahlkfj3x5f9kuryk78uekqdv9z72k',
  lava: 'lava@valoper1askl4xtuwgt9ngll0unjp975fgk954y2fjpdc2',
  nibiru: 'nibivaloper1w26kzhwhely77xup3npfh70tzuc4amtx8j0743',
  xpla: 'xplavaloper1a00g26m9ut98xspcmlz0fmtknfeqmmne3jdr99',
  solana: 'BH7asDZbKkTmT3UWiNfmMVRgQEEpXoVThGPmQfgWwDhg',
  sui: '0x876e2ad4ba0375c7752d24ca47c69e7096e6dbfd82a215612a08f47cffebcfbc',
  near: '01node.poolv1.near',
} as const;

// CoinGecko token IDs for price lookup
export const COINGECKO_IDS: Record<string, string> = {
  cosmos: 'cosmos',
  osmosis: 'osmosis',
  celestia: 'celestia',
  secret: 'secret',
  persistence: 'persistence',
  agoric: 'agoric',
  regen: 'regen',
  dymension: 'dymension',
  neutron: 'neutron-3',
  union: 'union-2',
  lava: 'lava-network',
  nibiru: 'nibiru',
  xpla: 'xpla',
  coreum: 'coreum',
  terra: 'terra-luna-2',
  zetachain: 'zetachain',
  solana: 'solana',
  sui: 'sui',
  near: 'near',
  skale: 'skale',
  map: 'map-protocol',
  babylon: 'babylon',
};
