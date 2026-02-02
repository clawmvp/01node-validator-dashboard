// Chainlink Node Operator API client
// Fetches LINK token transfers from Etherscan API

const ETHERSCAN_API_BASE = 'https://api.etherscan.io/api';
const LINK_TOKEN_ADDRESS = '0x514910771af9ca656af840dff83e8264ecf986ca';
const NODE_OPERATOR_ADDRESS = '0x7A30E4B6307c0Db7AeF247A656b44d888B23a2DC';

export interface LinkTransfer {
  hash: string;
  blockNumber: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string; // in wei (18 decimals)
  tokenName: string;
  tokenSymbol: string;
  gasUsed: string;
  gasPrice: string;
}

export interface ChainlinkPayment {
  hash: string;
  timestamp: Date;
  amount: number; // in LINK
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
 * Fetch LINK token transfers for the node operator address
 * Etherscan API: tokentx
 * 
 * Note: Requires ETHERSCAN_API_KEY environment variable
 */
export async function fetchLinkTransfers(
  apiKey?: string
): Promise<LinkTransfer[]> {
  const key = apiKey || process.env.ETHERSCAN_API_KEY || process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  
  if (!key) {
    console.warn('No Etherscan API key provided, using demo mode with limited requests');
  }

  const params = new URLSearchParams({
    module: 'account',
    action: 'tokentx',
    contractaddress: LINK_TOKEN_ADDRESS,
    address: NODE_OPERATOR_ADDRESS,
    startblock: '0',
    endblock: '99999999',
    page: '1',
    offset: '1000', // Get last 1000 transactions
    sort: 'desc',
    ...(key && { apikey: key }),
  });

  try {
    const response = await fetch(`${ETHERSCAN_API_BASE}?${params}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 }, // Cache for 5 minutes
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
 * Fetch current LINK balance for the address
 */
export async function fetchLinkBalance(apiKey?: string): Promise<number> {
  const key = apiKey || process.env.ETHERSCAN_API_KEY || process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;

  const params = new URLSearchParams({
    module: 'account',
    action: 'tokenbalance',
    contractaddress: LINK_TOKEN_ADDRESS,
    address: NODE_OPERATOR_ADDRESS,
    tag: 'latest',
    ...(key && { apikey: key }),
  });

  try {
    const response = await fetch(`${ETHERSCAN_API_BASE}?${params}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) return 0;

    const data = await response.json();
    
    if (data.status !== '1') return 0;

    // Convert from wei (18 decimals) to LINK
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
