// Public API/RPC Endpoints for each blockchain network
// Based on https://polkachu.com/validator_entities/7BDD4C2E94392626

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
  babylon: {
    lcd: 'https://babylon-api.polkachu.com',
    rpc: 'https://babylon-rpc.polkachu.com',
    chainId: 'bbn-1',
  },
  terra: {
    lcd: 'https://terra-api.polkachu.com',
    rpc: 'https://terra-rpc.polkachu.com',
    chainId: 'phoenix-1',
  },
  union: {
    lcd: 'https://union-api.polkachu.com',
    rpc: 'https://union-rpc.polkachu.com',
    chainId: 'union-1',
    decimals: 18,
  },
  neutron: {
    lcd: 'https://rest-lb.neutron.org',
    rpc: 'https://rpc-lb.neutron.org',
    chainId: 'neutron-1',
  },
  xpla: {
    lcd: 'https://dimension-lcd.xpla.dev',
    rpc: 'https://dimension-rpc.xpla.dev',
    chainId: 'dimension_37-1',
  },
  agoric: {
    lcd: 'https://main.api.agoric.net',
    rpc: 'https://main.rpc.agoric.net',
    chainId: 'agoric-3',
  },
  zetachain: {
    lcd: 'https://zetachain-api.polkachu.com',
    rpc: 'https://zetachain-rpc.polkachu.com',
    chainId: 'zetachain_7000-1',
    decimals: 18,
  },
  dymension: {
    lcd: 'https://dymension-rest.publicnode.com',
    rpc: 'https://dymension-rpc.publicnode.com',
    chainId: 'dymension_1100-1',
    decimals: 18,
  },
  nolus: {
    lcd: 'https://nolus-api.polkachu.com',
    rpc: 'https://nolus-rpc.polkachu.com',
    chainId: 'pirin-1',
  },
  seda: {
    lcd: 'https://seda-api.polkachu.com',
    rpc: 'https://seda-rpc.polkachu.com',
    chainId: 'seda-1',
  },
  persistence: {
    lcd: 'https://rest.core.persistence.one',
    rpc: 'https://rpc.core.persistence.one',
    chainId: 'core-1',
  },
  lava: {
    lcd: 'https://lava-api.polkachu.com',
    rpc: 'https://lava-rpc.polkachu.com',
    chainId: 'lava-mainnet-1',
  },
  nibiru: {
    lcd: 'https://nibiru-api.polkachu.com',
    rpc: 'https://nibiru-rpc.polkachu.com',
    chainId: 'cataclysm-1',
  },
  quicksilver: {
    lcd: 'https://quicksilver-api.polkachu.com',
    rpc: 'https://quicksilver-rpc.polkachu.com',
    chainId: 'quicksilver-2',
  },
  sentinel: {
    lcd: 'https://sentinel-api.polkachu.com',
    rpc: 'https://sentinel-rpc.polkachu.com',
    chainId: 'sentinelhub-2',
  },
  haqq: {
    lcd: 'https://haqq-api.polkachu.com',
    rpc: 'https://haqq-rpc.polkachu.com',
    chainId: 'haqq_11235-1',
    decimals: 18,
  },
  
  // === SOLANA ===
  solana: {
    rpc: 'https://api.mainnet-beta.solana.com',
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
  babylon: 'bbnvaloper1fyfnvvswqjmg2xlpx2grldmlnuzqj6zj2hc8hd',
  terra: 'terravaloper1wdymftapg5pcvf2aqw4pd0yuuh5w9m6yqdnukv',
  union: 'unionvaloper1dqsjs63kpahlkfj3x5f9kuryk78uekqdv9z72k',
  neutron: 'neutronvaloper1rlyy2ltkc9t9s8gp2tmqxk6guggf6h9g6xj26y',
  xpla: 'xplavaloper1a00g26m9ut98xspcmlz0fmtknfeqmmne3jdr99',
  agoric: 'agoricvaloper148xd583ya4pjs3g7wj2h2eatsy294azk452k6v',
  zetachain: 'zetavaloper1svnup50643mzhcda98fm20r2cvafpllcnuaefx',
  dymension: 'dymvaloper1ycsjsqqucdyvl2560y7y2yhfjaj0vvta4v7hm3',
  nolus: 'nolusvaloper1vph2mzpcx8a366strk30cg60nznrwy762eteks',
  seda: 'sedavaloper1rzhv790ftxg3u5zsevuz8efqq37dq5gaqtktm3',
  persistence: 'persistencevaloper1etueaqe9teaamq40pln9xrncwgfns8mtdfr02c',
  lava: 'lava@valoper1askl4xtuwgt9ngll0unjp975fgk954y2fjpdc2',
  nibiru: 'nibivaloper1w26kzhwhely77xup3npfh70tzuc4amtx8j0743',
  quicksilver: 'quickvaloper1dqnwnf3rj8xwd82qra0v5zzkxd9szawy30k6fn',
  sentinel: 'sentvaloper1gcx3cq450dgmyha7s3x5mhjqcnxxn40tqykq20',
  haqq: 'haqqvaloper1dr24vnl8veae8998c78vth6qrrmtnhle49vjqg',
  solana: 'BH7asDZbKkTmT3UWiNfmMVRgQEEpXoVThGPmQfgWwDhg',
  sui: '0x876e2ad4ba0375c7752d24ca47c69e7096e6dbfd82a215612a08f47cffebcfbc',
  near: '01node.poolv1.near',
} as const;

// CoinGecko token IDs for price lookup
export const COINGECKO_IDS: Record<string, string> = {
  cosmos: 'cosmos',
  osmosis: 'osmosis',
  celestia: 'celestia',
  babylon: 'babylon',
  terra: 'terra-luna-2',
  union: 'union-2',
  neutron: 'neutron-3',
  xpla: 'xpla',
  agoric: 'agoric',
  zetachain: 'zetachain',
  dymension: 'dymension',
  nolus: 'nolus',
  seda: 'seda-2',
  persistence: 'persistence',
  lava: 'lava-network',
  nibiru: 'nibiru',
  quicksilver: 'quicksilver',
  sentinel: 'sentinel',
  haqq: 'islamic-coin',
  solana: 'solana',
  sui: 'sui',
  near: 'near',
  skale: 'skale',
};
