// Chainlink Node Operator API client
// Fetches LINK token transfers and balance

const LINK_TOKEN_ADDRESS = '0x514910771af9ca656af840dff83e8264ecf986ca';
const NODE_OPERATOR_ADDRESS = '0x7A30E4B6307c0Db7AeF247A656b44d888B23a2DC';

// Public Ethereum RPC endpoints
const ETH_RPC_ENDPOINTS = [
  'https://eth.llamarpc.com',
  'https://ethereum.publicnode.com',
  'https://rpc.ankr.com/eth',
  'https://cloudflare-eth.com',
];

// Etherscan API v2 (requires API key)
const ETHERSCAN_API_V2 = 'https://api.etherscan.io/v2/api';

export interface LinkTransfer {
  hash: string;
  blockNumber: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  gasUsed: string;
  gasPrice: string;
}

export interface ChainlinkPayment {
  hash: string;
  timestamp: Date;
  amount: number;
  amountUsd?: number;
  from: string;
  direction: 'in' | 'out';
}

export interface ChainlinkStats {
  totalReceived: number;
  totalSent: number;
  netBalance: number;
  currentBalance: number;
  currentBalanceUsd?: number;
  payments: ChainlinkPayment[];
  last7Days: number;
  last30Days: number;
  last90Days: number;
}

/**
 * Fetch LINK balance using Ethereum RPC (eth_call with balanceOf)
 */
export async function fetchLinkBalanceViaRPC(): Promise<number> {
  // ERC20 balanceOf function selector + padded address
  const balanceOfSelector = '0x70a08231';
  const paddedAddress = NODE_OPERATOR_ADDRESS.toLowerCase().replace('0x', '').padStart(64, '0');
  const data = balanceOfSelector + paddedAddress;

  for (const rpcUrl of ETH_RPC_ENDPOINTS) {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [
            {
              to: LINK_TOKEN_ADDRESS,
              data: data,
            },
            'latest',
          ],
        }),
      });

      if (!response.ok) continue;

      const result = await response.json();
      
      if (result.result && result.result !== '0x') {
        // Convert hex to decimal, then divide by 10^18
        const balanceWei = BigInt(result.result);
        return Number(balanceWei) / 1e18;
      }
    } catch (error) {
      console.error(`RPC error (${rpcUrl}):`, error);
      continue;
    }
  }

  return 0;
}

/**
 * Fetch LINK token transfers using Etherscan API v2
 * Requires ETHERSCAN_API_KEY environment variable
 */
export async function fetchLinkTransfers(
  apiKey?: string
): Promise<LinkTransfer[]> {
  const key = apiKey || process.env.ETHERSCAN_API_KEY || process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  
  if (!key) {
    console.warn('No Etherscan API key provided - transfer history unavailable');
    return [];
  }

  const params = new URLSearchParams({
    chainid: '1', // Ethereum mainnet
    module: 'account',
    action: 'tokentx',
    contractaddress: LINK_TOKEN_ADDRESS,
    address: NODE_OPERATOR_ADDRESS,
    startblock: '0',
    endblock: '99999999',
    page: '1',
    offset: '1000',
    sort: 'desc',
    apikey: key,
  });

  try {
    const response = await fetch(`${ETHERSCAN_API_V2}?${params}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error(`Etherscan API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    if (data.status !== '1' || !data.result) {
      console.warn('Etherscan API returned no results:', data.message);
      return [];
    }

    return data.result as LinkTransfer[];
  } catch (error) {
    console.error('Error fetching LINK transfers:', error);
    return [];
  }
}

/**
 * Fetch current LINK balance - tries RPC first, then Etherscan v2
 */
export async function fetchLinkBalance(apiKey?: string): Promise<number> {
  // Try RPC first (no API key needed)
  const rpcBalance = await fetchLinkBalanceViaRPC();
  if (rpcBalance > 0) {
    return rpcBalance;
  }

  // Fallback to Etherscan v2 if API key available
  const key = apiKey || process.env.ETHERSCAN_API_KEY || process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  
  if (!key) return 0;

  const params = new URLSearchParams({
    chainid: '1',
    module: 'account',
    action: 'tokenbalance',
    contractaddress: LINK_TOKEN_ADDRESS,
    address: NODE_OPERATOR_ADDRESS,
    tag: 'latest',
    apikey: key,
  });

  try {
    const response = await fetch(`${ETHERSCAN_API_V2}?${params}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) return 0;

    const data = await response.json();
    
    if (data.status !== '1') return 0;

    return parseInt(data.result) / 1e18;
  } catch (error) {
    console.error('Error fetching LINK balance:', error);
    return 0;
  }
}

/**
 * Process transfers into payments with statistics
 */
export function processTransfers(
  transfers: LinkTransfer[],
  linkPrice?: number
): ChainlinkStats {
  const now = Date.now();
  const day7 = now - 7 * 24 * 60 * 60 * 1000;
  const day30 = now - 30 * 24 * 60 * 60 * 1000;
  const day90 = now - 90 * 24 * 60 * 60 * 1000;

  let totalReceived = 0;
  let totalSent = 0;
  let last7Days = 0;
  let last30Days = 0;
  let last90Days = 0;

  const payments: ChainlinkPayment[] = transfers.map((tx) => {
    const amount = parseInt(tx.value) / 1e18;
    const timestamp = new Date(parseInt(tx.timeStamp) * 1000);
    const isIncoming = tx.to.toLowerCase() === NODE_OPERATOR_ADDRESS.toLowerCase();
    
    if (isIncoming) {
      totalReceived += amount;
      
      if (timestamp.getTime() >= day7) last7Days += amount;
      if (timestamp.getTime() >= day30) last30Days += amount;
      if (timestamp.getTime() >= day90) last90Days += amount;
    } else {
      totalSent += amount;
    }

    return {
      hash: tx.hash,
      timestamp,
      amount,
      amountUsd: linkPrice ? amount * linkPrice : undefined,
      from: tx.from,
      direction: isIncoming ? 'in' : 'out',
    };
  });

  return {
    totalReceived,
    totalSent,
    netBalance: totalReceived - totalSent,
    currentBalance: 0, // Will be filled separately
    payments,
    last7Days,
    last30Days,
    last90Days,
  };
}

/**
 * Fetch complete Chainlink stats including balance and transfers
 */
export async function fetchChainlinkStats(
  linkPrice?: number,
  apiKey?: string
): Promise<ChainlinkStats> {
  const [transfers, balance] = await Promise.all([
    fetchLinkTransfers(apiKey),
    fetchLinkBalance(apiKey),
  ]);

  const stats = processTransfers(transfers, linkPrice);
  stats.currentBalance = balance;
  stats.currentBalanceUsd = linkPrice ? balance * linkPrice : undefined;

  return stats;
}

// Constants for export
export const CHAINLINK_CONFIG = {
  nodeOperatorAddress: NODE_OPERATOR_ADDRESS,
  linkTokenAddress: LINK_TOKEN_ADDRESS,
  joinedDate: '2021-10-01',
  description: '01node joined Chainlink as a reviewed node operator supporting Price Reference Data feeds',
};
