// stake.link — Chainlink LST protocol (stLINK)
// 01node is 1 of 15 node operators backing stLINK. We display the pro-rata share
// (totalStaked / 15) as 01node's effective TVL contribution.

import { ENDPOINTS } from './endpoints';

export interface StakeLinkData {
  totalStakedLink: number;     // protocol-wide LINK under stLINK
  operatorCount: number;       // number of node operators
  operatorShareLink: number;   // 01node's pro-rata 1/N slice
}

const SEL_TOTAL_STAKED = '0x817b1cd2'; // totalStaked()

async function ethCall(addr: string, data: string): Promise<string | null> {
  const cfg = ENDPOINTS.stakelink;
  for (const rpc of cfg.rpc) {
    try {
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [{ to: addr, data }, 'latest'],
        }),
        next: { revalidate: 300 },
      });
      if (!res.ok) continue;
      const json = await res.json();
      if (json.result && json.result !== '0x') return json.result as string;
    } catch {
      // try next RPC
    }
  }
  return null;
}

export async function fetchStakeLinkData(): Promise<StakeLinkData | null> {
  const cfg = ENDPOINTS.stakelink;
  const raw = await ethCall(cfg.stakingPool, SEL_TOTAL_STAKED);
  if (!raw) return null;

  const totalStakedLink = Number(BigInt(raw)) / 1e18;
  if (!Number.isFinite(totalStakedLink) || totalStakedLink <= 0) return null;

  return {
    totalStakedLink,
    operatorCount: cfg.operatorCount,
    operatorShareLink: totalStakedLink / cfg.operatorCount,
  };
}
