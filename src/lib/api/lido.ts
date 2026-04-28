// Lido Simple DVT Module — fetches live operator stats for the 5 clusters
// 01node operates as a co-signer in 5 distributed validator clusters.
//   Bountiful Bison (id 1), Quixotic Quail (28), Unfettered Urial (32),
//   Ethereal Elf (42, Super Cluster), Resilient Rabbit (53, SSV).
// Source: 01.ro/operator-credentials and on-chain SDVT NodeOperatorsRegistry.

import { ENDPOINTS } from './endpoints';

export interface LidoOperator {
  id: number;
  name: string;
  framework: string;
  active: boolean;
  totalKeys: number;
  usedKeys: number;        // signing keys deposited (32 ETH each)
  stoppedValidators: number; // validators that have exited
  activeValidators: number;  // usedKeys - stoppedValidators
  ethStaked: number;         // activeValidators * 32
}

export interface LidoDvtData {
  operators: LidoOperator[];
  totalActiveValidators: number;
  totalEthStaked: number;
}

// keccak256("getNodeOperator(uint256,bool)").slice(0,4)
const SEL_GET_OPERATOR = '0x9a56983c';

function uintHex(n: number | bigint): string {
  return BigInt(n).toString(16).padStart(64, '0');
}

async function ethCall(data: string): Promise<string | null> {
  const cfg = ENDPOINTS.lidoDvt;
  for (const rpc of cfg.rpc) {
    try {
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [{ to: cfg.nodeOperatorsRegistry, data }, 'latest'],
        }),
        next: { revalidate: 300 },
      });
      if (!res.ok) continue;
      const json = await res.json();
      if (json.result && json.result !== '0x') {
        return json.result as string;
      }
    } catch {
      // try next RPC
    }
  }
  return null;
}

function decodeOperator(hex: string, id: number, name: string, framework: string): LidoOperator | null {
  const h = hex.replace(/^0x/, '');
  if (h.length < 64 * 7) return null;
  const word = (i: number) => h.slice(i * 64, (i + 1) * 64);
  // Returns: bool active, string name, address rewardAddress,
  //   uint64 stakingLimit, uint64 stoppedValidators,
  //   uint64 totalSigningKeys, uint64 usedSigningKeys
  const active = BigInt('0x' + word(0)) === BigInt(1);
  const stoppedValidators = Number(BigInt('0x' + word(4)));
  const totalKeys = Number(BigInt('0x' + word(5)));
  const usedKeys = Number(BigInt('0x' + word(6)));
  const activeValidators = Math.max(0, usedKeys - stoppedValidators);
  return {
    id,
    name,
    framework,
    active,
    totalKeys,
    usedKeys,
    stoppedValidators,
    activeValidators,
    ethStaked: activeValidators * ENDPOINTS.lidoDvt.ethPerValidator,
  };
}

export async function fetchLidoDvtData(): Promise<LidoDvtData | null> {
  const operatorsCfg = ENDPOINTS.lidoDvt.operators;

  const results = await Promise.all(
    operatorsCfg.map(async ({ id, name, framework }) => {
      const data = SEL_GET_OPERATOR + uintHex(id) + uintHex(1);
      const raw = await ethCall(data);
      if (!raw) return null;
      return decodeOperator(raw, id, name, framework);
    })
  );

  const operators = results.filter((r): r is LidoOperator => r !== null);
  if (operators.length === 0) return null;

  const totalActiveValidators = operators.reduce((s, o) => s + o.activeValidators, 0);
  const totalEthStaked = operators.reduce((s, o) => s + o.ethStaked, 0);

  return { operators, totalActiveValidators, totalEthStaked };
}
