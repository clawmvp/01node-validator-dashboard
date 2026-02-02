// SKALE Network data
// 01node operates 2 validators on SKALE Network

export interface SkaleValidatorData {
  validatorId: number;
  delegatedAmount: number; // In SKL tokens
  address: string;
}

export interface SkaleData {
  validators: SkaleValidatorData[];
  totalDelegated: number; // Combined total in SKL
  isLiveData: boolean;
}

// 01node validator IDs and addresses on SKALE
const VALIDATORS = [
  { id: 10, address: '0x01daB98cb05D8652D791e3BCAE37Cf4b9BE5DBfd' },
  { id: 43, address: '0xeDF5fDC9ddeDe9d37B265690695E31c86D5e8913' },
];

// Fallback data based on Dune Analytics / SKALE Portal
// https://dune.com/skale/validator?validator+Id_n5d285=10
// https://portal.skale.space/staking/new/0/10
const FALLBACK_DELEGATIONS: Record<number, number> = {
  10: 168_000_000, // ~168M SKL for validator 10
  43: 45_000_000,  // ~45M SKL for validator 43
};

/**
 * Fetch SKALE validator data
 * Currently uses fallback data - SKALE contracts are proxies that require
 * special handling. For live data, integrate with SKALE's official API
 * or use the portal data directly.
 */
export async function fetchSkaleValidators(): Promise<SkaleData | null> {
  try {
    // Build validator data from fallback values
    // TODO: Integrate with SKALE official API when available
    const validatorData: SkaleValidatorData[] = VALIDATORS.map(v => ({
      validatorId: v.id,
      delegatedAmount: FALLBACK_DELEGATIONS[v.id] || 0,
      address: v.address,
    }));

    const totalDelegated = validatorData.reduce((sum, v) => sum + v.delegatedAmount, 0);

    console.log(`SKALE: Validator 10: ${FALLBACK_DELEGATIONS[10]?.toLocaleString()} SKL`);
    console.log(`SKALE: Validator 43: ${FALLBACK_DELEGATIONS[43]?.toLocaleString()} SKL`);
    console.log(`SKALE: Total: ${totalDelegated.toLocaleString()} SKL`);

    return {
      validators: validatorData,
      totalDelegated,
      isLiveData: false, // Using fallback data
    };
  } catch (error) {
    console.error('Error fetching SKALE validators:', error);
    return null;
  }
}
