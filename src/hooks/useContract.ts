import { getContract } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';
import { contracts, ContractType } from '../constants';
import { useEffect, useMemo, useState } from 'react';
import { Contract } from 'ethers';
import { getRelayedContract } from '../utils/meta-transactions';

// Wrapper around ethers Contract to automatically get contract types
// with read and write objects automatically constructed from provider and signer.
const useContract = (contractType: ContractType) => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [relayedContract, setRelayedContract] = useState<Contract>();

  useEffect(() => {
    (async () => {
      if (walletClient) {
        const relayedContract = await getRelayedContract(contractType);
        setRelayedContract(relayedContract);
      }
    })();
  }, [contractType, walletClient]);

  const viemContract = useMemo(() => {
    const { address, abi } = contracts[contractType];

    return getContract({
      address,
      abi,
      publicClient,
      walletClient: walletClient ?? undefined
    });
  }, [walletClient, publicClient, contractType]);

  return { ...viemContract, relayedContract } as const;
};

export { useContract };
